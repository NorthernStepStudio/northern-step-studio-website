import { approvalPolicySchema, jobEscalationSchema, memoryAuditEntrySchema, principalRoleSchema } from "./security.js";

export const dashboardQuerySchema = {
  type: "object",
  properties: {
    tenantId: { type: "string" },
    product: { type: "string" },
    workflow: { type: "string" },
    jobId: { type: "string" },
    caseId: { type: "string" },
    status: { oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }] },
    approvalStatus: { oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }] },
    page: { type: "number" },
    pageSize: { type: "number" },
    search: { type: "string" },
    sortBy: { type: "string", enum: ["createdAt", "updatedAt", "status", "product", "priority"] },
    sortDirection: { type: "string", enum: ["asc", "desc"] },
    from: { type: "string" },
    to: { type: "string" },
    lane: { type: "string", enum: ["internal", "external", "mixed"] },
  },
} as const;

export const dashboardEnvelopeSchema = {
  type: "object",
  required: ["kind", "version", "generatedAt", "filters"],
  properties: {
    kind: { type: "string" },
    version: { type: "string", enum: ["stage-5"] },
    generatedAt: { type: "string" },
    tenantId: { type: "string" },
    filters: dashboardQuerySchema,
  },
} as const;

export const dashboardPageInfoSchema = {
  type: "object",
  required: ["page", "pageSize", "total", "hasMore"],
  properties: {
    page: { type: "number" },
    pageSize: { type: "number" },
    total: { type: "number" },
    hasMore: { type: "boolean" },
    nextPage: { type: "number" },
  },
} as const;

export const dashboardMetricSchema = {
  type: "object",
  required: ["label", "value", "tone"],
  properties: {
    label: { type: "string" },
    value: { oneOf: [{ type: "number" }, { type: "string" }] },
    detail: { type: "string" },
    tone: { type: "string", enum: ["neutral", "success", "warning", "danger", "accent"] },
    trend: {
      type: "object",
      required: ["direction", "value"],
      properties: {
        direction: { type: "string", enum: ["up", "down", "flat"] },
        value: { type: "number" },
        label: { type: "string" },
      },
    },
  },
} as const;

export const dashboardAlertSchema = {
  type: "object",
  required: ["id", "level", "title", "message", "createdAt", "metadata"],
  properties: {
    id: { type: "string" },
    level: { type: "string", enum: ["info", "success", "warning", "critical"] },
    title: { type: "string" },
    message: { type: "string" },
    createdAt: { type: "string" },
    relatedJobId: { type: "string" },
    relatedProduct: { type: "string" },
    actionLabel: { type: "string" },
    actionHref: { type: "string" },
    metadata: { type: "object" },
  },
} as const;

export const dashboardActionPreviewSchema = {
  type: "object",
  required: ["title", "body", "tool", "stepId", "stepType", "actionLabel", "data"],
  properties: {
    title: { type: "string" },
    body: { type: "string" },
    tool: { type: "string" },
    stepId: { type: "string" },
    stepType: { type: "string" },
    actionLabel: { type: "string" },
    data: { type: "object" },
  },
} as const;

export const dashboardRetryViewSchema = {
  type: "object",
  required: ["attempts", "maxAttempts", "retryable", "exhausted"],
  properties: {
    attempts: { type: "number" },
    maxAttempts: { type: "number" },
    retryable: { type: "boolean" },
    exhausted: { type: "boolean" },
    lastAttemptAt: { type: "string" },
    lastError: { type: "string" },
    nextRetryAt: { type: "string" },
  },
} as const;

