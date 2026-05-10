import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { DashboardRole, DashboardSession } from "./auth-types";

const LEGACY_COOKIE_NAME = "nstep_dashboard_session";
const DEFAULT_AUTH_BASE_URL = "http://127.0.0.1:4173";
const DEFAULT_TENANT_ID = "default";
const DEFAULT_ALLOWED_ADMIN_ROLES = ["owner", "admin"] as const;
const DEFAULT_AUTH_COOKIE_NAMES = ["studio_session_token"] as const;
const LOCAL_DEV_AUTH_ENABLED_VALUE = "1";
const ROLE_ORDER: readonly DashboardRole[] = ["viewer", "analyst", "operator", "admin"];

type StudioAuthUser = {
  readonly id?: string;
  readonly email?: string;
  readonly role?: string;
  readonly display_name?: string | null;
};

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function isLocalDevMode(): boolean {
  return !isProduction();
}

// Kept for compatibility with prior UI labels and call sites.
export function isLocalDevAuthEnabled(): boolean {
  return isLocalDevMode() && process.env.NSTEP_DASHBOARD_LOCAL_DEV_AUTH?.trim() === LOCAL_DEV_AUTH_ENABLED_VALUE;
}

export function getDashboardAuthModeLabel(): "Local Dev" | "Production" {
  return isLocalDevAuthEnabled() ? "Local Dev" : "Production";
}

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function getAuthBaseUrl(): string {
  const configured =
    process.env.NSTEP_DASHBOARD_AUTH_BASE_URL?.trim() ||
    process.env.NSTEP_WEBSITE_BASE_URL?.trim() ||
    process.env.NSTEP_STUDIO_WEBSITE_URL?.trim();

  if (configured) {
    return trimTrailingSlash(configured);
  }

  if (!isProduction()) {
    return DEFAULT_AUTH_BASE_URL;
  }

  throw new Error(
    "NSTEP_DASHBOARD_AUTH_BASE_URL is required in production so the dashboard can validate existing website admin sessions.",
  );
}

function getUsersMeUrl(): string {
  return new URL("/api/users/me", `${getAuthBaseUrl()}/`).toString();
}

function getAllowedAdminRoles(): Set<string> {
  const configured = process.env.NSTEP_DASHBOARD_ALLOWED_ADMIN_ROLES?.trim();
  if (!configured) {
    return new Set(DEFAULT_ALLOWED_ADMIN_ROLES);
  }

  const values = configured
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return values.length > 0 ? new Set(values) : new Set(DEFAULT_ALLOWED_ADMIN_ROLES);
}

function getAllowedAuthCookieNames(): readonly string[] {
  const configured = process.env.NSTEP_DASHBOARD_AUTH_COOKIE_NAMES?.trim();
  if (!configured) {
    return DEFAULT_AUTH_COOKIE_NAMES;
  }

  const names = configured
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return names.length > 0 ? names : DEFAULT_AUTH_COOKIE_NAMES;
}

function buildFilteredCookieHeaderFromPairs(cookiePairs: readonly string[]): string {
  if (cookiePairs.length === 0) {
    return "";
  }

  const allowedNames = new Set(getAllowedAuthCookieNames());
  const filtered: string[] = [];
  for (const pair of cookiePairs) {
    const separator = pair.indexOf("=");
    if (separator <= 0) {
      continue;
    }
    const name = pair.slice(0, separator).trim();
    if (!allowedNames.has(name)) {
      continue;
    }
    filtered.push(pair);
  }

  return filtered.join("; ");
}

function buildFilteredCookieHeaderFromRaw(rawCookieHeader: string | null | undefined): string {
  if (!rawCookieHeader) {
    return "";
  }
  const parts = rawCookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
  return buildFilteredCookieHeaderFromPairs(parts);
}

function normalizeDashboardRole(role: string): DashboardRole {
  const normalizedRole = role.trim().toLowerCase();
  if (normalizedRole === "owner" || normalizedRole === "admin") {
    return "admin";
  }
  if (normalizedRole === "moderator") {
    return "operator";
  }
  return "viewer";
}

function roleRank(role: DashboardRole): number {
  return ROLE_ORDER.indexOf(role);
}

