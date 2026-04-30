import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import Stripe from "stripe";
import community from "./community";
import featureToggles from "./feature-toggles";
import maintenance from "./maintenance";
import communityUploads from "./community-uploads";
import appShellHtml from "../../dist/index.html";
import { getDb } from "./db";
import { sendEmail } from "./email";
import {
  previewInterestNotificationEmail,
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


const app = new Hono<{ Bindings: Env; Variables: { user: AppUser } }>({ strict: false });

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
        "https://northern-step-studio-website.proyectgate.workers.dev",
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

// Health check and diagnostics (moved to top to ensure matching)
app.get("/api/health", async (c) => {
  const env = c.env;
  let dbConnected = false;
  let dbError = null;
  try {
    const sql = getDb(env);
    await (async () => {
      await Promise.race([
        sql`SELECT 1 as ok`,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Database timeout")), 5000))
      ]);
      dbConnected = true;
    })();
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  return c.json({
    status: "ok",
    version: "1.0.3",
    path: c.req.path,
    url: c.req.url,
    environment: {
      has_database: Boolean(env.SUPABASE_DB_URL || env.DATABASE_URL),
      has_google_auth: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
      database_connected: dbConnected,
      database_error: dbError
    },
    timestamp: new Date().toISOString()
  });
});

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

// Create an API-scoped app
// (api instance removed - using app directly)

const STUDIO_CONTACT_EMAIL = "support@northernstepstudio.com";
const STUDIO_SUPPORT_EMAIL = "support@northernstepstudio.com";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUPPORT_REQUEST_PATTERN = /\b(support|bug|error|issue|billing|account|login|password|refund|problem|help)\b/i;
type ContactLeadStatus = "new" | "contacted" | "qualified" | "closed";
type ContactLeadIntent = "setup-review" | "lead-recovery-demo" | "automation-build" | "general-support";
type ContactLeadSummary = {
  total: number;
  setupReviews: number;
  liveDemos: number;
  needsReply: number;
  byStatus: Record<ContactLeadStatus, number>;
};

const CONTACT_LEAD_STATUSES = new Set<ContactLeadStatus>(["new", "contacted", "qualified", "closed"]);
const CONTACT_LEAD_INTENTS = new Set<ContactLeadIntent>([
  "setup-review",
  "lead-recovery-demo",
  "automation-build",
  "general-support",
]);

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

function normalizePhoneNumber(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const raw = value.trim();
  if (!raw) {
    return "";
  }

  const digits = raw.replace(/\D+/g, "");
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  if (digits.length >= 8 && digits.length <= 15) {
    return raw.startsWith("+") ? `+${digits}` : `+${digits}`;
  }

  return "";
}

function normalizeContactLeadStatus(value: unknown): ContactLeadStatus {
  const normalized = normalizeSingleLineText(value, 40).toLowerCase() as ContactLeadStatus;
  return CONTACT_LEAD_STATUSES.has(normalized) ? normalized : "new";
}

function normalizeContactLeadIntent(value: unknown): ContactLeadIntent | null {
  const normalized = normalizeSingleLineText(value, 80).toLowerCase() as ContactLeadIntent;
  return CONTACT_LEAD_INTENTS.has(normalized) ? normalized : null;
}

function normalizeContactLeadTier(value: unknown) {
  const normalized = normalizeSingleLineText(value, 40).toLowerCase();
  return normalized || null;
}

function normalizeContactLeadSource(value: unknown) {
  const normalized = normalizeSingleLineText(value, 80).toLowerCase();
  return normalized || "contact_page";
}

function extractContactBodyText(message: string) {
  const marker = "\n---\n";
  const index = message.indexOf(marker);
  return (index >= 0 ? message.slice(0, index) : message).trim();
}

function extractMessageMetadataValue(message: string, label: string) {
  const pattern = new RegExp(`^${label}:\\s*(.+)$`, "mi");
  const match = message.match(pattern);
  return match?.[1]?.trim() || null;
}

function inferContactLeadIntent(subject: string, message: string): ContactLeadIntent {
  const subjectLower = subject.toLowerCase();
  const bodyLower = message.toLowerCase();

  if (subjectLower.includes("setup review") || bodyLower.includes("average missed calls per day")) {
    return "setup-review";
  }
  if (subjectLower.includes("live lead recovery demo") || subjectLower.includes("live demo")) {
    return "lead-recovery-demo";
  }
  if (subjectLower.includes("automation build") || bodyLower.includes("main workflow to automate")) {
    return "automation-build";
  }
  return "general-support";
}

function inferRequestedTier(subject: string, message: string) {
  const messageTier = extractMessageMetadataValue(message, "Requested tier");
  if (messageTier) {
    return messageTier.toLowerCase();
  }

  const combined = `${subject}\n${message}`.toLowerCase();
  if (combined.includes("elite")) {
    return "elite";
  }
  if (combined.includes("starter")) {
    return "starter";
  }
  if (combined.includes("pro")) {
    return "pro";
  }
  return null;
}

function inferContactIndustry(message: string) {
  const industry = extractMessageMetadataValue(message, "Industry");
  return industry || null;
}

function readLegacyContactMessageMetadata(message: string) {
  const phone = extractMessageMetadataValue(message, "Mobile Phone") || extractMessageMetadataValue(message, "Best callback number");
  const smsConsentValue = extractMessageMetadataValue(message, "SMS Consent");

  return {
    phone: phone && phone !== "Not provided" ? phone : null,
    smsConsent: smsConsentValue ? smsConsentValue.toLowerCase().startsWith("yes") : false,
    industry: inferContactIndustry(message),
  };
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

  if (!dbUser && adminOnly) {
    dbUser = await bootstrapLocalOwnerPasswordLogin(c, email, password);
    
    // Production Bootstrapper (if enabled via environment variable)
    if (!dbUser && email === OWNER_EMAIL && c.env.OWNER_BOOTSTRAP_PASSWORD) {
      if (password === c.env.OWNER_BOOTSTRAP_PASSWORD) {
        console.log("[Auth] Bootstrapping owner account...");
        const credentials = await createPasswordCredentials(password);
        dbUser = await ensureDatabaseUser(c.env, email, "Northern Step Studio");
        await sql`
          UPDATE users 
          SET password_hash = ${credentials.password_hash}, 
              password_salt = ${credentials.password_salt},
              role = 'owner'
          WHERE id = ${dbUser.id}
        `;
        dbUser = await findDatabaseUserByEmail(c.env, email);
      }
    }
  }

  if (!dbUser) {
    return c.json({ error: getLoginErrorMessage(email, adminOnly) }, 404);
  }

  if (!dbUser.password_hash || !dbUser.password_salt) {
    return c.json(
      {
        error:
          "Password login is not enabled for this account yet. Sign in with Google first, then add a password from Preferences.",
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
  const body = await c.req.json().catch(() => null);
  const email = normalizeEmailAddress(body?.email);
  const password = typeof body?.password === "string" ? body.password : "";
  const displayName = normalizeSingleLineText(body?.displayName, 80);

  if (!email || !password) {
    return c.json({ error: "Email and password are required." }, 400);
  }

  if (!isValidEmailAddress(email)) {
    return c.json({ error: "Enter a valid email address." }, 400);
  }

  if (!validatePassword(password)) {
    return c.json({ error: "Password must be at least 8 characters long." }, 400);
  }

  if (email === OWNER_EMAIL) {
    return c.json({ error: `Use /admin/login for ${OWNER_EMAIL}.` }, 403);
  }

  const sql = getDb(c.env);
  const [existingUser] = await sql`SELECT * FROM users WHERE email = ${email}`;
  if (existingUser) {
    if (existingUser.password_hash && existingUser.password_salt) {
      return c.json({ error: "An account with this email already exists. Sign in instead." }, 409);
    }

    return c.json(
      {
        error:
          "This account already exists, but password login is not enabled yet. Continue with Google first, then add a password from Preferences.",
      },
      409,
    );
  }

  const credentials = await createPasswordCredentials(password);
  const resolvedDisplayName = displayName || email.split("@")[0];

  await sql`
    INSERT INTO users (email, role, display_name, password_hash, password_salt)
    VALUES (${email}, 'user', ${resolvedDisplayName}, ${credentials.password_hash}, ${credentials.password_salt})
  `;

  const [dbUser] = await sql<any[]>`SELECT * FROM users WHERE email = ${email}`;
  if (!dbUser) {
    return c.json({ error: "Unable to create account right now." }, 500);
  }

  await clearAuthSessions(c);
  await createLocalSession(c, dbUser.id);

  return c.json({ success: true, user: toLocalAppUser(dbUser) }, 201);
}

// (Duplicate routes removed - consolidate definitions below)

function resolveContactDestination(subject: string, message: string) {
  return SUPPORT_REQUEST_PATTERN.test(`${subject}\n${message}`) ? STUDIO_SUPPORT_EMAIL : STUDIO_CONTACT_EMAIL;
}

function mapContactMessageRecord(row: Record<string, unknown>) {
  const rawMessage = typeof row.message === "string" ? row.message : "";
  const legacy = readLegacyContactMessageMetadata(rawMessage);
  const subject = typeof row.subject === "string" ? row.subject : "";
  const phone = normalizePhoneNumber(row.phone) || legacy.phone || "";
  const smsConsent = Number(row.sms_consent ?? 0) === 1 || legacy.smsConsent;
  const industry =
    (typeof row.industry === "string" && row.industry.trim()) ||
    legacy.industry ||
    "";
  const intent =
    normalizeContactLeadIntent(row.intent) ||
    inferContactLeadIntent(subject, rawMessage);
  const requestedTier =
    normalizeContactLeadTier(row.requested_tier) ||
    inferRequestedTier(subject, rawMessage);

  return {
    id: Number(row.id),
    name: typeof row.name === "string" ? row.name : "",
    email: typeof row.email === "string" ? row.email : "",
    phone,
    subject,
    message: extractContactBodyText(rawMessage),
    destination_email: typeof row.destination_email === "string" ? row.destination_email : "",
    email_sent: Number(row.email_sent ?? 0) === 1,
    email_error: typeof row.email_error === "string" ? row.email_error : null,
    email_message_id: typeof row.email_message_id === "string" ? row.email_message_id : null,
    source: normalizeContactLeadSource(row.source),
    intent,
    requested_tier: requestedTier,
    industry,
    sms_consent: smsConsent,
    status: normalizeContactLeadStatus(row.status),
    admin_notes: typeof row.admin_notes === "string" ? row.admin_notes : "",
    contacted_at: typeof row.contacted_at === "string" ? row.contacted_at : null,
    created_at: typeof row.created_at === "string" ? row.created_at : "",
    updated_at: typeof row.updated_at === "string" ? row.updated_at : "",
  };
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

async function getIntegrationStatus(env: Env) {
  let dbConnected = false;
  const sql = getDb(env);

  try {
    const [probe] = await sql<{ ok: number }[]>`SELECT 1 as ok`;
    dbConnected = probe?.ok === 1;
  } catch {
    dbConnected = false;
  }

  let supabaseHost: string | null = null;
  if (env.SUPABASE_URL) {
    try {
      supabaseHost = new URL(env.SUPABASE_URL).host;
    } catch {
      supabaseHost = null;
    }
  }

  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
  let supabaseConnectionStatus: "not_configured" | "ready" | "failed" = "not_configured";
  let supabaseConnectionError: string | null = null;

  if (env.SUPABASE_URL && supabaseKey) {
    try {
      const response = await fetch(new URL("/auth/v1/settings", env.SUPABASE_URL).toString(), {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
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
  }

  return {
    database: {
      dbConfigured: Boolean(env.DATABASE_URL || env.SUPABASE_DB_URL),
      dbConnected,
    },
    cloudflare: {
      r2Configured: Boolean(env.R2_BUCKET && typeof env.R2_BUCKET.put === "function"),
      emailServiceConfigured: true, // Integrated via sendEmail helper
    },
    supabase: {
      urlConfigured: Boolean(env.SUPABASE_URL),
      anonKeyConfigured: Boolean(env.SUPABASE_ANON_KEY),
      serviceRoleKeyConfigured: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
      projectRefConfigured: Boolean(env.SUPABASE_PROJECT_REF),
      host: supabaseHost,
      connectionStatus: supabaseConnectionStatus,
      connectionError: supabaseConnectionError,
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

// OAuth redirect URL (moved to app)
app.get("/api/oauth/google/redirect_url", async (c) => {
  try {
    const redirectUri = c.req.query("redirectUri");
    const redirectUrl = await getGoogleOAuthRedirectUrl(c, redirectUri);
    return c.json({ redirectUrl }, 200);
  } catch (error) {
    console.error("Failed to create Google OAuth redirect URL:", error);
    return c.json({ error: "Google auth is not configured" }, 503);
  }
});

// (api route mounting removed)

// OAuth callback
app.get("/api/oauth/google/callback", async (c) => {
  const code = c.req.query("code");
  if (!code) {
    return c.redirect("/login?error=missing_code");
  }

  // Redirect to the frontend callback page with the code.
  // The frontend component (AuthCallback.tsx) will then call /api/sessions 
  // to perform the actual token exchange. This consolidates the logic.
  return c.redirect(`/auth/callback?code=${code}`);
});

// Exchange code for session token (legacy compatibility or frontend flow)
app.post("/api/sessions", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.code) {
      return c.json({ error: "No authorization code provided" }, 400);
    }

    const googleUser = await exchangeGoogleCodeForUser(c, body.code, body.redirectUri);
    const dbUser = await ensureDatabaseUser(
      c.env,
      googleUser.email,
      googleUser.name || googleUser.given_name || null
    );

    await createLocalSession(c, dbUser.id);

    return c.json({ success: true }, 200);
  } catch (error) {
    console.error("Failed to exchange Google auth code:", error);
    return c.json({ error: "Failed to create session" }, 503);
  }
});

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
    const phone = normalizePhoneNumber(body?.phone);
    const subject = normalizeSingleLineText(body?.subject, 160);
    const message = normalizeMultilineText(body?.message, 5000);
    const smsConsent = body?.smsConsent === true;
    const source = normalizeContactLeadSource(body?.source);
    const intent = normalizeContactLeadIntent(body?.intent) || inferContactLeadIntent(subject, message);
    const requestedTier = normalizeContactLeadTier(body?.requestedTier) || inferRequestedTier(subject, message);
    const industry = normalizeSingleLineText(body?.industry, 120) || inferContactIndustry(message);

    if (!name || !email || !subject || !message) {
      return c.json({ error: "Name, email, subject, and message are required." }, 400);
    }

    if (!isValidEmailAddress(email)) {
      return c.json({ error: "Enter a valid email address." }, 400);
    }

    if (smsConsent && !phone) {
      return c.json({ error: "Enter a valid mobile phone number before opting into SMS." }, 400);
    }

    const messageWithContactMeta = [
      message,
      "",
      "---",
      `Lead Source: ${source}`,
      `Lead Intent: ${intent || "general-support"}`,
      `Requested Tier: ${requestedTier || "Not provided"}`,
      `Industry: ${industry || "Not provided"}`,
      `Mobile Phone: ${phone || "Not provided"}`,
      `SMS Consent: ${smsConsent ? "Yes - website checkbox" : "No"}`,
    ].join("\n");

    const destinationEmail = resolveContactDestination(subject, message);
    const sql = getDb(c.env);
    const [inserted] = await sql<{ id: number }[]>`
      INSERT INTO contact_messages (
         name,
         email,
         phone,
         subject,
         message,
         destination_email,
         sms_consent,
         source,
         intent,
         requested_tier,
         industry,
         status
       )
       VALUES (
         ${name}, ${email}, ${phone || null}, ${subject}, ${messageWithContactMeta}, 
         ${destinationEmail}, ${smsConsent ? true : false}, ${source}, ${intent}, 
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
          phone: phone || null,
          subject,
          message,
          smsConsent,
        }),
        text_body: [
          "New contact submission from Northern Step Studio",
          "",
          `Name: ${name}`,
          `Email: ${email}`,
          `Lead Source: ${source}`,
          `Lead Intent: ${intent || "general-support"}`,
          `Requested Tier: ${requestedTier || "Not provided"}`,
          `Industry: ${industry || "Not provided"}`,
          `Mobile Phone: ${phone || "Not provided"}`,
          `SMS Consent: ${smsConsent ? "Yes - website checkbox" : "No"}`,
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

app.post("/api/contact/preview", async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    const email = normalizeEmailAddress(body?.email);
    const interest = normalizeMultilineText(body?.interest, 500);
    const source = normalizeSingleLineText(body?.source, 80) || "contact_page";

    if (!email) {
      return c.json({ error: "Email is required." }, 400);
    }

    if (!isValidEmailAddress(email)) {
      return c.json({ error: "Enter a valid email address." }, 400);
    }

    const sql = getDb(c.env);
    const [existing] = await sql<{ id: number; email_sent: boolean; email_error: string | null }[]>`
      SELECT id, email_sent, email_error FROM preview_interest WHERE email = ${email}
    `;

    if (existing) {
      await sql`
        UPDATE preview_interest
         SET interest = ${interest || null}, source = ${source}, updated_at = CURRENT_TIMESTAMP
         WHERE id = ${existing.id}
      `;

      return c.json({
        success: true,
        id: existing.id,
        already_exists: true,
        email_sent: existing.email_sent,
        email_error: existing.email_error,
        delivery_status: existing.email_sent ? "sent" : "saved_only",
      });
    }

    const [inserted] = await sql<{ id: number }[]>`
      INSERT INTO preview_interest (email, interest, source)
       VALUES (${email}, ${interest || null}, ${source})
       RETURNING id
    `;

    const interestId = inserted.id;
    let emailSent = false;
    let emailError: string | null = null;
    let providerMessageId: string | null = null;

    try {
      const sendResult = await sendEmail(c.env, {
        to: STUDIO_CONTACT_EMAIL,
        subject: "[Early Access] New signup",
        reply_to: email,
        html_body: previewInterestNotificationEmail({
          email,
          interest: interest || null,
        }),
        text_body: [
          "New early access interest from Northern Step Studio",
          "",
          `Email: ${email}`,
          interest ? `Interested in: ${interest}` : "Interested in: Not specified",
        ].join("\n"),
      });

      emailSent = sendResult.success;
      providerMessageId = sendResult.message_id || null;
      if (!emailSent) {
        emailError = sendResult.error || "Email service did not confirm delivery";
      }
    } catch (error) {
      emailError = error instanceof Error ? error.message : "Failed to forward early access signup";
    }

    await sql`
      UPDATE preview_interest
       SET email_sent = ${emailSent ? true : false}, email_error = ${emailError}, 
           email_message_id = ${providerMessageId}, updated_at = CURRENT_TIMESTAMP
       WHERE id = ${interestId}
    `;

    return c.json(
      {
        success: true,
        id: interestId,
        email_sent: emailSent,
        email_error: emailError,
        delivery_status: emailSent ? "sent" : "saved_only",
      },
      201,
    );
  } catch (error) {
    console.error("Failed to save early access interest:", error);
    return c.json({ error: "Failed to join the early access list right now." }, 500);
  }
});

app.get("/api/admin/contact-messages", authMiddleware, async (c) => {
  const role = await requireRole(c, ["owner", "admin", "moderator"]);
  if (!role) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const sql = getDb(c.env);
  const results = await sql`
    SELECT
       id,
       name,
       email,
       phone,
       subject,
       message,
       destination_email,
       email_sent,
       email_error,
       email_message_id,
       source,
       intent,
       requested_tier,
       industry,
       sms_consent,
       status,
       admin_notes,
       contacted_at,
       created_at,
       updated_at
     FROM contact_messages
     ORDER BY created_at DESC
  `;

  const items = (results as Record<string, unknown>[]).map((row) => mapContactMessageRecord(row));
  const summary = items.reduce<ContactLeadSummary>(
    (acc, item) => {
      acc.total += 1;
      acc.byStatus[item.status] += 1;
      if (item.intent === "setup-review") {
        acc.setupReviews += 1;
      }
      if (item.intent === "lead-recovery-demo") {
        acc.liveDemos += 1;
      }
      if (item.status === "new") {
        acc.needsReply += 1;
      }
      return acc;
    },
    {
      total: 0,
      setupReviews: 0,
      liveDemos: 0,
      needsReply: 0,
      byStatus: {
        new: 0,
        contacted: 0,
        qualified: 0,
        closed: 0,
      },
    },
  );

  return c.json({ items, summary });
});

app.put("/api/admin/contact-messages/:id", authMiddleware, async (c) => {
  const role = await requireRole(c, ["owner", "admin", "moderator"]);
  if (!role) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ error: "Invalid contact message id." }, 400);
  }

  const sql = getDb(c.env);
  const [existing] = await sql<Record<string, unknown>[]>`
    SELECT
       id,
       name,
       email,
       phone,
       subject,
       message,
       destination_email,
       email_sent,
       email_error,
       email_message_id,
       source,
       intent,
       requested_tier,
       industry,
       sms_consent,
       status,
       admin_notes,
       contacted_at,
       created_at,
       updated_at
     FROM contact_messages
     WHERE id = ${id}
  `;

  if (!existing) {
    return c.json({ error: "Contact message not found." }, 404);
  }

  const body = await c.req.json().catch(() => null);
  const nextStatus =
    body && Object.prototype.hasOwnProperty.call(body, "status")
      ? normalizeContactLeadStatus(body?.status)
      : normalizeContactLeadStatus(existing.status);
  const nextNotes =
    body && Object.prototype.hasOwnProperty.call(body, "admin_notes")
      ? normalizeMultilineText(body?.admin_notes, 4000)
      : typeof existing.admin_notes === "string"
        ? existing.admin_notes
        : "";
  
  const existingContactedAt = existing.contacted_at ? new Date(existing.contacted_at as string).toISOString() : null;
  const contactedAt = nextStatus === "contacted" && !existingContactedAt
    ? new Date().toISOString()
    : existingContactedAt;

  await sql`
    UPDATE contact_messages
     SET status = ${nextStatus}, admin_notes = ${nextNotes || null}, 
         contacted_at = ${contactedAt}, updated_at = CURRENT_TIMESTAMP
     WHERE id = ${id}
  `;

  const [updated] = await sql<Record<string, unknown>[]>`
    SELECT
       id,
       name,
       email,
       phone,
       subject,
       message,
       destination_email,
       email_sent,
       email_error,
       email_message_id,
       source,
       intent,
       requested_tier,
       industry,
       sms_consent,
       status,
       admin_notes,
       contacted_at,
       created_at,
       updated_at
     FROM contact_messages
     WHERE id = ${id}
  `;

  return c.json({
    success: true,
    item: updated ? mapContactMessageRecord(updated) : null,
  });
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
  const file = formData.get("logo") as File;

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
  const file = formData.get("screenshot") as File;

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
  const results = await sql`
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

  // Total events
  const [totalEventsResult] = await sql<{ count: number }[]>`
    SELECT COUNT(*) as count FROM analytics WHERE timestamp >= CURRENT_TIMESTAMP - (interval '1 day' * ${days})
  `;
  const totalEvents = totalEventsResult?.count || 0;

  // Unique users
  const [uniqueUsersResult] = await sql<{ count: number }[]>`
    SELECT COUNT(DISTINCT user_id) as count FROM analytics 
    WHERE timestamp >= CURRENT_TIMESTAMP - (interval '1 day' * ${days}) AND user_id IS NOT NULL
  `;
  const uniqueUsers = uniqueUsersResult?.count || 0;

  // Top apps
  const topApps = await sql`
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
  const eventsByType = await sql`
    SELECT event as name, COUNT(*) as value 
     FROM analytics 
     WHERE timestamp >= CURRENT_TIMESTAMP - (interval '1 day' * ${days})
     GROUP BY event 
     ORDER BY value DESC
  `;

  // Daily visits
  const dailyVisits = await sql`
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

  return c.json({ role: dbUser.role });
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

async function deleteManagedProfileAvatar(bucket: R2Bucket, avatarUrl: string | null, userId: number) {
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
  const file = formData.get("avatar");

  if (!(file instanceof File)) {
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
  const sql = getDb(c.env);
  const results = await sql`
    SELECT * FROM role_permissions ORDER BY role, page
  `;

  return c.json(results);
});

app.get("/api/permissions/:role", authMiddleware, async (c) => {
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
        configured: false,
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
        configured: false,
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
        configured: false,
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
        configured: false,
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

// Global Not Found Handler (at the very end)
app.notFound((c) => {
  const path = c.req.path;
  console.log(`[Worker NotFound] Path: ${path}`);

  if (path.startsWith("/api") || path.includes("/api/")) {
    return c.json({
      error: "API endpoint not found",
      path,
      method: c.req.method
    }, 404);
  }

  if (c.req.method === "GET" || c.req.method === "HEAD") {
    if (c.env.ASSETS && typeof c.env.ASSETS.fetch === "function") {
      return c.env.ASSETS.fetch(c.req.raw);
    }

    return c.html(appShellHtml);
  }

  return c.text("Not Found", 404);
});

export default app;
