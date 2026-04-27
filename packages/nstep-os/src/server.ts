import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createNStepOsRuntime, type NStepOsRuntime } from "./core/runtime.js";
import { loadRuntimeConfig } from "./core/config.js";
import { listWorkflowKeys, workflowRegistry } from "./workflows/index.js";
import { buildDashboardSnapshot, createDashboardService } from "./dashboard/index.js";
import type { DashboardQuery } from "./dashboard/index.js";
import { buildJobSummary } from "./reporting/index.js";
import type { ApprovalStatus, ExecutionLane, GoalInput, JobStatus, LeadRecord, PrincipalRole, ProductKey, WorkflowKey } from "./core/types.js";
import type { JobRecord } from "./core/types.js";
import { assertMemoryEditRequest } from "./core/validation.js";
import { editMemoryEntry } from "./memory/index.js";
import { evaluateTenantIsolation } from "./policies/index.js";
import { verifyInternalRequest, verifyTwilioRequest } from "./core/auth.js";
import { createProvLyCaseId } from "./workflows/provly/store.js";

export interface StartedServer {
  readonly server: ReturnType<typeof createServer>;
  readonly port: number;
  close(): Promise<void>;
}

export async function startNStepOsServer(runtime?: NStepOsRuntime, requestedPort?: number): Promise<StartedServer> {
  const config = runtime?.config ?? loadRuntimeConfig();
  const currentRuntime = runtime ?? (await createNStepOsRuntime(config));
  const dashboardService = createDashboardService(currentRuntime.stores, currentRuntime.config, currentRuntime.orchestrator);
  const port = requestedPort ?? config.port;
  const host = "127.0.0.1";
  const server = createServer(async (request, response) => {
    try {
      setCommonHeaders(response);
      if ((request.method || "GET") === "OPTIONS") {
        response.statusCode = 204;
        response.end();
        return;
      }

      const url = new URL(request.url || "/", `http://${request.headers.host || `${host}:${port}`}`);
      const publicRoute = url.pathname === "/health" || url.pathname === "/v1/webhooks/twilio/missed-call";
      if (!publicRoute) {
        const internalAccess = verifyInternalRequest(request, currentRuntime.config);
        if (!internalAccess.allowed) {
          sendError(response, 401, internalAccess.reason || "Unauthorized.");
          return;
        }
      }
      if (request.method === "GET" && url.pathname === "/health") {
        sendJson(response, 200, await currentRuntime.health());
        return;
      }

      if (request.method === "GET" && url.pathname === "/v1/workflows") {
        sendJson(response, 200, {
          workflows: listWorkflowKeys().map((key) => ({
            key,
            title: workflowRegistry[key].title,
            description: workflowRegistry[key].description,
          })),
        });
        return;
      }

      if (request.method === "GET" && url.pathname === "/v1/jobs") {
        const tenantId = resolveTenantFilter(url.searchParams, request);
        const jobs = await currentRuntime.listJobs();
        sendJson(response, 200, {
          jobs: tenantId ? jobs.filter((job) => job.tenantId === tenantId) : jobs,
        });
        return;
      }

      if (request.method === "GET" && url.pathname === "/v1/memory") {
        const tenantId = resolveTenantFilter(url.searchParams, request);
        const memory = await currentRuntime.listMemory();
        sendJson(response, 200, {
          memory: tenantId ? memory.filter((entry) => entry.tenantId === tenantId) : memory,
        });
        return;
      }

      if (request.method === "GET" && url.pathname === "/v1/knowledge/search") {
        const query = cleanQueryValue(url.searchParams.get("q")) || cleanQueryValue(url.searchParams.get("query"));
        if (!query) {
          sendError(response, 400, "Knowledge search requires q.");
          return;
        }

        const limit = resolveKnowledgeSearchLimit(url.searchParams.get("limit"));
        const matches = await currentRuntime.stores.knowledge.search(query, limit);
        sendJson(response, 200, {
          query,
          count: matches.length,
          matches: matches.map((match) => ({
            id: match.id,
            sourcePath: match.sourcePath,
            sourceTitle: match.sourceTitle,
            sectionPath: match.sectionPath,
            chunkIndex: match.chunkIndex,
            summary: match.summary,
            excerpt: match.excerpt,
            score: match.score,
            metadata: match.metadata,
          })),
        });
        return;
      }

      if (request.method === "GET" && /^\/v1\/memory\/[^/]+$/.test(url.pathname)) {
        const memoryId = url.pathname.split("/").pop() || "";
        const entry = await currentRuntime.stores.memory.get(memoryId);
        if (!entry) {
          sendError(response, 404, `Memory entry ${memoryId} was not found.`);
          return;
        }
        const tenantId = resolveTenantFilter(url.searchParams, request);
        const access = evaluateTenantIsolation(entry.tenantId, tenantId, resolvePrincipalRole(request, "viewer"));
        if (!access.allowed) {
          sendError(response, 403, access.reason);
          return;
        }
        sendJson(response, 200, { memory: entry, auditTrail: entry.auditTrail || [] });
        return;
      }

      if (request.method === "PATCH" && /^\/v1\/memory\/[^/]+$/.test(url.pathname)) {
        const memoryId = url.pathname.split("/").pop() || "";
        const body = await readJsonBody(request);
        const actorRole = resolvePrincipalRole(request, "operator");
        const requestTenantId = stringField(body, "tenantId") || resolveTenantFilter(url.searchParams, request);
        if (!requestTenantId) {
          sendError(response, 400, "Memory edits require tenantId.");
          return;
        }
        assertMemoryEditRequest({
          ...body,
          tenantId: requestTenantId,
          actorRole,
        });
        const tenantAccess = evaluateTenantIsolation(requestTenantId, resolveTenantFilter(url.searchParams, request), actorRole);
        if (!tenantAccess.allowed) {
          sendError(response, 403, tenantAccess.reason);
          return;
        }
        if (actorRole === "viewer" || actorRole === "analyst") {
          sendError(response, 403, `Role ${actorRole} cannot edit memory entries.`);
          return;
        }
        const result = await editMemoryEntry(currentRuntime.stores.memory, memoryId, {
          tenantId: requestTenantId,
          actorRole,
          actorId: stringField(body, "actorId") || stringField(body, "requestedBy"),
          key: stringField(body, "key") || undefined,
          category: stringField(body, "category") || undefined,
          value: body.value as string | Record<string, unknown> | undefined,
          confidence: numberField(body, "confidence"),
          editable: booleanField(body, "editable"),
          note: stringField(body, "note") || stringField(body, "reason"),
          sourceJobId: stringField(body, "sourceJobId") || undefined,
          sourceStepId: stringField(body, "sourceStepId") || undefined,
        });
        sendJson(response, 200, result);
        return;
      }

      if (request.method === "GET" && url.pathname === "/v1/dashboard/overview") {
        sendJson(response, 200, await dashboardService.overview(readDashboardQuery(url.searchParams)));
        return;
      }

      if (request.method === "GET" && url.pathname === "/v1/dashboard/jobs") {
        sendJson(response, 200, await dashboardService.jobs(readDashboardQuery(url.searchParams)));
        return;
      }

      if (request.method === "GET" && /^\/v1\/dashboard\/jobs\/[^/]+$/.test(url.pathname)) {
        const jobId = url.pathname.split("/").pop() || "";
        const responseBody = await dashboardService.job(jobId, readDashboardQuery(url.searchParams));
        if (!responseBody) {
          sendError(response, 404, `Dashboard job ${jobId} was not found.`);
          return;
        }
        sendJson(response, 200, responseBody);
        return;
      }

      if (request.method === "GET" && url.pathname === "/v1/dashboard/approvals") {
        sendJson(response, 200, await dashboardService.approvals(readDashboardQuery(url.searchParams)));
        return;
      }

      if (request.method === "GET" && url.pathname === "/v1/dashboard/logs") {
        sendJson(response, 200, await dashboardService.logs(readDashboardQuery(url.searchParams)));
        return;
      }

      if (request.method === "GET" && url.pathname === "/v1/dashboard/activity") {
        sendJson(response, 200, await dashboardService.activity(readDashboardQuery(url.searchParams)));
        return;
      }

      if (request.method === "GET" && url.pathname === "/v1/dashboard/memory") {
        sendJson(response, 200, await dashboardService.memory(readDashboardQuery(url.searchParams)));
        return;
      }

      if (request.method === "GET" && url.pathname === "/v1/dashboard/settings") {
        const actorRole = resolvePrincipalRole(request, "viewer");
        if (actorRole !== "admin" && actorRole !== "system") {
          sendError(response, 403, "Settings require admin access.");
          return;
        }
        sendJson(response, 200, await dashboardService.settings(readDashboardQuery(url.searchParams)));
        return;
      }

      if (request.method === "GET" && /^\/v1\/dashboard\/panels\/[^/]+$/.test(url.pathname)) {
        const product = resolveDashboardProduct(url.pathname.split("/").pop() || "");
        if (!product) {
          sendError(response, 404, "Unknown dashboard product panel.");
          return;
        }
        const panel = await dashboardService.panel(product, readDashboardQuery(url.searchParams));
        sendJson(response, 200, panel);
        return;
      }

      if (request.method === "GET" && url.pathname === "/v1/dashboard") {
        sendJson(response, 200, {
          dashboard: await dashboardService.overview(readDashboardQuery(url.searchParams)),
        });
        return;
      }

      if (request.method === "GET" && /^\/v1\/jobs\/[^/]+$/.test(url.pathname)) {
        const jobId = url.pathname.split("/").pop() || "";
        const job = await currentRuntime.getJob(jobId);
        if (!job) {
          sendError(response, 404, `Job ${jobId} was not found.`);
          return;
        }
        const tenantId = resolveTenantFilter(url.searchParams, request);
        const access = evaluateTenantIsolation(job.tenantId, tenantId, resolvePrincipalRole(request, "viewer"));
        if (!access.allowed) {
          sendError(response, 403, access.reason);
          return;
        }
        sendJson(response, 200, { job, summary: buildJobSummary(job) });
        return;
      }

      if (request.method === "POST" && url.pathname === "/v1/goals") {
        const body = await readJsonBody(request);
        const goal = body.goal as GoalInput | undefined;
        if (!goal) {
          sendError(response, 400, "Request body must include goal.");
          return;
        }
        const job = await currentRuntime.intake(goal);
        const shouldRun = body.run !== false;
        const result = shouldRun ? await currentRuntime.run(job.jobId) : job;
        sendJson(response, 200, { job: result });
        return;
      }

      if (request.method === "POST" && url.pathname === "/v1/jobs/run") {
        const body = await readJsonBody(request);
        const jobId = String(body.jobId || "").trim();
        if (!jobId) {
          sendError(response, 400, "Request body must include jobId.");
          return;
        }
        sendJson(response, 200, {
          job: await currentRuntime.run(jobId),
        });
        return;
      }

      if (request.method === "POST" && /^\/v1\/jobs\/[^/]+\/run$/.test(url.pathname)) {
        const jobId = url.pathname.split("/")[3] || "";
        sendJson(response, 200, {
          job: await currentRuntime.run(jobId),
        });
        return;
      }

      if (request.method === "POST" && /^\/v1\/jobs\/[^/]+\/approve$/.test(url.pathname)) {
        const jobId = url.pathname.split("/")[3] || "";
        const body = await readJsonBody(request);
        const stepId = String(body.stepId || "").trim();
        if (!stepId) {
          sendError(response, 400, "Request body must include stepId.");
          return;
        }
        const actorRole = resolvePrincipalRole(request, "operator");
        if (actorRole === "viewer" || actorRole === "analyst") {
          sendError(response, 403, `Role ${actorRole} cannot approve workflow steps.`);
          return;
        }
        const actorTenantId = stringField(body, "tenantId") || resolveTenantFilter(url.searchParams, request);
        if (!actorTenantId) {
          sendError(response, 400, "Approval requests require tenantId.");
          return;
        }
        const job = await currentRuntime.getJob(jobId);
        if (!job) {
          sendError(response, 404, `Job ${jobId} was not found.`);
          return;
        }
        const access = evaluateTenantIsolation(job.tenantId, actorTenantId, actorRole);
        if (!access.allowed) {
          sendError(response, 403, access.reason);
          return;
        }
        sendJson(response, 200, {
          job: await currentRuntime.approve(jobId, stepId, {
            role: actorRole,
            subjectId: resolveActorSubjectId(request, body),
            tenantId: actorTenantId || undefined,
          }),
        });
        return;
      }

      if (request.method === "POST" && /^\/v1\/jobs\/[^/]+\/reject$/.test(url.pathname)) {
        const jobId = url.pathname.split("/")[3] || "";
        const body = await readJsonBody(request);
        const stepId = String(body.stepId || "").trim();
        if (!stepId) {
          sendError(response, 400, "Request body must include stepId.");
          return;
        }
        const actorRole = resolvePrincipalRole(request, "operator");
        if (actorRole === "viewer" || actorRole === "analyst") {
          sendError(response, 403, `Role ${actorRole} cannot reject workflow steps.`);
          return;
        }
        const actorTenantId = stringField(body, "tenantId") || resolveTenantFilter(url.searchParams, request);
        if (!actorTenantId) {
          sendError(response, 400, "Rejection requests require tenantId.");
          return;
        }
        const job = await currentRuntime.getJob(jobId);
        if (!job) {
          sendError(response, 404, `Job ${jobId} was not found.`);
          return;
        }
        const access = evaluateTenantIsolation(job.tenantId, actorTenantId, actorRole);
        if (!access.allowed) {
          sendError(response, 403, access.reason);
          return;
        }

        sendJson(response, 200, {
          job: await currentRuntime.reject(jobId, stepId, {
            role: actorRole,
            subjectId: resolveActorSubjectId(request, body),
            tenantId: actorTenantId || undefined,
            reason: stringField(body, "reason") || stringField(body, "message"),
          }),
        });
        return;
      }

      if (request.method === "POST" && url.pathname === "/v1/workflows/lead-recovery/run") {
        const body = await readJsonBody(request);
        const goal = body.goal as GoalInput | undefined;
        if (!goal) {
          sendError(response, 400, "Request body must include goal.");
          return;
        }
        const job = await currentRuntime.runGoal({
          ...goal,
          requestedByRole: resolvePrincipalRole(request, "operator"),
        });
        sendJson(response, 200, { job });
        return;
      }

      if (request.method === "POST" && url.pathname === "/v1/workflows/nexusbuild/run") {
        const body = await readJsonBody(request);
        const goal = buildNexusBuildGoal(body, resolvePrincipalRole(request, "operator"));
        const job = await currentRuntime.runGoal(goal);
        sendJson(response, 200, { job });
        return;
      }

      if (request.method === "POST" && url.pathname === "/v1/workflows/provly/run") {
        const body = await readJsonBody(request);
        const goal = buildProvLyGoal(body, resolvePrincipalRole(request, "operator"));
        const job = await currentRuntime.runGoal(goal);
        sendJson(response, 200, { job });
        return;
      }

      if (request.method === "POST" && url.pathname === "/v1/workflows/neurormoves/run") {
        const body = await readJsonBody(request);
        const goal = buildNeuroMovesGoal(body, resolvePrincipalRole(request, "operator"));
        const job = await currentRuntime.runGoal(goal);
        sendJson(response, 200, { job });
        return;
      }

        if (request.method === "POST" && url.pathname === "/v1/workflows/provly/upload") {
          const formBody = await readMultipartBody(request);
          const goal = buildProvLyGoal(formBody, resolvePrincipalRole(request, "operator"));
          const job = await currentRuntime.runGoal(goal);
          sendJson(response, 200, {
            status: "processed",
            job,
            upload: buildProvLyUploadSummary(job, goal, formBody),
          });
          return;
        }

      if (request.method === "POST" && url.pathname === "/v1/workflows/shared/run") {
        const body = await readJsonBody(request);
        const goal = buildSharedAdapterGoal(body, url.origin, resolvePrincipalRole(request, "system"));
        const job = await currentRuntime.runGoal(goal);
        sendJson(response, 200, { job });
        return;
      }

      if (request.method === "POST" && url.pathname === "/v1/webhooks/twilio/missed-call") {
        const rawBodyBuffer = await readRawBodyBuffer(request);
        const rawBody = rawBodyBuffer.toString("utf8");
        const twilioAccess = verifyTwilioRequest(request, rawBody, currentRuntime.config);
        if (!twilioAccess.allowed) {
          sendError(response, 401, twilioAccess.reason || "Invalid Twilio webhook.");
          return;
        }
        const body = parseFlexibleBody(rawBody, String(request.headers["content-type"] || ""));
        const goal = buildTwilioLeadRecoveryGoal(body);
        if (!isMissedCallEvent(body)) {
          sendJson(response, 202, {
            status: "ignored",
            reason: "Twilio call did not look like a missed call event.",
            goal,
          });
          return;
        }

        const job = await currentRuntime.runGoal(goal);
        sendJson(response, 200, {
          status: "processed",
          job,
          event: (goal.payload as { readonly leadRecovery?: { readonly event?: unknown } } | undefined)?.leadRecovery?.event,
        });
        return;
      }

      sendError(response, 404, "Route not found.");
    } catch (error) {
      sendError(response, 500, error instanceof Error ? error.message : String(error));
    }
  });

  const startedPort = await listenOnAvailablePort(server, port, host);

  return {
    server,
    port: startedPort,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      }),
  };
}

