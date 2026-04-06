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
};
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
};
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
};
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
};
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
};
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
};
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
};
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
};
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
};
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
};
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
};
export { dashboardActionPreviewSchema, dashboardAlertSchema, dashboardApprovalQueueItemSchema, dashboardApprovalQueueResponseSchema, dashboardApprovalQueueSummarySchema, dashboardEnvelopeSchema, dashboardJobDetailRecordSchema, dashboardJobDetailResponseSchema, dashboardJobListItemSchema, dashboardJobListResponseSchema, dashboardJobListSummarySchema, dashboardJobSurfaceSchema, dashboardLeadRecoveryPanelResponseSchema, dashboardLogEntrySchema, dashboardLogFeedResponseSchema, dashboardLogFeedSummarySchema, dashboardMemoryAuditEntrySchema, dashboardMemoryItemSchema, dashboardMemoryViewResponseSchema, dashboardMemoryViewSummarySchema, dashboardMetricSchema, dashboardNeuroMovesPanelResponseSchema, dashboardNexusBuildPanelResponseSchema, dashboardOverviewResponseSchema, dashboardPageInfoSchema, dashboardProductCardSchema, dashboardProductPanelBaseSchema, dashboardSettingsCommunicationTemplateSchema, dashboardSettingsOrchestrationHistorySchema, dashboardOrchestrationHistoryItemSchema, dashboardSettingsOrchestrationHistorySummarySchema, dashboardSettingsResponseSchema, dashboardSettingsRuntimeSummarySchema, dashboardSettingsSuppressionRuleSchema, dashboardSettingsSummarySchema, dashboardSettingsTenantRuleSchema, dashboardProductPanelResponseSchema, dashboardProvLyPanelResponseSchema, dashboardQuerySchema, dashboardRecurringJobItemSchema, dashboardRetryViewSchema, dashboardStepTimelineItemSchema, dashboardWorkflowActivityProductItemSchema, dashboardWorkflowActivityResponseSchema, dashboardWorkflowActivitySummarySchema, } from "./dashboard.js";
export { accessDecisionSchema, approvalPolicySchema, jobEscalationSchema, memoryAuditEntrySchema, memoryEditRequestSchema, principalRoleSchema, } from "./security.js";
export { stage3DatabaseQueryResultSchema, stage3DatabaseQuerySchema, stage3RetryPolicySchema, stage3ToolDescriptorSchema, stage3ToolInvocationSchema, stage3ToolOutcomeSchema, stage3ToolPermissionSchema, stage3ToolPolicySchema, stage3ToolRuntimeSnapshotSchema, stage3ToolScopeSchema, } from "./tools.js";
export { stage2AgentDescriptorSchema, stage2AgentPermissionSchema, stage2AgentRegistrySchema, stage2AgentResponsibilitySchema, stage2MessageDraftSchema, stage2MessageRequestSchema, stage2ResearchRequestSchema, stage2ResearchResultSchema, } from "./agents.js";
export { provlyAnalysisReportSchema, provlyAttachmentSchema, provlyClaimExportSchema, provlyCompletenessIssueSchema, provlyCompletenessSummarySchema, provlyIntakeSchema, provlyInventoryCategorySchema, provlyInventoryItemSchema, provlyReceiptSchema, provlyRoomSchema, provlyUserPreferenceSchema, } from "./provly.js";
export { nexusBuildAnalysisReportSchema, nexusBuildCompatibilityIssueSchema, nexusBuildCompatibilitySummarySchema, nexusBuildComparisonSummarySchema, nexusBuildIntakeSchema, nexusBuildPartSchema, nexusBuildPerformanceSummarySchema, nexusBuildPricingSnapshotSchema, nexusBuildPriceSourceSchema, nexusBuildRecommendationRunSchema, nexusBuildRecommendationSummarySchema, nexusBuildReportSchema, nexusBuildSavedBuildSchema, nexusBuildSnapshotSchema, nexusBuildUserPreferenceSchema, nexusBuildValueSummarySchema, } from "./nexusbuild.js";
//# sourceMappingURL=index.js.map