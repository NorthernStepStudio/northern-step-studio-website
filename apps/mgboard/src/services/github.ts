import { getWorkspaceUserId, isSupabaseConfigured, supabase } from './supabase';
import { getGitHubToken } from './auth';
import {
  clearStoredGitHubToken,
  getEnvGitHubToken,
  getStoredGitHubToken,
  maskGitHubToken,
  setStoredGitHubToken,
  sourceLabel,
  type GitHubTokenSource,
} from './githubTokenStorage';
import type { GitHubRepo, GitHubCommit, GitHubIssue, Repo, Commit } from '../types';

const GITHUB_API = 'https://api.github.com';
const MAX_RETRIES = 2;
const BASE_RETRY_DELAY_MS = 450;
const MAX_RETRY_DELAY_MS = 5000;
const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);
const LOCAL_USER_ID = 'local';

interface GitHubFailureLog {
  rootCause: string;
  failedEndpoint: string;
  fixApplied: string;
  status?: number;
  attempt?: number;
  retryDelayMs?: number;
}

interface GitHubApiErrorInit {
  failedEndpoint: string;
  rootCause: string;
  fixApplied: string;
  status?: number;
  retryAfterSeconds?: number;
  rateLimited?: boolean;
  retriable?: boolean;
}

interface ResolvedGitHubToken {
  token: string;
  source: GitHubTokenSource;
  hasEnvToken: boolean;
  hasStoredToken: boolean;
}

export interface GitHubConnectionState {
  connected: boolean;
  source: GitHubTokenSource;
  sourceLabel: string;
  tokenPreview: string | null;
  hasEnvToken: boolean;
  hasStoredToken: boolean;
  canClearStoredToken: boolean;
}

export class GitHubApiError extends Error {
  readonly failedEndpoint: string;
  readonly rootCause: string;
  readonly fixApplied: string;
  readonly status?: number;
  readonly retryAfterSeconds?: number;
  readonly rateLimited: boolean;
  readonly retriable: boolean;

  constructor(message: string, init: GitHubApiErrorInit) {
    super(message);
    this.name = 'GitHubApiError';
    this.failedEndpoint = init.failedEndpoint;
    this.rootCause = init.rootCause;
    this.fixApplied = init.fixApplied;
    this.status = init.status;
    this.retryAfterSeconds = init.retryAfterSeconds;
    this.rateLimited = Boolean(init.rateLimited);
    this.retriable = Boolean(init.retriable);
  }
}

