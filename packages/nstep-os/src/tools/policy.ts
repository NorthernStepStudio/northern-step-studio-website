import { randomUUID } from "node:crypto";
import type { Stage3ToolGateResult, Stage3ToolPermission, Stage3ToolPolicy, Stage3ToolScope } from "../core/stage3-models.js";
import type { GoalMode, PrincipalRole, RiskLevel } from "../core/types.js";
import type { Stage2AgentId } from "../core/stage2-models.js";

export class ToolPermissionError extends Error {
  readonly tool: string;
  readonly requiresApproval: boolean;

  constructor(tool: string, message: string, requiresApproval: boolean) {
    super(message);
    this.name = "ToolPermissionError";
    this.tool = tool;
    this.requiresApproval = requiresApproval;
  }
}

export function createDefaultStage3RetryPolicy(maxAttempts: number): Stage3ToolPolicy["retry"] {
  return {
    maxAttempts: Math.max(1, maxAttempts),
    backoffMs: 150,
    jitterMs: 50,
  };
}

export function createStage3ToolPolicy(
  permissions: readonly Stage3ToolPermission[],
  maxAttempts: number,
  allowUnscopedAccess = true,
): Stage3ToolPolicy {
  return {
    retry: createDefaultStage3RetryPolicy(maxAttempts),
    permissions: [...permissions],
    allowUnscopedAccess,
  };
}

export function evaluateStage3ToolAccess(
  permission: Stage3ToolPermission,
  scope: Stage3ToolScope | undefined,
): Stage3ToolGateResult {
  if (!scope) {
    return {
      allowed: true,
      reason: "Tool invocation is unscoped and allowed for backward-compatible runtime access.",
      requiresApproval: false,
    };
  }

  if (scope.agentId && permission.permittedAgents.length > 0 && !permission.permittedAgents.includes(scope.agentId)) {
    return {
      allowed: false,
      blockedBy: permission.tool,
      reason: `Agent ${scope.agentId} is not permitted to use ${permission.tool}.`,
      requiresApproval: false,
    };
  }

  const role = scope.role || "system";
  const approvalRequired = permission.allowExternalActions && permission.requiresApprovalForExternalActions;
  const isExternalRisk = isHighRisk(scope.mode, scope.riskLevel) && permission.allowExternalActions;

  if (isRestrictedRole(role) && permission.allowExternalActions) {
    return {
      allowed: false,
      blockedBy: permission.tool,
      reason: `Role ${role} cannot execute external ${permission.tool} actions without operator approval.`,
      requiresApproval: true,
    };
  }

  if (approvalRequired && scope.approvalStatus !== "approved" && scope.approvalStatus !== "not_required") {
    return {
      allowed: false,
      blockedBy: permission.tool,
      reason: `${permission.tool} requires approval before external execution.`,
      requiresApproval: true,
    };
  }

  if (isExternalRisk && scope.externalAllowed === false) {
    return {
      allowed: false,
      blockedBy: permission.tool,
      reason: `${permission.tool} is blocked by the current scope restrictions.`,
      requiresApproval: true,
    };
  }

  return {
    allowed: true,
    reason: scope.agentId ? `Tool access granted for ${scope.agentId}.` : `Tool access granted for ${role}.`,
    requiresApproval: false,
  };
}

export function createToolInvocationId(): string {
  return `tool_${randomUUID()}`;
}

function isHighRisk(mode: GoalMode | undefined, riskLevel: RiskLevel | undefined): boolean {
  return mode === "assist" && (riskLevel === "high" || riskLevel === "critical");
}

function isRestrictedRole(role: PrincipalRole): boolean {
  return role === "viewer" || role === "analyst";
}

export function createDefaultToolScope(overrides: Stage3ToolScope = {}): Stage3ToolScope {
  return {
    ...overrides,
  };
}

export function shouldRetryToolError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return true;
  }

  const code = (error as { readonly code?: unknown }).code;
  if (typeof code === "string" && ["ETIMEDOUT", "ECONNRESET", "ENOTFOUND", "EAI_AGAIN", "ECONNREFUSED"].includes(code)) {
    return true;
  }

  const status = (error as { readonly status?: unknown }).status;
  if (typeof status === "number" && status >= 500) {
    return true;
  }

  return false;
}
