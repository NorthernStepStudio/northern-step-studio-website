export const stage3ToolScopeSchema = {
    type: "object",
    properties: {
        agentId: { type: "string" },
        jobId: { type: "string" },
        stepId: { type: "string" },
        tenantId: { type: "string" },
        role: { type: "string", enum: ["viewer", "analyst", "operator", "admin", "system"] },
        product: { type: "string" },
        mode: { type: "string", enum: ["assist", "autonomous"] },
        approvalStatus: { type: "string", enum: ["not_required", "pending", "approved", "rejected"] },
        riskLevel: { type: "string", enum: ["low", "medium", "high", "critical"] },
        purpose: { type: "string" },
        externalAllowed: { type: "boolean" },
    },
};
export const stage3ToolPermissionSchema = {
    type: "object",
    required: ["tool", "actions", "allowExternalActions", "requiresApprovalForExternalActions", "permittedAgents", "description"],
    properties: {
        tool: { type: "string" },
        actions: { type: "array", items: { type: "string" } },
        allowExternalActions: { type: "boolean" },
        requiresApprovalForExternalActions: { type: "boolean" },
        permittedAgents: { type: "array", items: { type: "string" } },
        description: { type: "string" },
    },
};
export const stage3ToolDescriptorSchema = {
    type: "object",
    required: ["tool", "provider", "actions", "canRetry", "scoped", "permission"],
    properties: {
        tool: { type: "string" },
        provider: { type: "string", enum: ["mock", "playwright", "twilio", "webhook", "file", "postgres", "supabase", "memory", "generic-http"] },
        actions: { type: "array", items: { type: "string" } },
        canRetry: { type: "boolean" },
        scoped: { type: "boolean" },
        permission: stage3ToolPermissionSchema,
    },
};
export const stage3ToolInvocationSchema = {
    type: "object",
    required: ["id", "at", "tool", "action", "attempt", "status", "message"],
    properties: {
        id: { type: "string" },
        at: { type: "string" },
        tool: { type: "string" },
        action: { type: "string" },
        attempt: { type: "number" },
        status: { type: "string", enum: ["started", "retry", "succeeded", "failed", "blocked"] },
        scope: stage3ToolScopeSchema,
        message: { type: "string" },
        data: { type: "object" },
    },
};
export const stage3RetryPolicySchema = {
    type: "object",
    required: ["maxAttempts", "backoffMs", "jitterMs"],
    properties: {
        maxAttempts: { type: "number" },
        backoffMs: { type: "number" },
        jitterMs: { type: "number" },
    },
};
export const stage3ToolPolicySchema = {
    type: "object",
    required: ["retry", "permissions", "allowUnscopedAccess"],
    properties: {
        retry: stage3RetryPolicySchema,
        permissions: { type: "array", items: stage3ToolPermissionSchema },
        allowUnscopedAccess: { type: "boolean" },
    },
};
export const stage3ToolOutcomeSchema = {
    type: "object",
    required: ["tool", "action", "provider", "status", "attempts", "retryable", "invocations"],
    properties: {
        tool: { type: "string" },
        action: { type: "string" },
        provider: { type: "string" },
        status: { type: "string", enum: ["succeeded", "failed", "blocked"] },
        attempts: { type: "number" },
        value: { type: "object" },
        error: { type: "string" },
        retryable: { type: "boolean" },
        invocations: { type: "array", items: stage3ToolInvocationSchema },
    },
};
export const stage3DatabaseQuerySchema = {
    type: "object",
    required: ["sql"],
    properties: {
        sql: { type: "string" },
        params: { type: "array" },
    },
};
export const stage3DatabaseQueryResultSchema = {
    type: "object",
    required: ["rows", "rowCount"],
    properties: {
        rows: { type: "array" },
        rowCount: { type: "number" },
        command: { type: "string" },
    },
};
export const stage3ToolRuntimeSnapshotSchema = {
    type: "object",
    required: ["policy", "descriptors", "invocations"],
    properties: {
        policy: stage3ToolPolicySchema,
        descriptors: { type: "array", items: stage3ToolDescriptorSchema },
        invocations: { type: "array", items: stage3ToolInvocationSchema },
    },
};
//# sourceMappingURL=tools.js.map