export const dashboardJobSurfaceSchema = {
  type: "object",
  required: [
    "jobId",
    "tenantId",
    "product",
    "workflow",
    "goal",
    "priority",
    "mode",
    "status",
    "approvalStatus",
    "riskLevel",
    "lane",
    "createdAt",
    "updatedAt",
    "stepCount",
    "completedStepCount",
    "waitingApprovalStepCount",
    "failedStepCount",
    "retryableStepCount",
    "tags",
  ],
  properties: {
    jobId: { type: "string" },
    tenantId: { type: "string" },
    product: { type: "string" },
    workflow: { type: "string" },
    goal: { type: "string" },
    priority: { type: "string" },
    mode: { type: "string" },
    status: { type: "string" },
    approvalStatus: { type: "string" },
    riskLevel: { type: "string" },
    lane: { type: "string" },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
    currentStepId: { type: "string" },
    currentStepTitle: { type: "string" },
    currentStepType: { type: "string" },
    currentStepTool: { type: "string" },
    stepCount: { type: "number" },
    completedStepCount: { type: "number" },
    waitingApprovalStepCount: { type: "number" },
    failedStepCount: { type: "number" },
    retryableStepCount: { type: "number" },
    resultSummary: { type: "string" },
    error: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
  },
} as const;

export const dashboardJobListItemSchema = {
  type: "object",
  allOf: [dashboardJobSurfaceSchema],
  properties: {
    hasLogs: { type: "boolean" },
    hasMemoryUpdates: { type: "boolean" },
    lastLogAt: { type: "string" },
    approvalPreview: dashboardActionPreviewSchema,
  },
} as const;

export const dashboardJobDetailRecordSchema = {
  type: "object",
  allOf: [dashboardJobSurfaceSchema],
  properties: {
    goalPayload: { type: "object" },
    route: { type: "object" },
    plan: { type: "object" },
    result: { type: "object" },
    workflowStatus: { type: "object" },
    escalation: jobEscalationSchema,
    approvedStepIds: { type: "array", items: { type: "string" } },
    logCount: { type: "number" },
    memoryUpdateCount: { type: "number" },
  },
} as const;

export const dashboardJobDetailResponseSchema = {
  type: "object",
  allOf: [dashboardEnvelopeSchema],
  required: ["kind", "job", "timeline", "logs", "approvals", "memoryUpdates"],
  properties: {
    kind: { type: "string", enum: ["job-detail"] },
    job: dashboardJobDetailRecordSchema,
    timeline: { type: "array", items: { type: "object" } },
    logs: { type: "array", items: { type: "object" } },
    approvals: { type: "array", items: { type: "object" } },
    memoryUpdates: { type: "array", items: { type: "object" } },
    productPanel: { type: "object" },
  },
} as const;

export const dashboardStepTimelineItemSchema = {
  type: "object",
  required: ["stepId", "title", "type", "tool", "status", "dependsOn", "approvalRequired", "retryable", "attempts", "inputSummary"],
  properties: {
    stepId: { type: "string" },
    title: { type: "string" },
    type: { type: "string" },
    tool: { type: "string" },
    status: { type: "string" },
    dependsOn: { type: "array", items: { type: "string" } },
    approvalRequired: { type: "boolean" },
    retryable: { type: "boolean" },
    attempts: { type: "number" },
    startedAt: { type: "string" },
    completedAt: { type: "string" },
    message: { type: "string" },
    error: { type: "string" },
    retry: dashboardRetryViewSchema,
    inputSummary: { type: "string" },
    outputSummary: { type: "string" },
  },
} as const;

export const dashboardJobListSummarySchema = {
  type: "object",
  required: ["total", "running", "waitingApproval", "failed", "completed", "byStatus", "byProduct", "byWorkflow", "byApprovalStatus"],
  properties: {
    total: { type: "number" },
    running: { type: "number" },
    waitingApproval: { type: "number" },
    failed: { type: "number" },
    completed: { type: "number" },
    byStatus: { type: "object" },
    byProduct: { type: "object" },
    byWorkflow: { type: "object" },
    byApprovalStatus: { type: "object" },
  },
} as const;

export const dashboardJobListResponseSchema = {
  type: "object",
  allOf: [dashboardEnvelopeSchema],
  required: ["kind", "pageInfo", "summary", "items"],
  properties: {
    kind: { type: "string", enum: ["job-list"] },
    pageInfo: dashboardPageInfoSchema,
    summary: dashboardJobListSummarySchema,
    items: { type: "array", items: dashboardJobListItemSchema },
  },
} as const;

