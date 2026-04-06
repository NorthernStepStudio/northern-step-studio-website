export declare const dashboardQuerySchema: {
    readonly type: "object";
    readonly properties: {
        readonly tenantId: {
            readonly type: "string";
        };
        readonly product: {
            readonly type: "string";
        };
        readonly workflow: {
            readonly type: "string";
        };
        readonly jobId: {
            readonly type: "string";
        };
        readonly caseId: {
            readonly type: "string";
        };
        readonly status: {
            readonly oneOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            }];
        };
        readonly approvalStatus: {
            readonly oneOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            }];
        };
        readonly page: {
            readonly type: "number";
        };
        readonly pageSize: {
            readonly type: "number";
        };
        readonly search: {
            readonly type: "string";
        };
        readonly sortBy: {
            readonly type: "string";
            readonly enum: readonly ["createdAt", "updatedAt", "status", "product", "priority"];
        };
        readonly sortDirection: {
            readonly type: "string";
            readonly enum: readonly ["asc", "desc"];
        };
        readonly from: {
            readonly type: "string";
        };
        readonly to: {
            readonly type: "string";
        };
        readonly lane: {
            readonly type: "string";
            readonly enum: readonly ["internal", "external", "mixed"];
        };
    };
};
export declare const dashboardEnvelopeSchema: {
    readonly type: "object";
    readonly required: readonly ["kind", "version", "generatedAt", "filters"];
    readonly properties: {
        readonly kind: {
            readonly type: "string";
        };
        readonly version: {
            readonly type: "string";
            readonly enum: readonly ["stage-5"];
        };
        readonly generatedAt: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly filters: {
            readonly type: "object";
            readonly properties: {
                readonly tenantId: {
                    readonly type: "string";
                };
                readonly product: {
                    readonly type: "string";
                };
                readonly workflow: {
                    readonly type: "string";
                };
                readonly jobId: {
                    readonly type: "string";
                };
                readonly caseId: {
                    readonly type: "string";
                };
                readonly status: {
                    readonly oneOf: readonly [{
                        readonly type: "string";
                    }, {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    }];
                };
                readonly approvalStatus: {
                    readonly oneOf: readonly [{
                        readonly type: "string";
                    }, {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    }];
                };
                readonly page: {
                    readonly type: "number";
                };
                readonly pageSize: {
                    readonly type: "number";
                };
                readonly search: {
                    readonly type: "string";
                };
                readonly sortBy: {
                    readonly type: "string";
                    readonly enum: readonly ["createdAt", "updatedAt", "status", "product", "priority"];
                };
                readonly sortDirection: {
                    readonly type: "string";
                    readonly enum: readonly ["asc", "desc"];
                };
                readonly from: {
                    readonly type: "string";
                };
                readonly to: {
                    readonly type: "string";
                };
                readonly lane: {
                    readonly type: "string";
                    readonly enum: readonly ["internal", "external", "mixed"];
                };
            };
        };
    };
};
export declare const dashboardPageInfoSchema: {
    readonly type: "object";
    readonly required: readonly ["page", "pageSize", "total", "hasMore"];
    readonly properties: {
        readonly page: {
            readonly type: "number";
        };
        readonly pageSize: {
            readonly type: "number";
        };
        readonly total: {
            readonly type: "number";
        };
        readonly hasMore: {
            readonly type: "boolean";
        };
        readonly nextPage: {
            readonly type: "number";
        };
    };
};
export declare const dashboardMetricSchema: {
    readonly type: "object";
    readonly required: readonly ["label", "value", "tone"];
    readonly properties: {
        readonly label: {
            readonly type: "string";
        };
        readonly value: {
            readonly oneOf: readonly [{
                readonly type: "number";
            }, {
                readonly type: "string";
            }];
        };
        readonly detail: {
            readonly type: "string";
        };
        readonly tone: {
            readonly type: "string";
            readonly enum: readonly ["neutral", "success", "warning", "danger", "accent"];
        };
        readonly trend: {
            readonly type: "object";
            readonly required: readonly ["direction", "value"];
            readonly properties: {
                readonly direction: {
                    readonly type: "string";
                    readonly enum: readonly ["up", "down", "flat"];
                };
                readonly value: {
                    readonly type: "number";
                };
                readonly label: {
                    readonly type: "string";
                };
            };
        };
    };
};
export declare const dashboardAlertSchema: {
    readonly type: "object";
    readonly required: readonly ["id", "level", "title", "message", "createdAt", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
        };
        readonly level: {
            readonly type: "string";
            readonly enum: readonly ["info", "success", "warning", "critical"];
        };
        readonly title: {
            readonly type: "string";
        };
        readonly message: {
            readonly type: "string";
        };
        readonly createdAt: {
            readonly type: "string";
        };
        readonly relatedJobId: {
            readonly type: "string";
        };
        readonly relatedProduct: {
            readonly type: "string";
        };
        readonly actionLabel: {
            readonly type: "string";
        };
        readonly actionHref: {
            readonly type: "string";
        };
        readonly metadata: {
            readonly type: "object";
        };
    };
};
export declare const dashboardActionPreviewSchema: {
    readonly type: "object";
    readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
    readonly properties: {
        readonly title: {
            readonly type: "string";
        };
        readonly body: {
            readonly type: "string";
        };
        readonly tool: {
            readonly type: "string";
        };
        readonly stepId: {
            readonly type: "string";
        };
        readonly stepType: {
            readonly type: "string";
        };
        readonly actionLabel: {
            readonly type: "string";
        };
        readonly data: {
            readonly type: "object";
        };
    };
};
export declare const dashboardRetryViewSchema: {
    readonly type: "object";
    readonly required: readonly ["attempts", "maxAttempts", "retryable", "exhausted"];
    readonly properties: {
        readonly attempts: {
            readonly type: "number";
        };
        readonly maxAttempts: {
            readonly type: "number";
        };
        readonly retryable: {
            readonly type: "boolean";
        };
        readonly exhausted: {
            readonly type: "boolean";
        };
        readonly lastAttemptAt: {
            readonly type: "string";
        };
        readonly lastError: {
            readonly type: "string";
        };
        readonly nextRetryAt: {
            readonly type: "string";
        };
    };
};
export declare const dashboardJobSurfaceSchema: {
    readonly type: "object";
    readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
    readonly properties: {
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
        readonly goal: {
            readonly type: "string";
        };
        readonly priority: {
            readonly type: "string";
        };
        readonly mode: {
            readonly type: "string";
        };
        readonly status: {
            readonly type: "string";
        };
        readonly approvalStatus: {
            readonly type: "string";
        };
        readonly riskLevel: {
            readonly type: "string";
        };
        readonly lane: {
            readonly type: "string";
        };
        readonly createdAt: {
            readonly type: "string";
        };
        readonly updatedAt: {
            readonly type: "string";
        };
        readonly currentStepId: {
            readonly type: "string";
        };
        readonly currentStepTitle: {
            readonly type: "string";
        };
        readonly currentStepType: {
            readonly type: "string";
        };
        readonly currentStepTool: {
            readonly type: "string";
        };
        readonly stepCount: {
            readonly type: "number";
        };
        readonly completedStepCount: {
            readonly type: "number";
        };
        readonly waitingApprovalStepCount: {
            readonly type: "number";
        };
        readonly failedStepCount: {
            readonly type: "number";
        };
        readonly retryableStepCount: {
            readonly type: "number";
        };
        readonly resultSummary: {
            readonly type: "string";
        };
        readonly error: {
            readonly type: "string";
        };
        readonly tags: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
    };
};
export declare const dashboardJobListItemSchema: {
    readonly type: "object";
    readonly allOf: readonly [{
        readonly type: "object";
        readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
        readonly properties: {
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
            readonly goal: {
                readonly type: "string";
            };
            readonly priority: {
                readonly type: "string";
            };
            readonly mode: {
                readonly type: "string";
            };
            readonly status: {
                readonly type: "string";
            };
            readonly approvalStatus: {
                readonly type: "string";
            };
            readonly riskLevel: {
                readonly type: "string";
            };
            readonly lane: {
                readonly type: "string";
            };
            readonly createdAt: {
                readonly type: "string";
            };
            readonly updatedAt: {
                readonly type: "string";
            };
            readonly currentStepId: {
                readonly type: "string";
            };
            readonly currentStepTitle: {
                readonly type: "string";
            };
            readonly currentStepType: {
                readonly type: "string";
            };
            readonly currentStepTool: {
                readonly type: "string";
            };
            readonly stepCount: {
                readonly type: "number";
            };
            readonly completedStepCount: {
                readonly type: "number";
            };
            readonly waitingApprovalStepCount: {
                readonly type: "number";
            };
            readonly failedStepCount: {
                readonly type: "number";
            };
            readonly retryableStepCount: {
                readonly type: "number";
            };
            readonly resultSummary: {
                readonly type: "string";
            };
            readonly error: {
                readonly type: "string";
            };
            readonly tags: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            };
        };
    }];
    readonly properties: {
        readonly hasLogs: {
            readonly type: "boolean";
        };
        readonly hasMemoryUpdates: {
            readonly type: "boolean";
        };
        readonly lastLogAt: {
            readonly type: "string";
        };
        readonly approvalPreview: {
            readonly type: "object";
            readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
            readonly properties: {
                readonly title: {
                    readonly type: "string";
                };
                readonly body: {
                    readonly type: "string";
                };
                readonly tool: {
                    readonly type: "string";
                };
                readonly stepId: {
                    readonly type: "string";
                };
                readonly stepType: {
                    readonly type: "string";
                };
                readonly actionLabel: {
                    readonly type: "string";
                };
                readonly data: {
                    readonly type: "object";
                };
            };
        };
    };
};
export declare const dashboardJobDetailRecordSchema: {
    readonly type: "object";
    readonly allOf: readonly [{
        readonly type: "object";
        readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
        readonly properties: {
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
            readonly goal: {
                readonly type: "string";
            };
            readonly priority: {
                readonly type: "string";
            };
            readonly mode: {
                readonly type: "string";
            };
            readonly status: {
                readonly type: "string";
            };
            readonly approvalStatus: {
                readonly type: "string";
            };
            readonly riskLevel: {
                readonly type: "string";
            };
            readonly lane: {
                readonly type: "string";
            };
            readonly createdAt: {
                readonly type: "string";
            };
            readonly updatedAt: {
                readonly type: "string";
            };
            readonly currentStepId: {
                readonly type: "string";
            };
            readonly currentStepTitle: {
                readonly type: "string";
            };
            readonly currentStepType: {
                readonly type: "string";
            };
            readonly currentStepTool: {
                readonly type: "string";
            };
            readonly stepCount: {
                readonly type: "number";
            };
            readonly completedStepCount: {
                readonly type: "number";
            };
            readonly waitingApprovalStepCount: {
                readonly type: "number";
            };
            readonly failedStepCount: {
                readonly type: "number";
            };
            readonly retryableStepCount: {
                readonly type: "number";
            };
            readonly resultSummary: {
                readonly type: "string";
            };
            readonly error: {
                readonly type: "string";
            };
            readonly tags: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            };
        };
    }];
    readonly properties: {
        readonly goalPayload: {
            readonly type: "object";
        };
        readonly route: {
            readonly type: "object";
        };
        readonly plan: {
            readonly type: "object";
        };
        readonly result: {
            readonly type: "object";
        };
        readonly workflowStatus: {
            readonly type: "object";
        };
        readonly escalation: {
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
        readonly approvedStepIds: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly logCount: {
            readonly type: "number";
        };
        readonly memoryUpdateCount: {
            readonly type: "number";
        };
    };
};
export declare const dashboardJobDetailResponseSchema: {
    readonly type: "object";
    readonly allOf: readonly [{
        readonly type: "object";
        readonly required: readonly ["kind", "version", "generatedAt", "filters"];
        readonly properties: {
            readonly kind: {
                readonly type: "string";
            };
            readonly version: {
                readonly type: "string";
                readonly enum: readonly ["stage-5"];
            };
            readonly generatedAt: {
                readonly type: "string";
            };
            readonly tenantId: {
                readonly type: "string";
            };
            readonly filters: {
                readonly type: "object";
                readonly properties: {
                    readonly tenantId: {
                        readonly type: "string";
                    };
                    readonly product: {
                        readonly type: "string";
                    };
                    readonly workflow: {
                        readonly type: "string";
                    };
                    readonly jobId: {
                        readonly type: "string";
                    };
                    readonly caseId: {
                        readonly type: "string";
                    };
                    readonly status: {
                        readonly oneOf: readonly [{
                            readonly type: "string";
                        }, {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        }];
                    };
                    readonly approvalStatus: {
                        readonly oneOf: readonly [{
                            readonly type: "string";
                        }, {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        }];
                    };
                    readonly page: {
                        readonly type: "number";
                    };
                    readonly pageSize: {
                        readonly type: "number";
                    };
                    readonly search: {
                        readonly type: "string";
                    };
                    readonly sortBy: {
                        readonly type: "string";
                        readonly enum: readonly ["createdAt", "updatedAt", "status", "product", "priority"];
                    };
                    readonly sortDirection: {
                        readonly type: "string";
                        readonly enum: readonly ["asc", "desc"];
                    };
                    readonly from: {
                        readonly type: "string";
                    };
                    readonly to: {
                        readonly type: "string";
                    };
                    readonly lane: {
                        readonly type: "string";
                        readonly enum: readonly ["internal", "external", "mixed"];
                    };
                };
            };
        };
    }];
    readonly required: readonly ["kind", "job", "timeline", "logs", "approvals", "memoryUpdates"];
    readonly properties: {
        readonly kind: {
            readonly type: "string";
            readonly enum: readonly ["job-detail"];
        };
        readonly job: {
            readonly type: "object";
            readonly allOf: readonly [{
                readonly type: "object";
                readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                readonly properties: {
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
                    readonly goal: {
                        readonly type: "string";
                    };
                    readonly priority: {
                        readonly type: "string";
                    };
                    readonly mode: {
                        readonly type: "string";
                    };
                    readonly status: {
                        readonly type: "string";
                    };
                    readonly approvalStatus: {
                        readonly type: "string";
                    };
                    readonly riskLevel: {
                        readonly type: "string";
                    };
                    readonly lane: {
                        readonly type: "string";
                    };
                    readonly createdAt: {
                        readonly type: "string";
                    };
                    readonly updatedAt: {
                        readonly type: "string";
                    };
                    readonly currentStepId: {
                        readonly type: "string";
                    };
                    readonly currentStepTitle: {
                        readonly type: "string";
                    };
                    readonly currentStepType: {
                        readonly type: "string";
                    };
                    readonly currentStepTool: {
                        readonly type: "string";
                    };
                    readonly stepCount: {
                        readonly type: "number";
                    };
                    readonly completedStepCount: {
                        readonly type: "number";
                    };
                    readonly waitingApprovalStepCount: {
                        readonly type: "number";
                    };
                    readonly failedStepCount: {
                        readonly type: "number";
                    };
                    readonly retryableStepCount: {
                        readonly type: "number";
                    };
                    readonly resultSummary: {
                        readonly type: "string";
                    };
                    readonly error: {
                        readonly type: "string";
                    };
                    readonly tags: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                };
            }];
            readonly properties: {
                readonly goalPayload: {
                    readonly type: "object";
                };
                readonly route: {
                    readonly type: "object";
                };
                readonly plan: {
                    readonly type: "object";
                };
                readonly result: {
                    readonly type: "object";
                };
                readonly workflowStatus: {
                    readonly type: "object";
                };
                readonly escalation: {
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
                readonly approvedStepIds: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly logCount: {
                    readonly type: "number";
                };
                readonly memoryUpdateCount: {
                    readonly type: "number";
                };
            };
        };
        readonly timeline: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
        readonly logs: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
        readonly approvals: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
        readonly memoryUpdates: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
        readonly productPanel: {
            readonly type: "object";
        };
    };
};
export declare const dashboardStepTimelineItemSchema: {
    readonly type: "object";
    readonly required: readonly ["stepId", "title", "type", "tool", "status", "dependsOn", "approvalRequired", "retryable", "attempts", "inputSummary"];
    readonly properties: {
        readonly stepId: {
            readonly type: "string";
        };
        readonly title: {
            readonly type: "string";
        };
        readonly type: {
            readonly type: "string";
        };
        readonly tool: {
            readonly type: "string";
        };
        readonly status: {
            readonly type: "string";
        };
        readonly dependsOn: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly approvalRequired: {
            readonly type: "boolean";
        };
        readonly retryable: {
            readonly type: "boolean";
        };
        readonly attempts: {
            readonly type: "number";
        };
        readonly startedAt: {
            readonly type: "string";
        };
        readonly completedAt: {
            readonly type: "string";
        };
        readonly message: {
            readonly type: "string";
        };
        readonly error: {
            readonly type: "string";
        };
        readonly retry: {
            readonly type: "object";
            readonly required: readonly ["attempts", "maxAttempts", "retryable", "exhausted"];
            readonly properties: {
                readonly attempts: {
                    readonly type: "number";
                };
                readonly maxAttempts: {
                    readonly type: "number";
                };
                readonly retryable: {
                    readonly type: "boolean";
                };
                readonly exhausted: {
                    readonly type: "boolean";
                };
                readonly lastAttemptAt: {
                    readonly type: "string";
                };
                readonly lastError: {
                    readonly type: "string";
                };
                readonly nextRetryAt: {
                    readonly type: "string";
                };
            };
        };
        readonly inputSummary: {
            readonly type: "string";
        };
        readonly outputSummary: {
            readonly type: "string";
        };
    };
};
export declare const dashboardJobListSummarySchema: {
    readonly type: "object";
    readonly required: readonly ["total", "running", "waitingApproval", "failed", "completed", "byStatus", "byProduct", "byWorkflow", "byApprovalStatus"];
    readonly properties: {
        readonly total: {
            readonly type: "number";
        };
        readonly running: {
            readonly type: "number";
        };
        readonly waitingApproval: {
            readonly type: "number";
        };
        readonly failed: {
            readonly type: "number";
        };
        readonly completed: {
            readonly type: "number";
        };
        readonly byStatus: {
            readonly type: "object";
        };
        readonly byProduct: {
            readonly type: "object";
        };
        readonly byWorkflow: {
            readonly type: "object";
        };
        readonly byApprovalStatus: {
            readonly type: "object";
        };
    };
};
export declare const dashboardJobListResponseSchema: {
    readonly type: "object";
    readonly allOf: readonly [{
        readonly type: "object";
        readonly required: readonly ["kind", "version", "generatedAt", "filters"];
        readonly properties: {
            readonly kind: {
                readonly type: "string";
            };
            readonly version: {
                readonly type: "string";
                readonly enum: readonly ["stage-5"];
            };
            readonly generatedAt: {
                readonly type: "string";
            };
            readonly tenantId: {
                readonly type: "string";
            };
            readonly filters: {
                readonly type: "object";
                readonly properties: {
                    readonly tenantId: {
                        readonly type: "string";
                    };
                    readonly product: {
                        readonly type: "string";
                    };
                    readonly workflow: {
                        readonly type: "string";
                    };
                    readonly jobId: {
                        readonly type: "string";
                    };
                    readonly caseId: {
                        readonly type: "string";
                    };
                    readonly status: {
                        readonly oneOf: readonly [{
                            readonly type: "string";
                        }, {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        }];
                    };
                    readonly approvalStatus: {
                        readonly oneOf: readonly [{
                            readonly type: "string";
                        }, {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        }];
                    };
                    readonly page: {
                        readonly type: "number";
                    };
                    readonly pageSize: {
                        readonly type: "number";
                    };
                    readonly search: {
                        readonly type: "string";
                    };
                    readonly sortBy: {
                        readonly type: "string";
                        readonly enum: readonly ["createdAt", "updatedAt", "status", "product", "priority"];
                    };
                    readonly sortDirection: {
                        readonly type: "string";
                        readonly enum: readonly ["asc", "desc"];
                    };
                    readonly from: {
                        readonly type: "string";
                    };
                    readonly to: {
                        readonly type: "string";
                    };
                    readonly lane: {
                        readonly type: "string";
                        readonly enum: readonly ["internal", "external", "mixed"];
                    };
                };
            };
        };
    }];
    readonly required: readonly ["kind", "pageInfo", "summary", "items"];
    readonly properties: {
        readonly kind: {
            readonly type: "string";
            readonly enum: readonly ["job-list"];
        };
        readonly pageInfo: {
            readonly type: "object";
            readonly required: readonly ["page", "pageSize", "total", "hasMore"];
            readonly properties: {
                readonly page: {
                    readonly type: "number";
                };
                readonly pageSize: {
                    readonly type: "number";
                };
                readonly total: {
                    readonly type: "number";
                };
                readonly hasMore: {
                    readonly type: "boolean";
                };
                readonly nextPage: {
                    readonly type: "number";
                };
            };
        };
        readonly summary: {
            readonly type: "object";
            readonly required: readonly ["total", "running", "waitingApproval", "failed", "completed", "byStatus", "byProduct", "byWorkflow", "byApprovalStatus"];
            readonly properties: {
                readonly total: {
                    readonly type: "number";
                };
                readonly running: {
                    readonly type: "number";
                };
                readonly waitingApproval: {
                    readonly type: "number";
                };
                readonly failed: {
                    readonly type: "number";
                };
                readonly completed: {
                    readonly type: "number";
                };
                readonly byStatus: {
                    readonly type: "object";
                };
                readonly byProduct: {
                    readonly type: "object";
                };
                readonly byWorkflow: {
                    readonly type: "object";
                };
                readonly byApprovalStatus: {
                    readonly type: "object";
                };
            };
        };
        readonly items: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly allOf: readonly [{
                    readonly type: "object";
                    readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                    readonly properties: {
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
                        readonly goal: {
                            readonly type: "string";
                        };
                        readonly priority: {
                            readonly type: "string";
                        };
                        readonly mode: {
                            readonly type: "string";
                        };
                        readonly status: {
                            readonly type: "string";
                        };
                        readonly approvalStatus: {
                            readonly type: "string";
                        };
                        readonly riskLevel: {
                            readonly type: "string";
                        };
                        readonly lane: {
                            readonly type: "string";
                        };
                        readonly createdAt: {
                            readonly type: "string";
                        };
                        readonly updatedAt: {
                            readonly type: "string";
                        };
                        readonly currentStepId: {
                            readonly type: "string";
                        };
                        readonly currentStepTitle: {
                            readonly type: "string";
                        };
                        readonly currentStepType: {
                            readonly type: "string";
                        };
                        readonly currentStepTool: {
                            readonly type: "string";
                        };
                        readonly stepCount: {
                            readonly type: "number";
                        };
                        readonly completedStepCount: {
                            readonly type: "number";
                        };
                        readonly waitingApprovalStepCount: {
                            readonly type: "number";
                        };
                        readonly failedStepCount: {
                            readonly type: "number";
                        };
                        readonly retryableStepCount: {
                            readonly type: "number";
                        };
                        readonly resultSummary: {
                            readonly type: "string";
                        };
                        readonly error: {
                            readonly type: "string";
                        };
                        readonly tags: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        };
                    };
                }];
                readonly properties: {
                    readonly hasLogs: {
                        readonly type: "boolean";
                    };
                    readonly hasMemoryUpdates: {
                        readonly type: "boolean";
                    };
                    readonly lastLogAt: {
                        readonly type: "string";
                    };
                    readonly approvalPreview: {
                        readonly type: "object";
                        readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
                        readonly properties: {
                            readonly title: {
                                readonly type: "string";
                            };
                            readonly body: {
                                readonly type: "string";
                            };
                            readonly tool: {
                                readonly type: "string";
                            };
                            readonly stepId: {
                                readonly type: "string";
                            };
                            readonly stepType: {
                                readonly type: "string";
                            };
                            readonly actionLabel: {
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
    };
};
export declare const dashboardApprovalQueueItemSchema: {
    readonly type: "object";
    readonly allOf: readonly [{
        readonly type: "object";
        readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
        readonly properties: {
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
            readonly goal: {
                readonly type: "string";
            };
            readonly priority: {
                readonly type: "string";
            };
            readonly mode: {
                readonly type: "string";
            };
            readonly status: {
                readonly type: "string";
            };
            readonly approvalStatus: {
                readonly type: "string";
            };
            readonly riskLevel: {
                readonly type: "string";
            };
            readonly lane: {
                readonly type: "string";
            };
            readonly createdAt: {
                readonly type: "string";
            };
            readonly updatedAt: {
                readonly type: "string";
            };
            readonly currentStepId: {
                readonly type: "string";
            };
            readonly currentStepTitle: {
                readonly type: "string";
            };
            readonly currentStepType: {
                readonly type: "string";
            };
            readonly currentStepTool: {
                readonly type: "string";
            };
            readonly stepCount: {
                readonly type: "number";
            };
            readonly completedStepCount: {
                readonly type: "number";
            };
            readonly waitingApprovalStepCount: {
                readonly type: "number";
            };
            readonly failedStepCount: {
                readonly type: "number";
            };
            readonly retryableStepCount: {
                readonly type: "number";
            };
            readonly resultSummary: {
                readonly type: "string";
            };
            readonly error: {
                readonly type: "string";
            };
            readonly tags: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            };
        };
    }];
    readonly required: readonly ["stepId", "stepType", "stepTitle", "tool", "reason", "preview", "canApprove", "canReject", "canEdit", "retryable"];
    readonly properties: {
        readonly stepId: {
            readonly type: "string";
        };
        readonly stepType: {
            readonly type: "string";
        };
        readonly stepTitle: {
            readonly type: "string";
        };
        readonly tool: {
            readonly type: "string";
        };
        readonly reason: {
            readonly type: "string";
        };
        readonly preview: {
            readonly type: "object";
            readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
            readonly properties: {
                readonly title: {
                    readonly type: "string";
                };
                readonly body: {
                    readonly type: "string";
                };
                readonly tool: {
                    readonly type: "string";
                };
                readonly stepId: {
                    readonly type: "string";
                };
                readonly stepType: {
                    readonly type: "string";
                };
                readonly actionLabel: {
                    readonly type: "string";
                };
                readonly data: {
                    readonly type: "object";
                };
            };
        };
        readonly canApprove: {
            readonly type: "boolean";
        };
        readonly canReject: {
            readonly type: "boolean";
        };
        readonly canEdit: {
            readonly type: "boolean";
        };
        readonly retryable: {
            readonly type: "boolean";
        };
    };
};
export declare const dashboardApprovalQueueSummarySchema: {
    readonly type: "object";
    readonly required: readonly ["total", "highRisk", "mediumRisk", "lowRisk", "byProduct", "byWorkflow", "byLane"];
    readonly properties: {
        readonly total: {
            readonly type: "number";
        };
        readonly highRisk: {
            readonly type: "number";
        };
        readonly mediumRisk: {
            readonly type: "number";
        };
        readonly lowRisk: {
            readonly type: "number";
        };
        readonly byProduct: {
            readonly type: "object";
        };
        readonly byWorkflow: {
            readonly type: "object";
        };
        readonly byLane: {
            readonly type: "object";
        };
    };
};
export declare const dashboardApprovalQueueResponseSchema: {
    readonly type: "object";
    readonly allOf: readonly [{
        readonly type: "object";
        readonly required: readonly ["kind", "version", "generatedAt", "filters"];
        readonly properties: {
            readonly kind: {
                readonly type: "string";
            };
            readonly version: {
                readonly type: "string";
                readonly enum: readonly ["stage-5"];
            };
            readonly generatedAt: {
                readonly type: "string";
            };
            readonly tenantId: {
                readonly type: "string";
            };
            readonly filters: {
                readonly type: "object";
                readonly properties: {
                    readonly tenantId: {
                        readonly type: "string";
                    };
                    readonly product: {
                        readonly type: "string";
                    };
                    readonly workflow: {
                        readonly type: "string";
                    };
                    readonly jobId: {
                        readonly type: "string";
                    };
                    readonly caseId: {
                        readonly type: "string";
                    };
                    readonly status: {
                        readonly oneOf: readonly [{
                            readonly type: "string";
                        }, {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        }];
                    };
                    readonly approvalStatus: {
                        readonly oneOf: readonly [{
                            readonly type: "string";
                        }, {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        }];
                    };
                    readonly page: {
                        readonly type: "number";
                    };
                    readonly pageSize: {
                        readonly type: "number";
                    };
                    readonly search: {
                        readonly type: "string";
                    };
                    readonly sortBy: {
                        readonly type: "string";
                        readonly enum: readonly ["createdAt", "updatedAt", "status", "product", "priority"];
                    };
                    readonly sortDirection: {
                        readonly type: "string";
                        readonly enum: readonly ["asc", "desc"];
                    };
                    readonly from: {
                        readonly type: "string";
                    };
                    readonly to: {
                        readonly type: "string";
                    };
                    readonly lane: {
                        readonly type: "string";
                        readonly enum: readonly ["internal", "external", "mixed"];
                    };
                };
            };
        };
    }];
    readonly required: readonly ["kind", "pageInfo", "summary", "items"];
    readonly properties: {
        readonly kind: {
            readonly type: "string";
            readonly enum: readonly ["approval-queue"];
        };
        readonly pageInfo: {
            readonly type: "object";
            readonly required: readonly ["page", "pageSize", "total", "hasMore"];
            readonly properties: {
                readonly page: {
                    readonly type: "number";
                };
                readonly pageSize: {
                    readonly type: "number";
                };
                readonly total: {
                    readonly type: "number";
                };
                readonly hasMore: {
                    readonly type: "boolean";
                };
                readonly nextPage: {
                    readonly type: "number";
                };
            };
        };
        readonly summary: {
            readonly type: "object";
            readonly required: readonly ["total", "highRisk", "mediumRisk", "lowRisk", "byProduct", "byWorkflow", "byLane"];
            readonly properties: {
                readonly total: {
                    readonly type: "number";
                };
                readonly highRisk: {
                    readonly type: "number";
                };
                readonly mediumRisk: {
                    readonly type: "number";
                };
                readonly lowRisk: {
                    readonly type: "number";
                };
                readonly byProduct: {
                    readonly type: "object";
                };
                readonly byWorkflow: {
                    readonly type: "object";
                };
                readonly byLane: {
                    readonly type: "object";
                };
            };
        };
        readonly items: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly allOf: readonly [{
                    readonly type: "object";
                    readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                    readonly properties: {
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
                        readonly goal: {
                            readonly type: "string";
                        };
                        readonly priority: {
                            readonly type: "string";
                        };
                        readonly mode: {
                            readonly type: "string";
                        };
                        readonly status: {
                            readonly type: "string";
                        };
                        readonly approvalStatus: {
                            readonly type: "string";
                        };
                        readonly riskLevel: {
                            readonly type: "string";
                        };
                        readonly lane: {
                            readonly type: "string";
                        };
                        readonly createdAt: {
                            readonly type: "string";
                        };
                        readonly updatedAt: {
                            readonly type: "string";
                        };
                        readonly currentStepId: {
                            readonly type: "string";
                        };
                        readonly currentStepTitle: {
                            readonly type: "string";
                        };
                        readonly currentStepType: {
                            readonly type: "string";
                        };
                        readonly currentStepTool: {
                            readonly type: "string";
                        };
                        readonly stepCount: {
                            readonly type: "number";
                        };
                        readonly completedStepCount: {
                            readonly type: "number";
                        };
                        readonly waitingApprovalStepCount: {
                            readonly type: "number";
                        };
                        readonly failedStepCount: {
                            readonly type: "number";
                        };
                        readonly retryableStepCount: {
                            readonly type: "number";
                        };
                        readonly resultSummary: {
                            readonly type: "string";
                        };
                        readonly error: {
                            readonly type: "string";
                        };
                        readonly tags: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        };
                    };
                }];
                readonly required: readonly ["stepId", "stepType", "stepTitle", "tool", "reason", "preview", "canApprove", "canReject", "canEdit", "retryable"];
                readonly properties: {
                    readonly stepId: {
                        readonly type: "string";
                    };
                    readonly stepType: {
                        readonly type: "string";
                    };
                    readonly stepTitle: {
                        readonly type: "string";
                    };
                    readonly tool: {
                        readonly type: "string";
                    };
                    readonly reason: {
                        readonly type: "string";
                    };
                    readonly preview: {
                        readonly type: "object";
                        readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
                        readonly properties: {
                            readonly title: {
                                readonly type: "string";
                            };
                            readonly body: {
                                readonly type: "string";
                            };
                            readonly tool: {
                                readonly type: "string";
                            };
                            readonly stepId: {
                                readonly type: "string";
                            };
                            readonly stepType: {
                                readonly type: "string";
                            };
                            readonly actionLabel: {
                                readonly type: "string";
                            };
                            readonly data: {
                                readonly type: "object";
                            };
                        };
                    };
                    readonly canApprove: {
                        readonly type: "boolean";
                    };
                    readonly canReject: {
                        readonly type: "boolean";
                    };
                    readonly canEdit: {
                        readonly type: "boolean";
                    };
                    readonly retryable: {
                        readonly type: "boolean";
                    };
                };
            };
        };
    };
};
export declare const dashboardLogEntrySchema: {
    readonly type: "object";
    readonly required: readonly ["id", "at", "level", "message", "source"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
        };
        readonly at: {
            readonly type: "string";
        };
        readonly level: {
            readonly type: "string";
            readonly enum: readonly ["debug", "info", "warn", "error"];
        };
        readonly message: {
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
        readonly stepId: {
            readonly type: "string";
        };
        readonly stepType: {
            readonly type: "string";
        };
        readonly tool: {
            readonly type: "string";
        };
        readonly agentId: {
            readonly type: "string";
        };
        readonly actorRole: {
            readonly type: "string";
            readonly enum: readonly ["viewer", "analyst", "operator", "admin", "system"];
        };
        readonly source: {
            readonly type: "string";
            readonly enum: readonly ["job", "step", "system"];
        };
        readonly data: {
            readonly type: "object";
        };
    };
};
export declare const dashboardLogFeedSummarySchema: {
    readonly type: "object";
    readonly required: readonly ["total", "debug", "info", "warn", "error", "byProduct", "byWorkflow"];
    readonly properties: {
        readonly total: {
            readonly type: "number";
        };
        readonly debug: {
            readonly type: "number";
        };
        readonly info: {
            readonly type: "number";
        };
        readonly warn: {
            readonly type: "number";
        };
        readonly error: {
            readonly type: "number";
        };
        readonly byProduct: {
            readonly type: "object";
        };
        readonly byWorkflow: {
            readonly type: "object";
        };
    };
};
export declare const dashboardLogFeedResponseSchema: {
    readonly type: "object";
    readonly allOf: readonly [{
        readonly type: "object";
        readonly required: readonly ["kind", "version", "generatedAt", "filters"];
        readonly properties: {
            readonly kind: {
                readonly type: "string";
            };
            readonly version: {
                readonly type: "string";
                readonly enum: readonly ["stage-5"];
            };
            readonly generatedAt: {
                readonly type: "string";
            };
            readonly tenantId: {
                readonly type: "string";
            };
            readonly filters: {
                readonly type: "object";
                readonly properties: {
                    readonly tenantId: {
                        readonly type: "string";
                    };
                    readonly product: {
                        readonly type: "string";
                    };
                    readonly workflow: {
                        readonly type: "string";
                    };
                    readonly jobId: {
                        readonly type: "string";
                    };
                    readonly caseId: {
                        readonly type: "string";
                    };
                    readonly status: {
                        readonly oneOf: readonly [{
                            readonly type: "string";
                        }, {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        }];
                    };
                    readonly approvalStatus: {
                        readonly oneOf: readonly [{
                            readonly type: "string";
                        }, {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        }];
                    };
                    readonly page: {
                        readonly type: "number";
                    };
                    readonly pageSize: {
                        readonly type: "number";
                    };
                    readonly search: {
                        readonly type: "string";
                    };
                    readonly sortBy: {
                        readonly type: "string";
                        readonly enum: readonly ["createdAt", "updatedAt", "status", "product", "priority"];
                    };
                    readonly sortDirection: {
                        readonly type: "string";
                        readonly enum: readonly ["asc", "desc"];
                    };
                    readonly from: {
                        readonly type: "string";
                    };
                    readonly to: {
                        readonly type: "string";
                    };
                    readonly lane: {
                        readonly type: "string";
                        readonly enum: readonly ["internal", "external", "mixed"];
                    };
                };
            };
        };
    }];
    readonly required: readonly ["kind", "pageInfo", "scope", "summary", "items"];
    readonly properties: {
        readonly kind: {
            readonly type: "string";
            readonly enum: readonly ["log-feed"];
        };
        readonly pageInfo: {
            readonly type: "object";
            readonly required: readonly ["page", "pageSize", "total", "hasMore"];
            readonly properties: {
                readonly page: {
                    readonly type: "number";
                };
                readonly pageSize: {
                    readonly type: "number";
                };
                readonly total: {
                    readonly type: "number";
                };
                readonly hasMore: {
                    readonly type: "boolean";
                };
                readonly nextPage: {
                    readonly type: "number";
                };
            };
        };
        readonly scope: {
            readonly type: "string";
            readonly enum: readonly ["global", "tenant", "job", "product"];
        };
        readonly summary: {
            readonly type: "object";
            readonly required: readonly ["total", "debug", "info", "warn", "error", "byProduct", "byWorkflow"];
            readonly properties: {
                readonly total: {
                    readonly type: "number";
                };
                readonly debug: {
                    readonly type: "number";
                };
                readonly info: {
                    readonly type: "number";
                };
                readonly warn: {
                    readonly type: "number";
                };
                readonly error: {
                    readonly type: "number";
                };
                readonly byProduct: {
                    readonly type: "object";
                };
                readonly byWorkflow: {
                    readonly type: "object";
                };
            };
        };
        readonly items: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["id", "at", "level", "message", "source"];
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                    };
                    readonly at: {
                        readonly type: "string";
                    };
                    readonly level: {
                        readonly type: "string";
                        readonly enum: readonly ["debug", "info", "warn", "error"];
                    };
                    readonly message: {
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
                    readonly stepId: {
                        readonly type: "string";
                    };
                    readonly stepType: {
                        readonly type: "string";
                    };
                    readonly tool: {
                        readonly type: "string";
                    };
                    readonly agentId: {
                        readonly type: "string";
                    };
                    readonly actorRole: {
                        readonly type: "string";
                        readonly enum: readonly ["viewer", "analyst", "operator", "admin", "system"];
                    };
                    readonly source: {
                        readonly type: "string";
                        readonly enum: readonly ["job", "step", "system"];
                    };
                    readonly data: {
                        readonly type: "object";
                    };
                };
            };
        };
    };
};
export declare const dashboardRecurringJobItemSchema: {
    readonly type: "object";
    readonly required: readonly ["jobId", "product", "workflow", "title", "runAt", "status", "source"];
    readonly properties: {
        readonly jobId: {
            readonly type: "string";
        };
        readonly product: {
            readonly type: "string";
        };
        readonly workflow: {
            readonly type: "string";
        };
        readonly title: {
            readonly type: "string";
        };
        readonly stepId: {
            readonly type: "string";
        };
        readonly runAt: {
            readonly type: "string";
        };
        readonly status: {
            readonly type: "string";
        };
        readonly detail: {
            readonly type: "string";
        };
        readonly source: {
            readonly type: "string";
            readonly enum: readonly ["scheduler", "job-step", "goal-payload"];
        };
    };
};
export declare const dashboardWorkflowActivityProductItemSchema: {
    readonly type: "object";
    readonly required: readonly ["product", "title", "activeJobs", "runningJobs", "waitingApprovalJobs", "failedJobs", "completedJobs24h", "failedJobs24h", "laneBreakdown", "recentJobs", "recentCompletedRuns", "recentFailedRuns", "recurringJobs", "alerts"];
    readonly properties: {
        readonly product: {
            readonly type: "string";
        };
        readonly title: {
            readonly type: "string";
        };
        readonly activeJobs: {
            readonly type: "number";
        };
        readonly runningJobs: {
            readonly type: "number";
        };
        readonly waitingApprovalJobs: {
            readonly type: "number";
        };
        readonly failedJobs: {
            readonly type: "number";
        };
        readonly completedJobs24h: {
            readonly type: "number";
        };
        readonly failedJobs24h: {
            readonly type: "number";
        };
        readonly laneBreakdown: {
            readonly type: "object";
        };
        readonly recentJobs: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly allOf: readonly [{
                    readonly type: "object";
                    readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                    readonly properties: {
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
                        readonly goal: {
                            readonly type: "string";
                        };
                        readonly priority: {
                            readonly type: "string";
                        };
                        readonly mode: {
                            readonly type: "string";
                        };
                        readonly status: {
                            readonly type: "string";
                        };
                        readonly approvalStatus: {
                            readonly type: "string";
                        };
                        readonly riskLevel: {
                            readonly type: "string";
                        };
                        readonly lane: {
                            readonly type: "string";
                        };
                        readonly createdAt: {
                            readonly type: "string";
                        };
                        readonly updatedAt: {
                            readonly type: "string";
                        };
                        readonly currentStepId: {
                            readonly type: "string";
                        };
                        readonly currentStepTitle: {
                            readonly type: "string";
                        };
                        readonly currentStepType: {
                            readonly type: "string";
                        };
                        readonly currentStepTool: {
                            readonly type: "string";
                        };
                        readonly stepCount: {
                            readonly type: "number";
                        };
                        readonly completedStepCount: {
                            readonly type: "number";
                        };
                        readonly waitingApprovalStepCount: {
                            readonly type: "number";
                        };
                        readonly failedStepCount: {
                            readonly type: "number";
                        };
                        readonly retryableStepCount: {
                            readonly type: "number";
                        };
                        readonly resultSummary: {
                            readonly type: "string";
                        };
                        readonly error: {
                            readonly type: "string";
                        };
                        readonly tags: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        };
                    };
                }];
                readonly properties: {
                    readonly hasLogs: {
                        readonly type: "boolean";
                    };
                    readonly hasMemoryUpdates: {
                        readonly type: "boolean";
                    };
                    readonly lastLogAt: {
                        readonly type: "string";
                    };
                    readonly approvalPreview: {
                        readonly type: "object";
                        readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
                        readonly properties: {
                            readonly title: {
                                readonly type: "string";
                            };
                            readonly body: {
                                readonly type: "string";
                            };
                            readonly tool: {
                                readonly type: "string";
                            };
                            readonly stepId: {
                                readonly type: "string";
                            };
                            readonly stepType: {
                                readonly type: "string";
                            };
                            readonly actionLabel: {
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
        readonly recentCompletedRuns: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly allOf: readonly [{
                    readonly type: "object";
                    readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                    readonly properties: {
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
                        readonly goal: {
                            readonly type: "string";
                        };
                        readonly priority: {
                            readonly type: "string";
                        };
                        readonly mode: {
                            readonly type: "string";
                        };
                        readonly status: {
                            readonly type: "string";
                        };
                        readonly approvalStatus: {
                            readonly type: "string";
                        };
                        readonly riskLevel: {
                            readonly type: "string";
                        };
                        readonly lane: {
                            readonly type: "string";
                        };
                        readonly createdAt: {
                            readonly type: "string";
                        };
                        readonly updatedAt: {
                            readonly type: "string";
                        };
                        readonly currentStepId: {
                            readonly type: "string";
                        };
                        readonly currentStepTitle: {
                            readonly type: "string";
                        };
                        readonly currentStepType: {
                            readonly type: "string";
                        };
                        readonly currentStepTool: {
                            readonly type: "string";
                        };
                        readonly stepCount: {
                            readonly type: "number";
                        };
                        readonly completedStepCount: {
                            readonly type: "number";
                        };
                        readonly waitingApprovalStepCount: {
                            readonly type: "number";
                        };
                        readonly failedStepCount: {
                            readonly type: "number";
                        };
                        readonly retryableStepCount: {
                            readonly type: "number";
                        };
                        readonly resultSummary: {
                            readonly type: "string";
                        };
                        readonly error: {
                            readonly type: "string";
                        };
                        readonly tags: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        };
                    };
                }];
                readonly properties: {
                    readonly hasLogs: {
                        readonly type: "boolean";
                    };
                    readonly hasMemoryUpdates: {
                        readonly type: "boolean";
                    };
                    readonly lastLogAt: {
                        readonly type: "string";
                    };
                    readonly approvalPreview: {
                        readonly type: "object";
                        readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
                        readonly properties: {
                            readonly title: {
                                readonly type: "string";
                            };
                            readonly body: {
                                readonly type: "string";
                            };
                            readonly tool: {
                                readonly type: "string";
                            };
                            readonly stepId: {
                                readonly type: "string";
                            };
                            readonly stepType: {
                                readonly type: "string";
                            };
                            readonly actionLabel: {
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
        readonly recentFailedRuns: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly allOf: readonly [{
                    readonly type: "object";
                    readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                    readonly properties: {
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
                        readonly goal: {
                            readonly type: "string";
                        };
                        readonly priority: {
                            readonly type: "string";
                        };
                        readonly mode: {
                            readonly type: "string";
                        };
                        readonly status: {
                            readonly type: "string";
                        };
                        readonly approvalStatus: {
                            readonly type: "string";
                        };
                        readonly riskLevel: {
                            readonly type: "string";
                        };
                        readonly lane: {
                            readonly type: "string";
                        };
                        readonly createdAt: {
                            readonly type: "string";
                        };
                        readonly updatedAt: {
                            readonly type: "string";
                        };
                        readonly currentStepId: {
                            readonly type: "string";
                        };
                        readonly currentStepTitle: {
                            readonly type: "string";
                        };
                        readonly currentStepType: {
                            readonly type: "string";
                        };
                        readonly currentStepTool: {
                            readonly type: "string";
                        };
                        readonly stepCount: {
                            readonly type: "number";
                        };
                        readonly completedStepCount: {
                            readonly type: "number";
                        };
                        readonly waitingApprovalStepCount: {
                            readonly type: "number";
                        };
                        readonly failedStepCount: {
                            readonly type: "number";
                        };
                        readonly retryableStepCount: {
                            readonly type: "number";
                        };
                        readonly resultSummary: {
                            readonly type: "string";
                        };
                        readonly error: {
                            readonly type: "string";
                        };
                        readonly tags: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        };
                    };
                }];
                readonly properties: {
                    readonly hasLogs: {
                        readonly type: "boolean";
                    };
                    readonly hasMemoryUpdates: {
                        readonly type: "boolean";
                    };
                    readonly lastLogAt: {
                        readonly type: "string";
                    };
                    readonly approvalPreview: {
                        readonly type: "object";
                        readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
                        readonly properties: {
                            readonly title: {
                                readonly type: "string";
                            };
                            readonly body: {
                                readonly type: "string";
                            };
                            readonly tool: {
                                readonly type: "string";
                            };
                            readonly stepId: {
                                readonly type: "string";
                            };
                            readonly stepType: {
                                readonly type: "string";
                            };
                            readonly actionLabel: {
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
        readonly recurringJobs: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["jobId", "product", "workflow", "title", "runAt", "status", "source"];
                readonly properties: {
                    readonly jobId: {
                        readonly type: "string";
                    };
                    readonly product: {
                        readonly type: "string";
                    };
                    readonly workflow: {
                        readonly type: "string";
                    };
                    readonly title: {
                        readonly type: "string";
                    };
                    readonly stepId: {
                        readonly type: "string";
                    };
                    readonly runAt: {
                        readonly type: "string";
                    };
                    readonly status: {
                        readonly type: "string";
                    };
                    readonly detail: {
                        readonly type: "string";
                    };
                    readonly source: {
                        readonly type: "string";
                        readonly enum: readonly ["scheduler", "job-step", "goal-payload"];
                    };
                };
            };
        };
        readonly alerts: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["id", "level", "title", "message", "createdAt", "metadata"];
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                    };
                    readonly level: {
                        readonly type: "string";
                        readonly enum: readonly ["info", "success", "warning", "critical"];
                    };
                    readonly title: {
                        readonly type: "string";
                    };
                    readonly message: {
                        readonly type: "string";
                    };
                    readonly createdAt: {
                        readonly type: "string";
                    };
                    readonly relatedJobId: {
                        readonly type: "string";
                    };
                    readonly relatedProduct: {
                        readonly type: "string";
                    };
                    readonly actionLabel: {
                        readonly type: "string";
                    };
                    readonly actionHref: {
                        readonly type: "string";
                    };
                    readonly metadata: {
                        readonly type: "object";
                    };
                };
            };
        };
        readonly lastActivityAt: {
            readonly type: "string";
        };
    };
};
export declare const dashboardWorkflowActivitySummarySchema: {
    readonly type: "object";
    readonly required: readonly ["totalActiveJobs", "waitingApproval", "failed", "completed24h", "failed24h", "laneBreakdown"];
    readonly properties: {
        readonly totalActiveJobs: {
            readonly type: "number";
        };
        readonly waitingApproval: {
            readonly type: "number";
        };
        readonly failed: {
            readonly type: "number";
        };
        readonly completed24h: {
            readonly type: "number";
        };
        readonly failed24h: {
            readonly type: "number";
        };
        readonly laneBreakdown: {
            readonly type: "object";
        };
    };
};
export declare const dashboardWorkflowActivityResponseSchema: {
    readonly type: "object";
    readonly allOf: readonly [{
        readonly type: "object";
        readonly required: readonly ["kind", "version", "generatedAt", "filters"];
        readonly properties: {
            readonly kind: {
                readonly type: "string";
            };
            readonly version: {
                readonly type: "string";
                readonly enum: readonly ["stage-5"];
            };
            readonly generatedAt: {
                readonly type: "string";
            };
            readonly tenantId: {
                readonly type: "string";
            };
            readonly filters: {
                readonly type: "object";
                readonly properties: {
                    readonly tenantId: {
                        readonly type: "string";
                    };
                    readonly product: {
                        readonly type: "string";
                    };
                    readonly workflow: {
                        readonly type: "string";
                    };
                    readonly jobId: {
                        readonly type: "string";
                    };
                    readonly caseId: {
                        readonly type: "string";
                    };
                    readonly status: {
                        readonly oneOf: readonly [{
                            readonly type: "string";
                        }, {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        }];
                    };
                    readonly approvalStatus: {
                        readonly oneOf: readonly [{
                            readonly type: "string";
                        }, {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        }];
                    };
                    readonly page: {
                        readonly type: "number";
                    };
                    readonly pageSize: {
                        readonly type: "number";
                    };
                    readonly search: {
                        readonly type: "string";
                    };
                    readonly sortBy: {
                        readonly type: "string";
                        readonly enum: readonly ["createdAt", "updatedAt", "status", "product", "priority"];
                    };
                    readonly sortDirection: {
                        readonly type: "string";
                        readonly enum: readonly ["asc", "desc"];
                    };
                    readonly from: {
                        readonly type: "string";
                    };
                    readonly to: {
                        readonly type: "string";
                    };
                    readonly lane: {
                        readonly type: "string";
                        readonly enum: readonly ["internal", "external", "mixed"];
                    };
                };
            };
        };
    }];
    readonly required: readonly ["kind", "summary", "products", "recentCompletedRuns", "recentFailedRuns", "recurringJobs", "alerts"];
    readonly properties: {
        readonly kind: {
            readonly type: "string";
            readonly enum: readonly ["workflow-activity"];
        };
        readonly summary: {
            readonly type: "object";
            readonly required: readonly ["totalActiveJobs", "waitingApproval", "failed", "completed24h", "failed24h", "laneBreakdown"];
            readonly properties: {
                readonly totalActiveJobs: {
                    readonly type: "number";
                };
                readonly waitingApproval: {
                    readonly type: "number";
                };
                readonly failed: {
                    readonly type: "number";
                };
                readonly completed24h: {
                    readonly type: "number";
                };
                readonly failed24h: {
                    readonly type: "number";
                };
                readonly laneBreakdown: {
                    readonly type: "object";
                };
            };
        };
        readonly products: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["product", "title", "activeJobs", "runningJobs", "waitingApprovalJobs", "failedJobs", "completedJobs24h", "failedJobs24h", "laneBreakdown", "recentJobs", "recentCompletedRuns", "recentFailedRuns", "recurringJobs", "alerts"];
                readonly properties: {
                    readonly product: {
                        readonly type: "string";
                    };
                    readonly title: {
                        readonly type: "string";
                    };
                    readonly activeJobs: {
                        readonly type: "number";
                    };
                    readonly runningJobs: {
                        readonly type: "number";
                    };
                    readonly waitingApprovalJobs: {
                        readonly type: "number";
                    };
                    readonly failedJobs: {
                        readonly type: "number";
                    };
                    readonly completedJobs24h: {
                        readonly type: "number";
                    };
                    readonly failedJobs24h: {
                        readonly type: "number";
                    };
                    readonly laneBreakdown: {
                        readonly type: "object";
                    };
                    readonly recentJobs: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly allOf: readonly [{
                                readonly type: "object";
                                readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                                readonly properties: {
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
                                    readonly goal: {
                                        readonly type: "string";
                                    };
                                    readonly priority: {
                                        readonly type: "string";
                                    };
                                    readonly mode: {
                                        readonly type: "string";
                                    };
                                    readonly status: {
                                        readonly type: "string";
                                    };
                                    readonly approvalStatus: {
                                        readonly type: "string";
                                    };
                                    readonly riskLevel: {
                                        readonly type: "string";
                                    };
                                    readonly lane: {
                                        readonly type: "string";
                                    };
                                    readonly createdAt: {
                                        readonly type: "string";
                                    };
                                    readonly updatedAt: {
                                        readonly type: "string";
                                    };
                                    readonly currentStepId: {
                                        readonly type: "string";
                                    };
                                    readonly currentStepTitle: {
                                        readonly type: "string";
                                    };
                                    readonly currentStepType: {
                                        readonly type: "string";
                                    };
                                    readonly currentStepTool: {
                                        readonly type: "string";
                                    };
                                    readonly stepCount: {
                                        readonly type: "number";
                                    };
                                    readonly completedStepCount: {
                                        readonly type: "number";
                                    };
                                    readonly waitingApprovalStepCount: {
                                        readonly type: "number";
                                    };
                                    readonly failedStepCount: {
                                        readonly type: "number";
                                    };
                                    readonly retryableStepCount: {
                                        readonly type: "number";
                                    };
                                    readonly resultSummary: {
                                        readonly type: "string";
                                    };
                                    readonly error: {
                                        readonly type: "string";
                                    };
                                    readonly tags: {
                                        readonly type: "array";
                                        readonly items: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                            }];
                            readonly properties: {
                                readonly hasLogs: {
                                    readonly type: "boolean";
                                };
                                readonly hasMemoryUpdates: {
                                    readonly type: "boolean";
                                };
                                readonly lastLogAt: {
                                    readonly type: "string";
                                };
                                readonly approvalPreview: {
                                    readonly type: "object";
                                    readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
                                    readonly properties: {
                                        readonly title: {
                                            readonly type: "string";
                                        };
                                        readonly body: {
                                            readonly type: "string";
                                        };
                                        readonly tool: {
                                            readonly type: "string";
                                        };
                                        readonly stepId: {
                                            readonly type: "string";
                                        };
                                        readonly stepType: {
                                            readonly type: "string";
                                        };
                                        readonly actionLabel: {
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
                    readonly recentCompletedRuns: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly allOf: readonly [{
                                readonly type: "object";
                                readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                                readonly properties: {
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
                                    readonly goal: {
                                        readonly type: "string";
                                    };
                                    readonly priority: {
                                        readonly type: "string";
                                    };
                                    readonly mode: {
                                        readonly type: "string";
                                    };
                                    readonly status: {
                                        readonly type: "string";
                                    };
                                    readonly approvalStatus: {
                                        readonly type: "string";
                                    };
                                    readonly riskLevel: {
                                        readonly type: "string";
                                    };
                                    readonly lane: {
                                        readonly type: "string";
                                    };
                                    readonly createdAt: {
                                        readonly type: "string";
                                    };
                                    readonly updatedAt: {
                                        readonly type: "string";
                                    };
                                    readonly currentStepId: {
                                        readonly type: "string";
                                    };
                                    readonly currentStepTitle: {
                                        readonly type: "string";
                                    };
                                    readonly currentStepType: {
                                        readonly type: "string";
                                    };
                                    readonly currentStepTool: {
                                        readonly type: "string";
                                    };
                                    readonly stepCount: {
                                        readonly type: "number";
                                    };
                                    readonly completedStepCount: {
                                        readonly type: "number";
                                    };
                                    readonly waitingApprovalStepCount: {
                                        readonly type: "number";
                                    };
                                    readonly failedStepCount: {
                                        readonly type: "number";
                                    };
                                    readonly retryableStepCount: {
                                        readonly type: "number";
                                    };
                                    readonly resultSummary: {
                                        readonly type: "string";
                                    };
                                    readonly error: {
                                        readonly type: "string";
                                    };
                                    readonly tags: {
                                        readonly type: "array";
                                        readonly items: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                            }];
                            readonly properties: {
                                readonly hasLogs: {
                                    readonly type: "boolean";
                                };
                                readonly hasMemoryUpdates: {
                                    readonly type: "boolean";
                                };
                                readonly lastLogAt: {
                                    readonly type: "string";
                                };
                                readonly approvalPreview: {
                                    readonly type: "object";
                                    readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
                                    readonly properties: {
                                        readonly title: {
                                            readonly type: "string";
                                        };
                                        readonly body: {
                                            readonly type: "string";
                                        };
                                        readonly tool: {
                                            readonly type: "string";
                                        };
                                        readonly stepId: {
                                            readonly type: "string";
                                        };
                                        readonly stepType: {
                                            readonly type: "string";
                                        };
                                        readonly actionLabel: {
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
                    readonly recentFailedRuns: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly allOf: readonly [{
                                readonly type: "object";
                                readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                                readonly properties: {
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
                                    readonly goal: {
                                        readonly type: "string";
                                    };
                                    readonly priority: {
                                        readonly type: "string";
                                    };
                                    readonly mode: {
                                        readonly type: "string";
                                    };
                                    readonly status: {
                                        readonly type: "string";
                                    };
                                    readonly approvalStatus: {
                                        readonly type: "string";
                                    };
                                    readonly riskLevel: {
                                        readonly type: "string";
                                    };
                                    readonly lane: {
                                        readonly type: "string";
                                    };
                                    readonly createdAt: {
                                        readonly type: "string";
                                    };
                                    readonly updatedAt: {
                                        readonly type: "string";
                                    };
                                    readonly currentStepId: {
                                        readonly type: "string";
                                    };
                                    readonly currentStepTitle: {
                                        readonly type: "string";
                                    };
                                    readonly currentStepType: {
                                        readonly type: "string";
                                    };
                                    readonly currentStepTool: {
                                        readonly type: "string";
                                    };
                                    readonly stepCount: {
                                        readonly type: "number";
                                    };
                                    readonly completedStepCount: {
                                        readonly type: "number";
                                    };
                                    readonly waitingApprovalStepCount: {
                                        readonly type: "number";
                                    };
                                    readonly failedStepCount: {
                                        readonly type: "number";
                                    };
                                    readonly retryableStepCount: {
                                        readonly type: "number";
                                    };
                                    readonly resultSummary: {
                                        readonly type: "string";
                                    };
                                    readonly error: {
                                        readonly type: "string";
                                    };
                                    readonly tags: {
                                        readonly type: "array";
                                        readonly items: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                            }];
                            readonly properties: {
                                readonly hasLogs: {
                                    readonly type: "boolean";
                                };
                                readonly hasMemoryUpdates: {
                                    readonly type: "boolean";
                                };
                                readonly lastLogAt: {
                                    readonly type: "string";
                                };
                                readonly approvalPreview: {
                                    readonly type: "object";
                                    readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
                                    readonly properties: {
                                        readonly title: {
                                            readonly type: "string";
                                        };
                                        readonly body: {
                                            readonly type: "string";
                                        };
                                        readonly tool: {
                                            readonly type: "string";
                                        };
                                        readonly stepId: {
                                            readonly type: "string";
                                        };
                                        readonly stepType: {
                                            readonly type: "string";
                                        };
                                        readonly actionLabel: {
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
                    readonly recurringJobs: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly required: readonly ["jobId", "product", "workflow", "title", "runAt", "status", "source"];
                            readonly properties: {
                                readonly jobId: {
                                    readonly type: "string";
                                };
                                readonly product: {
                                    readonly type: "string";
                                };
                                readonly workflow: {
                                    readonly type: "string";
                                };
                                readonly title: {
                                    readonly type: "string";
                                };
                                readonly stepId: {
                                    readonly type: "string";
                                };
                                readonly runAt: {
                                    readonly type: "string";
                                };
                                readonly status: {
                                    readonly type: "string";
                                };
                                readonly detail: {
                                    readonly type: "string";
                                };
                                readonly source: {
                                    readonly type: "string";
                                    readonly enum: readonly ["scheduler", "job-step", "goal-payload"];
                                };
                            };
                        };
                    };
                    readonly alerts: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly required: readonly ["id", "level", "title", "message", "createdAt", "metadata"];
                            readonly properties: {
                                readonly id: {
                                    readonly type: "string";
                                };
                                readonly level: {
                                    readonly type: "string";
                                    readonly enum: readonly ["info", "success", "warning", "critical"];
                                };
                                readonly title: {
                                    readonly type: "string";
                                };
                                readonly message: {
                                    readonly type: "string";
                                };
                                readonly createdAt: {
                                    readonly type: "string";
                                };
                                readonly relatedJobId: {
                                    readonly type: "string";
                                };
                                readonly relatedProduct: {
                                    readonly type: "string";
                                };
                                readonly actionLabel: {
                                    readonly type: "string";
                                };
                                readonly actionHref: {
                                    readonly type: "string";
                                };
                                readonly metadata: {
                                    readonly type: "object";
                                };
                            };
                        };
                    };
                    readonly lastActivityAt: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly recentCompletedRuns: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly allOf: readonly [{
                    readonly type: "object";
                    readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                    readonly properties: {
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
                        readonly goal: {
                            readonly type: "string";
                        };
                        readonly priority: {
                            readonly type: "string";
                        };
                        readonly mode: {
                            readonly type: "string";
                        };
                        readonly status: {
                            readonly type: "string";
                        };
                        readonly approvalStatus: {
                            readonly type: "string";
                        };
                        readonly riskLevel: {
                            readonly type: "string";
                        };
                        readonly lane: {
                            readonly type: "string";
                        };
                        readonly createdAt: {
                            readonly type: "string";
                        };
                        readonly updatedAt: {
                            readonly type: "string";
                        };
                        readonly currentStepId: {
                            readonly type: "string";
                        };
                        readonly currentStepTitle: {
                            readonly type: "string";
                        };
                        readonly currentStepType: {
                            readonly type: "string";
                        };
                        readonly currentStepTool: {
                            readonly type: "string";
                        };
                        readonly stepCount: {
                            readonly type: "number";
                        };
                        readonly completedStepCount: {
                            readonly type: "number";
                        };
                        readonly waitingApprovalStepCount: {
                            readonly type: "number";
                        };
                        readonly failedStepCount: {
                            readonly type: "number";
                        };
                        readonly retryableStepCount: {
                            readonly type: "number";
                        };
                        readonly resultSummary: {
                            readonly type: "string";
                        };
                        readonly error: {
                            readonly type: "string";
                        };
                        readonly tags: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        };
                    };
                }];
                readonly properties: {
                    readonly hasLogs: {
                        readonly type: "boolean";
                    };
                    readonly hasMemoryUpdates: {
                        readonly type: "boolean";
                    };
                    readonly lastLogAt: {
                        readonly type: "string";
                    };
                    readonly approvalPreview: {
                        readonly type: "object";
                        readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
                        readonly properties: {
                            readonly title: {
                                readonly type: "string";
                            };
                            readonly body: {
                                readonly type: "string";
                            };
                            readonly tool: {
                                readonly type: "string";
                            };
                            readonly stepId: {
                                readonly type: "string";
                            };
                            readonly stepType: {
                                readonly type: "string";
                            };
                            readonly actionLabel: {
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
        readonly recentFailedRuns: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly allOf: readonly [{
                    readonly type: "object";
                    readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                    readonly properties: {
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
                        readonly goal: {
                            readonly type: "string";
                        };
                        readonly priority: {
                            readonly type: "string";
                        };
                        readonly mode: {
                            readonly type: "string";
                        };
                        readonly status: {
                            readonly type: "string";
                        };
                        readonly approvalStatus: {
                            readonly type: "string";
                        };
                        readonly riskLevel: {
                            readonly type: "string";
                        };
                        readonly lane: {
                            readonly type: "string";
                        };
                        readonly createdAt: {
                            readonly type: "string";
                        };
                        readonly updatedAt: {
                            readonly type: "string";
                        };
                        readonly currentStepId: {
                            readonly type: "string";
                        };
                        readonly currentStepTitle: {
                            readonly type: "string";
                        };
                        readonly currentStepType: {
                            readonly type: "string";
                        };
                        readonly currentStepTool: {
                            readonly type: "string";
                        };
                        readonly stepCount: {
                            readonly type: "number";
                        };
                        readonly completedStepCount: {
                            readonly type: "number";
                        };
                        readonly waitingApprovalStepCount: {
                            readonly type: "number";
                        };
                        readonly failedStepCount: {
                            readonly type: "number";
                        };
                        readonly retryableStepCount: {
                            readonly type: "number";
                        };
                        readonly resultSummary: {
                            readonly type: "string";
                        };
                        readonly error: {
                            readonly type: "string";
                        };
                        readonly tags: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        };
                    };
                }];
                readonly properties: {
                    readonly hasLogs: {
                        readonly type: "boolean";
                    };
                    readonly hasMemoryUpdates: {
                        readonly type: "boolean";
                    };
                    readonly lastLogAt: {
                        readonly type: "string";
                    };
                    readonly approvalPreview: {
                        readonly type: "object";
                        readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
                        readonly properties: {
                            readonly title: {
                                readonly type: "string";
                            };
                            readonly body: {
                                readonly type: "string";
                            };
                            readonly tool: {
                                readonly type: "string";
                            };
                            readonly stepId: {
                                readonly type: "string";
                            };
                            readonly stepType: {
                                readonly type: "string";
                            };
                            readonly actionLabel: {
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
        readonly recurringJobs: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["jobId", "product", "workflow", "title", "runAt", "status", "source"];
                readonly properties: {
                    readonly jobId: {
                        readonly type: "string";
                    };
                    readonly product: {
                        readonly type: "string";
                    };
                    readonly workflow: {
                        readonly type: "string";
                    };
                    readonly title: {
                        readonly type: "string";
                    };
                    readonly stepId: {
                        readonly type: "string";
                    };
                    readonly runAt: {
                        readonly type: "string";
                    };
                    readonly status: {
                        readonly type: "string";
                    };
                    readonly detail: {
                        readonly type: "string";
                    };
                    readonly source: {
                        readonly type: "string";
                        readonly enum: readonly ["scheduler", "job-step", "goal-payload"];
                    };
                };
            };
        };
        readonly alerts: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["id", "level", "title", "message", "createdAt", "metadata"];
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                    };
                    readonly level: {
                        readonly type: "string";
                        readonly enum: readonly ["info", "success", "warning", "critical"];
                    };
                    readonly title: {
                        readonly type: "string";
                    };
                    readonly message: {
                        readonly type: "string";
                    };
                    readonly createdAt: {
                        readonly type: "string";
                    };
                    readonly relatedJobId: {
                        readonly type: "string";
                    };
                    readonly relatedProduct: {
                        readonly type: "string";
                    };
                    readonly actionLabel: {
                        readonly type: "string";
                    };
                    readonly actionHref: {
                        readonly type: "string";
                    };
                    readonly metadata: {
                        readonly type: "object";
                    };
                };
            };
        };
    };
};
export declare const dashboardMemoryItemSchema: {
    readonly type: "object";
    readonly required: readonly ["id", "tenantId", "product", "category", "key", "value", "confidence", "editable", "createdAt", "updatedAt", "summary"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly product: {
            readonly type: "string";
        };
        readonly category: {
            readonly type: "string";
        };
        readonly key: {
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
        readonly sourceJobId: {
            readonly type: "string";
        };
        readonly sourceStepId: {
            readonly type: "string";
        };
        readonly editable: {
            readonly type: "boolean";
        };
        readonly createdAt: {
            readonly type: "string";
        };
        readonly updatedAt: {
            readonly type: "string";
        };
        readonly summary: {
            readonly type: "string";
        };
        readonly sourceLabel: {
            readonly type: "string";
        };
        readonly sourceStepLabel: {
            readonly type: "string";
        };
        readonly auditTrail: {
            readonly type: "array";
            readonly items: {
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
        };
    };
};
export declare const dashboardMemoryAuditEntrySchema: {
    readonly type: "object";
    readonly required: readonly ["id", "at", "tenantId", "product", "category", "key", "confidence", "editable", "summary"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
        };
        readonly at: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly product: {
            readonly type: "string";
        };
        readonly category: {
            readonly type: "string";
        };
        readonly key: {
            readonly type: "string";
        };
        readonly confidence: {
            readonly type: "number";
        };
        readonly editable: {
            readonly type: "boolean";
        };
        readonly sourceJobId: {
            readonly type: "string";
        };
        readonly sourceStepId: {
            readonly type: "string";
        };
        readonly summary: {
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
    };
};
export declare const dashboardMemoryViewSummarySchema: {
    readonly type: "object";
    readonly required: readonly ["total", "editable", "byCategory", "byProduct", "patternCount", "recentUpdates"];
    readonly properties: {
        readonly total: {
            readonly type: "number";
        };
        readonly editable: {
            readonly type: "number";
        };
        readonly byCategory: {
            readonly type: "object";
        };
        readonly byProduct: {
            readonly type: "object";
        };
        readonly patternCount: {
            readonly type: "number";
        };
        readonly recentUpdates: {
            readonly type: "number";
        };
    };
};
export declare const dashboardMemoryViewResponseSchema: {
    readonly type: "object";
    readonly allOf: readonly [{
        readonly type: "object";
        readonly required: readonly ["kind", "version", "generatedAt", "filters"];
        readonly properties: {
            readonly kind: {
                readonly type: "string";
            };
            readonly version: {
                readonly type: "string";
                readonly enum: readonly ["stage-5"];
            };
            readonly generatedAt: {
                readonly type: "string";
            };
            readonly tenantId: {
                readonly type: "string";
            };
            readonly filters: {
                readonly type: "object";
                readonly properties: {
                    readonly tenantId: {
                        readonly type: "string";
                    };
                    readonly product: {
                        readonly type: "string";
                    };
                    readonly workflow: {
                        readonly type: "string";
                    };
                    readonly jobId: {
                        readonly type: "string";
                    };
                    readonly caseId: {
                        readonly type: "string";
                    };
                    readonly status: {
                        readonly oneOf: readonly [{
                            readonly type: "string";
                        }, {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        }];
                    };
                    readonly approvalStatus: {
                        readonly oneOf: readonly [{
                            readonly type: "string";
                        }, {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        }];
                    };
                    readonly page: {
                        readonly type: "number";
                    };
                    readonly pageSize: {
                        readonly type: "number";
                    };
                    readonly search: {
                        readonly type: "string";
                    };
                    readonly sortBy: {
                        readonly type: "string";
                        readonly enum: readonly ["createdAt", "updatedAt", "status", "product", "priority"];
                    };
                    readonly sortDirection: {
                        readonly type: "string";
                        readonly enum: readonly ["asc", "desc"];
                    };
                    readonly from: {
                        readonly type: "string";
                    };
                    readonly to: {
                        readonly type: "string";
                    };
                    readonly lane: {
                        readonly type: "string";
                        readonly enum: readonly ["internal", "external", "mixed"];
                    };
                };
            };
        };
    }];
    readonly required: readonly ["kind", "pageInfo", "summary", "items", "patterns", "auditTrail"];
    readonly properties: {
        readonly kind: {
            readonly type: "string";
            readonly enum: readonly ["memory-view"];
        };
        readonly pageInfo: {
            readonly type: "object";
            readonly required: readonly ["page", "pageSize", "total", "hasMore"];
            readonly properties: {
                readonly page: {
                    readonly type: "number";
                };
                readonly pageSize: {
                    readonly type: "number";
                };
                readonly total: {
                    readonly type: "number";
                };
                readonly hasMore: {
                    readonly type: "boolean";
                };
                readonly nextPage: {
                    readonly type: "number";
                };
            };
        };
        readonly summary: {
            readonly type: "object";
            readonly required: readonly ["total", "editable", "byCategory", "byProduct", "patternCount", "recentUpdates"];
            readonly properties: {
                readonly total: {
                    readonly type: "number";
                };
                readonly editable: {
                    readonly type: "number";
                };
                readonly byCategory: {
                    readonly type: "object";
                };
                readonly byProduct: {
                    readonly type: "object";
                };
                readonly patternCount: {
                    readonly type: "number";
                };
                readonly recentUpdates: {
                    readonly type: "number";
                };
            };
        };
        readonly items: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["id", "tenantId", "product", "category", "key", "value", "confidence", "editable", "createdAt", "updatedAt", "summary"];
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                    };
                    readonly tenantId: {
                        readonly type: "string";
                    };
                    readonly product: {
                        readonly type: "string";
                    };
                    readonly category: {
                        readonly type: "string";
                    };
                    readonly key: {
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
                    readonly sourceJobId: {
                        readonly type: "string";
                    };
                    readonly sourceStepId: {
                        readonly type: "string";
                    };
                    readonly editable: {
                        readonly type: "boolean";
                    };
                    readonly createdAt: {
                        readonly type: "string";
                    };
                    readonly updatedAt: {
                        readonly type: "string";
                    };
                    readonly summary: {
                        readonly type: "string";
                    };
                    readonly sourceLabel: {
                        readonly type: "string";
                    };
                    readonly sourceStepLabel: {
                        readonly type: "string";
                    };
                    readonly auditTrail: {
                        readonly type: "array";
                        readonly items: {
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
                    };
                };
            };
        };
        readonly patterns: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["id", "tenantId", "product", "category", "key", "value", "confidence", "editable", "createdAt", "updatedAt", "summary"];
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                    };
                    readonly tenantId: {
                        readonly type: "string";
                    };
                    readonly product: {
                        readonly type: "string";
                    };
                    readonly category: {
                        readonly type: "string";
                    };
                    readonly key: {
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
                    readonly sourceJobId: {
                        readonly type: "string";
                    };
                    readonly sourceStepId: {
                        readonly type: "string";
                    };
                    readonly editable: {
                        readonly type: "boolean";
                    };
                    readonly createdAt: {
                        readonly type: "string";
                    };
                    readonly updatedAt: {
                        readonly type: "string";
                    };
                    readonly summary: {
                        readonly type: "string";
                    };
                    readonly sourceLabel: {
                        readonly type: "string";
                    };
                    readonly sourceStepLabel: {
                        readonly type: "string";
                    };
                    readonly auditTrail: {
                        readonly type: "array";
                        readonly items: {
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
                    };
                };
            };
        };
        readonly auditTrail: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["id", "at", "tenantId", "product", "category", "key", "confidence", "editable", "summary"];
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                    };
                    readonly at: {
                        readonly type: "string";
                    };
                    readonly tenantId: {
                        readonly type: "string";
                    };
                    readonly product: {
                        readonly type: "string";
                    };
                    readonly category: {
                        readonly type: "string";
                    };
                    readonly key: {
                        readonly type: "string";
                    };
                    readonly confidence: {
                        readonly type: "number";
                    };
                    readonly editable: {
                        readonly type: "boolean";
                    };
                    readonly sourceJobId: {
                        readonly type: "string";
                    };
                    readonly sourceStepId: {
                        readonly type: "string";
                    };
                    readonly summary: {
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
                };
            };
        };
    };
};
export declare const dashboardProductCardSchema: {
    readonly type: "object";
    readonly required: readonly ["product", "title", "description", "primaryMetric", "secondaryMetrics", "activeJobs", "waitingApprovals", "alerts"];
    readonly properties: {
        readonly product: {
            readonly type: "string";
        };
        readonly title: {
            readonly type: "string";
        };
        readonly description: {
            readonly type: "string";
        };
        readonly primaryMetric: {
            readonly type: "object";
            readonly required: readonly ["label", "value", "tone"];
            readonly properties: {
                readonly label: {
                    readonly type: "string";
                };
                readonly value: {
                    readonly oneOf: readonly [{
                        readonly type: "number";
                    }, {
                        readonly type: "string";
                    }];
                };
                readonly detail: {
                    readonly type: "string";
                };
                readonly tone: {
                    readonly type: "string";
                    readonly enum: readonly ["neutral", "success", "warning", "danger", "accent"];
                };
                readonly trend: {
                    readonly type: "object";
                    readonly required: readonly ["direction", "value"];
                    readonly properties: {
                        readonly direction: {
                            readonly type: "string";
                            readonly enum: readonly ["up", "down", "flat"];
                        };
                        readonly value: {
                            readonly type: "number";
                        };
                        readonly label: {
                            readonly type: "string";
                        };
                    };
                };
            };
        };
        readonly secondaryMetrics: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["label", "value", "tone"];
                readonly properties: {
                    readonly label: {
                        readonly type: "string";
                    };
                    readonly value: {
                        readonly oneOf: readonly [{
                            readonly type: "number";
                        }, {
                            readonly type: "string";
                        }];
                    };
                    readonly detail: {
                        readonly type: "string";
                    };
                    readonly tone: {
                        readonly type: "string";
                        readonly enum: readonly ["neutral", "success", "warning", "danger", "accent"];
                    };
                    readonly trend: {
                        readonly type: "object";
                        readonly required: readonly ["direction", "value"];
                        readonly properties: {
                            readonly direction: {
                                readonly type: "string";
                                readonly enum: readonly ["up", "down", "flat"];
                            };
                            readonly value: {
                                readonly type: "number";
                            };
                            readonly label: {
                                readonly type: "string";
                            };
                        };
                    };
                };
            };
        };
        readonly activeJobs: {
            readonly type: "number";
        };
        readonly waitingApprovals: {
            readonly type: "number";
        };
        readonly alerts: {
            readonly type: "number";
        };
        readonly lastActivityAt: {
            readonly type: "string";
        };
    };
};
export declare const dashboardOverviewResponseSchema: {
    readonly type: "object";
    readonly allOf: readonly [{
        readonly type: "object";
        readonly required: readonly ["kind", "version", "generatedAt", "filters"];
        readonly properties: {
            readonly kind: {
                readonly type: "string";
            };
            readonly version: {
                readonly type: "string";
                readonly enum: readonly ["stage-5"];
            };
            readonly generatedAt: {
                readonly type: "string";
            };
            readonly tenantId: {
                readonly type: "string";
            };
            readonly filters: {
                readonly type: "object";
                readonly properties: {
                    readonly tenantId: {
                        readonly type: "string";
                    };
                    readonly product: {
                        readonly type: "string";
                    };
                    readonly workflow: {
                        readonly type: "string";
                    };
                    readonly jobId: {
                        readonly type: "string";
                    };
                    readonly caseId: {
                        readonly type: "string";
                    };
                    readonly status: {
                        readonly oneOf: readonly [{
                            readonly type: "string";
                        }, {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        }];
                    };
                    readonly approvalStatus: {
                        readonly oneOf: readonly [{
                            readonly type: "string";
                        }, {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        }];
                    };
                    readonly page: {
                        readonly type: "number";
                    };
                    readonly pageSize: {
                        readonly type: "number";
                    };
                    readonly search: {
                        readonly type: "string";
                    };
                    readonly sortBy: {
                        readonly type: "string";
                        readonly enum: readonly ["createdAt", "updatedAt", "status", "product", "priority"];
                    };
                    readonly sortDirection: {
                        readonly type: "string";
                        readonly enum: readonly ["asc", "desc"];
                    };
                    readonly from: {
                        readonly type: "string";
                    };
                    readonly to: {
                        readonly type: "string";
                    };
                    readonly lane: {
                        readonly type: "string";
                        readonly enum: readonly ["internal", "external", "mixed"];
                    };
                };
            };
        };
    }];
    readonly required: readonly ["kind", "snapshot", "summaryCards", "alerts", "recentJobs", "recentApprovals", "recentLogs", "activity", "memory", "productCards"];
    readonly properties: {
        readonly kind: {
            readonly type: "string";
            readonly enum: readonly ["overview"];
        };
        readonly snapshot: {
            readonly type: "object";
        };
        readonly summaryCards: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["label", "value", "tone"];
                readonly properties: {
                    readonly label: {
                        readonly type: "string";
                    };
                    readonly value: {
                        readonly oneOf: readonly [{
                            readonly type: "number";
                        }, {
                            readonly type: "string";
                        }];
                    };
                    readonly detail: {
                        readonly type: "string";
                    };
                    readonly tone: {
                        readonly type: "string";
                        readonly enum: readonly ["neutral", "success", "warning", "danger", "accent"];
                    };
                    readonly trend: {
                        readonly type: "object";
                        readonly required: readonly ["direction", "value"];
                        readonly properties: {
                            readonly direction: {
                                readonly type: "string";
                                readonly enum: readonly ["up", "down", "flat"];
                            };
                            readonly value: {
                                readonly type: "number";
                            };
                            readonly label: {
                                readonly type: "string";
                            };
                        };
                    };
                };
            };
        };
        readonly alerts: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["id", "level", "title", "message", "createdAt", "metadata"];
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                    };
                    readonly level: {
                        readonly type: "string";
                        readonly enum: readonly ["info", "success", "warning", "critical"];
                    };
                    readonly title: {
                        readonly type: "string";
                    };
                    readonly message: {
                        readonly type: "string";
                    };
                    readonly createdAt: {
                        readonly type: "string";
                    };
                    readonly relatedJobId: {
                        readonly type: "string";
                    };
                    readonly relatedProduct: {
                        readonly type: "string";
                    };
                    readonly actionLabel: {
                        readonly type: "string";
                    };
                    readonly actionHref: {
                        readonly type: "string";
                    };
                    readonly metadata: {
                        readonly type: "object";
                    };
                };
            };
        };
        readonly recentJobs: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly allOf: readonly [{
                    readonly type: "object";
                    readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                    readonly properties: {
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
                        readonly goal: {
                            readonly type: "string";
                        };
                        readonly priority: {
                            readonly type: "string";
                        };
                        readonly mode: {
                            readonly type: "string";
                        };
                        readonly status: {
                            readonly type: "string";
                        };
                        readonly approvalStatus: {
                            readonly type: "string";
                        };
                        readonly riskLevel: {
                            readonly type: "string";
                        };
                        readonly lane: {
                            readonly type: "string";
                        };
                        readonly createdAt: {
                            readonly type: "string";
                        };
                        readonly updatedAt: {
                            readonly type: "string";
                        };
                        readonly currentStepId: {
                            readonly type: "string";
                        };
                        readonly currentStepTitle: {
                            readonly type: "string";
                        };
                        readonly currentStepType: {
                            readonly type: "string";
                        };
                        readonly currentStepTool: {
                            readonly type: "string";
                        };
                        readonly stepCount: {
                            readonly type: "number";
                        };
                        readonly completedStepCount: {
                            readonly type: "number";
                        };
                        readonly waitingApprovalStepCount: {
                            readonly type: "number";
                        };
                        readonly failedStepCount: {
                            readonly type: "number";
                        };
                        readonly retryableStepCount: {
                            readonly type: "number";
                        };
                        readonly resultSummary: {
                            readonly type: "string";
                        };
                        readonly error: {
                            readonly type: "string";
                        };
                        readonly tags: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        };
                    };
                }];
                readonly properties: {
                    readonly hasLogs: {
                        readonly type: "boolean";
                    };
                    readonly hasMemoryUpdates: {
                        readonly type: "boolean";
                    };
                    readonly lastLogAt: {
                        readonly type: "string";
                    };
                    readonly approvalPreview: {
                        readonly type: "object";
                        readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
                        readonly properties: {
                            readonly title: {
                                readonly type: "string";
                            };
                            readonly body: {
                                readonly type: "string";
                            };
                            readonly tool: {
                                readonly type: "string";
                            };
                            readonly stepId: {
                                readonly type: "string";
                            };
                            readonly stepType: {
                                readonly type: "string";
                            };
                            readonly actionLabel: {
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
        readonly recentApprovals: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly allOf: readonly [{
                    readonly type: "object";
                    readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                    readonly properties: {
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
                        readonly goal: {
                            readonly type: "string";
                        };
                        readonly priority: {
                            readonly type: "string";
                        };
                        readonly mode: {
                            readonly type: "string";
                        };
                        readonly status: {
                            readonly type: "string";
                        };
                        readonly approvalStatus: {
                            readonly type: "string";
                        };
                        readonly riskLevel: {
                            readonly type: "string";
                        };
                        readonly lane: {
                            readonly type: "string";
                        };
                        readonly createdAt: {
                            readonly type: "string";
                        };
                        readonly updatedAt: {
                            readonly type: "string";
                        };
                        readonly currentStepId: {
                            readonly type: "string";
                        };
                        readonly currentStepTitle: {
                            readonly type: "string";
                        };
                        readonly currentStepType: {
                            readonly type: "string";
                        };
                        readonly currentStepTool: {
                            readonly type: "string";
                        };
                        readonly stepCount: {
                            readonly type: "number";
                        };
                        readonly completedStepCount: {
                            readonly type: "number";
                        };
                        readonly waitingApprovalStepCount: {
                            readonly type: "number";
                        };
                        readonly failedStepCount: {
                            readonly type: "number";
                        };
                        readonly retryableStepCount: {
                            readonly type: "number";
                        };
                        readonly resultSummary: {
                            readonly type: "string";
                        };
                        readonly error: {
                            readonly type: "string";
                        };
                        readonly tags: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        };
                    };
                }];
                readonly required: readonly ["stepId", "stepType", "stepTitle", "tool", "reason", "preview", "canApprove", "canReject", "canEdit", "retryable"];
                readonly properties: {
                    readonly stepId: {
                        readonly type: "string";
                    };
                    readonly stepType: {
                        readonly type: "string";
                    };
                    readonly stepTitle: {
                        readonly type: "string";
                    };
                    readonly tool: {
                        readonly type: "string";
                    };
                    readonly reason: {
                        readonly type: "string";
                    };
                    readonly preview: {
                        readonly type: "object";
                        readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
                        readonly properties: {
                            readonly title: {
                                readonly type: "string";
                            };
                            readonly body: {
                                readonly type: "string";
                            };
                            readonly tool: {
                                readonly type: "string";
                            };
                            readonly stepId: {
                                readonly type: "string";
                            };
                            readonly stepType: {
                                readonly type: "string";
                            };
                            readonly actionLabel: {
                                readonly type: "string";
                            };
                            readonly data: {
                                readonly type: "object";
                            };
                        };
                    };
                    readonly canApprove: {
                        readonly type: "boolean";
                    };
                    readonly canReject: {
                        readonly type: "boolean";
                    };
                    readonly canEdit: {
                        readonly type: "boolean";
                    };
                    readonly retryable: {
                        readonly type: "boolean";
                    };
                };
            };
        };
        readonly recentLogs: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["id", "at", "level", "message", "source"];
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                    };
                    readonly at: {
                        readonly type: "string";
                    };
                    readonly level: {
                        readonly type: "string";
                        readonly enum: readonly ["debug", "info", "warn", "error"];
                    };
                    readonly message: {
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
                    readonly stepId: {
                        readonly type: "string";
                    };
                    readonly stepType: {
                        readonly type: "string";
                    };
                    readonly tool: {
                        readonly type: "string";
                    };
                    readonly agentId: {
                        readonly type: "string";
                    };
                    readonly actorRole: {
                        readonly type: "string";
                        readonly enum: readonly ["viewer", "analyst", "operator", "admin", "system"];
                    };
                    readonly source: {
                        readonly type: "string";
                        readonly enum: readonly ["job", "step", "system"];
                    };
                    readonly data: {
                        readonly type: "object";
                    };
                };
            };
        };
        readonly activity: {
            readonly type: "object";
            readonly required: readonly ["summary", "recentCompletedRuns", "recentFailedRuns", "recurringJobs"];
            readonly properties: {
                readonly summary: {
                    readonly type: "object";
                    readonly required: readonly ["totalActiveJobs", "waitingApproval", "failed", "completed24h", "failed24h", "laneBreakdown"];
                    readonly properties: {
                        readonly totalActiveJobs: {
                            readonly type: "number";
                        };
                        readonly waitingApproval: {
                            readonly type: "number";
                        };
                        readonly failed: {
                            readonly type: "number";
                        };
                        readonly completed24h: {
                            readonly type: "number";
                        };
                        readonly failed24h: {
                            readonly type: "number";
                        };
                        readonly laneBreakdown: {
                            readonly type: "object";
                        };
                    };
                };
                readonly recentCompletedRuns: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly allOf: readonly [{
                            readonly type: "object";
                            readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                            readonly properties: {
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
                                readonly goal: {
                                    readonly type: "string";
                                };
                                readonly priority: {
                                    readonly type: "string";
                                };
                                readonly mode: {
                                    readonly type: "string";
                                };
                                readonly status: {
                                    readonly type: "string";
                                };
                                readonly approvalStatus: {
                                    readonly type: "string";
                                };
                                readonly riskLevel: {
                                    readonly type: "string";
                                };
                                readonly lane: {
                                    readonly type: "string";
                                };
                                readonly createdAt: {
                                    readonly type: "string";
                                };
                                readonly updatedAt: {
                                    readonly type: "string";
                                };
                                readonly currentStepId: {
                                    readonly type: "string";
                                };
                                readonly currentStepTitle: {
                                    readonly type: "string";
                                };
                                readonly currentStepType: {
                                    readonly type: "string";
                                };
                                readonly currentStepTool: {
                                    readonly type: "string";
                                };
                                readonly stepCount: {
                                    readonly type: "number";
                                };
                                readonly completedStepCount: {
                                    readonly type: "number";
                                };
                                readonly waitingApprovalStepCount: {
                                    readonly type: "number";
                                };
                                readonly failedStepCount: {
                                    readonly type: "number";
                                };
                                readonly retryableStepCount: {
                                    readonly type: "number";
                                };
                                readonly resultSummary: {
                                    readonly type: "string";
                                };
                                readonly error: {
                                    readonly type: "string";
                                };
                                readonly tags: {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                    };
                                };
                            };
                        }];
                        readonly properties: {
                            readonly hasLogs: {
                                readonly type: "boolean";
                            };
                            readonly hasMemoryUpdates: {
                                readonly type: "boolean";
                            };
                            readonly lastLogAt: {
                                readonly type: "string";
                            };
                            readonly approvalPreview: {
                                readonly type: "object";
                                readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
                                readonly properties: {
                                    readonly title: {
                                        readonly type: "string";
                                    };
                                    readonly body: {
                                        readonly type: "string";
                                    };
                                    readonly tool: {
                                        readonly type: "string";
                                    };
                                    readonly stepId: {
                                        readonly type: "string";
                                    };
                                    readonly stepType: {
                                        readonly type: "string";
                                    };
                                    readonly actionLabel: {
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
                readonly recentFailedRuns: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly allOf: readonly [{
                            readonly type: "object";
                            readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                            readonly properties: {
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
                                readonly goal: {
                                    readonly type: "string";
                                };
                                readonly priority: {
                                    readonly type: "string";
                                };
                                readonly mode: {
                                    readonly type: "string";
                                };
                                readonly status: {
                                    readonly type: "string";
                                };
                                readonly approvalStatus: {
                                    readonly type: "string";
                                };
                                readonly riskLevel: {
                                    readonly type: "string";
                                };
                                readonly lane: {
                                    readonly type: "string";
                                };
                                readonly createdAt: {
                                    readonly type: "string";
                                };
                                readonly updatedAt: {
                                    readonly type: "string";
                                };
                                readonly currentStepId: {
                                    readonly type: "string";
                                };
                                readonly currentStepTitle: {
                                    readonly type: "string";
                                };
                                readonly currentStepType: {
                                    readonly type: "string";
                                };
                                readonly currentStepTool: {
                                    readonly type: "string";
                                };
                                readonly stepCount: {
                                    readonly type: "number";
                                };
                                readonly completedStepCount: {
                                    readonly type: "number";
                                };
                                readonly waitingApprovalStepCount: {
                                    readonly type: "number";
                                };
                                readonly failedStepCount: {
                                    readonly type: "number";
                                };
                                readonly retryableStepCount: {
                                    readonly type: "number";
                                };
                                readonly resultSummary: {
                                    readonly type: "string";
                                };
                                readonly error: {
                                    readonly type: "string";
                                };
                                readonly tags: {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                    };
                                };
                            };
                        }];
                        readonly properties: {
                            readonly hasLogs: {
                                readonly type: "boolean";
                            };
                            readonly hasMemoryUpdates: {
                                readonly type: "boolean";
                            };
                            readonly lastLogAt: {
                                readonly type: "string";
                            };
                            readonly approvalPreview: {
                                readonly type: "object";
                                readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
                                readonly properties: {
                                    readonly title: {
                                        readonly type: "string";
                                    };
                                    readonly body: {
                                        readonly type: "string";
                                    };
                                    readonly tool: {
                                        readonly type: "string";
                                    };
                                    readonly stepId: {
                                        readonly type: "string";
                                    };
                                    readonly stepType: {
                                        readonly type: "string";
                                    };
                                    readonly actionLabel: {
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
                readonly recurringJobs: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["jobId", "product", "workflow", "title", "runAt", "status", "source"];
                        readonly properties: {
                            readonly jobId: {
                                readonly type: "string";
                            };
                            readonly product: {
                                readonly type: "string";
                            };
                            readonly workflow: {
                                readonly type: "string";
                            };
                            readonly title: {
                                readonly type: "string";
                            };
                            readonly stepId: {
                                readonly type: "string";
                            };
                            readonly runAt: {
                                readonly type: "string";
                            };
                            readonly status: {
                                readonly type: "string";
                            };
                            readonly detail: {
                                readonly type: "string";
                            };
                            readonly source: {
                                readonly type: "string";
                                readonly enum: readonly ["scheduler", "job-step", "goal-payload"];
                            };
                        };
                    };
                };
            };
        };
        readonly memory: {
            readonly type: "object";
            readonly required: readonly ["total", "editable", "byCategory", "byProduct", "recent"];
            readonly properties: {
                readonly total: {
                    readonly type: "number";
                };
                readonly editable: {
                    readonly type: "number";
                };
                readonly byCategory: {
                    readonly type: "object";
                };
                readonly byProduct: {
                    readonly type: "object";
                };
                readonly recent: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["id", "tenantId", "product", "category", "key", "value", "confidence", "editable", "createdAt", "updatedAt", "summary"];
                        readonly properties: {
                            readonly id: {
                                readonly type: "string";
                            };
                            readonly tenantId: {
                                readonly type: "string";
                            };
                            readonly product: {
                                readonly type: "string";
                            };
                            readonly category: {
                                readonly type: "string";
                            };
                            readonly key: {
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
                            readonly sourceJobId: {
                                readonly type: "string";
                            };
                            readonly sourceStepId: {
                                readonly type: "string";
                            };
                            readonly editable: {
                                readonly type: "boolean";
                            };
                            readonly createdAt: {
                                readonly type: "string";
                            };
                            readonly updatedAt: {
                                readonly type: "string";
                            };
                            readonly summary: {
                                readonly type: "string";
                            };
                            readonly sourceLabel: {
                                readonly type: "string";
                            };
                            readonly sourceStepLabel: {
                                readonly type: "string";
                            };
                            readonly auditTrail: {
                                readonly type: "array";
                                readonly items: {
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
                            };
                        };
                    };
                };
            };
        };
        readonly productCards: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["product", "title", "description", "primaryMetric", "secondaryMetrics", "activeJobs", "waitingApprovals", "alerts"];
                readonly properties: {
                    readonly product: {
                        readonly type: "string";
                    };
                    readonly title: {
                        readonly type: "string";
                    };
                    readonly description: {
                        readonly type: "string";
                    };
                    readonly primaryMetric: {
                        readonly type: "object";
                        readonly required: readonly ["label", "value", "tone"];
                        readonly properties: {
                            readonly label: {
                                readonly type: "string";
                            };
                            readonly value: {
                                readonly oneOf: readonly [{
                                    readonly type: "number";
                                }, {
                                    readonly type: "string";
                                }];
                            };
                            readonly detail: {
                                readonly type: "string";
                            };
                            readonly tone: {
                                readonly type: "string";
                                readonly enum: readonly ["neutral", "success", "warning", "danger", "accent"];
                            };
                            readonly trend: {
                                readonly type: "object";
                                readonly required: readonly ["direction", "value"];
                                readonly properties: {
                                    readonly direction: {
                                        readonly type: "string";
                                        readonly enum: readonly ["up", "down", "flat"];
                                    };
                                    readonly value: {
                                        readonly type: "number";
                                    };
                                    readonly label: {
                                        readonly type: "string";
                                    };
                                };
                            };
                        };
                    };
                    readonly secondaryMetrics: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly required: readonly ["label", "value", "tone"];
                            readonly properties: {
                                readonly label: {
                                    readonly type: "string";
                                };
                                readonly value: {
                                    readonly oneOf: readonly [{
                                        readonly type: "number";
                                    }, {
                                        readonly type: "string";
                                    }];
                                };
                                readonly detail: {
                                    readonly type: "string";
                                };
                                readonly tone: {
                                    readonly type: "string";
                                    readonly enum: readonly ["neutral", "success", "warning", "danger", "accent"];
                                };
                                readonly trend: {
                                    readonly type: "object";
                                    readonly required: readonly ["direction", "value"];
                                    readonly properties: {
                                        readonly direction: {
                                            readonly type: "string";
                                            readonly enum: readonly ["up", "down", "flat"];
                                        };
                                        readonly value: {
                                            readonly type: "number";
                                        };
                                        readonly label: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                            };
                        };
                    };
                    readonly activeJobs: {
                        readonly type: "number";
                    };
                    readonly waitingApprovals: {
                        readonly type: "number";
                    };
                    readonly alerts: {
                        readonly type: "number";
                    };
                    readonly lastActivityAt: {
                        readonly type: "string";
                    };
                };
            };
        };
    };
};
export declare const dashboardProductPanelBaseSchema: {
    readonly type: "object";
    readonly allOf: readonly [{
        readonly type: "object";
        readonly required: readonly ["kind", "version", "generatedAt", "filters"];
        readonly properties: {
            readonly kind: {
                readonly type: "string";
            };
            readonly version: {
                readonly type: "string";
                readonly enum: readonly ["stage-5"];
            };
            readonly generatedAt: {
                readonly type: "string";
            };
            readonly tenantId: {
                readonly type: "string";
            };
            readonly filters: {
                readonly type: "object";
                readonly properties: {
                    readonly tenantId: {
                        readonly type: "string";
                    };
                    readonly product: {
                        readonly type: "string";
                    };
                    readonly workflow: {
                        readonly type: "string";
                    };
                    readonly jobId: {
                        readonly type: "string";
                    };
                    readonly caseId: {
                        readonly type: "string";
                    };
                    readonly status: {
                        readonly oneOf: readonly [{
                            readonly type: "string";
                        }, {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        }];
                    };
                    readonly approvalStatus: {
                        readonly oneOf: readonly [{
                            readonly type: "string";
                        }, {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        }];
                    };
                    readonly page: {
                        readonly type: "number";
                    };
                    readonly pageSize: {
                        readonly type: "number";
                    };
                    readonly search: {
                        readonly type: "string";
                    };
                    readonly sortBy: {
                        readonly type: "string";
                        readonly enum: readonly ["createdAt", "updatedAt", "status", "product", "priority"];
                    };
                    readonly sortDirection: {
                        readonly type: "string";
                        readonly enum: readonly ["asc", "desc"];
                    };
                    readonly from: {
                        readonly type: "string";
                    };
                    readonly to: {
                        readonly type: "string";
                    };
                    readonly lane: {
                        readonly type: "string";
                        readonly enum: readonly ["internal", "external", "mixed"];
                    };
                };
            };
        };
    }];
    readonly required: readonly ["kind", "product", "title", "summary", "recentJobs", "alerts", "recentMemory"];
    readonly properties: {
        readonly kind: {
            readonly type: "string";
            readonly enum: readonly ["product-panel"];
        };
        readonly product: {
            readonly type: "string";
        };
        readonly title: {
            readonly type: "string";
        };
        readonly summary: {
            readonly type: "object";
            readonly required: readonly ["title", "description", "primaryMetric", "secondaryMetrics"];
            readonly properties: {
                readonly title: {
                    readonly type: "string";
                };
                readonly description: {
                    readonly type: "string";
                };
                readonly primaryMetric: {
                    readonly type: "object";
                    readonly required: readonly ["label", "value", "tone"];
                    readonly properties: {
                        readonly label: {
                            readonly type: "string";
                        };
                        readonly value: {
                            readonly oneOf: readonly [{
                                readonly type: "number";
                            }, {
                                readonly type: "string";
                            }];
                        };
                        readonly detail: {
                            readonly type: "string";
                        };
                        readonly tone: {
                            readonly type: "string";
                            readonly enum: readonly ["neutral", "success", "warning", "danger", "accent"];
                        };
                        readonly trend: {
                            readonly type: "object";
                            readonly required: readonly ["direction", "value"];
                            readonly properties: {
                                readonly direction: {
                                    readonly type: "string";
                                    readonly enum: readonly ["up", "down", "flat"];
                                };
                                readonly value: {
                                    readonly type: "number";
                                };
                                readonly label: {
                                    readonly type: "string";
                                };
                            };
                        };
                    };
                };
                readonly secondaryMetrics: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["label", "value", "tone"];
                        readonly properties: {
                            readonly label: {
                                readonly type: "string";
                            };
                            readonly value: {
                                readonly oneOf: readonly [{
                                    readonly type: "number";
                                }, {
                                    readonly type: "string";
                                }];
                            };
                            readonly detail: {
                                readonly type: "string";
                            };
                            readonly tone: {
                                readonly type: "string";
                                readonly enum: readonly ["neutral", "success", "warning", "danger", "accent"];
                            };
                            readonly trend: {
                                readonly type: "object";
                                readonly required: readonly ["direction", "value"];
                                readonly properties: {
                                    readonly direction: {
                                        readonly type: "string";
                                        readonly enum: readonly ["up", "down", "flat"];
                                    };
                                    readonly value: {
                                        readonly type: "number";
                                    };
                                    readonly label: {
                                        readonly type: "string";
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        readonly recentJobs: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly allOf: readonly [{
                    readonly type: "object";
                    readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                    readonly properties: {
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
                        readonly goal: {
                            readonly type: "string";
                        };
                        readonly priority: {
                            readonly type: "string";
                        };
                        readonly mode: {
                            readonly type: "string";
                        };
                        readonly status: {
                            readonly type: "string";
                        };
                        readonly approvalStatus: {
                            readonly type: "string";
                        };
                        readonly riskLevel: {
                            readonly type: "string";
                        };
                        readonly lane: {
                            readonly type: "string";
                        };
                        readonly createdAt: {
                            readonly type: "string";
                        };
                        readonly updatedAt: {
                            readonly type: "string";
                        };
                        readonly currentStepId: {
                            readonly type: "string";
                        };
                        readonly currentStepTitle: {
                            readonly type: "string";
                        };
                        readonly currentStepType: {
                            readonly type: "string";
                        };
                        readonly currentStepTool: {
                            readonly type: "string";
                        };
                        readonly stepCount: {
                            readonly type: "number";
                        };
                        readonly completedStepCount: {
                            readonly type: "number";
                        };
                        readonly waitingApprovalStepCount: {
                            readonly type: "number";
                        };
                        readonly failedStepCount: {
                            readonly type: "number";
                        };
                        readonly retryableStepCount: {
                            readonly type: "number";
                        };
                        readonly resultSummary: {
                            readonly type: "string";
                        };
                        readonly error: {
                            readonly type: "string";
                        };
                        readonly tags: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        };
                    };
                }];
                readonly properties: {
                    readonly hasLogs: {
                        readonly type: "boolean";
                    };
                    readonly hasMemoryUpdates: {
                        readonly type: "boolean";
                    };
                    readonly lastLogAt: {
                        readonly type: "string";
                    };
                    readonly approvalPreview: {
                        readonly type: "object";
                        readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
                        readonly properties: {
                            readonly title: {
                                readonly type: "string";
                            };
                            readonly body: {
                                readonly type: "string";
                            };
                            readonly tool: {
                                readonly type: "string";
                            };
                            readonly stepId: {
                                readonly type: "string";
                            };
                            readonly stepType: {
                                readonly type: "string";
                            };
                            readonly actionLabel: {
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
        readonly alerts: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["id", "level", "title", "message", "createdAt", "metadata"];
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                    };
                    readonly level: {
                        readonly type: "string";
                        readonly enum: readonly ["info", "success", "warning", "critical"];
                    };
                    readonly title: {
                        readonly type: "string";
                    };
                    readonly message: {
                        readonly type: "string";
                    };
                    readonly createdAt: {
                        readonly type: "string";
                    };
                    readonly relatedJobId: {
                        readonly type: "string";
                    };
                    readonly relatedProduct: {
                        readonly type: "string";
                    };
                    readonly actionLabel: {
                        readonly type: "string";
                    };
                    readonly actionHref: {
                        readonly type: "string";
                    };
                    readonly metadata: {
                        readonly type: "object";
                    };
                };
            };
        };
        readonly recentMemory: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["id", "tenantId", "product", "category", "key", "value", "confidence", "editable", "createdAt", "updatedAt", "summary"];
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                    };
                    readonly tenantId: {
                        readonly type: "string";
                    };
                    readonly product: {
                        readonly type: "string";
                    };
                    readonly category: {
                        readonly type: "string";
                    };
                    readonly key: {
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
                    readonly sourceJobId: {
                        readonly type: "string";
                    };
                    readonly sourceStepId: {
                        readonly type: "string";
                    };
                    readonly editable: {
                        readonly type: "boolean";
                    };
                    readonly createdAt: {
                        readonly type: "string";
                    };
                    readonly updatedAt: {
                        readonly type: "string";
                    };
                    readonly summary: {
                        readonly type: "string";
                    };
                    readonly sourceLabel: {
                        readonly type: "string";
                    };
                    readonly sourceStepLabel: {
                        readonly type: "string";
                    };
                    readonly auditTrail: {
                        readonly type: "array";
                        readonly items: {
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
                    };
                };
            };
        };
    };
};
export declare const dashboardLeadRecoveryPanelResponseSchema: {
    readonly type: "object";
    readonly allOf: readonly [{
        readonly type: "object";
        readonly allOf: readonly [{
            readonly type: "object";
            readonly required: readonly ["kind", "version", "generatedAt", "filters"];
            readonly properties: {
                readonly kind: {
                    readonly type: "string";
                };
                readonly version: {
                    readonly type: "string";
                    readonly enum: readonly ["stage-5"];
                };
                readonly generatedAt: {
                    readonly type: "string";
                };
                readonly tenantId: {
                    readonly type: "string";
                };
                readonly filters: {
                    readonly type: "object";
                    readonly properties: {
                        readonly tenantId: {
                            readonly type: "string";
                        };
                        readonly product: {
                            readonly type: "string";
                        };
                        readonly workflow: {
                            readonly type: "string";
                        };
                        readonly jobId: {
                            readonly type: "string";
                        };
                        readonly caseId: {
                            readonly type: "string";
                        };
                        readonly status: {
                            readonly oneOf: readonly [{
                                readonly type: "string";
                            }, {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                };
                            }];
                        };
                        readonly approvalStatus: {
                            readonly oneOf: readonly [{
                                readonly type: "string";
                            }, {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                };
                            }];
                        };
                        readonly page: {
                            readonly type: "number";
                        };
                        readonly pageSize: {
                            readonly type: "number";
                        };
                        readonly search: {
                            readonly type: "string";
                        };
                        readonly sortBy: {
                            readonly type: "string";
                            readonly enum: readonly ["createdAt", "updatedAt", "status", "product", "priority"];
                        };
                        readonly sortDirection: {
                            readonly type: "string";
                            readonly enum: readonly ["asc", "desc"];
                        };
                        readonly from: {
                            readonly type: "string";
                        };
                        readonly to: {
                            readonly type: "string";
                        };
                        readonly lane: {
                            readonly type: "string";
                            readonly enum: readonly ["internal", "external", "mixed"];
                        };
                    };
                };
            };
        }];
        readonly required: readonly ["kind", "product", "title", "summary", "recentJobs", "alerts", "recentMemory"];
        readonly properties: {
            readonly kind: {
                readonly type: "string";
                readonly enum: readonly ["product-panel"];
            };
            readonly product: {
                readonly type: "string";
            };
            readonly title: {
                readonly type: "string";
            };
            readonly summary: {
                readonly type: "object";
                readonly required: readonly ["title", "description", "primaryMetric", "secondaryMetrics"];
                readonly properties: {
                    readonly title: {
                        readonly type: "string";
                    };
                    readonly description: {
                        readonly type: "string";
                    };
                    readonly primaryMetric: {
                        readonly type: "object";
                        readonly required: readonly ["label", "value", "tone"];
                        readonly properties: {
                            readonly label: {
                                readonly type: "string";
                            };
                            readonly value: {
                                readonly oneOf: readonly [{
                                    readonly type: "number";
                                }, {
                                    readonly type: "string";
                                }];
                            };
                            readonly detail: {
                                readonly type: "string";
                            };
                            readonly tone: {
                                readonly type: "string";
                                readonly enum: readonly ["neutral", "success", "warning", "danger", "accent"];
                            };
                            readonly trend: {
                                readonly type: "object";
                                readonly required: readonly ["direction", "value"];
                                readonly properties: {
                                    readonly direction: {
                                        readonly type: "string";
                                        readonly enum: readonly ["up", "down", "flat"];
                                    };
                                    readonly value: {
                                        readonly type: "number";
                                    };
                                    readonly label: {
                                        readonly type: "string";
                                    };
                                };
                            };
                        };
                    };
                    readonly secondaryMetrics: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly required: readonly ["label", "value", "tone"];
                            readonly properties: {
                                readonly label: {
                                    readonly type: "string";
                                };
                                readonly value: {
                                    readonly oneOf: readonly [{
                                        readonly type: "number";
                                    }, {
                                        readonly type: "string";
                                    }];
                                };
                                readonly detail: {
                                    readonly type: "string";
                                };
                                readonly tone: {
                                    readonly type: "string";
                                    readonly enum: readonly ["neutral", "success", "warning", "danger", "accent"];
                                };
                                readonly trend: {
                                    readonly type: "object";
                                    readonly required: readonly ["direction", "value"];
                                    readonly properties: {
                                        readonly direction: {
                                            readonly type: "string";
                                            readonly enum: readonly ["up", "down", "flat"];
                                        };
                                        readonly value: {
                                            readonly type: "number";
                                        };
                                        readonly label: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
            readonly recentJobs: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly allOf: readonly [{
                        readonly type: "object";
                        readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                        readonly properties: {
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
                            readonly goal: {
                                readonly type: "string";
                            };
                            readonly priority: {
                                readonly type: "string";
                            };
                            readonly mode: {
                                readonly type: "string";
                            };
                            readonly status: {
                                readonly type: "string";
                            };
                            readonly approvalStatus: {
                                readonly type: "string";
                            };
                            readonly riskLevel: {
                                readonly type: "string";
                            };
                            readonly lane: {
                                readonly type: "string";
                            };
                            readonly createdAt: {
                                readonly type: "string";
                            };
                            readonly updatedAt: {
                                readonly type: "string";
                            };
                            readonly currentStepId: {
                                readonly type: "string";
                            };
                            readonly currentStepTitle: {
                                readonly type: "string";
                            };
                            readonly currentStepType: {
                                readonly type: "string";
                            };
                            readonly currentStepTool: {
                                readonly type: "string";
                            };
                            readonly stepCount: {
                                readonly type: "number";
                            };
                            readonly completedStepCount: {
                                readonly type: "number";
                            };
                            readonly waitingApprovalStepCount: {
                                readonly type: "number";
                            };
                            readonly failedStepCount: {
                                readonly type: "number";
                            };
                            readonly retryableStepCount: {
                                readonly type: "number";
                            };
                            readonly resultSummary: {
                                readonly type: "string";
                            };
                            readonly error: {
                                readonly type: "string";
                            };
                            readonly tags: {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                };
                            };
                        };
                    }];
                    readonly properties: {
                        readonly hasLogs: {
                            readonly type: "boolean";
                        };
                        readonly hasMemoryUpdates: {
                            readonly type: "boolean";
                        };
                        readonly lastLogAt: {
                            readonly type: "string";
                        };
                        readonly approvalPreview: {
                            readonly type: "object";
                            readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
                            readonly properties: {
                                readonly title: {
                                    readonly type: "string";
                                };
                                readonly body: {
                                    readonly type: "string";
                                };
                                readonly tool: {
                                    readonly type: "string";
                                };
                                readonly stepId: {
                                    readonly type: "string";
                                };
                                readonly stepType: {
                                    readonly type: "string";
                                };
                                readonly actionLabel: {
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
            readonly alerts: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly required: readonly ["id", "level", "title", "message", "createdAt", "metadata"];
                    readonly properties: {
                        readonly id: {
                            readonly type: "string";
                        };
                        readonly level: {
                            readonly type: "string";
                            readonly enum: readonly ["info", "success", "warning", "critical"];
                        };
                        readonly title: {
                            readonly type: "string";
                        };
                        readonly message: {
                            readonly type: "string";
                        };
                        readonly createdAt: {
                            readonly type: "string";
                        };
                        readonly relatedJobId: {
                            readonly type: "string";
                        };
                        readonly relatedProduct: {
                            readonly type: "string";
                        };
                        readonly actionLabel: {
                            readonly type: "string";
                        };
                        readonly actionHref: {
                            readonly type: "string";
                        };
                        readonly metadata: {
                            readonly type: "object";
                        };
                    };
                };
            };
            readonly recentMemory: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly required: readonly ["id", "tenantId", "product", "category", "key", "value", "confidence", "editable", "createdAt", "updatedAt", "summary"];
                    readonly properties: {
                        readonly id: {
                            readonly type: "string";
                        };
                        readonly tenantId: {
                            readonly type: "string";
                        };
                        readonly product: {
                            readonly type: "string";
                        };
                        readonly category: {
                            readonly type: "string";
                        };
                        readonly key: {
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
                        readonly sourceJobId: {
                            readonly type: "string";
                        };
                        readonly sourceStepId: {
                            readonly type: "string";
                        };
                        readonly editable: {
                            readonly type: "boolean";
                        };
                        readonly createdAt: {
                            readonly type: "string";
                        };
                        readonly updatedAt: {
                            readonly type: "string";
                        };
                        readonly summary: {
                            readonly type: "string";
                        };
                        readonly sourceLabel: {
                            readonly type: "string";
                        };
                        readonly sourceStepLabel: {
                            readonly type: "string";
                        };
                        readonly auditTrail: {
                            readonly type: "array";
                            readonly items: {
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
                        };
                    };
                };
            };
        };
    }];
    readonly properties: {
        readonly product: {
            readonly type: "string";
            readonly enum: readonly ["lead-recovery"];
        };
        readonly resultSummary: {
            readonly type: "object";
        };
        readonly leadSummary: {
            readonly type: "object";
        };
        readonly recentResults: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
        readonly approvalItems: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly allOf: readonly [{
                    readonly type: "object";
                    readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                    readonly properties: {
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
                        readonly goal: {
                            readonly type: "string";
                        };
                        readonly priority: {
                            readonly type: "string";
                        };
                        readonly mode: {
                            readonly type: "string";
                        };
                        readonly status: {
                            readonly type: "string";
                        };
                        readonly approvalStatus: {
                            readonly type: "string";
                        };
                        readonly riskLevel: {
                            readonly type: "string";
                        };
                        readonly lane: {
                            readonly type: "string";
                        };
                        readonly createdAt: {
                            readonly type: "string";
                        };
                        readonly updatedAt: {
                            readonly type: "string";
                        };
                        readonly currentStepId: {
                            readonly type: "string";
                        };
                        readonly currentStepTitle: {
                            readonly type: "string";
                        };
                        readonly currentStepType: {
                            readonly type: "string";
                        };
                        readonly currentStepTool: {
                            readonly type: "string";
                        };
                        readonly stepCount: {
                            readonly type: "number";
                        };
                        readonly completedStepCount: {
                            readonly type: "number";
                        };
                        readonly waitingApprovalStepCount: {
                            readonly type: "number";
                        };
                        readonly failedStepCount: {
                            readonly type: "number";
                        };
                        readonly retryableStepCount: {
                            readonly type: "number";
                        };
                        readonly resultSummary: {
                            readonly type: "string";
                        };
                        readonly error: {
                            readonly type: "string";
                        };
                        readonly tags: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        };
                    };
                }];
                readonly required: readonly ["stepId", "stepType", "stepTitle", "tool", "reason", "preview", "canApprove", "canReject", "canEdit", "retryable"];
                readonly properties: {
                    readonly stepId: {
                        readonly type: "string";
                    };
                    readonly stepType: {
                        readonly type: "string";
                    };
                    readonly stepTitle: {
                        readonly type: "string";
                    };
                    readonly tool: {
                        readonly type: "string";
                    };
                    readonly reason: {
                        readonly type: "string";
                    };
                    readonly preview: {
                        readonly type: "object";
                        readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
                        readonly properties: {
                            readonly title: {
                                readonly type: "string";
                            };
                            readonly body: {
                                readonly type: "string";
                            };
                            readonly tool: {
                                readonly type: "string";
                            };
                            readonly stepId: {
                                readonly type: "string";
                            };
                            readonly stepType: {
                                readonly type: "string";
                            };
                            readonly actionLabel: {
                                readonly type: "string";
                            };
                            readonly data: {
                                readonly type: "object";
                            };
                        };
                    };
                    readonly canApprove: {
                        readonly type: "boolean";
                    };
                    readonly canReject: {
                        readonly type: "boolean";
                    };
                    readonly canEdit: {
                        readonly type: "boolean";
                    };
                    readonly retryable: {
                        readonly type: "boolean";
                    };
                };
            };
        };
        readonly suppressionSummary: {
            readonly type: "object";
        };
        readonly recentLeads: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
        readonly recentInteractions: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
        readonly recentCallEvents: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
        readonly messageTemplates: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
    };
};
export declare const dashboardNexusBuildPanelResponseSchema: {
    readonly type: "object";
    readonly allOf: readonly [{
        readonly type: "object";
        readonly allOf: readonly [{
            readonly type: "object";
            readonly required: readonly ["kind", "version", "generatedAt", "filters"];
            readonly properties: {
                readonly kind: {
                    readonly type: "string";
                };
                readonly version: {
                    readonly type: "string";
                    readonly enum: readonly ["stage-5"];
                };
                readonly generatedAt: {
                    readonly type: "string";
                };
                readonly tenantId: {
                    readonly type: "string";
                };
                readonly filters: {
                    readonly type: "object";
                    readonly properties: {
                        readonly tenantId: {
                            readonly type: "string";
                        };
                        readonly product: {
                            readonly type: "string";
                        };
                        readonly workflow: {
                            readonly type: "string";
                        };
                        readonly jobId: {
                            readonly type: "string";
                        };
                        readonly caseId: {
                            readonly type: "string";
                        };
                        readonly status: {
                            readonly oneOf: readonly [{
                                readonly type: "string";
                            }, {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                };
                            }];
                        };
                        readonly approvalStatus: {
                            readonly oneOf: readonly [{
                                readonly type: "string";
                            }, {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                };
                            }];
                        };
                        readonly page: {
                            readonly type: "number";
                        };
                        readonly pageSize: {
                            readonly type: "number";
                        };
                        readonly search: {
                            readonly type: "string";
                        };
                        readonly sortBy: {
                            readonly type: "string";
                            readonly enum: readonly ["createdAt", "updatedAt", "status", "product", "priority"];
                        };
                        readonly sortDirection: {
                            readonly type: "string";
                            readonly enum: readonly ["asc", "desc"];
                        };
                        readonly from: {
                            readonly type: "string";
                        };
                        readonly to: {
                            readonly type: "string";
                        };
                        readonly lane: {
                            readonly type: "string";
                            readonly enum: readonly ["internal", "external", "mixed"];
                        };
                    };
                };
            };
        }];
        readonly required: readonly ["kind", "product", "title", "summary", "recentJobs", "alerts", "recentMemory"];
        readonly properties: {
            readonly kind: {
                readonly type: "string";
                readonly enum: readonly ["product-panel"];
            };
            readonly product: {
                readonly type: "string";
            };
            readonly title: {
                readonly type: "string";
            };
            readonly summary: {
                readonly type: "object";
                readonly required: readonly ["title", "description", "primaryMetric", "secondaryMetrics"];
                readonly properties: {
                    readonly title: {
                        readonly type: "string";
                    };
                    readonly description: {
                        readonly type: "string";
                    };
                    readonly primaryMetric: {
                        readonly type: "object";
                        readonly required: readonly ["label", "value", "tone"];
                        readonly properties: {
                            readonly label: {
                                readonly type: "string";
                            };
                            readonly value: {
                                readonly oneOf: readonly [{
                                    readonly type: "number";
                                }, {
                                    readonly type: "string";
                                }];
                            };
                            readonly detail: {
                                readonly type: "string";
                            };
                            readonly tone: {
                                readonly type: "string";
                                readonly enum: readonly ["neutral", "success", "warning", "danger", "accent"];
                            };
                            readonly trend: {
                                readonly type: "object";
                                readonly required: readonly ["direction", "value"];
                                readonly properties: {
                                    readonly direction: {
                                        readonly type: "string";
                                        readonly enum: readonly ["up", "down", "flat"];
                                    };
                                    readonly value: {
                                        readonly type: "number";
                                    };
                                    readonly label: {
                                        readonly type: "string";
                                    };
                                };
                            };
                        };
                    };
                    readonly secondaryMetrics: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly required: readonly ["label", "value", "tone"];
                            readonly properties: {
                                readonly label: {
                                    readonly type: "string";
                                };
                                readonly value: {
                                    readonly oneOf: readonly [{
                                        readonly type: "number";
                                    }, {
                                        readonly type: "string";
                                    }];
                                };
                                readonly detail: {
                                    readonly type: "string";
                                };
                                readonly tone: {
                                    readonly type: "string";
                                    readonly enum: readonly ["neutral", "success", "warning", "danger", "accent"];
                                };
                                readonly trend: {
                                    readonly type: "object";
                                    readonly required: readonly ["direction", "value"];
                                    readonly properties: {
                                        readonly direction: {
                                            readonly type: "string";
                                            readonly enum: readonly ["up", "down", "flat"];
                                        };
                                        readonly value: {
                                            readonly type: "number";
                                        };
                                        readonly label: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
            readonly recentJobs: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly allOf: readonly [{
                        readonly type: "object";
                        readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                        readonly properties: {
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
                            readonly goal: {
                                readonly type: "string";
                            };
                            readonly priority: {
                                readonly type: "string";
                            };
                            readonly mode: {
                                readonly type: "string";
                            };
                            readonly status: {
                                readonly type: "string";
                            };
                            readonly approvalStatus: {
                                readonly type: "string";
                            };
                            readonly riskLevel: {
                                readonly type: "string";
                            };
                            readonly lane: {
                                readonly type: "string";
                            };
                            readonly createdAt: {
                                readonly type: "string";
                            };
                            readonly updatedAt: {
                                readonly type: "string";
                            };
                            readonly currentStepId: {
                                readonly type: "string";
                            };
                            readonly currentStepTitle: {
                                readonly type: "string";
                            };
                            readonly currentStepType: {
                                readonly type: "string";
                            };
                            readonly currentStepTool: {
                                readonly type: "string";
                            };
                            readonly stepCount: {
                                readonly type: "number";
                            };
                            readonly completedStepCount: {
                                readonly type: "number";
                            };
                            readonly waitingApprovalStepCount: {
                                readonly type: "number";
                            };
                            readonly failedStepCount: {
                                readonly type: "number";
                            };
                            readonly retryableStepCount: {
                                readonly type: "number";
                            };
                            readonly resultSummary: {
                                readonly type: "string";
                            };
                            readonly error: {
                                readonly type: "string";
                            };
                            readonly tags: {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                };
                            };
                        };
                    }];
                    readonly properties: {
                        readonly hasLogs: {
                            readonly type: "boolean";
                        };
                        readonly hasMemoryUpdates: {
                            readonly type: "boolean";
                        };
                        readonly lastLogAt: {
                            readonly type: "string";
                        };
                        readonly approvalPreview: {
                            readonly type: "object";
                            readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
                            readonly properties: {
                                readonly title: {
                                    readonly type: "string";
                                };
                                readonly body: {
                                    readonly type: "string";
                                };
                                readonly tool: {
                                    readonly type: "string";
                                };
                                readonly stepId: {
                                    readonly type: "string";
                                };
                                readonly stepType: {
                                    readonly type: "string";
                                };
                                readonly actionLabel: {
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
            readonly alerts: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly required: readonly ["id", "level", "title", "message", "createdAt", "metadata"];
                    readonly properties: {
                        readonly id: {
                            readonly type: "string";
                        };
                        readonly level: {
                            readonly type: "string";
                            readonly enum: readonly ["info", "success", "warning", "critical"];
                        };
                        readonly title: {
                            readonly type: "string";
                        };
                        readonly message: {
                            readonly type: "string";
                        };
                        readonly createdAt: {
                            readonly type: "string";
                        };
                        readonly relatedJobId: {
                            readonly type: "string";
                        };
                        readonly relatedProduct: {
                            readonly type: "string";
                        };
                        readonly actionLabel: {
                            readonly type: "string";
                        };
                        readonly actionHref: {
                            readonly type: "string";
                        };
                        readonly metadata: {
                            readonly type: "object";
                        };
                    };
                };
            };
            readonly recentMemory: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly required: readonly ["id", "tenantId", "product", "category", "key", "value", "confidence", "editable", "createdAt", "updatedAt", "summary"];
                    readonly properties: {
                        readonly id: {
                            readonly type: "string";
                        };
                        readonly tenantId: {
                            readonly type: "string";
                        };
                        readonly product: {
                            readonly type: "string";
                        };
                        readonly category: {
                            readonly type: "string";
                        };
                        readonly key: {
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
                        readonly sourceJobId: {
                            readonly type: "string";
                        };
                        readonly sourceStepId: {
                            readonly type: "string";
                        };
                        readonly editable: {
                            readonly type: "boolean";
                        };
                        readonly createdAt: {
                            readonly type: "string";
                        };
                        readonly updatedAt: {
                            readonly type: "string";
                        };
                        readonly summary: {
                            readonly type: "string";
                        };
                        readonly sourceLabel: {
                            readonly type: "string";
                        };
                        readonly sourceStepLabel: {
                            readonly type: "string";
                        };
                        readonly auditTrail: {
                            readonly type: "array";
                            readonly items: {
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
                        };
                    };
                };
            };
        };
    }];
    readonly properties: {
        readonly product: {
            readonly type: "string";
            readonly enum: readonly ["nexusbuild"];
        };
        readonly buildSummary: {
            readonly type: "object";
        };
        readonly compatibilitySummary: {
            readonly type: "object";
        };
        readonly pricingSummary: {
            readonly type: "object";
        };
        readonly savedBuilds: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
        readonly latestReports: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
        readonly latestRecommendationRuns: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
        readonly latestReport: {
            readonly type: "object";
        };
    };
};
export declare const dashboardProvLyPanelResponseSchema: {
    readonly type: "object";
    readonly allOf: readonly [{
        readonly type: "object";
        readonly allOf: readonly [{
            readonly type: "object";
            readonly required: readonly ["kind", "version", "generatedAt", "filters"];
            readonly properties: {
                readonly kind: {
                    readonly type: "string";
                };
                readonly version: {
                    readonly type: "string";
                    readonly enum: readonly ["stage-5"];
                };
                readonly generatedAt: {
                    readonly type: "string";
                };
                readonly tenantId: {
                    readonly type: "string";
                };
                readonly filters: {
                    readonly type: "object";
                    readonly properties: {
                        readonly tenantId: {
                            readonly type: "string";
                        };
                        readonly product: {
                            readonly type: "string";
                        };
                        readonly workflow: {
                            readonly type: "string";
                        };
                        readonly jobId: {
                            readonly type: "string";
                        };
                        readonly caseId: {
                            readonly type: "string";
                        };
                        readonly status: {
                            readonly oneOf: readonly [{
                                readonly type: "string";
                            }, {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                };
                            }];
                        };
                        readonly approvalStatus: {
                            readonly oneOf: readonly [{
                                readonly type: "string";
                            }, {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                };
                            }];
                        };
                        readonly page: {
                            readonly type: "number";
                        };
                        readonly pageSize: {
                            readonly type: "number";
                        };
                        readonly search: {
                            readonly type: "string";
                        };
                        readonly sortBy: {
                            readonly type: "string";
                            readonly enum: readonly ["createdAt", "updatedAt", "status", "product", "priority"];
                        };
                        readonly sortDirection: {
                            readonly type: "string";
                            readonly enum: readonly ["asc", "desc"];
                        };
                        readonly from: {
                            readonly type: "string";
                        };
                        readonly to: {
                            readonly type: "string";
                        };
                        readonly lane: {
                            readonly type: "string";
                            readonly enum: readonly ["internal", "external", "mixed"];
                        };
                    };
                };
            };
        }];
        readonly required: readonly ["kind", "product", "title", "summary", "recentJobs", "alerts", "recentMemory"];
        readonly properties: {
            readonly kind: {
                readonly type: "string";
                readonly enum: readonly ["product-panel"];
            };
            readonly product: {
                readonly type: "string";
            };
            readonly title: {
                readonly type: "string";
            };
            readonly summary: {
                readonly type: "object";
                readonly required: readonly ["title", "description", "primaryMetric", "secondaryMetrics"];
                readonly properties: {
                    readonly title: {
                        readonly type: "string";
                    };
                    readonly description: {
                        readonly type: "string";
                    };
                    readonly primaryMetric: {
                        readonly type: "object";
                        readonly required: readonly ["label", "value", "tone"];
                        readonly properties: {
                            readonly label: {
                                readonly type: "string";
                            };
                            readonly value: {
                                readonly oneOf: readonly [{
                                    readonly type: "number";
                                }, {
                                    readonly type: "string";
                                }];
                            };
                            readonly detail: {
                                readonly type: "string";
                            };
                            readonly tone: {
                                readonly type: "string";
                                readonly enum: readonly ["neutral", "success", "warning", "danger", "accent"];
                            };
                            readonly trend: {
                                readonly type: "object";
                                readonly required: readonly ["direction", "value"];
                                readonly properties: {
                                    readonly direction: {
                                        readonly type: "string";
                                        readonly enum: readonly ["up", "down", "flat"];
                                    };
                                    readonly value: {
                                        readonly type: "number";
                                    };
                                    readonly label: {
                                        readonly type: "string";
                                    };
                                };
                            };
                        };
                    };
                    readonly secondaryMetrics: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly required: readonly ["label", "value", "tone"];
                            readonly properties: {
                                readonly label: {
                                    readonly type: "string";
                                };
                                readonly value: {
                                    readonly oneOf: readonly [{
                                        readonly type: "number";
                                    }, {
                                        readonly type: "string";
                                    }];
                                };
                                readonly detail: {
                                    readonly type: "string";
                                };
                                readonly tone: {
                                    readonly type: "string";
                                    readonly enum: readonly ["neutral", "success", "warning", "danger", "accent"];
                                };
                                readonly trend: {
                                    readonly type: "object";
                                    readonly required: readonly ["direction", "value"];
                                    readonly properties: {
                                        readonly direction: {
                                            readonly type: "string";
                                            readonly enum: readonly ["up", "down", "flat"];
                                        };
                                        readonly value: {
                                            readonly type: "number";
                                        };
                                        readonly label: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
            readonly recentJobs: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly allOf: readonly [{
                        readonly type: "object";
                        readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                        readonly properties: {
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
                            readonly goal: {
                                readonly type: "string";
                            };
                            readonly priority: {
                                readonly type: "string";
                            };
                            readonly mode: {
                                readonly type: "string";
                            };
                            readonly status: {
                                readonly type: "string";
                            };
                            readonly approvalStatus: {
                                readonly type: "string";
                            };
                            readonly riskLevel: {
                                readonly type: "string";
                            };
                            readonly lane: {
                                readonly type: "string";
                            };
                            readonly createdAt: {
                                readonly type: "string";
                            };
                            readonly updatedAt: {
                                readonly type: "string";
                            };
                            readonly currentStepId: {
                                readonly type: "string";
                            };
                            readonly currentStepTitle: {
                                readonly type: "string";
                            };
                            readonly currentStepType: {
                                readonly type: "string";
                            };
                            readonly currentStepTool: {
                                readonly type: "string";
                            };
                            readonly stepCount: {
                                readonly type: "number";
                            };
                            readonly completedStepCount: {
                                readonly type: "number";
                            };
                            readonly waitingApprovalStepCount: {
                                readonly type: "number";
                            };
                            readonly failedStepCount: {
                                readonly type: "number";
                            };
                            readonly retryableStepCount: {
                                readonly type: "number";
                            };
                            readonly resultSummary: {
                                readonly type: "string";
                            };
                            readonly error: {
                                readonly type: "string";
                            };
                            readonly tags: {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                };
                            };
                        };
                    }];
                    readonly properties: {
                        readonly hasLogs: {
                            readonly type: "boolean";
                        };
                        readonly hasMemoryUpdates: {
                            readonly type: "boolean";
                        };
                        readonly lastLogAt: {
                            readonly type: "string";
                        };
                        readonly approvalPreview: {
                            readonly type: "object";
                            readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
                            readonly properties: {
                                readonly title: {
                                    readonly type: "string";
                                };
                                readonly body: {
                                    readonly type: "string";
                                };
                                readonly tool: {
                                    readonly type: "string";
                                };
                                readonly stepId: {
                                    readonly type: "string";
                                };
                                readonly stepType: {
                                    readonly type: "string";
                                };
                                readonly actionLabel: {
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
            readonly alerts: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly required: readonly ["id", "level", "title", "message", "createdAt", "metadata"];
                    readonly properties: {
                        readonly id: {
                            readonly type: "string";
                        };
                        readonly level: {
                            readonly type: "string";
                            readonly enum: readonly ["info", "success", "warning", "critical"];
                        };
                        readonly title: {
                            readonly type: "string";
                        };
                        readonly message: {
                            readonly type: "string";
                        };
                        readonly createdAt: {
                            readonly type: "string";
                        };
                        readonly relatedJobId: {
                            readonly type: "string";
                        };
                        readonly relatedProduct: {
                            readonly type: "string";
                        };
                        readonly actionLabel: {
                            readonly type: "string";
                        };
                        readonly actionHref: {
                            readonly type: "string";
                        };
                        readonly metadata: {
                            readonly type: "object";
                        };
                    };
                };
            };
            readonly recentMemory: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly required: readonly ["id", "tenantId", "product", "category", "key", "value", "confidence", "editable", "createdAt", "updatedAt", "summary"];
                    readonly properties: {
                        readonly id: {
                            readonly type: "string";
                        };
                        readonly tenantId: {
                            readonly type: "string";
                        };
                        readonly product: {
                            readonly type: "string";
                        };
                        readonly category: {
                            readonly type: "string";
                        };
                        readonly key: {
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
                        readonly sourceJobId: {
                            readonly type: "string";
                        };
                        readonly sourceStepId: {
                            readonly type: "string";
                        };
                        readonly editable: {
                            readonly type: "boolean";
                        };
                        readonly createdAt: {
                            readonly type: "string";
                        };
                        readonly updatedAt: {
                            readonly type: "string";
                        };
                        readonly summary: {
                            readonly type: "string";
                        };
                        readonly sourceLabel: {
                            readonly type: "string";
                        };
                        readonly sourceStepLabel: {
                            readonly type: "string";
                        };
                        readonly auditTrail: {
                            readonly type: "array";
                            readonly items: {
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
                        };
                    };
                };
            };
        };
    }];
    readonly properties: {
        readonly product: {
            readonly type: "string";
            readonly enum: readonly ["provly"];
        };
        readonly inventorySummary: {
            readonly type: "object";
        };
        readonly claimSummary: {
            readonly type: "object";
        };
        readonly rooms: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
        readonly categories: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
        readonly latestExports: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
        readonly latestReports: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
        readonly latestReport: {
            readonly type: "object";
        };
        readonly highValueItems: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
        readonly reminders: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly userPreferences: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
    };
};
export declare const dashboardNeuroMovesPanelResponseSchema: {
    readonly type: "object";
    readonly allOf: readonly [{
        readonly type: "object";
        readonly allOf: readonly [{
            readonly type: "object";
            readonly required: readonly ["kind", "version", "generatedAt", "filters"];
            readonly properties: {
                readonly kind: {
                    readonly type: "string";
                };
                readonly version: {
                    readonly type: "string";
                    readonly enum: readonly ["stage-5"];
                };
                readonly generatedAt: {
                    readonly type: "string";
                };
                readonly tenantId: {
                    readonly type: "string";
                };
                readonly filters: {
                    readonly type: "object";
                    readonly properties: {
                        readonly tenantId: {
                            readonly type: "string";
                        };
                        readonly product: {
                            readonly type: "string";
                        };
                        readonly workflow: {
                            readonly type: "string";
                        };
                        readonly jobId: {
                            readonly type: "string";
                        };
                        readonly caseId: {
                            readonly type: "string";
                        };
                        readonly status: {
                            readonly oneOf: readonly [{
                                readonly type: "string";
                            }, {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                };
                            }];
                        };
                        readonly approvalStatus: {
                            readonly oneOf: readonly [{
                                readonly type: "string";
                            }, {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                };
                            }];
                        };
                        readonly page: {
                            readonly type: "number";
                        };
                        readonly pageSize: {
                            readonly type: "number";
                        };
                        readonly search: {
                            readonly type: "string";
                        };
                        readonly sortBy: {
                            readonly type: "string";
                            readonly enum: readonly ["createdAt", "updatedAt", "status", "product", "priority"];
                        };
                        readonly sortDirection: {
                            readonly type: "string";
                            readonly enum: readonly ["asc", "desc"];
                        };
                        readonly from: {
                            readonly type: "string";
                        };
                        readonly to: {
                            readonly type: "string";
                        };
                        readonly lane: {
                            readonly type: "string";
                            readonly enum: readonly ["internal", "external", "mixed"];
                        };
                    };
                };
            };
        }];
        readonly required: readonly ["kind", "product", "title", "summary", "recentJobs", "alerts", "recentMemory"];
        readonly properties: {
            readonly kind: {
                readonly type: "string";
                readonly enum: readonly ["product-panel"];
            };
            readonly product: {
                readonly type: "string";
            };
            readonly title: {
                readonly type: "string";
            };
            readonly summary: {
                readonly type: "object";
                readonly required: readonly ["title", "description", "primaryMetric", "secondaryMetrics"];
                readonly properties: {
                    readonly title: {
                        readonly type: "string";
                    };
                    readonly description: {
                        readonly type: "string";
                    };
                    readonly primaryMetric: {
                        readonly type: "object";
                        readonly required: readonly ["label", "value", "tone"];
                        readonly properties: {
                            readonly label: {
                                readonly type: "string";
                            };
                            readonly value: {
                                readonly oneOf: readonly [{
                                    readonly type: "number";
                                }, {
                                    readonly type: "string";
                                }];
                            };
                            readonly detail: {
                                readonly type: "string";
                            };
                            readonly tone: {
                                readonly type: "string";
                                readonly enum: readonly ["neutral", "success", "warning", "danger", "accent"];
                            };
                            readonly trend: {
                                readonly type: "object";
                                readonly required: readonly ["direction", "value"];
                                readonly properties: {
                                    readonly direction: {
                                        readonly type: "string";
                                        readonly enum: readonly ["up", "down", "flat"];
                                    };
                                    readonly value: {
                                        readonly type: "number";
                                    };
                                    readonly label: {
                                        readonly type: "string";
                                    };
                                };
                            };
                        };
                    };
                    readonly secondaryMetrics: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly required: readonly ["label", "value", "tone"];
                            readonly properties: {
                                readonly label: {
                                    readonly type: "string";
                                };
                                readonly value: {
                                    readonly oneOf: readonly [{
                                        readonly type: "number";
                                    }, {
                                        readonly type: "string";
                                    }];
                                };
                                readonly detail: {
                                    readonly type: "string";
                                };
                                readonly tone: {
                                    readonly type: "string";
                                    readonly enum: readonly ["neutral", "success", "warning", "danger", "accent"];
                                };
                                readonly trend: {
                                    readonly type: "object";
                                    readonly required: readonly ["direction", "value"];
                                    readonly properties: {
                                        readonly direction: {
                                            readonly type: "string";
                                            readonly enum: readonly ["up", "down", "flat"];
                                        };
                                        readonly value: {
                                            readonly type: "number";
                                        };
                                        readonly label: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
            readonly recentJobs: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly allOf: readonly [{
                        readonly type: "object";
                        readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                        readonly properties: {
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
                            readonly goal: {
                                readonly type: "string";
                            };
                            readonly priority: {
                                readonly type: "string";
                            };
                            readonly mode: {
                                readonly type: "string";
                            };
                            readonly status: {
                                readonly type: "string";
                            };
                            readonly approvalStatus: {
                                readonly type: "string";
                            };
                            readonly riskLevel: {
                                readonly type: "string";
                            };
                            readonly lane: {
                                readonly type: "string";
                            };
                            readonly createdAt: {
                                readonly type: "string";
                            };
                            readonly updatedAt: {
                                readonly type: "string";
                            };
                            readonly currentStepId: {
                                readonly type: "string";
                            };
                            readonly currentStepTitle: {
                                readonly type: "string";
                            };
                            readonly currentStepType: {
                                readonly type: "string";
                            };
                            readonly currentStepTool: {
                                readonly type: "string";
                            };
                            readonly stepCount: {
                                readonly type: "number";
                            };
                            readonly completedStepCount: {
                                readonly type: "number";
                            };
                            readonly waitingApprovalStepCount: {
                                readonly type: "number";
                            };
                            readonly failedStepCount: {
                                readonly type: "number";
                            };
                            readonly retryableStepCount: {
                                readonly type: "number";
                            };
                            readonly resultSummary: {
                                readonly type: "string";
                            };
                            readonly error: {
                                readonly type: "string";
                            };
                            readonly tags: {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                };
                            };
                        };
                    }];
                    readonly properties: {
                        readonly hasLogs: {
                            readonly type: "boolean";
                        };
                        readonly hasMemoryUpdates: {
                            readonly type: "boolean";
                        };
                        readonly lastLogAt: {
                            readonly type: "string";
                        };
                        readonly approvalPreview: {
                            readonly type: "object";
                            readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
                            readonly properties: {
                                readonly title: {
                                    readonly type: "string";
                                };
                                readonly body: {
                                    readonly type: "string";
                                };
                                readonly tool: {
                                    readonly type: "string";
                                };
                                readonly stepId: {
                                    readonly type: "string";
                                };
                                readonly stepType: {
                                    readonly type: "string";
                                };
                                readonly actionLabel: {
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
            readonly alerts: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly required: readonly ["id", "level", "title", "message", "createdAt", "metadata"];
                    readonly properties: {
                        readonly id: {
                            readonly type: "string";
                        };
                        readonly level: {
                            readonly type: "string";
                            readonly enum: readonly ["info", "success", "warning", "critical"];
                        };
                        readonly title: {
                            readonly type: "string";
                        };
                        readonly message: {
                            readonly type: "string";
                        };
                        readonly createdAt: {
                            readonly type: "string";
                        };
                        readonly relatedJobId: {
                            readonly type: "string";
                        };
                        readonly relatedProduct: {
                            readonly type: "string";
                        };
                        readonly actionLabel: {
                            readonly type: "string";
                        };
                        readonly actionHref: {
                            readonly type: "string";
                        };
                        readonly metadata: {
                            readonly type: "object";
                        };
                    };
                };
            };
            readonly recentMemory: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly required: readonly ["id", "tenantId", "product", "category", "key", "value", "confidence", "editable", "createdAt", "updatedAt", "summary"];
                    readonly properties: {
                        readonly id: {
                            readonly type: "string";
                        };
                        readonly tenantId: {
                            readonly type: "string";
                        };
                        readonly product: {
                            readonly type: "string";
                        };
                        readonly category: {
                            readonly type: "string";
                        };
                        readonly key: {
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
                        readonly sourceJobId: {
                            readonly type: "string";
                        };
                        readonly sourceStepId: {
                            readonly type: "string";
                        };
                        readonly editable: {
                            readonly type: "boolean";
                        };
                        readonly createdAt: {
                            readonly type: "string";
                        };
                        readonly updatedAt: {
                            readonly type: "string";
                        };
                        readonly summary: {
                            readonly type: "string";
                        };
                        readonly sourceLabel: {
                            readonly type: "string";
                        };
                        readonly sourceStepLabel: {
                            readonly type: "string";
                        };
                        readonly auditTrail: {
                            readonly type: "array";
                            readonly items: {
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
                        };
                    };
                };
            };
        };
    }];
    readonly properties: {
        readonly product: {
            readonly type: "string";
            readonly enum: readonly ["neurormoves"];
        };
        readonly routineSummary: {
            readonly type: "object";
        };
        readonly routinePatterns: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
        readonly recentCheckIns: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["jobId", "product", "workflow", "title", "runAt", "status", "source"];
                readonly properties: {
                    readonly jobId: {
                        readonly type: "string";
                    };
                    readonly product: {
                        readonly type: "string";
                    };
                    readonly workflow: {
                        readonly type: "string";
                    };
                    readonly title: {
                        readonly type: "string";
                    };
                    readonly stepId: {
                        readonly type: "string";
                    };
                    readonly runAt: {
                        readonly type: "string";
                    };
                    readonly status: {
                        readonly type: "string";
                    };
                    readonly detail: {
                        readonly type: "string";
                    };
                    readonly source: {
                        readonly type: "string";
                        readonly enum: readonly ["scheduler", "job-step", "goal-payload"];
                    };
                };
            };
        };
        readonly recentSummaries: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
    };
};
export declare const dashboardProductPanelResponseSchema: {
    readonly oneOf: readonly [{
        readonly type: "object";
        readonly allOf: readonly [{
            readonly type: "object";
            readonly allOf: readonly [{
                readonly type: "object";
                readonly required: readonly ["kind", "version", "generatedAt", "filters"];
                readonly properties: {
                    readonly kind: {
                        readonly type: "string";
                    };
                    readonly version: {
                        readonly type: "string";
                        readonly enum: readonly ["stage-5"];
                    };
                    readonly generatedAt: {
                        readonly type: "string";
                    };
                    readonly tenantId: {
                        readonly type: "string";
                    };
                    readonly filters: {
                        readonly type: "object";
                        readonly properties: {
                            readonly tenantId: {
                                readonly type: "string";
                            };
                            readonly product: {
                                readonly type: "string";
                            };
                            readonly workflow: {
                                readonly type: "string";
                            };
                            readonly jobId: {
                                readonly type: "string";
                            };
                            readonly caseId: {
                                readonly type: "string";
                            };
                            readonly status: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                }, {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                    };
                                }];
                            };
                            readonly approvalStatus: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                }, {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                    };
                                }];
                            };
                            readonly page: {
                                readonly type: "number";
                            };
                            readonly pageSize: {
                                readonly type: "number";
                            };
                            readonly search: {
                                readonly type: "string";
                            };
                            readonly sortBy: {
                                readonly type: "string";
                                readonly enum: readonly ["createdAt", "updatedAt", "status", "product", "priority"];
                            };
                            readonly sortDirection: {
                                readonly type: "string";
                                readonly enum: readonly ["asc", "desc"];
                            };
                            readonly from: {
                                readonly type: "string";
                            };
                            readonly to: {
                                readonly type: "string";
                            };
                            readonly lane: {
                                readonly type: "string";
                                readonly enum: readonly ["internal", "external", "mixed"];
                            };
                        };
                    };
                };
            }];
            readonly required: readonly ["kind", "product", "title", "summary", "recentJobs", "alerts", "recentMemory"];
            readonly properties: {
                readonly kind: {
                    readonly type: "string";
                    readonly enum: readonly ["product-panel"];
                };
                readonly product: {
                    readonly type: "string";
                };
                readonly title: {
                    readonly type: "string";
                };
                readonly summary: {
                    readonly type: "object";
                    readonly required: readonly ["title", "description", "primaryMetric", "secondaryMetrics"];
                    readonly properties: {
                        readonly title: {
                            readonly type: "string";
                        };
                        readonly description: {
                            readonly type: "string";
                        };
                        readonly primaryMetric: {
                            readonly type: "object";
                            readonly required: readonly ["label", "value", "tone"];
                            readonly properties: {
                                readonly label: {
                                    readonly type: "string";
                                };
                                readonly value: {
                                    readonly oneOf: readonly [{
                                        readonly type: "number";
                                    }, {
                                        readonly type: "string";
                                    }];
                                };
                                readonly detail: {
                                    readonly type: "string";
                                };
                                readonly tone: {
                                    readonly type: "string";
                                    readonly enum: readonly ["neutral", "success", "warning", "danger", "accent"];
                                };
                                readonly trend: {
                                    readonly type: "object";
                                    readonly required: readonly ["direction", "value"];
                                    readonly properties: {
                                        readonly direction: {
                                            readonly type: "string";
                                            readonly enum: readonly ["up", "down", "flat"];
                                        };
                                        readonly value: {
                                            readonly type: "number";
                                        };
                                        readonly label: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                            };
                        };
                        readonly secondaryMetrics: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "object";
                                readonly required: readonly ["label", "value", "tone"];
                                readonly properties: {
                                    readonly label: {
                                        readonly type: "string";
                                    };
                                    readonly value: {
                                        readonly oneOf: readonly [{
                                            readonly type: "number";
                                        }, {
                                            readonly type: "string";
                                        }];
                                    };
                                    readonly detail: {
                                        readonly type: "string";
                                    };
                                    readonly tone: {
                                        readonly type: "string";
                                        readonly enum: readonly ["neutral", "success", "warning", "danger", "accent"];
                                    };
                                    readonly trend: {
                                        readonly type: "object";
                                        readonly required: readonly ["direction", "value"];
                                        readonly properties: {
                                            readonly direction: {
                                                readonly type: "string";
                                                readonly enum: readonly ["up", "down", "flat"];
                                            };
                                            readonly value: {
                                                readonly type: "number";
                                            };
                                            readonly label: {
                                                readonly type: "string";
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
                readonly recentJobs: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly allOf: readonly [{
                            readonly type: "object";
                            readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                            readonly properties: {
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
                                readonly goal: {
                                    readonly type: "string";
                                };
                                readonly priority: {
                                    readonly type: "string";
                                };
                                readonly mode: {
                                    readonly type: "string";
                                };
                                readonly status: {
                                    readonly type: "string";
                                };
                                readonly approvalStatus: {
                                    readonly type: "string";
                                };
                                readonly riskLevel: {
                                    readonly type: "string";
                                };
                                readonly lane: {
                                    readonly type: "string";
                                };
                                readonly createdAt: {
                                    readonly type: "string";
                                };
                                readonly updatedAt: {
                                    readonly type: "string";
                                };
                                readonly currentStepId: {
                                    readonly type: "string";
                                };
                                readonly currentStepTitle: {
                                    readonly type: "string";
                                };
                                readonly currentStepType: {
                                    readonly type: "string";
                                };
                                readonly currentStepTool: {
                                    readonly type: "string";
                                };
                                readonly stepCount: {
                                    readonly type: "number";
                                };
                                readonly completedStepCount: {
                                    readonly type: "number";
                                };
                                readonly waitingApprovalStepCount: {
                                    readonly type: "number";
                                };
                                readonly failedStepCount: {
                                    readonly type: "number";
                                };
                                readonly retryableStepCount: {
                                    readonly type: "number";
                                };
                                readonly resultSummary: {
                                    readonly type: "string";
                                };
                                readonly error: {
                                    readonly type: "string";
                                };
                                readonly tags: {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                    };
                                };
                            };
                        }];
                        readonly properties: {
                            readonly hasLogs: {
                                readonly type: "boolean";
                            };
                            readonly hasMemoryUpdates: {
                                readonly type: "boolean";
                            };
                            readonly lastLogAt: {
                                readonly type: "string";
                            };
                            readonly approvalPreview: {
                                readonly type: "object";
                                readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
                                readonly properties: {
                                    readonly title: {
                                        readonly type: "string";
                                    };
                                    readonly body: {
                                        readonly type: "string";
                                    };
                                    readonly tool: {
                                        readonly type: "string";
                                    };
                                    readonly stepId: {
                                        readonly type: "string";
                                    };
                                    readonly stepType: {
                                        readonly type: "string";
                                    };
                                    readonly actionLabel: {
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
                readonly alerts: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["id", "level", "title", "message", "createdAt", "metadata"];
                        readonly properties: {
                            readonly id: {
                                readonly type: "string";
                            };
                            readonly level: {
                                readonly type: "string";
                                readonly enum: readonly ["info", "success", "warning", "critical"];
                            };
                            readonly title: {
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly type: "string";
                            };
                            readonly createdAt: {
                                readonly type: "string";
                            };
                            readonly relatedJobId: {
                                readonly type: "string";
                            };
                            readonly relatedProduct: {
                                readonly type: "string";
                            };
                            readonly actionLabel: {
                                readonly type: "string";
                            };
                            readonly actionHref: {
                                readonly type: "string";
                            };
                            readonly metadata: {
                                readonly type: "object";
                            };
                        };
                    };
                };
                readonly recentMemory: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["id", "tenantId", "product", "category", "key", "value", "confidence", "editable", "createdAt", "updatedAt", "summary"];
                        readonly properties: {
                            readonly id: {
                                readonly type: "string";
                            };
                            readonly tenantId: {
                                readonly type: "string";
                            };
                            readonly product: {
                                readonly type: "string";
                            };
                            readonly category: {
                                readonly type: "string";
                            };
                            readonly key: {
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
                            readonly sourceJobId: {
                                readonly type: "string";
                            };
                            readonly sourceStepId: {
                                readonly type: "string";
                            };
                            readonly editable: {
                                readonly type: "boolean";
                            };
                            readonly createdAt: {
                                readonly type: "string";
                            };
                            readonly updatedAt: {
                                readonly type: "string";
                            };
                            readonly summary: {
                                readonly type: "string";
                            };
                            readonly sourceLabel: {
                                readonly type: "string";
                            };
                            readonly sourceStepLabel: {
                                readonly type: "string";
                            };
                            readonly auditTrail: {
                                readonly type: "array";
                                readonly items: {
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
                            };
                        };
                    };
                };
            };
        }];
        readonly properties: {
            readonly product: {
                readonly type: "string";
                readonly enum: readonly ["lead-recovery"];
            };
            readonly resultSummary: {
                readonly type: "object";
            };
            readonly leadSummary: {
                readonly type: "object";
            };
            readonly recentResults: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                };
            };
            readonly approvalItems: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly allOf: readonly [{
                        readonly type: "object";
                        readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                        readonly properties: {
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
                            readonly goal: {
                                readonly type: "string";
                            };
                            readonly priority: {
                                readonly type: "string";
                            };
                            readonly mode: {
                                readonly type: "string";
                            };
                            readonly status: {
                                readonly type: "string";
                            };
                            readonly approvalStatus: {
                                readonly type: "string";
                            };
                            readonly riskLevel: {
                                readonly type: "string";
                            };
                            readonly lane: {
                                readonly type: "string";
                            };
                            readonly createdAt: {
                                readonly type: "string";
                            };
                            readonly updatedAt: {
                                readonly type: "string";
                            };
                            readonly currentStepId: {
                                readonly type: "string";
                            };
                            readonly currentStepTitle: {
                                readonly type: "string";
                            };
                            readonly currentStepType: {
                                readonly type: "string";
                            };
                            readonly currentStepTool: {
                                readonly type: "string";
                            };
                            readonly stepCount: {
                                readonly type: "number";
                            };
                            readonly completedStepCount: {
                                readonly type: "number";
                            };
                            readonly waitingApprovalStepCount: {
                                readonly type: "number";
                            };
                            readonly failedStepCount: {
                                readonly type: "number";
                            };
                            readonly retryableStepCount: {
                                readonly type: "number";
                            };
                            readonly resultSummary: {
                                readonly type: "string";
                            };
                            readonly error: {
                                readonly type: "string";
                            };
                            readonly tags: {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                };
                            };
                        };
                    }];
                    readonly required: readonly ["stepId", "stepType", "stepTitle", "tool", "reason", "preview", "canApprove", "canReject", "canEdit", "retryable"];
                    readonly properties: {
                        readonly stepId: {
                            readonly type: "string";
                        };
                        readonly stepType: {
                            readonly type: "string";
                        };
                        readonly stepTitle: {
                            readonly type: "string";
                        };
                        readonly tool: {
                            readonly type: "string";
                        };
                        readonly reason: {
                            readonly type: "string";
                        };
                        readonly preview: {
                            readonly type: "object";
                            readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
                            readonly properties: {
                                readonly title: {
                                    readonly type: "string";
                                };
                                readonly body: {
                                    readonly type: "string";
                                };
                                readonly tool: {
                                    readonly type: "string";
                                };
                                readonly stepId: {
                                    readonly type: "string";
                                };
                                readonly stepType: {
                                    readonly type: "string";
                                };
                                readonly actionLabel: {
                                    readonly type: "string";
                                };
                                readonly data: {
                                    readonly type: "object";
                                };
                            };
                        };
                        readonly canApprove: {
                            readonly type: "boolean";
                        };
                        readonly canReject: {
                            readonly type: "boolean";
                        };
                        readonly canEdit: {
                            readonly type: "boolean";
                        };
                        readonly retryable: {
                            readonly type: "boolean";
                        };
                    };
                };
            };
            readonly suppressionSummary: {
                readonly type: "object";
            };
            readonly recentLeads: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                };
            };
            readonly recentInteractions: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                };
            };
            readonly recentCallEvents: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                };
            };
            readonly messageTemplates: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                };
            };
        };
    }, {
        readonly type: "object";
        readonly allOf: readonly [{
            readonly type: "object";
            readonly allOf: readonly [{
                readonly type: "object";
                readonly required: readonly ["kind", "version", "generatedAt", "filters"];
                readonly properties: {
                    readonly kind: {
                        readonly type: "string";
                    };
                    readonly version: {
                        readonly type: "string";
                        readonly enum: readonly ["stage-5"];
                    };
                    readonly generatedAt: {
                        readonly type: "string";
                    };
                    readonly tenantId: {
                        readonly type: "string";
                    };
                    readonly filters: {
                        readonly type: "object";
                        readonly properties: {
                            readonly tenantId: {
                                readonly type: "string";
                            };
                            readonly product: {
                                readonly type: "string";
                            };
                            readonly workflow: {
                                readonly type: "string";
                            };
                            readonly jobId: {
                                readonly type: "string";
                            };
                            readonly caseId: {
                                readonly type: "string";
                            };
                            readonly status: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                }, {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                    };
                                }];
                            };
                            readonly approvalStatus: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                }, {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                    };
                                }];
                            };
                            readonly page: {
                                readonly type: "number";
                            };
                            readonly pageSize: {
                                readonly type: "number";
                            };
                            readonly search: {
                                readonly type: "string";
                            };
                            readonly sortBy: {
                                readonly type: "string";
                                readonly enum: readonly ["createdAt", "updatedAt", "status", "product", "priority"];
                            };
                            readonly sortDirection: {
                                readonly type: "string";
                                readonly enum: readonly ["asc", "desc"];
                            };
                            readonly from: {
                                readonly type: "string";
                            };
                            readonly to: {
                                readonly type: "string";
                            };
                            readonly lane: {
                                readonly type: "string";
                                readonly enum: readonly ["internal", "external", "mixed"];
                            };
                        };
                    };
                };
            }];
            readonly required: readonly ["kind", "product", "title", "summary", "recentJobs", "alerts", "recentMemory"];
            readonly properties: {
                readonly kind: {
                    readonly type: "string";
                    readonly enum: readonly ["product-panel"];
                };
                readonly product: {
                    readonly type: "string";
                };
                readonly title: {
                    readonly type: "string";
                };
                readonly summary: {
                    readonly type: "object";
                    readonly required: readonly ["title", "description", "primaryMetric", "secondaryMetrics"];
                    readonly properties: {
                        readonly title: {
                            readonly type: "string";
                        };
                        readonly description: {
                            readonly type: "string";
                        };
                        readonly primaryMetric: {
                            readonly type: "object";
                            readonly required: readonly ["label", "value", "tone"];
                            readonly properties: {
                                readonly label: {
                                    readonly type: "string";
                                };
                                readonly value: {
                                    readonly oneOf: readonly [{
                                        readonly type: "number";
                                    }, {
                                        readonly type: "string";
                                    }];
                                };
                                readonly detail: {
                                    readonly type: "string";
                                };
                                readonly tone: {
                                    readonly type: "string";
                                    readonly enum: readonly ["neutral", "success", "warning", "danger", "accent"];
                                };
                                readonly trend: {
                                    readonly type: "object";
                                    readonly required: readonly ["direction", "value"];
                                    readonly properties: {
                                        readonly direction: {
                                            readonly type: "string";
                                            readonly enum: readonly ["up", "down", "flat"];
                                        };
                                        readonly value: {
                                            readonly type: "number";
                                        };
                                        readonly label: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                            };
                        };
                        readonly secondaryMetrics: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "object";
                                readonly required: readonly ["label", "value", "tone"];
                                readonly properties: {
                                    readonly label: {
                                        readonly type: "string";
                                    };
                                    readonly value: {
                                        readonly oneOf: readonly [{
                                            readonly type: "number";
                                        }, {
                                            readonly type: "string";
                                        }];
                                    };
                                    readonly detail: {
                                        readonly type: "string";
                                    };
                                    readonly tone: {
                                        readonly type: "string";
                                        readonly enum: readonly ["neutral", "success", "warning", "danger", "accent"];
                                    };
                                    readonly trend: {
                                        readonly type: "object";
                                        readonly required: readonly ["direction", "value"];
                                        readonly properties: {
                                            readonly direction: {
                                                readonly type: "string";
                                                readonly enum: readonly ["up", "down", "flat"];
                                            };
                                            readonly value: {
                                                readonly type: "number";
                                            };
                                            readonly label: {
                                                readonly type: "string";
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
                readonly recentJobs: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly allOf: readonly [{
                            readonly type: "object";
                            readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                            readonly properties: {
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
                                readonly goal: {
                                    readonly type: "string";
                                };
                                readonly priority: {
                                    readonly type: "string";
                                };
                                readonly mode: {
                                    readonly type: "string";
                                };
                                readonly status: {
                                    readonly type: "string";
                                };
                                readonly approvalStatus: {
                                    readonly type: "string";
                                };
                                readonly riskLevel: {
                                    readonly type: "string";
                                };
                                readonly lane: {
                                    readonly type: "string";
                                };
                                readonly createdAt: {
                                    readonly type: "string";
                                };
                                readonly updatedAt: {
                                    readonly type: "string";
                                };
                                readonly currentStepId: {
                                    readonly type: "string";
                                };
                                readonly currentStepTitle: {
                                    readonly type: "string";
                                };
                                readonly currentStepType: {
                                    readonly type: "string";
                                };
                                readonly currentStepTool: {
                                    readonly type: "string";
                                };
                                readonly stepCount: {
                                    readonly type: "number";
                                };
                                readonly completedStepCount: {
                                    readonly type: "number";
                                };
                                readonly waitingApprovalStepCount: {
                                    readonly type: "number";
                                };
                                readonly failedStepCount: {
                                    readonly type: "number";
                                };
                                readonly retryableStepCount: {
                                    readonly type: "number";
                                };
                                readonly resultSummary: {
                                    readonly type: "string";
                                };
                                readonly error: {
                                    readonly type: "string";
                                };
                                readonly tags: {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                    };
                                };
                            };
                        }];
                        readonly properties: {
                            readonly hasLogs: {
                                readonly type: "boolean";
                            };
                            readonly hasMemoryUpdates: {
                                readonly type: "boolean";
                            };
                            readonly lastLogAt: {
                                readonly type: "string";
                            };
                            readonly approvalPreview: {
                                readonly type: "object";
                                readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
                                readonly properties: {
                                    readonly title: {
                                        readonly type: "string";
                                    };
                                    readonly body: {
                                        readonly type: "string";
                                    };
                                    readonly tool: {
                                        readonly type: "string";
                                    };
                                    readonly stepId: {
                                        readonly type: "string";
                                    };
                                    readonly stepType: {
                                        readonly type: "string";
                                    };
                                    readonly actionLabel: {
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
                readonly alerts: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["id", "level", "title", "message", "createdAt", "metadata"];
                        readonly properties: {
                            readonly id: {
                                readonly type: "string";
                            };
                            readonly level: {
                                readonly type: "string";
                                readonly enum: readonly ["info", "success", "warning", "critical"];
                            };
                            readonly title: {
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly type: "string";
                            };
                            readonly createdAt: {
                                readonly type: "string";
                            };
                            readonly relatedJobId: {
                                readonly type: "string";
                            };
                            readonly relatedProduct: {
                                readonly type: "string";
                            };
                            readonly actionLabel: {
                                readonly type: "string";
                            };
                            readonly actionHref: {
                                readonly type: "string";
                            };
                            readonly metadata: {
                                readonly type: "object";
                            };
                        };
                    };
                };
                readonly recentMemory: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["id", "tenantId", "product", "category", "key", "value", "confidence", "editable", "createdAt", "updatedAt", "summary"];
                        readonly properties: {
                            readonly id: {
                                readonly type: "string";
                            };
                            readonly tenantId: {
                                readonly type: "string";
                            };
                            readonly product: {
                                readonly type: "string";
                            };
                            readonly category: {
                                readonly type: "string";
                            };
                            readonly key: {
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
                            readonly sourceJobId: {
                                readonly type: "string";
                            };
                            readonly sourceStepId: {
                                readonly type: "string";
                            };
                            readonly editable: {
                                readonly type: "boolean";
                            };
                            readonly createdAt: {
                                readonly type: "string";
                            };
                            readonly updatedAt: {
                                readonly type: "string";
                            };
                            readonly summary: {
                                readonly type: "string";
                            };
                            readonly sourceLabel: {
                                readonly type: "string";
                            };
                            readonly sourceStepLabel: {
                                readonly type: "string";
                            };
                            readonly auditTrail: {
                                readonly type: "array";
                                readonly items: {
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
                            };
                        };
                    };
                };
            };
        }];
        readonly properties: {
            readonly product: {
                readonly type: "string";
                readonly enum: readonly ["nexusbuild"];
            };
            readonly buildSummary: {
                readonly type: "object";
            };
            readonly compatibilitySummary: {
                readonly type: "object";
            };
            readonly pricingSummary: {
                readonly type: "object";
            };
            readonly savedBuilds: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                };
            };
            readonly latestReports: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                };
            };
            readonly latestRecommendationRuns: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                };
            };
            readonly latestReport: {
                readonly type: "object";
            };
        };
    }, {
        readonly type: "object";
        readonly allOf: readonly [{
            readonly type: "object";
            readonly allOf: readonly [{
                readonly type: "object";
                readonly required: readonly ["kind", "version", "generatedAt", "filters"];
                readonly properties: {
                    readonly kind: {
                        readonly type: "string";
                    };
                    readonly version: {
                        readonly type: "string";
                        readonly enum: readonly ["stage-5"];
                    };
                    readonly generatedAt: {
                        readonly type: "string";
                    };
                    readonly tenantId: {
                        readonly type: "string";
                    };
                    readonly filters: {
                        readonly type: "object";
                        readonly properties: {
                            readonly tenantId: {
                                readonly type: "string";
                            };
                            readonly product: {
                                readonly type: "string";
                            };
                            readonly workflow: {
                                readonly type: "string";
                            };
                            readonly jobId: {
                                readonly type: "string";
                            };
                            readonly caseId: {
                                readonly type: "string";
                            };
                            readonly status: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                }, {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                    };
                                }];
                            };
                            readonly approvalStatus: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                }, {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                    };
                                }];
                            };
                            readonly page: {
                                readonly type: "number";
                            };
                            readonly pageSize: {
                                readonly type: "number";
                            };
                            readonly search: {
                                readonly type: "string";
                            };
                            readonly sortBy: {
                                readonly type: "string";
                                readonly enum: readonly ["createdAt", "updatedAt", "status", "product", "priority"];
                            };
                            readonly sortDirection: {
                                readonly type: "string";
                                readonly enum: readonly ["asc", "desc"];
                            };
                            readonly from: {
                                readonly type: "string";
                            };
                            readonly to: {
                                readonly type: "string";
                            };
                            readonly lane: {
                                readonly type: "string";
                                readonly enum: readonly ["internal", "external", "mixed"];
                            };
                        };
                    };
                };
            }];
            readonly required: readonly ["kind", "product", "title", "summary", "recentJobs", "alerts", "recentMemory"];
            readonly properties: {
                readonly kind: {
                    readonly type: "string";
                    readonly enum: readonly ["product-panel"];
                };
                readonly product: {
                    readonly type: "string";
                };
                readonly title: {
                    readonly type: "string";
                };
                readonly summary: {
                    readonly type: "object";
                    readonly required: readonly ["title", "description", "primaryMetric", "secondaryMetrics"];
                    readonly properties: {
                        readonly title: {
                            readonly type: "string";
                        };
                        readonly description: {
                            readonly type: "string";
                        };
                        readonly primaryMetric: {
                            readonly type: "object";
                            readonly required: readonly ["label", "value", "tone"];
                            readonly properties: {
                                readonly label: {
                                    readonly type: "string";
                                };
                                readonly value: {
                                    readonly oneOf: readonly [{
                                        readonly type: "number";
                                    }, {
                                        readonly type: "string";
                                    }];
                                };
                                readonly detail: {
                                    readonly type: "string";
                                };
                                readonly tone: {
                                    readonly type: "string";
                                    readonly enum: readonly ["neutral", "success", "warning", "danger", "accent"];
                                };
                                readonly trend: {
                                    readonly type: "object";
                                    readonly required: readonly ["direction", "value"];
                                    readonly properties: {
                                        readonly direction: {
                                            readonly type: "string";
                                            readonly enum: readonly ["up", "down", "flat"];
                                        };
                                        readonly value: {
                                            readonly type: "number";
                                        };
                                        readonly label: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                            };
                        };
                        readonly secondaryMetrics: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "object";
                                readonly required: readonly ["label", "value", "tone"];
                                readonly properties: {
                                    readonly label: {
                                        readonly type: "string";
                                    };
                                    readonly value: {
                                        readonly oneOf: readonly [{
                                            readonly type: "number";
                                        }, {
                                            readonly type: "string";
                                        }];
                                    };
                                    readonly detail: {
                                        readonly type: "string";
                                    };
                                    readonly tone: {
                                        readonly type: "string";
                                        readonly enum: readonly ["neutral", "success", "warning", "danger", "accent"];
                                    };
                                    readonly trend: {
                                        readonly type: "object";
                                        readonly required: readonly ["direction", "value"];
                                        readonly properties: {
                                            readonly direction: {
                                                readonly type: "string";
                                                readonly enum: readonly ["up", "down", "flat"];
                                            };
                                            readonly value: {
                                                readonly type: "number";
                                            };
                                            readonly label: {
                                                readonly type: "string";
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
                readonly recentJobs: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly allOf: readonly [{
                            readonly type: "object";
                            readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                            readonly properties: {
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
                                readonly goal: {
                                    readonly type: "string";
                                };
                                readonly priority: {
                                    readonly type: "string";
                                };
                                readonly mode: {
                                    readonly type: "string";
                                };
                                readonly status: {
                                    readonly type: "string";
                                };
                                readonly approvalStatus: {
                                    readonly type: "string";
                                };
                                readonly riskLevel: {
                                    readonly type: "string";
                                };
                                readonly lane: {
                                    readonly type: "string";
                                };
                                readonly createdAt: {
                                    readonly type: "string";
                                };
                                readonly updatedAt: {
                                    readonly type: "string";
                                };
                                readonly currentStepId: {
                                    readonly type: "string";
                                };
                                readonly currentStepTitle: {
                                    readonly type: "string";
                                };
                                readonly currentStepType: {
                                    readonly type: "string";
                                };
                                readonly currentStepTool: {
                                    readonly type: "string";
                                };
                                readonly stepCount: {
                                    readonly type: "number";
                                };
                                readonly completedStepCount: {
                                    readonly type: "number";
                                };
                                readonly waitingApprovalStepCount: {
                                    readonly type: "number";
                                };
                                readonly failedStepCount: {
                                    readonly type: "number";
                                };
                                readonly retryableStepCount: {
                                    readonly type: "number";
                                };
                                readonly resultSummary: {
                                    readonly type: "string";
                                };
                                readonly error: {
                                    readonly type: "string";
                                };
                                readonly tags: {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                    };
                                };
                            };
                        }];
                        readonly properties: {
                            readonly hasLogs: {
                                readonly type: "boolean";
                            };
                            readonly hasMemoryUpdates: {
                                readonly type: "boolean";
                            };
                            readonly lastLogAt: {
                                readonly type: "string";
                            };
                            readonly approvalPreview: {
                                readonly type: "object";
                                readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
                                readonly properties: {
                                    readonly title: {
                                        readonly type: "string";
                                    };
                                    readonly body: {
                                        readonly type: "string";
                                    };
                                    readonly tool: {
                                        readonly type: "string";
                                    };
                                    readonly stepId: {
                                        readonly type: "string";
                                    };
                                    readonly stepType: {
                                        readonly type: "string";
                                    };
                                    readonly actionLabel: {
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
                readonly alerts: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["id", "level", "title", "message", "createdAt", "metadata"];
                        readonly properties: {
                            readonly id: {
                                readonly type: "string";
                            };
                            readonly level: {
                                readonly type: "string";
                                readonly enum: readonly ["info", "success", "warning", "critical"];
                            };
                            readonly title: {
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly type: "string";
                            };
                            readonly createdAt: {
                                readonly type: "string";
                            };
                            readonly relatedJobId: {
                                readonly type: "string";
                            };
                            readonly relatedProduct: {
                                readonly type: "string";
                            };
                            readonly actionLabel: {
                                readonly type: "string";
                            };
                            readonly actionHref: {
                                readonly type: "string";
                            };
                            readonly metadata: {
                                readonly type: "object";
                            };
                        };
                    };
                };
                readonly recentMemory: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["id", "tenantId", "product", "category", "key", "value", "confidence", "editable", "createdAt", "updatedAt", "summary"];
                        readonly properties: {
                            readonly id: {
                                readonly type: "string";
                            };
                            readonly tenantId: {
                                readonly type: "string";
                            };
                            readonly product: {
                                readonly type: "string";
                            };
                            readonly category: {
                                readonly type: "string";
                            };
                            readonly key: {
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
                            readonly sourceJobId: {
                                readonly type: "string";
                            };
                            readonly sourceStepId: {
                                readonly type: "string";
                            };
                            readonly editable: {
                                readonly type: "boolean";
                            };
                            readonly createdAt: {
                                readonly type: "string";
                            };
                            readonly updatedAt: {
                                readonly type: "string";
                            };
                            readonly summary: {
                                readonly type: "string";
                            };
                            readonly sourceLabel: {
                                readonly type: "string";
                            };
                            readonly sourceStepLabel: {
                                readonly type: "string";
                            };
                            readonly auditTrail: {
                                readonly type: "array";
                                readonly items: {
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
                            };
                        };
                    };
                };
            };
        }];
        readonly properties: {
            readonly product: {
                readonly type: "string";
                readonly enum: readonly ["provly"];
            };
            readonly inventorySummary: {
                readonly type: "object";
            };
            readonly claimSummary: {
                readonly type: "object";
            };
            readonly rooms: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                };
            };
            readonly categories: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                };
            };
            readonly latestExports: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                };
            };
            readonly latestReports: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                };
            };
            readonly latestReport: {
                readonly type: "object";
            };
            readonly highValueItems: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                };
            };
            readonly reminders: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            };
            readonly userPreferences: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                };
            };
        };
    }, {
        readonly type: "object";
        readonly allOf: readonly [{
            readonly type: "object";
            readonly allOf: readonly [{
                readonly type: "object";
                readonly required: readonly ["kind", "version", "generatedAt", "filters"];
                readonly properties: {
                    readonly kind: {
                        readonly type: "string";
                    };
                    readonly version: {
                        readonly type: "string";
                        readonly enum: readonly ["stage-5"];
                    };
                    readonly generatedAt: {
                        readonly type: "string";
                    };
                    readonly tenantId: {
                        readonly type: "string";
                    };
                    readonly filters: {
                        readonly type: "object";
                        readonly properties: {
                            readonly tenantId: {
                                readonly type: "string";
                            };
                            readonly product: {
                                readonly type: "string";
                            };
                            readonly workflow: {
                                readonly type: "string";
                            };
                            readonly jobId: {
                                readonly type: "string";
                            };
                            readonly caseId: {
                                readonly type: "string";
                            };
                            readonly status: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                }, {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                    };
                                }];
                            };
                            readonly approvalStatus: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                }, {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                    };
                                }];
                            };
                            readonly page: {
                                readonly type: "number";
                            };
                            readonly pageSize: {
                                readonly type: "number";
                            };
                            readonly search: {
                                readonly type: "string";
                            };
                            readonly sortBy: {
                                readonly type: "string";
                                readonly enum: readonly ["createdAt", "updatedAt", "status", "product", "priority"];
                            };
                            readonly sortDirection: {
                                readonly type: "string";
                                readonly enum: readonly ["asc", "desc"];
                            };
                            readonly from: {
                                readonly type: "string";
                            };
                            readonly to: {
                                readonly type: "string";
                            };
                            readonly lane: {
                                readonly type: "string";
                                readonly enum: readonly ["internal", "external", "mixed"];
                            };
                        };
                    };
                };
            }];
            readonly required: readonly ["kind", "product", "title", "summary", "recentJobs", "alerts", "recentMemory"];
            readonly properties: {
                readonly kind: {
                    readonly type: "string";
                    readonly enum: readonly ["product-panel"];
                };
                readonly product: {
                    readonly type: "string";
                };
                readonly title: {
                    readonly type: "string";
                };
                readonly summary: {
                    readonly type: "object";
                    readonly required: readonly ["title", "description", "primaryMetric", "secondaryMetrics"];
                    readonly properties: {
                        readonly title: {
                            readonly type: "string";
                        };
                        readonly description: {
                            readonly type: "string";
                        };
                        readonly primaryMetric: {
                            readonly type: "object";
                            readonly required: readonly ["label", "value", "tone"];
                            readonly properties: {
                                readonly label: {
                                    readonly type: "string";
                                };
                                readonly value: {
                                    readonly oneOf: readonly [{
                                        readonly type: "number";
                                    }, {
                                        readonly type: "string";
                                    }];
                                };
                                readonly detail: {
                                    readonly type: "string";
                                };
                                readonly tone: {
                                    readonly type: "string";
                                    readonly enum: readonly ["neutral", "success", "warning", "danger", "accent"];
                                };
                                readonly trend: {
                                    readonly type: "object";
                                    readonly required: readonly ["direction", "value"];
                                    readonly properties: {
                                        readonly direction: {
                                            readonly type: "string";
                                            readonly enum: readonly ["up", "down", "flat"];
                                        };
                                        readonly value: {
                                            readonly type: "number";
                                        };
                                        readonly label: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                            };
                        };
                        readonly secondaryMetrics: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "object";
                                readonly required: readonly ["label", "value", "tone"];
                                readonly properties: {
                                    readonly label: {
                                        readonly type: "string";
                                    };
                                    readonly value: {
                                        readonly oneOf: readonly [{
                                            readonly type: "number";
                                        }, {
                                            readonly type: "string";
                                        }];
                                    };
                                    readonly detail: {
                                        readonly type: "string";
                                    };
                                    readonly tone: {
                                        readonly type: "string";
                                        readonly enum: readonly ["neutral", "success", "warning", "danger", "accent"];
                                    };
                                    readonly trend: {
                                        readonly type: "object";
                                        readonly required: readonly ["direction", "value"];
                                        readonly properties: {
                                            readonly direction: {
                                                readonly type: "string";
                                                readonly enum: readonly ["up", "down", "flat"];
                                            };
                                            readonly value: {
                                                readonly type: "number";
                                            };
                                            readonly label: {
                                                readonly type: "string";
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
                readonly recentJobs: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly allOf: readonly [{
                            readonly type: "object";
                            readonly required: readonly ["jobId", "tenantId", "product", "workflow", "goal", "priority", "mode", "status", "approvalStatus", "riskLevel", "lane", "createdAt", "updatedAt", "stepCount", "completedStepCount", "waitingApprovalStepCount", "failedStepCount", "retryableStepCount", "tags"];
                            readonly properties: {
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
                                readonly goal: {
                                    readonly type: "string";
                                };
                                readonly priority: {
                                    readonly type: "string";
                                };
                                readonly mode: {
                                    readonly type: "string";
                                };
                                readonly status: {
                                    readonly type: "string";
                                };
                                readonly approvalStatus: {
                                    readonly type: "string";
                                };
                                readonly riskLevel: {
                                    readonly type: "string";
                                };
                                readonly lane: {
                                    readonly type: "string";
                                };
                                readonly createdAt: {
                                    readonly type: "string";
                                };
                                readonly updatedAt: {
                                    readonly type: "string";
                                };
                                readonly currentStepId: {
                                    readonly type: "string";
                                };
                                readonly currentStepTitle: {
                                    readonly type: "string";
                                };
                                readonly currentStepType: {
                                    readonly type: "string";
                                };
                                readonly currentStepTool: {
                                    readonly type: "string";
                                };
                                readonly stepCount: {
                                    readonly type: "number";
                                };
                                readonly completedStepCount: {
                                    readonly type: "number";
                                };
                                readonly waitingApprovalStepCount: {
                                    readonly type: "number";
                                };
                                readonly failedStepCount: {
                                    readonly type: "number";
                                };
                                readonly retryableStepCount: {
                                    readonly type: "number";
                                };
                                readonly resultSummary: {
                                    readonly type: "string";
                                };
                                readonly error: {
                                    readonly type: "string";
                                };
                                readonly tags: {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                    };
                                };
                            };
                        }];
                        readonly properties: {
                            readonly hasLogs: {
                                readonly type: "boolean";
                            };
                            readonly hasMemoryUpdates: {
                                readonly type: "boolean";
                            };
                            readonly lastLogAt: {
                                readonly type: "string";
                            };
                            readonly approvalPreview: {
                                readonly type: "object";
                                readonly required: readonly ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"];
                                readonly properties: {
                                    readonly title: {
                                        readonly type: "string";
                                    };
                                    readonly body: {
                                        readonly type: "string";
                                    };
                                    readonly tool: {
                                        readonly type: "string";
                                    };
                                    readonly stepId: {
                                        readonly type: "string";
                                    };
                                    readonly stepType: {
                                        readonly type: "string";
                                    };
                                    readonly actionLabel: {
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
                readonly alerts: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["id", "level", "title", "message", "createdAt", "metadata"];
                        readonly properties: {
                            readonly id: {
                                readonly type: "string";
                            };
                            readonly level: {
                                readonly type: "string";
                                readonly enum: readonly ["info", "success", "warning", "critical"];
                            };
                            readonly title: {
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly type: "string";
                            };
                            readonly createdAt: {
                                readonly type: "string";
                            };
                            readonly relatedJobId: {
                                readonly type: "string";
                            };
                            readonly relatedProduct: {
                                readonly type: "string";
                            };
                            readonly actionLabel: {
                                readonly type: "string";
                            };
                            readonly actionHref: {
                                readonly type: "string";
                            };
                            readonly metadata: {
                                readonly type: "object";
                            };
                        };
                    };
                };
                readonly recentMemory: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["id", "tenantId", "product", "category", "key", "value", "confidence", "editable", "createdAt", "updatedAt", "summary"];
                        readonly properties: {
                            readonly id: {
                                readonly type: "string";
                            };
                            readonly tenantId: {
                                readonly type: "string";
                            };
                            readonly product: {
                                readonly type: "string";
                            };
                            readonly category: {
                                readonly type: "string";
                            };
                            readonly key: {
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
                            readonly sourceJobId: {
                                readonly type: "string";
                            };
                            readonly sourceStepId: {
                                readonly type: "string";
                            };
                            readonly editable: {
                                readonly type: "boolean";
                            };
                            readonly createdAt: {
                                readonly type: "string";
                            };
                            readonly updatedAt: {
                                readonly type: "string";
                            };
                            readonly summary: {
                                readonly type: "string";
                            };
                            readonly sourceLabel: {
                                readonly type: "string";
                            };
                            readonly sourceStepLabel: {
                                readonly type: "string";
                            };
                            readonly auditTrail: {
                                readonly type: "array";
                                readonly items: {
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
                            };
                        };
                    };
                };
            };
        }];
        readonly properties: {
            readonly product: {
                readonly type: "string";
                readonly enum: readonly ["neurormoves"];
            };
            readonly routineSummary: {
                readonly type: "object";
            };
            readonly routinePatterns: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                };
            };
            readonly recentCheckIns: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly required: readonly ["jobId", "product", "workflow", "title", "runAt", "status", "source"];
                    readonly properties: {
                        readonly jobId: {
                            readonly type: "string";
                        };
                        readonly product: {
                            readonly type: "string";
                        };
                        readonly workflow: {
                            readonly type: "string";
                        };
                        readonly title: {
                            readonly type: "string";
                        };
                        readonly stepId: {
                            readonly type: "string";
                        };
                        readonly runAt: {
                            readonly type: "string";
                        };
                        readonly status: {
                            readonly type: "string";
                        };
                        readonly detail: {
                            readonly type: "string";
                        };
                        readonly source: {
                            readonly type: "string";
                            readonly enum: readonly ["scheduler", "job-step", "goal-payload"];
                        };
                    };
                };
            };
            readonly recentSummaries: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                };
            };
        };
    }];
};
export declare const dashboardSettingsRuntimeSummarySchema: {
    readonly type: "object";
    readonly required: readonly ["serviceName", "providerMode", "executionMode", "port", "dataDir", "databaseProvider", "browserProvider", "smsProvider", "emailProvider", "ocrProvider", "redisEnabled", "maxRetries"];
    readonly properties: {
        readonly serviceName: {
            readonly type: "string";
        };
        readonly providerMode: {
            readonly type: "string";
            readonly enum: readonly ["mock", "openai", "gemini"];
        };
        readonly executionMode: {
            readonly type: "string";
            readonly enum: readonly ["inline", "queued"];
        };
        readonly port: {
            readonly type: "number";
        };
        readonly dataDir: {
            readonly type: "string";
        };
        readonly databaseProvider: {
            readonly type: "string";
            readonly enum: readonly ["file", "supabase", "postgres"];
        };
        readonly browserProvider: {
            readonly type: "string";
            readonly enum: readonly ["mock", "playwright"];
        };
        readonly smsProvider: {
            readonly type: "string";
            readonly enum: readonly ["mock", "twilio"];
        };
        readonly emailProvider: {
            readonly type: "string";
            readonly enum: readonly ["mock", "webhook"];
        };
        readonly ocrProvider: {
            readonly type: "string";
            readonly enum: readonly ["mock", "http"];
        };
        readonly redisEnabled: {
            readonly type: "boolean";
        };
        readonly maxRetries: {
            readonly type: "number";
        };
    };
};
export declare const dashboardSettingsCommunicationTemplateSchema: {
    readonly type: "object";
    readonly required: readonly ["key", "title", "body", "tone", "product", "editable", "source", "updatedAt"];
    readonly properties: {
        readonly key: {
            readonly type: "string";
        };
        readonly title: {
            readonly type: "string";
        };
        readonly body: {
            readonly type: "string";
        };
        readonly tone: {
            readonly type: "string";
            readonly enum: readonly ["business-safe", "warm", "urgent"];
        };
        readonly product: {
            readonly type: "string";
        };
        readonly editable: {
            readonly type: "boolean";
        };
        readonly source: {
            readonly type: "string";
            readonly enum: readonly ["memory", "default", "runtime"];
        };
        readonly updatedAt: {
            readonly type: "string";
        };
    };
};
export declare const dashboardSettingsSuppressionRuleSchema: {
    readonly type: "object";
    readonly required: readonly ["key", "title", "description", "product", "enabled", "source"];
    readonly properties: {
        readonly key: {
            readonly type: "string";
        };
        readonly title: {
            readonly type: "string";
        };
        readonly description: {
            readonly type: "string";
        };
        readonly product: {
            readonly type: "string";
        };
        readonly enabled: {
            readonly type: "boolean";
        };
        readonly source: {
            readonly type: "string";
            readonly enum: readonly ["memory", "default", "runtime"];
        };
        readonly windowHours: {
            readonly type: "number";
        };
    };
};
export declare const dashboardSettingsSummarySchema: {
    readonly type: "object";
    readonly required: readonly ["tenantRuleCount", "communicationTemplateCount", "suppressionRuleCount", "editableMemoryCount", "recentAuditEntries"];
    readonly properties: {
        readonly tenantRuleCount: {
            readonly type: "number";
        };
        readonly communicationTemplateCount: {
            readonly type: "number";
        };
        readonly suppressionRuleCount: {
            readonly type: "number";
        };
        readonly editableMemoryCount: {
            readonly type: "number";
        };
        readonly recentAuditEntries: {
            readonly type: "number";
        };
    };
};
export declare const dashboardOrchestrationHistoryItemSchema: {
    readonly type: "object";
    readonly required: readonly ["invocationId", "phase", "agentId", "agentTitle", "selection", "status", "startedAt", "completedAt", "durationMs", "summary"];
    readonly properties: {
        readonly invocationId: {
            readonly type: "string";
        };
        readonly phase: {
            readonly type: "string";
            readonly enum: readonly ["routing", "planning", "research", "execution", "communication", "verification", "memory", "reporting"];
        };
        readonly agentId: {
            readonly type: "string";
            readonly enum: readonly ["router-agent", "planner-agent", "research-agent", "execution-agent", "communication-agent", "verification-agent", "memory-agent", "reporting-agent"];
        };
        readonly agentTitle: {
            readonly type: "string";
        };
        readonly selection: {
            readonly type: "object";
            readonly required: readonly ["phase", "agentId", "agentTitle", "capability", "permissionScope", "mayUseExternalTools", "requiresApprovalForExternalActions", "reason"];
            readonly properties: {
                readonly phase: {
                    readonly type: "string";
                    readonly enum: readonly ["routing", "planning", "research", "execution", "communication", "verification", "memory", "reporting"];
                };
                readonly agentId: {
                    readonly type: "string";
                    readonly enum: readonly ["router-agent", "planner-agent", "research-agent", "execution-agent", "communication-agent", "verification-agent", "memory-agent", "reporting-agent"];
                };
                readonly agentTitle: {
                    readonly type: "string";
                };
                readonly capability: {
                    readonly type: "string";
                };
                readonly permissionScope: {
                    readonly type: "string";
                };
                readonly mayUseExternalTools: {
                    readonly type: "boolean";
                };
                readonly requiresApprovalForExternalActions: {
                    readonly type: "boolean";
                };
                readonly reason: {
                    readonly type: "string";
                };
            };
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["completed", "failed"];
        };
        readonly startedAt: {
            readonly type: "string";
        };
        readonly completedAt: {
            readonly type: "string";
        };
        readonly durationMs: {
            readonly type: "number";
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
        readonly stepId: {
            readonly type: "string";
        };
        readonly stepType: {
            readonly type: "string";
        };
        readonly summary: {
            readonly type: "string";
        };
        readonly error: {
            readonly type: "string";
        };
    };
};
export declare const dashboardSettingsOrchestrationHistorySummarySchema: {
    readonly type: "object";
    readonly required: readonly ["total", "completed", "failed", "approvalGated", "externalCapable", "uniqueJobs", "byPhase", "byAgent"];
    readonly properties: {
        readonly total: {
            readonly type: "number";
        };
        readonly completed: {
            readonly type: "number";
        };
        readonly failed: {
            readonly type: "number";
        };
        readonly approvalGated: {
            readonly type: "number";
        };
        readonly externalCapable: {
            readonly type: "number";
        };
        readonly uniqueJobs: {
            readonly type: "number";
        };
        readonly byPhase: {
            readonly type: "object";
        };
        readonly byAgent: {
            readonly type: "object";
        };
    };
};
export declare const dashboardSettingsOrchestrationHistorySchema: {
    readonly type: "object";
    readonly required: readonly ["summary", "recent"];
    readonly properties: {
        readonly summary: {
            readonly type: "object";
            readonly required: readonly ["total", "completed", "failed", "approvalGated", "externalCapable", "uniqueJobs", "byPhase", "byAgent"];
            readonly properties: {
                readonly total: {
                    readonly type: "number";
                };
                readonly completed: {
                    readonly type: "number";
                };
                readonly failed: {
                    readonly type: "number";
                };
                readonly approvalGated: {
                    readonly type: "number";
                };
                readonly externalCapable: {
                    readonly type: "number";
                };
                readonly uniqueJobs: {
                    readonly type: "number";
                };
                readonly byPhase: {
                    readonly type: "object";
                };
                readonly byAgent: {
                    readonly type: "object";
                };
            };
        };
        readonly recent: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["invocationId", "phase", "agentId", "agentTitle", "selection", "status", "startedAt", "completedAt", "durationMs", "summary"];
                readonly properties: {
                    readonly invocationId: {
                        readonly type: "string";
                    };
                    readonly phase: {
                        readonly type: "string";
                        readonly enum: readonly ["routing", "planning", "research", "execution", "communication", "verification", "memory", "reporting"];
                    };
                    readonly agentId: {
                        readonly type: "string";
                        readonly enum: readonly ["router-agent", "planner-agent", "research-agent", "execution-agent", "communication-agent", "verification-agent", "memory-agent", "reporting-agent"];
                    };
                    readonly agentTitle: {
                        readonly type: "string";
                    };
                    readonly selection: {
                        readonly type: "object";
                        readonly required: readonly ["phase", "agentId", "agentTitle", "capability", "permissionScope", "mayUseExternalTools", "requiresApprovalForExternalActions", "reason"];
                        readonly properties: {
                            readonly phase: {
                                readonly type: "string";
                                readonly enum: readonly ["routing", "planning", "research", "execution", "communication", "verification", "memory", "reporting"];
                            };
                            readonly agentId: {
                                readonly type: "string";
                                readonly enum: readonly ["router-agent", "planner-agent", "research-agent", "execution-agent", "communication-agent", "verification-agent", "memory-agent", "reporting-agent"];
                            };
                            readonly agentTitle: {
                                readonly type: "string";
                            };
                            readonly capability: {
                                readonly type: "string";
                            };
                            readonly permissionScope: {
                                readonly type: "string";
                            };
                            readonly mayUseExternalTools: {
                                readonly type: "boolean";
                            };
                            readonly requiresApprovalForExternalActions: {
                                readonly type: "boolean";
                            };
                            readonly reason: {
                                readonly type: "string";
                            };
                        };
                    };
                    readonly status: {
                        readonly type: "string";
                        readonly enum: readonly ["completed", "failed"];
                    };
                    readonly startedAt: {
                        readonly type: "string";
                    };
                    readonly completedAt: {
                        readonly type: "string";
                    };
                    readonly durationMs: {
                        readonly type: "number";
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
                    readonly stepId: {
                        readonly type: "string";
                    };
                    readonly stepType: {
                        readonly type: "string";
                    };
                    readonly summary: {
                        readonly type: "string";
                    };
                    readonly error: {
                        readonly type: "string";
                    };
                };
            };
        };
    };
};
export declare const dashboardSettingsTenantRuleSchema: {
    readonly type: "object";
    readonly required: readonly ["tenantId", "product", "approvalMode", "doNotContactWindowHours", "defaultTone", "messageTemplates", "updatedAt", "metadata"];
    readonly properties: {
        readonly tenantId: {
            readonly type: "string";
        };
        readonly product: {
            readonly type: "string";
        };
        readonly approvalMode: {
            readonly type: "string";
            readonly enum: readonly ["assist", "autonomous"];
        };
        readonly doNotContactWindowHours: {
            readonly type: "number";
        };
        readonly defaultTone: {
            readonly type: "string";
            readonly enum: readonly ["business-safe", "warm", "urgent"];
        };
        readonly messageTemplates: {
            readonly type: "object";
        };
        readonly businessHours: {
            readonly type: "object";
        };
        readonly updatedAt: {
            readonly type: "string";
        };
        readonly metadata: {
            readonly type: "object";
        };
    };
};
export declare const dashboardSettingsResponseSchema: {
    readonly type: "object";
    readonly allOf: readonly [{
        readonly type: "object";
        readonly required: readonly ["kind", "version", "generatedAt", "filters"];
        readonly properties: {
            readonly kind: {
                readonly type: "string";
            };
            readonly version: {
                readonly type: "string";
                readonly enum: readonly ["stage-5"];
            };
            readonly generatedAt: {
                readonly type: "string";
            };
            readonly tenantId: {
                readonly type: "string";
            };
            readonly filters: {
                readonly type: "object";
                readonly properties: {
                    readonly tenantId: {
                        readonly type: "string";
                    };
                    readonly product: {
                        readonly type: "string";
                    };
                    readonly workflow: {
                        readonly type: "string";
                    };
                    readonly jobId: {
                        readonly type: "string";
                    };
                    readonly caseId: {
                        readonly type: "string";
                    };
                    readonly status: {
                        readonly oneOf: readonly [{
                            readonly type: "string";
                        }, {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        }];
                    };
                    readonly approvalStatus: {
                        readonly oneOf: readonly [{
                            readonly type: "string";
                        }, {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        }];
                    };
                    readonly page: {
                        readonly type: "number";
                    };
                    readonly pageSize: {
                        readonly type: "number";
                    };
                    readonly search: {
                        readonly type: "string";
                    };
                    readonly sortBy: {
                        readonly type: "string";
                        readonly enum: readonly ["createdAt", "updatedAt", "status", "product", "priority"];
                    };
                    readonly sortDirection: {
                        readonly type: "string";
                        readonly enum: readonly ["asc", "desc"];
                    };
                    readonly from: {
                        readonly type: "string";
                    };
                    readonly to: {
                        readonly type: "string";
                    };
                    readonly lane: {
                        readonly type: "string";
                        readonly enum: readonly ["internal", "external", "mixed"];
                    };
                };
            };
        };
    }];
    readonly required: readonly ["kind", "runtime", "approvalPolicy", "summary", "orchestrationHistory", "tenantRules", "communicationTemplates", "suppressionRules", "memoryPatterns", "auditTrail"];
    readonly properties: {
        readonly kind: {
            readonly type: "string";
            readonly enum: readonly ["settings"];
        };
        readonly runtime: {
            readonly type: "object";
            readonly required: readonly ["serviceName", "providerMode", "executionMode", "port", "dataDir", "databaseProvider", "browserProvider", "smsProvider", "emailProvider", "ocrProvider", "redisEnabled", "maxRetries"];
            readonly properties: {
                readonly serviceName: {
                    readonly type: "string";
                };
                readonly providerMode: {
                    readonly type: "string";
                    readonly enum: readonly ["mock", "openai", "gemini"];
                };
                readonly executionMode: {
                    readonly type: "string";
                    readonly enum: readonly ["inline", "queued"];
                };
                readonly port: {
                    readonly type: "number";
                };
                readonly dataDir: {
                    readonly type: "string";
                };
                readonly databaseProvider: {
                    readonly type: "string";
                    readonly enum: readonly ["file", "supabase", "postgres"];
                };
                readonly browserProvider: {
                    readonly type: "string";
                    readonly enum: readonly ["mock", "playwright"];
                };
                readonly smsProvider: {
                    readonly type: "string";
                    readonly enum: readonly ["mock", "twilio"];
                };
                readonly emailProvider: {
                    readonly type: "string";
                    readonly enum: readonly ["mock", "webhook"];
                };
                readonly ocrProvider: {
                    readonly type: "string";
                    readonly enum: readonly ["mock", "http"];
                };
                readonly redisEnabled: {
                    readonly type: "boolean";
                };
                readonly maxRetries: {
                    readonly type: "number";
                };
            };
        };
        readonly approvalPolicy: {
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
        readonly summary: {
            readonly type: "object";
            readonly required: readonly ["tenantRuleCount", "communicationTemplateCount", "suppressionRuleCount", "editableMemoryCount", "recentAuditEntries"];
            readonly properties: {
                readonly tenantRuleCount: {
                    readonly type: "number";
                };
                readonly communicationTemplateCount: {
                    readonly type: "number";
                };
                readonly suppressionRuleCount: {
                    readonly type: "number";
                };
                readonly editableMemoryCount: {
                    readonly type: "number";
                };
                readonly recentAuditEntries: {
                    readonly type: "number";
                };
            };
        };
        readonly orchestrationHistory: {
            readonly type: "object";
            readonly required: readonly ["summary", "recent"];
            readonly properties: {
                readonly summary: {
                    readonly type: "object";
                    readonly required: readonly ["total", "completed", "failed", "approvalGated", "externalCapable", "uniqueJobs", "byPhase", "byAgent"];
                    readonly properties: {
                        readonly total: {
                            readonly type: "number";
                        };
                        readonly completed: {
                            readonly type: "number";
                        };
                        readonly failed: {
                            readonly type: "number";
                        };
                        readonly approvalGated: {
                            readonly type: "number";
                        };
                        readonly externalCapable: {
                            readonly type: "number";
                        };
                        readonly uniqueJobs: {
                            readonly type: "number";
                        };
                        readonly byPhase: {
                            readonly type: "object";
                        };
                        readonly byAgent: {
                            readonly type: "object";
                        };
                    };
                };
                readonly recent: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["invocationId", "phase", "agentId", "agentTitle", "selection", "status", "startedAt", "completedAt", "durationMs", "summary"];
                        readonly properties: {
                            readonly invocationId: {
                                readonly type: "string";
                            };
                            readonly phase: {
                                readonly type: "string";
                                readonly enum: readonly ["routing", "planning", "research", "execution", "communication", "verification", "memory", "reporting"];
                            };
                            readonly agentId: {
                                readonly type: "string";
                                readonly enum: readonly ["router-agent", "planner-agent", "research-agent", "execution-agent", "communication-agent", "verification-agent", "memory-agent", "reporting-agent"];
                            };
                            readonly agentTitle: {
                                readonly type: "string";
                            };
                            readonly selection: {
                                readonly type: "object";
                                readonly required: readonly ["phase", "agentId", "agentTitle", "capability", "permissionScope", "mayUseExternalTools", "requiresApprovalForExternalActions", "reason"];
                                readonly properties: {
                                    readonly phase: {
                                        readonly type: "string";
                                        readonly enum: readonly ["routing", "planning", "research", "execution", "communication", "verification", "memory", "reporting"];
                                    };
                                    readonly agentId: {
                                        readonly type: "string";
                                        readonly enum: readonly ["router-agent", "planner-agent", "research-agent", "execution-agent", "communication-agent", "verification-agent", "memory-agent", "reporting-agent"];
                                    };
                                    readonly agentTitle: {
                                        readonly type: "string";
                                    };
                                    readonly capability: {
                                        readonly type: "string";
                                    };
                                    readonly permissionScope: {
                                        readonly type: "string";
                                    };
                                    readonly mayUseExternalTools: {
                                        readonly type: "boolean";
                                    };
                                    readonly requiresApprovalForExternalActions: {
                                        readonly type: "boolean";
                                    };
                                    readonly reason: {
                                        readonly type: "string";
                                    };
                                };
                            };
                            readonly status: {
                                readonly type: "string";
                                readonly enum: readonly ["completed", "failed"];
                            };
                            readonly startedAt: {
                                readonly type: "string";
                            };
                            readonly completedAt: {
                                readonly type: "string";
                            };
                            readonly durationMs: {
                                readonly type: "number";
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
                            readonly stepId: {
                                readonly type: "string";
                            };
                            readonly stepType: {
                                readonly type: "string";
                            };
                            readonly summary: {
                                readonly type: "string";
                            };
                            readonly error: {
                                readonly type: "string";
                            };
                        };
                    };
                };
            };
        };
        readonly tenantRules: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["tenantId", "product", "approvalMode", "doNotContactWindowHours", "defaultTone", "messageTemplates", "updatedAt", "metadata"];
                readonly properties: {
                    readonly tenantId: {
                        readonly type: "string";
                    };
                    readonly product: {
                        readonly type: "string";
                    };
                    readonly approvalMode: {
                        readonly type: "string";
                        readonly enum: readonly ["assist", "autonomous"];
                    };
                    readonly doNotContactWindowHours: {
                        readonly type: "number";
                    };
                    readonly defaultTone: {
                        readonly type: "string";
                        readonly enum: readonly ["business-safe", "warm", "urgent"];
                    };
                    readonly messageTemplates: {
                        readonly type: "object";
                    };
                    readonly businessHours: {
                        readonly type: "object";
                    };
                    readonly updatedAt: {
                        readonly type: "string";
                    };
                    readonly metadata: {
                        readonly type: "object";
                    };
                };
            };
        };
        readonly communicationTemplates: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["key", "title", "body", "tone", "product", "editable", "source", "updatedAt"];
                readonly properties: {
                    readonly key: {
                        readonly type: "string";
                    };
                    readonly title: {
                        readonly type: "string";
                    };
                    readonly body: {
                        readonly type: "string";
                    };
                    readonly tone: {
                        readonly type: "string";
                        readonly enum: readonly ["business-safe", "warm", "urgent"];
                    };
                    readonly product: {
                        readonly type: "string";
                    };
                    readonly editable: {
                        readonly type: "boolean";
                    };
                    readonly source: {
                        readonly type: "string";
                        readonly enum: readonly ["memory", "default", "runtime"];
                    };
                    readonly updatedAt: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly suppressionRules: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["key", "title", "description", "product", "enabled", "source"];
                readonly properties: {
                    readonly key: {
                        readonly type: "string";
                    };
                    readonly title: {
                        readonly type: "string";
                    };
                    readonly description: {
                        readonly type: "string";
                    };
                    readonly product: {
                        readonly type: "string";
                    };
                    readonly enabled: {
                        readonly type: "boolean";
                    };
                    readonly source: {
                        readonly type: "string";
                        readonly enum: readonly ["memory", "default", "runtime"];
                    };
                    readonly windowHours: {
                        readonly type: "number";
                    };
                };
            };
        };
        readonly memoryPatterns: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["id", "tenantId", "product", "category", "key", "value", "confidence", "editable", "createdAt", "updatedAt", "summary"];
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                    };
                    readonly tenantId: {
                        readonly type: "string";
                    };
                    readonly product: {
                        readonly type: "string";
                    };
                    readonly category: {
                        readonly type: "string";
                    };
                    readonly key: {
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
                    readonly sourceJobId: {
                        readonly type: "string";
                    };
                    readonly sourceStepId: {
                        readonly type: "string";
                    };
                    readonly editable: {
                        readonly type: "boolean";
                    };
                    readonly createdAt: {
                        readonly type: "string";
                    };
                    readonly updatedAt: {
                        readonly type: "string";
                    };
                    readonly summary: {
                        readonly type: "string";
                    };
                    readonly sourceLabel: {
                        readonly type: "string";
                    };
                    readonly sourceStepLabel: {
                        readonly type: "string";
                    };
                    readonly auditTrail: {
                        readonly type: "array";
                        readonly items: {
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
                    };
                };
            };
        };
        readonly auditTrail: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["id", "at", "tenantId", "product", "category", "key", "confidence", "editable", "summary"];
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                    };
                    readonly at: {
                        readonly type: "string";
                    };
                    readonly tenantId: {
                        readonly type: "string";
                    };
                    readonly product: {
                        readonly type: "string";
                    };
                    readonly category: {
                        readonly type: "string";
                    };
                    readonly key: {
                        readonly type: "string";
                    };
                    readonly confidence: {
                        readonly type: "number";
                    };
                    readonly editable: {
                        readonly type: "boolean";
                    };
                    readonly sourceJobId: {
                        readonly type: "string";
                    };
                    readonly sourceStepId: {
                        readonly type: "string";
                    };
                    readonly summary: {
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
                };
            };
        };
    };
};
