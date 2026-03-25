import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase, getSupabaseOrigin, type SupabaseUser } from "@/react-app/lib/supabase";
import { OWNER_EMAIL, isAdminDomainEmail, isElevatedRole } from "@/shared/auth";

export type AppUser = {
  id?: string;
  id_token: string;
  email: string;
  auth_method: "google" | "local";
  role?: string;
  display_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  has_password?: boolean;
  db_user_id?: number;
};

type PasswordLoginOptions = {
  admin?: boolean;
};

type PasswordRegistrationOptions = {
  displayName?: string;
};

type AuthContextValue = {
  user: AppUser | null;
  isPending: boolean;
  isFetching: boolean;
  fetchUser: () => Promise<AppUser | null>;
  redirectToLogin: () => Promise<void>;
  exchangeCodeForSessionToken: () => Promise<AppUser | null>;
  loginWithPassword: (email: string, password: string, options?: PasswordLoginOptions) => Promise<AppUser>;
  registerWithPassword: (
    email: string,
    password: string,
    options?: PasswordRegistrationOptions,
  ) => Promise<AppUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function inferRole(email: string, supabaseUser?: SupabaseUser | null) {
  const metadataRole =
    typeof supabaseUser?.app_metadata?.role === "string"
      ? supabaseUser.app_metadata.role
      : typeof supabaseUser?.user_metadata?.role === "string"
        ? supabaseUser.user_metadata.role
        : null;

  if (metadataRole) {
    return metadataRole;
  }

  if (email === OWNER_EMAIL) {
    return "owner";
  }

  if (isAdminDomainEmail(email)) {
    return "admin";
  }

  return "user";
}

function mapSupabaseUser(user: SupabaseUser): AppUser {
  const email = user.email ?? "";
  const role = inferRole(email, user);
  const provider = user.app_metadata?.provider || user.identities?.[0]?.provider || "email";
  const displayName =
    (typeof user.user_metadata?.display_name === "string" && user.user_metadata.display_name.trim()) ||
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()) ||
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()) ||
    email.split("@")[0] ||
    null;

  return {
    id: user.id,
    id_token: user.id,
    email,
    auth_method: provider === "google" ? "google" : "local",
    role,
    display_name: displayName,
    bio:
      typeof user.user_metadata?.bio === "string" && user.user_metadata.bio.trim()
        ? user.user_metadata.bio.trim()
        : null,
    avatar_url:
      typeof user.user_metadata?.avatar_url === "string"
        ? user.user_metadata.avatar_url
        : typeof user.user_metadata?.picture === "string"
          ? user.user_metadata.picture
          : null,
    has_password: provider !== "google",
    db_user_id: Number(user.user_metadata?.db_user_id ?? 0) || 0,
  };
}

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before using auth.",
    );
  }

  return supabase;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isPending, setIsPending] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const syncUserFromSession = useCallback(async () => {
    const client = requireSupabase();
    const { data, error } = await client.auth.getSession();

    if (error) {
      throw error;
    }

    const nextUser = data.session?.user ? mapSupabaseUser(data.session.user) : null;
    setUser(nextUser);
    return nextUser;
  }, []);

  const fetchUser = useCallback(async () => {
    setIsFetching(true);

    try {
      return await syncUserFromSession();
    } finally {
      setIsFetching(false);
    }
  }, [syncUserFromSession]);

  useEffect(() => {
    let active = true;
    const client = supabase;

    const initialize = async () => {
      if (!client) {
        if (active) {
          setUser(null);
          setIsFetching(false);
          setIsPending(false);
        }
        return;
      }

      setIsFetching(true);
      try {
        const { data, error } = await client.auth.getSession();
        if (error) {
          throw error;
        }

        if (active) {
          setUser(data.session?.user ? mapSupabaseUser(data.session.user) : null);
        }
      } catch (error) {
        if (active) {
          console.error("Failed to initialize auth state:", error);
          setUser(null);
        }
      } finally {
        if (active) {
          setIsFetching(false);
          setIsPending(false);
        }
      }
    };

    void initialize();

    const subscription = client?.auth.onAuthStateChange((_event, session) => {
      if (!active) {
        return;
      }

      setUser(session?.user ? mapSupabaseUser(session.user) : null);
      setIsFetching(false);
      setIsPending(false);
    });

    return () => {
      active = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  const redirectToLogin = useCallback(async () => {
    const client = requireSupabase();
    const redirectTo = `${getSupabaseOrigin()}/auth/callback`;
    const { data, error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      throw error;
    }

    if (!data?.url) {
      throw new Error("Unable to start Google sign in right now.");
    }

    window.location.assign(data.url);
  }, []);

  const exchangeCodeForSessionToken = useCallback(async () => {
    const client = requireSupabase();
    const code = new URLSearchParams(window.location.search).get("code");

    if (!code) {
      throw new Error("Missing authorization code");
    }

    const { data, error } = await client.auth.exchangeCodeForSession(code);
    if (error) {
      throw error;
    }

    const nextUser = data.session?.user ? mapSupabaseUser(data.session.user) : null;
    setUser(nextUser);
    return nextUser;
  }, []);

  const loginWithPassword = useCallback(
    async (email: string, password: string, options: PasswordLoginOptions = {}) => {
    const client = requireSupabase();

    if (options.admin) {
      const inferredRole = inferRole(email);
      if (!isElevatedRole(inferredRole)) {
        throw new Error("Admin access required for this account.");
      }
    }

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    const authenticatedUser = data.user ? mapSupabaseUser(data.user) : null;
    if (authenticatedUser) {
      setUser(authenticatedUser);
      return authenticatedUser;
    }

    const refreshedUser = await fetchUser();
    if (!refreshedUser) {
      throw new Error("Unable to load your account after sign in.");
    }

    return refreshedUser;
    },
    [fetchUser],
  );

  const registerWithPassword = useCallback(
    async (email: string, password: string, options: PasswordRegistrationOptions = {}) => {
    const client = requireSupabase();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: options.displayName?.trim() || undefined,
          role: "user",
        },
        emailRedirectTo: `${getSupabaseOrigin()}/auth/callback`,
      },
    });

    if (error) {
      throw error;
    }

    if (data.session?.user) {
      const authenticatedUser = mapSupabaseUser(data.session.user);
      setUser(authenticatedUser);
      return authenticatedUser;
    }

    if (data.user) {
      throw new Error("Account created. Check your email to confirm the sign-up before signing in.");
    }

    throw new Error("Unable to create your account right now.");
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      const client = supabase;
      if (client) {
        await client.auth.signOut();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isPending,
      isFetching,
      fetchUser,
      redirectToLogin,
      exchangeCodeForSessionToken,
      loginWithPassword,
      registerWithPassword,
      logout,
    }),
    [user, isPending, isFetching, fetchUser, redirectToLogin, exchangeCodeForSessionToken, loginWithPassword, registerWithPassword, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