export const dashboardApprovalQueueItemSchema = {
  type: "object",
  allOf: [dashboardJobSurfaceSchema],
  required: ["stepId", "stepType", "stepTitle", "tool", "reason", "preview", "canApprove", "canReject", "canEdit", "retryable"],
  properties: {
    stepId: { type: "string" },
    stepType: { type: "string" },
    stepTitle: { type: "string" },
    tool: { type: "string" },
    reason: { type: "string" },
    preview: dashboardActionPreviewSchema,
    canApprove: { type: "boolean" },
    canReject: { type: "boolean" },
    canEdit: { type: "boolean" },
    retryable: { type: "boolean" },
  },
} as const;

export const dashboardApprovalQueueSummarySchema = {
  type: "object",
  required: ["total", "highRisk", "mediumRisk", "lowRisk", "byProduct", "byWorkflow", "byLane"],
  properties: {
    total: { type: "number" },
    highRisk: { type: "number" },
    mediumRisk: { type: "number" },
    lowRisk: { type: "number" },
    byProduct: { type: "object" },
    byWorkflow: { type: "object" },
    byLane: { type: "object" },
  },
} as const;

export const dashboardApprovalQueueResponseSchema = {
  type: "object",
  allOf: [dashboardEnvelopeSchema],
  required: ["kind", "pageInfo", "summary", "items"],
  properties: {
    kind: { type: "string", enum: ["approval-queue"] },
    pageInfo: dashboardPageInfoSchema,
    summary: dashboardApprovalQueueSummarySchema,
    items: { type: "array", items: dashboardApprovalQueueItemSchema },
  },
} as const;

export const dashboardLogEntrySchema = {
  type: "object",
  required: ["id", "at", "level", "message", "source"],
  properties: {
    id: { type: "string" },
    at: { type: "string" },
    level: { type: "string", enum: ["debug", "info", "warn", "error"] },
    message: { type: "string" },
    jobId: { type: "string" },
    tenantId: { type: "string" },
    product: { type: "string" },
    workflow: { type: "string" },
    stepId: { type: "string" },
    stepType: { type: "string" },
    tool: { type: "string" },
    agentId: { type: "string" },
    actorRole: principalRoleSchema,
    source: { type: "string", enum: ["job", "step", "system"] },
    data: { type: "object" },
  },
} as const;

export const dashboardLogFeedSummarySchema = {
  type: "object",
  required: ["total", "debug", "info", "warn", "error", "byProduct", "byWorkflow"],
  properties: {
    total: { type: "number" },
    debug: { type: "number" },
    info: { type: "number" },
    warn: { type: "number" },
    error: { type: "number" },
    byProduct: { type: "object" },
    byWorkflow: { type: "object" },
  },
} as const;

export const dashboardLogFeedResponseSchema = {
  type: "object",
  allOf: [dashboardEnvelopeSchema],
  required: ["kind", "pageInfo", "scope", "summary", "items"],
  properties: {
    kind: { type: "string", enum: ["log-feed"] },
    pageInfo: dashboardPageInfoSchema,
    scope: { type: "string", enum: ["global", "tenant", "job", "product"] },
    summary: dashboardLogFeedSummarySchema,
    items: { type: "array", items: dashboardLogEntrySchema },
  },
} as const;

export const dashboardRecurringJobItemSchema = {
  type: "object",
  required: ["jobId", "product", "workflow", "title", "runAt", "status", "source"],
  properties: {
    jobId: { type: "string" },
    product: { type: "string" },
    workflow: { type: "string" },
    title: { type: "string" },
    stepId: { type: "string" },
    runAt: { type: "string" },
    status: { type: "string" },
    detail: { type: "string" },
    source: { type: "string", enum: ["scheduler", "job-step", "goal-payload"] },
  },
} as const;

