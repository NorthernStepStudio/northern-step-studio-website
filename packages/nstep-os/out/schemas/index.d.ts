export declare const goalInputSchema: {
    readonly type: "object";
    readonly required: readonly ["goal", "product", "priority", "constraints", "mode", "tenantId"];
    readonly properties: {
        readonly goal: {
            readonly type: "string";
        };
        readonly product: {
            readonly type: "string";
        };
        readonly priority: {
            readonly type: "string";
        };
        readonly constraints: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly mode: {
            readonly type: "string";
            readonly enum: readonly ["assist", "autonomous"];
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly requestedBy: {
            readonly type: "string";
        };
        readonly source: {
            readonly type: "string";
            readonly enum: readonly ["user", "system"];
        };
        readonly payload: {
            readonly type: "object";
        };
    };
};
export declare const jobRecordSchema: {
    readonly type: "object";
    readonly required: readonly ["jobId", "tenantId", "goal", "status", "createdAt", "updatedAt", "steps", "logs"];
    readonly properties: {
        readonly jobId: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly status: {
            readonly type: "string";
        };
        readonly approvalStatus: {
            readonly type: "string";
            readonly enum: readonly ["not_required", "pending", "approved", "rejected"];
        };
        readonly steps: {
            readonly type: "array";
        };
        readonly logs: {
            readonly type: "array";
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
    };
};
export declare const memoryEntrySchema: {
    readonly type: "object";
    readonly required: readonly ["id", "tenantId", "product", "category", "key", "confidence", "createdAt", "updatedAt"];
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
    };
};
export declare const workflowLogSchema: {
    readonly type: "object";
    readonly required: readonly ["id", "at", "level", "message"];
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
        readonly data: {
            readonly type: "object";
        };
    };
};
export declare const leadRecordSchema: {
    readonly type: "object";
    readonly required: readonly ["leadId", "tenantId", "phone", "stage", "doNotContact", "communicationTone", "contactedWithin48h", "metadata"];
    readonly properties: {
        readonly leadId: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly phone: {
            readonly type: "string";
        };
        readonly name: {
            readonly type: "string";
        };
        readonly email: {
            readonly type: "string";
        };
        readonly stage: {
            readonly type: "string";
            readonly enum: readonly ["new", "contacted", "replied", "qualified", "opted_out", "blocked"];
        };
        readonly doNotContact: {
            readonly type: "boolean";
        };
        readonly communicationTone: {
            readonly type: "string";
            readonly enum: readonly ["business-safe", "warm", "urgent"];
        };
        readonly notes: {
            readonly type: "string";
        };
        readonly lastInboundAt: {
            readonly type: "string";
        };
        readonly lastOutboundAt: {
            readonly type: "string";
        };
        readonly lastContactedAt: {
            readonly type: "string";
        };
        readonly contactedWithin48h: {
            readonly type: "boolean";
        };
        readonly metadata: {
            readonly type: "object";
        };
    };
};
export declare const leadRecoveryEventSchema: {
    readonly type: "object";
    readonly required: readonly ["eventId", "tenantId", "callerPhone", "calledNumber", "missedAt", "source", "metadata"];
    readonly properties: {
        readonly eventId: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly callerPhone: {
            readonly type: "string";
        };
        readonly calledNumber: {
            readonly type: "string";
        };
        readonly missedAt: {
            readonly type: "string";
        };
        readonly callSid: {
            readonly type: "string";
        };
        readonly source: {
            readonly type: "string";
            readonly enum: readonly ["webhook", "import", "manual"];
        };
        readonly metadata: {
            readonly type: "object";
        };
    };
};
export declare const leadInteractionSchema: {
    readonly type: "object";
    readonly required: readonly ["interactionId", "tenantId", "leadId", "channel", "direction", "summary", "at", "metadata"];
    readonly properties: {
        readonly interactionId: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly leadId: {
            readonly type: "string";
        };
        readonly channel: {
            readonly type: "string";
            readonly enum: readonly ["sms", "email", "call", "note"];
        };
        readonly direction: {
            readonly type: "string";
            readonly enum: readonly ["inbound", "outbound", "internal"];
        };
        readonly summary: {
            readonly type: "string";
        };
        readonly at: {
            readonly type: "string";
        };
        readonly metadata: {
            readonly type: "object";
        };
    };
};
export declare const smsMessageSchema: {
    readonly type: "object";
    readonly required: readonly ["to", "from", "body"];
    readonly properties: {
        readonly to: {
            readonly type: "string";
        };
        readonly from: {
            readonly type: "string";
        };
        readonly body: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly provider: {
            readonly type: "string";
        };
        readonly messageId: {
            readonly type: "string";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["queued", "sent", "delivered", "failed", "unknown"];
        };
        readonly error: {
            readonly type: "string";
        };
        readonly sentAt: {
            readonly type: "string";
        };
    };
};
export declare const tenantRulesSchema: {
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
export declare const optOutStatusSchema: {
    readonly type: "object";
    readonly required: readonly ["tenantId", "phone", "status", "source", "updatedAt", "metadata"];
    readonly properties: {
        readonly tenantId: {
            readonly type: "string";
        };
        readonly leadId: {
            readonly type: "string";
        };
        readonly phone: {
            readonly type: "string";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["active", "opted_out", "blocked"];
        };
        readonly source: {
            readonly type: "string";
            readonly enum: readonly ["manual", "workflow", "twilio", "import"];
        };
        readonly updatedAt: {
            readonly type: "string";
        };
        readonly metadata: {
            readonly type: "object";
        };
    };
};
export declare const memoryPatternSchema: {
    readonly type: "object";
    readonly required: readonly ["id", "tenantId", "product", "key", "patternType", "input", "output", "confidence", "editable", "createdAt", "updatedAt"];
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
        readonly key: {
            readonly type: "string";
        };
        readonly patternType: {
            readonly type: "string";
            readonly enum: readonly ["workflow-template", "message-template", "suppression-rule", "safety-rule"];
        };
        readonly input: {
            readonly type: "object";
        };
        readonly output: {
            readonly type: "object";
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
    };
};
export { dashboardActionPreviewSchema, dashboardAlertSchema, dashboardApprovalQueueItemSchema, dashboardApprovalQueueResponseSchema, dashboardApprovalQueueSummarySchema, dashboardEnvelopeSchema, dashboardJobDetailRecordSchema, dashboardJobDetailResponseSchema, dashboardJobListItemSchema, dashboardJobListResponseSchema, dashboardJobListSummarySchema, dashboardJobSurfaceSchema, dashboardLeadRecoveryPanelResponseSchema, dashboardLogEntrySchema, dashboardLogFeedResponseSchema, dashboardLogFeedSummarySchema, dashboardMemoryAuditEntrySchema, dashboardMemoryItemSchema, dashboardMemoryViewResponseSchema, dashboardMemoryViewSummarySchema, dashboardMetricSchema, dashboardNeuroMovesPanelResponseSchema, dashboardNexusBuildPanelResponseSchema, dashboardOverviewResponseSchema, dashboardPageInfoSchema, dashboardProductCardSchema, dashboardProductPanelBaseSchema, dashboardSettingsCommunicationTemplateSchema, dashboardSettingsOrchestrationHistorySchema, dashboardOrchestrationHistoryItemSchema, dashboardSettingsOrchestrationHistorySummarySchema, dashboardSettingsResponseSchema, dashboardSettingsRuntimeSummarySchema, dashboardSettingsSuppressionRuleSchema, dashboardSettingsSummarySchema, dashboardSettingsTenantRuleSchema, dashboardProductPanelResponseSchema, dashboardProvLyPanelResponseSchema, dashboardQuerySchema, dashboardRecurringJobItemSchema, dashboardRetryViewSchema, dashboardStepTimelineItemSchema, dashboardWorkflowActivityProductItemSchema, dashboardWorkflowActivityResponseSchema, dashboardWorkflowActivitySummarySchema, } from "./dashboard.js";
export { accessDecisionSchema, approvalPolicySchema, jobEscalationSchema, memoryAuditEntrySchema, memoryEditRequestSchema, principalRoleSchema, } from "./security.js";
export { stage3DatabaseQueryResultSchema, stage3DatabaseQuerySchema, stage3RetryPolicySchema, stage3ToolDescriptorSchema, stage3ToolInvocationSchema, stage3ToolOutcomeSchema, stage3ToolPermissionSchema, stage3ToolPolicySchema, stage3ToolRuntimeSnapshotSchema, stage3ToolScopeSchema, } from "./tools.js";
export { stage2AgentDescriptorSchema, stage2AgentPermissionSchema, stage2AgentRegistrySchema, stage2AgentResponsibilitySchema, stage2MessageDraftSchema, stage2MessageRequestSchema, stage2ResearchRequestSchema, stage2ResearchResultSchema, } from "./agents.js";
export { provlyAnalysisReportSchema, provlyAttachmentSchema, provlyClaimExportSchema, provlyCompletenessIssueSchema, provlyCompletenessSummarySchema, provlyIntakeSchema, provlyInventoryCategorySchema, provlyInventoryItemSchema, provlyReceiptSchema, provlyRoomSchema, provlyUserPreferenceSchema, } from "./provly.js";
export { nexusBuildAnalysisReportSchema, nexusBuildCompatibilityIssueSchema, nexusBuildCompatibilitySummarySchema, nexusBuildComparisonSummarySchema, nexusBuildIntakeSchema, nexusBuildPartSchema, nexusBuildPerformanceSummarySchema, nexusBuildPricingSnapshotSchema, nexusBuildPriceSourceSchema, nexusBuildRecommendationRunSchema, nexusBuildRecommendationSummarySchema, nexusBuildReportSchema, nexusBuildSavedBuildSchema, nexusBuildSnapshotSchema, nexusBuildUserPreferenceSchema, nexusBuildValueSummarySchema, } from "./nexusbuild.js";
type ProvLySchemaModule = typeof import("./provly.js");
type NexusBuildSchemaModule = typeof import("./nexusbuild.js");
type Stage2SchemaModule = typeof import("./agents.js");
type Stage3SchemaModule = typeof import("./tools.js");
type DashboardSchemaModule = typeof import("./dashboard.js");
type SecuritySchemaModule = typeof import("./security.js");
export type SchemaMap = {
    readonly dashboardQuery: DashboardSchemaModule["dashboardQuerySchema"];
    readonly dashboardEnvelope: DashboardSchemaModule["dashboardEnvelopeSchema"];
    readonly dashboardPageInfo: DashboardSchemaModule["dashboardPageInfoSchema"];
    readonly dashboardMetric: DashboardSchemaModule["dashboardMetricSchema"];
    readonly dashboardAlert: DashboardSchemaModule["dashboardAlertSchema"];
    readonly dashboardActionPreview: DashboardSchemaModule["dashboardActionPreviewSchema"];
    readonly dashboardRetryView: DashboardSchemaModule["dashboardRetryViewSchema"];
    readonly dashboardJobSurface: DashboardSchemaModule["dashboardJobSurfaceSchema"];
    readonly dashboardJobListItem: DashboardSchemaModule["dashboardJobListItemSchema"];
    readonly dashboardJobDetailRecord: DashboardSchemaModule["dashboardJobDetailRecordSchema"];
    readonly dashboardStepTimelineItem: DashboardSchemaModule["dashboardStepTimelineItemSchema"];
    readonly dashboardJobListSummary: DashboardSchemaModule["dashboardJobListSummarySchema"];
    readonly dashboardJobListResponse: DashboardSchemaModule["dashboardJobListResponseSchema"];
    readonly dashboardJobDetailResponse: DashboardSchemaModule["dashboardJobDetailResponseSchema"];
    readonly dashboardApprovalQueueItem: DashboardSchemaModule["dashboardApprovalQueueItemSchema"];
    readonly dashboardApprovalQueueSummary: DashboardSchemaModule["dashboardApprovalQueueSummarySchema"];
    readonly dashboardApprovalQueueResponse: DashboardSchemaModule["dashboardApprovalQueueResponseSchema"];
    readonly dashboardLogEntry: DashboardSchemaModule["dashboardLogEntrySchema"];
    readonly dashboardLogFeedSummary: DashboardSchemaModule["dashboardLogFeedSummarySchema"];
    readonly dashboardLogFeedResponse: DashboardSchemaModule["dashboardLogFeedResponseSchema"];
    readonly dashboardRecurringJobItem: DashboardSchemaModule["dashboardRecurringJobItemSchema"];
    readonly dashboardWorkflowActivityProductItem: DashboardSchemaModule["dashboardWorkflowActivityProductItemSchema"];
    readonly dashboardWorkflowActivitySummary: DashboardSchemaModule["dashboardWorkflowActivitySummarySchema"];
    readonly dashboardWorkflowActivityResponse: DashboardSchemaModule["dashboardWorkflowActivityResponseSchema"];
    readonly dashboardSettingsRuntimeSummary: DashboardSchemaModule["dashboardSettingsRuntimeSummarySchema"];
    readonly dashboardSettingsCommunicationTemplate: DashboardSchemaModule["dashboardSettingsCommunicationTemplateSchema"];
    readonly dashboardSettingsOrchestrationHistory: DashboardSchemaModule["dashboardSettingsOrchestrationHistorySchema"];
    readonly dashboardSettingsOrchestrationHistoryItem: DashboardSchemaModule["dashboardOrchestrationHistoryItemSchema"];
    readonly dashboardSettingsOrchestrationHistorySummary: DashboardSchemaModule["dashboardSettingsOrchestrationHistorySummarySchema"];
    readonly dashboardSettingsSuppressionRule: DashboardSchemaModule["dashboardSettingsSuppressionRuleSchema"];
    readonly dashboardSettingsSummary: DashboardSchemaModule["dashboardSettingsSummarySchema"];
    readonly dashboardSettingsTenantRule: DashboardSchemaModule["dashboardSettingsTenantRuleSchema"];
    readonly dashboardSettingsResponse: DashboardSchemaModule["dashboardSettingsResponseSchema"];
    readonly dashboardMemoryItem: DashboardSchemaModule["dashboardMemoryItemSchema"];
    readonly dashboardMemoryAuditEntry: DashboardSchemaModule["dashboardMemoryAuditEntrySchema"];
    readonly dashboardMemoryViewSummary: DashboardSchemaModule["dashboardMemoryViewSummarySchema"];
    readonly dashboardMemoryViewResponse: DashboardSchemaModule["dashboardMemoryViewResponseSchema"];
    readonly dashboardProductCard: DashboardSchemaModule["dashboardProductCardSchema"];
    readonly dashboardOverviewResponse: DashboardSchemaModule["dashboardOverviewResponseSchema"];
    readonly dashboardProductPanelBase: DashboardSchemaModule["dashboardProductPanelBaseSchema"];
    readonly dashboardLeadRecoveryPanel: DashboardSchemaModule["dashboardLeadRecoveryPanelResponseSchema"];
    readonly dashboardNexusBuildPanel: DashboardSchemaModule["dashboardNexusBuildPanelResponseSchema"];
    readonly dashboardProvLyPanel: DashboardSchemaModule["dashboardProvLyPanelResponseSchema"];
    readonly dashboardNeuroMovesPanel: DashboardSchemaModule["dashboardNeuroMovesPanelResponseSchema"];
    readonly dashboardProductPanel: DashboardSchemaModule["dashboardProductPanelResponseSchema"];
    readonly principalRole: SecuritySchemaModule["principalRoleSchema"];
    readonly approvalPolicy: SecuritySchemaModule["approvalPolicySchema"];
    readonly accessDecision: SecuritySchemaModule["accessDecisionSchema"];
    readonly memoryAuditEntry: SecuritySchemaModule["memoryAuditEntrySchema"];
    readonly jobEscalation: SecuritySchemaModule["jobEscalationSchema"];
    readonly memoryEditRequest: SecuritySchemaModule["memoryEditRequestSchema"];
    readonly goalInput: typeof goalInputSchema;
    readonly jobRecord: typeof jobRecordSchema;
    readonly memoryEntry: typeof memoryEntrySchema;
    readonly workflowLog: typeof workflowLogSchema;
    readonly leadRecord: typeof leadRecordSchema;
    readonly leadRecoveryEvent: typeof leadRecoveryEventSchema;
    readonly leadInteraction: typeof leadInteractionSchema;
    readonly smsMessage: typeof smsMessageSchema;
    readonly tenantRules: typeof tenantRulesSchema;
    readonly optOutStatus: typeof optOutStatusSchema;
    readonly memoryPattern: typeof memoryPatternSchema;
    readonly stage3ToolScope: Stage3SchemaModule["stage3ToolScopeSchema"];
    readonly stage3ToolPermission: Stage3SchemaModule["stage3ToolPermissionSchema"];
    readonly stage3ToolDescriptor: Stage3SchemaModule["stage3ToolDescriptorSchema"];
    readonly stage3ToolInvocation: Stage3SchemaModule["stage3ToolInvocationSchema"];
    readonly stage3RetryPolicy: Stage3SchemaModule["stage3RetryPolicySchema"];
    readonly stage3ToolPolicy: Stage3SchemaModule["stage3ToolPolicySchema"];
    readonly stage3ToolOutcome: Stage3SchemaModule["stage3ToolOutcomeSchema"];
    readonly stage3DatabaseQuery: Stage3SchemaModule["stage3DatabaseQuerySchema"];
    readonly stage3DatabaseQueryResult: Stage3SchemaModule["stage3DatabaseQueryResultSchema"];
    readonly stage3ToolRuntimeSnapshot: Stage3SchemaModule["stage3ToolRuntimeSnapshotSchema"];
    readonly stage2ResearchRequest: Stage2SchemaModule["stage2ResearchRequestSchema"];
    readonly stage2ResearchResult: Stage2SchemaModule["stage2ResearchResultSchema"];
    readonly stage2MessageRequest: Stage2SchemaModule["stage2MessageRequestSchema"];
    readonly stage2MessageDraft: Stage2SchemaModule["stage2MessageDraftSchema"];
    readonly stage2AgentPermission: Stage2SchemaModule["stage2AgentPermissionSchema"];
    readonly stage2AgentResponsibility: Stage2SchemaModule["stage2AgentResponsibilitySchema"];
    readonly stage2AgentDescriptor: Stage2SchemaModule["stage2AgentDescriptorSchema"];
    readonly stage2AgentRegistry: Stage2SchemaModule["stage2AgentRegistrySchema"];
    readonly provlyInventoryItem: ProvLySchemaModule["provlyInventoryItemSchema"];
    readonly provlyInventoryCategory: ProvLySchemaModule["provlyInventoryCategorySchema"];
    readonly provlyRoom: ProvLySchemaModule["provlyRoomSchema"];
    readonly provlyAttachment: ProvLySchemaModule["provlyAttachmentSchema"];
    readonly provlyReceipt: ProvLySchemaModule["provlyReceiptSchema"];
    readonly provlyCompletenessIssue: ProvLySchemaModule["provlyCompletenessIssueSchema"];
    readonly provlyCompletenessSummary: ProvLySchemaModule["provlyCompletenessSummarySchema"];
    readonly provlyClaimExport: ProvLySchemaModule["provlyClaimExportSchema"];
    readonly provlyUserPreference: ProvLySchemaModule["provlyUserPreferenceSchema"];
    readonly provlyIntake: ProvLySchemaModule["provlyIntakeSchema"];
    readonly provlyAnalysisReport: ProvLySchemaModule["provlyAnalysisReportSchema"];
    readonly nexusBuildPart: NexusBuildSchemaModule["nexusBuildPartSchema"];
    readonly nexusBuildSnapshot: NexusBuildSchemaModule["nexusBuildSnapshotSchema"];
    readonly nexusBuildPriceSource: NexusBuildSchemaModule["nexusBuildPriceSourceSchema"];
    readonly nexusBuildCompatibilityIssue: NexusBuildSchemaModule["nexusBuildCompatibilityIssueSchema"];
    readonly nexusBuildCompatibilitySummary: NexusBuildSchemaModule["nexusBuildCompatibilitySummarySchema"];
    readonly nexusBuildPerformanceSummary: NexusBuildSchemaModule["nexusBuildPerformanceSummarySchema"];
    readonly nexusBuildValueSummary: NexusBuildSchemaModule["nexusBuildValueSummarySchema"];
    readonly nexusBuildRecommendationSummary: NexusBuildSchemaModule["nexusBuildRecommendationSummarySchema"];
    readonly nexusBuildComparisonSummary: NexusBuildSchemaModule["nexusBuildComparisonSummarySchema"];
    readonly nexusBuildPricingSnapshot: NexusBuildSchemaModule["nexusBuildPricingSnapshotSchema"];
    readonly nexusBuildAnalysisReport: NexusBuildSchemaModule["nexusBuildAnalysisReportSchema"];
    readonly nexusBuildRecommendationRun: NexusBuildSchemaModule["nexusBuildRecommendationRunSchema"];
    readonly nexusBuildSavedBuild: NexusBuildSchemaModule["nexusBuildSavedBuildSchema"];
    readonly nexusBuildUserPreference: NexusBuildSchemaModule["nexusBuildUserPreferenceSchema"];
    readonly nexusBuildIntake: NexusBuildSchemaModule["nexusBuildIntakeSchema"];
    readonly nexusBuildReport: NexusBuildSchemaModule["nexusBuildReportSchema"];
};
