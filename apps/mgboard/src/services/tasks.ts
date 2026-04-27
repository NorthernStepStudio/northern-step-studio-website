import { getWorkspaceUserId, isSupabaseConfigured, supabase } from './supabase';
import type { Task, TaskCreate, TaskUpdate } from '../types';
import { normalizeTaskCreateInput, normalizeTaskRow, normalizeTaskUpdateInput } from './taskModel';

const TABLE = 'mgboard_tasks';

function ensureSupabaseConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured for MGBoard.');
  }
}

export async function getTasks(projectId?: string): Promise<Task[]> {
  ensureSupabaseConfigured();

  let query = supabase
    .from(TABLE)
    .select('*, mgboard_projects(name), mgboard_repos(name)')
    .order('status', { ascending: true })
    .order('priority', { ascending: true })
    .order('updated_at', { ascending: false });

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row: any) =>
    normalizeTaskRow({
      ...row,
      project_name: row.mgboard_projects?.name ?? null,
      repo_name: row.mgboard_repos?.name ?? null,
      mgboard_projects: undefined,
      mgboard_repos: undefined,
    }),
  );
}

export async function getTaskById(id: string): Promise<Task | null> {
  ensureSupabaseConfigured();

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data ? normalizeTaskRow(data) : null;
}

export async function createTask(task: TaskCreate): Promise<Task> {
  ensureSupabaseConfigured();

  const normalizedTask = normalizeTaskCreateInput(task);
  if (!normalizedTask.title) {
    throw new Error('Task title is required');
  }

  const userId = await getWorkspaceUserId();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...normalizedTask, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return normalizeTaskRow(data);
}

export async function updateTask(id: string, updates: TaskUpdate): Promise<Task> {
  ensureSupabaseConfigured();

  const normalizedUpdates = normalizeTaskUpdateInput(updates);
  const { data, error } = await supabase
    .from(TABLE)
    .update(normalizedUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return normalizeTaskRow(data);
}

export async function deleteTask(id: string): Promise<void> {
  ensureSupabaseConfigured();

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/** Get top priority tasks that are not done, limited to N. */
export async function getTopTasks(limit = 3): Promise<Task[]> {
  ensureSupabaseConfigured();

  const { data, error } = await supabase
    .from(TABLE)
    .select('*, mgboard_projects(name), mgboard_repos(name)')
    .in('status', ['in_progress', 'doing', 'todo', 'ready'])
    .order('status', { ascending: true })
    .order('priority', { ascending: true })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row: any) =>
    normalizeTaskRow({
      ...row,
      project_name: row.mgboard_projects?.name ?? null,
      repo_name: row.mgboard_repos?.name ?? null,
      mgboard_projects: undefined,
      mgboard_repos: undefined,
    }),
  );
}
