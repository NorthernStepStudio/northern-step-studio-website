import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { getCookie, setCookie } from "hono/cookie";
import { OWNER_EMAIL } from "../shared/auth";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_PBKDF2_ITERATIONS = 210000;
const PASSWORD_SALT_BYTES = 16;
const LOCAL_SESSION_TOKEN_BYTES = 32;
const LOCAL_SESSION_MAX_AGE_SECONDS = 60 * 24 * 60 * 60;
export const LOCAL_SESSION_TOKEN_COOKIE_NAME = "studio_session_token";

export type AppUser = {
  id: string;
  email: string;
  google_sub?: string;
  google_user_data?: {
    email: string;
    email_verified: boolean;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
    sub: string;
  };
  last_signed_in_at: string;
  created_at: string;
  updated_at: string;
  auth_method: "google" | "local";
  role: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  has_password: boolean;
  db_user_id: number;
};

export type DatabaseUser = {
  id: number;
  email: string;
  role: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  password_hash: string | null;
  password_salt: string | null;
  created_at: string;
  updated_at: string;
};

type LocalSessionRow = DatabaseUser & {
  last_seen_at: string | null;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getDefaultDisplayName(email: string) {
  return email.split("@")[0];
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function randomHex(byteLength: number) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function randomToken(byteLength: number) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256(value: string) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return toHex(buffer);
}

async function hashPassword(password: string, saltHex: string) {
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)?.map((pair) => parseInt(pair, 16)) ?? []);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations: PASSWORD_PBKDF2_ITERATIONS,
    },
    passwordKey,
    256,
  );

  return toHex(bits);
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

export function toLocalAppUser(
  row: Pick<
    LocalSessionRow,
    | "id"
    | "email"
    | "role"
    | "display_name"
    | "bio"
    | "avatar_url"
    | "password_hash"
    | "password_salt"
    | "created_at"
    | "updated_at"
  >,
  lastSignedInAt = new Date().toISOString(),
): AppUser {
  const displayName = row.display_name || getDefaultDisplayName(row.email);
  const localSubject = `local:${row.id}`;

  return {
    id: String(row.id),
    email: row.email,
    google_sub: localSubject,
    google_user_data: {
      email: row.email,
      email_verified: true,
      name: displayName,
      picture: row.avatar_url ?? undefined,
      sub: localSubject,
    },
    last_signed_in_at: lastSignedInAt,
    created_at: row.created_at,
    updated_at: row.updated_at,
    auth_method: "local",
    role: row.role,
    display_name: row.display_name,
    bio: row.bio,
    avatar_url: row.avatar_url,
    has_password: Boolean(row.password_hash && row.password_salt),
    db_user_id: row.id,
  };
}

export function getSessionCookieOptions(requestUrl: string) {
  const isSecure = new URL(requestUrl).protocol === "https:";

  return {
    httpOnly: true,
    path: "/",
    sameSite: (isSecure ? "none" : "lax") as "none" | "lax",
    secure: isSecure,
  };
}

import { getDb } from "./db";

// ... (previous functions unchanged until findDatabaseUserByEmail)

export async function findDatabaseUserByEmail(env: Env, email: string) {
  const sql = getDb(env);
  const [user] = await sql<DatabaseUser[]>`
    SELECT id, email, role, display_name, bio, avatar_url, password_hash, password_salt, created_at, updated_at
    FROM users
    WHERE LOWER(email) = ${normalizeEmail(email)}
  `;
  return user || null;
}

export async function ensureDatabaseUser(env: Env, email: string, displayName?: string | null) {
  const normalizedEmail = normalizeEmail(email);
  let user = await findDatabaseUserByEmail(env, normalizedEmail);

  const sql = getDb(env);

  if (!user) {
    const initialRole = normalizedEmail === OWNER_EMAIL ? "owner" : "user";
    const resolvedDisplayName = displayName?.trim() || getDefaultDisplayName(normalizedEmail);

    await sql`
      INSERT INTO users (email, role, display_name) 
      VALUES (${normalizedEmail}, ${initialRole}, ${resolvedDisplayName})
      ON CONFLICT (email) DO NOTHING
    `;

    user = await findDatabaseUserByEmail(env, normalizedEmail);
  }

  if (!user) {
    throw new Error("Failed to resolve authenticated user");
  }

  if (normalizedEmail === OWNER_EMAIL && user.role !== "owner") {
    await sql`
      UPDATE users SET role = 'owner', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${user.id}
    `;

    user = await findDatabaseUserByEmail(env, normalizedEmail);
  }

  if (!user) {
    throw new Error("Failed to load authenticated user after owner update");
  }

  if (!user.display_name && displayName?.trim()) {
    await sql`
      UPDATE users SET display_name = ${displayName.trim()}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${user.id}
    `;

    user = await findDatabaseUserByEmail(env, normalizedEmail);
  }

  if (!user) {
    throw new Error("Failed to load authenticated user after profile sync");
  }

  return user;
}

