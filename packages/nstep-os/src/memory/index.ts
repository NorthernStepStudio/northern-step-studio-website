import { randomUUID } from "node:crypto";
import { createNoopLogger } from "../core/logger.js";
import type {
  JobRecord,
  MemoryAuditEntry,
  MemoryCategory,
  MemoryEntry,
  MemoryLesson,
  MemoryLessonOutcome,
  MemoryStore,
  NStepLogger,
  PrincipalRole,
  WorkflowDefinition,
  WorkflowExecutionContext,
  MemoryTier,
} from "../core/types.js";
import type { MemoryEditRequest } from "../core/validation.js";

export interface MemoryWriteSummary {
  readonly total: number;
  readonly created: number;
  readonly updated: number;
  readonly ids: readonly string[];
  readonly byCategory: Record<string, number>;
  readonly editable: number;
}

export interface MemoryLessonInput {
  readonly outcome: MemoryLessonOutcome;
  readonly symptom?: string;
  readonly cause?: string;
  readonly fix?: string;
  readonly prevention?: string;
  readonly reuseRule?: string;
  readonly evidence?: string;
}

export interface MemoryPersistOptions {
  readonly jobId?: string;
  readonly actorRole?: PrincipalRole;
  readonly actorId?: string;
  readonly note?: string;
  readonly sourceStepId?: string;
}

export interface MemoryHierarchy {
  readonly episodic: readonly MemoryEntry[];
  readonly semantic: readonly MemoryEntry[];
  readonly procedural: readonly MemoryEntry[];
  readonly prioritized: readonly MemoryEntry[];
}

export interface MemoryService {
  createJobMemory(
    workflow: WorkflowDefinition,
    job: JobRecord,
    context: WorkflowExecutionContext,
  ): Promise<readonly MemoryEntry[]>;
  persistJobMemory(entries: readonly MemoryEntry[], options?: MemoryPersistOptions): Promise<MemoryWriteSummary>;
  createJobMemoryAndPersist(
    workflow: WorkflowDefinition,
    job: JobRecord,
    context: WorkflowExecutionContext,
    options?: MemoryPersistOptions,
  ): Promise<MemoryWriteSummary>;
  editMemoryEntry(store: MemoryStore, memoryId: string, request: MemoryEditRequest): Promise<MemoryEditResult>;
  appendMemoryAudit(store: MemoryStore, memoryId: string, audit: MemoryAuditEntry): Promise<MemoryEntry>;
  createMemoryAuditRecord(
    actorRole: MemoryEditRequest["actorRole"],
    note: string,
    sourceJobId?: string,
    sourceStepId?: string,
  ): MemoryAuditEntry;
  createMemoryLesson(input: MemoryLessonInput): MemoryLesson;
  inferMemoryLesson(job: JobRecord, entry: MemoryEntry): MemoryLesson;
  classifyMemoryTier(category: MemoryCategory): MemoryTier;
  buildMemoryHierarchy(memory: readonly MemoryEntry[], limit?: number): MemoryHierarchy;
  selectMemoryForReasoning(memory: readonly MemoryEntry[], limit?: number): readonly MemoryEntry[];
  createMemoryEntryId(prefix?: string): string;
}

export function createMemoryService(store: MemoryStore, logger: NStepLogger = createNoopLogger()): MemoryService {
  async function persist(entries: readonly MemoryEntry[], options?: MemoryPersistOptions): Promise<MemoryWriteSummary> {
    const summary = await persistMemoryEntries(store, entries, options);
    logger.info("Persisted memory entries.", {
      jobId: options?.jobId,
      created: summary.created,
      updated: summary.updated,
      total: summary.total,
      ids: summary.ids,
    });
    return summary;
  }

  return {
    async createJobMemory(workflow, job, context) {
      return createJobMemory(workflow, job, context);
    },
    persistJobMemory(entries, options = {}) {
      return persist(entries, options);
    },
    async createJobMemoryAndPersist(workflow, job, context, options = {}) {
      const entries = await createJobMemory(workflow, job, context);
      return persist(entries, {
        ...options,
        jobId: options.jobId || job.jobId,
      });
    },
    editMemoryEntry,
    appendMemoryAudit,
    createMemoryAuditRecord,
    createMemoryLesson(input) {
      return createMemoryLesson(input);
    },
    inferMemoryLesson(job, entry) {
      return inferMemoryLesson(job, entry);
    },
    classifyMemoryTier(category) {
      return classifyMemoryTier(category);
    },
    buildMemoryHierarchy(memory, limit) {
      return buildMemoryHierarchy(memory, limit);
    },
    selectMemoryForReasoning(memory, limit) {
      return selectMemoryForReasoning(memory, limit);
    },
    createMemoryEntryId,
  };
}

