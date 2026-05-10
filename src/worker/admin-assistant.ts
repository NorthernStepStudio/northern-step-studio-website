import { Context } from "hono";
import { getDb, type Env } from "./db";
import { type AppUser, isUserAdmin } from "./auth";
import { 
  type StudioProject, 
  type ProjectNote, 
  type ProjectGoal, 
  type ProjectRisk, 
  type ProjectDecision 
} from "../shared/synox/projectIntelligence";

// Basic CRUD for the local NStep Assistant

import { 
  type AssistantModeId, 
  ASSISTANT_MODES 
} from "./synox/assistantModes";
import { 
  aggregateAssistantContext, 
  formatContextForPrompt 
} from "./synox/contextAggregator";
import { 
  getBridgeStatus, 
  sendBridgeReasoning,
  type BridgeReasonRequest
} from "./synox/localBridgeClient";

export const handleAdminAssistantChat = async (c: Context<{ Bindings: Env; Variables: { user: AppUser } }>) => {
  if (!(await isUserAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const body = await c.req.json().catch(() => ({}));
  
  const request: BridgeReasonRequest = {
    mode: body.mode || "general",
    question: body.message || body.question || "",
    context: {
      summary: "Manual admin query.",
      sources: []
    },
    safety: {
      advisoryOnly: true,
      noExecution: true,
      noRepoMutation: true,
      noDeployment: true
    }
  };

  const response = await sendBridgeReasoning(request);
  return c.json(response);
};

export const handleGetBridgeStatus = async (c: Context<{ Bindings: Env }>) => {
  if (!(await isUserAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const status = await getBridgeStatus();
  return c.json(status);
};

/**
 * NEW: Synox / NStep AI Assistant Chat
 * Aggregates operational context based on the selected mode.
 */
export const handleSynoxAssistantChat = async (c: Context<{ Bindings: Env; Variables: { user: AppUser } }>) => {
  if (!(await isUserAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const body = await c.req.json().catch(() => ({}));
  const modeId = (body.mode || 'executive') as AssistantModeId;
  const projectId = body.projectId ? parseInt(body.projectId) : undefined;
  
  if (!ASSISTANT_MODES[modeId]) {
    return c.json({ error: "Invalid assistant mode" }, 400);
  }

  // 1. Aggregate Context
  const context = await aggregateAssistantContext(c.env, modeId, projectId);
  const formattedContext = formatContextForPrompt(context);
  const mode = ASSISTANT_MODES[modeId];

  // 2. Prepare Grounded Prompt
  const groundedPrompt = {
    message: body.message,
    systemPrompt: `${mode.systemInstructions}\n\n${formattedContext}`,
    mode: modeId,
    projectId
  };

  // 3. Audit Logging (Lightweight)
  try {
    const sql = getDb(c.env);
    const taskId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await sql`
      INSERT INTO assistant_tasks (id, title, status, priority, notes)
      VALUES (
        ${taskId},
        ${`Synox Assistant Query (${modeId})`}, 
        'completed', 
        'low', 
        ${`User asked: ${body.message.substring(0, 100)}... Used context sources: ${context.docs.length} docs, ${context.projects.length} projects.`}
      )
    `;
  } catch (err) {
    console.error("Audit log failed:", err);
  }

  // 4. Send to Local Bridge (Operational Reasoning Layer)
  const request: BridgeReasonRequest = {
    mode: modeId,
    question: body.message,
    context: {
      summary: formattedContext,
      sources: context.docs.map(d => d.title).concat(context.projects.map(p => p.name))
    },
    safety: {
      advisoryOnly: true,
      noExecution: true,
      noRepoMutation: true,
      noDeployment: true
    }
  };

  const response = await sendBridgeReasoning(request);

  if (response.ok) {
    // Inject grounding info into response
    return c.json({
      ...response,
      grounding: {
        mode: mode.label,
        warnings: context.warnings,
        sourcesUsed: {
          docs: context.docs.length,
          projects: context.projects.length,
          repoSnapshot: !!context.repoSnapshot
        }
      }
    });
  } else {
    // Fallback if bridge offline or error
    return c.json({
      ok: false,
      answer: `Matterhorn Intelligence is active, but the Synox reasoning bridge (Port 3010) is offline.\n\n### Grounded Context Prepared:\n- Mode: ${mode.label}\n- Warnings: ${context.warnings.join(', ') || 'None'}\n- Context Size: ~${Math.round(formattedContext.length / 1024)}KB`,
      grounding: { mode: mode.label, warnings: context.warnings }
    });
  }
};

/**
 * Synox: Fetch Grounding Summary
 */
import { getGroundingSummary } from "./synox/groundingSummary";
import { getBuildIntelligence } from "./synox/buildIntelligence";
import { getBusinessIntelligence } from "./synox/businessIntelligence";
import { getCommandCenterSummary } from "./synox/commandCenter";
import { redactLogMessage } from "./synox/logRedaction";

export const handleGetGroundingSummary = async (c: Context<{ Bindings: Env }>) => {
  if (!(await isUserAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const summary = await getGroundingSummary(c.env);
  return c.json(summary);
};

/**
 * Synox: Operational Memory CRUD
 */
export const handleGetMemory = async (c: Context<{ Bindings: Env }>) => {
  if (!(await isUserAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const sql = getDb(c.env);
  const memory = await sql`SELECT * FROM assistant_memory ORDER BY updated_at DESC LIMIT 100`;
  return c.json(memory || []);
};

export const handleCreateMemory = async (c: Context<{ Bindings: Env }>) => {
  if (!(await isUserAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const body = await c.req.json().catch(() => ({}));
  if (!body.value || !body.key) return c.json({ error: "Key and Value required" }, 400);

  const sql = getDb(c.env);
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO assistant_memory (
      id, scope, key, value, category, tags, project_id, app_key, 
      source_type, source_id, confidence, freshness_status
    )
    VALUES (
      ${id}, ${body.scope || 'general'}, ${body.key}, ${body.value}, 
      ${body.category || null}, ${body.tags || null}, ${body.project_id || null}, 
      ${body.app_key || null}, ${body.source_type || 'manual'}, ${body.source_id || null},
      ${body.confidence || 1.0}, 'active'
    )
  `;
  return c.json({ success: true, id });
};

export const handlePatchMemory = async (c: Context<{ Bindings: Env }>) => {
  if (!(await isUserAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const sql = getDb(c.env);

  await sql`
    UPDATE assistant_memory SET
      value = COALESCE(${body.value}, value),
      category = COALESCE(${body.category}, category),
      tags = COALESCE(${body.tags}, tags),
      project_id = COALESCE(${body.project_id}, project_id),
      app_key = COALESCE(${body.app_key}, app_key),
      freshness_status = COALESCE(${body.freshness_status}, freshness_status),
      is_archived = COALESCE(${body.is_archived !== undefined ? (body.is_archived ? 1 : 0) : undefined}, is_archived),
      confidence = COALESCE(${body.confidence}, confidence),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `;
  return c.json({ success: true });
};

/**
 * Synox: Context Docs CRUD
 */
export const handleGetContextDocs = async (c: Context<{ Bindings: Env }>) => {
  if (!(await isUserAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const sql = getDb(c.env);
  const docs = await sql`SELECT * FROM assistant_context_docs ORDER BY updated_at DESC`;
  return c.json(docs || []);
};

export const handleCreateContextDoc = async (c: Context<{ Bindings: Env }>) => {
  if (!(await isUserAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const body = await c.req.json().catch(() => ({}));
  if (!body.title || !body.content) return c.json({ error: "Title and Content required" }, 400);

  const sql = getDb(c.env);
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO assistant_context_docs (id, title, path, content, category, source_type)
    VALUES (${id}, ${body.title}, ${body.path || null}, ${body.content}, ${body.category || 'general'}, ${body.source_type || 'manual'})
  `;
  return c.json({ success: true, id });
};

export const getAssistantSessions = async (c: Context<{ Bindings: Env; Variables: { user: AppUser } }>) => {
  const sql = getDb(c.env);
  const sessions = await sql`SELECT * FROM assistant_sessions ORDER BY updated_at DESC LIMIT 50`;
  return c.json(sessions);
};

export const getAssistantContext = async (c: Context<{ Bindings: Env; Variables: { user: AppUser } }>) => {
  const sql = getDb(c.env);
  const docs = await sql`SELECT * FROM assistant_context_docs ORDER BY updated_at DESC LIMIT 100`;
  return c.json(docs);
};

export const getAssistantMemory = async (c: Context<{ Bindings: Env; Variables: { user: AppUser } }>) => {
  const sql = getDb(c.env);
  const memory = await sql`SELECT * FROM assistant_memory ORDER BY updated_at DESC LIMIT 100`;
  return c.json(memory);
};

export const getAssistantTasks = async (c: Context<{ Bindings: Env; Variables: { user: AppUser } }>) => {
  const sql = getDb(c.env);
  const tasks = await sql`SELECT * FROM assistant_tasks ORDER BY updated_at DESC LIMIT 100`;
  return c.json(tasks);
};

export const handleRepoSummary = async (c: Context<{ Bindings: Env; Variables: { user: AppUser } }>) => {
  return c.json({ summary: "Repo scanning not yet implemented in bridge." });
};

export const handleLogReview = async (c: Context<{ Bindings: Env; Variables: { user: AppUser } }>) => {
  return c.json({ review: "Log review not yet implemented in bridge." });
};

/**
 * Assistant Helper: Fetch the latest repo snapshot for grounded reasoning.
 * Used internally by multi-mode assistant logic.
 */
export const getLatestRepoSnapshot = async (env: Env) => {
  const sql = getDb(env);
  const [latest] = await sql`
    SELECT * FROM repo_snapshots 
    ORDER BY created_at DESC 
    LIMIT 1
  `;
  if (!latest) return null;
  
  try {
    return {
      ...latest,
      snapshot_data: JSON.parse(latest.snapshot_data as string)
    };
  } catch {
    return latest;
  }
};

/**
 * Assistant Helper: Fetch all active projects.
 */
export const getActiveProjects = async (env: Env) => {
  const sql = getDb(env);
  return await sql<StudioProject[]>`SELECT * FROM projects WHERE status = 'active' ORDER BY priority DESC`;
};

/**
 * Assistant Helper: Fetch detailed project intelligence.
 */
export const getFullProjectIntelligence = async (env: Env, projectId: number) => {
  const sql = getDb(env);
  const [project] = await sql<StudioProject[]>`SELECT * FROM projects WHERE id = ${projectId}`;
  if (!project) return null;

  const [notes, goals, risks, decisions] = await Promise.all([
    sql<ProjectNote[]>`SELECT * FROM project_notes WHERE project_id = ${projectId} ORDER BY created_at DESC`,
    sql<ProjectGoal[]>`SELECT * FROM project_goals WHERE project_id = ${projectId} ORDER BY created_at DESC`,
    sql<ProjectRisk[]>`SELECT * FROM project_risks WHERE project_id = ${projectId} ORDER BY impact DESC`,
    sql<ProjectDecision[]>`SELECT * FROM project_decisions WHERE project_id = ${projectId} ORDER BY created_at DESC`
  ]);

  return {
    ...project,
    notes,
    goals,
    risks,
    decisions
  };
};

/**
 * Synox: Build Intelligence CRUD
 */
export const handleGetBuilds = async (c: Context<{ Bindings: Env }>) => {
  if (!(await isUserAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const sql = getDb(c.env);
  const builds = await sql`SELECT * FROM build_runs ORDER BY created_at DESC LIMIT 50`;
  return c.json(builds || []);
};

export const handleCreateBuild = async (c: Context<{ Bindings: Env }>) => {
  if (!(await isUserAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const body = await c.req.json().catch(() => ({}));
  if (!body.app_key) return c.json({ error: "App Key required" }, 400);

  const sql = getDb(c.env);
  const id = body.id || crypto.randomUUID();
  await sql`
    INSERT INTO build_runs (
      id, app_key, project_id, source, platform, build_type, status,
      version_name, version_code, artifact_name, artifact_path_label, summary, risk_level
    ) VALUES (
      ${id}, ${body.app_key}, ${body.project_id || null}, ${body.source || 'manual'},
      ${body.platform || 'web'}, ${body.build_type || 'debug'}, ${body.status || 'pending'},
      ${body.version_name || null}, ${body.version_code || null}, ${body.artifact_name || null},
      ${body.artifact_path_label || null}, ${body.summary || null}, ${body.risk_level || 'low'}
    )
  `;
  return c.json({ success: true, id });
};

export const handleCreateBuildLog = async (c: Context<{ Bindings: Env }>) => {
  if (!(await isUserAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const buildId = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  if (!body.message) return c.json({ error: "Message required" }, 400);

  const { redactedMessage, redactionCount } = redactLogMessage(body.message);
  const sql = getDb(c.env);
  const id = crypto.randomUUID();

  await sql`
    INSERT INTO build_run_logs (id, build_run_id, phase, level, message, redacted)
    VALUES (${id}, ${buildId}, ${body.phase || 'process'}, ${body.level || 'info'}, ${redactedMessage}, ${redactionCount > 0 ? 1 : 0})
  `;
  return c.json({ success: true, id, redacted: redactionCount > 0 });
};

/**
 * Synox: Deployment Intelligence CRUD
 */
export const handleGetDeployments = async (c: Context<{ Bindings: Env }>) => {
  if (!(await isUserAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const sql = getDb(c.env);
  const deployments = await sql`SELECT * FROM deployment_runs ORDER BY created_at DESC LIMIT 50`;
  return c.json(deployments || []);
};

export const handleCreateDeployment = async (c: Context<{ Bindings: Env }>) => {
  if (!(await isUserAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const body = await c.req.json().catch(() => ({}));
  if (!body.app_key) return c.json({ error: "App Key required" }, 400);

  const sql = getDb(c.env);
  const id = body.id || crypto.randomUUID();
  await sql`
    INSERT INTO deployment_runs (
      id, app_key, project_id, environment, provider, status, url, commit_sha, summary, risk_level
    ) VALUES (
      ${id}, ${body.app_key}, ${body.project_id || null}, ${body.environment || 'staging'},
      ${body.provider || 'cloudflare'}, ${body.status || 'pending'}, ${body.url || null},
      ${body.commit_sha || null}, ${body.summary || null}, ${body.risk_level || 'low'}
    )
  `;
  return c.json({ success: true, id });
};

/**
 * Synox: Release Readiness CRUD
 */
export const handleGetReadiness = async (c: Context<{ Bindings: Env }>) => {
  if (!(await isUserAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const sql = getDb(c.env);
  const checks = await sql`SELECT * FROM release_readiness_checks ORDER BY severity DESC, updated_at DESC`;
  return c.json(checks || []);
};

export const handleUpdateReadiness = async (c: Context<{ Bindings: Env }>) => {
  if (!(await isUserAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const body = await c.req.json().catch(() => ({}));
  if (!body.app_key || !body.check_key) return c.json({ error: "App Key and Check Key required" }, 400);

  const sql = getDb(c.env);
  const id = body.id || crypto.randomUUID();
  await sql`
    INSERT INTO release_readiness_checks (id, app_key, project_id, check_key, status, message, severity)
    VALUES (${id}, ${body.app_key}, ${body.project_id || null}, ${body.check_key}, ${body.status || 'pending'}, ${body.message || null}, ${body.severity || 'normal'})
    ON CONFLICT(id) DO UPDATE SET
      status = excluded.status,
      message = excluded.message,
      severity = excluded.severity,
      updated_at = CURRENT_TIMESTAMP
  `;
  return c.json({ success: true, id });
};

/**
 * Synox: Analytics and Business Intelligence
 */
export const handleGetAnalyticsOverview = async (c: Context<{ Bindings: Env }>) => {
  if (!(await isUserAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const sql = getDb(c.env);
  
  const [totalViews] = await sql`SELECT SUM(page_views) as count FROM app_momentum_daily`;
  const [totalClicks] = await sql`SELECT SUM(cta_clicks) as count FROM app_momentum_daily`;
  const momentum = await sql`SELECT * FROM app_momentum_daily ORDER BY date_key DESC LIMIT 30`;
  
  return c.json({
    totals: {
      pageViews: (totalViews as { count: number }).count || 0,
      ctaClicks: (totalClicks as { count: number }).count || 0
    },
    momentum
  });
};

export const handleGetBusinessSummary = async (c: Context<{ Bindings: Env }>) => {
  if (!(await isUserAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const summary = await getBusinessIntelligence(c.env);
  return c.json(summary);
};

export const handleGetAdminActivity = async (c: Context<{ Bindings: Env }>) => {
  if (!(await isUserAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const sql = getDb(c.env);
  const logs = await sql`SELECT * FROM admin_activity_log ORDER BY created_at DESC LIMIT 100`;
  return c.json(logs || []);
};

export const handleLogAdminActivity = async (c: Context<{ Bindings: Env; Variables: { user: AppUser } }>) => {
  if (!(await isUserAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const user = c.get("user");
  const body = await c.req.json().catch(() => ({}));
  if (!body.action) return c.json({ error: "Action required" }, 400);

  const sql = getDb(c.env);
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO admin_activity_log (id, actor_id, action, target_type, target_id, summary)
    VALUES (${id}, ${user.id}, ${body.action}, ${body.target_type || null}, ${body.target_id || null}, ${body.summary || null})
  `;
  return c.json({ success: true, id });
};

/**
 * Synox: Command Center and Action Queue
 */
export const handleGetCommandCenter = async (c: Context<{ Bindings: Env }>) => {
  if (!(await isUserAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const summary = await getCommandCenterSummary(c.env);
  return c.json(summary);
};

export const handleGetActionQueue = async (c: Context<{ Bindings: Env }>) => {
  if (!(await isUserAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const sql = getDb(c.env);
  const actions = await sql`SELECT * FROM intelligence_action_queue WHERE status != 'done' AND status != 'dismissed' ORDER BY priority DESC, created_at DESC`;
  return c.json(actions || []);
};

export const handleCreateAction = async (c: Context<{ Bindings: Env }>) => {
  if (!(await isUserAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const body = await c.req.json().catch(() => ({}));
  if (!body.title || !body.source_type) return c.json({ error: "Title and Source Type required" }, 400);

  const sql = getDb(c.env);
  const id = body.id || crypto.randomUUID();
  await sql`
    INSERT INTO intelligence_action_queue (
      id, title, description, source_type, source_id, project_id, app_key, 
      priority, risk_level, status, reasoning_summary, suggested_prompt
    ) VALUES (
      ${id}, ${body.title}, ${body.description || null}, ${body.source_type}, 
      ${body.source_id || null}, ${body.project_id || null}, ${body.app_key || null},
      ${body.priority || 'medium'}, ${body.risk_level || 'low'}, 'suggested',
      ${body.reasoning_summary || null}, ${body.suggested_prompt || null}
    )
  `;
  return c.json({ success: true, id });
};

export const handlePatchAction = async (c: Context<{ Bindings: Env }>) => {
  if (!(await isUserAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const sql = getDb(c.env);

  await sql`
    UPDATE intelligence_action_queue SET
      status = COALESCE(${body.status}, status),
      priority = COALESCE(${body.priority}, priority),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `;
  return c.json({ success: true });
};
