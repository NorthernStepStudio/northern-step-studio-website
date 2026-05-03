import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import Stripe from "stripe";
import community from "./community";
import featureToggles from "./feature-toggles";
import maintenance from "./maintenance";
import communityUploads from "./community-uploads";

// // import appShellHtml from "../../dist/index.html"; // Removed to avoid build-time stale asset issues
import { getDb } from "./db";
import { handleAiChat } from "./ai-assistant";
import { searchKnowledgeChunks, getKnowledgeLaneHealth } from "./knowledge";
import { sendEmail } from "./email";
import {
  contactSubmissionNotificationEmail,
  mentionNotificationEmail,
  studioInvitationEmail,


} from "./email-templates";
import { getRoleDisplayLabel, isElevatedRole, OWNER_EMAIL } from "../shared/auth";
import {
  authMiddleware,
  clearAuthSessions,
  createLocalSession,
  createPasswordCredentials,
  ensureDatabaseUser,
  getAuthenticatedUser,
  toLocalAppUser,
  verifyUserPassword,
  exchangeGoogleCodeForUser,
  getGoogleOAuthRedirectUrl,
  findDatabaseUserByEmail,
  validatePassword,
  type AppUser,
} from "./auth";
import { BUILD_META } from "../shared/build-meta";


export interface Env {
  GEMINI_API_KEY: string;
  ASSETS?: {
    fetch(request: Request): Promise<Response>;
  };
  [key: string]: any;
}

const app = new Hono<{ Bindings: Env; Variables: { user: AppUser } }>({ strict: false });
const CANONICAL_HOST = "northernstepstudio.com";
const WWW_HOST = "www.northernstepstudio.com";

function setNoStoreHeaders(headers: Headers) {
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  headers.set("CDN-Cache-Control", "no-store");
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");
}

function setImmutableAssetHeaders(headers: Headers) {
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("CDN-Cache-Control", "public, max-age=31536000, immutable");
}

function isStaticAssetPath(path: string) {
  return /\/assets\/.+\.[A-Za-z0-9]+$/.test(path);
}

function isHtmlNavigationRequest(c: Context) {
  if (c.req.method !== "GET" && c.req.method !== "HEAD") {
    return false;
  }

  const secFetchMode = c.req.header("sec-fetch-mode");
  if (secFetchMode === "navigate") {
    return true;
  }

  const accept = c.req.header("accept") || "";
  if (accept.includes("text/html")) {
    return true;
  }

  return !/\.[A-Za-z0-9]+$/.test(c.req.path);
}

function withStaticResponseHeaders(path: string, response: Response) {
  const finalResponse = new Response(response.body, response);

  if (isStaticAssetPath(path)) {
    setImmutableAssetHeaders(finalResponse.headers);
    return finalResponse;
  }

  const contentType = finalResponse.headers.get("content-type") || "";
  if (contentType.includes("text/html")) {
    setNoStoreHeaders(finalResponse.headers);
  }

  return finalResponse;
}

async function serveAssetResponse(c: Context) {
  if (!c.env.ASSETS || typeof c.env.ASSETS.fetch !== "function") {
    return c.text("Static assets binding unavailable. Check Wrangler assets configuration.", 500);
  }

  const assetResponse = await c.env.ASSETS.fetch(c.req.raw);
  if (assetResponse.status !== 404) {
    return withStaticResponseHeaders(c.req.path, assetResponse);
  }

  if (!isHtmlNavigationRequest(c)) {
    return assetResponse;
  }

  const indexUrl = new URL("/", c.req.url);
  const indexRequest = new Request(indexUrl.toString(), c.req.raw);
  const indexResponse = await c.env.ASSETS.fetch(indexRequest);
  return withStaticResponseHeaders("/", indexResponse);
}

app.use("*", async (c, next) => {
  const url = new URL(c.req.url);
  if (url.hostname === WWW_HOST) {
    url.hostname = CANONICAL_HOST;
    return Response.redirect(url.toString(), 308);
  }

  await next();
});

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) {
        return undefined;
      }

      const allowedOrigins = new Set([
        "https://northernstepstudio.com",
        "https://www.northernstepstudio.com",
        "https://nexus-api.northernstepstudio.com",
        "https://nstep-mgboard.pages.dev",
        "http://localhost:8090",
        "http://127.0.0.1:8090",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:19006",
        "http://127.0.0.1:19006",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
      ]);

      if (allowedOrigins.has(origin) || origin.endsWith(".northernstepstudio.com")) {
        return origin;
      }

      return undefined;
    },
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.use("*", async (c, next) => {
  await next();

  c.res.headers.set("X-NSS-Build", BUILD_META.buildId);
  c.res.headers.set("X-NSS-Version", BUILD_META.version);
  c.res.headers.set("X-NSS-Commit", BUILD_META.gitShortSha);

  if (c.req.path.startsWith("/api")) {
    setNoStoreHeaders(c.res.headers);
  }
});

app.get("/api/health", (c) => {
  const requestUrl = new URL(c.req.url);
  return c.json({
    status: "ok",
    service: "northern-step-studio-website",
    build: BUILD_META,
    request: {
      path: c.req.path,
      url: c.req.url,
      host: requestUrl.host,
    },
    deployment: {
      canonicalHost: CANONICAL_HOST,
      workersDevEnabled: false,
      assetMode: "worker-first",
      spaFallback: "index.html",
    },
    environment: {
      databaseConfigured: Boolean(c.env.DB || c.env.SUPABASE_DB_URL || c.env.DATABASE_URL),
      databaseMode: c.env.SUPABASE_DB_URL || c.env.DATABASE_URL ? "postgres" : c.env.DB ? "d1" : "none",
      googleAuthConfigured: Boolean(c.env.GOOGLE_CLIENT_ID && c.env.GOOGLE_CLIENT_SECRET),
      geminiConfigured: Boolean(c.env.GEMINI_API_KEY && c.env.GEMINI_API_KEY.trim()),
    },
    timestamp: new Date().toISOString(),
  });
});

app.all("/api", (c) =>
  c.json({
    status: "ok",
    service: "northern-step-studio-website",
    path: c.req.path,
  }),
);

app.all("/api/", (c) =>
  c.json({
    status: "ok",
    service: "northern-step-studio-website",
    path: c.req.path,
  }),
);

app.get("/api/ping", (c) => c.json({ status: "pong", path: c.req.path }));

// NexusBuild Proxy (placed first for precedence)
app.all("/api/nexus/*", async (c) => {
  // Previously: https://nexusbuild-backend-worker.northernstep.workers.dev
  // Updated to prospective Vercel-hosted Nexus API
  const backendUrl = c.env.NEXUS_API_URL || "https://nexus-api.northernstepstudio.com";
  const url = new URL(c.req.url);
  const targetPath = url.pathname.replace("/api/nexus", "/api");
  const targetUrl = `${backendUrl}${targetPath}${url.search}`;

  try {
    const headers = new Headers(c.req.header());
    headers.set("host", new URL(backendUrl).hostname);

    const response = await fetch(targetUrl, {
      method: c.req.method,
      headers: headers,
      body: c.req.method !== "GET" && c.req.method !== "HEAD" ? await c.req.raw.blob() : undefined,
    });

    const proxyResponse = new Response(response.body, response);
    proxyResponse.headers.set("X-Proxied-By", "Northern Step Studio Worker");
    proxyResponse.headers.set("X-Proxy-Target", targetUrl);
    return proxyResponse;
  } catch (error) {
    return c.json({ error: "NexusBuild Backend Unavailable", detail: error instanceof Error ? error.message : String(error) }, 502);
  }
});

// (Routes moved to end of file for diagnostic visibility)

// Global Error Handler (Ensures all errors return JSON to the frontend)
app.onError((err, c) => {
  console.error(`[Worker Error] ${err.message}`, err);
  
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  const status = (err as any).status || 500;
  return c.json({ 
    error: err.message || "Internal Server Error",
    path: c.req.path,
    url: c.req.url, // Help diagnose host/protocol issues
    stack: (c.env as any).NODE_ENV === "development" ? err.stack : undefined
  }, status as any);
});

// (notFound moved to end)

function getStripe(env: Env) {
  const apiKey = typeof env.STRIPE_SECRET_KEY === "string" ? env.STRIPE_SECRET_KEY.trim() : "";
  if (!apiKey) {
    return null;
  }

  return new Stripe(apiKey);
}

const STRIPE_SECRET_ENV = "STRIPE_SECRET_KEY";

function stripeUnavailableResponse() {
  return {
    configured: false,
    missingEnv: STRIPE_SECRET_ENV,
  };
}

// Create an API-scoped app
// (api instance removed - using app directly)

const STUDIO_CONTACT_EMAIL = "hello@northernstepstudio.com";
const STUDIO_SUPPORT_EMAIL = "hello@northernstepstudio.com";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUPPORT_REQUEST_PATTERN = /\b(support|bug|error|issue|billing|account|login|password|refund|problem|help)\b/i;




type AppProgressItem = {
  text: string;
  completed: boolean;
};

type AppPayloadInput = Record<string, unknown>;
type AppRecord = Record<string, unknown>;

function normalizeEmailAddress(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeSingleLineText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function normalizeMultilineText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\r\n/g, "\n").trim().slice(0, maxLength);
}




function isValidEmailAddress(email: string) {
  return EMAIL_REGEX.test(email);
}

function getLoginErrorMessage(email: string, adminOnly: boolean) {
  if (adminOnly) {
    return email === OWNER_EMAIL
      ? "No owner account exists yet. On localhost, your first successful admin password sign-in can create it automatically. Otherwise, sign in with Google first or have the account created before using password login."
      : "No admin account exists for this email yet. Use Google first if the account is linked there, or ask the owner to invite this address before using password login.";
  }

  return "No account exists for this email yet. Sign in with Google first if this account started on Google, or ask the team to create your account before using password login.";
}

function isLocalhostRequest(requestUrl: string) {
  const hostname = new URL(requestUrl).hostname;
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

async function bootstrapLocalOwnerPasswordLogin(
  c: Context<{ Bindings: Env; Variables: { user: AppUser } }>,
  email: string,
  password: string,
) {
  if (!isLocalhostRequest(c.req.url) || email !== OWNER_EMAIL) {
    return null;
  }

  const sql = getDb(c.env);
  const [totalUsersRow] = await sql<{ total: string }[]>`SELECT COUNT(*) AS total FROM users`;
  const totalUsers = Number(totalUsersRow?.total ?? 0);
  if (totalUsers !== 0) {
    return null;
  }

  if (!validatePassword(password)) {
    throw new Error("Password must be at least 8 characters long to create the local owner account.");
  }

  const credentials = await createPasswordCredentials(password);
  await sql`
    INSERT INTO users (email, role, display_name, password_hash, password_salt)
    VALUES (${email}, 'owner', 'Northern Step Studio', ${credentials.password_hash}, ${credentials.password_salt})
  `;

  const [newUser] = await sql`SELECT * FROM users WHERE email = ${email}`;
  return newUser;
}

async function handlePasswordLogin(
  c: Context<{ Bindings: Env; Variables: { user: AppUser } }>,
  options: { adminOnly?: boolean } = {},
) {
  const adminOnly = options.adminOnly === true;
  const body = await c.req.json().catch(() => null);
  const email = normalizeEmailAddress(body?.email);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return c.json({ error: "Email and password are required." }, 400);
  }

  const sql = getDb(c.env);
  let [dbUser] = await sql<any[]>`SELECT * FROM users WHERE email = ${email}`;

  if (adminOnly && !dbUser) {
    // Standard localhost owner bootstrapping
    dbUser = await bootstrapLocalOwnerPasswordLogin(c, email, password);
  }

  if (!dbUser) {
    return c.json({ error: getLoginErrorMessage(email, adminOnly) }, 404);
  }

  if (!dbUser.password_hash || !dbUser.password_salt) {
    return c.json(
      {
        error:
          "Account setup incomplete. Please contact the administrator to enable your password access.",
      },
      409,
    );
  }

  const isValidPassword = await verifyUserPassword(dbUser, password);
  if (!isValidPassword) {
    return c.json({ error: "Incorrect email or password." }, 401);
  }

  if (dbUser.email === OWNER_EMAIL && dbUser.role !== "owner") {
    dbUser = await ensureDatabaseUser(c.env, dbUser.email, dbUser.display_name);
  }

  if (adminOnly && !isElevatedRole(dbUser.role)) {
    return c.json({ error: "Admin access required for this account." }, 403);
  }

  await clearAuthSessions(c);
  await createLocalSession(c, dbUser.id);

  return c.json({ success: true, user: toLocalAppUser(dbUser) }, 200);
}

async function handlePasswordRegistration(c: Context<{ Bindings: Env; Variables: { user: AppUser } }>) {
  return c.json({ error: "Public registration is currently disabled. Contact an administrator for access." }, 403);
}

// (Duplicate routes removed - consolidate definitions below)