async function readJsonBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  const raw = await readRawBody(request);
  return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
}

async function readFlexibleBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  const raw = await readRawBody(request);
  return parseFlexibleBody(raw, String(request.headers["content-type"] || ""));
}

async function readRawBody(request: IncomingMessage): Promise<string> {
  return (await readRawBodyBuffer(request)).toString("utf8").trim();
}

async function readRawBodyBuffer(request: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function readMultipartBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  const rawBody = await readRawBodyBuffer(request);
  const contentType = String(request.headers["content-type"] || "");
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    return parseFlexibleBody(rawBody.toString("utf8"), contentType);
  }

  const formRequest = new Request("http://localhost/upload", {
    method: request.method || "POST",
    headers: {
      "content-type": contentType,
    },
    body: rawBody,
  });
  const formData = await formRequest.formData();
  return buildObjectFromFormData(formData);
}

function parseFlexibleBody(raw: string, contentType: string): Record<string, unknown> {
  if (!raw) {
    return {};
  }

  const normalizedType = contentType.toLowerCase();
  if (normalizedType.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(raw).entries());
  }

  if (normalizedType.includes("application/json")) {
    return JSON.parse(raw) as Record<string, unknown>;
  }

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return Object.fromEntries(new URLSearchParams(raw).entries());
  }
}