export async function createJobMemory(
  workflow: WorkflowDefinition,
  job: JobRecord,
  context: WorkflowExecutionContext,
): Promise<readonly MemoryEntry[]> {
  return workflow.createMemory(job, context);
}

export interface MemoryEditResult {
  readonly memory: MemoryEntry;
  readonly auditEntry: MemoryAuditEntry;
}

export async function editMemoryEntry(
  store: MemoryStore,
  memoryId: string,
  request: MemoryEditRequest,
): Promise<MemoryEditResult> {
  const existing = await store.get(memoryId);
  if (!existing) {
    throw new Error(`Memory entry ${memoryId} was not found.`);
  }

  if (existing.tenantId !== request.tenantId) {
    throw new Error(`Memory entry ${memoryId} does not belong to tenant ${request.tenantId}.`);
  }

  if (!existing.editable) {
    throw new Error(`Memory entry ${memoryId} is read-only.`);
  }

  const now = new Date().toISOString();
  const next: MemoryEntry = {
    ...existing,
    key: request.key?.trim() || existing.key,
    category: (request.category?.trim() || existing.category) as MemoryEntry["category"],
    value: request.value ?? existing.value,
    confidence: request.confidence ?? existing.confidence,
    editable: request.editable ?? existing.editable,
    auditTrail: appendAuditTrail(existing.auditTrail, {
      at: now,
      action: "edit",
      actorRole: request.actorRole,
      actorId: request.actorId,
      note: request.note,
      sourceJobId: request.sourceJobId,
      sourceStepId: request.sourceStepId,
      diff: buildMemoryDiff(existing, request),
    }),
    updatedAt: now,
  };

  await store.upsert(next);
  const auditEntry = {
    at: now,
    action: "edit",
    actorRole: request.actorRole,
    actorId: request.actorId,
    note: request.note,
    sourceJobId: request.sourceJobId,
    sourceStepId: request.sourceStepId,
    diff: buildMemoryDiff(existing, request),
  } satisfies MemoryAuditEntry;

  return {
    memory: next,
    auditEntry,
  };
}

export async function appendMemoryAudit(
  store: MemoryStore,
  memoryId: string,
  audit: MemoryAuditEntry,
): Promise<MemoryEntry> {
  const existing = await store.get(memoryId);
  if (!existing) {
    throw new Error(`Memory entry ${memoryId} was not found.`);
  }

  const next: MemoryEntry = {
    ...existing,
    auditTrail: appendAuditTrail(existing.auditTrail, audit),
    updatedAt: audit.at,
  };
  await store.upsert(next);
  return next;
}

function appendAuditTrail(existing: readonly MemoryAuditEntry[] | undefined, audit: MemoryAuditEntry): readonly MemoryAuditEntry[] {
  return [...(existing || []), audit];
}

function buildMemoryDiff(existing: MemoryEntry, request: MemoryEditRequest): Record<string, unknown> {
  const diff: Record<string, unknown> = {};
  if (request.key && request.key !== existing.key) {
    diff.key = { from: existing.key, to: request.key };
  }
  if (request.category && request.category !== existing.category) {
    diff.category = { from: existing.category, to: request.category };
  }
  if (request.value !== undefined && request.value !== existing.value) {
    diff.value = { from: existing.value, to: request.value };
  }
  if (request.confidence !== undefined && request.confidence !== existing.confidence) {
    diff.confidence = { from: existing.confidence, to: request.confidence };
  }
  if (request.editable !== undefined && request.editable !== existing.editable) {
    diff.editable = { from: existing.editable, to: request.editable };
  }
  if (request.note) {
    diff.note = request.note;
  }
  if (request.sourceJobId) {
    diff.sourceJobId = request.sourceJobId;
  }
  if (request.sourceStepId) {
    diff.sourceStepId = request.sourceStepId;
  }
  return diff;
}