function resolveContactDestination(subject: string, message: string) {
  return SUPPORT_REQUEST_PATTERN.test(`${subject}\n${message}`) ? STUDIO_SUPPORT_EMAIL : STUDIO_CONTACT_EMAIL;
}



function parseJsonArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function parseProgressItems(value: unknown) {
  return parseJsonArray<Partial<AppProgressItem>>(value)
    .map((item) => {
      if (typeof item?.text !== "string" || !item.text.trim()) {
        return null;
      }

      return {
        text: item.text.trim(),
        completed: Boolean(item.completed),
      };
    })
    .filter((item): item is AppProgressItem => Boolean(item));
}

function normalizeAppStatus(status: unknown) {
  const value = typeof status === "string" ? status.trim().toUpperCase().replace(/\s+/g, "_") : "";
  if (!value) return "COMING_SOON";
  return value === "COMING SOON" ? "COMING_SOON" : value;
}

function normalizeAppCategory(category: unknown) {
  const value = typeof category === "string" ? category.trim().toUpperCase() : "";
  return value || "TOOL";
}

function normalizeVisibility(visibility: unknown) {
  const value = typeof visibility === "string" ? visibility.trim().toLowerCase() : "";
  return value === "published" || value === "hidden" ? value : "draft";
}

function normalizePlatform(platform: unknown) {
  const value = typeof platform === "string" ? platform.trim().toLowerCase() : "";
  return value === "desktop" || value === "web" ? value : "mobile";
}

function normalizeMonetization(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "Free";
}

function defaultStatusLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeAppPayload(body: AppPayloadInput) {
  const progress = parseProgressItems(body.progress);
  const status = normalizeAppStatus(body.status);
  const progressPercent = Math.max(0, Math.min(100, Number(body.progress_percent ?? 0) || 0));

  return {
    name: typeof body.name === "string" ? body.name.trim() : "",
    slug:
      typeof body.slug === "string"
        ? body.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
        : "",
    tagline: typeof body.tagline === "string" && body.tagline.trim() ? body.tagline.trim() : null,
    description: typeof body.description === "string" ? body.description.trim() : "",
    full_description:
      typeof body.full_description === "string" && body.full_description.trim() ? body.full_description.trim() : null,
    category: normalizeAppCategory(body.category),
    status,
    status_label:
      typeof body.status_label === "string" && body.status_label.trim()
        ? body.status_label.trim()
        : defaultStatusLabel(status),
    target_date:
      typeof body.target_date === "string" && body.target_date.trim() ? body.target_date.trim() : null,
    tech_stack: parseJsonArray<string>(body.tech_stack).filter((item) => typeof item === "string" && item.trim()),
    progress,
    logo: typeof body.logo === "string" && body.logo.trim() ? body.logo.trim() : null,
    screenshots: parseJsonArray<string>(body.screenshots).filter((item) => typeof item === "string" && item.trim()),
    cta_url: typeof body.cta_url === "string" && body.cta_url.trim() ? body.cta_url.trim() : null,
    video_url: typeof body.video_url === "string" && body.video_url.trim() ? body.video_url.trim() : null,
    features: parseJsonArray<string>(body.features).filter((item) => typeof item === "string" && item.trim()),
    platform: normalizePlatform(body.platform),
    visibility: normalizeVisibility(body.visibility),
    progress_percent: progressPercent,
    monetization: normalizeMonetization(body.monetization),
  };
}

function mapAppRecord(row: AppRecord) {
  const progress = parseProgressItems(row.progress);
  const progressPercent = Math.max(0, Math.min(100, Number(row.progress_percent ?? 0) || 0));

  return {
    ...row,
    category: normalizeAppCategory(row.category),
    status: normalizeAppStatus(row.status),
    status_label:
      typeof row.status_label === "string" && row.status_label.trim()
        ? row.status_label.trim()
        : defaultStatusLabel(normalizeAppStatus(row.status)),
    visibility: normalizeVisibility(row.visibility),
    platform: normalizePlatform(row.platform),
    monetization: normalizeMonetization(row.monetization),
    screenshots: parseJsonArray<string>(row.screenshots),
    features: parseJsonArray<string>(row.features),
    tech_stack: parseJsonArray<string>(row.tech_stack),
    progress,
    progress_percent: progressPercent,
  };
}

async function getCurrentRole(c: Context<{ Bindings: Env; Variables: { user: AppUser } }>) {
  const authUser = c.get("user");
  if (!authUser) {
    return "user";
  }

  const sql = getDb(c.env);
  const [dbUser] = await sql<{ role: string }[]>`SELECT role FROM users WHERE email = ${authUser.email}`;
  return dbUser?.role || (authUser.email === OWNER_EMAIL ? "owner" : "user");
}

async function requireRole(c: Context<{ Bindings: Env; Variables: { user: AppUser } }>, allowedRoles: string[]) {
  const role = await getCurrentRole(c);
  if (!allowedRoles.includes(role)) {
    return null;
  }

  return role;
}

type EnvLookup = {
  key: string | null;
  value: string | null;
};

type IntegrationCheck = {
  expected: string[];
  readPath: string;
  detectedName: string | null;
  configured: boolean;
  reason: string | null;
  ready?: boolean;
};

function getFirstConfiguredEnv(env: Env, candidates: string[]): EnvLookup {
  for (const key of candidates) {
    const value = env[key];
    if (typeof value === "string" && value.trim()) {
      return { key, value: value.trim() };
    }
  }

  return { key: null, value: null };
}

function resolveMgboardUrl(env: Env, requestUrl: string) {
  const configured = typeof env.MGBOARD_URL === "string" ? env.MGBOARD_URL.trim() : "";
  if (configured) {
    return { url: configured, source: "env" };
  }

  if (isLocalhostRequest(requestUrl)) {
    return { url: "http://localhost:8090", source: "localhost-default" };
  }

  // Production-safe fallback when MGBOARD_URL is missing.
  return { url: "https://nstep-mgboard.pages.dev", source: "fallback" };
}

function getSupabaseProjectRefFromUrl(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const host = new URL(value).hostname.toLowerCase();
    if (host.endsWith(".supabase.co")) {
      const [projectRef] = host.split(".");
      return projectRef || null;
    }
  } catch {
    return null;
  }

  return null;
}

function getInvalidBindingReason(bindingName: string, expectedDescription: string) {
  return `Binding \`${bindingName}\` is present but does not match expected runtime shape (${expectedDescription}).`;
}

async function getIntegrationStatus(env: Env) {
  const d1ReadPath = "src/worker/index.ts#getIntegrationStatus -> env.DB";
  const d1ConnectivityReadPath = "src/worker/index.ts#getIntegrationStatus -> env.DB.prepare('SELECT 1 as ok')";
  const r2ReadPath = "src/worker/index.ts#getIntegrationStatus -> env.R2_BUCKET";
  const assetsReadPath = "src/worker/index.ts#getIntegrationStatus -> env.ASSETS";

  const d1BindingPresent = Boolean(env.DB);
  const d1BindingConfigured = Boolean(env.DB && typeof env.DB.prepare === "function");
  const d1BindingReason = !d1BindingPresent
    ? "Expected D1 binding `DB` was not found in the Worker runtime."
    : !d1BindingConfigured
      ? getInvalidBindingReason("DB", "D1 Database binding with a `prepare()` method")
      : null;

  let d1Connected = false;
  let d1ConnectivityReason: string | null = null;
  if (d1BindingConfigured) {
    try {
      const statement = env.DB.prepare("SELECT 1 as ok");
      if (statement && typeof statement.first === "function") {
        const row = await statement.first();
        d1Connected = Number(row?.ok) === 1;
      } else if (statement && typeof statement.all === "function") {
        const result = await statement.all();
        const row = Array.isArray(result?.results) ? result.results[0] : undefined;
        d1Connected = Number(row?.ok) === 1;
      } else {
        d1Connected = false;
        d1ConnectivityReason = "D1 statement probe did not expose `first()` or `all()`.";
      }

      if (!d1Connected && !d1ConnectivityReason) {
        d1ConnectivityReason = "D1 probe returned an unexpected result payload.";
      }
    } catch (error) {
      d1Connected = false;
      d1ConnectivityReason = error instanceof Error ? error.message : "Unknown D1 probe error";
    }
  } else {
    d1ConnectivityReason = "Skipped because D1 binding `DB` is not configured.";
  }

  const r2BindingPresent = Boolean(env.R2_BUCKET);
  const r2Configured = Boolean(
    env.R2_BUCKET &&
    typeof env.R2_BUCKET.get === "function" &&
    typeof env.R2_BUCKET.put === "function" &&
    typeof env.R2_BUCKET.delete === "function",
  );
  const r2Reason = !r2BindingPresent
    ? "Expected R2 binding `R2_BUCKET` is missing."
    : !r2Configured
      ? getInvalidBindingReason("R2_BUCKET", "R2 bucket binding with `get()`, `put()`, and `delete()`")
      : null;

  const assetsBinding = env.ASSETS;
  const assetsBindingPresent = Boolean(assetsBinding);
  const assetsConfigured = Boolean(assetsBinding && typeof assetsBinding.fetch === "function");
  let assetsReady = false;
  let assetsReason: string | null = null;

  if (!assetsBindingPresent) {
    assetsReason = "Expected Workers Assets binding `ASSETS` is missing.";
  } else if (!assetsConfigured) {
    assetsReason = getInvalidBindingReason("ASSETS", "Workers Assets fetcher with a `fetch()` method");
  } else {
    try {
      const assetsFetcher = assetsBinding as NonNullable<Env["ASSETS"]>;
      const probeRequest = new Request("https://northernstepstudio.com/", {
        method: "HEAD",
        headers: { accept: "text/html" },
      });
      const probeResponse = await assetsFetcher.fetch(probeRequest);
      assetsReady = probeResponse.ok || probeResponse.status === 304;
      if (!assetsReady) {
        assetsReason = `ASSETS probe returned ${probeResponse.status} ${probeResponse.statusText}`;
      }
    } catch (error) {
      assetsReady = false;
      assetsReason = error instanceof Error ? error.message : "Unknown ASSETS probe error";
    }
  }

  const supabaseUrlLookup = getFirstConfiguredEnv(env, [
    "SUPABASE_URL",
    "VITE_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
  ]);
  const supabaseAnonLookup = getFirstConfiguredEnv(env, [
    "SUPABASE_ANON_KEY",
    "VITE_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_PUBLIC_ANON_KEY",
  ]);
  const supabaseServiceRoleLookup = getFirstConfiguredEnv(env, [
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SECRET_KEY",
  ]);
  const supabaseProjectRefLookup = getFirstConfiguredEnv(env, [
    "SUPABASE_PROJECT_REF",
    "VITE_SUPABASE_PROJECT_REF",
    "NEXT_PUBLIC_SUPABASE_PROJECT_REF",
    "SUPABASE_REF",
  ]);

  const derivedProjectRef = supabaseProjectRefLookup.value ? null : getSupabaseProjectRefFromUrl(supabaseUrlLookup.value);
  const supabaseProjectRef = supabaseProjectRefLookup.value || derivedProjectRef;
  const supabaseProjectRefSource = supabaseProjectRefLookup.key || (derivedProjectRef ? "derived_from_SUPABASE_URL" : null);

  let supabaseHost: string | null = null;
  if (supabaseUrlLookup.value) {
    try {
      supabaseHost = new URL(supabaseUrlLookup.value).host;
    } catch {
      supabaseHost = null;
    }
  }

  const supabaseConnectionApiKey = supabaseServiceRoleLookup.value || supabaseAnonLookup.value;
  let supabaseConnectionStatus: "not_configured" | "ready" | "failed" = "not_configured";
  let supabaseConnectionError: string | null = null;

  if (supabaseUrlLookup.value && supabaseConnectionApiKey) {
    try {
      const response = await fetch(new URL("/auth/v1/settings", supabaseUrlLookup.value).toString(), {
        headers: {
          apikey: supabaseConnectionApiKey,
          Authorization: `Bearer ${supabaseConnectionApiKey}`,
        },
      });

      if (response.ok) {
        supabaseConnectionStatus = "ready";
      } else {
        supabaseConnectionStatus = "failed";
        supabaseConnectionError = `${response.status} ${response.statusText}`;
      }
    } catch (error) {
      supabaseConnectionStatus = "failed";
      supabaseConnectionError = error instanceof Error ? error.message : "Unknown error";
    }
  } else {
    const missingParts = [
      !supabaseUrlLookup.value ? "SUPABASE_URL" : null,
      !supabaseConnectionApiKey ? "SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY" : null,
    ].filter(Boolean);
    supabaseConnectionError = missingParts.length ? `Missing ${missingParts.join(" and ")} for connection check.` : null;
  }

  const cloudflareDiagnostics: Record<string, IntegrationCheck> = {
    d1Binding: {
      expected: ["DB"],
      readPath: d1ReadPath,
      detectedName: d1BindingPresent ? "DB" : null,
      configured: d1BindingConfigured,
      reason: d1BindingReason,
    },
    d1Connectivity: {
      expected: ["DB"],
      readPath: d1ConnectivityReadPath,
      detectedName: d1BindingPresent ? "DB" : null,
      configured: d1BindingConfigured,
      ready: d1Connected,
      reason: d1ConnectivityReason,
    },
    r2Binding: {
      expected: ["R2_BUCKET"],
      readPath: r2ReadPath,
      detectedName: r2BindingPresent ? "R2_BUCKET" : null,
      configured: r2Configured,
      reason: r2Reason,
    },
    assetsBinding: {
      expected: ["ASSETS"],
      readPath: assetsReadPath,
      detectedName: assetsBindingPresent ? "ASSETS" : null,
      configured: assetsConfigured,
      ready: assetsReady,
      reason: assetsReason,
    },
    emailService: {
      expected: ["sendEmail helper (DB-backed logger mode)"],
      readPath: "src/worker/email.ts#sendEmail",
      detectedName: "sendEmail",
      configured: true,
      reason: "Email currently runs in DB-backed logger mode; no external provider binding is required.",
      ready: true,
    },
  };

  const supabaseDiagnostics: Record<string, IntegrationCheck> = {
    url: {
      expected: ["SUPABASE_URL", "VITE_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"],
      readPath: "src/worker/index.ts#getIntegrationStatus -> getFirstConfiguredEnv(env, [...SUPABASE_URL aliases])",
      detectedName: supabaseUrlLookup.key,
      configured: Boolean(supabaseUrlLookup.value),
      reason: supabaseUrlLookup.value ? null : "No Supabase URL env var was found in supported aliases.",
    },
    anonKey: {
      expected: [
        "SUPABASE_ANON_KEY",
        "VITE_SUPABASE_ANON_KEY",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_PUBLIC_ANON_KEY",
      ],
      readPath: "src/worker/index.ts#getIntegrationStatus -> getFirstConfiguredEnv(env, [...SUPABASE_ANON_KEY aliases])",
      detectedName: supabaseAnonLookup.key,
      configured: Boolean(supabaseAnonLookup.value),
      reason: supabaseAnonLookup.value ? null : "No Supabase anon key env var was found in supported aliases.",
    },
    serviceRoleKey: {
      expected: ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY"],
      readPath: "src/worker/index.ts#getIntegrationStatus -> getFirstConfiguredEnv(env, [...service role aliases])",
      detectedName: supabaseServiceRoleLookup.key,
      configured: Boolean(supabaseServiceRoleLookup.value),
      reason: supabaseServiceRoleLookup.value ? null : "No Supabase service-role key was found in supported aliases.",
    },
    projectRef: {
      expected: [
        "SUPABASE_PROJECT_REF",
        "VITE_SUPABASE_PROJECT_REF",
        "NEXT_PUBLIC_SUPABASE_PROJECT_REF",
        "SUPABASE_REF",
        "derived from SUPABASE_URL host",
      ],
      readPath: "src/worker/index.ts#getIntegrationStatus -> getFirstConfiguredEnv(env, [...project-ref aliases]) / getSupabaseProjectRefFromUrl",
      detectedName: supabaseProjectRefSource,
      configured: Boolean(supabaseProjectRef),
      reason: supabaseProjectRef
        ? null
        : "Project ref was not found in env vars and could not be derived from SUPABASE_URL.",
    },
    connection: {
      expected: ["SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY fallback)"],
      readPath: "src/worker/index.ts#getIntegrationStatus -> fetch(new URL('/auth/v1/settings', SUPABASE_URL))",
      detectedName: supabaseServiceRoleLookup.key || supabaseAnonLookup.key,
      configured: Boolean(supabaseUrlLookup.value && supabaseConnectionApiKey),
      ready: supabaseConnectionStatus === "ready",
      reason:
        supabaseConnectionStatus === "ready"
          ? null
          : supabaseConnectionError || "Supabase connection check is not configured.",
    },
  };

  return {
    cloudflare: {
      d1Configured: d1BindingConfigured,
      d1Connected,
      r2Configured,
      assetsConfigured,
      emailServiceConfigured: true,
      diagnostics: cloudflareDiagnostics,
    },
    supabase: {
      urlConfigured: Boolean(supabaseUrlLookup.value),
      anonKeyConfigured: Boolean(supabaseAnonLookup.value),
      serviceRoleKeyConfigured: Boolean(supabaseServiceRoleLookup.value),
      projectRefConfigured: Boolean(supabaseProjectRef),
      host: supabaseHost,
      connectionStatus: supabaseConnectionStatus,
      connectionError: supabaseConnectionError,
      resolvedEnv: {
        url: supabaseUrlLookup.key,
        anonKey: supabaseAnonLookup.key,
        serviceRoleKey: supabaseServiceRoleLookup.key,
        projectRef: supabaseProjectRefSource,
      },
      diagnostics: supabaseDiagnostics,
    },
    auth: {
      googleConfigured: Boolean(env.GOOGLE_CLIENT_ID),
      localPasswordEnabled: true,
    },
    billing: {
      stripeConfigured: Boolean(typeof env.STRIPE_SECRET_KEY === "string" && env.STRIPE_SECRET_KEY.trim()),
    },
  };
}

