import { randomUUID } from "node:crypto";
export class ToolPermissionError extends Error {
    tool;
    requiresApproval;
    constructor(tool, message, requiresApproval) {
        super(message);
        this.name = "ToolPermissionError";
        this.tool = tool;
        this.requiresApproval = requiresApproval;
    }
}
export function createDefaultStage3RetryPolicy(maxAttempts) {
    return {
        maxAttempts: Math.max(1, maxAttempts),
        backoffMs: 150,
        jitterMs: 50,
    };
}
export function createStage3ToolPolicy(permissions, maxAttempts, allowUnscopedAccess = true) {
    return {
        retry: createDefaultStage3RetryPolicy(maxAttempts),
        permissions: [...permissions],
        allowUnscopedAccess,
    };
}
export function evaluateStage3ToolAccess(permission, scope) {
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
export function createToolInvocationId() {
    return `tool_${randomUUID()}`;
}
function isHighRisk(mode, riskLevel) {
    return mode === "assist" && (riskLevel === "high" || riskLevel === "critical");
}
function isRestrictedRole(role) {
    return role === "viewer" || role === "analyst";
}
export function createDefaultToolScope(overrides = {}) {
    return {
        ...overrides,
    };
}
export function shouldRetryToolError(error) {
    if (!error || typeof error !== "object") {
        return true;
    }
    const code = error.code;
    if (typeof code === "string" && ["ETIMEDOUT", "ECONNRESET", "ENOTFOUND", "EAI_AGAIN", "ECONNREFUSED"].includes(code)) {
        return true;
    }
    const status = error.status;
    if (typeof status === "number" && status >= 500) {
        return true;
    }
    return false;
}
//# sourceMappingURL=policy.js.map