import type {
  GoalInput,
  JobRecord,
  LeadRecoveryInput,
  MemoryAuditEntry,
  MemoryEntry,
  PrincipalRole,
  RouteDecision,
  WorkflowPlan,
  WorkflowResult,
} from "./types.js";

const PRODUCT_KEYS = new Set<GoalInput["product"]>(["lead-recovery", "nexusbuild", "provly", "neurormoves"]);
const PRIORITIES = new Set<GoalInput["priority"]>(["low", "medium", "high", "critical"]);
const MODES = new Set<GoalInput["mode"]>(["assist", "autonomous"]);
const SOURCES = new Set<NonNullable<GoalInput["source"]>>(["user", "system"]);
const PRINCIPAL_ROLES = new Set<PrincipalRole>(["viewer", "analyst", "operator", "admin", "system"]);

export function assertGoalInput(value: unknown): asserts value is GoalInput {
  if (!value || typeof value !== "object") {
    throw new Error("Goal input must be an object.");
  }

  const goal = value as Partial<GoalInput>;
  if (typeof goal.goal !== "string" || !goal.goal.trim()) {
    throw new Error("Goal input requires a non-empty goal string.");
  }
  if (typeof goal.product !== "string" || !goal.product.trim() || !PRODUCT_KEYS.has(goal.product.trim() as GoalInput["product"])) {
    throw new Error("Goal input requires a valid product.");
  }
  if (typeof goal.priority !== "string" || !goal.priority.trim() || !PRIORITIES.has(goal.priority.trim() as GoalInput["priority"])) {
    throw new Error("Goal input requires a valid priority.");
  }
  if (typeof goal.mode !== "string" || !MODES.has(goal.mode as GoalInput["mode"])) {
    throw new Error("Goal input requires mode to be assist or autonomous.");
  }
  if (typeof goal.tenantId !== "string" || !goal.tenantId.trim()) {
    throw new Error("Goal input requires tenantId.");
  }
  if (goal.source !== undefined && (typeof goal.source !== "string" || !SOURCES.has(goal.source as NonNullable<GoalInput["source"]>))) {
    throw new Error("Goal input source must be user or system when provided.");
  }
  if (goal.requestedByRole !== undefined && (typeof goal.requestedByRole !== "string" || !PRINCIPAL_ROLES.has(goal.requestedByRole as PrincipalRole))) {
    throw new Error("Goal input requestedByRole must be a valid principal role when provided.");
  }
  if (goal.constraints !== undefined && !Array.isArray(goal.constraints)) {
    throw new Error("Goal input constraints must be an array when provided.");
  }
  if (Array.isArray(goal.constraints) && goal.constraints.some((constraint) => typeof constraint !== "string")) {
    throw new Error("Goal input constraints must contain only strings.");
  }
  if (goal.payload !== undefined && (typeof goal.payload !== "object" || goal.payload === null || Array.isArray(goal.payload))) {
    throw new Error("Goal input payload must be an object when provided.");
  }
}

export function assertWorkflowPlan(value: unknown): asserts value is WorkflowPlan {
  if (!value || typeof value !== "object" || !Array.isArray((value as WorkflowPlan).steps)) {
    throw new Error("Workflow plan is invalid.");
  }
}

export function assertRouteDecision(value: unknown): asserts value is RouteDecision {
  if (!value || typeof value !== "object") {
    throw new Error("Route decision is invalid.");
  }
}

export function assertLeadRecoveryInput(value: unknown): asserts value is LeadRecoveryInput {
  if (!value || typeof value !== "object") {
    throw new Error("Lead recovery input must be an object.");
  }

  const candidate = value as Partial<LeadRecoveryInput>;
  if (!candidate.goal || !candidate.event || !candidate.brand) {
    throw new Error("Lead recovery input must include goal, event, and brand.");
  }
}

export function assertJobRecord(value: unknown): asserts value is JobRecord {
  if (!value || typeof value !== "object" || typeof (value as JobRecord).jobId !== "string") {
    throw new Error("Job record is invalid.");
  }
}

export function assertMemoryEntry(value: unknown): asserts value is MemoryEntry {
  if (!value || typeof value !== "object") {
    throw new Error("Memory entry is invalid.");
  }

  const entry = value as Partial<MemoryEntry>;
  if (typeof entry.id !== "string" || !entry.id.trim()) {
    throw new Error("Memory entry requires id.");
  }
  if (typeof entry.tenantId !== "string" || !entry.tenantId.trim()) {
    throw new Error("Memory entry requires tenantId.");
  }
  if (typeof entry.product !== "string" || !entry.product.trim()) {
    throw new Error("Memory entry requires product.");
  }
  if (typeof entry.category !== "string" || !entry.category.trim()) {
    throw new Error("Memory entry requires category.");
  }
  if (typeof entry.key !== "string" || !entry.key.trim()) {
    throw new Error("Memory entry requires key.");
  }
  if (typeof entry.confidence !== "number" || !Number.isFinite(entry.confidence)) {
    throw new Error("Memory entry requires confidence.");
  }
  if (typeof entry.editable !== "boolean") {
    throw new Error("Memory entry requires editable to be a boolean.");
  }
  if (entry.auditTrail !== undefined) {
    if (!Array.isArray(entry.auditTrail)) {
      throw new Error("Memory entry auditTrail must be an array when provided.");
    }
    for (const audit of entry.auditTrail) {
      assertMemoryAuditEntry(audit);
    }
  }
}