export function validatePassword(password: string) {
  return password.trim().length >= PASSWORD_MIN_LENGTH;
}

export async function createPasswordCredentials(password: string) {
  const password_salt = randomHex(PASSWORD_SALT_BYTES);
  const password_hash = await hashPassword(password, password_salt);

  return { password_hash, password_salt };
}

export async function verifyUserPassword(user: Pick<DatabaseUser, "password_hash" | "password_salt">, password: string) {
  if (!user.password_hash || !user.password_salt) {
    return false;
  }

  const candidateHash = await hashPassword(password, user.password_salt);
  return constantTimeEqual(candidateHash, user.password_hash);
}

export async function createLocalSession(c: { env: Env; req: { url: string } }, dbUserId: number) {
  const sessionToken = randomToken(LOCAL_SESSION_TOKEN_BYTES);
  const sessionTokenHash = await sha256(sessionToken);
  const sql = getDb(c.env);

  await sql`
    INSERT INTO user_sessions (
      user_id,
      session_token_hash,
      expires_at,
      created_at,
      updated_at,
      last_seen_at
    ) VALUES (
      ${dbUserId}, 
      ${sessionTokenHash}, 
      CURRENT_TIMESTAMP + INTERVAL '60 days', 
      CURRENT_TIMESTAMP, 
      CURRENT_TIMESTAMP, 
      CURRENT_TIMESTAMP
    )
  `;

  setCookie(c as never, LOCAL_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    ...getSessionCookieOptions(c.req.url),
    maxAge: LOCAL_SESSION_MAX_AGE_SECONDS,
  });
}

async function deleteLocalSessionByToken(env: Env, sessionToken: string) {
  const sessionTokenHash = await sha256(sessionToken);
  const sql = getDb(env);
  await sql`DELETE FROM user_sessions WHERE session_token_hash = ${sessionTokenHash}`;
}

export async function clearAuthSessions(c: { env: Env; req: { url: string } }) {
  const localSessionToken = getCookie(c as never, LOCAL_SESSION_TOKEN_COOKIE_NAME);
  if (typeof localSessionToken === "string" && localSessionToken.length > 0) {
    await deleteLocalSessionByToken(c.env, localSessionToken);
  }

  const cookieOptions = getSessionCookieOptions(c.req.url);
  setCookie(c as never, LOCAL_SESSION_TOKEN_COOKIE_NAME, "", { ...cookieOptions, maxAge: 0 });
}

export async function getAuthenticatedUser(c: { env: Env; req: { url: string } }): Promise<AppUser | null> {
  const sessionToken = getCookie(c as never, LOCAL_SESSION_TOKEN_COOKIE_NAME);
  if (typeof sessionToken !== "string" || sessionToken.length === 0) {
    return null;
  }

  const sessionTokenHash = await sha256(sessionToken);
  const sql = getDb(c.env);

  const [row] = await sql<LocalSessionRow[]>`
    SELECT
      u.id,
      u.email,
      u.role,
      u.display_name,
      u.bio,
      u.avatar_url,
      u.password_hash,
      u.password_salt,
      u.created_at,
      u.updated_at,
      s.last_seen_at
    FROM user_sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.session_token_hash = ${sessionTokenHash}
      AND s.expires_at > CURRENT_TIMESTAMP
  `;

  if (!row) {
    setCookie(c as never, LOCAL_SESSION_TOKEN_COOKIE_NAME, "", {
      ...getSessionCookieOptions(c.req.url),
      maxAge: 0,
    });
    return null;
  }

  await sql`
    UPDATE user_sessions 
    SET last_seen_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
    WHERE session_token_hash = ${sessionTokenHash}
  `;

  return toLocalAppUser(row, row.last_seen_at || new Date().toISOString());
}

export const authMiddleware: MiddlewareHandler<{ Bindings: Env; Variables: { user: AppUser } }> = async (c, next) => {
  const user = await getAuthenticatedUser(c);

  if (!user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  c.set("user", user);
  await next();
};

export async function getGoogleOAuthRedirectUrl(c: { env: Env; req: { url: string } }) {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: new URL("/api/oauth/google/callback", c.req.url).toString(),
    client_id: c.env.GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}

export async function exchangeGoogleCodeForUser(c: { env: Env; req: { url: string } }, code: string) {
  const url = "https://oauth2.googleapis.com/token";
  const values = {
    code,
    client_id: c.env.GOOGLE_CLIENT_ID,
    client_secret: c.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: new URL("/api/oauth/google/callback", c.req.url).toString(),
    grant_type: "authorization_code",
  };

  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(values),
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("Failed to fetch Google OAuth token:", error);
    throw new Error("Failed to fetch Google OAuth token");
  }

  const { access_token } = (await res.json()) as { access_token: string };

  const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!userRes.ok) {
    const error = await userRes.json();
    console.error("Failed to fetch Google user info:", error);
    throw new Error("Failed to fetch Google user info");
  }

  return (await userRes.json()) as {
    sub: string;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    email: string;
    email_verified: boolean;
  };
}
