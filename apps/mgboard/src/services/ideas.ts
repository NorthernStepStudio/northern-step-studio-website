import { getWorkspaceUserId, isSupabaseConfigured, supabase } from './supabase';
import type { Idea, IdeaCreate, IdeaUpdate } from '../types';

const TABLE = 'mgboard_ideas';

function ensureSupabaseConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured for MGBoard.');
  }
}

export async function getIdeas(): Promise<Idea[]> {
  ensureSupabaseConfigured();

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('tag', { ascending: true })
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getIdeaById(id: string): Promise<Idea | null> {
  ensureSupabaseConfigured();

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createIdea(idea: IdeaCreate): Promise<Idea> {
  ensureSupabaseConfigured();

  const userId = await getWorkspaceUserId();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...idea, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateIdea(id: string, updates: IdeaUpdate): Promise<Idea> {
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

export async function deleteIdea(id: string): Promise<void> {
  ensureSupabaseConfigured();

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) throw error;
}
