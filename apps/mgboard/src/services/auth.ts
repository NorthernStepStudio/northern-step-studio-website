import { supabase } from './supabase';

let cachedGitHubProviderToken: string | null = null;
let tokenSubscriptionInitialized = false;

function sanitizeLogDetails(details: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...details };
  const sensitiveKeys = ['token', 'password', 'provider_token', 'secret', 'key'];
  for (const k of sensitiveKeys) {
    if (k in sanitized) sanitized[k] = '[REDACTED]';
  }
  return sanitized;
}

function logAuthEvent(
  level: 'warn' | 'error',
  context: string,
  details: Record<string, unknown>,
) {
  const payload = {
    scope: 'github-auth',
    context,
    details: sanitizeLogDetails(details),
    timestamp: new Date().toISOString(),
  };
  if (level === 'error') {
    console.error('[MGBoard Auth]', payload);
    return;
  }
  console.warn('[MGBoard Auth]', payload);
}

function cacheProviderToken(token: string | null | undefined) {
  if (typeof token === 'string' && token.trim()) {
    cachedGitHubProviderToken = token;
  }
}

function ensureTokenSubscription() {
  if (tokenSubscriptionInitialized) return;
  tokenSubscriptionInitialized = true;

  try {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.provider_token) {
        cacheProviderToken(session.provider_token);
      }
      if (!session) {
        cachedGitHubProviderToken = null;
      }
    });
  } catch (error: unknown) {
    logAuthEvent('warn', 'provider_token_subscription_failed', {
      rootCause: error instanceof Error ? error.message : 'Unknown auth subscription error',
      failedEndpoint: 'supabase.auth.onAuthStateChange',
      fixApplied: 'falling back to session lookup + refresh for provider token',
    });
  }
}

/**
 * Sign in with email + password.
 */
export async function signInWithEmail(email: string, password: string) {
  void email;
  void password;
  throw new Error('Sign-in is disabled in this build.');
}

/**
 * Sign up with email + password.
 */
export async function signUpWithEmail(email: string, password: string) {
  void email;
  void password;
  throw new Error('Sign-up is disabled in this build.');
}

/**
 * Sign in with GitHub OAuth via Supabase.
 * Returns the OAuth URL to open in a browser.
 */
export async function signInWithGitHub() {
  throw new Error('GitHub OAuth sign-in is disabled in this build.');
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get the current session.
 */
export async function getSession() {
  ensureTokenSubscription();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  cacheProviderToken(data.session?.provider_token);
  return data.session;
}

/**
 * Get the GitHub access token from the current session's provider_token.
 * This is available after GitHub OAuth login.
 */
export async function getGitHubToken(): Promise<string | null> {
  ensureTokenSubscription();

  try {
    const session = await getSession();
    if (!session) return null;

    if (session.provider_token) {
      cacheProviderToken(session.provider_token);
      return session.provider_token;
    }

    if (cachedGitHubProviderToken) {
      return cachedGitHubProviderToken;
    }

    // Provider tokens can be dropped in older sessions; attempt one refresh.
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      logAuthEvent('warn', 'provider_token_refresh_failed', {
        rootCause: error.message,
        failedEndpoint: 'supabase.auth.refreshSession',
        fixApplied: 'falling back to null token and UI auth prompt',
      });
      return null;
    }

    const refreshedToken = data.session?.provider_token ?? null;
    cacheProviderToken(refreshedToken);
    if (!refreshedToken) {
      logAuthEvent('warn', 'provider_token_missing_after_refresh', {
        rootCause: 'provider_token was empty after refreshSession',
        failedEndpoint: 'supabase.auth.getSession',
        fixApplied: 'falling back to null token and UI auth prompt',
      });
    }
    return refreshedToken;
  } catch (error: unknown) {
    logAuthEvent('warn', 'provider_token_lookup_failed', {
      rootCause: error instanceof Error ? error.message : 'Unknown auth error',
      failedEndpoint: 'supabase.auth.getSession',
      fixApplied: 'falling back to null token and UI auth prompt',
    });
    return null;
  }
}
