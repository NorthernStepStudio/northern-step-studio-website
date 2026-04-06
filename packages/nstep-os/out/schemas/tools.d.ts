export declare const stage3ToolScopeSchema: {
    readonly type: "object";
    readonly properties: {
        readonly agentId: {
            readonly type: "string";
        };
        readonly jobId: {
            readonly type: "string";
        };
        readonly stepId: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly role: {
            readonly type: "string";
            readonly enum: readonly ["viewer", "analyst", "operator", "admin", "system"];
        };
        readonly product: {
            readonly type: "string";
        };
        readonly mode: {
            readonly type: "string";
            readonly enum: readonly ["assist", "autonomous"];
        };
        readonly approvalStatus: {
            readonly type: "string";
            readonly enum: readonly ["not_required", "pending", "approved", "rejected"];
        };
        readonly riskLevel: {
            readonly type: "string";
            readonly enum: readonly ["low", "medium", "high", "critical"];
        };
        readonly purpose: {
            readonly type: "string";
        };
        readonly externalAllowed: {
            readonly type: "boolean";
        };
    };
};
export declare const stage3ToolPermissionSchema: {
    readonly type: "object";
    readonly required: readonly ["tool", "actions", "allowExternalActions", "requiresApprovalForExternalActions", "permittedAgents", "description"];
    readonly properties: {
        readonly tool: {
            readonly type: "string";
        };
        readonly actions: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly allowExternalActions: {
            readonly type: "boolean";
        };
        readonly requiresApprovalForExternalActions: {
            readonly type: "boolean";
        };
        readonly permittedAgents: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly description: {
            readonly type: "string";
        };
    };
};
export declare const stage3ToolDescriptorSchema: {
    readonly type: "object";
    readonly required: readonly ["tool", "provider", "actions", "canRetry", "scoped", "permission"];
    readonly properties: {
        readonly tool: {
            readonly type: "string";
        };
        readonly provider: {
            readonly type: "string";
            readonly enum: readonly ["mock", "playwright", "twilio", "webhook", "file", "postgres", "supabase", "memory", "generic-http"];
        };
        readonly actions: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly canRetry: {
            readonly type: "boolean";
        };
        readonly scoped: {
            readonly type: "boolean";
        };
        readonly permission: {
            readonly type: "object";
            readonly required: readonly ["tool", "actions", "allowExternalActions", "requiresApprovalForExternalActions", "permittedAgents", "description"];
            readonly properties: {
                readonly tool: {
                    readonly type: "string";
                };
                readonly actions: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly allowExternalActions: {
                    readonly type: "boolean";
                };
                readonly requiresApprovalForExternalActions: {
                    readonly type: "boolean";
                };
                readonly permittedAgents: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly description: {
                    readonly type: "string";
                };
            };
        };
    };
};
export declare const stage3ToolInvocationSchema: {
    readonly type: "object";
    readonly required: readonly ["id", "at", "tool", "action", "attempt", "status", "message"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
        };
        readonly at: {
            readonly type: "string";
        };
        readonly tool: {
            readonly type: "string";
        };
        readonly action: {
            readonly type: "string";
        };
        readonly attempt: {
            readonly type: "number";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["started", "retry", "succeeded", "failed", "blocked"];
        };
        readonly scope: {
            readonly type: "object";
            readonly properties: {
                readonly agentId: {
                    readonly type: "string";
                };
                readonly jobId: {
                    readonly type: "string";
                };
                readonly stepId: {
                    readonly type: "string";
                };
                readonly tenantId: {
                    readonly type: "string";
                };
                readonly role: {
                    readonly type: "string";
                    readonly enum: readonly ["viewer", "analyst", "operator", "admin", "system"];
                };
                readonly product: {
                    readonly type: "string";
                };
                readonly mode: {
                    readonly type: "string";
                    readonly enum: readonly ["assist", "autonomous"];
                };
                readonly approvalStatus: {
                    readonly type: "string";
                    readonly enum: readonly ["not_required", "pending", "approved", "rejected"];
                };
                readonly riskLevel: {
                    readonly type: "string";
                    readonly enum: readonly ["low", "medium", "high", "critical"];
                };
                readonly purpose: {
                    readonly type: "string";
                };
                readonly externalAllowed: {
                    readonly type: "boolean";
                };
            };
        };
        readonly message: {
            readonly type: "string";
        };
        readonly data: {
            readonly type: "object";
        };
    };
};
export declare const stage3RetryPolicySchema: {
    readonly type: "object";
    readonly required: readonly ["maxAttempts", "backoffMs", "jitterMs"];
    readonly properties: {
        readonly maxAttempts: {
            readonly type: "number";
        };
        readonly backoffMs: {
            readonly type: "number";
        };
        readonly jitterMs: {
            readonly type: "number";
        };
    };
};
export declare const stage3ToolPolicySchema: {
    readonly type: "object";
    readonly required: readonly ["retry", "permissions", "allowUnscopedAccess"];
    readonly properties: {
        readonly retry: {
            readonly type: "object";
            readonly required: readonly ["maxAttempts", "backoffMs", "jitterMs"];
            readonly properties: {
                readonly maxAttempts: {
                    readonly type: "number";
                };
                readonly backoffMs: {
                    readonly type: "number";
                };
                readonly jitterMs: {
                    readonly type: "number";
                };
            };
        };
        readonly permissions: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["tool", "actions", "allowExternalActions", "requiresApprovalForExternalActions", "permittedAgents", "description"];
                readonly properties: {
                    readonly tool: {
                        readonly type: "string";
                    };
                    readonly actions: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly allowExternalActions: {
                        readonly type: "boolean";
                    };
                    readonly requiresApprovalForExternalActions: {
                        readonly type: "boolean";
                    };
                    readonly permittedAgents: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly description: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly allowUnscopedAccess: {
            readonly type: "boolean";
        };
    };
};
export declare const stage3ToolOutcomeSchema: {
    readonly type: "object";
    readonly required: readonly ["tool", "action", "provider", "status", "attempts", "retryable", "invocations"];
    readonly properties: {
        readonly tool: {
            readonly type: "string";
        };
        readonly action: {
            readonly type: "string";
        };
        readonly provider: {
            readonly type: "string";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["succeeded", "failed", "blocked"];
        };
        readonly attempts: {
            readonly type: "number";
        };
        readonly value: {
            readonly type: "object";
        };
        readonly error: {
            readonly type: "string";
        };
        readonly retryable: {
            readonly type: "boolean";
        };
        readonly invocations: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["id", "at", "tool", "action", "attempt", "status", "message"];
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                    };
                    readonly at: {
                        readonly type: "string";
                    };
                    readonly tool: {
                        readonly type: "string";
                    };
                    readonly action: {
                        readonly type: "string";
                    };
                    readonly attempt: {
                        readonly type: "number";
                    };
                    readonly status: {
                        readonly type: "string";
                        readonly enum: readonly ["started", "retry", "succeeded", "failed", "blocked"];
                    };
                    readonly scope: {
                        readonly type: "object";
                        readonly properties: {
                            readonly agentId: {
                                readonly type: "string";
                            };
                            readonly jobId: {
                                readonly type: "string";
                            };
                            readonly stepId: {
                                readonly type: "string";
                            };
                            readonly tenantId: {
                                readonly type: "string";
                            };
                            readonly role: {
                                readonly type: "string";
                                readonly enum: readonly ["viewer", "analyst", "operator", "admin", "system"];
                            };
                            readonly product: {
                                readonly type: "string";
                            };
                            readonly mode: {
                                readonly type: "string";
                                readonly enum: readonly ["assist", "autonomous"];
                            };
                            readonly approvalStatus: {
                                readonly type: "string";
                                readonly enum: readonly ["not_required", "pending", "approved", "rejected"];
                            };
                            readonly riskLevel: {
                                readonly type: "string";
                                readonly enum: readonly ["low", "medium", "high", "critical"];
                            };
                            readonly purpose: {
                                readonly type: "string";
                            };
                            readonly externalAllowed: {
                                readonly type: "boolean";
                            };
                        };
                    };
                    readonly message: {
                        readonly type: "string";
                    };
                    readonly data: {
                        readonly type: "object";
                    };
                };
            };
        };
    };
};
export declare const stage3DatabaseQuerySchema: {
    readonly type: "object";
    readonly required: readonly ["sql"];
    readonly properties: {
        readonly sql: {
            readonly type: "string";
        };
        readonly params: {
            readonly type: "array";
        };
    };
};
export declare const stage3DatabaseQueryResultSchema: {
    readonly type: "object";
    readonly required: readonly ["rows", "rowCount"];
    readonly properties: {
        readonly rows: {
            readonly type: "array";
        };
        readonly rowCount: {
            readonly type: "number";
        };
        readonly command: {
            readonly type: "string";
        };
    };
};
export declare const stage3ToolRuntimeSnapshotSchema: {
    readonly type: "object";
    readonly required: readonly ["policy", "descriptors", "invocations"];
    readonly properties: {
        readonly policy: {
            readonly type: "object";
            readonly required: readonly ["retry", "permissions", "allowUnscopedAccess"];
            readonly properties: {
                readonly retry: {
                    readonly type: "object";
                    readonly required: readonly ["maxAttempts", "backoffMs", "jitterMs"];
                    readonly properties: {
                        readonly maxAttempts: {
                            readonly type: "number";
                        };
                        readonly backoffMs: {
                            readonly type: "number";
                        };
                        readonly jitterMs: {
                            readonly type: "number";
                        };
                    };
                };
                readonly permissions: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["tool", "actions", "allowExternalActions", "requiresApprovalForExternalActions", "permittedAgents", "description"];
                        readonly properties: {
                            readonly tool: {
                                readonly type: "string";
                            };
                            readonly actions: {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                };
                            };
                            readonly allowExternalActions: {
                                readonly type: "boolean";
                            };
                            readonly requiresApprovalForExternalActions: {
                                readonly type: "boolean";
                            };
                            readonly permittedAgents: {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                };
                            };
                            readonly description: {
                                readonly type: "string";
                            };
                        };
                    };
                };
                readonly allowUnscopedAccess: {
                    readonly type: "boolean";
                };
            };
        };
        readonly descriptors: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["tool", "provider", "actions", "canRetry", "scoped", "permission"];
                readonly properties: {
                    readonly tool: {
                        readonly type: "string";
                    };
                    readonly provider: {
                        readonly type: "string";
                        readonly enum: readonly ["mock", "playwright", "twilio", "webhook", "file", "postgres", "supabase", "memory", "generic-http"];
                    };
                    readonly actions: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly canRetry: {
                        readonly type: "boolean";
                    };
                    readonly scoped: {
                        readonly type: "boolean";
                    };
                    readonly permission: {
                        readonly type: "object";
                        readonly required: readonly ["tool", "actions", "allowExternalActions", "requiresApprovalForExternalActions", "permittedAgents", "description"];
                        readonly properties: {
                            readonly tool: {
                                readonly type: "string";
                            };
                            readonly actions: {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                };
                            };
                            readonly allowExternalActions: {
                                readonly type: "boolean";
                            };
                            readonly requiresApprovalForExternalActions: {
                                readonly type: "boolean";
                            };
                            readonly permittedAgents: {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                };
                            };
                            readonly description: {
                                readonly type: "string";
                            };
                        };
                    };
                };
            };
        };
        readonly invocations: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["id", "at", "tool", "action", "attempt", "status", "message"];
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                    };
                    readonly at: {
                        readonly type: "string";
                    };
                    readonly tool: {
                        readonly type: "string";
                    };
                    readonly action: {
                        readonly type: "string";
                    };
                    readonly attempt: {
                        readonly type: "number";
                    };
                    readonly status: {
                        readonly type: "string";
                        readonly enum: readonly ["started", "retry", "succeeded", "failed", "blocked"];
                    };
                    readonly scope: {
                        readonly type: "object";
                        readonly properties: {
                            readonly agentId: {
                                readonly type: "string";
                            };
                            readonly jobId: {
                                readonly type: "string";
                            };
                            readonly stepId: {
                                readonly type: "string";
                            };
                            readonly tenantId: {
                                readonly type: "string";
                            };
                            readonly role: {
                                readonly type: "string";
                                readonly enum: readonly ["viewer", "analyst", "operator", "admin", "system"];
                            };
                            readonly product: {
                                readonly type: "string";
                            };
                            readonly mode: {
                                readonly type: "string";
                                readonly enum: readonly ["assist", "autonomous"];
                            };
                            readonly approvalStatus: {
                                readonly type: "string";
                                readonly enum: readonly ["not_required", "pending", "approved", "rejected"];
                            };
                            readonly riskLevel: {
                                readonly type: "string";
                                readonly enum: readonly ["low", "medium", "high", "critical"];
                            };
                            readonly purpose: {
                                readonly type: "string";
                            };
                            readonly externalAllowed: {
                                readonly type: "boolean";
                            };
                        };
                    };
                    readonly message: {
                        readonly type: "string";
                    };
                    readonly data: {
                        readonly type: "object";
                    };
                };
            };
        };
    };
};