export function isRoleAtLeast(role: DashboardRole, minimum: DashboardRole): boolean {
  return roleRank(role) >= roleRank(minimum);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toDashboardSession(user: StudioAuthUser): DashboardSession | null {
  if (!user || typeof user !== "object") {
    return null;
  }

  const rawRole = isNonEmptyString(user.role) ? user.role.trim().toLowerCase() : "";
  if (!rawRole || !getAllowedAdminRoles().has(rawRole)) {
    return null;
  }

  const now = new Date();
  const issuedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();

  const email = isNonEmptyString(user.email) ? user.email.trim() : undefined;
  const username = isNonEmptyString(user.id) ? user.id.trim() : email;
  if (!username) {
    return null;
  }

  const displayName = isNonEmptyString(user.display_name) ? user.display_name.trim() : email || username;

  return {
    username,
    role: normalizeDashboardRole(rawRole),
    tenantId: process.env.NSTEP_DASHBOARD_TENANT_ID?.trim() || DEFAULT_TENANT_ID,
    displayName,
    email,
    issuedAt,
    expiresAt,
  };
}

function createLocalDevSession(): DashboardSession | null {
  if (!isLocalDevAuthEnabled()) {
    return null;
  }

  const username = process.env.NSTEP_DASHBOARD_LOCAL_DEV_USER?.trim();
  if (!username) {
    return null;
  }

  const email = process.env.NSTEP_DASHBOARD_LOCAL_DEV_EMAIL?.trim() || `${username}@local.dev`;
  const displayName = process.env.NSTEP_DASHBOARD_LOCAL_DEV_DISPLAY_NAME?.trim() || username;
  const tenantId =
    process.env.NSTEP_DASHBOARD_LOCAL_DEV_TENANT_ID?.trim() ||
    process.env.NSTEP_DASHBOARD_TENANT_ID?.trim() ||
    DEFAULT_TENANT_ID;

  const now = new Date();
  return {
    username,
    role: "admin",
    tenantId,
    displayName,
    email,
    issuedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
  };
}

const readDashboardSessionByCookieHeader = cache(async (cookieHeader: string): Promise<DashboardSession | null> => {
  if (!cookieHeader.trim()) {
    return createLocalDevSession();
  }

  let response: Response;
  try {
    response = await fetch(getUsersMeUrl(), {
      method: "GET",
      cache: "no-store",
      redirect: "manual",
      headers: {
        accept: "application/json",
        cookie: cookieHeader,
      },
    });
  } catch {
    return createLocalDevSession();
  }

  if (response.status === 401 || response.status === 403) {
    return createLocalDevSession();
  }

  if (!response.ok) {
    return createLocalDevSession();
  }

  const body = (await response.json().catch(() => null)) as StudioAuthUser | null;
  return toDashboardSession(body || {}) || createLocalDevSession();
});

export function normalizeDashboardPath(pathname: string): string {
  return pathname || "/dashboard";
}

export function getRequiredDashboardRole(pathname: string): DashboardRole {
  if (pathname.startsWith("/dashboard")) {
    return "admin";
  }
  return "viewer";
}

export function isPublicDashboardPath(pathname: string): boolean {
  return pathname === "/sign-in" || pathname.startsWith("/api/auth/");
}

export function clearSessionCookie(): string {
  return `${LEGACY_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${cookieSecureFlag()}`;
}

export function readDashboardSession(cookieHeader?: string | null): Promise<DashboardSession | null> {
  return readDashboardSessionByCookieHeader(cookieHeader || "");
}

export async function readDashboardSessionFromCookies(): Promise<DashboardSession | null> {
  const cookiePairs = (await cookies())
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`);

  const filteredCookieHeader = buildFilteredCookieHeaderFromPairs(cookiePairs);
  return readDashboardSessionByCookieHeader(filteredCookieHeader);
}

export function resolveDashboardAdminLoginUrl(): string {
  const configured = process.env.NSTEP_DASHBOARD_ADMIN_LOGIN_URL?.trim();
  if (configured) {
    return configured;
  }
  return new URL("/admin/login", `${getAuthBaseUrl()}/`).toString();
}

export function resolveDashboardAdminLogoutUrl(): string {
  const configured = process.env.NSTEP_DASHBOARD_ADMIN_LOGOUT_URL?.trim();
  if (configured) {
    return configured;
  }
  return new URL("/api/logout", `${getAuthBaseUrl()}/`).toString();
}

function buildAdminLoginRedirect(pathname: string): string {
  const loginUrl = new URL(resolveDashboardAdminLoginUrl());
  const nextParam = process.env.NSTEP_DASHBOARD_AFTER_LOGIN_URL?.trim();
  if (nextParam) {
    loginUrl.searchParams.set("next", nextParam);
  } else {
    loginUrl.searchParams.set("dashboard", buildLoginDestination(pathname));
  }
  return loginUrl.toString();
}

export function assertDashboardAccess(session: DashboardSession | null, pathname: string): DashboardSession {
  if (!session) {
    redirect(buildAdminLoginRedirect(pathname));
  }

  const requiredRole = getRequiredDashboardRole(pathname);
  if (!isRoleAtLeast(session.role, requiredRole)) {
    redirect(buildAdminLoginRedirect(pathname));
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

export function getDashboardSessionFromRequest(request: Request): Promise<DashboardSession | null> {
  return readDashboardSession(buildFilteredCookieHeaderFromRaw(request.headers.get("cookie")));
}

export function buildLoginDestination(nextPath: string | null | undefined): string {
  if (typeof nextPath === "string" && nextPath.startsWith("/dashboard")) {
    return nextPath;
  }
  return "/dashboard";
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
  return isProduction() ? "; Secure" : "";
}