async function buildObjectFromFormData(formData: FormData): Promise<Record<string, unknown>> {
  const body: Record<string, unknown> = {};
  const visualAssets: Record<string, unknown>[] = [];
  const attachments: Record<string, unknown>[] = [];
  const receipts: Record<string, unknown>[] = [];

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      appendFormField(body, key, value);
      continue;
    }

    if (value instanceof File) {
      const asset = await buildVisualAssetFromFile(key, value);
      visualAssets.push(asset);
      attachments.push(asset);
      if (shouldTreatAsReceipt(key, value)) {
        receipts.push(asset);
      }
    }
  }

  if (visualAssets.length > 0) {
    body.visualAssets = visualAssets;
    body.photos = visualAssets;
  }
  if (attachments.length > 0) {
    body.attachments = attachments;
  }
  if (receipts.length > 0) {
    body.receipts = receipts;
  }

  return body;
}

function appendFormField(body: Record<string, unknown>, key: string, value: string): void {
  const trimmed = value.trim();
  if (!trimmed) {
    return;
  }

  const existing = body[key];
  if (existing === undefined) {
    body[key] = trimmed;
    return;
  }

  if (Array.isArray(existing)) {
    body[key] = [...existing, trimmed];
    return;
  }

  body[key] = [existing, trimmed];
}

