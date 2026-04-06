export type ProductKey = "lead-recovery" | "nexusbuild" | "provly" | "neurormoves";
export type DashboardMemoryTier = "episodic" | "semantic" | "procedural";
export type DashboardOrchestrationPhase =
  | "supervision"
  | "routing"
  | "planning"
  | "research"
  | "execution"
  | "communication"
  | "verification"
  | "memory"
  | "reporting";
export type DashboardOrchestrationAgentId =
  | "supervisor-agent"
  | "router-agent"
  | "planner-agent"
  | "research-agent"
  | "execution-agent"
  | "communication-agent"
  | "verification-agent"
  | "memory-agent"
  | "reporting-agent";

export type DashboardViewKind =
  | "overview"
  | "job-list"
  | "job-detail"
  | "approval-queue"
  | "log-feed"
  | "workflow-activity"
  | "memory-view"
  | "product-panel"
  | "settings";

export interface DashboardEnvelope {
  readonly kind: DashboardViewKind;
  readonly version: "stage-5";
  readonly generatedAt: string;
  readonly tenantId?: string;
  readonly filters: Record<string, unknown>;
}

export interface DashboardPageInfo {
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly hasMore: boolean;
  readonly nextPage?: number;
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
  readonly tool: string;
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
  readonly workflow: string;
  readonly goal: string;
  readonly priority: string;
  readonly mode: string;
  readonly status: string;
  readonly approvalStatus: string;
  readonly riskLevel: string;
  readonly lane: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly currentStepId?: string;
  readonly currentStepTitle?: string;
  readonly currentStepType?: string;
  readonly currentStepTool?: string;
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
  readonly route?: {
    readonly workflow: string;
    readonly lane: string;
    readonly riskLevel: string;
    readonly approvalRequired: boolean;
    readonly reasoning: string;
    readonly confidence: number;
    readonly tags: readonly string[];
  };
  readonly plan?: {
    readonly workflow: string;
    readonly jobId: string;
    readonly steps: readonly {
      readonly id: string;
      readonly type: string;
      readonly title: string;
      readonly tool: string;
      readonly dependsOn: readonly string[];
      readonly input: Record<string, unknown>;
      readonly approvalRequired?: boolean;
      readonly retryable?: boolean;
    }[];
    readonly approvalsRequired: boolean;
    readonly summary: string;
  };
  readonly escalation?: DashboardJobEscalation;
  readonly result?: {
    readonly status: string;
    readonly summary: string;
    readonly actionsTaken: readonly string[];
    readonly data: Record<string, unknown>;
  };
  readonly workflowStatus?: {
    readonly status: string;
    readonly currentStepId?: string;
    readonly currentStepType?: string;
    readonly currentStepTool?: string;
    readonly approvalStatus?: string;
    readonly updatedAt?: string;
    readonly notes?: string;
  };
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
  readonly actorRole?: string;
  readonly actorId?: string;
  readonly data?: Record<string, unknown>;
}

export interface DashboardJobEscalation {
  readonly escalationId: string;
  readonly jobId: string;
  readonly tenantId: string;
  readonly product: ProductKey;
  readonly workflow: string;
  readonly severity: "low" | "medium" | "high" | "critical";
  readonly status: "open" | "acknowledged" | "resolved";
  readonly reason: string;
  readonly source: "approval" | "verification" | "retry-exhausted" | "policy" | "tenant-isolation" | "memory-edit";
  readonly ownerRole?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: Record<string, unknown>;
}