export function assertWorkflowResult(value: unknown): asserts value is WorkflowResult {
  if (!value || typeof value !== "object") {
    throw new Error("Workflow result is invalid.");
  }

  const result = value as Partial<WorkflowResult>;
  if (result.status !== "succeeded" && result.status !== "failed" && result.status !== "partial") {
    throw new Error("Workflow result status is invalid.");
  }
  if (typeof result.summary !== "string" || !result.summary.trim()) {
    throw new Error("Workflow result requires a summary.");
  }
  if (!Array.isArray(result.actionsTaken) || result.actionsTaken.some((item) => typeof item !== "string")) {
    throw new Error("Workflow result actionsTaken must be a string array.");
  }
  if (!result.data || typeof result.data !== "object" || Array.isArray(result.data)) {
    throw new Error("Workflow result data must be an object.");
  }
}

export interface MemoryEditRequest {
  readonly tenantId: string;
  readonly actorRole: PrincipalRole;
  readonly actorId?: string;
  readonly key?: string;
  readonly category?: string;
  readonly value?: string | Record<string, unknown>;
  readonly confidence?: number;
  readonly editable?: boolean;
  readonly note?: string;
  readonly sourceJobId?: string;
  readonly sourceStepId?: string;
}

export function assertMemoryEditRequest(value: unknown): asserts value is MemoryEditRequest {
  if (!value || typeof value !== "object") {
    throw new Error("Memory edit request must be an object.");
  }

  const request = value as Partial<MemoryEditRequest>;
  if (typeof request.tenantId !== "string" || !request.tenantId.trim()) {
    throw new Error("Memory edit request requires tenantId.");
  }
  if (typeof request.actorRole !== "string" || !PRINCIPAL_ROLES.has(request.actorRole as PrincipalRole)) {
    throw new Error("Memory edit request requires a valid actorRole.");
  }
  if (request.key !== undefined && (typeof request.key !== "string" || !request.key.trim())) {
    throw new Error("Memory edit request key must be a non-empty string when provided.");
  }
  if (request.category !== undefined && (typeof request.category !== "string" || !request.category.trim())) {
    throw new Error("Memory edit request category must be a non-empty string when provided.");
  }
  if (request.value !== undefined && typeof request.value !== "object" && typeof request.value !== "string") {
    throw new Error("Memory edit request value must be a string or object when provided.");
  }
  if (request.confidence !== undefined && (typeof request.confidence !== "number" || !Number.isFinite(request.confidence))) {
    throw new Error("Memory edit request confidence must be a number when provided.");
  }
  if (request.editable !== undefined && typeof request.editable !== "boolean") {
    throw new Error("Memory edit request editable must be a boolean when provided.");
  }
  if (request.note !== undefined && (typeof request.note !== "string" || !request.note.trim())) {
    throw new Error("Memory edit request note must be a non-empty string when provided.");
  }
  if (request.sourceJobId !== undefined && (typeof request.sourceJobId !== "string" || !request.sourceJobId.trim())) {
    throw new Error("Memory edit request sourceJobId must be a non-empty string when provided.");
  }
  if (request.sourceStepId !== undefined && (typeof request.sourceStepId !== "string" || !request.sourceStepId.trim())) {
    throw new Error("Memory edit request sourceStepId must be a non-empty string when provided.");
  }
}

function assertMemoryAuditEntry(value: unknown): asserts value is MemoryAuditEntry {
  if (!value || typeof value !== "object") {
    throw new Error("Memory audit entry is invalid.");
  }

  const audit = value as Partial<MemoryAuditEntry>;
  if (typeof audit.at !== "string" || !audit.at.trim()) {
    throw new Error("Memory audit entry requires at.");
  }
  if (audit.action !== "create" && audit.action !== "update" && audit.action !== "edit" && audit.action !== "archive" && audit.action !== "restore") {
    throw new Error("Memory audit entry action is invalid.");
  }
  if (typeof audit.actorRole !== "string" || !PRINCIPAL_ROLES.has(audit.actorRole as PrincipalRole)) {
    throw new Error("Memory audit entry actorRole is invalid.");
  }
}