async function shouldSendMentionEmail(env: Env, userId: number) {
  const sql = getDb(env);
  const [prefs] = await sql<{ email_mentions: boolean }[]>`
    SELECT email_mentions FROM user_preferences WHERE user_id = ${userId}
  `;

  return prefs ? prefs.email_mentions : true;
}

async function getNotificationReferenceDetails(env: Env, referenceType: string, referenceId: number) {
  const sql = getDb(env);
  switch (referenceType) {
    case "note": {
      const [note] = await sql<{ title: string | null }[]>`
        SELECT title FROM studio_notes WHERE id = ${referenceId}
      `;

      return {
        label: "a studio note",
        title: note?.title ?? null,
        path: "/admin/studio",
      };
    }
    case "blog_post": {
      const [post] = await sql<{ title: string | null, slug: string | null }[]>`
        SELECT title, slug FROM blog_posts WHERE id = ${referenceId}
      `;

      return {
        label: "a blog post",
        title: post?.title ?? null,
        path: post?.slug ? `/blog/${post.slug}` : "/blog",
      };
    }
    case "community_thread": {
      const [thread] = await sql<{ title: string | null, slug: string | null }[]>`
        SELECT title, slug FROM community_threads WHERE id = ${referenceId}
      `;

      return {
        label: "a community thread",
        title: thread?.title ?? null,
        path: thread?.slug ? `/community/thread/${thread.slug}` : "/community",
      };
    }
    case "community_post": {
      const [post] = await sql<{ title: string | null, slug: string | null }[]>`
        SELECT ct.title, ct.slug
         FROM community_posts cp
         LEFT JOIN community_threads ct ON cp.thread_id = ct.id
         WHERE cp.id = ${referenceId}
      `;

      return {
        label: "a community reply",
        title: post?.title ?? null,
        path: post?.slug ? `/community/thread/${post.slug}` : "/community",
      };
    }
    default:
      return {
        label: "your account",
        title: null,
        path: "/profile",
      };
  }
}

app.get("/api/integrations/status", authMiddleware, async (c) => {
  const role = await requireRole(c, ["owner", "admin"]);
  if (!role) {
    return c.json({ error: "Forbidden" }, 403);
  }

  return c.json(await getIntegrationStatus(c.env));
});

app.get("/api/integrations/mgboard", authMiddleware, async (c) => {
  const role = await requireRole(c, ["owner", "admin"]);
  if (!role) {
    return c.json({ error: "Forbidden" }, 403);
  }

  return c.json(resolveMgboardUrl(c.env, c.req.url));
});

// Current user endpoint (used by frontend auth)
app.get("/api/users/me", async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) {
    return c.json(null, 401);
  }
  return c.json(user);
});

// Logout
app.get("/api/logout", async (c) => {
  await clearAuthSessions(c);

  return c.json({ success: true }, 200);
});

// Google OAuth disabled by owner
app.get("/api/oauth/google/redirect_url", (c) => c.json({ error: "Google OAuth is disabled." }, 403));
app.get("/api/oauth/google/callback", (c) => c.json({ error: "Google OAuth is disabled." }, 403));

app.post("/api/sessions", (c) => c.json({ error: "Google sessions are disabled." }, 403));

app.post("/api/auth/login", async (c) => {
  try {
    return await handlePasswordLogin(c);
  } catch (error) {
    console.error("Password login failed:", error);
    return c.json({ error: "Unable to sign in with email and password right now." }, 500);
  }
});

app.post("/api/auth/register", async (c) => {
  try {
    return await handlePasswordRegistration(c);
  } catch (error) {
    console.error("Password registration failed:", error);
    return c.json({ error: "Unable to create your account right now." }, 500);
  }
});