async function buildVisualAssetFromFile(fieldName: string, file: File): Promise<Record<string, unknown>> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const asset = {
    filename: file.name,
    label: file.name.replace(/\.[^.]+$/, "") || file.name,
    mimeType: file.type || "application/octet-stream",
    kind: inferVisualAssetKind(fieldName, file.name, file.type),
    metadata: {
      fieldName,
      size: file.size,
    },
  } as const;

  return {
    ...asset,
    dataUrl: `data:${asset.mimeType};base64,${bytes.toString("base64")}`,
  };
}

function inferVisualAssetKind(fieldName: string, fileName: string, mimeType: string): "photo" | "receipt" | "document" | "other" {
  const haystack = `${fieldName} ${fileName} ${mimeType}`.toLowerCase();
  if (haystack.includes("receipt") || haystack.includes("invoice") || haystack.includes("bill")) {
    return "receipt";
  }
  if (haystack.includes("photo") || haystack.includes("image") || haystack.includes("jpg") || haystack.includes("jpeg") || haystack.includes("png") || haystack.includes("webp") || haystack.includes("heic") || haystack.includes("heif")) {
    return "photo";
  }
  if (haystack.includes("scan") || haystack.includes("document") || haystack.includes("pdf")) {
    return "document";
  }
  return "other";
}

function shouldTreatAsReceipt(fieldName: string, file: File): boolean {
  const haystack = `${fieldName} ${file.name} ${file.type}`.toLowerCase();
  return haystack.includes("receipt") || haystack.includes("invoice") || haystack.includes("bill");
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.statusCode = statusCode;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload, null, 2));
}

function sendError(response: ServerResponse, statusCode: number, message: string): void {
  sendJson(response, statusCode, {
    error: { message },
  });
}