export const dashboardWorkflowActivityProductItemSchema = {
  type: "object",
  required: ["product", "title", "activeJobs", "runningJobs", "waitingApprovalJobs", "failedJobs", "completedJobs24h", "failedJobs24h", "laneBreakdown", "recentJobs", "recentCompletedRuns", "recentFailedRuns", "recurringJobs", "alerts"],
  properties: {
    product: { type: "string" },
    title: { type: "string" },
    activeJobs: { type: "number" },
    runningJobs: { type: "number" },
    waitingApprovalJobs: { type: "number" },
    failedJobs: { type: "number" },
    completedJobs24h: { type: "number" },
    failedJobs24h: { type: "number" },
    laneBreakdown: { type: "object" },
    recentJobs: { type: "array", items: dashboardJobListItemSchema },
    recentCompletedRuns: { type: "array", items: dashboardJobListItemSchema },
    recentFailedRuns: { type: "array", items: dashboardJobListItemSchema },
    recurringJobs: { type: "array", items: dashboardRecurringJobItemSchema },
    alerts: { type: "array", items: dashboardAlertSchema },
    lastActivityAt: { type: "string" },
  },
} as const;

export const dashboardWorkflowActivitySummarySchema = {
  type: "object",
  required: ["totalActiveJobs", "waitingApproval", "failed", "completed24h", "failed24h", "laneBreakdown"],
  properties: {
    totalActiveJobs: { type: "number" },
    waitingApproval: { type: "number" },
    failed: { type: "number" },
    completed24h: { type: "number" },
    failed24h: { type: "number" },
    laneBreakdown: { type: "object" },
  },
} as const;

export const dashboardWorkflowActivityResponseSchema = {
  type: "object",
  allOf: [dashboardEnvelopeSchema],
  required: ["kind", "summary", "products", "recentCompletedRuns", "recentFailedRuns", "recurringJobs", "alerts"],
  properties: {
    kind: { type: "string", enum: ["workflow-activity"] },
    summary: dashboardWorkflowActivitySummarySchema,
    products: { type: "array", items: dashboardWorkflowActivityProductItemSchema },
    recentCompletedRuns: { type: "array", items: dashboardJobListItemSchema },
    recentFailedRuns: { type: "array", items: dashboardJobListItemSchema },
    recurringJobs: { type: "array", items: dashboardRecurringJobItemSchema },
    alerts: { type: "array", items: dashboardAlertSchema },
  },
} as const;

export const dashboardMemoryItemSchema = {
  type: "object",
  required: ["id", "tenantId", "product", "category", "key", "value", "confidence", "editable", "createdAt", "updatedAt", "summary"],
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
    summary: { type: "string" },
    sourceLabel: { type: "string" },
    sourceStepLabel: { type: "string" },
    auditTrail: { type: "array", items: memoryAuditEntrySchema },
  },
} as const;

export const dashboardMemoryAuditEntrySchema = {
  type: "object",
  required: ["id", "at", "tenantId", "product", "category", "key", "confidence", "editable", "summary"],
  properties: {
    id: { type: "string" },
    at: { type: "string" },
    tenantId: { type: "string" },
    product: { type: "string" },
    category: { type: "string" },
    key: { type: "string" },
    confidence: { type: "number" },
    editable: { type: "boolean" },
    sourceJobId: { type: "string" },
    sourceStepId: { type: "string" },
    summary: { type: "string" },
    action: { type: "string", enum: ["create", "update", "edit", "archive", "restore"] },
    actorRole: principalRoleSchema,
    actorId: { type: "string" },
    note: { type: "string" },
  },
} as const;

export const dashboardMemoryViewSummarySchema = {
  type: "object",
  required: ["total", "editable", "byCategory", "byProduct", "patternCount", "recentUpdates"],
  properties: {
    total: { type: "number" },
    editable: { type: "number" },
    byCategory: { type: "object" },
    byProduct: { type: "object" },
    patternCount: { type: "number" },
    recentUpdates: { type: "number" },
  },
} as const;

export const dashboardMemoryViewResponseSchema = {
  type: "object",
  allOf: [dashboardEnvelopeSchema],
  required: ["kind", "pageInfo", "summary", "items", "patterns", "auditTrail"],
  properties: {
    kind: { type: "string", enum: ["memory-view"] },
    pageInfo: dashboardPageInfoSchema,
    summary: dashboardMemoryViewSummarySchema,
    items: { type: "array", items: dashboardMemoryItemSchema },
    patterns: { type: "array", items: dashboardMemoryItemSchema },
    auditTrail: { type: "array", items: dashboardMemoryAuditEntrySchema },
  },
} as const;