export function createMemoryAuditRecord(
  actorRole: MemoryEditRequest["actorRole"],
  note: string,
  sourceJobId?: string,
  sourceStepId?: string,
): MemoryAuditEntry {
  return {
    at: new Date().toISOString(),
    action: "update",
    actorRole,
    note,
    sourceJobId,
    sourceStepId,
    diff: {},
  };
}

export function createMemoryLesson(input: MemoryLessonInput): MemoryLesson {
  return {
    outcome: input.outcome,
    symptom: input.symptom,
    cause: input.cause,
    fix: input.fix,
    prevention: input.prevention,
    reuseRule: input.reuseRule,
    evidence: input.evidence,
  };
}

export function classifyMemoryTier(category: MemoryCategory): MemoryTier {
  if (category === "workflow-template" || category === "business-rule") {
    return "procedural";
  }

  if (category === "user-preference" || category === "communication-tone" || category === "tenant-constraint") {
    return "semantic";
  }

  return "episodic";
}

export function buildMemoryHierarchy(memory: readonly MemoryEntry[], limit = 12): MemoryHierarchy {
  const ordered = [...memory].sort((left, right) => {
    const leftAt = Date.parse(left.updatedAt || left.createdAt || "");
    const rightAt = Date.parse(right.updatedAt || right.createdAt || "");
    return (Number.isFinite(rightAt) ? rightAt : 0) - (Number.isFinite(leftAt) ? leftAt : 0);
  });
  const episodic = ordered.filter((entry) => classifyMemoryTier(entry.category) === "episodic");
  const semantic = ordered.filter((entry) => classifyMemoryTier(entry.category) === "semantic");
  const procedural = ordered.filter((entry) => classifyMemoryTier(entry.category) === "procedural");
  return {
    episodic,
    semantic,
    procedural,
    prioritized: selectMemoryForReasoning(ordered, limit),
  };
}

export function selectMemoryForReasoning(memory: readonly MemoryEntry[], limit = 12): readonly MemoryEntry[] {
  const ordered = [...memory].sort((left, right) => {
    const leftAt = Date.parse(left.updatedAt || left.createdAt || "");
    const rightAt = Date.parse(right.updatedAt || right.createdAt || "");
    return (Number.isFinite(rightAt) ? rightAt : 0) - (Number.isFinite(leftAt) ? leftAt : 0);
  });
  const selected: MemoryEntry[] = [];
  const seen = new Set<string>();
  const tierPriority: readonly MemoryTier[] = ["semantic", "procedural", "episodic"];
  const perTierLimit = Math.max(1, Math.floor(limit / tierPriority.length) || 1);

  for (const tier of tierPriority) {
    for (const entry of ordered) {
      if (selected.length >= limit) {
        return selected;
      }
      if (seen.has(entry.id) || classifyMemoryTier(entry.category) !== tier) {
        continue;
      }
      selected.push(entry);
      seen.add(entry.id);
      if (selected.filter((candidate) => classifyMemoryTier(candidate.category) === tier).length >= perTierLimit) {
        break;
      }
    }
  }

  for (const entry of ordered) {
    if (selected.length >= limit) {
      break;
    }
    if (seen.has(entry.id)) {
      continue;
    }
    selected.push(entry);
    seen.add(entry.id);
  }

  return selected.slice(0, limit);
}