function logGitHubFailure(log: GitHubFailureLog) {
  const sanitizedLog = { ...log };
  if (sanitizedLog.rootCause) {
    // Basic scrubbing of potential tokens in messages.
    sanitizedLog.rootCause = sanitizedLog.rootCause
      .replace(/gh[pousr]_[a-zA-Z0-9]{24,}/g, '[GH_TOKEN_REDACTED]')
      .replace(/github_pat_[a-zA-Z0-9_]{24,}/g, '[GH_TOKEN_REDACTED]');
  }

  console.error('[MGBoard GitHub]', {
    scope: 'github-integration',
    ...sanitizedLog,
    timestamp: new Date().toISOString(),
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readRetryAfterMs(headers: Headers): number | null {
  const retryAfter = headers.get('retry-after');
  if (retryAfter) {
    const asSeconds = Number.parseInt(retryAfter, 10);
    if (Number.isFinite(asSeconds) && asSeconds > 0) {
      return asSeconds * 1000;
    }

    const asDate = Date.parse(retryAfter);
    if (!Number.isNaN(asDate)) {
      const diff = asDate - Date.now();
      if (diff > 0) {
        return diff;
      }
    }
  }

  const resetAt = headers.get('x-ratelimit-reset');
  if (resetAt) {
    const resetSeconds = Number.parseInt(resetAt, 10);
    if (Number.isFinite(resetSeconds) && resetSeconds > 0) {
      const diff = resetSeconds * 1000 - Date.now();
      if (diff > 0) {
        return diff;
      }
    }
  }

  return null;
}

function getRetryDelayMs(headers: Headers, attempt: number, rateLimited: boolean): number {
  const headerDelay = readRetryAfterMs(headers);
  if (headerDelay !== null) {
    return Math.min(Math.max(headerDelay, BASE_RETRY_DELAY_MS), MAX_RETRY_DELAY_MS);
  }

  const exponential = Math.min(BASE_RETRY_DELAY_MS * Math.pow(2, attempt), MAX_RETRY_DELAY_MS);
  const jitter = Math.floor(Math.random() * 220);
  const delayWithJitter = exponential + jitter + (rateLimited ? 400 : 0);
  return Math.min(delayWithJitter, MAX_RETRY_DELAY_MS);
}

function isRateLimited(status: number, headers: Headers): boolean {
  if (status === 429) return true;
  if (status !== 403) return false;
  return headers.get('x-ratelimit-remaining') === '0';
}

function shouldRetry(status: number, rateLimited: boolean): boolean {
  return rateLimited || RETRYABLE_STATUSES.has(status);
}

function normalizeIssueLabels(labels: unknown): Array<{ name: string; color: string }> {
  if (!Array.isArray(labels)) return [];

  return labels
    .map((label): { name: string; color: string } | null => {
      if (!isRecord(label)) return null;
      const name = asString(label.name, '').trim();
      if (!name) return null;

      const rawColor = asString(label.color, '').trim();
      const color = /^[0-9a-fA-F]{6}$/.test(rawColor) ? rawColor : '64748B';
      return { name, color };
    })
    .filter((label): label is { name: string; color: string } => label !== null);
}

function normalizeRepo(repo: unknown): GitHubRepo | null {
  if (!isRecord(repo)) return null;

  const id = asNumber(repo.id, 0);
  const name = asString(repo.name, '').trim();
  const fullName = asString(repo.full_name, '').trim();

  if (!id || !name || !fullName) return null;

  return {
    id,
    name,
    full_name: fullName,
    open_issues_count: Math.max(0, asNumber(repo.open_issues_count, 0)),
    pushed_at: asString(repo.pushed_at, '') || null,
    html_url: asString(repo.html_url, ''),
    description: asString(repo.description, '') || null,
    private: asBoolean(repo.private, false),
    language: asString(repo.language, '') || null,
  };
}

function normalizeCommit(commit: unknown): GitHubCommit | null {
  if (!isRecord(commit)) return null;

  const sha = asString(commit.sha, '').trim();
  if (!sha) return null;

  const commitObject = isRecord(commit.commit) ? commit.commit : {};
  const author = isRecord(commitObject.author) ? commitObject.author : {};

  const message = asString(commitObject.message, '').trim() || '(no commit message)';
  const authorName = asString(author.name, '').trim() || 'Unknown';
  const authorDate = asString(author.date, '').trim() || new Date(0).toISOString();

  return {
    sha,
    html_url: asString(commit.html_url, ''),
    commit: {
      message,
      author: {
        name: authorName,
        date: authorDate,
      },
    },
  };
}

function normalizeIssue(issue: unknown): GitHubIssue | null {
  if (!isRecord(issue)) return null;

  if (isRecord(issue.pull_request)) {
    return null;
  }

  const id = asNumber(issue.id, 0);
  const number = asNumber(issue.number, 0);
  if (!id || !number) return null;

  return {
    id,
    number,
    title: asString(issue.title, '').trim() || '(untitled issue)',
    state: asString(issue.state, 'open'),
    html_url: asString(issue.html_url, ''),
    created_at: asString(issue.created_at, '') || new Date(0).toISOString(),
    updated_at: asString(issue.updated_at, '') || new Date(0).toISOString(),
    labels: normalizeIssueLabels(issue.labels),
    repository_url: asString(issue.repository_url, ''),
  };
}

function safeTimestamp(value: string): number {
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : 0;
}

function parseOwnerRepo(fullName: string): [string, string] | null {
  const [owner, repo] = fullName.split('/');
  if (!owner || !repo) return null;
  return [owner, repo];
}

function mapRepoToLocal(repo: GitHubRepo, userId = LOCAL_USER_ID): Repo {
  return {
    id: `github-${repo.id}`,
    user_id: userId,
    github_id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    last_commit_date: repo.pushed_at,
    open_issues_count: repo.open_issues_count,
    synced_at: new Date().toISOString(),
  };
}

function mapCommitToLocal(commit: GitHubCommit, repo: Repo): Commit & { repo_name?: string } {
  return {
    id: `${repo.id}:${commit.sha}`,
    user_id: repo.user_id || LOCAL_USER_ID,
    repo_id: repo.id,
    sha: commit.sha,
    message: commit.commit.message,
    committed_at: commit.commit.author.date,
    synced_at: new Date().toISOString(),
    repo_name: repo.name,
  };
}

function mapReposForSupabase(repos: Repo[], userId: string): Array<Record<string, unknown>> {
  return repos.map((repo) => ({
    user_id: userId,
    github_id: repo.github_id,
    name: repo.name,
    full_name: repo.full_name,
    last_commit_date: repo.last_commit_date,
    open_issues_count: repo.open_issues_count,
    synced_at: new Date().toISOString(),
  }));
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

function parseGithubRepoId(repoId: string): number | null {
  const match = /^github-(\d+)$/.exec(repoId.trim());
  if (!match) return null;
  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) ? parsed : null;
}

async function resolveSupabaseRepoUuid(
  repoId: string,
  fullName: string | null,
  userId: string | null,
): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  if (isUuid(repoId)) {
    return repoId;
  }

  try {
    if (fullName) {
      let byName = supabase.from('mgboard_repos').select('id').eq('full_name', fullName).limit(1);
      if (userId) byName = byName.eq('user_id', userId);
      const { data } = await byName;
      if (data?.[0]?.id) {
        return data[0].id as string;
      }
    }

    const githubId = parseGithubRepoId(repoId);
    if (githubId === null) return null;

    let byGithubId = supabase.from('mgboard_repos').select('id').eq('github_id', githubId).limit(1);
    if (userId) byGithubId = byGithubId.eq('user_id', userId);
    const { data } = await byGithubId;
    if (data?.[0]?.id) {
      return data[0].id as string;
    }
  } catch {
    return null;
  }

  return null;
}

async function tryUpsertCommitsToSupabase(commits: Commit[], repoUuid: string, userId: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  if (commits.length === 0) return;
  if (!isUuid(repoUuid)) return;

  const rows = commits.map((commit) => ({
    user_id: userId,
    repo_id: repoUuid,
    sha: commit.sha,
    message: commit.message,
    committed_at: commit.committed_at,
    synced_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('mgboard_commits')
    .upsert(rows, { onConflict: 'repo_id,sha' });

  if (error) {
    logGitHubFailure({
      rootCause: error.message,
      failedEndpoint: 'supabase.mgboard_commits.upsert',
      fixApplied: 'kept live commits and skipped commit cache write',
    });
  }
}

async function getOptionalSupabaseUserId(): Promise<string | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    return await getWorkspaceUserId();
  } catch (error: unknown) {
    logGitHubFailure({
      rootCause: error instanceof Error ? error.message : 'Unknown auth lookup error',
      failedEndpoint: 'supabase.auth.getUser',
      fixApplied: 'continued in local-mode without requiring app auth and skipped cache write',
    });
    return null;
  }
}

async function tryUpsertReposToSupabase(repos: Repo[], userId: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  if (repos.length === 0) return;

  const rows = mapReposForSupabase(repos, userId);

  const { error } = await supabase
    .from('mgboard_repos')
    .upsert(rows, { onConflict: 'user_id,github_id' });

  if (error) {
    logGitHubFailure({
      rootCause: error.message,
      failedEndpoint: 'supabase.mgboard_repos.upsert',
      fixApplied: 'kept live GitHub repos and skipped cache write',
    });
  }
}

async function readCachedRepos(): Promise<Repo[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('mgboard_repos')
      .select('*')
      .order('last_commit_date', { ascending: false });

    if (error) {
      logGitHubFailure({
        rootCause: error.message,
        failedEndpoint: 'supabase.mgboard_repos.select',
        fixApplied: 'ignored repo cache read failure',
      });
      return [];
    }

    return (data ?? []) as Repo[];
  } catch (error: unknown) {
    logGitHubFailure({
      rootCause: error instanceof Error ? error.message : 'Unknown repo cache read error',
      failedEndpoint: 'supabase.mgboard_repos.select',
      fixApplied: 'ignored repo cache read failure',
    });
    return [];
  }
}

async function readCachedRecentCommits(limit: number): Promise<(Commit & { repo_name?: string })[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('mgboard_commits')
      .select('*, mgboard_repos(name)')
      .order('committed_at', { ascending: false })
      .limit(limit);

    if (error) {
      logGitHubFailure({
        rootCause: error.message,
        failedEndpoint: 'supabase.mgboard_commits.select_recent',
        fixApplied: 'ignored commit cache read failure',
      });
      return [];
    }

    return (data ?? []).map((row: any) => ({
      ...row,
      repo_name: row.mgboard_repos?.name ?? null,
      mgboard_repos: undefined,
    }));
  } catch (error: unknown) {
    logGitHubFailure({
      rootCause: error instanceof Error ? error.message : 'Unknown recent commit cache read error',
      failedEndpoint: 'supabase.mgboard_commits.select_recent',
      fixApplied: 'ignored commit cache read failure',
    });
    return [];
  }
}

async function readCachedCommitsForRepo(repoId: string): Promise<Commit[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const userId = await getOptionalSupabaseUserId();
    const resolvedRepoUuid = await resolveSupabaseRepoUuid(repoId, null, userId);
    const queryRepoId = resolvedRepoUuid ?? repoId;

    const { data, error } = await supabase
      .from('mgboard_commits')
      .select('*')
      .eq('repo_id', queryRepoId)
      .order('committed_at', { ascending: false })
      .limit(30);

    if (error) {
      logGitHubFailure({
        rootCause: error.message,
        failedEndpoint: 'supabase.mgboard_commits.select_by_repo',
        fixApplied: 'ignored repo commit cache read failure',
      });
      return [];
    }

    return (data ?? []) as Commit[];
  } catch (error: unknown) {
    logGitHubFailure({
      rootCause: error instanceof Error ? error.message : 'Unknown repo commit cache read error',
      failedEndpoint: 'supabase.mgboard_commits.select_by_repo',
      fixApplied: 'ignored repo commit cache read failure',
    });
    return [];
  }
}

