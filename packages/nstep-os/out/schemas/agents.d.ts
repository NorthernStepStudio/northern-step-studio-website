export declare const stage2ResearchRequestSchema: {
    readonly type: "object";
    readonly required: readonly ["subject", "sources"];
    readonly properties: {
        readonly goal: {
            readonly type: "object";
        };
        readonly subject: {
            readonly type: "string";
        };
        readonly sources: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly maxSources: {
            readonly type: "number";
        };
        readonly constraints: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly context: {
            readonly type: "object";
        };
    };
};
export declare const stage2ResearchResultSchema: {
    readonly type: "object";
    readonly required: readonly ["summary", "findings", "sourcesUsed", "confidence", "notes"];
    readonly properties: {
        readonly summary: {
            readonly type: "string";
        };
        readonly findings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly sourcesUsed: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly confidence: {
            readonly type: "number";
        };
        readonly notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
    };
};
export declare const stage2MessageRequestSchema: {
    readonly type: "object";
    readonly required: readonly ["subject", "audience", "tone", "channel", "context", "constraints"];
    readonly properties: {
        readonly goal: {
            readonly type: "object";
        };
        readonly subject: {
            readonly type: "string";
        };
        readonly audience: {
            readonly type: "string";
        };
        readonly tone: {
            readonly type: "string";
            readonly enum: readonly ["business-safe", "warm", "urgent"];
        };
        readonly channel: {
            readonly type: "string";
            readonly enum: readonly ["sms", "email", "internal"];
        };
        readonly context: {
            readonly type: "object";
        };
        readonly constraints: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly template: {
            readonly type: "string";
        };
    };
};
export declare const stage2MessageDraftSchema: {
    readonly type: "object";
    readonly required: readonly ["subject", "body", "tone", "channel", "notes"];
    readonly properties: {
        readonly subject: {
            readonly type: "string";
        };
        readonly body: {
            readonly type: "string";
        };
        readonly tone: {
            readonly type: "string";
            readonly enum: readonly ["business-safe", "warm", "urgent"];
        };
        readonly channel: {
            readonly type: "string";
            readonly enum: readonly ["sms", "email", "internal"];
        };
        readonly notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
    };
};
export declare const stage2AgentPermissionSchema: {
    readonly type: "object";
    readonly required: readonly ["scope", "capabilities", "mayUseExternalTools", "requiresApprovalForExternalActions", "description"];
    readonly properties: {
        readonly scope: {
            readonly type: "string";
        };
        readonly capabilities: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly mayUseExternalTools: {
            readonly type: "boolean";
        };
        readonly requiresApprovalForExternalActions: {
            readonly type: "boolean";
        };
        readonly description: {
            readonly type: "string";
        };
    };
};
export declare const stage2AgentResponsibilitySchema: {
    readonly type: "object";
    readonly required: readonly ["title", "summary", "stage1Touchpoints"];
    readonly properties: {
        readonly title: {
            readonly type: "string";
        };
        readonly summary: {
            readonly type: "string";
        };
        readonly stage1Touchpoints: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
    };
};
export declare const stage2AgentDescriptorSchema: {
    readonly type: "object";
    readonly required: readonly ["id", "title", "stage", "responsibilities", "permissions"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly enum: readonly ["router-agent", "planner-agent", "research-agent", "execution-agent", "communication-agent", "verification-agent", "memory-agent", "reporting-agent"];
        };
        readonly title: {
            readonly type: "string";
        };
        readonly stage: {
            readonly type: "string";
            readonly enum: readonly ["stage2"];
        };
        readonly responsibilities: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["title", "summary", "stage1Touchpoints"];
                readonly properties: {
                    readonly title: {
                        readonly type: "string";
                    };
                    readonly summary: {
                        readonly type: "string";
                    };
                    readonly stage1Touchpoints: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                };
            };
        };
        readonly permissions: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["scope", "capabilities", "mayUseExternalTools", "requiresApprovalForExternalActions", "description"];
                readonly properties: {
                    readonly scope: {
                        readonly type: "string";
                    };
                    readonly capabilities: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly mayUseExternalTools: {
                        readonly type: "boolean";
                    };
                    readonly requiresApprovalForExternalActions: {
                        readonly type: "boolean";
                    };
                    readonly description: {
                        readonly type: "string";
                    };
                };
            };
        };
    };
};
export declare const stage2AgentRegistrySchema: {
    readonly type: "object";
    readonly required: readonly ["count", "descriptors"];
    readonly properties: {
        readonly count: {
            readonly type: "number";
        };
        readonly agentIds: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly descriptors: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["id", "title", "stage", "responsibilities", "permissions"];
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                        readonly enum: readonly ["router-agent", "planner-agent", "research-agent", "execution-agent", "communication-agent", "verification-agent", "memory-agent", "reporting-agent"];
                    };
                    readonly title: {
                        readonly type: "string";
                    };
                    readonly stage: {
                        readonly type: "string";
                        readonly enum: readonly ["stage2"];
                    };
                    readonly responsibilities: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly required: readonly ["title", "summary", "stage1Touchpoints"];
                            readonly properties: {
                                readonly title: {
                                    readonly type: "string";
                                };
                                readonly summary: {
                                    readonly type: "string";
                                };
                                readonly stage1Touchpoints: {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                    };
                                };
                            };
                        };
                    };
                    readonly permissions: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly required: readonly ["scope", "capabilities", "mayUseExternalTools", "requiresApprovalForExternalActions", "description"];
                            readonly properties: {
                                readonly scope: {
                                    readonly type: "string";
                                };
                                readonly capabilities: {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                    };
                                };
                                readonly mayUseExternalTools: {
                                    readonly type: "boolean";
                                };
                                readonly requiresApprovalForExternalActions: {
                                    readonly type: "boolean";
                                };
                                readonly description: {
                                    readonly type: "string";
                                };
                            };
                        };
                    };
                };
            };
        };
        readonly bridgeConnected: {
            readonly type: "boolean";
        };
        readonly updatedAt: {
            readonly type: "string";
        };
    };
};