app.post("/api/auth/admin-login", async (c) => {
  try {
    return await handlePasswordLogin(c, { adminOnly: true });
  } catch (error) {
    console.error("Admin password login failed:", error);
    return c.json({ 
      error: "Unable to sign in to the admin console right now.",
      detail: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

app.post("/api/contact", async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    const name = normalizeSingleLineText(body?.name, 120);
    const email = normalizeEmailAddress(body?.email);
    const subject = normalizeSingleLineText(body?.subject, 160);
    const message = normalizeMultilineText(body?.message, 5000);
    const source = normalizeSingleLineText(body?.source, 80) || "contact_page";
    const intent = normalizeSingleLineText(body?.intent, 80) || "general-support";
    const requestedTier = normalizeSingleLineText(body?.requestedTier, 40) || null;
    const industry = normalizeSingleLineText(body?.industry, 120);

    if (!name || !email || !subject || !message) {
      return c.json({ error: "Name, email, subject, and message are required." }, 400);
    }

    if (!isValidEmailAddress(email)) {
      return c.json({ error: "Enter a valid email address." }, 400);
    }

    const messageWithContactMeta = [
      message,
      "",
      "---",
      `Source: ${source}`,
      `Subject: ${subject}`,
      `Industry: ${industry || "Not provided"}`,
    ].join("\n");

    const destinationEmail = resolveContactDestination(subject, message);
    const sql = getDb(c.env);
    const [inserted] = await sql<{ id: number }[]>`
      INSERT INTO contact_messages (
         name,
         email,
         subject,
         message,
         destination_email,
         source,
         intent,
         requested_tier,
         industry,
         status
       )
       VALUES (
         ${name}, ${email}, ${subject}, ${messageWithContactMeta}, 
         ${destinationEmail}, ${source}, ${intent}, 
         ${requestedTier}, ${industry || null}, 'new'
       )
       RETURNING id
    `;

    const messageId = inserted.id;
    let emailSent = false;
    let emailError: string | null = null;
    let providerMessageId: string | null = null;

    try {
      const sendResult = await sendEmail(c.env, {
        to: destinationEmail,
        subject: `[Contact] ${subject}`,
        reply_to: email,
        html_body: contactSubmissionNotificationEmail({
          name,
          email,
          subject,
          message,
        }),
        text_body: [
          "New contact submission from Northern Step Studio",
          "",
          `Name: ${name}`,
          `Email: ${email}`,
          `Source: ${source}`,
          `Industry: ${industry || "Not provided"}`,
          `Subject: ${subject}`,
          `Reply-To: ${email}`,
          "",
          message,
        ].join("\n"),
      });

      emailSent = sendResult.success;
      providerMessageId = sendResult.message_id || null;
      if (!emailSent) {
        emailError = sendResult.error || "Email service did not confirm delivery";
      }
    } catch (error) {
      emailError = error instanceof Error ? error.message : "Failed to forward contact message";
    }

    await sql`
      UPDATE contact_messages
      SET email_sent = ${emailSent ? true : false}, email_error = ${emailError}, 
          email_message_id = ${providerMessageId}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${messageId}
    `;

    return c.json(
      {
        success: true,
        id: messageId,
        email_sent: emailSent,
        email_error: emailError,
        destination_email: destinationEmail,
        delivery_status: emailSent ? "sent" : "saved_only",
      },
      201,
    );
  } catch (error) {
    console.error("Failed to save contact message:", error);
    return c.json({ error: "Failed to send your message right now." }, 500);
  }
});


// Apps CRUD
// Design: INTEGER id for compatibility, UUID for stable internal refs, slug for public routes
app.get("/api/apps", async (c) => {
  let includeDrafts = false;
  try {
    const user = await getAuthenticatedUser(c);
    includeDrafts = Boolean(user && isElevatedRole(user.role));
  } catch {
    includeDrafts = false;
  }

  const sql = getDb(c.env);
  const results = includeDrafts
    ? await sql`SELECT * FROM apps ORDER BY created_at DESC`
    : await sql`SELECT * FROM apps WHERE visibility != 'hidden' ORDER BY created_at DESC`;

  const apps = (results as any[]).map((app: any) => mapAppRecord(app as AppRecord));

  return c.json(apps);
});

// Site Content CMS Routes
app.get("/api/site-content/:key", async (c) => {
  const key = c.req.param("key");
  const sql = getDb(c.env);
  
  try {
    const [result] = await sql<{ content: string, updated_at: string }[]>`
      SELECT content, updated_at FROM site_content WHERE key = ${key}
    `;

    if (!result) {
      return c.json({ error: "Content not found" }, 404);
    }

    return c.json({ key, content: result.content, updated_at: result.updated_at });
  } catch (err) {
    console.error(`[SiteContent] Failed to fetch key ${key}:`, err);
    return c.json({ error: "Failed to fetch content" }, 500);
  }
});

app.put("/api/site-content/:key", authMiddleware, async (c) => {
  const allowedRole = await requireRole(c, ["owner", "admin"]);
  if (!allowedRole) {
    return c.json({ error: "Admin access required" }, 403);
  }

  const key = c.req.param("key");
  const body = await c.req.json().catch(() => null);
  const content = typeof body?.content === "string" ? body.content : "";

  if (!content) {
    return c.json({ error: "Content is required" }, 400);
  }

  const sql = getDb(c.env);
  try {
    await sql`
      INSERT INTO site_content (key, content)
      VALUES (${key}, ${content})
      ON CONFLICT (key) DO UPDATE SET 
        content = EXCLUDED.content,
        updated_at = CURRENT_TIMESTAMP
    `;

    return c.json({ success: true });
  } catch (err) {
    console.error(`[SiteContent] Failed to update key ${key}:`, err);
    return c.json({ error: "Failed to update content" }, 500);
  }
});

app.get("/api/apps/:slug", async (c) => {
  const slug = c.req.param("slug");
  const sql = getDb(c.env);
  const [result] = await sql<AppRecord[]>`
    SELECT * FROM apps WHERE slug = ${slug}
  `;

  if (!result) {
    return c.json({ error: "App not found" }, 404);
  }

  const app = mapAppRecord(result);
  if (app.visibility === "hidden") {
    try {
      const user = await getAuthenticatedUser(c);
      if (!user || !isElevatedRole(user.role)) {
        return c.json({ error: "App not found" }, 404);
      }
    } catch {
      return c.json({ error: "App not found" }, 404);
    }
  }

  return c.json(app);
});

app.post("/api/apps", authMiddleware, async (c) => {
  const allowedRole = await requireRole(c, ["owner", "admin"]);
  if (!allowedRole) {
    return c.json({ error: "Admin access required" }, 403);
  }

  const body = normalizeAppPayload(await c.req.json());

  if (!body.name || !body.slug) {
    return c.json({ error: "Name and slug are required" }, 400);
  }

  const sql = getDb(c.env);
  const [existing] = await sql<{ id: number }[]>`
    SELECT id FROM apps WHERE slug = ${body.slug}
  `;

  if (existing) {
    return c.json({ error: "Slug already in use" }, 400);
  }

  const uuid = crypto.randomUUID();

  const [inserted] = await sql<{ id: number, uuid: string }[]>`
    INSERT INTO apps (
      uuid, name, slug, description, category, status, logo, screenshots, 
      cta_url, video_url, features, platform, tagline, full_description, 
      status_label, target_date, tech_stack, progress, visibility, 
      progress_percent, monetization
    ) VALUES (
      ${uuid}, ${body.name}, ${body.slug}, ${body.description || null}, 
      ${body.category}, ${body.status}, ${body.logo || null}, 
      ${JSON.stringify(body.screenshots)}, ${body.cta_url || null}, 
      ${body.video_url || null}, ${JSON.stringify(body.features)}, 
      ${body.platform}, ${body.tagline || null}, ${body.full_description || null}, 
      ${body.status_label || null}, ${body.target_date || null}, 
      ${JSON.stringify(body.tech_stack)}, ${JSON.stringify(body.progress)}, 
      ${body.visibility}, ${body.progress_percent}, ${body.monetization}
    )
    RETURNING id, uuid
  `;

  return c.json({ id: inserted.id, uuid: inserted.uuid }, 201);
});

app.put("/api/apps/:id", authMiddleware, async (c) => {
  const allowedRole = await requireRole(c, ["owner", "admin"]);
  if (!allowedRole) {
    return c.json({ error: "Admin access required" }, 403);
  }

  const id = c.req.param("id");
  const body = normalizeAppPayload(await c.req.json());

  if (!body.name || !body.slug) {
    return c.json({ error: "Name and slug are required" }, 400);
  }

  const sql = getDb(c.env);
  const [existing] = await sql<{ id: number }[]>`
    SELECT id FROM apps WHERE slug = ${body.slug} AND id != ${id}
  `;

  if (existing) {
    return c.json({ error: "Slug already in use" }, 400);
  }

  await sql`
    UPDATE apps SET 
      name = ${body.name}, slug = ${body.slug}, description = ${body.description || null}, 
      category = ${body.category}, status = ${body.status}, logo = ${body.logo || null}, 
      screenshots = ${JSON.stringify(body.screenshots)}, cta_url = ${body.cta_url || null}, 
      video_url = ${body.video_url || null}, features = ${JSON.stringify(body.features)}, 
      platform = ${body.platform}, tagline = ${body.tagline || null}, 
      full_description = ${body.full_description || null}, 
      status_label = ${body.status_label || null}, target_date = ${body.target_date || null}, 
      tech_stack = ${JSON.stringify(body.tech_stack)}, 
      progress = ${JSON.stringify(body.progress)}, visibility = ${body.visibility}, 
      progress_percent = ${body.progress_percent}, monetization = ${body.monetization}, 
      updated_at = CURRENT_TIMESTAMP 
    WHERE id = ${id}
  `;

  return c.json({ success: true });
});

app.delete("/api/apps/:id", authMiddleware, async (c) => {
  const allowedRole = await requireRole(c, ["owner", "admin"]);
  if (!allowedRole) {
    return c.json({ error: "Admin access required" }, 403);
  }

  const id = c.req.param("id");
  const sql = getDb(c.env);

  const [app] = await sql<{ uuid: string }[]>`
    SELECT uuid FROM apps WHERE id = ${id}
  `;

  if (app) {
    const mediaRecords = await sql<{ url: string }[]>`
      SELECT url FROM app_media WHERE app_uuid = ${app.uuid}
    `;

    if (c.env.R2_BUCKET) {
      for (const record of mediaRecords) {
        const key = record.url.split('/').pop();
        if (key) {
          await c.env.R2_BUCKET.delete(`apps/${app.uuid}/${key}`).catch(() => null);
        }
      }
    }

    await sql`DELETE FROM app_media WHERE app_uuid = ${app.uuid}`;
  }

  await sql`DELETE FROM apps WHERE id = ${id}`;

  return c.json({ success: true });
});

app.post("/api/apps/:id/upload-logo", authMiddleware, async (c) => {
  const allowedRole = await requireRole(c, ["owner", "admin"]);
  if (!allowedRole) {
    return c.json({ error: "Admin access required" }, 403);
  }

  const id = c.req.param("id");
  const formData = await c.req.formData();
  const file = formData.get("logo") as unknown as File;

  if (!file) {
    return c.json({ error: "No file provided" }, 400);
  }

  const sql = getDb(c.env);
  const [app] = await sql<{ uuid: string }[]>`
    SELECT uuid FROM apps WHERE id = ${id}
  `;
  if (!app) {
    return c.json({ error: "App not found" }, 404);
  }

  // Generate unique filename
  const ext = file.name.split('.').pop();
  const filename = `logo-${Date.now()}.${ext}`;
  const key = `apps/${app.uuid}/${filename}`;

  // Upload to R2 if available
  if (c.env.R2_BUCKET) {
    await c.env.R2_BUCKET.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });
  }

  // Construct public URL
  const url = `/api/files/${app.uuid}/${filename}`;

  // Update app record
  await sql`
    UPDATE apps SET logo = ${url}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}
  `;

  return c.json({ url });
});

app.post("/api/apps/:id/upload-screenshot", authMiddleware, async (c) => {
  const allowedRole = await requireRole(c, ["owner", "admin"]);
  if (!allowedRole) {
    return c.json({ error: "Admin access required" }, 403);
  }

  const id = c.req.param("id");
  const formData = await c.req.formData();
  const file = formData.get("screenshot") as unknown as File;

  if (!file) {
    return c.json({ error: "No file provided" }, 400);
  }

  const sql = getDb(c.env);
  const [app] = await sql<{ uuid: string, screenshots: any }[]>`
    SELECT uuid, screenshots FROM apps WHERE id = ${id}
  `;
  if (!app) {
    return c.json({ error: "App not found" }, 404);
  }

  // Generate unique filename
  const ext = file.name.split('.').pop();
  const filename = `screenshot-${Date.now()}.${ext}`;
  const key = `apps/${app.uuid}/${filename}`;

  // Upload to R2 if available
  if (c.env.R2_BUCKET) {
    await c.env.R2_BUCKET.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });
  }

  // Construct public URL
  const url = `/api/files/${app.uuid}/${filename}`;

  // Get current max sort_order
  const [maxOrder] = await sql<{ max_order: number | null }[]>`
    SELECT MAX(sort_order) as max_order FROM app_media WHERE app_uuid = ${app.uuid}
  `;

  // Insert into app_media table
  await sql`
    INSERT INTO app_media (app_uuid, url, media_type, sort_order) 
    VALUES (${app.uuid}, ${url}, 'screenshot', ${(maxOrder?.max_order ?? -1) + 1})
  `;

  const currentScreenshots = Array.isArray(app.screenshots) ? app.screenshots : parseJsonArray<string>(app.screenshots);
  const nextScreenshots = [...currentScreenshots, url];
  
  await sql`
    UPDATE apps SET screenshots = ${JSON.stringify(nextScreenshots)}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}
  `;

  return c.json({ url });
});

app.get("/api/apps/:slugOrUuid/media", async (c) => {
  const slugOrUuid = c.req.param("slugOrUuid");
  const sql = getDb(c.env);
  
  const [app] = await sql<{ uuid: string; visibility: string | null }[]>`
    SELECT uuid, visibility FROM apps WHERE slug = ${slugOrUuid} OR uuid = ${slugOrUuid} LIMIT 1
  `;

  if (!app) {
    return c.json({ error: "App not found" }, 404);
  }

  if (normalizeVisibility(app.visibility) === "hidden") {
    try {
      const user = await getAuthenticatedUser(c);
      if (!user || !isElevatedRole(user.role)) {
        return c.json({ error: "App not found" }, 404);
      }
    } catch {
      return c.json({ error: "App not found" }, 404);
    }
  }

  const results = await sql`
    SELECT * FROM app_media WHERE app_uuid = ${app.uuid} ORDER BY sort_order ASC, created_at ASC
  `;

  return c.json(results || []);
});