async function resolveGitHubTokenForEndpoint(failedEndpoint: string): Promise<ResolvedGitHubToken> {
  const envToken = getEnvGitHubToken();
  const storedToken = await getStoredGitHubToken();

  if (envToken) {
    return {
      token: envToken,
      source: 'env',
      hasEnvToken: true,
      hasStoredToken: Boolean(storedToken),
    };
  }

  if (storedToken) {
    return {
      token: storedToken,
      source: 'stored',
      hasEnvToken: false,
      hasStoredToken: true,
    };
  }

  const sessionToken = (await getGitHubToken())?.trim();
  if (sessionToken) {
    return {
      token: sessionToken,
      source: 'supabase',
      hasEnvToken: false,
      hasStoredToken: false,
    };
  }

  const error = new GitHubApiError(
    'No GitHub token configured. Add EXPO_PUBLIC_GITHUB_TOKEN or save a Personal Access Token in the GitHub tab.',
    {
      failedEndpoint,
      rootCause: 'No environment token, stored PAT, or Supabase provider token available',
      fixApplied: 'returned actionable connection error to UI',
      retriable: false,
      rateLimited: false,
    },
  );

  logGitHubFailure({
    rootCause: error.rootCause,
    failedEndpoint: error.failedEndpoint,
    fixApplied: error.fixApplied,
  });

  throw error;
}

