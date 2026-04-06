import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { DashboardAuthUserConfig, DashboardRole, DashboardSession } from "./auth-types";

const COOKIE_NAME = "nstep_dashboard_session";
const DEFAULT_SESSION_TTL_HOURS = 12;
const ROLE_ORDER: readonly DashboardRole[] = ["viewer", "analyst", "operator", "admin"];

function requireAuthSecret(): string {
  const secret = process.env.NSTEP_DASHBOARD_AUTH_SECRET?.trim();
  if (!secret) {
    if (process.env.NODE_ENV !== "production") {
      return "nstep-dashboard-dev-secret";
    }
    throw new Error("NSTEP_DASHBOARD_AUTH_SECRET is required to protect the NStepOS dashboard.");
  }
  return secret;
}

function parseUsers(raw: string | undefined): readonly DashboardAuthUserConfig[] {
  const fallbackUser = process.env.NSTEP_DASHBOARD_ADMIN_USER?.trim();
  const fallbackPassword = process.env.NSTEP_DASHBOARD_ADMIN_PASSWORD?.trim();
  const fallbackRole = normalizeRole(process.env.NSTEP_DASHBOARD_ADMIN_ROLE?.trim()) || "admin";
  const fallbackTenantId = process.env.NSTEP_DASHBOARD_ADMIN_TENANT_ID?.trim() || "default";

  if (raw?.trim()) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => normalizeUserConfig(item))
          .filter((item): item is DashboardAuthUserConfig => Boolean(item));
      }
    } catch {
      const parsed = raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line): DashboardAuthUserConfig | null => {
          const [username, password, role, tenantId, displayName, email] = line.split(":");
          if (!username || !password) {
            return null;
          }
          return {
            username: username.trim(),
            password: password.trim(),
            role: normalizeRole(role?.trim()) || "viewer",
            tenantId: tenantId?.trim() || fallbackTenantId,
            displayName: displayName?.trim(),
            email: email?.trim(),
          };
        })
        .filter((item): item is DashboardAuthUserConfig => item !== null);
      return parsed;
    }
  }

  if (fallbackUser && fallbackPassword) {
    return [
      {
        username: fallbackUser,
        password: fallbackPassword,
        role: fallbackRole,
        tenantId: fallbackTenantId,
        displayName: process.env.NSTEP_DASHBOARD_ADMIN_DISPLAY_NAME?.trim() || fallbackUser,
        email: process.env.NSTEP_DASHBOARD_ADMIN_EMAIL?.trim(),
      },
    ];
  }

  if (process.env.NODE_ENV !== "production") {
    return [
      {
        username: "admin",
        password: "admin",
        role: "admin",
        tenantId: "default",
        displayName: "Local Admin",
      },
    ];
  }

  return [];
}

function normalizeUserConfig(value: unknown): DashboardAuthUserConfig | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<DashboardAuthUserConfig> & { readonly password?: string };
  if (typeof candidate.username !== "string" || !candidate.username.trim()) {
    return null;
  }
  if (typeof candidate.password !== "string" || !candidate.password.trim()) {
    return null;
  }

  return {
    username: candidate.username.trim(),
    password: candidate.password,
    role: normalizeRole(candidate.role) || "viewer",
    tenantId: typeof candidate.tenantId === "string" && candidate.tenantId.trim() ? candidate.tenantId.trim() : "default",
    displayName: typeof candidate.displayName === "string" && candidate.displayName.trim() ? candidate.displayName.trim() : candidate.username.trim(),
    email: typeof candidate.email === "string" && candidate.email.trim() ? candidate.email.trim() : undefined,
  };
}

function normalizeRole(value: string | undefined): DashboardRole | null {
  const normalized = value?.trim().toLowerCase();
  return normalized && (ROLE_ORDER as readonly string[]).includes(normalized) ? (normalized as DashboardRole) : null;
}