// File serving endpoint (proxy to R2)
app.get("/api/files/:app_uuid/:filename", async (c) => {
  if (!c.env.R2_BUCKET) {
    return c.json({ error: "Storage not configured" }, 503);
  }
  const appUuid = c.req.param("app_uuid");
  const filename = c.req.param("filename");
  const key = `apps/${appUuid}/${filename}`;

  const object = await c.env.R2_BUCKET.get(key);

  if (!object) {
    return c.json({ error: "File not found" }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  if (object.httpEtag) {
    headers.set("etag", object.httpEtag);
  }

  return c.body(object.body, { headers });
});

// Analytics tracking
app.post("/api/analytics/track", async (c) => {
  const body = await c.req.json();
  const metadata = typeof body.metadata === 'string'
    ? body.metadata
    : JSON.stringify(body.metadata || {});

  const sql = getDb(c.env);
  await sql`
    INSERT INTO analytics (event, app_id, app_uuid, user_id, metadata) 
    VALUES (${body.event || null}, ${body.app_id || null}, ${body.app_uuid || null}, ${body.user_id || null}, ${metadata})
  `;

  return c.json({ success: true });
});

app.get("/api/analytics/stats", authMiddleware, async (c) => {
  const sql = getDb(c.env);
  const [totalApps] = await sql<{ count: number }[]>`SELECT COUNT(*) as count FROM apps`;
  const [totalEvents] = await sql<{ count: number }[]>`SELECT COUNT(*) as count FROM analytics`;

  return c.json({
    totalApps: totalApps?.count || 0,
    totalEvents: totalEvents?.count || 0,
  });
});

// App Updates - Public endpoint for published updates
app.get("/api/app-updates", async (c) => {
  const sql = getDb(c.env);
  const authUser = await getAuthenticatedUser(c);
  let role = "user";

  if (authUser?.email) {
    const [dbUser] = await sql<{ role: string }[]>`
      SELECT role
      FROM users
      WHERE email = ${authUser.email}
      LIMIT 1
    `;
    role = dbUser?.role || (authUser.email === OWNER_EMAIL ? "owner" : "user");
  }

  const includeUnpublished = isElevatedRole(role);
  const results = includeUnpublished
    ? await sql`
        SELECT 
          u.*,
          a.name as app_name,
          a.slug as app_slug
        FROM app_updates u
        LEFT JOIN apps a ON u.app_uuid = a.uuid
        ORDER BY u.created_at DESC
      `
    : await sql`
        SELECT 
          u.*,
          a.name as app_name,
          a.slug as app_slug
        FROM app_updates u
        LEFT JOIN apps a ON u.app_uuid = a.uuid
        WHERE u.is_published = true
        ORDER BY u.created_at DESC
      `;

  return c.json(results || []);
});

// Create app update (admin/owner only)
app.post("/api/app-updates", authMiddleware, async (c) => {
  const authUser = c.get("user");
  if (!authUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const sql = getDb(c.env);
  const [dbUser] = await sql<{ role: string }[]>`
    SELECT role FROM users WHERE email = ${authUser.email}
  `;

  const role = dbUser?.role || (authUser.email === OWNER_EMAIL ? "owner" : "user");

  if (role !== "owner" && role !== "admin") {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const body = await c.req.json();

  const [inserted] = await sql<{ id: number }[]>`
    INSERT INTO app_updates (app_id, app_uuid, title, content, update_type, version, is_published) 
    VALUES (${body.app_id || null}, ${body.app_uuid || null}, ${body.title}, ${body.content}, 
            ${body.update_type || "announcement"}, ${body.version || null}, 
            ${body.is_published !== undefined ? body.is_published : true})
    RETURNING id
  `;

  return c.json({ id: inserted.id, success: true });
});

// Update app update (admin/owner only)
app.put("/api/app-updates/:id", authMiddleware, async (c) => {
  const authUser = c.get("user");
  if (!authUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const sql = getDb(c.env);
  const [dbUser] = await sql<{ role: string }[]>`
    SELECT role FROM users WHERE email = ${authUser.email}
  `;

  const role = dbUser?.role || (authUser.email === OWNER_EMAIL ? "owner" : "user");

  if (role !== "owner" && role !== "admin") {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const id = c.req.param("id");
  const body = await c.req.json();

  await sql`
    UPDATE app_updates SET 
      title = ${body.title}, content = ${body.content}, update_type = ${body.update_type || "announcement"}, 
      version = ${body.version || null}, is_published = ${body.is_published !== undefined ? body.is_published : true}, 
      updated_at = CURRENT_TIMESTAMP 
    WHERE id = ${id}
  `;

  return c.json({ success: true });
});

// Delete app update (admin/owner only)
app.delete("/api/app-updates/:id", authMiddleware, async (c) => {
  const authUser = c.get("user");
  if (!authUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const sql = getDb(c.env);
  const [dbUser] = await sql<{ role: string }[]>`
    SELECT role FROM users WHERE email = ${authUser.email}
  `;

  const role = dbUser?.role || (authUser.email === OWNER_EMAIL ? "owner" : "user");

  if (role !== "owner" && role !== "admin") {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const id = c.req.param("id");

  await sql`DELETE FROM app_updates WHERE id = ${id}`;

  return c.json({ success: true });
});

app.get("/api/analytics", authMiddleware, async (c) => {
  const range = c.req.query("range") || "7d";
  const days = range === "1d" ? 1 : range === "7d" ? 7 : range === "30d" ? 30 : 365;
  const sql = getDb(c.env);
  const isD1 = Boolean((c.env as any).DB);

  // Total events
  const [totalEventsResult] = isD1
    ? await sql<{ count: number }[]>`
        SELECT COUNT(*) as count
        FROM analytics
        WHERE timestamp >= datetime('now', '-' || ${days} || ' days')
      `
    : await sql<{ count: number }[]>`
        SELECT COUNT(*) as count
        FROM analytics
        WHERE timestamp >= CURRENT_TIMESTAMP - (interval '1 day' * ${days})
      `;
  const totalEvents = totalEventsResult?.count || 0;

  // Unique users
  const [uniqueUsersResult] = isD1
    ? await sql<{ count: number }[]>`
        SELECT COUNT(DISTINCT user_id) as count
        FROM analytics
        WHERE timestamp >= datetime('now', '-' || ${days} || ' days') AND user_id IS NOT NULL
      `
    : await sql<{ count: number }[]>`
        SELECT COUNT(DISTINCT user_id) as count
        FROM analytics
        WHERE timestamp >= CURRENT_TIMESTAMP - (interval '1 day' * ${days}) AND user_id IS NOT NULL
      `;
  const uniqueUsers = uniqueUsersResult?.count || 0;

  // Top apps
  const topApps = isD1
    ? await sql`
        SELECT apps.name, COUNT(*) as count
         FROM analytics
         LEFT JOIN apps ON (analytics.app_uuid IS NOT NULL AND analytics.app_uuid = apps.uuid)
                        OR (analytics.app_uuid IS NULL AND analytics.app_id = apps.id)
         WHERE analytics.timestamp >= datetime('now', '-' || ${days} || ' days')
           AND apps.name IS NOT NULL
         GROUP BY apps.uuid, apps.name
         ORDER BY count DESC
         LIMIT 10
      `
    : await sql`
        SELECT apps.name, COUNT(*) as count
         FROM analytics
         LEFT JOIN apps ON (analytics.app_uuid IS NOT NULL AND analytics.app_uuid = apps.uuid)
                        OR (analytics.app_uuid IS NULL AND analytics.app_id = apps.id)
         WHERE analytics.timestamp >= CURRENT_TIMESTAMP - (interval '1 day' * ${days})
           AND apps.name IS NOT NULL
         GROUP BY apps.uuid, apps.name
         ORDER BY count DESC
         LIMIT 10
      `;

  // Events by type
  const eventsByType = isD1
    ? await sql`
        SELECT event as name, COUNT(*) as value
         FROM analytics
         WHERE timestamp >= datetime('now', '-' || ${days} || ' days')
         GROUP BY event
         ORDER BY value DESC
      `
    : await sql`
        SELECT event as name, COUNT(*) as value
         FROM analytics
         WHERE timestamp >= CURRENT_TIMESTAMP - (interval '1 day' * ${days})
         GROUP BY event
         ORDER BY value DESC
      `;

  // Daily visits
  const dailyVisits = isD1
    ? await sql`
        SELECT date(timestamp) as date, COUNT(*) as visits
         FROM analytics
         WHERE timestamp >= datetime('now', '-' || ${days} || ' days')
         GROUP BY date(timestamp)
         ORDER BY date(timestamp) ASC
      `
    : await sql`
        SELECT date(timestamp) as date, COUNT(*) as visits
         FROM analytics
         WHERE timestamp >= CURRENT_TIMESTAMP - (interval '1 day' * ${days})
         GROUP BY date(timestamp)
         ORDER BY date(timestamp) ASC
      `;

  return c.json({
    totalEvents,
    uniqueUsers,
    topApps: topApps || [],
    eventsByType: eventsByType || [],
    dailyVisits: dailyVisits || [],
  });
});

// Blog Posts CRUD
app.get("/api/blog", async (c) => {
  const lang = c.req.query("lang") || "en";
  const sql = getDb(c.env);
  const results = await sql`
    SELECT * FROM blog_posts WHERE is_published = true AND language = ${lang} ORDER BY published_at DESC
  `;

  return c.json(results);
});

app.get("/api/blog/all", authMiddleware, async (c) => {
  const allowedRole = await requireRole(c, ["owner", "admin", "moderator"]);
  if (!allowedRole) {
    return c.json({ error: "Moderator access required" }, 403);
  }

  const sql = getDb(c.env);
  const results = await sql`
    SELECT * FROM blog_posts ORDER BY created_at DESC
  `;

  return c.json(results);
});

app.get("/api/blog/:slug", async (c) => {
  const slug = c.req.param("slug");
  const sql = getDb(c.env);
  const [result] = await sql`
    SELECT * FROM blog_posts WHERE slug = ${slug} AND is_published = true
  `;

  if (!result) {
    return c.json({ error: "Post not found" }, 404);
  }

  return c.json(result);
});

app.post("/api/blog", authMiddleware, async (c) => {
  const allowedRole = await requireRole(c, ["owner", "admin", "moderator"]);
  if (!allowedRole) {
    return c.json({ error: "Moderator access required" }, 403);
  }

  const body = await c.req.json();
  const sql = getDb(c.env);

  const [inserted] = await sql<{ id: number }[]>`
    INSERT INTO blog_posts (title, slug, content, excerpt, cover_image, language, is_published, published_at) 
    VALUES (${body.title}, ${body.slug}, ${body.content || ""}, ${body.excerpt || ""}, 
            ${body.cover_image || null}, ${body.language || "en"}, 
            ${body.is_published ? true : false}, 
            ${body.is_published ? new Date().toISOString() : null})
    RETURNING id
  `;

  return c.json({ id: inserted.id }, 201);
});

app.put("/api/blog/:id", authMiddleware, async (c) => {
  const allowedRole = await requireRole(c, ["owner", "admin", "moderator"]);
  if (!allowedRole) {
    return c.json({ error: "Moderator access required" }, 403);
  }

  const id = c.req.param("id");
  const body = await c.req.json();
  const sql = getDb(c.env);

  // Get current post to check if publishing for first time
  const [current] = await sql<{ is_published: boolean, published_at: string | null }[]>`
    SELECT is_published, published_at FROM blog_posts WHERE id = ${id}
  `;

  const publishedAt = body.is_published && !current?.is_published
    ? new Date().toISOString()
    : current?.published_at || null;

  await sql`
    UPDATE blog_posts SET 
      title = ${body.title}, slug = ${body.slug}, content = ${body.content || ""}, 
      excerpt = ${body.excerpt || ""}, cover_image = ${body.cover_image || null}, 
      language = ${body.language || "en"}, is_published = ${body.is_published ? true : false}, 
      published_at = ${publishedAt}, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ${id}
  `;
  return c.json({ success: true });
});

app.delete("/api/blog/:id", authMiddleware, async (c) => {
  const allowedRole = await requireRole(c, ["owner", "admin", "moderator"]);
  if (!allowedRole) {
    return c.json({ error: "Moderator access required" }, 403);
  }

  const id = c.req.param("id");
  const sql = getDb(c.env);
  await sql`DELETE FROM blog_posts WHERE id = ${id}`;

  return c.json({ success: true });
});

app.get("/api/promotions", async (c) => {
  let includeInactive = false;
  try {
    const user = await getAuthenticatedUser(c);
    includeInactive = Boolean(user && isElevatedRole(user.role));
  } catch {
    includeInactive = false;
  }

  const sql = getDb(c.env);
  const results = includeInactive
    ? await sql`SELECT * FROM promotions ORDER BY updated_at DESC, created_at DESC`
    : await sql`SELECT * FROM promotions WHERE is_active = true ORDER BY updated_at DESC, created_at DESC`;

  return c.json(results || []);
});

app.post("/api/promotions", authMiddleware, async (c) => {
  const allowedRole = await requireRole(c, ["owner", "admin"]);
  if (!allowedRole) {
    return c.json({ error: "Admin access required" }, 403);
  }

  const body = await c.req.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";

  if (!title) {
    return c.json({ error: "Title is required" }, 400);
  }

  const sql = getDb(c.env);
  const [inserted] = await sql<{ id: number }[]>`
    INSERT INTO promotions (title, description, target_app, cta_url, is_active) 
    VALUES (
      ${title}, 
      ${typeof body.description === "string" ? body.description.trim() : null}, 
      ${typeof body.target_app === "string" && body.target_app.trim() ? body.target_app.trim() : null}, 
      ${typeof body.cta_url === "string" && body.cta_url.trim() ? body.cta_url.trim() : null}, 
      ${body.is_active ? true : false}
    )
    RETURNING id
  `;

  return c.json({ id: inserted.id }, 201);
});

app.put("/api/promotions/:id", authMiddleware, async (c) => {
  const allowedRole = await requireRole(c, ["owner", "admin"]);
  if (!allowedRole) {
    return c.json({ error: "Admin access required" }, 403);
  }

  const id = c.req.param("id");
  const body = await c.req.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";

  if (!title) {
    return c.json({ error: "Title is required" }, 400);
  }

  const sql = getDb(c.env);
  await sql`
    UPDATE promotions SET 
      title = ${title}, 
      description = ${typeof body.description === "string" ? body.description.trim() : null}, 
      target_app = ${typeof body.target_app === "string" && body.target_app.trim() ? body.target_app.trim() : null}, 
      cta_url = ${typeof body.cta_url === "string" && body.cta_url.trim() ? body.cta_url.trim() : null}, 
      is_active = ${body.is_active ? true : false}, 
      updated_at = CURRENT_TIMESTAMP 
    WHERE id = ${id}
  `;

  return c.json({ success: true });
});

app.delete("/api/promotions/:id", authMiddleware, async (c) => {
  const allowedRole = await requireRole(c, ["owner", "admin"]);
  if (!allowedRole) {
    return c.json({ error: "Admin access required" }, 403);
  }

  const id = c.req.param("id");
  const sql = getDb(c.env);
  await sql`DELETE FROM promotions WHERE id = ${id}`;
  return c.json({ success: true });
});

app.post("/api/users/invite", authMiddleware, async (c) => {
  const allowedRole = await requireRole(c, ["owner", "admin"]);
  if (!allowedRole) {
    return c.json({ error: "Admin access required" }, 403);
  }

  const body = await c.req.json();
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = typeof body.role === "string" ? body.role : "user";
  const currentUser = c.get("user") as AppUser | undefined;

  if (!email) {
    return c.json({ error: "Email is required" }, 400);
  }

  if (role === "owner") {
    if (allowedRole !== "owner") {
      return c.json({ error: "Only the Founder & CEO can assign the owner role" }, 403);
    }
    if (email !== OWNER_EMAIL) {
      return c.json({ error: `Owner access is reserved for ${OWNER_EMAIL}` }, 400);
    }
  }

  const sql = getDb(c.env);
  const [existing] = await sql<{ id: number }[]>`
    SELECT id FROM users WHERE email = ${email}
  `;

  if (existing) {
    return c.json({ error: "User already exists" }, 400);
  }

  const [inserted] = await sql<{ id: number }[]>`
    INSERT INTO users (email, role) VALUES (${email}, ${role || "user"})
    RETURNING id
  `;

  const isAdminInvite = role === "owner" || role === "admin" || role === "moderator";
  const inviteUrl = new URL(isAdminInvite ? "/admin/login" : "/login", c.req.url).toString();
  const inviterName =
    currentUser?.display_name ||
    currentUser?.google_user_data?.name ||
    currentUser?.email ||
    "Northern Step Studio";

  let emailSent = false;
  let emailError: string | null = null;

  try {
    const sendResult = await sendEmail(c.env, {
      to: email,
      subject: `Your Northern Step Studio ${isAdminInvite ? "team" : "account"} invite`,
      html_body: studioInvitationEmail({
        inviteeEmail: email,
        inviterName,
        roleLabel: getRoleDisplayLabel(role),
        loginUrl: inviteUrl,
        isAdminInvite,
      }),
      text_body: [
        `Hi ${email},`,
        "",
        `${inviterName} added you to Northern Step Studio with the role ${getRoleDisplayLabel(role)}.`,
        `Sign in here: ${inviteUrl}`,
        "",
        isAdminInvite
          ? "Use the admin sign-in page. If your account is linked to Google, continue with Google. If the team enabled password access for you, email/password works there too."
          : "Use the standard sign-in page. If your account is linked to Google, continue with Google. If the team enabled password access for you, email/password works there too.",
      ].join("\n"),
    });

    emailSent = Boolean(sendResult?.success);
    if (!emailSent) {
      emailError = sendResult?.error || "Email service did not confirm delivery";
    }
  } catch (error) {
    emailError = error instanceof Error ? error.message : "Failed to send invitation email";
  }

  return c.json(
    {
      id: inserted.id,
      email_sent: emailSent,
      email_error: emailError,
      invite_url: inviteUrl,
    },
    201,
  );
});

// Studio Notes CRUD
app.get("/api/studio/notes", authMiddleware, async (c) => {
  const sql = getDb(c.env);
  const results = await sql`
    SELECT * FROM studio_notes ORDER BY is_pinned DESC, updated_at DESC
  `;

  return c.json(results);
});

app.post("/api/studio/notes", authMiddleware, async (c) => {
  const body = await c.req.json();
  const sql = getDb(c.env);

  const [inserted] = await sql<{ id: number }[]>`
    INSERT INTO studio_notes (title, content, category, is_pinned) 
    VALUES (${body.title}, ${body.content || ""}, ${body.category || "general"}, ${body.is_pinned ? true : false})
    RETURNING id
  `;

  return c.json({ id: inserted.id }, 201);
});

app.put("/api/studio/notes/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const sql = getDb(c.env);

  await sql`
    UPDATE studio_notes SET 
      title = ${body.title}, content = ${body.content || ""}, 
      category = ${body.category || "general"}, is_pinned = ${body.is_pinned ? true : false}, 
      updated_at = CURRENT_TIMESTAMP 
    WHERE id = ${id}
  `;

  return c.json({ success: true });
});

app.delete("/api/studio/notes/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const sql = getDb(c.env);
  await sql`DELETE FROM studio_notes WHERE id = ${id}`;

  return c.json({ success: true });
});

// Users Management
app.get("/api/users", authMiddleware, async (c) => {
  const allowedRole = await requireRole(c, ["owner", "admin"]);
  if (!allowedRole) {
    return c.json({ error: "Admin access required" }, 403);
  }

  const sql = getDb(c.env);
  const results = await sql`
    SELECT id, email, display_name, role, created_at, updated_at 
    FROM users 
    ORDER BY created_at DESC
  `;

  return c.json(results);
});

// Search users for @mention autocomplete
app.get("/api/users/search", authMiddleware, async (c) => {
  const query = c.req.query("q") || "";

  if (query.length < 1) {
    return c.json([]);
  }

  const sql = getDb(c.env);
  const results = await sql`
    SELECT id, email, display_name, role 
    FROM users 
    WHERE email ILIKE ${'%' + query + '%'} OR display_name ILIKE ${'%' + query + '%'} 
    ORDER BY role DESC, email ASC 
    LIMIT 10
  `;

  return c.json(results);
});

app.put("/api/users/:id/role", authMiddleware, async (c) => {
  const allowedRole = await requireRole(c, ["owner", "admin"]);
  if (!allowedRole) {
    return c.json({ error: "Admin access required" }, 403);
  }

  const id = c.req.param("id");
  const body = await c.req.json();
  const validRoles = ["user", "moderator", "admin", "owner"];

  if (!validRoles.includes(body.role)) {
    return c.json({ error: "Invalid role" }, 400);
  }

  const sql = getDb(c.env);
  const [targetUser] = await sql<{ email: string }[]>`
    SELECT email FROM users WHERE id = ${id}
  `;

  if (!targetUser) {
    return c.json({ error: "User not found" }, 404);
  }

  if (body.role === "owner") {
    if (allowedRole !== "owner") {
      return c.json({ error: "Only the Founder & CEO can assign the owner role" }, 403);
    }
    if (targetUser.email !== OWNER_EMAIL) {
      return c.json({ error: `Owner access is reserved for ${OWNER_EMAIL}` }, 400);
    }
  }

  if (targetUser.email === OWNER_EMAIL && body.role !== "owner") {
    return c.json({ error: "The Founder & CEO account must remain the owner" }, 400);
  }

  await sql`
    UPDATE users SET role = ${body.role}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}
  `;

  return c.json({ success: true });
});

app.delete("/api/users/:id", authMiddleware, async (c) => {
  const allowedRole = await requireRole(c, ["owner", "admin"]);
  if (!allowedRole) {
    return c.json({ error: "Admin access required" }, 403);
  }

  const id = c.req.param("id");
  const currentUser = c.get("user");

  if (!currentUser) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  const sql = getDb(c.env);
  const [targetUser] = await sql<{ email: string }[]>`
    SELECT email FROM users WHERE id = ${id}
  `;

  if (targetUser && targetUser.email === currentUser.email) {
    return c.json({ error: "Cannot delete your own account" }, 400);
  }

  if (targetUser && targetUser.email === OWNER_EMAIL) {
    return c.json({ error: "The Founder & CEO account cannot be deleted" }, 400);
  }

  await sql`DELETE FROM users WHERE id = ${id}`;

  return c.json({ success: true });
});

// Update user display name
app.put("/api/users/:id/display-name", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const sql = getDb(c.env);

  await sql`
    UPDATE users SET display_name = ${body.display_name || null}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}
  `;

  return c.json({ success: true });
});

// Get current user's role
app.get("/api/user/role", authMiddleware, async (c) => {
  const authUser = c.get("user");

  if (!authUser) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  const sql = getDb(c.env);
  const [dbUser] = await sql<{ role: string }[]>`
    SELECT role FROM users WHERE email = ${authUser.email}
  `;

  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }

  const permissions = await sql<{ role: string; page: string; can_access: number | boolean }[]>`
    SELECT role, page, can_access
    FROM role_permissions
    WHERE role = ${dbUser.role}
    ORDER BY page ASC
  `.catch(() => []);

  return c.json({
    role: dbUser.role,
    permissions,
  });
});

// Get current authenticated user's activity for profile page
app.get("/api/user/activity", authMiddleware, async (c) => {
  const authUser = c.get("user");

  if (!authUser) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  const sql = getDb(c.env);
  // Find user by email
  const [dbUser] = await sql<any[]>`
    SELECT id, email, display_name, bio, avatar_url, role, created_at FROM users WHERE email = ${authUser.email}
  `;

  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }

  const threads = await sql`
    SELECT ct.id, ct.title, ct.slug, ct.is_pinned, ct.is_locked, ct.created_at,
            cc.name as category
     FROM community_threads ct
     LEFT JOIN community_categories cc ON ct.category_id = cc.id
     WHERE ct.user_id = ${dbUser.id} AND ct.is_hidden = false
     ORDER BY ct.created_at DESC
     LIMIT 50
  `;

  const posts = await sql`
    SELECT cp.id, cp.content, cp.created_at,
            ct.id as thread_id, ct.title as thread_title, ct.slug as thread_slug,
            cc.name as category
     FROM community_posts cp
     LEFT JOIN community_threads ct ON cp.thread_id = ct.id
     LEFT JOIN community_categories cc ON ct.category_id = cc.id
     WHERE cp.user_id = ${dbUser.id} AND cp.is_deleted = false
     ORDER BY cp.created_at DESC
     LIMIT 50
  `;

  return c.json({
    user: dbUser,
    threads,
    posts,
  });
});

// Get user profile
app.get("/api/user/profile", authMiddleware, async (c) => {
  const authUser = c.get("user");

  if (!authUser) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  const sql = getDb(c.env);
  const [dbUser] = await sql`
    SELECT id, email, display_name, bio, avatar_url, created_at FROM users WHERE email = ${authUser.email}
  `;

  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json(dbUser);
});

const MAX_PROFILE_DISPLAY_NAME_LENGTH = 100;
const MAX_PROFILE_BIO_LENGTH = 500;
const MAX_PROFILE_AVATAR_URL_LENGTH = 2048;
const MAX_PROFILE_AVATAR_FILE_SIZE = 5 * 1024 * 1024;
const PROFILE_AVATAR_ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]);

function normalizeOptionalProfileText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, maxLength);
}