function toConnectionState(
  source: GitHubTokenSource,
  token: string | null,
  hasEnvToken: boolean,
  hasStoredToken: boolean,
): GitHubConnectionState {
  return {
    connected: Boolean(token),
    source,
    sourceLabel: sourceLabel(source),
    tokenPreview: maskGitHubToken(token),
    hasEnvToken,
    hasStoredToken,
    canClearStoredToken: hasStoredToken,
  };
}

export async function getGitHubConnectionState(): Promise<GitHubConnectionState> {
  const envToken = getEnvGitHubToken();
  const storedToken = await getStoredGitHubToken();

  if (envToken) {
    return toConnectionState('env', envToken, true, Boolean(storedToken));
  }

  if (storedToken) {
    return toConnectionState('stored', storedToken, false, true);
  }

  const sessionToken = (await getGitHubToken())?.trim() ?? null;
  if (sessionToken) {
    return toConnectionState('supabase', sessionToken, false, false);
  }

  return toConnectionState('none', null, false, false);
}

export async function setGitHubPersonalAccessToken(token: string): Promise<GitHubConnectionState> {
  await setStoredGitHubToken(token);
  return getGitHubConnectionState();
}

export async function clearGitHubPersonalAccessToken(): Promise<GitHubConnectionState> {
  await clearStoredGitHubToken();
  return getGitHubConnectionState();
}

