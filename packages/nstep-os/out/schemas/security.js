export const principalRoleSchema = {
    type: "string",
    enum: ["viewer", "analyst", "operator", "admin", "system"],
};
export const approvalPolicySchema = {
    type: "object",
    required: ["minimumRole", "approvalThreshold", "externalActionsRequireApproval", "systemBypassAllowed"],
    properties: {
        minimumRole: principalRoleSchema,
        approvalThreshold: { type: "string", enum: ["low", "medium", "high", "critical"] },
        externalActionsRequireApproval: { type: "boolean" },
        systemBypassAllowed: { type: "boolean" },
    },
};
export const accessDecisionSchema = {
    type: "object",
    required: ["allowed", "requiresApproval", "reason"],
    properties: {
        allowed: { type: "boolean" },
        requiresApproval: { type: "boolean" },
        reason: { type: "string" },
        blockedBy: { type: "string" },
        requiredRole: principalRoleSchema,
    },
};
export const memoryAuditEntrySchema = {
    type: "object",
    required: ["at", "action", "actorRole"],
    properties: {
        at: { type: "string" },
        action: { type: "string", enum: ["create", "update", "edit", "archive", "restore"] },
        actorRole: principalRoleSchema,
        actorId: { type: "string" },
        note: { type: "string" },
        sourceJobId: { type: "string" },
        sourceStepId: { type: "string" },
        diff: { type: "object" },
    },
};
export const jobEscalationSchema = {
    type: "object",
    required: ["escalationId", "jobId", "tenantId", "product", "workflow", "severity", "status", "reason", "source", "createdAt", "updatedAt", "metadata"],
    properties: {
        escalationId: { type: "string" },
        jobId: { type: "string" },
        tenantId: { type: "string" },
        product: { type: "string" },
        workflow: { type: "string" },
        severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
        status: { type: "string", enum: ["open", "acknowledged", "resolved"] },
        reason: { type: "string" },
        source: { type: "string", enum: ["approval", "verification", "retry-exhausted", "policy", "tenant-isolation", "memory-edit"] },
        ownerRole: principalRoleSchema,
        createdAt: { type: "string" },
        updatedAt: { type: "string" },
        metadata: { type: "object" },
    },
};
export const memoryEditRequestSchema = {
    type: "object",
    required: ["tenantId", "actorRole"],
    properties: {
        tenantId: { type: "string" },
        actorRole: principalRoleSchema,
        actorId: { type: "string" },
        key: { type: "string" },
        category: { type: "string" },
        value: { oneOf: [{ type: "string" }, { type: "object" }] },
        confidence: { type: "number" },
        editable: { type: "boolean" },
        note: { type: "string" },
        sourceJobId: { type: "string" },
        sourceStepId: { type: "string" },
    },
};
//# sourceMappingURL=security.js.map