export function inferMemoryLesson(job: JobRecord, entry: MemoryEntry): MemoryLesson {
  if (entry.lesson) {
    return entry.lesson;
  }

  const resultStatus = job.result?.status;
  const summary = job.result?.summary || job.status;
  const value = typeof entry.value === "string" ? entry.value : JSON.stringify(entry.value);
  const valueHint = value.length > 180 ? `${value.slice(0, 177)}...` : value;
  const worldState = job.worldState;
  const recentObservation = worldState?.observations.at(-1);
  const repeatedWarning = worldState?.repeatedActionWarnings.at(-1);
  const repeatedAction = repeatedWarning
    ? worldState?.actionHistory.find((item) => item.fingerprint === repeatedWarning.fingerprint)
    : undefined;
  const worldEvidence = [
    worldState?.reasoningSummary ? `Reasoning: ${worldState.reasoningSummary}` : undefined,
    recentObservation ? `Last observation (${recentObservation.phase}): ${recentObservation.summary}` : undefined,
    repeatedWarning
      ? `Repeated action (${repeatedWarning.count}x): ${repeatedWarning.reason}`
      : undefined,
    repeatedAction ? `Fingerprint: ${repeatedAction.fingerprint}` : undefined,
    worldState?.modifiedPaths.length ? `Modified paths: ${worldState.modifiedPaths.join(", ")}` : undefined,
    worldState?.failingTests.length ? `Failing tests: ${worldState.failingTests.join(", ")}` : undefined,
  ]
    .filter((item): item is string => Boolean(item))
    .join(" | ");

  if (resultStatus === "succeeded") {
    return createMemoryLesson({
      outcome: "success",
      evidence: summary,
      reuseRule: `Reuse this pattern when ${entry.key} appears in similar workflow conditions.${repeatedWarning ? " Avoid repeating the same stalled action sequence." : ""}`,
    });
  }

  if (resultStatus === "partial") {
    return createMemoryLesson({
      outcome: "prevention",
      symptom: `Partial outcome for ${entry.key}.`,
      cause: repeatedWarning?.reason || summary,
      fix: "Captured the partial result and preserved the reusable pattern.",
      prevention: repeatedWarning
        ? "Do not repeat the same action fingerprint without a new observation or state change."
        : "Review the partial result before reusing the same workflow shape.",
      reuseRule: `Use this only when partial outcomes are acceptable for ${entry.key}.`,
      evidence: [valueHint, worldEvidence].filter(Boolean).join(" | "),
    });
  }

  return createMemoryLesson({
      outcome: "failure",
    symptom: `Failed or uncertain outcome for ${entry.key}.`,
    cause: repeatedWarning?.reason || summary,
    fix: repeatedWarning
      ? "Stopped the repeated action loop and preserved the state trail for diagnosis."
      : "Saved the failure pattern for later review and future prevention.",
    prevention: repeatedWarning
      ? "Break the repeated-action loop before trying the same step sequence again."
      : "Check the failure lesson before repeating the same workflow conditions.",
    reuseRule: `Avoid the same step sequence when ${entry.key} has the same failure pattern.`,
    evidence: [valueHint, worldEvidence].filter(Boolean).join(" | "),
  });
}

export function createMemoryEntryId(prefix = "memory"): string {
  return `${prefix}_${randomUUID()}`;
}

export async function persistMemoryEntries(
  store: MemoryStore,
  entries: readonly MemoryEntry[],
  options: MemoryPersistOptions = {},
): Promise<MemoryWriteSummary> {
  const now = new Date().toISOString();
  let created = 0;
  let updated = 0;
  const ids: string[] = [];
  const byCategory: Record<string, number> = {};
  let editable = 0;

  for (const entry of entries) {
    const existing = await store.get(entry.id);
    const next: MemoryEntry = {
      ...entry,
      createdAt: existing?.createdAt || entry.createdAt || now,
      updatedAt: now,
      auditTrail: appendAuditTrail(existing?.auditTrail || entry.auditTrail, buildPersistenceAudit(entry, existing, options, now)),
    };

    await store.upsert(next);
    ids.push(next.id);
    byCategory[next.category] = (byCategory[next.category] || 0) + 1;
    if (next.editable) {
      editable += 1;
    }
    if (existing) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  return {
    total: entries.length,
    created,
    updated,
    ids,
    byCategory,
    editable,
  };
}

function buildPersistenceAudit(
  entry: MemoryEntry,
  existing: MemoryEntry | undefined,
  options: MemoryPersistOptions,
  at: string,
): MemoryAuditEntry {
  return {
    at,
    action: existing ? "update" : "create",
    actorRole: options.actorRole || "system",
    actorId: options.actorId,
    note: options.note || `Persisted memory entry ${entry.key}.`,
    sourceJobId: options.jobId || entry.sourceJobId,
    sourceStepId: options.sourceStepId || entry.sourceStepId,
    diff: existing ? buildMemoryDiff(existing, entryToEditRequest(entry, options)) : { created: true },
  };
}

function entryToEditRequest(entry: MemoryEntry, options: MemoryPersistOptions): MemoryEditRequest {
  return {
    tenantId: entry.tenantId,
    actorRole: options.actorRole || "system",
    actorId: options.actorId,
    key: entry.key,
    category: entry.category,
    value: entry.value,
    confidence: entry.confidence,
    editable: entry.editable,
    note: options.note,
    sourceJobId: options.jobId || entry.sourceJobId,
    sourceStepId: options.sourceStepId || entry.sourceStepId,
  };
}