async function fetchLiveRepos(token: string): Promise<Repo[]> {
  const ghRepos = await fetchUserRepos(token);
  const userId = (await getOptionalSupabaseUserId()) ?? LOCAL_USER_ID;
  return ghRepos.map((repo) => mapRepoToLocal(repo, userId));
}

async function ghFetch<T>(path: string, token: string): Promise<T> {
  const endpoint = `${GITHUB_API}${path}`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      if (res.ok) {
        return (await res.json()) as T;
      }

      const body = await res.text().catch(() => '');
      const rateLimited = isRateLimited(res.status, res.headers);
      const retriable = shouldRetry(res.status, rateLimited);
      const retryDelayMs = getRetryDelayMs(res.headers, attempt, rateLimited);
      const retryAfterSeconds = Math.ceil(retryDelayMs / 1000);

      const rootCause = rateLimited
        ? 'GitHub API rate limit exceeded'
        : `GitHub API responded with ${res.status} ${res.statusText}`;
      const fixApplied =
        retriable && attempt < MAX_RETRIES
          ? `automatic retry with backoff (${attempt + 1}/${MAX_RETRIES + 1})`
          : 'returned structured error for fallback UI';

      logGitHubFailure({
        rootCause,
        failedEndpoint: endpoint,
        fixApplied,
        status: res.status,
        attempt: attempt + 1,
        retryDelayMs: retriable && attempt < MAX_RETRIES ? retryDelayMs : undefined,
      });

      if (retriable && attempt < MAX_RETRIES) {
        await delay(retryDelayMs);
        continue;
      }

      throw new GitHubApiError(
        `GitHub request failed (${res.status}). ${body.slice(0, 180)}`.trim(),
        {
          failedEndpoint: endpoint,
          rootCause,
          fixApplied,
          status: res.status,
          retryAfterSeconds,
          rateLimited,
          retriable,
        },
      );
    } catch (error: unknown) {
      if (error instanceof GitHubApiError) {
        throw error;
      }

      const retryDelayMs = getRetryDelayMs(new Headers(), attempt, false);
      const retriable = attempt < MAX_RETRIES;
      const rootCause = error instanceof Error ? error.message : 'Unknown network error';
      const fixApplied = retriable
        ? `automatic retry with backoff (${attempt + 1}/${MAX_RETRIES + 1})`
        : 'returned network error for fallback UI';

      logGitHubFailure({
        rootCause,
        failedEndpoint: endpoint,
        fixApplied,
        attempt: attempt + 1,
        retryDelayMs: retriable ? retryDelayMs : undefined,
      });

      if (retriable) {
        await delay(retryDelayMs);
        continue;
      }

      throw new GitHubApiError('Network request to GitHub failed.', {
        failedEndpoint: endpoint,
        rootCause,
        fixApplied,
        retriable: false,
        rateLimited: false,
      });
    }
  }

  throw new GitHubApiError('GitHub request failed after retries.', {
    failedEndpoint: endpoint,
    rootCause: 'Exceeded maximum retry attempts',
    fixApplied: 'returned final retry exhaustion error to fallback UI',
    retriable: false,
    rateLimited: false,
  });
}

