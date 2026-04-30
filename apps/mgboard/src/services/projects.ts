import { getWorkspaceUserId, isSupabaseConfigured, supabase } from './supabase';
import type { Project, ProjectCreate, ProjectUpdate } from '../types';

const TABLE = 'mgboard_projects';
const REPO_TABLE = 'mgboard_repos';
const PROJECT_REPO_TABLE = 'mgboard_project_repos';

export interface ProjectRepoHealth {
  project_id: string;
  linked_repo_count: number;
  latest_commit_date: string | null;
  total_open_issues: number;
}

function ensureSupabaseConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured for MGBoard.');
  }
}

function inferStatusFromRepo(repo: { last_commit_date?: string | null }): Project['status'] {
  const stamp = repo.last_commit_date ? new Date(repo.last_commit_date).getTime() : 0;
  if (!stamp) return 'idea';

  const daysOld = Math.floor((Date.now() - stamp) / (24 * 60 * 60 * 1000));
  if (daysOld >= 21) return 'paused';
  if (daysOld <= 3) return 'building';
  return 'preview';
}

function inferPriorityFromRepo(repo: { open_issues_count?: number | null }): Project['priority'] {
  const issues = Math.max(0, repo.open_issues_count ?? 0);
  if (issues >= 8) return 'high';
  if (issues >= 3) return 'medium';
  return 'low';
}

function inferNextAction(repoName: string, issues: number): string {
  if (issues > 0) {
    return `Review ${issues} open issue${issues === 1 ? '' : 's'} in ${repoName}.`;
  }
  return `Define next milestone for ${repoName}.`;
}

async function bootstrapProjectsFromRepos(userId: string): Promise<Project[]> {
  const { data: repos, error: repoError } = await supabase
    .from(REPO_TABLE)
    .select('id, name, full_name, last_commit_date, open_issues_count')
    .eq('user_id', userId)
    .order('last_commit_date', { ascending: false });

  if (repoError) throw repoError;
  if (!repos || repos.length === 0) return [];

  const rows = repos.map((repo: any) => ({
    user_id: userId,
    name: repo.name,
    status: inferStatusFromRepo(repo),
    priority: inferPriorityFromRepo(repo),
    next_action: inferNextAction(repo.name, Math.max(0, repo.open_issues_count ?? 0)),
  }));

  const { data: inserted, error: insertError } = await supabase
    .from(TABLE)
    .insert(rows)
    .select('*');

  if (insertError) throw insertError;

  const insertedProjects = (inserted ?? []) as Project[];
  if (insertedProjects.length === 0) return [];

  const projectByName = new Map(insertedProjects.map((project) => [project.name, project.id]));
  const links = repos
    .map((repo: any) => {
      const projectId = projectByName.get(repo.name);
      if (!projectId) return null;
      return {
        project_id: projectId,
        repo_id: repo.id as string,
      };
    })
    .filter(Boolean) as Array<{ project_id: string; repo_id: string }>;

  if (links.length > 0) {
    const { error: linkError } = await supabase
      .from(PROJECT_REPO_TABLE)
      .insert(links);
    if (linkError) throw linkError;
  }

  return insertedProjects.sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );
}

export async function getProjects(): Promise<Project[]> {
  ensureSupabaseConfigured();

  const userId = await getWorkspaceUserId();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  const rows = (data ?? []) as Project[];
  if (rows.length > 0) return rows;

  return bootstrapProjectsFromRepos(userId);
}

export async function getProjectById(id: string): Promise<Project | null> {
  ensureSupabaseConfigured();

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createProject(project: ProjectCreate): Promise<Project> {
  ensureSupabaseConfigured();

  const userId = await getWorkspaceUserId();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...project, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProject(id: string, updates: ProjectUpdate): Promise<Project> {
  ensureSupabaseConfigured();

  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  ensureSupabaseConfigured();

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getActiveProjects(): Promise<Project[]> {
  ensureSupabaseConfigured();

  const userId = await getWorkspaceUserId();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .in('status', ['building', 'preview'])
    .order('priority', { ascending: true })
    .limit(5);

  if (error) throw error;
  const rows = (data ?? []) as Project[];
  if (rows.length > 0) return rows;

  const bootstrapped = await bootstrapProjectsFromRepos(userId);
  return bootstrapped
    .filter((project) => project.status === 'building' || project.status === 'preview')
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    })
    .slice(0, 5);
}

/** Link a repo to a project */
export async function linkRepo(projectId: string, repoId: string): Promise<void> {
  ensureSupabaseConfigured();

  const { error } = await supabase
    .from(PROJECT_REPO_TABLE)
    .insert({ project_id: projectId, repo_id: repoId });

  if (error) throw error;
}

/** Unlink a repo from a project */
export async function unlinkRepo(projectId: string, repoId: string): Promise<void> {
  ensureSupabaseConfigured();

  const { error } = await supabase
    .from(PROJECT_REPO_TABLE)
    .delete()
    .eq('project_id', projectId)
    .eq('repo_id', repoId);

  if (error) throw error;
}

/** Get repos linked to a project */
export async function getProjectRepos(projectId: string) {
  ensureSupabaseConfigured();

  const { data, error } = await supabase
    .from(PROJECT_REPO_TABLE)
    .select('repo_id, mgboard_repos(*)')
    .eq('project_id', projectId);

  if (error) throw error;
  return (data ?? []).map((row: any) => row.mgboard_repos).filter(Boolean);
}

/**
 * Lightweight repo health summary per project.
 * Used for dashboard attention/staleness logic.
 */
export async function getProjectRepoHealth(projectIds?: string[]): Promise<ProjectRepoHealth[]> {
  ensureSupabaseConfigured();

  if (Array.isArray(projectIds) && projectIds.length === 0) {
    return [];
  }

  let query = supabase
    .from(PROJECT_REPO_TABLE)
    .select('project_id, mgboard_repos(last_commit_date, open_issues_count)');

  if (projectIds && projectIds.length > 0) {
    query = query.in('project_id', projectIds);
  }

  const { data, error } = await query;
  if (error) throw error;

  const healthMap = new Map<string, ProjectRepoHealth>();

  for (const row of data ?? []) {
    const projectId = row?.project_id as string | undefined;
    if (!projectId) continue;

    const repo = row?.mgboard_repos as
      | { last_commit_date?: string | null; open_issues_count?: number | null }
      | undefined;

    const existing = healthMap.get(projectId) ?? {
      project_id: projectId,
      linked_repo_count: 0,
      latest_commit_date: null,
      total_open_issues: 0,
    };

    existing.linked_repo_count += 1;
    existing.total_open_issues += Math.max(0, repo?.open_issues_count ?? 0);

    const lastCommit = repo?.last_commit_date ?? null;
    if (!existing.latest_commit_date) {
      existing.latest_commit_date = lastCommit;
    } else if (lastCommit) {
      const existingTs = new Date(existing.latest_commit_date).getTime();
      const currentTs = new Date(lastCommit).getTime();
      if (currentTs > existingTs) {
        existing.latest_commit_date = lastCommit;
      }
    }

    healthMap.set(projectId, existing);
  }

  return Array.from(healthMap.values());
}
