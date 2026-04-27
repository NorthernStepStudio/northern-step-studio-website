import { useState, useEffect, useCallback } from 'react';
import * as GitHubService from '../services/github';
import type { Repo, Commit, GitHubIssue } from '../types';
import type { GitHubConnectionState } from '../services/github';

let hasRunStartupGitHubSync = false;

function getRootCause(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Unknown GitHub UI error';
}

function logGitHubUiError(failedEndpoint: string, error: unknown, fixApplied: string) {
  console.error('[MGBoard GitHub UI]', {
    scope: 'github-ui',
    rootCause: getRootCause(error),
    failedEndpoint,
    fixApplied,
    timestamp: new Date().toISOString(),
  });
}

function toErrorMessage(error: unknown, fallback: string): string {
  return GitHubService.formatGitHubError(error, fallback);
}

const DEFAULT_CONNECTION_STATE: GitHubConnectionState = {
  connected: false,
  source: 'none',
  sourceLabel: 'Not connected',
  tokenPreview: null,
  hasEnvToken: false,
  hasStoredToken: false,
  canClearStoredToken: false,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function coerceRepos(data: unknown): Repo[] {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is Repo =>
      isRecord(item) &&
      typeof item.id === 'string' &&
      typeof item.full_name === 'string' &&
      typeof item.name === 'string',
  );
}

function coerceCommits(data: unknown): Commit[] {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is Commit =>
      isRecord(item) &&
      typeof item.sha === 'string' &&
      typeof item.message === 'string' &&
      typeof item.committed_at === 'string',
  );
}

function coerceIssues(data: unknown): GitHubIssue[] {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is GitHubIssue =>
      isRecord(item) &&
      typeof item.id === 'number' &&
      typeof item.number === 'number' &&
      typeof item.title === 'string' &&
      typeof item.updated_at === 'string',
  );
}

export function useGitHubConnection() {
  const [connection, setConnection] = useState<GitHubConnectionState>(DEFAULT_CONNECTION_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const state = await GitHubService.getGitHubConnectionState();
      setConnection(state);
    } catch (error: unknown) {
      logGitHubUiError('useGitHubConnection.refresh/getGitHubConnectionState', error, 'kept previous connection state');
      setError(toErrorMessage(error, 'Failed to load GitHub connection state.'));
      setConnection((previous) => previous ?? DEFAULT_CONNECTION_STATE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveToken = useCallback(async (token: string) => {
    try {
      setSaving(true);
      setError(null);
      const state = await GitHubService.setGitHubPersonalAccessToken(token);
      setConnection(state);
      return state;
    } catch (error: unknown) {
      logGitHubUiError('useGitHubConnection.save/setGitHubPersonalAccessToken', error, 'kept previous connection state');
      const message = toErrorMessage(error, 'Failed to save GitHub token.');
      setError(message);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  }, []);

  const clearToken = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      const state = await GitHubService.clearGitHubPersonalAccessToken();
      setConnection(state);
      return state;
    } catch (error: unknown) {
      logGitHubUiError('useGitHubConnection.clear/clearGitHubPersonalAccessToken', error, 'kept previous connection state');
      const message = toErrorMessage(error, 'Failed to clear saved GitHub token.');
      setError(message);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  }, []);

  return { connection, loading, saving, error, refresh, saveToken, clearToken };
}

export function useRepos() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await GitHubService.getRepos();
      setRepos(coerceRepos(data));
    } catch (error: unknown) {
      logGitHubUiError('useRepos.refresh/getRepos', error, 'kept previous repos and showed fallback message');
      setError(toErrorMessage(error, 'Failed to load repositories.'));
      setRepos((previous) => coerceRepos(previous));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    let active = true;

    const startupSync = async () => {
      if (hasRunStartupGitHubSync) return;

      try {
        const connection = await GitHubService.getGitHubConnectionState();
        if (!active || hasRunStartupGitHubSync || !connection.connected) {
          return;
        }

        hasRunStartupGitHubSync = true;
        setSyncing(true);
        setError(null);

        const data = await GitHubService.syncReposToSupabase();
        if (!active) return;
        setRepos(coerceRepos(data));
      } catch (error: unknown) {
        hasRunStartupGitHubSync = false;
        logGitHubUiError(
          'useRepos.startupSync/syncReposToSupabase',
          error,
          'kept existing repos and allowed manual sync retry',
        );
        if (!active) return;
        setError(toErrorMessage(error, 'Automatic GitHub sync failed. Tap Sync to retry.'));
      } finally {
        if (active) {
          setSyncing(false);
        }
      }
    };

    startupSync();

    return () => {
      active = false;
    };
  }, []);

  const sync = useCallback(async () => {
    try {
      setSyncing(true);
      setError(null);
      const data = await GitHubService.syncReposToSupabase();
      setRepos(coerceRepos(data));
    } catch (error: unknown) {
      logGitHubUiError('useRepos.sync/syncReposToSupabase', error, 'kept cached repos and showed fallback message');
      setError(toErrorMessage(error, 'Failed to sync repositories.'));
      setRepos((previous) => coerceRepos(previous));
    } finally {
      setSyncing(false);
    }
  }, []);

  return { repos, loading, syncing, error, refresh, sync };
}

export function useCommits(repoId?: string) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = repoId
        ? await GitHubService.getCommitsForRepo(repoId)
        : await GitHubService.getRecentCommits(20);
      setCommits(coerceCommits(data));
    } catch (error: unknown) {
      logGitHubUiError('useCommits.refresh/getCommits', error, 'kept previous commits and showed fallback message');
      setError(toErrorMessage(error, 'Failed to load commits.'));
      setCommits((previous) => coerceCommits(previous));
    } finally {
      setLoading(false);
    }
  }, [repoId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { commits, loading, error, refresh };
}

export function useRecentCommits(limit = 5) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const data = await GitHubService.getRecentCommits(limit);
        if (!active) return;
        setCommits(coerceCommits(data));
      } catch (error: unknown) {
        logGitHubUiError('useRecentCommits/getRecentCommits', error, 'fell back to empty recent commits state');
        if (!active) return;
        setCommits((previous) => coerceCommits(previous));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [limit]);

  return { commits, loading };
}

export function useIssues() {
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await GitHubService.fetchAllOpenIssues();
      setIssues(coerceIssues(data));
    } catch (error: unknown) {
      logGitHubUiError('useIssues.refresh/fetchAllOpenIssues', error, 'kept previous issues and showed fallback message');
      setError(toErrorMessage(error, 'Failed to load issues.'));
      setIssues((previous) => coerceIssues(previous));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { issues, loading, error, refresh };
}