export function formatGitHubError(error: unknown, fallback: string): string {
  if (error instanceof GitHubApiError) {
    if (error.rateLimited) {
      if (error.retryAfterSeconds && error.retryAfterSeconds > 0) {
        return `GitHub rate limit reached. Try again in about ${error.retryAfterSeconds}s.`;
      }
      return 'GitHub rate limit reached. Please try again shortly.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'GitHub authorization failed. Update your GitHub token and try again.';
    }

    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

/** Fetch all repos for the authenticated user. */
export async function fetchUserRepos(token: string): Promise<GitHubRepo[]> {
  const payload = await ghFetch<unknown[]>('/user/repos?sort=pushed&per_page=50&type=owner', token);
  if (!Array.isArray(payload)) {
    logGitHubFailure({
      rootCause: 'GitHub repos response was not an array',
      failedEndpoint: `${GITHUB_API}/user/repos`,
      fixApplied: 'fallback to empty repo list',
    });
    return [];
  }

  return payload.map(normalizeRepo).filter((repo): repo is GitHubRepo => repo !== null);
}

/** Fetch latest commits for a repo. */
export async function fetchRepoCommits(
  owner: string,
  repo: string,
  token: string,
  perPage = 10,
): Promise<GitHubCommit[]> {
  const payload = await ghFetch<unknown[]>(`/repos/${owner}/${repo}/commits?per_page=${perPage}`, token);
  if (!Array.isArray(payload)) {
    logGitHubFailure({
      rootCause: 'GitHub commits response was not an array',
      failedEndpoint: `${GITHUB_API}/repos/${owner}/${repo}/commits`,
      fixApplied: 'fallback to empty commit list',
    });
    return [];
  }

  return payload.map(normalizeCommit).filter((commit): commit is GitHubCommit => commit !== null);
}

/** Fetch open issues for a repo. */
export async function fetchRepoIssues(owner: string, repo: string, token: string): Promise<GitHubIssue[]> {
  const payload = await ghFetch<unknown[]>(`/repos/${owner}/${repo}/issues?state=open&per_page=20`, token);

  if (!Array.isArray(payload)) {
    logGitHubFailure({
      rootCause: 'GitHub issues response was not an array',
      failedEndpoint: `${GITHUB_API}/repos/${owner}/${repo}/issues`,
      fixApplied: 'fallback to empty issues list',
    });
    return [];
  }

  return payload.map(normalizeIssue).filter((issue): issue is GitHubIssue => issue !== null);
}

/** Sync GitHub repos with optional Supabase cache write. */
export async function syncReposToSupabase(): Promise<Repo[]> {
  const resolved = await resolveGitHubTokenForEndpoint('github.syncRepos');
  const repos = await fetchLiveRepos(resolved.token);

  if (repos.length === 0) {
    return [];
  }

  const userId = await getOptionalSupabaseUserId();
  if (userId) {
    await tryUpsertReposToSupabase(repos, userId);
  }

  return repos;
}

/** Sync commits for a specific repo with optional Supabase cache write. */
export async function syncCommitsForRepo(repoId: string, fullName: string): Promise<Commit[]> {
  const parsed = parseOwnerRepo(fullName);
  if (!parsed) {
    throw new Error('Invalid repository name. Expected owner/repo.');
  }

  const [owner, repoName] = parsed;
  const resolved = await resolveGitHubTokenForEndpoint(`github.syncCommits.${fullName}`);
  const repos = await fetchLiveRepos(resolved.token);
  const match = repos.find((repo) => repo.full_name === fullName);

  const repoRecord: Repo =
    match ??
    ({
      id: repoId,
      user_id: LOCAL_USER_ID,
      github_id: 0,
      name: repoName,
      full_name: fullName,
      last_commit_date: null,
      open_issues_count: 0,
      synced_at: new Date().toISOString(),
    } as Repo);

  let ghCommits: GitHubCommit[];
  try {
    ghCommits = await fetchRepoCommits(owner, repoName, resolved.token, 20);
  } catch (error: unknown) {
    if (error instanceof GitHubApiError && (error.status === 404 || error.status === 409)) {
      return [];
    }
    throw error;
  }

  const commits = ghCommits.map((commit) => mapCommitToLocal(commit, { ...repoRecord, id: repoId }));

  const userId = await getOptionalSupabaseUserId();
  if (userId) {
    const repoUuid = await resolveSupabaseRepoUuid(repoId, fullName, userId);
    if (repoUuid) {
      await tryUpsertCommitsToSupabase(commits, repoUuid, userId);
    }
  }

  return commits;
}

export async function getRepos(): Promise<Repo[]> {
  try {
    const resolved = await resolveGitHubTokenForEndpoint('github.getRepos');
    const repos = await fetchLiveRepos(resolved.token);

    const userId = await getOptionalSupabaseUserId();
    if (userId) {
      await tryUpsertReposToSupabase(repos, userId);
    }

    return repos;
  } catch (error: unknown) {
    const cached = await readCachedRepos();
    if (cached.length > 0) {
      logGitHubFailure({
        rootCause: error instanceof Error ? error.message : 'Unknown live repo fetch error',
        failedEndpoint: 'github.getRepos',
        fixApplied: 'returned cached repos from Supabase fallback',
      });
      return cached;
    }
    throw error;
  }
}

export async function getRecentCommits(limit = 10): Promise<(Commit & { repo_name?: string })[]> {
  const safeLimit = Math.max(1, Math.min(limit, 50));

  try {
    const resolved = await resolveGitHubTokenForEndpoint('github.getRecentCommits');
    const repos = await fetchLiveRepos(resolved.token);
    if (repos.length === 0) return [];

    const reposToFetch = repos.slice(0, Math.min(repos.length, 8));
    const perRepo = Math.max(3, Math.min(12, Math.ceil(safeLimit / Math.max(1, reposToFetch.length)) + 3));

    const settled = await Promise.allSettled(
      reposToFetch.map(async (repo) => {
        const parsed = parseOwnerRepo(repo.full_name);
        if (!parsed) return [] as Array<Commit & { repo_name?: string }>;
        const [owner, repoName] = parsed;
        const commits = await fetchRepoCommits(owner, repoName, resolved.token, perRepo);
        return commits.map((commit) => mapCommitToLocal(commit, repo));
      }),
    );

    const allCommits: Array<Commit & { repo_name?: string }> = [];
    let successes = 0;
    let firstRejected: unknown = null;

    for (const result of settled) {
      if (result.status === 'fulfilled') {
        successes += 1;
        allCommits.push(...result.value);
      } else if (firstRejected === null) {
        firstRejected = result.reason;
      }
    }

    if (successes === 0 && firstRejected) {
      throw firstRejected;
    }

    const deduped = new Map<string, Commit & { repo_name?: string }>();
    for (const commit of allCommits) {
      const key = `${commit.repo_id}:${commit.sha}`;
      if (!deduped.has(key)) {
        deduped.set(key, commit);
      }
    }

    const sorted = [...deduped.values()].sort(
      (a, b) => safeTimestamp(b.committed_at) - safeTimestamp(a.committed_at),
    );

    return sorted.slice(0, safeLimit);
  } catch (error: unknown) {
    const cached = await readCachedRecentCommits(safeLimit);
    if (cached.length > 0) {
      logGitHubFailure({
        rootCause: error instanceof Error ? error.message : 'Unknown live commit fetch error',
        failedEndpoint: 'github.getRecentCommits',
        fixApplied: 'returned cached commits from Supabase fallback',
      });
      return cached;
    }

    if (error instanceof GitHubApiError && (error.status === 404 || error.status === 409)) {
      return [];
    }

    throw error;
  }
}

export async function getCommitsForRepo(repoId: string): Promise<Commit[]> {
  try {
    const resolved = await resolveGitHubTokenForEndpoint(`github.getCommitsForRepo.${repoId}`);
    const repos = await fetchLiveRepos(resolved.token);

    const match = repos.find(
      (repo) => repo.id === repoId || String(repo.github_id) === repoId || `github-${repo.github_id}` === repoId,
    );

    if (!match) {
      const cached = await readCachedCommitsForRepo(repoId);
      return cached;
    }

    const parsed = parseOwnerRepo(match.full_name);
    if (!parsed) return [];

    const [owner, repoName] = parsed;
    const ghCommits = await fetchRepoCommits(owner, repoName, resolved.token, 30);
    const commits = ghCommits.map((commit) => mapCommitToLocal(commit, match));

    const userId = await getOptionalSupabaseUserId();
    if (userId) {
      const repoUuid = await resolveSupabaseRepoUuid(repoId, match.full_name, userId);
      if (repoUuid) {
        await tryUpsertCommitsToSupabase(commits, repoUuid, userId);
      }
    }

    return commits;
  } catch (error: unknown) {
    if (error instanceof GitHubApiError && (error.status === 404 || error.status === 409)) {
      return [];
    }

    const cached = await readCachedCommitsForRepo(repoId);
    if (cached.length > 0) {
      logGitHubFailure({
        rootCause: error instanceof Error ? error.message : 'Unknown repo commit fetch error',
        failedEndpoint: 'github.getCommitsForRepo',
        fixApplied: 'returned cached repo commits from Supabase fallback',
      });
      return cached;
    }
    throw error;
  }
}

/** Fetch open issues across all repos (live from GitHub API). */
export async function fetchAllOpenIssues(): Promise<GitHubIssue[]> {
  const resolved = await resolveGitHubTokenForEndpoint('github.fetchAllOpenIssues');
  const repos = await fetchLiveRepos(resolved.token);

  const candidates = repos.filter((repo) => {
    if (!repo.full_name || !repo.full_name.includes('/')) return false;
    return repo.open_issues_count > 0;
  });

  if (candidates.length === 0) return [];

  const allIssues: GitHubIssue[] = [];
  const chunks: Repo[][] = [];

  for (let i = 0; i < candidates.length; i += 5) {
    chunks.push(candidates.slice(i, i + 5));
  }

  for (const chunk of chunks) {
    const results = await Promise.allSettled(
      chunk.map((repo) => {
        const parsed = parseOwnerRepo(repo.full_name);
        if (!parsed) return Promise.resolve([] as GitHubIssue[]);
        const [owner, repoName] = parsed;
        return fetchRepoIssues(owner, repoName, resolved.token);
      }),
    );

    let successfulInChunk = 0;
    let firstRejectedReason: unknown = null;

    for (const result of results) {
      if (result.status === 'fulfilled') {
        successfulInChunk += 1;
        allIssues.push(...result.value);
      } else if (firstRejectedReason === null) {
        firstRejectedReason = result.reason;
      }
    }

    if (successfulInChunk === 0 && firstRejectedReason) {
      throw firstRejectedReason;
    }
  }

  const byId = new Map<number, GitHubIssue>();
  for (const issue of allIssues) {
    if (issue.id) {
      byId.set(issue.id, issue);
    }
  }

  return [...byId.values()].sort((a, b) => safeTimestamp(b.updated_at) - safeTimestamp(a.updated_at));
}
