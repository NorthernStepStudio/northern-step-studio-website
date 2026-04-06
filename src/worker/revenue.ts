import { Hono, type Context } from "hono";
import { OWNER_EMAIL } from "../shared/auth";
import {
  LEAD_RECOVERY_DEFAULT_TENANT_ID,
  createDemoLeadRecoveryWorkspace,
  type LeadRecoveryActivity,
  type LeadRecoveryLead,
  type LeadRecoverySettings,
  type LeadRecoveryTask,
  type LeadRecoveryWorkspace,
} from "../shared/lead-recovery";
import { authMiddleware, type AppUser } from "./auth";
import { getDb, type Env } from "./db";
import { normalizeMultilineText, normalizeSingleLineText } from "./utils";

const revenue = new Hono<{ Bindings: Env; Variables: { user: AppUser } }>();
const memoryWorkspaces = new Map<string, LeadRecoveryWorkspace>();

type RevenueRow = Record<string, unknown>;

function isLocalhostRequest(requestUrl: string) {
  const hostname = new URL(requestUrl).hostname;
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

function cloneWorkspace(workspace: LeadRecoveryWorkspace): LeadRecoveryWorkspace {
  return JSON.parse(JSON.stringify(workspace)) as LeadRecoveryWorkspace;
}

function safeJsonParse<T>(value: unknown, fallback: T): T {
  if (value == null || value === "") {
    return fallback;
  }

  if (typeof value === "object") {
    return value as T;
  }

  if (typeof value !== "string") {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    return value === "1" || value.toLowerCase() === "true";
  }

  return fallback;
}

function normalizeLeadStage(value: unknown): LeadRecoveryLead["stage"] {
  const normalized = normalizeSingleLineText(asString(value), 24).toLowerCase();
  if (normalized === "engaged" || normalized === "qualified" || normalized === "recovered" || normalized === "closed") {
    return normalized;
  }

  return "new";
}

function normalizeConversationMode(value: unknown): LeadRecoveryLead["conversationMode"] {
  const normalized = normalizeSingleLineText(asString(value), 32).toLowerCase();
  if (normalized === "suggest-only" || normalized === "manual") {
    return normalized;
  }

  return "auto-reply";
}

function createEmptyWorkspace(tenantId: string): LeadRecoveryWorkspace {
  const base = cloneWorkspace(createDemoLeadRecoveryWorkspace(tenantId));
  return {
    ...base,
    sample: false,
    metrics: {
      missedCallsRecovered: 0,
      inboundAutoReplies: 0,
      leadIntakes: 0,
      actionSuccess: 0,
      actionFailures: 0,
    },
    leads: [],
    followups: [],
    activity: [],
    tasks: [],
    onboarding: {
      ...base.onboarding,
      mode: "protected",
      summary: {
        requiredComplete: 0,
        requiredTotal: base.onboarding.summary.requiredTotal,
        blockerCount: 0,
        missingCount: base.onboarding.summary.requiredTotal,
      },
    },
    summary: {
      leadCount: 0,
      pendingFollowups: 0,
      dueFollowups: 0,
      lastActivityAt: undefined,
      openTaskCount: 0,
      mode: "protected",
    },
  };
}

function buildResponseWorkspace(workspace: LeadRecoveryWorkspace) {
  const nextWorkspace = cloneWorkspace(workspace);
  const followups = nextWorkspace.tasks.filter((task) => task.taskType === "followup");
  const openTasks = nextWorkspace.tasks.filter((task) => task.taskType !== "followup" && task.status !== "done");

  nextWorkspace.followups = followups;
  nextWorkspace.metrics = {
    ...nextWorkspace.metrics,
    missedCallsRecovered: Math.max(
      nextWorkspace.metrics.missedCallsRecovered,
      nextWorkspace.leads.filter((lead) => lead.stage === "recovered").length,
    ),
    inboundAutoReplies: Math.max(
      nextWorkspace.metrics.inboundAutoReplies,
      nextWorkspace.activity.filter((item) => item.direction === "outbound").length,
    ),
    leadIntakes: Math.max(nextWorkspace.metrics.leadIntakes, nextWorkspace.leads.length),
    actionSuccess:
      nextWorkspace.metrics.actionSuccess ||
      (nextWorkspace.leads.length > 0
        ? Math.min(100, Math.round((nextWorkspace.leads.filter((lead) => lead.stage === "recovered").length / nextWorkspace.leads.length) * 100))
        : 0),
    lastUpdatedAt: nextWorkspace.activity[0]?.timestamp || nextWorkspace.metrics.lastUpdatedAt,
  };
  nextWorkspace.summary = {
    leadCount: nextWorkspace.leads.length,
    pendingFollowups: followups.filter((task) => task.status !== "done").length,
    dueFollowups: followups.filter(
      (task) => task.status !== "done" && task.scheduledFor && new Date(task.scheduledFor).getTime() <= Date.now(),
    ).length,
    lastActivityAt: nextWorkspace.activity[0]?.timestamp,
    openTaskCount: openTasks.length,
    mode: nextWorkspace.onboarding.mode,
  };

  return nextWorkspace;
}

function mapLeadRow(row: RevenueRow): LeadRecoveryLead {
  const messaging = safeJsonParse<Record<string, unknown>>(row.messaging_json, {});
  const intake = safeJsonParse<Record<string, unknown>>(row.intake_json, {});

  return {
    leadId: asString(row.lead_id),
    phone: asString(row.phone),
    name: asString(row.name, "") || undefined,
    email: asString(row.email, "") || undefined,
    serviceCategory: asString(row.service_category, "") || undefined,
    stage: normalizeLeadStage(row.stage),
    urgencyScore: asNumber(row.urgency_score, 0),
    urgencyLabel: (["normal", "priority", "emergency"].includes(asString(row.urgency_label))
      ? asString(row.urgency_label)
      : "normal") as LeadRecoveryLead["urgencyLabel"],
    address: asString(row.address, "") || undefined,
    notes: asString(row.notes, "") || undefined,
    lastInboundMessage: asString(row.last_inbound_message, "") || undefined,
    conversationMode: normalizeConversationMode(row.conversation_mode),
    messaging: {
      consentStatus: (["unknown", "active", "opted_out"].includes(asString(messaging.consentStatus))
        ? asString(messaging.consentStatus)
        : "unknown") as LeadRecoveryLead["messaging"]["consentStatus"],
      consentSource: asString(messaging.consentSource, "") || undefined,
      consentUpdatedAt: asString(messaging.consentUpdatedAt, "") || undefined,
      optedOutAt: asString(messaging.optedOutAt, "") || undefined,
      lastHelpSentAt: asString(messaging.lastHelpSentAt, "") || undefined,
      lastKeyword: asString(messaging.lastKeyword, "") || undefined,
      lastOutboundStatus: asString(messaging.lastOutboundStatus, "") || undefined,
      lastOutboundStatusAt: asString(messaging.lastOutboundStatusAt, "") || undefined,
      lastOutboundMessageSid: asString(messaging.lastOutboundMessageSid, "") || undefined,
      lastOutboundError: asString(messaging.lastOutboundError, "") || undefined,
    },
    intake: {
      status: (["idle", "in_progress", "completed"].includes(asString(intake.status))
        ? asString(intake.status)
        : "idle") as LeadRecoveryLead["intake"]["status"],
      playbook: "starter_plumbing",
      currentQuestionKey: ([
        "issue_type",
        "other_detail",
        "severity_detail",
        "urgency",
        "location",
        "customer_name",
      ].includes(asString(intake.currentQuestionKey))
        ? asString(intake.currentQuestionKey)
        : undefined) as LeadRecoveryLead["intake"]["currentQuestionKey"],
      answers: safeJsonParse<Record<string, string | undefined>>(intake.answers, {}),
      startedAt: asString(intake.startedAt, "") || undefined,
      completedAt: asString(intake.completedAt, "") || undefined,
      ownerSummarySentAt: asString(intake.ownerSummarySentAt, "") || undefined,
    },
    updatedAt: asString(row.updated_at),
    createdAt: asString(row.created_at),
  };
}

function mapActivityRow(row: RevenueRow): LeadRecoveryActivity {
  return {
    activityId: asString(row.activity_id),
    kind: asString(row.kind, "event.processed"),
    status: asString(row.status, "done"),
    title: asString(row.title, ""),
    summary: asString(row.summary, ""),
    body: asString(row.body, "") || undefined,
    leadId: asString(row.lead_id, "") || undefined,
    channel: (["sms", "call", "system"].includes(asString(row.channel)) ? asString(row.channel) : "system") as LeadRecoveryActivity["channel"],
    direction: (["inbound", "outbound", "system"].includes(asString(row.direction)) ? asString(row.direction) : "system") as LeadRecoveryActivity["direction"],
    timestamp: asString(row.created_at),
  };
}

function mapTaskRow(row: RevenueRow): LeadRecoveryTask {
  return {
    taskId: asString(row.task_id),
    taskType: asString(row.task_type, "human_task") === "followup" ? "followup" : "human_task",
    title: asString(row.title, ""),
    detail: asString(row.detail, ""),
    status: (["open", "scheduled", "blocked", "done"].includes(asString(row.status)) ? asString(row.status) : "open") as LeadRecoveryTask["status"],
    severity: (["low", "normal", "high", "critical"].includes(asString(row.severity)) ? asString(row.severity) : "normal") as LeadRecoveryTask["severity"],
    leadId: asString(row.lead_id, "") || undefined,
    scheduledFor: asString(row.scheduled_for, "") || undefined,
    completedAt: asString(row.completed_at, "") || undefined,
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
}

async function requireRevenueAdmin(c: Context<{ Bindings: Env; Variables: { user: AppUser } }>) {
  const authUser = c.get("user");
  if (!authUser) {
    return null;
  }

  if (authUser.email === OWNER_EMAIL) {
    return "owner";
  }

  const sql = getDb(c.env);
  const [dbUser] = await sql<{ role: string }[]>`
    SELECT role FROM users WHERE email = ${authUser.email}
  `.catch(() => [] as { role: string }[]);

  const role = dbUser?.role || "user";
  return role === "owner" || role === "admin" ? role : null;
}

async function loadWorkspaceFromDb(c: Context<{ Bindings: Env; Variables: { user: AppUser } }>, tenantId: string) {
  const sql = getDb(c.env);

  const [tenant] = await sql<RevenueRow[]>`
    SELECT *
    FROM nstep_revenue_tenants
    WHERE tenant_id = ${tenantId}
    LIMIT 1
  `.catch(() => [] as RevenueRow[]);

  if (!tenant) {
    return null;
  }

  const leads = await sql<RevenueRow[]>`
    SELECT *
    FROM nstep_revenue_leads
    WHERE tenant_id = ${tenantId}
    ORDER BY updated_at DESC, created_at DESC
  `.catch(() => [] as RevenueRow[]);

  const activity = await sql<RevenueRow[]>`
    SELECT *
    FROM nstep_revenue_activity
    WHERE tenant_id = ${tenantId}
    ORDER BY created_at DESC
  `.catch(() => [] as RevenueRow[]);

  const tasks = await sql<RevenueRow[]>`
    SELECT *
    FROM nstep_revenue_tasks
    WHERE tenant_id = ${tenantId}
    ORDER BY
      CASE WHEN scheduled_for IS NULL THEN 1 ELSE 0 END,
      scheduled_for ASC,
      updated_at DESC
  `.catch(() => [] as RevenueRow[]);

  const profileJson = safeJsonParse<Record<string, unknown>>(tenant.profile_json, {});
  const settingsJson = safeJsonParse<Record<string, unknown>>(tenant.settings_json, {});
  const metricsJson = safeJsonParse<Record<string, unknown>>(tenant.metrics_json, {});
  const onboardingJson = safeJsonParse<Record<string, unknown>>(tenant.onboarding_json, {});

  const workspace = createEmptyWorkspace(tenantId);
  workspace.sample = false;
  workspace.profile = {
    ...workspace.profile,
    ...profileJson,
    businessId: asString(profileJson.businessId, asString(tenant.tenant_id)),
    businessName: asString(profileJson.businessName, asString(tenant.business_name)),
    mainBusinessNumber: asString(profileJson.mainBusinessNumber, asString(tenant.main_business_number)),
    callbackNumber: asString(profileJson.callbackNumber, asString(tenant.callback_number)),
    services: Array.isArray(profileJson.services) ? (profileJson.services.filter((item) => typeof item === "string") as string[]) : workspace.profile.services,
    mainBusinessNumbers: Array.isArray(profileJson.mainBusinessNumbers) ? (profileJson.mainBusinessNumbers.filter((item) => typeof item === "string") as string[]) : workspace.profile.mainBusinessNumbers,
  };
  const automationJson = safeJsonParse<Record<string, unknown>>(settingsJson.automation, {});
  const smsJson = safeJsonParse<Record<string, unknown>>(settingsJson.sms, {});
  const emailJson = safeJsonParse<Record<string, unknown>>(settingsJson.email, {});
  const calendarJson = safeJsonParse<Record<string, unknown>>(settingsJson.calendar, {});

  workspace.settings = {
    ...workspace.settings,
    ...settingsJson,
    websiteUrl: asString(settingsJson.websiteUrl, workspace.profile.websiteUrl),
    bookingLink: asString(settingsJson.bookingLink, workspace.profile.bookingLink),
    reviewUrl: asString(settingsJson.reviewUrl, workspace.profile.reviewUrl),
    ownerAlertDestination: asString(settingsJson.ownerAlertDestination, workspace.profile.ownerAlertDestination),
    contactEmail: asString(settingsJson.contactEmail, workspace.profile.contactEmail),
    automation: {
      ...workspace.settings.automation,
      ...automationJson,
      tier: asString(automationJson.tier, asString(tenant.automation_tier, "starter")) as LeadRecoverySettings["automation"]["tier"],
      mode: asString(automationJson.mode, asString(tenant.automation_mode, "hybrid")) as LeadRecoverySettings["automation"]["mode"],
    },
    sms: {
      ...workspace.settings.sms,
      ...smsJson,
      live: asBoolean(smsJson.live, asBoolean(tenant.sms_live, false)),
      number: asString(smsJson.number, asString(tenant.sms_number)),
      accountSid: asString(smsJson.accountSid, asString(tenant.sms_account_sid)),
      heartbeatAt: asString(smsJson.heartbeatAt, asString(tenant.sms_heartbeat_at, "")) || undefined,
      latencyMs: asNumber(smsJson.latencyMs, asNumber(tenant.sms_latency_ms, 0)),
      status: asString(smsJson.status, asBoolean(tenant.sms_live, false) ? "ready" : "needs_setup"),
      detail: asString(smsJson.detail, asString(tenant.sms_detail)),
    },
    email: {
      ...workspace.settings.email,
      ...emailJson,
      live: asBoolean(emailJson.live, asBoolean(tenant.email_live, false)),
    },
    calendar: {
      ...workspace.settings.calendar,
      ...calendarJson,
      live: asBoolean(calendarJson.live, asBoolean(tenant.calendar_live, false)),
    },
  };
  workspace.metrics = {
    ...workspace.metrics,
    ...metricsJson,
    missedCallsRecovered: asNumber(metricsJson.missedCallsRecovered, workspace.metrics.missedCallsRecovered),
    inboundAutoReplies: asNumber(metricsJson.inboundAutoReplies, workspace.metrics.inboundAutoReplies),
    leadIntakes: asNumber(metricsJson.leadIntakes, workspace.metrics.leadIntakes),
    actionSuccess: asNumber(metricsJson.actionSuccess, workspace.metrics.actionSuccess),
    actionFailures: asNumber(metricsJson.actionFailures, workspace.metrics.actionFailures),
    lastUpdatedAt: asString(metricsJson.lastUpdatedAt, workspace.metrics.lastUpdatedAt || "") || undefined,
  };
  workspace.onboarding = {
    ...workspace.onboarding,
    ...onboardingJson,
    mode: asString(onboardingJson.mode, asBoolean(tenant.sms_live, false) ? "live" : "protected") as "protected" | "live",
    checklist: Array.isArray(onboardingJson.checklist)
      ? (onboardingJson.checklist.filter((item) => typeof item === "object") as LeadRecoveryWorkspace["onboarding"]["checklist"])
      : workspace.onboarding.checklist,
    channels: {
      sms: {
        status: asString((onboardingJson.channels as Record<string, unknown> | undefined)?.sms && typeof (onboardingJson.channels as Record<string, unknown>).sms === "object"
          ? ((onboardingJson.channels as Record<string, unknown>).sms as Record<string, unknown>).status
          : null, workspace.settings.sms.status),
        provider: asString((onboardingJson.channels as Record<string, unknown> | undefined)?.sms && typeof (onboardingJson.channels as Record<string, unknown>).sms === "object"
          ? ((onboardingJson.channels as Record<string, unknown>).sms as Record<string, unknown>).provider
          : null, workspace.settings.sms.provider),
        connectorId: asString((onboardingJson.channels as Record<string, unknown> | undefined)?.sms && typeof (onboardingJson.channels as Record<string, unknown>).sms === "object"
          ? ((onboardingJson.channels as Record<string, unknown>).sms as Record<string, unknown>).connectorId
          : null, workspace.settings.sms.connectorId) || undefined,
        live: asBoolean((onboardingJson.channels as Record<string, unknown> | undefined)?.sms && typeof (onboardingJson.channels as Record<string, unknown>).sms === "object"
          ? ((onboardingJson.channels as Record<string, unknown>).sms as Record<string, unknown>).live
          : null, workspace.settings.sms.live),
        detail: asString((onboardingJson.channels as Record<string, unknown> | undefined)?.sms && typeof (onboardingJson.channels as Record<string, unknown>).sms === "object"
          ? ((onboardingJson.channels as Record<string, unknown>).sms as Record<string, unknown>).detail
          : null, workspace.settings.sms.detail),
      },
      email: {
        status: asString((onboardingJson.channels as Record<string, unknown> | undefined)?.email && typeof (onboardingJson.channels as Record<string, unknown>).email === "object"
          ? ((onboardingJson.channels as Record<string, unknown>).email as Record<string, unknown>).status
          : null, workspace.settings.email.live ? "ready" : "needs_setup"),
        provider: asString((onboardingJson.channels as Record<string, unknown> | undefined)?.email && typeof (onboardingJson.channels as Record<string, unknown>).email === "object"
          ? ((onboardingJson.channels as Record<string, unknown>).email as Record<string, unknown>).provider
          : null, workspace.settings.email.provider),
        connectorId: asString((onboardingJson.channels as Record<string, unknown> | undefined)?.email && typeof (onboardingJson.channels as Record<string, unknown>).email === "object"
          ? ((onboardingJson.channels as Record<string, unknown>).email as Record<string, unknown>).connectorId
          : null, workspace.settings.email.connectorId) || undefined,
        live: asBoolean((onboardingJson.channels as Record<string, unknown> | undefined)?.email && typeof (onboardingJson.channels as Record<string, unknown>).email === "object"
          ? ((onboardingJson.channels as Record<string, unknown>).email as Record<string, unknown>).live
          : null, workspace.settings.email.live),
        detail: asString((onboardingJson.channels as Record<string, unknown> | undefined)?.email && typeof (onboardingJson.channels as Record<string, unknown>).email === "object"
          ? ((onboardingJson.channels as Record<string, unknown>).email as Record<string, unknown>).detail
          : null, workspace.settings.email.detail),
      },
      calendar: {
        status: asString((onboardingJson.channels as Record<string, unknown> | undefined)?.calendar && typeof (onboardingJson.channels as Record<string, unknown>).calendar === "object"
          ? ((onboardingJson.channels as Record<string, unknown>).calendar as Record<string, unknown>).status
          : null, workspace.settings.calendar.live ? "ready" : "optional"),
        provider: asString((onboardingJson.channels as Record<string, unknown> | undefined)?.calendar && typeof (onboardingJson.channels as Record<string, unknown>).calendar === "object"
          ? ((onboardingJson.channels as Record<string, unknown>).calendar as Record<string, unknown>).provider
          : null, workspace.settings.calendar.provider),
        connectorId: asString((onboardingJson.channels as Record<string, unknown> | undefined)?.calendar && typeof (onboardingJson.channels as Record<string, unknown>).calendar === "object"
          ? ((onboardingJson.channels as Record<string, unknown>).calendar as Record<string, unknown>).connectorId
          : null, workspace.settings.calendar.connectorId) || undefined,
        live: asBoolean((onboardingJson.channels as Record<string, unknown> | undefined)?.calendar && typeof (onboardingJson.channels as Record<string, unknown>).calendar === "object"
          ? ((onboardingJson.channels as Record<string, unknown>).calendar as Record<string, unknown>).live
          : null, workspace.settings.calendar.live),
        detail: asString((onboardingJson.channels as Record<string, unknown> | undefined)?.calendar && typeof (onboardingJson.channels as Record<string, unknown>).calendar === "object"
          ? ((onboardingJson.channels as Record<string, unknown>).calendar as Record<string, unknown>).detail
          : null, workspace.settings.calendar.detail),
      },
    },
  };
  workspace.leads = leads.map(mapLeadRow);
  workspace.activity = activity.map(mapActivityRow);
  workspace.tasks = tasks.map(mapTaskRow);

  return buildResponseWorkspace(workspace);
}

async function resolveWorkspace(c: Context<{ Bindings: Env; Variables: { user: AppUser } }>, tenantId?: string) {
  const resolvedTenantId = normalizeSingleLineText(tenantId || LEAD_RECOVERY_DEFAULT_TENANT_ID, 120) || LEAD_RECOVERY_DEFAULT_TENANT_ID;

  try {
    const fromDb = await loadWorkspaceFromDb(c, resolvedTenantId);
    if (fromDb) {
      memoryWorkspaces.set(resolvedTenantId, cloneWorkspace(fromDb));
      return fromDb;
    }
  } catch (error) {
    console.warn("[Revenue] Falling back to local workspace cache:", error);
  }

  const cached = memoryWorkspaces.get(resolvedTenantId);
  if (cached) {
    return cloneWorkspace(cached);
  }

  const fallback = isLocalhostRequest(c.req.url)
    ? createDemoLeadRecoveryWorkspace(resolvedTenantId)
    : createEmptyWorkspace(resolvedTenantId);
  memoryWorkspaces.set(resolvedTenantId, cloneWorkspace(fallback));
  return cloneWorkspace(fallback);
}

async function persistTenantRow(c: Context<{ Bindings: Env; Variables: { user: AppUser } }>, workspace: LeadRecoveryWorkspace) {
  const sql = getDb(c.env);
  const payload = {
    business_name: workspace.profile.businessName,
    main_business_number: workspace.profile.mainBusinessNumber,
    callback_number: workspace.profile.callbackNumber,
    automation_tier: workspace.settings.automation.tier,
    automation_mode: workspace.settings.automation.mode,
    sms_live: workspace.settings.sms.live ? 1 : 0,
    sms_status: workspace.settings.sms.status,
    sms_detail: workspace.settings.sms.detail,
    sms_number: workspace.settings.sms.number,
    sms_account_sid: workspace.settings.sms.accountSid,
    sms_heartbeat_at: workspace.settings.sms.heartbeatAt || null,
    sms_latency_ms: workspace.settings.sms.latencyMs || 0,
    email_live: workspace.settings.email.live ? 1 : 0,
    calendar_live: workspace.settings.calendar.live ? 1 : 0,
    mode: workspace.onboarding.mode,
    profile_json: JSON.stringify(workspace.profile),
    settings_json: JSON.stringify(workspace.settings),
    metrics_json: JSON.stringify(workspace.metrics),
    onboarding_json: JSON.stringify(workspace.onboarding),
  };

  await sql`
    INSERT INTO nstep_revenue_tenants (
      tenant_id,
      app_slug,
      business_name,
      main_business_number,
      callback_number,
      automation_tier,
      automation_mode,
      sms_live,
      sms_status,
      sms_detail,
      sms_number,
      sms_account_sid,
      sms_heartbeat_at,
      sms_latency_ms,
      email_live,
      calendar_live,
      mode,
      profile_json,
      settings_json,
      metrics_json,
      onboarding_json,
      updated_at
    ) VALUES (
      ${workspace.tenantId},
      'responseos-app',
      ${payload.business_name},
      ${payload.main_business_number},
      ${payload.callback_number},
      ${payload.automation_tier},
      ${payload.automation_mode},
      ${payload.sms_live},
      ${payload.sms_status},
      ${payload.sms_detail},
      ${payload.sms_number},
      ${payload.sms_account_sid},
      ${payload.sms_heartbeat_at},
      ${payload.sms_latency_ms},
      ${payload.email_live},
      ${payload.calendar_live},
      ${payload.mode},
      ${payload.profile_json},
      ${payload.settings_json},
      ${payload.metrics_json},
      ${payload.onboarding_json},
      CURRENT_TIMESTAMP
    )
    ON CONFLICT(tenant_id) DO UPDATE SET
      business_name = excluded.business_name,
      main_business_number = excluded.main_business_number,
      callback_number = excluded.callback_number,
      automation_tier = excluded.automation_tier,
      automation_mode = excluded.automation_mode,
      sms_live = excluded.sms_live,
      sms_status = excluded.sms_status,
      sms_detail = excluded.sms_detail,
      sms_number = excluded.sms_number,
      sms_account_sid = excluded.sms_account_sid,
      sms_heartbeat_at = excluded.sms_heartbeat_at,
      sms_latency_ms = excluded.sms_latency_ms,
      email_live = excluded.email_live,
      calendar_live = excluded.calendar_live,
      mode = excluded.mode,
      profile_json = excluded.profile_json,
      settings_json = excluded.settings_json,
      metrics_json = excluded.metrics_json,
      onboarding_json = excluded.onboarding_json,
      updated_at = CURRENT_TIMESTAMP
  `;
}

async function persistLeadRow(
  c: Context<{ Bindings: Env; Variables: { user: AppUser } }>,
  workspace: LeadRecoveryWorkspace,
  lead: LeadRecoveryLead,
) {
  const sql = getDb(c.env);
  await sql`
    INSERT INTO nstep_revenue_leads (
      lead_id,
      tenant_id,
      name,
      phone,
      email,
      service_category,
      stage,
      urgency_score,
      urgency_label,
      address,
      notes,
      last_inbound_message,
      conversation_mode,
      messaging_json,
      intake_json,
      created_at,
      updated_at
    ) VALUES (
      ${lead.leadId},
      ${workspace.tenantId},
      ${lead.name || ""},
      ${lead.phone},
      ${lead.email || ""},
      ${lead.serviceCategory || ""},
      ${lead.stage},
      ${lead.urgencyScore},
      ${lead.urgencyLabel || "normal"},
      ${lead.address || ""},
      ${lead.notes || ""},
      ${lead.lastInboundMessage || ""},
      ${lead.conversationMode},
      ${JSON.stringify(lead.messaging)},
      ${JSON.stringify(lead.intake)},
      ${lead.createdAt},
      ${lead.updatedAt}
    )
    ON CONFLICT(lead_id) DO UPDATE SET
      tenant_id = excluded.tenant_id,
      name = excluded.name,
      phone = excluded.phone,
      email = excluded.email,
      service_category = excluded.service_category,
      stage = excluded.stage,
      urgency_score = excluded.urgency_score,
      urgency_label = excluded.urgency_label,
      address = excluded.address,
      notes = excluded.notes,
      last_inbound_message = excluded.last_inbound_message,
      conversation_mode = excluded.conversation_mode,
      messaging_json = excluded.messaging_json,
      intake_json = excluded.intake_json,
      updated_at = excluded.updated_at
  `;
}

async function persistTaskRow(
  c: Context<{ Bindings: Env; Variables: { user: AppUser } }>,
  workspace: LeadRecoveryWorkspace,
  task: LeadRecoveryTask,
) {
  const sql = getDb(c.env);
  await sql`
    INSERT INTO nstep_revenue_tasks (
      task_id,
      tenant_id,
      lead_id,
      task_type,
      title,
      detail,
      status,
      severity,
      scheduled_for,
      completed_at,
      created_at,
      updated_at
    ) VALUES (
      ${task.taskId},
      ${workspace.tenantId},
      ${task.leadId || null},
      ${task.taskType},
      ${task.title},
      ${task.detail},
      ${task.status},
      ${task.severity},
      ${task.scheduledFor || null},
      ${task.completedAt || null},
      ${task.createdAt},
      ${task.updatedAt}
    )
    ON CONFLICT(task_id) DO UPDATE SET
      tenant_id = excluded.tenant_id,
      lead_id = excluded.lead_id,
      task_type = excluded.task_type,
      title = excluded.title,
      detail = excluded.detail,
      status = excluded.status,
      severity = excluded.severity,
      scheduled_for = excluded.scheduled_for,
      completed_at = excluded.completed_at,
      updated_at = excluded.updated_at
  `;
}

async function persistActivityRow(
  c: Context<{ Bindings: Env; Variables: { user: AppUser } }>,
  workspace: LeadRecoveryWorkspace,
  activity: LeadRecoveryActivity,
) {
  const sql = getDb(c.env);
  await sql`
    INSERT INTO nstep_revenue_activity (
      activity_id,
      tenant_id,
      lead_id,
      kind,
      status,
      title,
      summary,
      body,
      channel,
      direction,
      created_at,
      updated_at
    ) VALUES (
      ${activity.activityId},
      ${workspace.tenantId},
      ${activity.leadId || null},
      ${activity.kind},
      ${activity.status},
      ${activity.title},
      ${activity.summary},
      ${activity.body || ""},
      ${activity.channel || "system"},
      ${activity.direction || "system"},
      ${activity.timestamp},
      ${activity.timestamp}
    )
  `;
}

revenue.get("/workspace", authMiddleware, async (c) => {
  if (!(await requireRevenueAdmin(c))) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const tenantId = c.req.query("tenant_id") || LEAD_RECOVERY_DEFAULT_TENANT_ID;
  const workspace = await resolveWorkspace(c, tenantId);
  return c.json({ workspace });
});

revenue.get("/leads", authMiddleware, async (c) => {
  if (!(await requireRevenueAdmin(c))) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const tenantId = c.req.query("tenant_id") || LEAD_RECOVERY_DEFAULT_TENANT_ID;
  const statusFilter = normalizeSingleLineText(c.req.query("status") || "", 32).toLowerCase();
  const modeFilter = normalizeSingleLineText(c.req.query("mode") || "", 32).toLowerCase();
  const search = normalizeSingleLineText(c.req.query("search") || "", 120).toLowerCase();
  const workspace = await resolveWorkspace(c, tenantId);

  const leads = workspace.leads.filter((lead) => {
    if (statusFilter && statusFilter !== "all" && lead.stage !== statusFilter) {
      return false;
    }

    if (modeFilter && modeFilter !== "all" && lead.conversationMode !== modeFilter) {
      return false;
    }

    if (!search) {
      return true;
    }

    return [
      lead.name || "",
      lead.phone,
      lead.email || "",
      lead.serviceCategory || "",
      lead.address || "",
      lead.notes || "",
      lead.lastInboundMessage || "",
    ]
      .join("\n")
      .toLowerCase()
      .includes(search);
  });

  return c.json({ leads });
});

revenue.put("/profile", authMiddleware, async (c) => {
  if (!(await requireRevenueAdmin(c))) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const body = await c.req.json().catch(() => null);
  const tenantId = normalizeSingleLineText(body?.tenant_id || body?.tenantId || LEAD_RECOVERY_DEFAULT_TENANT_ID, 120) || LEAD_RECOVERY_DEFAULT_TENANT_ID;
  const current = await resolveWorkspace(c, tenantId);
  const nextWorkspace = cloneWorkspace(current);

  if (body?.profile) {
    const profile = body.profile as Partial<LeadRecoveryWorkspace["profile"]>;
    nextWorkspace.profile = {
      ...nextWorkspace.profile,
      ...profile,
      mainBusinessNumbers: Array.isArray(profile.mainBusinessNumbers)
        ? profile.mainBusinessNumbers.filter((value): value is string => typeof value === "string")
        : nextWorkspace.profile.mainBusinessNumbers,
      services: Array.isArray(profile.services)
        ? profile.services.filter((value): value is string => typeof value === "string")
        : nextWorkspace.profile.services,
      replyOptions: profile.replyOptions ? { ...nextWorkspace.profile.replyOptions, ...profile.replyOptions } : nextWorkspace.profile.replyOptions,
      emergencyPolicy: profile.emergencyPolicy
        ? {
            ...nextWorkspace.profile.emergencyPolicy,
            ...profile.emergencyPolicy,
            emergencyKeywords: Array.isArray(profile.emergencyPolicy.emergencyKeywords)
              ? profile.emergencyPolicy.emergencyKeywords.filter((value): value is string => typeof value === "string")
              : nextWorkspace.profile.emergencyPolicy.emergencyKeywords,
          }
        : nextWorkspace.profile.emergencyPolicy,
    };
  }

  if (body?.settings) {
    const settings = body.settings as Partial<LeadRecoverySettings>;
    nextWorkspace.settings = {
      ...nextWorkspace.settings,
      ...settings,
      automation: settings.automation
        ? {
            ...nextWorkspace.settings.automation,
            ...settings.automation,
          }
        : nextWorkspace.settings.automation,
      sms: settings.sms
        ? {
            ...nextWorkspace.settings.sms,
            ...settings.sms,
          }
        : nextWorkspace.settings.sms,
      email: settings.email
        ? {
            ...nextWorkspace.settings.email,
            ...settings.email,
          }
        : nextWorkspace.settings.email,
      calendar: settings.calendar
        ? {
            ...nextWorkspace.settings.calendar,
            ...settings.calendar,
          }
        : nextWorkspace.settings.calendar,
    };
  }

  nextWorkspace.metrics.lastUpdatedAt = new Date().toISOString();
  const updated = buildResponseWorkspace(nextWorkspace);
  memoryWorkspaces.set(tenantId, cloneWorkspace(updated));

  try {
    await persistTenantRow(c, updated);
  } catch (error) {
    console.warn("[Revenue] Failed to persist profile update, keeping in-memory state:", error);
  }

  return c.json({ workspace: updated });
});

revenue.patch("/leads/:id", authMiddleware, async (c) => {
  if (!(await requireRevenueAdmin(c))) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const leadId = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const tenantId = normalizeSingleLineText(body?.tenant_id || body?.tenantId || LEAD_RECOVERY_DEFAULT_TENANT_ID, 120) || LEAD_RECOVERY_DEFAULT_TENANT_ID;
  const workspace = await resolveWorkspace(c, tenantId);
  const leadIndex = workspace.leads.findIndex((item) => item.leadId === leadId);

  if (leadIndex < 0) {
    return c.json({ error: "Lead not found" }, 404);
  }

  const nextLead = {
    ...workspace.leads[leadIndex],
    stage: body?.stage ? normalizeLeadStage(body.stage) : workspace.leads[leadIndex].stage,
    conversationMode: body?.conversationMode ? normalizeConversationMode(body.conversationMode) : workspace.leads[leadIndex].conversationMode,
    notes: typeof body?.notes === "string" ? normalizeMultilineText(body.notes, 1500) : workspace.leads[leadIndex].notes,
    updatedAt: new Date().toISOString(),
  };

  workspace.leads[leadIndex] = nextLead;

  const activity: LeadRecoveryActivity = {
    activityId: `activity_${crypto.randomUUID()}`,
    kind: "lead.updated",
    status: "done",
    title: `${nextLead.name || nextLead.phone} updated`,
    summary: `Lead moved to ${nextLead.stage} with ${nextLead.conversationMode} mode.`,
    body: nextLead.notes || undefined,
    leadId,
    channel: "system",
    direction: "system",
    timestamp: new Date().toISOString(),
  };

  workspace.activity.unshift(activity);
  const updated = buildResponseWorkspace(workspace);
  memoryWorkspaces.set(tenantId, cloneWorkspace(updated));

  try {
    await persistLeadRow(c, updated, updated.leads[leadIndex]);
    await persistActivityRow(c, updated, activity);
    await persistTenantRow(c, updated);
  } catch (error) {
    console.warn("[Revenue] Failed to persist lead update, keeping in-memory state:", error);
  }

  return c.json({ workspace: updated });
});

revenue.post("/tasks/:id/complete", authMiddleware, async (c) => {
  if (!(await requireRevenueAdmin(c))) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const taskId = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const tenantId = normalizeSingleLineText(body?.tenant_id || body?.tenantId || LEAD_RECOVERY_DEFAULT_TENANT_ID, 120) || LEAD_RECOVERY_DEFAULT_TENANT_ID;
  const workspace = await resolveWorkspace(c, tenantId);
  const taskIndex = workspace.tasks.findIndex((item) => item.taskId === taskId);

  if (taskIndex < 0) {
    return c.json({ error: "Task not found" }, 404);
  }

  workspace.tasks[taskIndex] = {
    ...workspace.tasks[taskIndex],
    status: "done",
    completedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const activity: LeadRecoveryActivity = {
    activityId: `activity_${crypto.randomUUID()}`,
    kind: "task.completed",
    status: "done",
    title: `${workspace.tasks[taskIndex].title} completed`,
    summary: workspace.tasks[taskIndex].detail,
    body: workspace.tasks[taskIndex].detail,
    leadId: workspace.tasks[taskIndex].leadId,
    channel: "system",
    direction: "system",
    timestamp: new Date().toISOString(),
  };

  workspace.activity.unshift(activity);
  const updated = buildResponseWorkspace(workspace);
  memoryWorkspaces.set(tenantId, cloneWorkspace(updated));

  try {
    await persistTaskRow(c, updated, updated.tasks[taskIndex]);
    await persistActivityRow(c, updated, activity);
    await persistTenantRow(c, updated);
  } catch (error) {
    console.warn("[Revenue] Failed to persist task completion, keeping in-memory state:", error);
  }

  return c.json({ workspace: updated });
});

revenue.get("/activity", authMiddleware, async (c) => {
  if (!(await requireRevenueAdmin(c))) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const tenantId = c.req.query("tenant_id") || LEAD_RECOVERY_DEFAULT_TENANT_ID;
  const workspace = await resolveWorkspace(c, tenantId);
  return c.json({ activity: workspace.activity });
});

revenue.get("/tasks", authMiddleware, async (c) => {
  if (!(await requireRevenueAdmin(c))) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const tenantId = c.req.query("tenant_id") || LEAD_RECOVERY_DEFAULT_TENANT_ID;
  const workspace = await resolveWorkspace(c, tenantId);
  return c.json({ tasks: workspace.tasks, followups: workspace.followups });
});

revenue.post("/events", authMiddleware, async (c) => {
  if (!(await requireRevenueAdmin(c))) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const body = await c.req.json().catch(() => null);
  const tenantId = normalizeSingleLineText(body?.tenant_id || body?.tenantId || LEAD_RECOVERY_DEFAULT_TENANT_ID, 120) || LEAD_RECOVERY_DEFAULT_TENANT_ID;
  const workspace = await resolveWorkspace(c, tenantId);
  const now = new Date().toISOString();
  const activity: LeadRecoveryActivity = {
    activityId: `activity_${crypto.randomUUID()}`,
    kind: normalizeSingleLineText(body?.kind || "event.processed", 80),
    status: "done",
    title: normalizeSingleLineText(body?.title || "New event", 120),
    summary: normalizeMultilineText(body?.summary || body?.body || "", 500) || normalizeSingleLineText(body?.title || "New event", 120),
    body: normalizeMultilineText(body?.body || body?.summary || "", 1500) || undefined,
    leadId: asString(body?.leadId, "") || undefined,
    channel: (["sms", "call", "system"].includes(asString(body?.channel)) ? asString(body?.channel) : "system") as LeadRecoveryActivity["channel"],
    direction: (["inbound", "outbound", "system"].includes(asString(body?.direction)) ? asString(body?.direction) : "system") as LeadRecoveryActivity["direction"],
    timestamp: now,
  };

  workspace.activity.unshift(activity);
  const updated = buildResponseWorkspace(workspace);
  memoryWorkspaces.set(tenantId, cloneWorkspace(updated));

  try {
    await persistActivityRow(c, updated, activity);
    await persistTenantRow(c, updated);
  } catch (error) {
    console.warn("[Revenue] Failed to persist event, keeping in-memory state:", error);
  }

  return c.json({ workspace: updated }, 201);
});

export default revenue;