function normalizeAvatarUrl(value: unknown) {
  if (typeof value !== "string") {
    return { value: null as string | null, error: null as string | null };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { value: null as string | null, error: null as string | null };
  }

  if (trimmed.length > MAX_PROFILE_AVATAR_URL_LENGTH) {
    return {
      value: null as string | null,
      error: `Avatar URL must be ${MAX_PROFILE_AVATAR_URL_LENGTH} characters or fewer.`,
    };
  }

  if (trimmed.startsWith("/")) {
    return { value: trimmed, error: null as string | null };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return { value: parsed.toString(), error: null as string | null };
    }

    return {
      value: null as string | null,
      error: "Avatar URL must start with https://, http://, or /.",
    };
  } catch {
    return {
      value: null as string | null,
      error: "Avatar URL must be a valid image URL or a local /path.",
    };
  }
}

function resolveImageFileExtension(file: File) {
  const mappedByType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
  };

  if (mappedByType[file.type]) {
    return mappedByType[file.type];
  }

  const parts = file.name.split(".");
  const rawExtension = parts.length > 1 ? parts.at(-1)?.toLowerCase() : "";
  const normalizedExtension = typeof rawExtension === "string" ? rawExtension.replace(/[^a-z0-9]/g, "") : "";
  return normalizedExtension || "png";
}

function getProfileAvatarObjectKey(userId: number, filename: string) {
  return `profiles/${userId}/${filename}`;
}

function isManagedProfileAvatarUrl(value: string, userId: number) {
  return value.startsWith(`/api/profile-files/${userId}/`);
}

async function deleteManagedProfileAvatar(bucket: any, avatarUrl: string | null, userId: number) {
  if (!avatarUrl || !isManagedProfileAvatarUrl(avatarUrl, userId)) {
    return;
  }

  const prefix = `/api/profile-files/${userId}/`;
  const filename = avatarUrl.slice(prefix.length);
  if (!filename) {
    return;
  }

  await bucket.delete(getProfileAvatarObjectKey(userId, filename)).catch(() => null);
}

// Site Content CRUD (CMS)
app.get("/api/site-content", async (c) => {
  const sql = getDb(c.env);
  const results = await sql`
    SELECT * FROM site_content ORDER BY key ASC
  `;
  return c.json(results);
});
// Site Content API (CMS)
app.get("/api/site-content/:key", async (c) => {
  const key = c.req.param("key");
  const env = c.env;

  // Development Fallback: Return null if DB is not configured correctly
  if (env.SUPABASE_DB_URL?.includes("YOUR_PASSWORD") || env.DATABASE_URL?.includes("YOUR_PASSWORD")) {
    return c.json({ key, content: null });
  }

  try {
    const sql = getDb(env);
    const [row] = await sql<{ content: string }[]>`
      SELECT content FROM site_content WHERE key = ${key}
    `;
    
    if (!row) {
      return c.json({ error: "Content not found" }, 404);
    }
    
    return c.json({ key, content: row.content });
  } catch (error) {
    console.error(`[SiteContent] Error fetching key ${key}:`, error);
    return c.json({ key, content: null }); // Fallback to null (let frontend handle defaults)
  }
});

