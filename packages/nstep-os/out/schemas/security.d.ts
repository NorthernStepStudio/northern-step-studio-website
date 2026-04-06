export declare const principalRoleSchema: {
    readonly type: "string";
    readonly enum: readonly ["viewer", "analyst", "operator", "admin", "system"];
};
export declare const approvalPolicySchema: {
    readonly type: "object";
    readonly required: readonly ["minimumRole", "approvalThreshold", "externalActionsRequireApproval", "systemBypassAllowed"];
    readonly properties: {
        readonly minimumRole: {
            readonly type: "string";
            readonly enum: readonly ["viewer", "analyst", "operator", "admin", "system"];
        };
        readonly approvalThreshold: {
            readonly type: "string";
            readonly enum: readonly ["low", "medium", "high", "critical"];
        };
        readonly externalActionsRequireApproval: {
            readonly type: "boolean";
        };
        readonly systemBypassAllowed: {
            readonly type: "boolean";
        };
    };
};
export declare const accessDecisionSchema: {
    readonly type: "object";
    readonly required: readonly ["allowed", "requiresApproval", "reason"];
    readonly properties: {
        readonly allowed: {
            readonly type: "boolean";
        };
        readonly requiresApproval: {
            readonly type: "boolean";
        };
        readonly reason: {
            readonly type: "string";
        };
        readonly blockedBy: {
            readonly type: "string";
        };
        readonly requiredRole: {
            readonly type: "string";
            readonly enum: readonly ["viewer", "analyst", "operator", "admin", "system"];
        };
    };
};
export declare const memoryAuditEntrySchema: {
    readonly type: "object";
    readonly required: readonly ["at", "action", "actorRole"];
    readonly properties: {
        readonly at: {
            readonly type: "string";
        };
        readonly action: {
            readonly type: "string";
            readonly enum: readonly ["create", "update", "edit", "archive", "restore"];
        };
        readonly actorRole: {
            readonly type: "string";
            readonly enum: readonly ["viewer", "analyst", "operator", "admin", "system"];
        };
        readonly actorId: {
            readonly type: "string";
        };
        readonly note: {
            readonly type: "string";
        };
        readonly sourceJobId: {
            readonly type: "string";
        };
        readonly sourceStepId: {
            readonly type: "string";
        };
        readonly diff: {
            readonly type: "object";
        };
    };
};
export declare const jobEscalationSchema: {
    readonly type: "object";
    readonly required: readonly ["escalationId", "jobId", "tenantId", "product", "workflow", "severity", "status", "reason", "source", "createdAt", "updatedAt", "metadata"];
    readonly properties: {
        readonly escalationId: {
            readonly type: "string";
        };
        readonly jobId: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly product: {
            readonly type: "string";
        };
        readonly workflow: {
            readonly type: "string";
        };
        readonly severity: {
            readonly type: "string";
            readonly enum: readonly ["low", "medium", "high", "critical"];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["open", "acknowledged", "resolved"];
        };
        readonly reason: {
            readonly type: "string";
        };
        readonly source: {
            readonly type: "string";
            readonly enum: readonly ["approval", "verification", "retry-exhausted", "policy", "tenant-isolation", "memory-edit"];
        };
        readonly ownerRole: {
            readonly type: "string";
            readonly enum: readonly ["viewer", "analyst", "operator", "admin", "system"];
        };
        readonly createdAt: {
            readonly type: "string";
        };
        readonly updatedAt: {
            readonly type: "string";
        };
        readonly metadata: {
            readonly type: "object";
        };
    };
};
export declare const memoryEditRequestSchema: {
    readonly type: "object";
    readonly required: readonly ["tenantId", "actorRole"];
    readonly properties: {
        readonly tenantId: {
            readonly type: "string";
        };
        readonly actorRole: {
            readonly type: "string";
            readonly enum: readonly ["viewer", "analyst", "operator", "admin", "system"];
        };
        readonly actorId: {
            readonly type: "string";
        };
        readonly key: {
            readonly type: "string";
        };
        readonly category: {
            readonly type: "string";
        };
        readonly value: {
            readonly oneOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "object";
            }];
        };
        readonly confidence: {
            readonly type: "number";
        };
        readonly editable: {
            readonly type: "boolean";
        };
        readonly note: {
            readonly type: "string";
        };
        readonly sourceJobId: {
            readonly type: "string";
        };
        readonly sourceStepId: {
            readonly type: "string";
        };
    };
};
