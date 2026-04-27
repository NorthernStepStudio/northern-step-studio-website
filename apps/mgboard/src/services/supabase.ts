import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Supabase credentials from environment variables.
// Placeholder values prevent hard crash when env vars are missing.
// The app will show auth errors but remain navigable.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const DEFAULT_WORKSPACE_USER_ID = '00000000-0000-4000-8000-000000000001';
const CONFIGURED_WORKSPACE_USER_ID = process.env.EXPO_PUBLIC_MGBOARD_WORKSPACE_USER_ID?.trim() || DEFAULT_WORKSPACE_USER_ID;

export const isSupabaseConfigured =
  !!process.env.EXPO_PUBLIC_SUPABASE_URL && !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const mgboardWorkspaceUserId = CONFIGURED_WORKSPACE_USER_ID;
let cachedWorkspaceUserId: string | null = null;

/**
 * Custom storage adapter.
 * - On native: uses expo-secure-store for encrypted token storage.
 * - On web (browser): uses localStorage.
 * - During SSR (Node.js): uses in-memory map to avoid crashes.
 */
function createStorage() {
  // Check if we're in a browser environment (not Node SSR)
  const isBrowser = Platform.OS === 'web' && typeof window !== 'undefined' && typeof localStorage !== 'undefined';

  if (isBrowser) {
    return {
      getItem: async (key: string) => localStorage.getItem(key),
      setItem: async (key: string, value: string) => { localStorage.setItem(key, value); },
      removeItem: async (key: string) => { localStorage.removeItem(key); },
    };
  }

  if (Platform.OS !== 'web') {
    // Native — use expo-secure-store
    const SecureStore = require('expo-secure-store');
    return {
      getItem: (key: string) => SecureStore.getItemAsync(key),
      setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
      removeItem: (key: string) => SecureStore.deleteItemAsync(key),
    };
  }

  // SSR (Node.js) — in-memory noop storage
  const mem = new Map<string, string>();
  return {
    getItem: async (key: string) => mem.get(key) ?? null,
    setItem: async (key: string, value: string) => { mem.set(key, value); },
    removeItem: async (key: string) => { mem.delete(key); },
  };
}

const storage = createStorage();

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web' && typeof window !== 'undefined',
  },
});

async function resolveWorkspaceUserIdFromData(): Promise<string | null> {
  const taskQuery = await supabase
    .from('mgboard_tasks')
    .select('user_id, updated_at')
    .order('updated_at', { ascending: false })
    .limit(1);

  if (!taskQuery.error) {
    const taskUserId = taskQuery.data?.[0]?.user_id;
    if (typeof taskUserId === 'string' && taskUserId.trim().length > 0) {
      return taskUserId.trim();
    }
  }

  const projectQuery = await supabase
    .from('mgboard_projects')
    .select('user_id, updated_at')
    .order('updated_at', { ascending: false })
    .limit(1);

  if (!projectQuery.error) {
    const projectUserId = projectQuery.data?.[0]?.user_id;
    if (typeof projectUserId === 'string' && projectUserId.trim().length > 0) {
      return projectUserId.trim();
    }
  }

  return null;
}

export async function getWorkspaceUserId(): Promise<string> {
  if (cachedWorkspaceUserId) {
    return cachedWorkspaceUserId;
  }

  if (!isSupabaseConfigured) {
    cachedWorkspaceUserId = CONFIGURED_WORKSPACE_USER_ID;
    return cachedWorkspaceUserId;
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!error && user?.id) {
      cachedWorkspaceUserId = user.id;
      return cachedWorkspaceUserId;
    }

    const discovered = await resolveWorkspaceUserIdFromData();
    if (discovered) {
      cachedWorkspaceUserId = discovered;
      return cachedWorkspaceUserId;
    }

    cachedWorkspaceUserId = CONFIGURED_WORKSPACE_USER_ID;
    return cachedWorkspaceUserId;
  } catch {
    cachedWorkspaceUserId = CONFIGURED_WORKSPACE_USER_ID;
    return cachedWorkspaceUserId;
  }
}