function setCommonHeaders(response: ServerResponse): void {
  response.setHeader("access-control-allow-origin", "*");
  response.setHeader("access-control-allow-headers", "content-type, authorization, x-twilio-signature, x-nstep-tenant-id, x-nstep-role, x-nstep-actor-id");
  response.setHeader("access-control-allow-methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  response.setHeader("cache-control", "no-store");
}

function buildTwilioLeadRecoveryGoal(body: Record<string, unknown>): GoalInput {
  const goal = body.goal as GoalInput | undefined;
  if (goal && goal.product === "lead-recovery") {
    return {
      ...goal,
      requestedByRole: goal.requestedByRole || "system",
    };
  }

  const tenantId = stringField(body, "tenantId") || "default";
  const event = buildTwilioLeadRecoveryEvent(body, tenantId);
  const brand = buildTwilioBrandProfile(body, tenantId);
  const lead = buildTwilioLeadRecord(body, tenantId, event.callerPhone);

  return {
    goal: stringField(body, "goal") || `Recover missed call from ${event.callerPhone}`,
    product: "lead-recovery",
    priority: stringField(body, "priority") === "critical" ? "critical" : "high",
    constraints: [
      "do not message leads contacted in the last 48 hours",
      "use a business-safe tone",
    ],
    mode: stringField(body, "mode") === "autonomous" ? "autonomous" : "assist",
    tenantId,
    requestedBy: stringField(body, "requestedBy") || `twilio:${event.callSid || event.eventId}`,
    requestedByRole: "system",
    source: "system",
    payload: {
      leadRecovery: {
        goal: stringField(body, "goal") || `Recover missed call from ${event.callerPhone}`,
        event,
        brand,
        lead,
      },
    },
  };
}

function buildNexusBuildGoal(body: Record<string, unknown>, requestedByRole: PrincipalRole = "operator"): GoalInput {
  const goal = body.goal as GoalInput | undefined;
  if (goal && goal.product === "nexusbuild") {
    return {
      ...goal,
      requestedByRole: goal.requestedByRole || requestedByRole,
    };
  }

  const tenantId = stringField(body, "tenantId") || "default";
  const operation = resolveNexusBuildOperation(body);
  const useCase = resolveNexusBuildUseCase(body);
  const rawConstraints = body.constraints;
  const constraints = Array.isArray(rawConstraints)
    ? rawConstraints.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [
        "evaluate compatibility and performance clearly",
        "use builder-friendly premium language",
        "surface bottlenecks and value guidance",
      ];
  const buildName =
    stringField(body, "buildName") ||
    stringField(body, "name") ||
    stringField(body, "title") ||
    stringField(body, "goal") ||
    `NexusBuild ${useCase}`;

  return {
    goal: stringField(body, "goal") || `${buildName} analysis`,
    product: "nexusbuild",
    priority: stringField(body, "priority") === "critical" ? "critical" : "high",
    constraints,
    mode: stringField(body, "mode") === "autonomous" ? "autonomous" : "assist",
    tenantId,
    requestedBy: stringField(body, "requestedBy") || `api:${tenantId}`,
    requestedByRole,
    source: "system",
    payload: {
      nexusbuild: {
        operation,
        workflowType: operation,
        intent: operation,
        useCase,
        buildName,
        budget: body.budget,
        currency: stringField(body, "currency") || undefined,
        parts: body.parts,
        savedBuild: body.savedBuild,
        comparisonBuilds: body.comparisonBuilds,
        priceSources: body.priceSources,
        watchlist: body.watchlist,
        preferences: body.preferences,
        benchmarkContext: body.benchmarkContext,
        priceMode: stringField(body, "priceMode") || undefined,
      },
    },
  };
}

function buildProvLyGoal(body: Record<string, unknown>, requestedByRole: PrincipalRole = "operator"): GoalInput {
  const goal = body.goal as GoalInput | undefined;
  if (goal && goal.product === "provly") {
    return {
      ...goal,
      requestedByRole: goal.requestedByRole || requestedByRole,
    };
  }

  const tenantId = stringField(body, "tenantId") || "default";
  const caseId = stringField(body, "caseId") || createProvLyCaseId();
  const operation = resolveProvLyOperation(body);
  const claimantName = stringField(body, "claimantName") || stringField(body, "name") || stringField(body, "customerName") || "Household inventory";
  const claimType = stringField(body, "claimType") || "home inventory";
  const rawPriority = stringField(body, "priority");
  const reminderMode = resolveProvLyReminderMode(body);
  const exportFormat = resolveProvLyExportFormat(body);
  const preferredCurrency = stringField(body, "preferredCurrency") || stringField(body, "currency") || "USD";
  const documentationRules = coerceObject(body.documentationRules || body.rules) || {};
  const preferences = coerceObject(body.preferences) || {};

  return {
    goal: stringField(body, "goal") || `Prepare ${claimType} export for ${claimantName}`,
    product: "provly",
    priority: rawPriority === "critical" ? "critical" : "high",
    constraints: [
      "keep inventory records organized by room and category",
      "flag missing documentation clearly",
      "prepare claim-ready exports and reminders",
    ],
    mode: stringField(body, "mode") === "autonomous" ? "autonomous" : "assist",
    tenantId,
    requestedBy: stringField(body, "requestedBy") || `api:${tenantId}`,
    requestedByRole,
    source: "system",
    payload: {
      provly: {
      operation,
      workflowType: operation,
      intent: operation,
      caseId,
      claimantName,
      claimType,
      inventoryItems: body.inventoryItems ?? body.items ?? body.inventory ?? body.records ?? body.assets,
      attachments: body.attachments ?? body.photos ?? body.files ?? body.documents,
        receipts: body.receipts ?? body.receiptDocs ?? body.invoices,
        rooms: body.rooms ?? body.roomNames ?? body.locations,
        claimContext: coerceObject(body.claimContext) || coerceObject(body.claim) || {},
        reminderEmail: stringField(body, "reminderEmail") || stringField(body, "email"),
        reminderPhone: stringField(body, "reminderPhone") || stringField(body, "phone"),
        exportFormat,
        preferredCurrency,
        highValueThreshold: numberField(body, "highValueThreshold"),
        policyName: stringField(body, "policyName") || stringField(body, "policy"),
        policyDeadline: stringField(body, "policyDeadline") || stringField(body, "deadline"),
        documentationRules,
        preferences,
        reminderMode,
        notes: stringField(body, "notes") || stringField(body, "summary") || stringField(body, "goal"),
      },
    },
  };
}

function buildProvLyUploadSummary(job: JobRecord, goal: GoalInput, body: Record<string, unknown>): Record<string, unknown> {
  const goalPayload = coerceObject(goal.payload) || {};
  const provlyPayload = coerceObject(goalPayload.provly) || {};
  const jobResult = coerceObject(job.result);
  const jobResultData = coerceObject(jobResult?.data);
  const dashboardSummary = coerceObject(jobResultData?.dashboard) || {};
  const report = coerceObject(jobResultData?.report) || {};
  const reportMetadata = coerceObject(report.metadata) || {};
  const extraction =
    coerceObject(dashboardSummary.visualExtraction) ||
    coerceObject(reportMetadata.visualExtraction) ||
    undefined;

  return {
    caseId: stringField(body, "caseId") || stringField(provlyPayload, "caseId") || `case_${job.jobId.slice(4, 12)}`,
    claimantName: stringField(body, "claimantName") || stringField(provlyPayload, "claimantName") || "Household inventory",
    claimType: stringField(body, "claimType") || stringField(provlyPayload, "claimType") || "home inventory",
    jobId: job.jobId,
    jobStatus: job.status,
    approvalStatus: job.approvalStatus,
    visualAssetCount: Array.isArray(body.visualAssets) ? body.visualAssets.length : 0,
    attachmentCount: Array.isArray(body.attachments) ? body.attachments.length : 0,
    receiptCount: Array.isArray(body.receipts) ? body.receipts.length : 0,
    reportStatus: typeof jobResult?.status === "string" ? jobResult.status : undefined,
    reportSummary: typeof jobResult?.summary === "string" ? jobResult.summary : undefined,
    extraction,
  };
}

function buildSharedAdapterGoal(
  body: Record<string, unknown>,
  origin: string,
  requestedByRole: PrincipalRole = "system",
): GoalInput {
  const goal = coerceObject(body.goal) as GoalInput | undefined;
  if (goal) {
    const payload = coerceObject(goal.payload) || {};
    const sharedPayload = coerceObject(payload.shared) || {};

    return {
      ...goal,
      requestedByRole: goal.requestedByRole || requestedByRole,
      payload: {
        ...payload,
        workflow: "shared",
        shared: {
          ...sharedPayload,
          healthUrl: stringField(body, "healthUrl") || originToHealthUrl(origin),
          label:
            stringField(body, "label") ||
            stringField(body, "sampleLabel") ||
            (typeof sharedPayload.label === "string" ? sharedPayload.label : undefined) ||
            "shared-adapter-sample",
        },
      },
    };
  }

  const tenantId = stringField(body, "tenantId") || "default";
  const healthUrl = stringField(body, "healthUrl") || originToHealthUrl(origin);
  const sampleLabel = stringField(body, "label") || stringField(body, "sampleLabel") || "shared-adapter-sample";

  return {
    goal: stringField(body, "goal") || "Validate the shared adapter pipeline.",
    product: "neurormoves",
    priority: stringField(body, "priority") === "critical" ? "critical" : "low",
    constraints: [
      "keep the run harmless",
      "avoid product-specific workflows",
    ],
    mode: stringField(body, "mode") === "assist" ? "assist" : "autonomous",
    tenantId,
    requestedBy: stringField(body, "requestedBy") || `api:${tenantId}`,
    requestedByRole,
    source: "system",
    payload: {
      workflow: "shared",
      shared: {
        healthUrl,
        label: sampleLabel,
      },
    },
  };
}

function buildTwilioLeadRecoveryEvent(body: Record<string, unknown>, tenantId: string): { eventId: string; tenantId: string; callerPhone: string; calledNumber: string; missedAt: string; callSid?: string; source: "webhook"; metadata: Record<string, unknown>; } {
  const callSid = stringField(body, "CallSid") || stringField(body, "callSid");
  const callerPhone = stringField(body, "From") || stringField(body, "callerPhone");
  const calledNumber = stringField(body, "To") || stringField(body, "calledNumber");
  if (!callerPhone || !calledNumber) {
    throw new Error("Twilio webhook payload must include From and To values.");
  }

  const missedAt = stringField(body, "Timestamp") || new Date().toISOString();
  return {
    eventId: callSid ? `twilio_${callSid}` : `twilio_${randomUUID()}`,
    tenantId,
    callerPhone,
    calledNumber,
    missedAt,
    callSid,
    source: "webhook",
    metadata: {
      ...body,
      provider: "twilio",
      callStatus: stringField(body, "CallStatus") || stringField(body, "callStatus") || "unknown",
      callDuration: stringField(body, "CallDuration") || stringField(body, "callDuration"),
    },
  };
}

function originToHealthUrl(origin: string): string {
  try {
    const parsed = new URL(origin);
    return `${parsed.origin}/health`;
  } catch {
    return `${origin.replace(/\/$/, "")}/health`;
  }
}

function buildTwilioBrandProfile(body: Record<string, unknown>, tenantId: string): {
  businessName: string;
  primaryNumber: string;
  callbackNumber: string;
  smsFromNumber: string;
  timeZone: string;
  tone: "business-safe" | "warm" | "urgent";
  doNotContactWindowHours: number;
  signature?: string;
  followupTemplate?: string;
} {
  const primaryNumber = stringField(body, "primaryNumber") || stringField(body, "To") || "";
  const callbackNumber = stringField(body, "callbackNumber") || primaryNumber;
  const smsFromNumber = stringField(body, "smsFromNumber") || callbackNumber || primaryNumber;
  return {
    businessName: stringField(body, "businessName") || `NStep ${tenantId}`,
    primaryNumber,
    callbackNumber,
    smsFromNumber,
    timeZone: stringField(body, "timeZone") || "America/New_York",
    tone: resolveTone(stringField(body, "tone")),
    doNotContactWindowHours: numberField(body, "doNotContactWindowHours") || 48,
    signature: stringField(body, "signature") || undefined,
    followupTemplate: stringField(body, "followupTemplate") || undefined,
  };
}

function buildTwilioLeadRecord(body: Record<string, unknown>, tenantId: string, phone: string): LeadRecord {
  const leadName = stringField(body, "leadName");
  const leadEmail = stringField(body, "leadEmail");
  const leadStage = stringField(body, "leadStage");
  return {
    leadId: stringField(body, "leadId") || `lead_${randomUUID()}`,
    tenantId,
    phone,
    name: leadName || undefined,
    email: leadEmail || undefined,
    stage:
      leadStage === "contacted" ||
      leadStage === "replied" ||
      leadStage === "qualified" ||
      leadStage === "opted_out" ||
      leadStage === "blocked"
        ? leadStage
        : "new",
    doNotContact: booleanField(body, "leadDoNotContact"),
    communicationTone: resolveTone(stringField(body, "leadCommunicationTone")),
    notes: stringField(body, "leadNotes") || "Auto-created from a Twilio missed call webhook.",
    lastInboundAt: stringField(body, "lastInboundAt") || undefined,
    lastOutboundAt: stringField(body, "lastOutboundAt") || undefined,
    lastContactedAt: stringField(body, "lastContactedAt") || undefined,
    contactedWithin48h: booleanField(body, "leadContactedWithin48h"),
    metadata: {
      ...body,
      tenantId,
    },
  };
}

function isMissedCallEvent(body: Record<string, unknown>): boolean {
  const status = stringField(body, "CallStatus") || stringField(body, "callStatus") || stringField(body, "status") || "";
  const normalized = status.toLowerCase();
  if (["no-answer", "busy", "failed", "canceled", "cancelled"].includes(normalized)) {
    return true;
  }

  const duration = numberField(body, "CallDuration");
  return normalized === "completed" && duration === 0;
}

function readDashboardQuery(searchParams: URLSearchParams): DashboardQuery {
  return {
    tenantId: cleanQueryValue(searchParams.get("tenantId")) || undefined,
    product: resolveProductKey(searchParams.get("product") || undefined),
    workflow: resolveWorkflowKey(searchParams.get("workflow") || undefined),
    jobId: cleanQueryValue(searchParams.get("jobId")) || undefined,
    caseId: cleanQueryValue(searchParams.get("caseId")) || undefined,
    status: resolveJobStatuses(readQueryValues(searchParams, "status")),
    approvalStatus: resolveApprovalStatuses(readQueryValues(searchParams, "approvalStatus")),
    page: parseQueryNumber(searchParams.get("page")),
    pageSize: parseQueryNumber(searchParams.get("pageSize")),
    search: cleanQueryValue(searchParams.get("search")) || undefined,
    sortBy: resolveSortBy(cleanQueryValue(searchParams.get("sortBy")) || undefined),
    sortDirection: searchParams.get("sortDirection") === "asc" ? "asc" : searchParams.get("sortDirection") === "desc" ? "desc" : undefined,
    from: cleanQueryValue(searchParams.get("from")) || undefined,
    to: cleanQueryValue(searchParams.get("to")) || undefined,
    lane: resolveExecutionLane(cleanQueryValue(searchParams.get("lane")) || undefined),
    priceSource: cleanQueryValue(searchParams.get("priceSource") || searchParams.get("priceSources")) || undefined,
    reportBuildId: cleanQueryValue(searchParams.get("reportBuildId")) || undefined,
    comparisonBuildId: cleanQueryValue(searchParams.get("comparisonBuildId")) || undefined,
  };
}

function resolveDashboardProduct(value: string): ProductKey | undefined {
  return resolveProductKey(value);
}

function resolveProductKey(value?: string): ProductKey | undefined {
  if (value === "lead-recovery" || value === "nexusbuild" || value === "provly" || value === "neurormoves") {
    return value;
  }
  return undefined;
}

function resolveWorkflowKey(value?: string): WorkflowKey | undefined {
  if (value === "lead-recovery" || value === "nexusbuild" || value === "provly" || value === "neurormoves" || value === "shared") {
    return value;
  }
  return undefined;
}

function resolveJobStatuses(values: readonly string[]): DashboardQuery["status"] {
  const statuses = values.filter((value): value is JobStatus => isJobStatus(value));
  if (statuses.length === 0) {
    return undefined;
  }
  return statuses.length === 1 ? statuses[0] : statuses;
}

function resolveApprovalStatuses(values: readonly string[]): DashboardQuery["approvalStatus"] {
  const statuses = values.filter((value): value is ApprovalStatus => isApprovalStatus(value));
  if (statuses.length === 0) {
    return undefined;
  }
  return statuses.length === 1 ? statuses[0] : statuses;
}

function resolveExecutionLane(value?: string): ExecutionLane | undefined {
  if (value === "internal" || value === "external" || value === "mixed") {
    return value;
  }
  return undefined;
}

function resolveSortBy(value?: string): DashboardQuery["sortBy"] {
  if (value === "createdAt" || value === "updatedAt" || value === "status" || value === "product" || value === "priority") {
    return value;
  }
  return undefined;
}

function isJobStatus(value: string): value is JobStatus {
  return value === "pending" || value === "routing" || value === "planning" || value === "waiting_approval" || value === "running" || value === "verifying" || value === "failed" || value === "completed";
}

function isApprovalStatus(value: string): value is ApprovalStatus {
  return value === "not_required" || value === "pending" || value === "approved" || value === "rejected";
}

function readQueryValues(searchParams: URLSearchParams, key: string): readonly string[] {
  const values = searchParams.getAll(key).flatMap((value) => value.split(","));
  return values.map((value) => cleanQueryValue(value)).filter((value): value is string => Boolean(value));
}

function cleanQueryValue(value: string | null | undefined): string | undefined {
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function parseQueryNumber(value: string | null): number | undefined {
  if (!value || !value.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function resolveKnowledgeSearchLimit(value: string | null): number {
  const parsed = parseQueryNumber(value);
  if (parsed === undefined) {
    return 5;
  }

  return Math.min(Math.max(Math.trunc(parsed), 1), 20);
}

function stringField(body: Record<string, unknown>, key: string): string | undefined {
  const value = body[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberField(body: Record<string, unknown>, key: string): number | undefined {
  const value = body[key];
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function booleanField(body: Record<string, unknown>, key: string): boolean {
  const value = body[key];
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return ["true", "1", "yes"].includes(value.trim().toLowerCase());
  }
  return false;
}

function resolvePrincipalRole(request: IncomingMessage, fallback: PrincipalRole): PrincipalRole {
  const headerRole = String(request.headers["x-nstep-role"] || "").trim().toLowerCase();
  if (headerRole === "viewer" || headerRole === "analyst" || headerRole === "operator" || headerRole === "admin" || headerRole === "system") {
    return headerRole;
  }
  return fallback;
}

function resolveActorSubjectId(request: IncomingMessage, body: Record<string, unknown>): string | undefined {
  const headerActorId = String(request.headers["x-nstep-actor-id"] || "").trim();
  if (headerActorId) {
    return headerActorId;
  }
  return stringField(body, "actorId") || stringField(body, "requestedBy");
}

function resolveTenantFilter(searchParams: URLSearchParams, request: IncomingMessage): string | undefined {
  const queryTenant = cleanQueryValue(searchParams.get("tenantId"));
  if (queryTenant) {
    return queryTenant;
  }

  const headerTenant = String(request.headers["x-nstep-tenant-id"] || "").trim();
  return headerTenant || undefined;
}

function resolveTone(value: string | undefined): "business-safe" | "warm" | "urgent" {
  if (value === "warm" || value === "urgent") {
    return value;
  }
  return "business-safe";
}

function resolveNexusBuildOperation(body: Record<string, unknown>): "build-intake" | "compatibility-review" | "bottleneck-analysis" | "price-monitoring" | "recommendation-report" | "parts-comparison" {
  const operation = stringField(body, "operation") || stringField(body, "workflowType") || stringField(body, "intent");
  if (
    operation === "build-intake" ||
    operation === "compatibility-review" ||
    operation === "bottleneck-analysis" ||
    operation === "price-monitoring" ||
    operation === "recommendation-report" ||
    operation === "parts-comparison"
  ) {
    return operation;
  }

  const text = `${stringField(body, "goal") || ""} ${stringField(body, "buildName") || ""} ${stringField(body, "title") || ""}`.toLowerCase();
  if (/(compare|comparison|versus|vs\.)/.test(text)) {
    return "parts-comparison";
  }
  if (/(price watch|price monitoring|monitor prices|track prices)/.test(text)) {
    return "price-monitoring";
  }
  if (/(bottleneck|imbalance)/.test(text)) {
    return "bottleneck-analysis";
  }
  if (/(compatibility|fit check|socket|memory|psu)/.test(text)) {
    return "compatibility-review";
  }

  return "recommendation-report";
}

function resolveNexusBuildUseCase(body: Record<string, unknown>): "gaming" | "productivity" | "creator" | "budget" | "workstation" | "general" {
  const useCase = stringField(body, "useCase");
  if (useCase === "gaming" || useCase === "productivity" || useCase === "creator" || useCase === "budget" || useCase === "workstation" || useCase === "general") {
    return useCase;
  }

  const text = `${stringField(body, "goal") || ""} ${stringField(body, "buildName") || ""} ${stringField(body, "title") || ""}`.toLowerCase();
  if (/(gaming|fps|esports|1440p|4k)/.test(text)) {
    return "gaming";
  }
  if (/(creator|editing|rendering|3d|streaming)/.test(text)) {
    return "creator";
  }
  if (/(productivity|office|business|multitask)/.test(text)) {
    return "productivity";
  }
  if (/(workstation|cad|simulation|vm|virtualization)/.test(text)) {
    return "workstation";
  }
  if (/(budget|value|affordable|cheap)/.test(text)) {
    return "budget";
  }

  return "general";
}

function resolveProvLyOperation(body: Record<string, unknown>): "inventory-intake" | "documentation-review" | "claim-preparation" | "room-review" | "reminder-generation" | "export-generation" | "high-value-review" {
  const operation = stringField(body, "operation") || stringField(body, "workflowType") || stringField(body, "intent");
  if (
    operation === "inventory-intake" ||
    operation === "documentation-review" ||
    operation === "claim-preparation" ||
    operation === "room-review" ||
    operation === "reminder-generation" ||
    operation === "export-generation" ||
    operation === "high-value-review"
  ) {
    return operation;
  }

  const text = `${stringField(body, "goal") || ""} ${stringField(body, "claimType") || ""} ${stringField(body, "claimantName") || ""}`.toLowerCase();
  if (/(reminder|follow up|missing docs|incomplete)/.test(text)) {
    return "reminder-generation";
  }
  if (/(export|summary|packet|ready)/.test(text)) {
    return "export-generation";
  }
  if (/(high value|valuable|jewelry|watch|art)/.test(text)) {
    return "high-value-review";
  }
  if (/(room|by room|room review|room-by-room)/.test(text)) {
    return "room-review";
  }
  if (/(documentation|missing information|completeness|review docs)/.test(text)) {
    return "documentation-review";
  }
  if (/(inventory intake|add item|manual inventory|upload inventory|import inventory)/.test(text)) {
    return "inventory-intake";
  }

  return "claim-preparation";
}

function resolveProvLyExportFormat(body: Record<string, unknown>): "json" | "csv" | "summary" | "pdf-outline" {
  const format = stringField(body, "exportFormat") || stringField(body, "format");
  if (format === "json" || format === "csv" || format === "summary" || format === "pdf-outline") {
    return format;
  }
  return "summary";
}

function resolveProvLyReminderMode(body: Record<string, unknown>): "dashboard" | "email" | "both" {
  const mode = stringField(body, "reminderMode");
  if (mode === "email" || mode === "both") {
    return mode;
  }
  return "dashboard";
}

function coerceObject(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
}

async function listenOnAvailablePort(server: ReturnType<typeof createServer>, requestedPort: number, host: string): Promise<number> {
  try {
    return await listenOnPort(server, requestedPort, host);
  } catch (error) {
    if (isAddressInUseError(error) && requestedPort !== 0) {
      return listenOnPort(server, 0, host);
    }
    throw error;
  }
}

async function listenOnPort(server: ReturnType<typeof createServer>, port: number, host: string): Promise<number> {
  await new Promise<void>((resolve, reject) => {
    const onError = (error: NodeJS.ErrnoException) => {
      server.off("error", onError);
      reject(error);
    };

    server.once("error", onError);
    server.listen(port, host, () => {
      server.off("error", onError);
      resolve();
    });
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Could not determine NStepOS server port.");
  }

  return address.port;
}

function isAddressInUseError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && (error as NodeJS.ErrnoException).code === "EADDRINUSE";
}

function buildNeuroMovesGoal(body: Record<string, unknown>, requestedByRole: PrincipalRole = "operator"): GoalInput {
  const goal = body.goal as GoalInput | undefined;
  if (goal && goal.product === "neurormoves") {
    return {
      ...goal,
      requestedByRole: goal.requestedByRole || requestedByRole,
    };
  }

  const tenantId = stringField(body, "tenantId") || "default";
  const childName = stringField(body, "childName") || "Child";
  const focus = stringField(body, "focus") || "support routine";

  return {
    goal: stringField(body, "goal") || `Generate ${focus} routine for ${childName}`,
    product: "neurormoves",
    priority: stringField(body, "priority") === "critical" ? "critical" : "medium",
    constraints: [
      "create a supportive and clear routine",
      "leverage strengths while addressing challenges",
      "provide family-facing summaries",
    ],
    mode: stringField(body, "mode") === "autonomous" ? "autonomous" : "assist",
    tenantId,
    requestedBy: stringField(body, "requestedBy") || `api:${tenantId}`,
    requestedByRole,
    source: "system",
    payload: {
      neurormoves: {
        childName,
        ageGroup: stringField(body, "ageGroup"),
        focus,
        strengths: body.strengths,
        challenges: body.challenges,
        preferredTone: stringField(body, "preferredTone") || "warm",
        parentEmail: stringField(body, "parentEmail"),
        nextCheckInDays: numberField(body, "nextCheckInDays") || 7,
        routineWindow: stringField(body, "routineWindow"),
      },
    },
  };
}

async function main(): Promise<void> {
  const runtime = await createNStepOsRuntime();
  const started = await startNStepOsServer(runtime);
  const portMessage = started.port !== runtime.config.port ? ` (requested ${runtime.config.port} was busy)` : "";
  console.log(`NStepOS listening on http://127.0.0.1:${started.port}${portMessage}`);
}

const isDirectRun = (() => {
  try {
    return process.argv[1] ? fileURLToPath(import.meta.url) === process.argv[1] : false;
  } catch {
    return false;
  }
})();

if (isDirectRun) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.stack || error.message : String(error));
    process.exitCode = 1;
  });
}