function encodeBase64Url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function decodeBase64Url(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(value: string): string {
  return crypto.createHmac("sha256", requireAuthSecret()).update(value).digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function roleRank(role: DashboardRole): number {
  return ROLE_ORDER.indexOf(role);
}

export function isRoleAtLeast(role: DashboardRole, minimum: DashboardRole): boolean {
  return roleRank(role) >= roleRank(minimum);
}

export function normalizeDashboardPath(pathname: string): string {
  return pathname || "/dashboard";
}

export function getRequiredDashboardRole(pathname: string): DashboardRole {
  if (pathname.startsWith("/dashboard/memory")) {
    return "admin";
  }
  if (pathname.startsWith("/dashboard/settings")) {
    return "admin";
  }
  if (pathname.startsWith("/dashboard/approvals")) {
    return "operator";
  }
  if (pathname.startsWith("/dashboard/jobs/")) {
    return "analyst";
  }
  if (pathname.startsWith("/dashboard/activity")) {
    return "analyst";
  }
  if (pathname.startsWith("/dashboard/panels/")) {
    return "viewer";
  }
  return "viewer";
}

export function isPublicDashboardPath(pathname: string): boolean {
  return pathname === "/sign-in" || pathname.startsWith("/api/auth/");
}

export function issueDashboardSession(user: DashboardAuthUserConfig, ttlHours = DEFAULT_SESSION_TTL_HOURS): DashboardSession {
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + ttlHours * 60 * 60 * 1000);
  return {
    username: user.username,
    role: user.role,
    tenantId: user.tenantId,
    displayName: user.displayName || user.username,
    email: user.email,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

function encodeSession(session: DashboardSession): string {
  const payload = encodeBase64Url(JSON.stringify(session));
  const signature = sign(payload);
  return `v1.${payload}.${signature}`;
}

export function createSessionCookie(user: DashboardAuthUserConfig, ttlHours = DEFAULT_SESSION_TTL_HOURS): string {
  return encodeSession(issueDashboardSession(user, ttlHours));
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${cookieSecureFlag()}`;
}

export function readDashboardSession(cookieHeader?: string | null): DashboardSession | null {
  const cookie = extractCookie(cookieHeader, COOKIE_NAME);
  if (!cookie) {
    return null;
  }

  const [version, payload, signature] = cookie.split(".");
  if (version !== "v1" || !payload || !signature) {
    return null;
  }

  if (!safeEqual(signature, sign(payload))) {
    return null;
  }

  try {
    const session = JSON.parse(decodeBase64Url(payload)) as DashboardSession;
    if (!session || typeof session !== "object") {
      return null;
    }
    if (typeof session.username !== "string" || !session.username.trim()) {
      return null;
    }
    if (typeof session.role !== "string" || !normalizeRole(session.role)) {
      return null;
    }
    if (typeof session.tenantId !== "string" || !session.tenantId.trim()) {
      return null;
    }
    if (typeof session.expiresAt !== "string" || Number.isNaN(Date.parse(session.expiresAt))) {
      return null;
    }
    if (Date.parse(session.expiresAt) <= Date.now()) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function readDashboardSessionFromCookies(): Promise<DashboardSession | null> {
  const cookieValue = (await cookies()).get(COOKIE_NAME)?.value;
  if (!cookieValue) {
    return null;
  }
  return readDashboardSession(`${COOKIE_NAME}=${cookieValue}`);
}

export function authenticateDashboardUser(username: string, password: string): DashboardAuthUserConfig | null {
  const normalizedUsername = username.trim();
  const normalizedPassword = password;
  const users = parseUsers(process.env.NSTEP_DASHBOARD_AUTH_USERS);
  const match = users.find((user) => user.username === normalizedUsername && user.password === normalizedPassword);
  return match || null;
}

export function assertDashboardAccess(session: DashboardSession | null, pathname: string): DashboardSession {
  if (!session) {
    redirect(`/sign-in?next=${encodeURIComponent(pathname)}`);
  }

  const requiredRole = getRequiredDashboardRole(pathname);
  if (!isRoleAtLeast(session.role, requiredRole)) {
    redirect(`/dashboard?forbidden=${encodeURIComponent(pathname)}`);
  }

  return session;
}

export function getDashboardAuthHeaders(session: DashboardSession): Headers {
  const headers = new Headers();
  const internalToken = process.env.NSTEP_OS_INTERNAL_TOKEN?.trim();
  if (internalToken) {
    headers.set("authorization", `Bearer ${internalToken}`);
  }
  headers.set("x-nstep-role", session.role);
  headers.set("x-nstep-tenant-id", session.tenantId);
  headers.set("x-nstep-actor-id", session.username);
  headers.set("x-nstep-actor-name", session.displayName);
  return headers;
}

export function getDashboardSessionFromRequest(request: Request): DashboardSession | null {
  return readDashboardSession(request.headers.get("cookie"));
}

export function buildLoginDestination(nextPath: string | null | undefined): string {
  const sanitized = typeof nextPath === "string" && nextPath.startsWith("/") ? nextPath : "/dashboard";
  return sanitized;
}

export function parseDashboardLoginCredentials(formData: FormData | URLSearchParams | Record<string, string>): {
  readonly username: string;
  readonly password: string;
  readonly nextPath: string;
} {
  const username = readCredential(formData, "username");
  const password = readCredential(formData, "password");
  const nextPath = buildLoginDestination(readCredential(formData, "next"));
  return { username, password, nextPath };
}

function readCredential(input: FormData | URLSearchParams | Record<string, string>, key: string): string {
  if (input instanceof FormData) {
    return String(input.get(key) || "").trim();
  }
  if (input instanceof URLSearchParams) {
    return String(input.get(key) || "").trim();
  }
  return String(input[key] || "").trim();
}

export function isAuthorizedForRole(session: DashboardSession | null, pathname: string): boolean {
  if (!session) {
    return false;
  }
  return isRoleAtLeast(session.role, getRequiredDashboardRole(pathname));
}

export function extractCookie(cookieHeader: string | null | undefined, name: string): string | null {
  if (!cookieHeader) {
    return null;
  }
  const parts = cookieHeader.split(";").map((part) => part.trim());
  for (const part of parts) {
    const separator = part.indexOf("=");
    if (separator <= 0) {
      continue;
    }
    const key = part.slice(0, separator).trim();
    if (key === name) {
      return part.slice(separator + 1).trim();
    }
  }
  return null;
}

function cookieSecureFlag(): string {
  return process.env.NODE_ENV === "production" ? "; Secure" : "";
}