export const dashboardProductCardSchema = {
  type: "object",
  required: ["product", "title", "description", "primaryMetric", "secondaryMetrics", "activeJobs", "waitingApprovals", "alerts"],
  properties: {
    product: { type: "string" },
    title: { type: "string" },
    description: { type: "string" },
    primaryMetric: dashboardMetricSchema,
    secondaryMetrics: { type: "array", items: dashboardMetricSchema },
    activeJobs: { type: "number" },
    waitingApprovals: { type: "number" },
    alerts: { type: "number" },
    lastActivityAt: { type: "string" },
  },
} as const;

export const dashboardOverviewResponseSchema = {
  type: "object",
  allOf: [dashboardEnvelopeSchema],
  required: ["kind", "snapshot", "summaryCards", "alerts", "recentJobs", "recentApprovals", "recentLogs", "activity", "memory", "productCards"],
  properties: {
    kind: { type: "string", enum: ["overview"] },
    snapshot: { type: "object" },
    summaryCards: { type: "array", items: dashboardMetricSchema },
    alerts: { type: "array", items: dashboardAlertSchema },
    recentJobs: { type: "array", items: dashboardJobListItemSchema },
    recentApprovals: { type: "array", items: dashboardApprovalQueueItemSchema },
    recentLogs: { type: "array", items: dashboardLogEntrySchema },
    activity: {
      type: "object",
      required: ["summary", "recentCompletedRuns", "recentFailedRuns", "recurringJobs"],
      properties: {
        summary: dashboardWorkflowActivitySummarySchema,
        recentCompletedRuns: { type: "array", items: dashboardJobListItemSchema },
        recentFailedRuns: { type: "array", items: dashboardJobListItemSchema },
        recurringJobs: { type: "array", items: dashboardRecurringJobItemSchema },
      },
    },
    memory: {
      type: "object",
      required: ["total", "editable", "byCategory", "byProduct", "recent"],
      properties: {
        total: { type: "number" },
        editable: { type: "number" },
        byCategory: { type: "object" },
        byProduct: { type: "object" },
        recent: { type: "array", items: dashboardMemoryItemSchema },
      },
    },
    productCards: { type: "array", items: dashboardProductCardSchema },
  },
} as const;

export const dashboardProductPanelBaseSchema = {
  type: "object",
  allOf: [dashboardEnvelopeSchema],
  required: ["kind", "product", "title", "summary", "recentJobs", "alerts", "recentMemory"],
  properties: {
    kind: { type: "string", enum: ["product-panel"] },
    product: { type: "string" },
    title: { type: "string" },
    summary: {
      type: "object",
      required: ["title", "description", "primaryMetric", "secondaryMetrics"],
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        primaryMetric: dashboardMetricSchema,
        secondaryMetrics: { type: "array", items: dashboardMetricSchema },
      },
    },
    recentJobs: { type: "array", items: dashboardJobListItemSchema },
    alerts: { type: "array", items: dashboardAlertSchema },
    recentMemory: { type: "array", items: dashboardMemoryItemSchema },
  },
} as const;

export const dashboardLeadRecoveryPanelResponseSchema = {
  type: "object",
  allOf: [dashboardProductPanelBaseSchema],
  properties: {
    product: { type: "string", enum: ["lead-recovery"] },
    resultSummary: { type: "object" },
    leadSummary: { type: "object" },
    recentResults: { type: "array", items: { type: "object" } },
    approvalItems: { type: "array", items: dashboardApprovalQueueItemSchema },
    suppressionSummary: { type: "object" },
    recentLeads: { type: "array", items: { type: "object" } },
    recentInteractions: { type: "array", items: { type: "object" } },
    recentCallEvents: { type: "array", items: { type: "object" } },
    messageTemplates: { type: "array", items: { type: "object" } },
  },
} as const;

export const dashboardNexusBuildPanelResponseSchema = {
  type: "object",
  allOf: [dashboardProductPanelBaseSchema],
  properties: {
    product: { type: "string", enum: ["nexusbuild"] },
    buildSummary: { type: "object" },
    compatibilitySummary: { type: "object" },
    pricingSummary: { type: "object" },
    savedBuilds: { type: "array", items: { type: "object" } },
    latestReports: { type: "array", items: { type: "object" } },
    latestRecommendationRuns: { type: "array", items: { type: "object" } },
    latestReport: { type: "object" },
  },
} as const;

