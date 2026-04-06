export const goalInputSchema = {
  type: "object",
  required: ["goal", "product", "priority", "constraints", "mode", "tenantId"],
  properties: {
    goal: { type: "string" },
    product: { type: "string" },
    priority: { type: "string" },
    constraints: { type: "array", items: { type: "string" } },
    mode: { type: "string", enum: ["assist", "autonomous"] },
    tenantId: { type: "string" },
    requestedBy: { type: "string" },
    source: { type: "string", enum: ["user", "system"] },
    payload: { type: "object" },
  },
} as const;

export const jobRecordSchema = {
  type: "object",
  required: ["jobId", "tenantId", "goal", "status", "createdAt", "updatedAt", "steps", "logs"],
  properties: {
    jobId: { type: "string" },
    tenantId: { type: "string" },
    status: { type: "string" },
    approvalStatus: { type: "string", enum: ["not_required", "pending", "approved", "rejected"] },
    steps: { type: "array" },
    logs: { type: "array" },
    route: { type: "object" },
    plan: { type: "object" },
    result: { type: "object" },
  },
} as const;

export const memoryEntrySchema = {
  type: "object",
  required: ["id", "tenantId", "product", "category", "key", "confidence", "createdAt", "updatedAt"],
  properties: {
    id: { type: "string" },
    tenantId: { type: "string" },
    product: { type: "string" },
    category: { type: "string" },
    key: { type: "string" },
    value: { oneOf: [{ type: "string" }, { type: "object" }] },
    confidence: { type: "number" },
    sourceJobId: { type: "string" },
    sourceStepId: { type: "string" },
    editable: { type: "boolean" },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
  },
} as const;

export const workflowLogSchema = {
  type: "object",
  required: ["id", "at", "level", "message"],
  properties: {
    id: { type: "string" },
    at: { type: "string" },
    level: { type: "string", enum: ["debug", "info", "warn", "error"] },
    message: { type: "string" },
    data: { type: "object" },
  },
} as const;

export const leadRecordSchema = {
  type: "object",
  required: ["leadId", "tenantId", "phone", "stage", "doNotContact", "communicationTone", "contactedWithin48h", "metadata"],
  properties: {
    leadId: { type: "string" },
    tenantId: { type: "string" },
    phone: { type: "string" },
    name: { type: "string" },
    email: { type: "string" },
    stage: { type: "string", enum: ["new", "contacted", "replied", "qualified", "opted_out", "blocked"] },
    doNotContact: { type: "boolean" },
    communicationTone: { type: "string", enum: ["business-safe", "warm", "urgent"] },
    notes: { type: "string" },
    lastInboundAt: { type: "string" },
    lastOutboundAt: { type: "string" },
    lastContactedAt: { type: "string" },
    contactedWithin48h: { type: "boolean" },
    metadata: { type: "object" },
  },
} as const;

export const leadRecoveryEventSchema = {
  type: "object",
  required: ["eventId", "tenantId", "callerPhone", "calledNumber", "missedAt", "source", "metadata"],
  properties: {
    eventId: { type: "string" },
    tenantId: { type: "string" },
    callerPhone: { type: "string" },
    calledNumber: { type: "string" },
    missedAt: { type: "string" },
    callSid: { type: "string" },
    source: { type: "string", enum: ["webhook", "import", "manual"] },
    metadata: { type: "object" },
  },
} as const;

export const leadInteractionSchema = {
  type: "object",
  required: ["interactionId", "tenantId", "leadId", "channel", "direction", "summary", "at", "metadata"],
  properties: {
    interactionId: { type: "string" },
    tenantId: { type: "string" },
    leadId: { type: "string" },
    channel: { type: "string", enum: ["sms", "email", "call", "note"] },
    direction: { type: "string", enum: ["inbound", "outbound", "internal"] },
    summary: { type: "string" },
    at: { type: "string" },
    metadata: { type: "object" },
  },
} as const;

export const smsMessageSchema = {
  type: "object",
  required: ["to", "from", "body"],
  properties: {
    to: { type: "string" },
    from: { type: "string" },
    body: { type: "string" },
    tenantId: { type: "string" },
    provider: { type: "string" },
    messageId: { type: "string" },
    status: { type: "string", enum: ["queued", "sent", "delivered", "failed", "unknown"] },
    error: { type: "string" },
    sentAt: { type: "string" },
  },
} as const;

export const tenantRulesSchema = {
  type: "object",
  required: ["tenantId", "product", "approvalMode", "doNotContactWindowHours", "defaultTone", "messageTemplates", "updatedAt", "metadata"],
  properties: {
    tenantId: { type: "string" },
    product: { type: "string" },
    approvalMode: { type: "string", enum: ["assist", "autonomous"] },
    doNotContactWindowHours: { type: "number" },
    defaultTone: { type: "string", enum: ["business-safe", "warm", "urgent"] },
    messageTemplates: { type: "object" },
    businessHours: { type: "object" },
    updatedAt: { type: "string" },
    metadata: { type: "object" },
  },
} as const;

export const optOutStatusSchema = {
  type: "object",
  required: ["tenantId", "phone", "status", "source", "updatedAt", "metadata"],
  properties: {
    tenantId: { type: "string" },
    leadId: { type: "string" },
    phone: { type: "string" },
    status: { type: "string", enum: ["active", "opted_out", "blocked"] },
    source: { type: "string", enum: ["manual", "workflow", "twilio", "import"] },
    updatedAt: { type: "string" },
    metadata: { type: "object" },
  },
} as const;

