import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  fetchStudioCurrentUser,
  getStudioFallbackUser,
  getStudioAdminLoginUrl,
  getStudioAuthOrigin,
  isStudioAuthDisabled,
  signInStudioAdmin,
  signOutStudioAdmin,
  type StudioAuthUser,
} from '../services/studioAuth';

interface AuthState {
  session: null;
  user: StudioAuthUser | null;
  loading: boolean;
  error: string | null;
  authOrigin: string;
  loginUrl: string;
  refresh: () => Promise<StudioAuthUser | null>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  loading: true,
  error: null,
  authOrigin: getStudioAuthOrigin(),
  loginUrl: getStudioAdminLoginUrl(),
  refresh: async () => null,
  signIn: async () => {},
  signOut: async () => {},
});

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StudioAuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authDisabled = isStudioAuthDisabled();

  const refresh = useCallback(async (): Promise<StudioAuthUser | null> => {
    if (authDisabled) {
      const fallback = getStudioFallbackUser();
      setUser(fallback);
      setError(null);
      setLoading(false);
      return fallback;
    }

    try {
      setError(null);
      const currentUser = await fetchStudioCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (err: unknown) {
      setUser(null);
      setError(toErrorMessage(err, 'Failed to connect to admin auth service.'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [authDisabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (authDisabled) {
      setUser(getStudioFallbackUser());
      setError(null);
      return;
    }

    const authenticated = await signInStudioAdmin(email.trim(), password);
    setUser(authenticated);
    setError(null);
  }, [authDisabled]);

  const signOut = useCallback(async () => {
    if (authDisabled) {
      setUser(getStudioFallbackUser());
      setError(null);
      return;
    }

    try {
      await signOutStudioAdmin();
    } finally {
      setUser(null);
    }
  }, [authDisabled]);

  const value = useMemo<AuthState>(
    () => ({
      session: null,
      user,
      loading,
      error,
      authOrigin: getStudioAuthOrigin(),
      loginUrl: getStudioAdminLoginUrl(),
      refresh,
      signIn,
      signOut,
    }),
    [error, loading, refresh, signIn, signOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