app.put("/api/site-content/:key", authMiddleware, async (c) => {
  const allowedRole = await requireRole(c, ["owner", "admin"]);
  if (!allowedRole) {
    return c.json({ error: "Admin access required" }, 403);
  }

  const key = c.req.param("key");
  const body = await c.req.json();
  const sql = getDb(c.env);

  await sql`
    INSERT INTO site_content (key, content, metadata, updated_at)
    VALUES (${key}, ${body.content}, ${JSON.stringify(body.metadata || {})}, CURRENT_TIMESTAMP)
    ON CONFLICT (key) DO UPDATE SET
      content = EXCLUDED.content,
      metadata = EXCLUDED.metadata,
      updated_at = EXCLUDED.updated_at
  `;

  return c.json({ success: true });
});

// Update user profile
app.put("/api/user/profile", authMiddleware, async (c) => {
  const authUser = c.get("user");

  if (!authUser) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  const body = await c.req.json();
  const display_name = normalizeOptionalProfileText(body.display_name, MAX_PROFILE_DISPLAY_NAME_LENGTH);
  const bio = normalizeOptionalProfileText(body.bio, MAX_PROFILE_BIO_LENGTH);
  const avatar = normalizeAvatarUrl(body.avatar_url);

  if (typeof body.display_name === "string" && body.display_name.trim().length > MAX_PROFILE_DISPLAY_NAME_LENGTH) {
    return c.json({ error: `Display name must be ${MAX_PROFILE_DISPLAY_NAME_LENGTH} characters or fewer.` }, 400);
  }

  if (typeof body.bio === "string" && body.bio.trim().length > MAX_PROFILE_BIO_LENGTH) {
    return c.json({ error: `Bio must be ${MAX_PROFILE_BIO_LENGTH} characters or fewer.` }, 400);
  }

  if (avatar.error) {
    return c.json({ error: avatar.error }, 400);
  }

  const sql = getDb(c.env);
  // Find user
  const [dbUser] = await sql<{ id: number; avatar_url: string | null }[]>`
    SELECT id, avatar_url FROM users WHERE email = ${authUser.email}
  `;

  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }

  const nextAvatarValue = avatar.value;
  if (
    c.env.R2_BUCKET &&
    dbUser.avatar_url &&
    dbUser.avatar_url !== nextAvatarValue &&
    isManagedProfileAvatarUrl(dbUser.avatar_url, dbUser.id)
  ) {
    await deleteManagedProfileAvatar(c.env.R2_BUCKET, dbUser.avatar_url, dbUser.id);
  }

  // Update profile
  await sql`
    UPDATE users SET 
      display_name = ${display_name}, bio = ${bio}, avatar_url = ${nextAvatarValue}, 
      updated_at = CURRENT_TIMESTAMP 
    WHERE id = ${dbUser.id}
  `;

  const [updatedUser] = await sql`
    SELECT id, email, display_name, bio, avatar_url, created_at FROM users WHERE id = ${dbUser.id}
  `;

  return c.json(updatedUser);
});

app.post("/api/user/profile/avatar", authMiddleware, async (c) => {
  const authUser = c.get("user");

  if (!authUser) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  const bucket = c.env.R2_BUCKET;
  if (!bucket) {
    return c.json({ error: "Avatar uploads are not configured right now." }, 503);
  }

  const sql = getDb(c.env);
  const [dbUser] = await sql<{ id: number, email: string, avatar_url: string | null }[]>`
    SELECT id, email, avatar_url FROM users WHERE email = ${authUser.email}
  `;
  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }

  const formData = await c.req.formData();
  const file = formData.get("avatar") as any;
  if (!file || typeof file === "string") {
    return c.json({ error: "No image file was provided." }, 400);
  }

  if (!PROFILE_AVATAR_ALLOWED_TYPES.has(file.type)) {
    return c.json({ error: "Use a JPEG, PNG, GIF, or WebP image." }, 400);
  }

  if (file.size > MAX_PROFILE_AVATAR_FILE_SIZE) {
    return c.json({ error: "Avatar image must be 5MB or smaller." }, 400);
  }

  const extension = resolveImageFileExtension(file);
  const filename = `avatar-${Date.now()}.${extension}`;
  const key = getProfileAvatarObjectKey(dbUser.id, filename);

  await deleteManagedProfileAvatar(bucket, dbUser.avatar_url, dbUser.id);

  await bucket.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  });

  const url = `/api/profile-files/${dbUser.id}/${filename}`;

  await sql`
    UPDATE users SET avatar_url = ${url}, updated_at = CURRENT_TIMESTAMP WHERE id = ${dbUser.id}
  `;

  return c.json({ url });
});

app.get("/api/profile-files/:userId/:filename", async (c) => {
  const userId = c.req.param("userId");
  const filename = c.req.param("filename");
  const bucket = c.env.R2_BUCKET;

  if (!bucket) {
    return c.json({ error: "File not found" }, 404);
  }

  const object = await bucket.get(getProfileAvatarObjectKey(Number(userId), filename));

  if (!object) {
    return c.json({ error: "File not found" }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  if (object.httpEtag) {
    headers.set("etag", object.httpEtag);
  }

  return c.body(object.body, { headers });
});

app.put("/api/user/password", authMiddleware, async (c) => {
  const authUser = c.get("user");

  if (!authUser) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  const body = await c.req.json();
  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  if (!validatePassword(newPassword)) {
    return c.json({ error: "New password must be at least 8 characters long" }, 400);
  }

  const sql = getDb(c.env);
  const [dbUser] = await sql<any[]>`
    SELECT id, password_hash, password_salt FROM users WHERE email = ${authUser.email}
  `;
  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }

  if (dbUser.password_hash && dbUser.password_salt) {
    if (!currentPassword) {
      return c.json({ error: "Current password is required to update your password" }, 400);
    }

    const isValidPassword = await verifyUserPassword(dbUser as any, currentPassword);
    if (!isValidPassword) {
      return c.json({ error: "Current password is incorrect" }, 401);
    }
  }

  const credentials = await createPasswordCredentials(newPassword);

  await sql`
    UPDATE users SET 
      password_hash = ${credentials.password_hash}, 
      password_salt = ${credentials.password_salt}, 
      updated_at = CURRENT_TIMESTAMP 
    WHERE id = ${dbUser.id}
  `;

  return c.json({ success: true, has_password: true });
});

// Get user activity for profile page (public by user ID)
app.get("/api/users/:id/activity", async (c) => {
  const userId = c.req.param("id");
  const sql = getDb(c.env);

  const [user] = await sql`
    SELECT id, display_name, bio, avatar_url, created_at FROM users WHERE id = ${userId}
  `;

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  const threads = await sql`
    SELECT ct.id, ct.title, ct.slug, ct.is_pinned, ct.is_locked, ct.created_at,
            cc.name as category
     FROM community_threads ct
     LEFT JOIN community_categories cc ON ct.category_id = cc.id
     WHERE ct.user_id = ${userId} AND ct.is_hidden = false
     ORDER BY ct.created_at DESC
     LIMIT 50
  `;

  const posts = await sql`
    SELECT cp.id, cp.content, cp.created_at,
            ct.id as thread_id, ct.title as thread_title, ct.slug as thread_slug,
            cc.name as category
     FROM community_posts cp
     LEFT JOIN community_threads ct ON cp.thread_id = ct.id
     LEFT JOIN community_categories cc ON ct.category_id = cc.id
     WHERE cp.user_id = ${userId} AND cp.is_deleted = false
     ORDER BY cp.created_at DESC
     LIMIT 50
  `;

  return c.json({
    user,
    threads,
    posts,
  });
});

// Notifications endpoints
app.get("/api/notifications", authMiddleware, async (c) => {
  const authUser = c.get("user");
  if (!authUser) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  const sql = getDb(c.env);
  const [dbUser] = await sql<{ id: number }[]>`
    SELECT id FROM users WHERE email = ${authUser.email}
  `;

  if (!dbUser) {
    return c.json([]);
  }

  const results = await sql`
     SELECT n.*,
            u.email as sender_email,
            u.display_name as sender_name,
            sn.title as note_title,
            bp.title as blog_title,
            bp.slug as blog_slug,
            ct.title as thread_title,
            ct.slug as thread_slug,
            cpt.title as post_thread_title,
            cpt.slug as post_thread_slug
     FROM notifications n 
     LEFT JOIN users u ON n.sender_id = u.id 
     LEFT JOIN studio_notes sn ON n.reference_type = 'note' AND n.reference_id = sn.id
     LEFT JOIN blog_posts bp ON n.reference_type = 'blog_post' AND n.reference_id = bp.id
     LEFT JOIN community_threads ct ON n.reference_type = 'community_thread' AND n.reference_id = ct.id
     LEFT JOIN community_posts cp ON n.reference_type = 'community_post' AND n.reference_id = cp.id
     LEFT JOIN community_threads cpt ON cp.thread_id = cpt.id
     WHERE n.recipient_id = ${dbUser.id} 
     ORDER BY n.created_at DESC 
     LIMIT 50
  `;

  return c.json(results);
});

app.get("/api/notifications/unread-count", authMiddleware, async (c) => {
  const authUser = c.get("user");
  if (!authUser) {
    return c.json({ count: 0 });
  }

  const sql = getDb(c.env);
  const [dbUser] = await sql<{ id: number }[]>`
    SELECT id FROM users WHERE email = ${authUser.email}
  `;

  if (!dbUser) {
    return c.json({ count: 0 });
  }

  const [result] = await sql<{ count: string }[]>`
    SELECT COUNT(*) as count FROM notifications WHERE recipient_id = ${dbUser.id} AND is_read = false
  `;

  return c.json({ count: parseInt(result?.count || "0", 10) });
});

app.post("/api/notifications", authMiddleware, async (c) => {
  const authUser = c.get("user");
  if (!authUser) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  const body = await c.req.json();
  const { recipient_id, type, reference_type, reference_id, content } = body;
  const numericRecipientId = Number(recipient_id);
  const numericReferenceId = Number(reference_id);

  const sql = getDb(c.env);
  const [sender] = await sql<{ id: number; email: string; display_name: string | null }[]>`
    SELECT id, email, display_name FROM users WHERE email = ${authUser.email}
  `;

  if (!sender) {
    return c.json({ error: "Sender not found" }, 400);
  }

  if (!Number.isInteger(numericRecipientId) || numericRecipientId <= 0) {
    return c.json({ error: "Recipient is required" }, 400);
  }

  if (!Number.isInteger(numericReferenceId) || numericReferenceId <= 0) {
    return c.json({ error: "Reference is required" }, 400);
  }

  // Don't notify yourself
  if (sender.id === numericRecipientId) {
    return c.json({ success: true, skipped: true });
  }

  const [inserted] = await sql<{ id: number }[]>`
    INSERT INTO notifications (recipient_id, sender_id, type, reference_type, reference_id, content) 
    VALUES (${numericRecipientId}, ${sender.id}, ${type || "mention"}, ${reference_type}, ${numericReferenceId}, ${content})
    RETURNING id
  `;

  let emailSent = false;
  let emailError: string | null = null;

  try {
    const [recipient] = await sql<{ email: string; display_name: string | null }[]>`
      SELECT email, display_name FROM users WHERE id = ${numericRecipientId}
    `;

    const shouldEmail = recipient && (type || "mention") === "mention" && (await shouldSendMentionEmail(c.env, numericRecipientId));
    if (recipient && shouldEmail) {
      const origin = new URL(c.req.url).origin;
      const reference = await getNotificationReferenceDetails(c.env, reference_type, numericReferenceId);
      const notificationUrl = `${origin}${reference.path}`;
      const preview = typeof content === "string" ? content : "";

      const sendResult = await sendEmail(c.env, {
        to: recipient.email,
        subject: `${sender.display_name || sender.email.split("@")[0]} mentioned you`,
        html_body: mentionNotificationEmail({
          recipientName: recipient.display_name || recipient.email,
          senderName: sender.display_name || sender.email.split("@")[0],
          referenceLabel: reference.label,
          referenceTitle: reference.title,
          notificationUrl,
          preview,
        }),
        text_body: [
          `Hi ${recipient.display_name || recipient.email},`,
          "",
          `${sender.display_name || sender.email.split("@")[0]} mentioned you in ${reference.label}${reference.title ? ` "${reference.title}"` : ""}.`,
          preview ? "" : "",
          preview || "",
          preview ? "" : "",
          `Open it here: ${notificationUrl}`,
        ].filter(Boolean).join("\n"),
      });

      emailSent = Boolean(sendResult?.success);
      if (!emailSent) {
        emailError = sendResult?.error || "Email service did not confirm delivery";
      }
    }
  } catch (error) {
    emailError = error instanceof Error ? error.message : "Failed to send mention email";
  }

  return c.json({ id: inserted.id, email_sent: emailSent, email_error: emailError }, 201);
});

app.put("/api/notifications/:id/read", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const authUser = c.get("user");

  if (!authUser) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  const sql = getDb(c.env);
  // Verify ownership
  const [dbUser] = await sql<{ id: number }[]>`
    SELECT id FROM users WHERE email = ${authUser.email}
  `;

  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }

  await sql`
    UPDATE notifications SET is_read = true, updated_at = CURRENT_TIMESTAMP WHERE id = ${id} AND recipient_id = ${dbUser.id}
  `;

  return c.json({ success: true });
});