export interface DashboardStepTimelineItem {
  readonly stepId: string;
  readonly title: string;
  readonly type: string;
  readonly tool: string;
  readonly status: string;
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
  readonly byStatus: Record<string, number>;
  readonly byProduct: Record<ProductKey, number>;
  readonly byWorkflow: Record<string, number>;
  readonly byApprovalStatus: Record<string, number>;
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

export interface DashboardLogEntry {
  readonly id: string;
  readonly at: string;
  readonly level: "debug" | "info" | "warn" | "error";
  readonly message: string;
  readonly jobId?: string;
  readonly tenantId?: string;
  readonly product?: ProductKey;
  readonly workflow?: string;
  readonly stepId?: string;
  readonly stepType?: string;
  readonly tool?: string;
  readonly agentId?: string;
  readonly actorRole?: string;
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

export interface DashboardApprovalQueueItem extends DashboardJobSurface {
  readonly stepId: string;
  readonly stepType: string;
  readonly stepTitle: string;
  readonly tool: string;
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
  readonly actorRole?: string;
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
  readonly byLane: Record<string, number>;
}

export interface DashboardApprovalQueueResponse extends DashboardEnvelope {
  readonly kind: "approval-queue";
  readonly pageInfo: DashboardPageInfo;
  readonly summary: DashboardApprovalQueueSummary;
  readonly items: readonly DashboardApprovalQueueItem[];
}

export interface DashboardRecurringJobItem {
  readonly jobId: string;
  readonly product: ProductKey;
  readonly workflow: string;
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
  readonly laneBreakdown: Record<string, number>;
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
  readonly laneBreakdown: Record<string, number>;
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

export interface DashboardMemoryItem {
  readonly id: string;
  readonly tenantId: string;
  readonly product: ProductKey;
  readonly category: string;
  readonly tier: DashboardMemoryTier;
  readonly key: string;
  readonly value: string | Record<string, unknown>;
  readonly confidence: number;
  readonly lesson?: {
    readonly outcome: "success" | "failure" | "fix" | "prevention";
    readonly symptom?: string;
    readonly cause?: string;
    readonly fix?: string;
    readonly prevention?: string;
    readonly reuseRule?: string;
    readonly evidence?: string;
  };
  readonly sourceJobId?: string;
  readonly sourceStepId?: string;
  readonly editable: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly summary: string;
  readonly sourceLabel?: string;
  readonly sourceStepLabel?: string;
}

export interface DashboardMemoryAuditEntry {
  readonly id: string;
  readonly at: string;
  readonly tenantId: string;
  readonly product: ProductKey;
  readonly category: string;
  readonly key: string;
  readonly confidence: number;
  readonly editable: boolean;
  readonly sourceJobId?: string;
  readonly sourceStepId?: string;
  readonly summary: string;
  readonly action?: string;
  readonly actorRole?: string;
  readonly actorId?: string;
  readonly note?: string;
}

export interface DashboardMemoryViewSummary {
  readonly total: number;
  readonly editable: number;
  readonly byCategory: Record<string, number>;
  readonly byTier: Record<DashboardMemoryTier, number>;
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
  readonly snapshot: Record<string, unknown>;
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

export interface DashboardNexusBuildComparisonMatrixRow {
  readonly buildId: string;
  readonly score: number;
  readonly summary: string;
}

export interface DashboardNexusBuildComparisonSummary {
  readonly comparedBuildIds: readonly string[];
  readonly winnerBuildId?: string;
  readonly notes: readonly string[];
  readonly matrix: readonly DashboardNexusBuildComparisonMatrixRow[];
}

export interface DashboardNexusBuildPricingSnapshot {
  readonly snapshotId: string;
  readonly source: string;
  readonly label?: string;
  readonly url: string;
  readonly currency: string;
  readonly price?: number;
  readonly capturedAt: string;
  readonly rawText?: string;
  readonly metadata: Record<string, unknown>;
}

export interface DashboardNexusBuildReport {
  readonly reportId: string;
  readonly title: string;
  readonly summary: string;
  readonly compatibility: {
    readonly status: string;
    readonly score: number;
    readonly issues: readonly {
      readonly severity: string;
      readonly category: string;
      readonly message: string;
      readonly resolution?: string;
    }[];
    readonly passes: readonly string[];
    readonly unknowns: readonly string[];
  };
  readonly performance: {
    readonly score: number;
    readonly useCaseFit: number;
    readonly expectedOutcome: string;
    readonly bottlenecks: readonly string[];
    readonly strengths: readonly string[];
    readonly estimatedCpuScore: number;
    readonly estimatedGpuScore: number;
    readonly estimatedBuildScore: number;
  };
  readonly value: {
    readonly score: number;
    readonly estimatedBuildCost?: number;
    readonly budgetFit: number;
    readonly valueNotes: readonly string[];
    readonly pricePerformanceNotes: readonly string[];
  };
  readonly recommendation: {
    readonly title: string;
    readonly purchaseStrategy: string;
    readonly upgradePath: readonly string[];
    readonly alternateParts: readonly {
      readonly category: string;
      readonly suggestion: string;
      readonly reason: string;
    }[];
    readonly budgetOptimizations: readonly string[];
    readonly premiumGuidance: readonly string[];
  };
  readonly comparison?: DashboardNexusBuildComparisonSummary;
  readonly pricing: {
    readonly snapshotCount: number;
    readonly snapshots: readonly DashboardNexusBuildPricingSnapshot[];
    readonly livePricingEnabled: boolean;
    readonly notes: readonly string[];
  };
  readonly warnings: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface DashboardProvLyReport {
  readonly reportId: string;
  readonly tenantId: string;
  readonly caseId: string;
  readonly operation: string;
  readonly title: string;
  readonly summary: string;
  readonly claimType: string;
  readonly inventory: {
    readonly itemCount: number;
    readonly roomCount: number;
    readonly categoryCount: number;
    readonly attachmentCount: number;
    readonly receiptCount: number;
    readonly totalEstimatedValue?: number;
    readonly highValueItemCount: number;
    readonly organizedByRoom: readonly {
      readonly roomId: string;
      readonly roomLabel: string;
      readonly itemCount: number;
      readonly estimatedValue?: number;
      readonly highValueCount: number;
    }[];
    readonly organizedByCategory: readonly {
      readonly categoryId: string;
      readonly categoryLabel: string;
      readonly itemCount: number;
      readonly estimatedValue?: number;
      readonly highValueCount: number;
    }[];
  };
  readonly completeness: {
    readonly checkId: string;
    readonly tenantId: string;
    readonly caseId: string;
    readonly status: "pass" | "warn" | "fail";
    readonly score: number;
    readonly claimReady: boolean;
    readonly totalItems: number;
    readonly highValueItems: number;
    readonly completedItems: number;
    readonly itemScores: readonly {
      readonly itemId: string;
      readonly score: number;
      readonly missingFields: readonly string[];
      readonly highValue: boolean;
    }[];
    readonly issues: readonly {
      readonly severity: "info" | "warning" | "error";
      readonly category: string;
      readonly message: string;
      readonly itemId?: string;
      readonly field?: string;
      readonly resolution?: string;
      readonly data?: Record<string, unknown>;
    }[];
    readonly missingFields: readonly string[];
    readonly reminders: readonly string[];
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly metadata: Record<string, unknown>;
  };
  readonly claimExport: {
    readonly exportId: string;
    readonly tenantId: string;
    readonly caseId: string;
    readonly title: string;
    readonly status: "draft" | "ready" | "needs-review" | "exported";
    readonly format: "json" | "csv" | "summary" | "pdf-outline";
    readonly itemCount: number;
    readonly roomCount: number;
    readonly categoryCount: number;
    readonly completenessScore: number;
    readonly highValueItemCount: number;
    readonly missingFieldCount: number;
    readonly summary: string;
    readonly sections: {
      readonly overview: Record<string, unknown>;
      readonly rooms: readonly {
        readonly roomId: string;
        readonly roomLabel: string;
        readonly itemCount: number;
        readonly estimatedValue?: number;
        readonly highValueCount: number;
      }[];
      readonly categories: readonly {
        readonly categoryId: string;
        readonly categoryLabel: string;
        readonly itemCount: number;
        readonly estimatedValue?: number;
        readonly highValueCount: number;
      }[];
      readonly highValueItems: readonly {
        readonly itemId: string;
        readonly name: string;
        readonly roomLabel: string;
        readonly categoryLabel: string;
        readonly estimatedValue?: number;
        readonly missingFields: readonly string[];
      }[];
      readonly missingDocumentation: readonly {
        readonly itemId?: string;
        readonly label: string;
        readonly fields: readonly string[];
        readonly severity: "warning" | "error";
      }[];
      readonly attachments: readonly string[];
      readonly receipts: readonly string[];
      readonly notes: readonly string[];
    };
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly metadata: Record<string, unknown>;
  };
  readonly warnings: readonly string[];
  readonly reminders: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: Record<string, unknown>;
}

export type LeadRecoveryBrandTone = "business-safe" | "warm" | "urgent";

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

export type LeadRecoveryScenario =
  | "generic-callback"
  | "after-hours"
  | "service-inquiry"
  | "quote-followup"
  | "appointment-callback";

export interface DashboardLeadRecoveryResultItem extends DashboardJobSurface {
  readonly eventId: string;
  readonly leadId?: string;
  readonly leadName?: string;
  readonly phone: string;
  readonly scenario: LeadRecoveryScenario;
  readonly contactable: boolean;
  readonly suppressionReason: string;
  readonly leadStage: string;
  readonly resultStatus: string;
  readonly sendStatus: string;
  readonly sendProvider?: string;
  readonly verificationStatus: string;
  readonly summary: string;
  readonly message?: string;
  readonly actionsTaken: readonly string[];
  readonly deliveredAt?: string;
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
    readonly stage: string;
    readonly doNotContact: boolean;
    readonly lastContactedAt?: string;
  }[];
  readonly recentInteractions: readonly {
    readonly interactionId: string;
    readonly leadId: string;
    readonly channel: string;
    readonly direction: string;
    readonly summary: string;
    readonly at: string;
  }[];
  readonly recentCallEvents: readonly {
    readonly eventId: string;
    readonly callerPhone: string;
    readonly calledNumber: string;
    readonly missedAt: string;
    readonly source: string;
  }[];
  readonly messageTemplates: readonly {
    readonly scenario: string;
    readonly title: string;
    readonly body: string;
    readonly tone: LeadRecoveryBrandTone;
    readonly editable: boolean;
    readonly updatedAt?: string;
    readonly sourceJobId?: string;
  }[];
}

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
    readonly useCase: string;
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
  readonly latestReport?: DashboardNexusBuildReport;
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
    readonly status: string;
    readonly format: string;
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
  readonly latestReport?: DashboardProvLyReport;
  readonly highValueItems: readonly {
    readonly itemId: string;
    readonly name: string;
    readonly roomLabel: string;
    readonly categoryLabel: string;
    readonly estimatedValue?: number;
    readonly missingFields: readonly string[];
  }[];
  readonly reminders: readonly string[];
  readonly userPreferences: readonly {
    readonly id: string;
    readonly tenantId: string;
    readonly key: string;
    readonly value: string | Record<string, unknown>;
    readonly editable: boolean;
    readonly updatedAt: string;
  }[];
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
  readonly providerMode: "mock" | "openai" | "gemini";
  readonly executionMode: "inline" | "queued";
  readonly port: number;
  readonly dataDir: string;
  readonly databaseProvider: "file" | "supabase" | "postgres";
  readonly browserProvider: "mock" | "playwright";
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
  readonly tone: "business-safe" | "warm" | "urgent";
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
  readonly byPhase: Record<DashboardOrchestrationPhase, number>;
  readonly byAgent: Record<DashboardOrchestrationAgentId, number>;
}

export interface DashboardSettingsOrchestrationHistoryItem {
  readonly invocationId: string;
  readonly phase: DashboardOrchestrationPhase;
  readonly agentId: DashboardOrchestrationAgentId;
  readonly agentTitle: string;
  readonly selection: {
    readonly phase: DashboardOrchestrationPhase;
    readonly agentId: DashboardOrchestrationAgentId;
    readonly agentTitle: string;
    readonly capability: string;
    readonly permissionScope: string;
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
  readonly workflow?: string;
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
  readonly approvalPolicy: {
    readonly minimumRole: "viewer" | "analyst" | "operator" | "admin" | "system";
    readonly approvalThreshold: "low" | "medium" | "high" | "critical";
    readonly externalActionsRequireApproval: boolean;
    readonly systemBypassAllowed: boolean;
  };
  readonly summary: DashboardSettingsSummary;
  readonly orchestrationHistory: DashboardSettingsOrchestrationHistory;
  readonly tenantRules: readonly {
    readonly tenantId: string;
    readonly product: ProductKey;
    readonly approvalMode: "assist" | "autonomous";
    readonly doNotContactWindowHours: number;
    readonly defaultTone: "business-safe" | "warm" | "urgent";
    readonly messageTemplates: Record<string, string>;
    readonly businessHours?: {
      readonly open: string;
      readonly close: string;
      readonly days: readonly string[];
    };
    readonly updatedAt: string;
    readonly metadata: Record<string, unknown>;
  }[];
  readonly communicationTemplates: readonly DashboardSettingsCommunicationTemplate[];
  readonly suppressionRules: readonly DashboardSettingsSuppressionRule[];
  readonly memoryPatterns: readonly DashboardMemoryItem[];
  readonly auditTrail: readonly DashboardMemoryAuditEntry[];
}

export type DashboardProductPanelResponse =
  | DashboardLeadRecoveryPanelResponse
  | DashboardNexusBuildPanelResponse
  | DashboardProvLyPanelResponse
  | DashboardNeuroMovesPanelResponse;