export const dashboardProvLyPanelResponseSchema = {
  type: "object",
  allOf: [dashboardProductPanelBaseSchema],
  properties: {
    product: { type: "string", enum: ["provly"] },
    inventorySummary: { type: "object" },
    claimSummary: { type: "object" },
    rooms: { type: "array", items: { type: "object" } },
    categories: { type: "array", items: { type: "object" } },
    latestExports: { type: "array", items: { type: "object" } },
    latestReports: { type: "array", items: { type: "object" } },
    latestReport: { type: "object" },
    highValueItems: { type: "array", items: { type: "object" } },
    reminders: { type: "array", items: { type: "string" } },
    userPreferences: { type: "array", items: { type: "object" } },
  },
} as const;

export const dashboardNeuroMovesPanelResponseSchema = {
  type: "object",
  allOf: [dashboardProductPanelBaseSchema],
  properties: {
    product: { type: "string", enum: ["neurormoves"] },
    routineSummary: { type: "object" },
    routinePatterns: { type: "array", items: { type: "object" } },
    recentCheckIns: { type: "array", items: dashboardRecurringJobItemSchema },
    recentSummaries: { type: "array", items: { type: "object" } },
  },
} as const;

export const dashboardProductPanelResponseSchema = {
  oneOf: [
    dashboardLeadRecoveryPanelResponseSchema,
    dashboardNexusBuildPanelResponseSchema,
    dashboardProvLyPanelResponseSchema,
    dashboardNeuroMovesPanelResponseSchema,
  ],
} as const;

export const dashboardSettingsRuntimeSummarySchema = {
  type: "object",
  required: [
    "serviceName",
    "providerMode",
    "executionMode",
    "port",
    "dataDir",
    "databaseProvider",
    "browserProvider",
    "smsProvider",
    "emailProvider",
    "ocrProvider",
    "redisEnabled",
    "maxRetries",
  ],
  properties: {
    serviceName: { type: "string" },
    providerMode: { type: "string", enum: ["mock", "openai", "gemini"] },
    executionMode: { type: "string", enum: ["inline", "queued"] },
    port: { type: "number" },
    dataDir: { type: "string" },
    databaseProvider: { type: "string", enum: ["file", "supabase", "postgres"] },
    browserProvider: { type: "string", enum: ["mock", "playwright"] },
    smsProvider: { type: "string", enum: ["mock", "twilio"] },
    emailProvider: { type: "string", enum: ["mock", "webhook"] },
    ocrProvider: { type: "string", enum: ["mock", "http"] },
    redisEnabled: { type: "boolean" },
    maxRetries: { type: "number" },
  },
} as const;

export const dashboardSettingsCommunicationTemplateSchema = {
  type: "object",
  required: ["key", "title", "body", "tone", "product", "editable", "source", "updatedAt"],
  properties: {
    key: { type: "string" },
    title: { type: "string" },
    body: { type: "string" },
    tone: { type: "string", enum: ["business-safe", "warm", "urgent"] },
    product: { type: "string" },
    editable: { type: "boolean" },
    source: { type: "string", enum: ["memory", "default", "runtime"] },
    updatedAt: { type: "string" },
  },
} as const;

export const dashboardSettingsSuppressionRuleSchema = {
  type: "object",
  required: ["key", "title", "description", "product", "enabled", "source"],
  properties: {
    key: { type: "string" },
    title: { type: "string" },
    description: { type: "string" },
    product: { type: "string" },
    enabled: { type: "boolean" },
    source: { type: "string", enum: ["memory", "default", "runtime"] },
    windowHours: { type: "number" },
  },
} as const;

export const dashboardSettingsSummarySchema = {
  type: "object",
  required: ["tenantRuleCount", "communicationTemplateCount", "suppressionRuleCount", "editableMemoryCount", "recentAuditEntries"],
  properties: {
    tenantRuleCount: { type: "number" },
    communicationTemplateCount: { type: "number" },
    suppressionRuleCount: { type: "number" },
    editableMemoryCount: { type: "number" },
    recentAuditEntries: { type: "number" },
  },
} as const;

