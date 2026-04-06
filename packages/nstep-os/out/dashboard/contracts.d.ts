import type { ApprovalStatus, ApprovalPolicy, DashboardSnapshot, ExecutionLane, GoalMode, JobStatus, JobEscalation, LeadInteraction, LeadRecord, LeadRecoveryEvent, LeadRecoveryScenario, MemoryCategory, MemoryEntry, MemoryTier, NexusBuildAnalysisReport, NexusBuildUseCase, Priority, ProductKey, ProvLyAnalysisReport, ProvLyClaimExport, ProvLyUserPreference, RiskLevel, PrincipalRole, RouteDecision, RuntimeConfig, TenantRules, StepLogEntry, StepStatus, ToolName, WorkflowKey, WorkflowPlan, WorkflowResult, WorkflowStatusModel } from "../core/types.js";
import type { Stage2AgentCapability, Stage2AgentId, Stage2PermissionScope, Stage2RuntimePhase } from "../core/stage2-models.js";
export type DashboardViewKind = "overview" | "job-list" | "job-detail" | "approval-queue" | "log-feed" | "workflow-activity" | "memory-view" | "product-panel" | "settings";
export interface DashboardEnvelope {
    readonly kind: DashboardViewKind;
    readonly version: "stage-5";
    readonly generatedAt: string;
    readonly tenantId?: string;
    readonly filters: DashboardQuery;
}
export interface DashboardPageInfo {
    readonly page: number;
    readonly pageSize: number;
    readonly total: number;
    readonly hasMore: boolean;
    readonly nextPage?: number;
}
export interface DashboardQuery {
    readonly tenantId?: string;
    readonly product?: ProductKey;
    readonly workflow?: WorkflowKey;
    readonly jobId?: string;
    readonly caseId?: string;
    readonly status?: JobStatus | readonly JobStatus[];
    readonly approvalStatus?: ApprovalStatus | readonly ApprovalStatus[];
    readonly page?: number;
    readonly pageSize?: number;
    readonly search?: string;
    readonly sortBy?: "createdAt" | "updatedAt" | "status" | "product" | "priority";
    readonly sortDirection?: "asc" | "desc";
    readonly from?: string;
    readonly to?: string;
    readonly lane?: ExecutionLane;
    readonly priceSource?: string;
    readonly reportBuildId?: string;
    readonly comparisonBuildId?: string;
}
export interface DashboardMetric {
    readonly label: string;
    readonly value: string | number;
    readonly detail?: string;
    readonly tone: "neutral" | "success" | "warning" | "danger" | "accent";
    readonly trend?: {
        readonly direction: "up" | "down" | "flat";
        readonly value: number;
        readonly label?: string;
    };
}
export interface DashboardAlert {
    readonly id: string;
    readonly level: "info" | "success" | "warning" | "critical";
    readonly title: string;
    readonly message: string;
    readonly createdAt: string;
    readonly relatedJobId?: string;
    readonly relatedProduct?: ProductKey;
    readonly actionLabel?: string;
    readonly actionHref?: string;
    readonly metadata: Record<string, unknown>;
}
export interface DashboardActionPreview {
    readonly title: string;
    readonly body: string;
    readonly tool: ToolName;
    readonly stepId: string;
    readonly stepType: string;
    readonly actionLabel: string;
    readonly data: Record<string, unknown>;
}
export interface DashboardRetryView {
    readonly attempts: number;
    readonly maxAttempts: number;
    readonly retryable: boolean;
    readonly exhausted: boolean;
    readonly lastAttemptAt?: string;
    readonly lastError?: string;
    readonly nextRetryAt?: string;
}
export interface DashboardJobSurface {
    readonly jobId: string;
    readonly tenantId: string;
    readonly product: ProductKey;
    readonly workflow: WorkflowKey;
    readonly goal: string;
    readonly priority: Priority;
    readonly mode: GoalMode;
    readonly status: JobStatus;
    readonly approvalStatus: ApprovalStatus;
    readonly riskLevel: RiskLevel;
    readonly lane: ExecutionLane;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly currentStepId?: string;
    readonly currentStepTitle?: string;
    readonly currentStepType?: string;
    readonly currentStepTool?: ToolName;
    readonly stepCount: number;
    readonly completedStepCount: number;
    readonly waitingApprovalStepCount: number;
    readonly failedStepCount: number;
    readonly retryableStepCount: number;
    readonly resultSummary?: string;
    readonly error?: string;
    readonly tags: readonly string[];
}
export interface DashboardJobListItem extends DashboardJobSurface {
    readonly hasLogs: boolean;
    readonly hasMemoryUpdates: boolean;
    readonly lastLogAt?: string;
    readonly approvalPreview?: DashboardActionPreview;
}
export interface DashboardJobDetailRecord extends DashboardJobSurface {
    readonly goalPayload: Record<string, unknown>;
    readonly route?: RouteDecision;
    readonly plan?: WorkflowPlan;
    readonly result?: WorkflowResult;
    readonly workflowStatus?: WorkflowStatusModel;
    readonly escalation?: JobEscalation;
    readonly approvedStepIds: readonly string[];
    readonly scratchpad: readonly DashboardJobScratchpadEntry[];
    readonly worldState?: DashboardJobWorldState;
    readonly logCount: number;
    readonly memoryUpdateCount: number;
}
export interface DashboardJobWorldState {
    readonly currentGoal: string;
    readonly reasoningSummary?: string;
    readonly actionHistory: readonly {
        readonly fingerprint: string;
        readonly count: number;
        readonly firstAt: string;
        readonly lastAt: string;
        readonly sampleSummary: string;
    }[];
    readonly observations: readonly DashboardJobWorldObservation[];
    readonly repeatedActionWarnings: readonly {
        readonly at: string;
        readonly fingerprint: string;
        readonly count: number;
        readonly reason: string;
    }[];
    readonly modifiedPaths: readonly string[];
    readonly failingTests: readonly string[];
}
export interface DashboardJobWorldObservation {
    readonly at: string;
    readonly phase: "routing" | "planning" | "execution" | "verification" | "memory" | "reporting" | "system";
    readonly source: "job" | "step" | "system";
    readonly fingerprint: string;
    readonly summary: string;
    readonly modifiedPaths: readonly string[];
    readonly failingTests: readonly string[];
    readonly metadata: Record<string, unknown>;
}
export interface DashboardJobScratchpadEntry {
    readonly id: string;
    readonly at: string;
    readonly phase: "routing" | "planning" | "execution" | "verification" | "memory" | "reporting" | "system";
    readonly title: string;
    readonly note: string;
    readonly stepId?: string;
    readonly stepType?: string;
    readonly actorRole?: PrincipalRole;
    readonly actorId?: string;
    readonly data?: Record<string, unknown>;
}
export interface DashboardStepTimelineItem {
    readonly stepId: string;
    readonly title: string;
    readonly type: string;
    readonly tool: ToolName;
    readonly status: StepStatus;
    readonly dependsOn: readonly string[];
    readonly approvalRequired: boolean;
    readonly retryable: boolean;
    readonly attempts: number;
    readonly startedAt?: string;
    readonly completedAt?: string;
    readonly message?: string;
    readonly error?: string;
    readonly retry?: DashboardRetryView;
    readonly inputSummary: string;
    readonly outputSummary?: string;
}
export interface DashboardJobListSummary {
    readonly total: number;
    readonly running: number;
    readonly waitingApproval: number;
    readonly failed: number;
    readonly completed: number;
    readonly byStatus: Record<JobStatus, number>;
    readonly byProduct: Record<ProductKey, number>;
    readonly byWorkflow: Record<string, number>;
    readonly byApprovalStatus: Record<ApprovalStatus, number>;
}
export interface DashboardJobListResponse extends DashboardEnvelope {
    readonly kind: "job-list";
    readonly pageInfo: DashboardPageInfo;
    readonly summary: DashboardJobListSummary;
    readonly items: readonly DashboardJobListItem[];
}
export interface DashboardJobDetailResponse extends DashboardEnvelope {
    readonly kind: "job-detail";
    readonly job: DashboardJobDetailRecord;
    readonly timeline: readonly DashboardStepTimelineItem[];
    readonly logs: readonly DashboardLogEntry[];
    readonly approvals: readonly DashboardApprovalQueueItem[];
    readonly memoryUpdates: readonly DashboardMemoryItem[];
    readonly productPanel?: DashboardProductPanelResponse;
}
export interface DashboardApprovalQueueItem extends DashboardJobSurface {
    readonly stepId: string;
    readonly stepType: string;
    readonly stepTitle: string;
    readonly tool: ToolName;
    readonly reason: string;
    readonly preview: DashboardActionPreview;
    readonly auditTrail: readonly DashboardApprovalAuditEntry[];
    readonly canApprove: boolean;
    readonly canReject: boolean;
    readonly canEdit: boolean;
    readonly retryable: boolean;
}
export interface DashboardApprovalAuditEntry {
    readonly at: string;
    readonly action: "request" | "approve" | "reject";
    readonly actorRole?: PrincipalRole;
    readonly actorId?: string;
    readonly summary: string;
}
export interface DashboardApprovalQueueSummary {
    readonly total: number;
    readonly highRisk: number;
    readonly mediumRisk: number;
    readonly lowRisk: number;
    readonly byProduct: Record<ProductKey, number>;
    readonly byWorkflow: Record<string, number>;
    readonly byLane: Record<ExecutionLane, number>;
}
export interface DashboardApprovalQueueResponse extends DashboardEnvelope {
    readonly kind: "approval-queue";
    readonly pageInfo: DashboardPageInfo;
    readonly summary: DashboardApprovalQueueSummary;
    readonly items: readonly DashboardApprovalQueueItem[];
}
export interface DashboardLogEntry {
    readonly id: string;
    readonly at: string;
    readonly level: StepLogEntry["level"];
    readonly message: string;
    readonly jobId?: string;
    readonly tenantId?: string;
    readonly product?: ProductKey;
    readonly workflow?: WorkflowKey;
    readonly stepId?: string;
    readonly stepType?: string;
    readonly tool?: ToolName;
    readonly agentId?: string;
    readonly actorRole?: PrincipalRole;
    readonly actorId?: string;
    readonly source: "job" | "step" | "system";
    readonly data?: Record<string, unknown>;
}
export interface DashboardLogFeedSummary {
    readonly total: number;
    readonly debug: number;
    readonly info: number;
    readonly warn: number;
    readonly error: number;
    readonly byProduct: Record<ProductKey, number>;
    readonly byWorkflow: Record<string, number>;
}
export interface DashboardLogFeedResponse extends DashboardEnvelope {
    readonly kind: "log-feed";
    readonly pageInfo: DashboardPageInfo;
    readonly scope: "global" | "tenant" | "job" | "product";
    readonly summary: DashboardLogFeedSummary;
    readonly items: readonly DashboardLogEntry[];
}
export interface DashboardRecurringJobItem {
    readonly jobId: string;
    readonly product: ProductKey;
    readonly workflow: WorkflowKey;
    readonly title: string;
    readonly stepId?: string;
    readonly runAt: string;
    readonly status: string;
    readonly detail?: string;
    readonly source: "scheduler" | "job-step" | "goal-payload";
}
export interface DashboardWorkflowActivityProductItem {
    readonly product: ProductKey;
    readonly title: string;
    readonly activeJobs: number;
    readonly runningJobs: number;
    readonly waitingApprovalJobs: number;
    readonly failedJobs: number;
    readonly completedJobs24h: number;
    readonly failedJobs24h: number;
    readonly laneBreakdown: Record<ExecutionLane, number>;
    readonly recentJobs: readonly DashboardJobListItem[];
    readonly recentCompletedRuns: readonly DashboardJobListItem[];
    readonly recentFailedRuns: readonly DashboardJobListItem[];
    readonly recurringJobs: readonly DashboardRecurringJobItem[];
    readonly alerts: readonly DashboardAlert[];
    readonly lastActivityAt?: string;
}
export interface DashboardWorkflowActivitySummary {
    readonly totalActiveJobs: number;
    readonly waitingApproval: number;
    readonly failed: number;
    readonly completed24h: number;
    readonly failed24h: number;
    readonly laneBreakdown: Record<ExecutionLane, number>;
}
export interface DashboardWorkflowActivityResponse extends DashboardEnvelope {
    readonly kind: "workflow-activity";
    readonly summary: DashboardWorkflowActivitySummary;
    readonly products: readonly DashboardWorkflowActivityProductItem[];
    readonly recentCompletedRuns: readonly DashboardJobListItem[];
    readonly recentFailedRuns: readonly DashboardJobListItem[];
    readonly recurringJobs: readonly DashboardRecurringJobItem[];
    readonly alerts: readonly DashboardAlert[];
}
export interface DashboardMemoryItem extends MemoryEntry {
    readonly tier: MemoryTier;
    readonly summary: string;
    readonly sourceLabel?: string;
    readonly sourceStepLabel?: string;
}
export interface DashboardMemoryAuditEntry {
    readonly id: string;
    readonly at: string;
    readonly tenantId: string;
    readonly product: ProductKey;
    readonly category: MemoryCategory;
    readonly key: string;
    readonly confidence: number;
    readonly editable: boolean;
    readonly sourceJobId?: string;
    readonly sourceStepId?: string;
    readonly summary: string;
    readonly action?: string;
    readonly actorRole?: PrincipalRole;
    readonly actorId?: string;
    readonly note?: string;
}
export interface DashboardMemoryViewSummary {
    readonly total: number;
    readonly editable: number;
    readonly byCategory: Record<string, number>;
    readonly byTier: Record<MemoryTier, number>;
    readonly byProduct: Record<ProductKey, number>;
    readonly patternCount: number;
    readonly recentUpdates: number;
}
export interface DashboardMemoryViewResponse extends DashboardEnvelope {
    readonly kind: "memory-view";
    readonly pageInfo: DashboardPageInfo;
    readonly summary: DashboardMemoryViewSummary;
    readonly items: readonly DashboardMemoryItem[];
    readonly patterns: readonly DashboardMemoryItem[];
    readonly auditTrail: readonly DashboardMemoryAuditEntry[];
}
export interface DashboardProductCard {
    readonly product: ProductKey;
    readonly title: string;
    readonly description: string;
    readonly primaryMetric: DashboardMetric;
    readonly secondaryMetrics: readonly DashboardMetric[];
    readonly activeJobs: number;
    readonly waitingApprovals: number;
    readonly alerts: number;
    readonly lastActivityAt?: string;
}
export interface DashboardSharedWorkflowSummary {
    readonly total: number;
    readonly running: number;
    readonly waitingApproval: number;
    readonly failed: number;
    readonly completed: number;
    readonly lastRunAt?: string;
}
export interface DashboardSharedWorkflowOverview {
    readonly summary: DashboardSharedWorkflowSummary;
    readonly recentRuns: readonly DashboardJobListItem[];
}
export interface DashboardOverviewResponse extends DashboardEnvelope {
    readonly kind: "overview";
    readonly snapshot: DashboardSnapshot;
    readonly summaryCards: readonly DashboardMetric[];
    readonly alerts: readonly DashboardAlert[];
    readonly recentJobs: readonly DashboardJobListItem[];
    readonly recentApprovals: readonly DashboardApprovalQueueItem[];
    readonly recentLogs: readonly DashboardLogEntry[];
    readonly activity: {
        readonly summary: DashboardWorkflowActivitySummary;
        readonly recentCompletedRuns: readonly DashboardJobListItem[];
        readonly recentFailedRuns: readonly DashboardJobListItem[];
        readonly recurringJobs: readonly DashboardRecurringJobItem[];
    };
    readonly sharedWorkflow: DashboardSharedWorkflowOverview;
    readonly memory: {
        readonly total: number;
        readonly editable: number;
        readonly byCategory: Record<string, number>;
        readonly byProduct: Record<ProductKey, number>;
        readonly recent: readonly DashboardMemoryItem[];
    };
    readonly productCards: readonly DashboardProductCard[];
}
export interface DashboardProductPanelBase extends DashboardEnvelope {
    readonly kind: "product-panel";
    readonly product: ProductKey;
    readonly title: string;
    readonly summary: {
        readonly title: string;
        readonly description: string;
        readonly primaryMetric: DashboardMetric;
        readonly secondaryMetrics: readonly DashboardMetric[];
    };
    readonly recentJobs: readonly DashboardJobListItem[];
    readonly alerts: readonly DashboardAlert[];
    readonly recentMemory: readonly DashboardMemoryItem[];
}
export interface DashboardLeadRecoveryPanelResponse extends DashboardProductPanelBase {
    readonly product: "lead-recovery";
    readonly resultSummary: DashboardLeadRecoveryResultSummary;
    readonly leadSummary: {
        readonly totalLeads: number;
        readonly contactedLeads: number;
        readonly optedOutLeads: number;
        readonly blockedLeads: number;
        readonly recentlyContactedLeads: number;
    };
    readonly recentResults: readonly DashboardLeadRecoveryResultItem[];
    readonly approvalItems: readonly DashboardApprovalQueueItem[];
    readonly suppressionSummary: {
        readonly within48Hours: number;
        readonly optedOut: number;
        readonly outsideBusinessHours: number;
        readonly pendingApprovals: number;
    };
    readonly recentLeads: readonly {
        readonly leadId: string;
        readonly phone: string;
        readonly name?: string;
        readonly stage: LeadRecord["stage"];
        readonly doNotContact: boolean;
        readonly lastContactedAt?: string;
    }[];
    readonly recentInteractions: readonly {
        readonly interactionId: string;
        readonly leadId: string;
        readonly channel: LeadInteraction["channel"];
        readonly direction: LeadInteraction["direction"];
        readonly summary: string;
        readonly at: string;
    }[];
    readonly recentCallEvents: readonly {
        readonly eventId: string;
        readonly callerPhone: string;
        readonly calledNumber: string;
        readonly missedAt: string;
        readonly source: LeadRecoveryEvent["source"];
    }[];
    readonly messageTemplates: readonly {
        readonly scenario: LeadRecoveryScenario;
        readonly title: string;
        readonly body: string;
        readonly tone: LeadRecoveryBrandTone;
        readonly editable: boolean;
        readonly updatedAt?: string;
        readonly sourceJobId?: string;
    }[];
}
export interface DashboardLeadRecoveryResultSummary {
    readonly total: number;
    readonly succeeded: number;
    readonly partial: number;
    readonly blocked: number;
    readonly waitingApproval: number;
    readonly delivered: number;
    readonly queued: number;
    readonly failed: number;
}
export interface DashboardLeadRecoveryResultItem extends DashboardJobSurface {
    readonly eventId: string;
    readonly leadId?: string;
    readonly leadName?: string;
    readonly phone: string;
    readonly scenario: LeadRecoveryScenario;
    readonly contactable: boolean;
    readonly suppressionReason: string;
    readonly leadStage: LeadRecord["stage"];
    readonly resultStatus: WorkflowResult["status"];
    readonly sendStatus: string;
    readonly sendProvider?: string;
    readonly verificationStatus: string;
    readonly summary: string;
    readonly message?: string;
    readonly actionsTaken: readonly string[];
    readonly deliveredAt?: string;
}
export type LeadRecoveryBrandTone = "business-safe" | "warm" | "urgent";
export interface DashboardNexusBuildPanelResponse extends DashboardProductPanelBase {
    readonly product: "nexusbuild";
    readonly buildSummary: {
        readonly savedBuilds: number;
        readonly preferredBuilds: number;
        readonly recommendationRuns: number;
        readonly reportCount: number;
        readonly compatibilityChecks: number;
        readonly pricingSnapshots: number;
    };
    readonly compatibilitySummary: {
        readonly pass: number;
        readonly warn: number;
        readonly fail: number;
        readonly latestScore?: number;
    };
    readonly pricingSummary: {
        readonly livePricingEnabled: boolean;
        readonly snapshotCount: number;
        readonly watchedItems: number;
        readonly latestAveragePrice?: number;
    };
    readonly savedBuilds: readonly {
        readonly buildId: string;
        readonly name: string;
        readonly useCase: NexusBuildUseCase;
        readonly budget?: number;
        readonly currency: string;
        readonly preferred: boolean;
        readonly partCount: number;
        readonly updatedAt: string;
    }[];
    readonly latestReports: readonly {
        readonly reportId: string;
        readonly buildId: string;
        readonly title: string;
        readonly summary: string;
        readonly compatibilityScore: number;
        readonly performanceScore: number;
        readonly valueScore: number;
        readonly createdAt: string;
        readonly updatedAt: string;
    }[];
    readonly latestRecommendationRuns: readonly {
        readonly runId: string;
        readonly buildId: string;
        readonly operation: string;
        readonly status: string;
        readonly score: number;
        readonly updatedAt: string;
    }[];
    readonly latestReport?: NexusBuildAnalysisReport;
}
export interface DashboardProvLyPanelResponse extends DashboardProductPanelBase {
    readonly product: "provly";
    readonly inventorySummary: {
        readonly itemCount: number;
        readonly roomCount: number;
        readonly categoryCount: number;
        readonly attachmentCount: number;
        readonly receiptCount: number;
        readonly highValueItemCount: number;
        readonly totalEstimatedValue?: number;
    };
    readonly claimSummary: {
        readonly completenessScore: number;
        readonly claimReady: boolean;
        readonly exportCount: number;
        readonly readyExportCount: number;
        readonly missingFieldCount: number;
        readonly reminderCount: number;
    };
    readonly rooms: readonly {
        readonly roomId: string;
        readonly roomLabel: string;
        readonly itemCount: number;
        readonly highValueCount: number;
        readonly completenessScore: number;
        readonly estimatedValue?: number;
    }[];
    readonly categories: readonly {
        readonly categoryId: string;
        readonly categoryLabel: string;
        readonly itemCount: number;
        readonly highValueCount: number;
        readonly completenessScore: number;
        readonly estimatedValue?: number;
    }[];
    readonly latestExports: readonly {
        readonly exportId: string;
        readonly title: string;
        readonly status: ProvLyClaimExport["status"];
        readonly format: ProvLyClaimExport["format"];
        readonly completenessScore: number;
        readonly missingFieldCount: number;
    }[];
    readonly latestReports: readonly {
        readonly reportId: string;
        readonly title: string;
        readonly summary: string;
        readonly createdAt: string;
        readonly updatedAt: string;
    }[];
    readonly latestReport?: ProvLyAnalysisReport;
    readonly highValueItems: readonly {
        readonly itemId: string;
        readonly name: string;
        readonly roomLabel: string;
        readonly categoryLabel: string;
        readonly estimatedValue?: number;
        readonly missingFields: readonly string[];
    }[];
    readonly reminders: readonly string[];
    readonly userPreferences: readonly ProvLyUserPreference[];
}
export interface DashboardNeuroMovesPanelResponse extends DashboardProductPanelBase {
    readonly product: "neurormoves";
    readonly routineSummary: {
        readonly activeJobs: number;
        readonly completedJobs: number;
        readonly scheduledCheckIns: number;
        readonly pendingApprovals: number;
        readonly sentSummaries: number;
    };
    readonly routinePatterns: readonly {
        readonly memoryId: string;
        readonly key: string;
        readonly confidence: number;
        readonly updatedAt: string;
        readonly editable: boolean;
    }[];
    readonly recentCheckIns: readonly DashboardRecurringJobItem[];
    readonly recentSummaries: readonly {
        readonly jobId: string;
        readonly title: string;
        readonly summary: string;
        readonly updatedAt: string;
    }[];
}
export interface DashboardSettingsRuntimeSummary {
    readonly serviceName: string;
    readonly providerMode: RuntimeConfig["providerMode"];
    readonly executionMode: RuntimeConfig["executionMode"];
    readonly port: number;
    readonly dataDir: string;
    readonly databaseProvider: NonNullable<RuntimeConfig["database"]>["provider"];
    readonly browserProvider: NonNullable<RuntimeConfig["browser"]>["provider"];
    readonly smsProvider: "mock" | "twilio";
    readonly emailProvider: "mock" | "webhook";
    readonly ocrProvider: "mock" | "http";
    readonly redisEnabled: boolean;
    readonly maxRetries: number;
}
export interface DashboardSettingsCommunicationTemplate {
    readonly key: string;
    readonly title: string;
    readonly body: string;
    readonly tone: LeadRecoveryBrandTone;
    readonly product: ProductKey;
    readonly editable: boolean;
    readonly source: "memory" | "default" | "runtime";
    readonly updatedAt: string;
}
export interface DashboardSettingsSuppressionRule {
    readonly key: string;
    readonly title: string;
    readonly description: string;
    readonly product: ProductKey;
    readonly enabled: boolean;
    readonly source: "memory" | "default" | "runtime";
    readonly windowHours?: number;
}
export interface DashboardSettingsSummary {
    readonly tenantRuleCount: number;
    readonly communicationTemplateCount: number;
    readonly suppressionRuleCount: number;
    readonly editableMemoryCount: number;
    readonly recentAuditEntries: number;
}
export interface DashboardSettingsOrchestrationHistorySummary {
    readonly total: number;
    readonly completed: number;
    readonly failed: number;
    readonly approvalGated: number;
    readonly externalCapable: number;
    readonly uniqueJobs: number;
    readonly byPhase: Record<Stage2RuntimePhase, number>;
    readonly byAgent: Record<Stage2AgentId, number>;
}
export interface DashboardSettingsOrchestrationHistoryItem {
    readonly invocationId: string;
    readonly phase: Stage2RuntimePhase;
    readonly agentId: Stage2AgentId;
    readonly agentTitle: string;
    readonly selection: {
        readonly phase: Stage2RuntimePhase;
        readonly agentId: Stage2AgentId;
        readonly agentTitle: string;
        readonly capability: Stage2AgentCapability;
        readonly permissionScope: Stage2PermissionScope;
        readonly mayUseExternalTools: boolean;
        readonly requiresApprovalForExternalActions: boolean;
        readonly reason: string;
    };
    readonly status: "completed" | "failed";
    readonly startedAt: string;
    readonly completedAt: string;
    readonly durationMs: number;
    readonly jobId?: string;
    readonly tenantId?: string;
    readonly product?: ProductKey;
    readonly workflow?: WorkflowKey;
    readonly stepId?: string;
    readonly stepType?: string;
    readonly summary: string;
    readonly error?: string;
}
export interface DashboardSettingsOrchestrationHistory {
    readonly summary: DashboardSettingsOrchestrationHistorySummary;
    readonly recent: readonly DashboardSettingsOrchestrationHistoryItem[];
}
export interface DashboardSettingsResponse extends DashboardEnvelope {
    readonly kind: "settings";
    readonly runtime: DashboardSettingsRuntimeSummary;
    readonly approvalPolicy: ApprovalPolicy;
    readonly summary: DashboardSettingsSummary;
    readonly orchestrationHistory: DashboardSettingsOrchestrationHistory;
    readonly tenantRules: readonly TenantRules[];
    readonly communicationTemplates: readonly DashboardSettingsCommunicationTemplate[];
    readonly suppressionRules: readonly DashboardSettingsSuppressionRule[];
    readonly memoryPatterns: readonly DashboardMemoryItem[];
    readonly auditTrail: readonly DashboardMemoryAuditEntry[];
}
export type DashboardProductPanelResponse = DashboardLeadRecoveryPanelResponse | DashboardNexusBuildPanelResponse | DashboardProvLyPanelResponse | DashboardNeuroMovesPanelResponse;