export const memoryPatternSchema = {
  type: "object",
  required: ["id", "tenantId", "product", "key", "patternType", "input", "output", "confidence", "editable", "createdAt", "updatedAt"],
  properties: {
    id: { type: "string" },
    tenantId: { type: "string" },
    product: { type: "string" },
    key: { type: "string" },
    patternType: { type: "string", enum: ["workflow-template", "message-template", "suppression-rule", "safety-rule"] },
    input: { type: "object" },
    output: { type: "object" },
    confidence: { type: "number" },
    sourceJobId: { type: "string" },
    sourceStepId: { type: "string" },
    editable: { type: "boolean" },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
  },
} as const;

export {
  dashboardActionPreviewSchema,
  dashboardAlertSchema,
  dashboardApprovalQueueItemSchema,
  dashboardApprovalQueueResponseSchema,
  dashboardApprovalQueueSummarySchema,
  dashboardEnvelopeSchema,
  dashboardJobDetailRecordSchema,
  dashboardJobDetailResponseSchema,
  dashboardJobListItemSchema,
  dashboardJobListResponseSchema,
  dashboardJobListSummarySchema,
  dashboardJobSurfaceSchema,
  dashboardLeadRecoveryPanelResponseSchema,
  dashboardLogEntrySchema,
  dashboardLogFeedResponseSchema,
  dashboardLogFeedSummarySchema,
  dashboardMemoryAuditEntrySchema,
  dashboardMemoryItemSchema,
  dashboardMemoryViewResponseSchema,
  dashboardMemoryViewSummarySchema,
  dashboardMetricSchema,
  dashboardNeuroMovesPanelResponseSchema,
  dashboardNexusBuildPanelResponseSchema,
  dashboardOverviewResponseSchema,
  dashboardPageInfoSchema,
  dashboardProductCardSchema,
  dashboardProductPanelBaseSchema,
  dashboardSettingsCommunicationTemplateSchema,
  dashboardSettingsOrchestrationHistorySchema,
  dashboardOrchestrationHistoryItemSchema,
  dashboardSettingsOrchestrationHistorySummarySchema,
  dashboardSettingsResponseSchema,
  dashboardSettingsRuntimeSummarySchema,
  dashboardSettingsSuppressionRuleSchema,
  dashboardSettingsSummarySchema,
  dashboardSettingsTenantRuleSchema,
  dashboardProductPanelResponseSchema,
  dashboardProvLyPanelResponseSchema,
  dashboardQuerySchema,
  dashboardRecurringJobItemSchema,
  dashboardRetryViewSchema,
  dashboardStepTimelineItemSchema,
  dashboardWorkflowActivityProductItemSchema,
  dashboardWorkflowActivityResponseSchema,
  dashboardWorkflowActivitySummarySchema,
} from "./dashboard.js";

export {
  accessDecisionSchema,
  approvalPolicySchema,
  jobEscalationSchema,
  memoryAuditEntrySchema,
  memoryEditRequestSchema,
  principalRoleSchema,
} from "./security.js";

export {
  stage3DatabaseQueryResultSchema,
  stage3DatabaseQuerySchema,
  stage3RetryPolicySchema,
  stage3ToolDescriptorSchema,
  stage3ToolInvocationSchema,
  stage3ToolOutcomeSchema,
  stage3ToolPermissionSchema,
  stage3ToolPolicySchema,
  stage3ToolRuntimeSnapshotSchema,
  stage3ToolScopeSchema,
} from "./tools.js";

export {
  stage2AgentDescriptorSchema,
  stage2AgentPermissionSchema,
  stage2AgentRegistrySchema,
  stage2AgentResponsibilitySchema,
  stage2MessageDraftSchema,
  stage2MessageRequestSchema,
  stage2ResearchRequestSchema,
  stage2ResearchResultSchema,
} from "./agents.js";

export {
  provlyAnalysisReportSchema,
  provlyAttachmentSchema,
  provlyClaimExportSchema,
  provlyCompletenessIssueSchema,
  provlyCompletenessSummarySchema,
  provlyIntakeSchema,
  provlyInventoryCategorySchema,
  provlyInventoryItemSchema,
  provlyReceiptSchema,
  provlyRoomSchema,
  provlyUserPreferenceSchema,
} from "./provly.js";

export {
  nexusBuildAnalysisReportSchema,
  nexusBuildCompatibilityIssueSchema,
  nexusBuildCompatibilitySummarySchema,
  nexusBuildComparisonSummarySchema,
  nexusBuildIntakeSchema,
  nexusBuildPartSchema,
  nexusBuildPerformanceSummarySchema,
  nexusBuildPricingSnapshotSchema,
  nexusBuildPriceSourceSchema,
  nexusBuildRecommendationRunSchema,
  nexusBuildRecommendationSummarySchema,
  nexusBuildReportSchema,
  nexusBuildSavedBuildSchema,
  nexusBuildSnapshotSchema,
  nexusBuildUserPreferenceSchema,
  nexusBuildValueSummarySchema,
} from "./nexusbuild.js";

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