const orchestrationPhaseValues = ["routing", "planning", "research", "execution", "communication", "verification", "memory", "reporting"] as const;
const orchestrationAgentValues = [
  "router-agent",
  "planner-agent",
  "research-agent",
  "execution-agent",
  "communication-agent",
  "verification-agent",
  "memory-agent",
  "reporting-agent",
] as const;

export const dashboardOrchestrationHistoryItemSchema = {
  type: "object",
  required: [
    "invocationId",
    "phase",
    "agentId",
    "agentTitle",
    "selection",
    "status",
    "startedAt",
    "completedAt",
    "durationMs",
    "summary",
  ],
  properties: {
    invocationId: { type: "string" },
    phase: { type: "string", enum: orchestrationPhaseValues },
    agentId: { type: "string", enum: orchestrationAgentValues },
    agentTitle: { type: "string" },
    selection: {
      type: "object",
      required: ["phase", "agentId", "agentTitle", "capability", "permissionScope", "mayUseExternalTools", "requiresApprovalForExternalActions", "reason"],
      properties: {
        phase: { type: "string", enum: orchestrationPhaseValues },
        agentId: { type: "string", enum: orchestrationAgentValues },
        agentTitle: { type: "string" },
        capability: { type: "string" },
        permissionScope: { type: "string" },
        mayUseExternalTools: { type: "boolean" },
        requiresApprovalForExternalActions: { type: "boolean" },
        reason: { type: "string" },
      },
    },
    status: { type: "string", enum: ["completed", "failed"] },
    startedAt: { type: "string" },
    completedAt: { type: "string" },
    durationMs: { type: "number" },
    jobId: { type: "string" },
    tenantId: { type: "string" },
    product: { type: "string" },
    workflow: { type: "string" },
    stepId: { type: "string" },
    stepType: { type: "string" },
    summary: { type: "string" },
    error: { type: "string" },
  },
} as const;

export const dashboardSettingsOrchestrationHistorySummarySchema = {
  type: "object",
  required: ["total", "completed", "failed", "approvalGated", "externalCapable", "uniqueJobs", "byPhase", "byAgent"],
  properties: {
    total: { type: "number" },
    completed: { type: "number" },
    failed: { type: "number" },
    approvalGated: { type: "number" },
    externalCapable: { type: "number" },
    uniqueJobs: { type: "number" },
    byPhase: { type: "object" },
    byAgent: { type: "object" },
  },
} as const;

export const dashboardSettingsOrchestrationHistorySchema = {
  type: "object",
  required: ["summary", "recent"],
  properties: {
    summary: dashboardSettingsOrchestrationHistorySummarySchema,
    recent: { type: "array", items: dashboardOrchestrationHistoryItemSchema },
  },
} as const;

export const dashboardSettingsTenantRuleSchema = {
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

export const dashboardSettingsResponseSchema = {
  type: "object",
  allOf: [dashboardEnvelopeSchema],
  required: ["kind", "runtime", "approvalPolicy", "summary", "orchestrationHistory", "tenantRules", "communicationTemplates", "suppressionRules", "memoryPatterns", "auditTrail"],
  properties: {
    kind: { type: "string", enum: ["settings"] },
    runtime: dashboardSettingsRuntimeSummarySchema,
    approvalPolicy: approvalPolicySchema,
    summary: dashboardSettingsSummarySchema,
    orchestrationHistory: dashboardSettingsOrchestrationHistorySchema,
    tenantRules: { type: "array", items: dashboardSettingsTenantRuleSchema },
    communicationTemplates: { type: "array", items: dashboardSettingsCommunicationTemplateSchema },
    suppressionRules: { type: "array", items: dashboardSettingsSuppressionRuleSchema },
    memoryPatterns: { type: "array", items: dashboardMemoryItemSchema },
    auditTrail: { type: "array", items: dashboardMemoryAuditEntrySchema },
  },
} as const;