app.post("/api/notifications/read-all", authMiddleware, async (c) => {
  const authUser = c.get("user");

  if (!authUser) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  const sql = getDb(c.env);
  const [dbUser] = await sql<{ id: number }[]>`
    SELECT id FROM users WHERE email = ${authUser.email}
  `;

  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }

  await sql`
    UPDATE notifications SET is_read = true, updated_at = CURRENT_TIMESTAMP WHERE recipient_id = ${dbUser.id} AND is_read = false
  `;

  return c.json({ success: true });
});

app.put("/api/notifications/read-all", authMiddleware, async (c) => {
  const authUser = c.get("user");

  if (!authUser) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  const sql = getDb(c.env);
  const [dbUser] = await sql<{ id: number }[]>`
    SELECT id FROM users WHERE email = ${authUser.email}
  `;

  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }

  await sql`
    UPDATE notifications SET is_read = true, updated_at = CURRENT_TIMESTAMP WHERE recipient_id = ${dbUser.id} AND is_read = false
  `;

  return c.json({ success: true });
});

// Helper to check if user is admin
async function isUserAdmin(c: Context<{ Bindings: Env; Variables: { user: AppUser } }>): Promise<boolean> {
  const authUser = c.get("user");
  if (!authUser) return false;

  // Check if it's the owner email
  if (authUser.email === OWNER_EMAIL) return true;

  const sql = getDb(c.env);
  // Check role in database
  const [dbUser] = await sql<{ role: string }[]>`
    SELECT role FROM users WHERE email = ${authUser.email}
  `;

  return dbUser?.role === "admin" || dbUser?.role === "owner";
}

// Role Permissions Management (Admin Only)
app.get("/api/permissions", authMiddleware, async (c) => {
  const adminCheck = await isUserAdmin(c);
  if (!adminCheck) {
    return c.json({ error: "Admin access required" }, 403);
  }

  const sql = getDb(c.env);
  const results = await sql`
    SELECT * FROM role_permissions ORDER BY role, page
  `;

  return c.json(results);
});

app.get("/api/permissions/:role", authMiddleware, async (c) => {
  const adminCheck = await isUserAdmin(c);
  if (!adminCheck) {
    return c.json({ error: "Admin access required" }, 403);
  }

  const role = c.req.param("role");
  const sql = getDb(c.env);
  const results = await sql`
    SELECT * FROM role_permissions WHERE role = ${role}
  `;

  return c.json(results);
});

app.put("/api/permissions", authMiddleware, async (c) => {
  // Only admins can modify permissions
  const adminCheck = await isUserAdmin(c);
  if (!adminCheck) {
    return c.json({ error: "Admin access required" }, 403);
  }

  const body = await c.req.json();
  const { role, page, can_access } = body;

  const sql = getDb(c.env);
  await sql`
    INSERT INTO role_permissions (role, page, can_access) 
    VALUES (${role}, ${page}, ${can_access ? true : false})
    ON CONFLICT (role, page) DO UPDATE SET 
      can_access = EXCLUDED.can_access,
      updated_at = CURRENT_TIMESTAMP
  `;

  return c.json({ success: true });
});

// Stripe Revenue Endpoints
app.get("/api/stripe/summary", authMiddleware, async (c) => {
  if (!(await isUserAdmin(c))) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  try {
    const stripe = getStripe(c.env);
    if (!stripe) {
      return c.json({
        ...stripeUnavailableResponse(),
        availableBalance: 0,
        pendingBalance: 0,
        totalCustomers: 0,
        monthlyRevenue: 0,
        totalCharges: 0,
        currency: "usd",
        recentPayments: [],
      });
    }

    // Get balance
    const balance = await stripe.balance.retrieve();
    const availableBalance = balance.available.reduce((sum, b) => sum + b.amount, 0);
    const pendingBalance = balance.pending.reduce((sum, b) => sum + b.amount, 0);

    // Get customers count
    const customers = await stripe.customers.list({ limit: 1 });
    const totalCustomers = customers.data.length > 0 ? (await stripe.customers.list({ limit: 100 })).data.length : 0;

    // Get recent charges (last 30 days)
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    const charges = await stripe.charges.list({
      created: { gte: thirtyDaysAgo },
      limit: 100,
    });

    const successfulCharges = charges.data.filter(ch => ch.status === "succeeded");
    const monthlyRevenue = successfulCharges.reduce((sum, ch) => sum + ch.amount, 0);
    const totalCharges = successfulCharges.length;

    // Get recent payments for activity feed
    const recentPayments = await stripe.paymentIntents.list({ limit: 5 });

    return c.json({
      configured: true,
      availableBalance,
      pendingBalance,
      totalCustomers,
      monthlyRevenue,
      totalCharges,
      currency: balance.available[0]?.currency || "usd",
      recentPayments: recentPayments.data.map(pi => ({
        id: pi.id,
        amount: pi.amount,
        currency: pi.currency,
        status: pi.status,
        created: pi.created,
        description: pi.description,
      })),
    });
  } catch (err) {
    console.error("Stripe error:", err);
    return c.json({ error: "Failed to fetch Stripe data" }, 500);
  }
});

app.get("/api/stripe/customers", authMiddleware, async (c) => {
  if (!(await isUserAdmin(c))) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  try {
    const stripe = getStripe(c.env);
    if (!stripe) {
      return c.json({
        ...stripeUnavailableResponse(),
        customers: [],
      });
    }

    const customers = await stripe.customers.list({ limit: 50, expand: ["data.subscriptions"] });

    return c.json({
      configured: true,
      customers: customers.data.map(cust => ({
        id: cust.id,
        email: cust.email,
        name: cust.name,
        created: cust.created,
        subscriptions: cust.subscriptions?.data || [],
      })),
    });
  } catch (err) {
    console.error("Stripe error:", err);
    return c.json({ error: "Failed to fetch customers" }, 500);
  }
});

app.get("/api/stripe/payments", authMiddleware, async (c) => {
  if (!(await isUserAdmin(c))) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  try {
    const stripe = getStripe(c.env);
    if (!stripe) {
      return c.json({
        ...stripeUnavailableResponse(),
        payments: [],
        charges: [],
      });
    }

    const limit = parseInt(c.req.query("limit") || "25");

    const payments = await stripe.paymentIntents.list({ limit });
    const charges = await stripe.charges.list({ limit });

    return c.json({
      configured: true,
      payments: payments.data.map(pi => ({
        id: pi.id,
        amount: pi.amount,
        currency: pi.currency,
        status: pi.status,
        created: pi.created,
        description: pi.description,
        customer: pi.customer,
      })),
      charges: charges.data.map(ch => ({
        id: ch.id,
        amount: ch.amount,
        currency: ch.currency,
        status: ch.status,
        created: ch.created,
        description: ch.description,
        customer: ch.customer,
        receipt_url: ch.receipt_url,
      })),
    });
  } catch (err) {
    console.error("Stripe error:", err);
    return c.json({ error: "Failed to fetch payments" }, 500);
  }
});

app.get("/api/stripe/subscriptions", authMiddleware, async (c) => {
  if (!(await isUserAdmin(c))) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  try {
    const stripe = getStripe(c.env);
    if (!stripe) {
      return c.json({
        ...stripeUnavailableResponse(),
        total: 0,
        active: 0,
        canceled: 0,
        trialing: 0,
        subscriptions: [],
      });
    }

    const subscriptions = await stripe.subscriptions.list({ limit: 50, expand: ["data.customer"] });

    const active = subscriptions.data.filter(s => s.status === "active").length;
    const canceled = subscriptions.data.filter(s => s.status === "canceled").length;
    const trialing = subscriptions.data.filter(s => s.status === "trialing").length;

    return c.json({
      configured: true,
      total: subscriptions.data.length,
      active,
      canceled,
      trialing,
      subscriptions: subscriptions.data.map(sub => {
        const customer = sub.customer;
        let customerEmail: string | null = null;
        if (typeof customer === "object" && customer !== null && "email" in customer) {
          customerEmail = (customer as Stripe.Customer).email;
        }
        return {
          id: sub.id,
          status: sub.status,
          created: sub.created,
          current_period_end: (sub as { current_period_end?: number }).current_period_end || null,
          customer: typeof customer === "string" ? customer : customerEmail,
          plan: sub.items.data[0]?.price?.nickname || sub.items.data[0]?.price?.id,
          amount: sub.items.data[0]?.price?.unit_amount,
          interval: sub.items.data[0]?.price?.recurring?.interval,
        };
      }),
    });
  } catch (err) {
    console.error("Stripe error:", err);
    return c.json({ error: "Failed to fetch subscriptions" }, 500);
  }
});

// Mount community routes
app.route("/api/community", community);




// User preferences endpoints
app.get("/api/user/preferences", authMiddleware, async (c) => {
  const authUser = c.get("user");
  if (!authUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const sql = getDb(c.env);
  const [dbUser] = await sql<{ id: number }[]>`
    SELECT id FROM users WHERE email = ${authUser.email}
  `;

  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }

  const [prefs] = await sql`
    SELECT * FROM user_preferences WHERE user_id = ${dbUser.id}
  `;

  if (!prefs) {
    // Return defaults if no preferences set
    return c.json({
      email_thread_replies: true,
      email_mentions: true,
    });
  }

  return c.json(prefs);
});

app.put("/api/user/preferences", authMiddleware, async (c) => {
  const authUser = c.get("user");
  if (!authUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const sql = getDb(c.env);
  const [dbUser] = await sql<{ id: number }[]>`
    SELECT id FROM users WHERE email = ${authUser.email}
  `;

  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }

  const body = await c.req.json();
  const { email_thread_replies, email_mentions } = body;

  await sql`
    INSERT INTO user_preferences (user_id, email_thread_replies, email_mentions)
    VALUES (${dbUser.id}, ${email_thread_replies ? true : false}, ${email_mentions ? true : false})
    ON CONFLICT (user_id) DO UPDATE SET 
      email_thread_replies = EXCLUDED.email_thread_replies,
      email_mentions = EXCLUDED.email_mentions,
      updated_at = CURRENT_TIMESTAMP
  `;

  return c.json({ success: true });
});

// (health routes moved to top)

// Mount feature toggles routes
app.route("/api/feature-toggles", featureToggles);

// Mount maintenance routes
app.route("/api/maintenance", maintenance);

// Mount community uploads routes
app.route("/api/community-files", communityUploads);

// NStep AI Chat
app.post("/api/nstep-ai/chat", handleAiChat);

// ─── Knowledge API ────────────────────────────────────────────────────────────

/**
 * GET /api/knowledge/search?q=...&lane=...&topN=5
 * Lane-filtered full-text search against knowledge_chunks.
 * Used by the Studio Supervisor to retrieve grounded evidence.
 */
app.get("/api/knowledge/search", async (c) => {
  const q = c.req.query("q") ?? "";
  const lane = (c.req.query("lane") ?? null) as any;
  const topN = Math.min(20, Math.max(1, Number(c.req.query("topN") ?? 5)));

  if (!q.trim()) {
    return c.json({ error: "Query parameter 'q' is required." }, 400);
  }

  const db = getDb(c.env);
  const result = await searchKnowledgeChunks(db, { query: q, lane, topN });
  return c.json(result);
});

/**
 * GET /api/knowledge/health
 * Returns lane distribution of active chunks.
 * Use this as the go/no-go check after running seed:knowledge.
 */
app.get("/api/knowledge/health", async (c) => {
  const db = getDb(c.env);
  const lanes = await getKnowledgeLaneHealth(db);
  const total = lanes.reduce((sum, row) => sum + Number(row.chunk_count), 0);
  return c.json({
    status: total > 0 ? "ok" : "empty",
    total_chunks: total,
    lanes,
  });
});

// Global Not Found Handler (at the very end)
app.notFound(async (c) => {
  const path = c.req.path;
  console.log(`[Worker NotFound] Path: ${path}`);

  // API requests should never reach here if routes are correct, but if they do, 404
  if (path.startsWith("/api") || path.includes("/api/")) {
    return c.json({
      error: "API endpoint not found",
      path,
      method: c.req.method
    }, 404);
  }

  if (c.req.method === "GET" || c.req.method === "HEAD") {
    return serveAssetResponse(c);
  }

  return c.text("Not Found", 404);
});

export default app;
