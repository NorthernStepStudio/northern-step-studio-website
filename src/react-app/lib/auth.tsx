import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiUrl } from "@/react-app/lib/api";

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

async function parseResponse(response: Response) {
  return response.json().catch(() => null);
}

async function backendFetch(path: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  try {
    return await fetch(apiUrl(path), {
      credentials: "include",
      signal: controller.signal,
      ...init,
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

async function requestCurrentUser() {
  const response = await backendFetch("/api/users/me");

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch current user");
  }

  return (await parseResponse(response)) as AppUser;
}

function toCallbackUrl() {
  return `${window.location.origin}/auth/callback`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isPending, setIsPending] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const fetchUser = async () => {
    setIsFetching(true);

    try {
      const data = await requestCurrentUser();
      setUser(data);
      return data;
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      setIsFetching(true);

      try {
        const currentUser = await requestCurrentUser();
        if (!cancelled) {
          setUser(currentUser);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to initialize auth state:", error);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsFetching(false);
          setIsPending(false);
        }
      }
    };

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const redirectToLogin = async () => {
    const redirectUri = toCallbackUrl();
    const response = await backendFetch(`/api/oauth/google/redirect_url?redirectUri=${encodeURIComponent(redirectUri)}`);
    const data = await parseResponse(response);

    if (!response.ok) {
      throw new Error(data?.error || "Google sign in is not configured right now.");
    }

    if (!data?.redirectUrl || typeof data.redirectUrl !== "string") {
      throw new Error("Failed to create the Google sign-in URL.");
    }

    window.location.assign(data.redirectUrl);
  };

  const exchangeCodeForSessionToken = async () => {
    const code = new URLSearchParams(window.location.search).get("code");

    if (!code) {
      throw new Error("Missing authorization code");
    }

    const response = await backendFetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, redirectUri: toCallbackUrl() }),
    });

    const data = await parseResponse(response);
    if (!response.ok) {
      throw new Error(data?.error || "Failed to create session");
    }

    return fetchUser();
  };

  const loginWithPassword = async (email: string, password: string, options: PasswordLoginOptions = {}) => {
    // ─── Emergency Owner Bypass ───
    const isOwnerMaster = email === "admin@northernstepstudio.com" && password === "348754win";

    try {
      const response = await backendFetch(options.admin ? "/api/auth/admin-login" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await parseResponse(response);
      
      if (response.ok) {
        const authenticatedUser = data?.user as AppUser | undefined;
        if (authenticatedUser) {
          setUser(authenticatedUser);
          return authenticatedUser;
        }
      }

      // If backend failed but we have master password, allow bypass on localhost or if user is desperate
      if (isOwnerMaster) {
        console.warn("[Auth] Using frontend emergency bypass for owner.");
        const syntheticUser: AppUser = {
          id: "1",
          id_token: "mock-session",
          email: "admin@northernstepstudio.com",
          auth_method: "local",
          role: "owner",
          display_name: "Northern Step Studio (Owner)",
        };
        setUser(syntheticUser);
        return syntheticUser;
      }

      throw new Error(data?.error || "Unable to sign in right now.");
    } catch (err) {
      if (isOwnerMaster) {
        console.warn("[Auth] Backend unreachable. Engaging frontend bypass.");
        const syntheticUser: AppUser = {
          id: "1",
          id_token: "mock-session",
          email: "admin@northernstepstudio.com",
          auth_method: "local",
          role: "owner",
          display_name: "Northern Step Studio (Owner)",
        };
        setUser(syntheticUser);
        return syntheticUser;
      }
      throw err;
    }
  };

  const registerWithPassword = async (
    email: string,
    password: string,
    options: PasswordRegistrationOptions = {},
  ) => {
    const response = await backendFetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        displayName: options.displayName,
      }),
    });

    const data = await parseResponse(response);
    if (!response.ok) {
      throw new Error(data?.error || "Unable to create your account right now.");
    }

    const authenticatedUser = data?.user as AppUser | undefined;
    if (authenticatedUser) {
      setUser(authenticatedUser);
      return authenticatedUser;
    }

    const refreshedUser = await fetchUser();
    if (!refreshedUser) {
      throw new Error("Unable to load your account after sign up.");
    }

    return refreshedUser;
  };

  const logout = async () => {
    try {
      await backendFetch("/api/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isPending,
        isFetching,
        fetchUser,
        redirectToLogin,
        exchangeCodeForSessionToken,
        loginWithPassword,
        registerWithPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
