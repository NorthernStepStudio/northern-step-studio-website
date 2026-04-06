export type ProductKey = "lead-recovery" | "nexusbuild" | "provly" | "neurormoves";
export type WorkflowKey = ProductKey | "shared";
export type Priority = "low" | "medium" | "high" | "critical";
export type GoalMode = "assist" | "autonomous";
export type ExecutionMode = "inline" | "queued";
export type ExecutionLane = "internal" | "external" | "mixed";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type ApprovalStatus = "not_required" | "pending" | "approved" | "rejected";
export type PrincipalRole = "viewer" | "analyst" | "operator" | "admin" | "system";
export type JobStatus =
  | "pending"
  | "queued"
  | "routing"
  | "planning"
  | "waiting_approval"
  | "running"
  | "verifying"
  | "failed"
  | "completed";
export type JobQueueStatus = "queued" | "claimed" | "deferred" | "completed" | "failed";
export type StepStatus = "pending" | "running" | "waiting_approval" | "completed" | "failed" | "skipped";
export type ToolName = "browser" | "sms" | "email" | "database" | "api" | "scraping" | "scheduler" | "redis" | "ocr" | "llm" | "memory";

export interface GoalInput {
  readonly goal: string;
  readonly product: ProductKey;
  readonly priority: Priority;
  readonly constraints: readonly string[];
  readonly mode: GoalMode;
  readonly tenantId: string;
  readonly requestedBy?: string;
  readonly requestedByRole?: PrincipalRole;
  readonly source?: "user" | "system";
  readonly payload?: Record<string, unknown>;
}

export interface RouteDecision {
  readonly workflow: WorkflowKey;
  readonly lane: ExecutionLane;
  readonly riskLevel: RiskLevel;
  readonly approvalRequired: boolean;
  readonly reasoning: string;
  readonly confidence: number;
  readonly tags: readonly string[];
}

export interface WorkflowStep {
  readonly id: string;
  readonly type: string;
  readonly title: string;
  readonly tool: ToolName;
  readonly dependsOn: readonly string[];
  readonly input: Record<string, unknown>;
  readonly approvalRequired?: boolean;
  readonly retryable?: boolean;
}

export interface ToolExecutionInstruction {
  readonly tool: ToolName;
  readonly action: string;
  readonly request?: Record<string, unknown>;
  readonly metadata?: Record<string, unknown>;
}

export interface ToolExecutionResult {
  readonly tool: ToolName;
  readonly action: string;
  readonly status: "completed" | "failed" | "blocked";
  readonly summary: string;
  readonly output?: unknown;
  readonly retryable?: boolean;
}

export interface WorkflowPlan {
  readonly workflow: WorkflowKey;
  readonly jobId: string;
  readonly steps: readonly WorkflowStep[];
  readonly approvalsRequired: boolean;
  readonly summary: string;
}

export interface StepLogEntry {
  readonly id: string;
  readonly at: string;
  readonly level: "debug" | "info" | "warn" | "error";
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
  readonly source?: "job" | "step" | "system";
  readonly data?: Record<string, unknown>;
}

export interface JobScratchpadEntry {
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

export interface JobWorldObservation {
  readonly at: string;
  readonly phase: "routing" | "planning" | "execution" | "verification" | "memory" | "reporting" | "system";
  readonly source: "job" | "step" | "system";
  readonly fingerprint: string;
  readonly summary: string;
  readonly modifiedPaths: readonly string[];
  readonly failingTests: readonly string[];
  readonly metadata: Record<string, unknown>;
}

export interface JobWorldState {
  readonly currentGoal: string;
  readonly reasoningSummary?: string;
  readonly actionHistory: readonly {
    readonly fingerprint: string;
    readonly count: number;
    readonly firstAt: string;
    readonly lastAt: string;
    readonly sampleSummary: string;
  }[];
  readonly observations: readonly JobWorldObservation[];
  readonly repeatedActionWarnings: readonly {
    readonly at: string;
    readonly fingerprint: string;
    readonly count: number;
    readonly reason: string;
  }[];
  readonly modifiedPaths: readonly string[];
  readonly failingTests: readonly string[];
}

export interface StepResult {
  readonly status: "completed" | "failed" | "blocked";
  readonly message: string;
  readonly output?: unknown;
  readonly retryable?: boolean;
}

export interface JobStepState extends WorkflowStep {
  status: StepStatus;
  attempts: number;
  startedAt?: string;
  completedAt?: string;
  result?: StepResult;
  error?: string;
  retry?: RetryState;
}

export interface WorkflowResult {
  readonly status: "succeeded" | "failed" | "partial";
  readonly summary: string;
  readonly actionsTaken: readonly string[];
  readonly data: Record<string, unknown>;
}

export interface JobRecord {
  readonly jobId: string;
  readonly tenantId: string;
  readonly goal: GoalInput;
  status: JobStatus;
  readonly createdAt: string;
  updatedAt: string;
  route?: RouteDecision;
  plan?: WorkflowPlan;
  steps: JobStepState[];
  logs: StepLogEntry[];
  scratchpad: JobScratchpadEntry[];
  worldState?: JobWorldState;
  approvedStepIds: string[];
  approvalStatus: ApprovalStatus;
  result?: WorkflowResult;
  error?: string;
  workflowStatus?: WorkflowStatusModel;
  escalation?: JobEscalation;
}

export interface JobQueueEntry {
  readonly jobId: string;
  readonly tenantId: string;
  readonly product: ProductKey;
  readonly workflow: WorkflowKey;
  readonly priority: Priority;
  status: JobQueueStatus;
  readonly attempts: number;
  readonly availableAt: string;
  readonly createdAt: string;
  updatedAt: string;
  readonly claimedAt?: string;
  readonly completedAt?: string;
  readonly workerId?: string;
  readonly reason?: string;
  readonly lastError?: string;
  readonly metadata: Record<string, unknown>;
}

export interface RetryState {
  readonly attempts: number;
  readonly maxAttempts: number;
  readonly retryable: boolean;
  readonly exhausted: boolean;
  readonly lastAttemptAt?: string;
  readonly lastError?: string;
  readonly nextRetryAt?: string;
}

export interface WorkflowStatusModel {
  readonly jobId: string;
  readonly workflow?: WorkflowKey;
  readonly status: JobStatus;
  readonly approvalStatus: ApprovalStatus;
  readonly currentStepId?: string;
  readonly totalSteps: number;
  readonly completedSteps: number;
  readonly runningSteps: number;
  readonly waitingApprovalSteps: number;
  readonly failedSteps: number;
  readonly retryableSteps: number;
  readonly updatedAt: string;
}

export interface LeadRecoveryEvent {
  readonly eventId: string;
  readonly tenantId: string;
  readonly callerPhone: string;
  readonly calledNumber: string;
  readonly missedAt: string;
  readonly callSid?: string;
  readonly source: "webhook" | "import" | "manual";
  readonly metadata: Record<string, unknown>;
}

export interface LeadInteraction {
  readonly interactionId: string;
  readonly tenantId: string;
  readonly leadId: string;
  readonly channel: "sms" | "email" | "call" | "note";
  readonly direction: "inbound" | "outbound" | "internal";
  readonly summary: string;
  readonly at: string;
  readonly metadata: Record<string, unknown>;
}

export interface LeadRecord {
  readonly leadId: string;
  readonly tenantId: string;
  readonly phone: string;
  readonly name?: string;
  readonly email?: string;
  readonly stage: "new" | "contacted" | "replied" | "qualified" | "opted_out" | "blocked";
  readonly doNotContact: boolean;
  readonly communicationTone: "business-safe" | "warm" | "urgent";
  readonly notes?: string;
  readonly lastInboundAt?: string;
  readonly lastOutboundAt?: string;
  readonly lastContactedAt?: string;
  readonly contactedWithin48h: boolean;
  readonly metadata: Record<string, unknown>;
}

export interface LeadRecoveryBrandProfile {
  readonly businessName: string;
  readonly primaryNumber: string;
  readonly callbackNumber: string;
  readonly smsFromNumber: string;
  readonly timeZone: string;
  readonly tone: "business-safe" | "warm" | "urgent";
  readonly doNotContactWindowHours: number;
  readonly signature?: string;
  readonly followupTemplate?: string;
  readonly businessHours?: {
    readonly open: string;
    readonly close: string;
    readonly days: readonly string[];
  };
}

export interface LeadRecoveryInput {
  readonly goal: GoalInput;
  readonly event: LeadRecoveryEvent;
  readonly brand: LeadRecoveryBrandProfile;
  readonly lead?: LeadRecord;
  readonly previousInteractions?: readonly LeadInteraction[];
}

export interface LeadRecoveryAssessment {
  readonly contactable: boolean;
  readonly reason: string;
  readonly urgency: "normal" | "priority" | "emergency";
  readonly shouldUseSms: boolean;
  readonly approvalRequired: boolean;
  readonly contactWindowAllowed: boolean;
  readonly conversationTurns: number;
  readonly conversationTurnLimitReached: boolean;
  readonly stopKeywordDetected: boolean;
  readonly complianceFlags: readonly string[];
}

export type LeadRecoveryScenario =
  | "generic-callback"
  | "after-hours"
  | "service-inquiry"
  | "quote-followup"
  | "appointment-callback";

export interface LeadRecoveryMessageDraft {
  readonly body: string;
  readonly tone: "business-safe" | "warm" | "urgent";
  readonly channel: "sms";
  readonly scenario: LeadRecoveryScenario;
}

export interface LeadRecoveryHistorySnapshot {
  readonly leadId: string;
  readonly tenantId: string;
  readonly interactionCount: number;
  readonly outboundCount: number;
  readonly recentInteractions: readonly LeadInteraction[];
  readonly recentOutbounds: readonly SmsMessage[];
  readonly lastInteractionAt?: string;
  readonly lastOutboundAt?: string;
  readonly hasRecentOptOut: boolean;
  readonly metadata: Record<string, unknown>;
}

export interface TenantRules {
  readonly tenantId: string;
  readonly product: ProductKey;
  readonly approvalMode: GoalMode;
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
}

export interface OptOutStatus {
  readonly tenantId: string;
  readonly leadId?: string;
  readonly phone: string;
  readonly status: "active" | "opted_out" | "blocked";
  readonly source: "manual" | "workflow" | "twilio" | "import";
  readonly updatedAt: string;
  readonly metadata: Record<string, unknown>;
}

export interface MemoryPattern {
  readonly id: string;
  readonly tenantId: string;
  readonly product: ProductKey;
  readonly key: string;
  readonly patternType: "workflow-template" | "message-template" | "suppression-rule" | "safety-rule";
  readonly input: Record<string, unknown>;
  readonly output: Record<string, unknown>;
  readonly confidence: number;
  readonly sourceJobId?: string;
  readonly sourceStepId?: string;
  readonly editable: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type ProvLyWorkflowType =
  | "inventory-intake"
  | "documentation-review"
  | "claim-preparation"
  | "room-review"
  | "reminder-generation"
  | "export-generation"
  | "high-value-review";

export type ProvLyItemCategory =
  | "furniture"
  | "electronics"
  | "appliance"
  | "jewelry"
  | "art"
  | "clothing"
  | "tools"
  | "kitchenware"
  | "sports"
  | "media"
  | "documents"
  | "collectibles"
  | "decor"
  | "other";

export type ProvLyItemCondition = "new" | "good" | "fair" | "poor" | "unknown";
export type ProvLyAttachmentKind = "photo" | "receipt" | "note" | "pdf" | "other";
export type ProvLyClaimExportFormat = "json" | "csv" | "summary" | "pdf-outline";
export type ProvLyItemSource = "manual" | "upload" | "photo" | "receipt" | "import" | "claim" | "system";

export interface ProvLyInventoryItem {
  readonly itemId: string;
  readonly tenantId: string;
  readonly caseId: string;
  readonly name: string;
  readonly categoryId: string;
  readonly categoryLabel: string;
  readonly roomId: string;
  readonly roomLabel: string;
  readonly quantity: number;
  readonly condition: ProvLyItemCondition;
  readonly estimatedValue?: number;
  readonly currency: string;
  readonly purchaseDate?: string;
  readonly serialNumber?: string;
  readonly brand?: string;
  readonly model?: string;
  readonly highValue: boolean;
  readonly source: ProvLyItemSource;
  readonly receiptIds: readonly string[];
  readonly attachmentIds: readonly string[];
  readonly notes?: string;
  readonly claimContext: Record<string, unknown>;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProvLyInventoryCategory {
  readonly categoryId: string;
  readonly tenantId: string;
  readonly caseId: string;
  readonly label: ProvLyItemCategory | string;
  readonly normalizedLabel: string;
  readonly itemCount: number;
  readonly highValueCount: number;
  readonly estimatedValue?: number;
  readonly completenessScore: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: Record<string, unknown>;
}

export interface ProvLyRoom {
  readonly roomId: string;
  readonly tenantId: string;
  readonly caseId: string;
  readonly label: string;
  readonly normalizedLabel: string;
  readonly itemCount: number;
  readonly highValueCount: number;
  readonly estimatedValue?: number;
  readonly completenessScore: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: Record<string, unknown>;
}

export interface ProvLyAttachment {
  readonly attachmentId: string;
  readonly tenantId: string;
  readonly caseId: string;
  readonly itemId?: string;
  readonly kind: ProvLyAttachmentKind;
  readonly label?: string;
  readonly filename?: string;
  readonly mimeType?: string;
  readonly url?: string;
  readonly sizeBytes?: number;
  readonly capturedAt: string;
  readonly metadata: Record<string, unknown>;
}

export interface ProvLyReceipt {
  readonly receiptId: string;
  readonly tenantId: string;
  readonly caseId: string;
  readonly itemId?: string;
  readonly vendor?: string;
  readonly receiptNumber?: string;
  readonly purchaseDate?: string;
  readonly total?: number;
  readonly currency: string;
  readonly attachmentId?: string;
  readonly notes?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: Record<string, unknown>;
}

export interface ProvLyCompletenessIssue {
  readonly severity: "info" | "warning" | "error";
  readonly category: "metadata" | "document" | "receipt" | "photo" | "room" | "claim" | "export" | "value" | "attachment" | "category";
  readonly message: string;
  readonly itemId?: string;
  readonly field?: string;
  readonly resolution?: string;
  readonly data?: Record<string, unknown>;
}

export interface ProvLyCompletenessSummary {
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
  readonly issues: readonly ProvLyCompletenessIssue[];
  readonly missingFields: readonly string[];
  readonly reminders: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: Record<string, unknown>;
}

export interface ProvLyClaimExport {
  readonly exportId: string;
  readonly tenantId: string;
  readonly caseId: string;
  readonly title: string;
  readonly status: "draft" | "ready" | "needs-review" | "exported";
  readonly format: ProvLyClaimExportFormat;
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
}

export interface ProvLyUserPreference {
  readonly preferenceId: string;
  readonly tenantId: string;
  readonly defaultCurrency: string;
  readonly reportStyle: "concise" | "balanced" | "detailed";
  readonly preferredRooms: readonly string[];
  readonly highValueThreshold: number;
  readonly reminderMode: "dashboard" | "email" | "both";
  readonly exportFormat: ProvLyClaimExportFormat;
  readonly updatedAt: string;
  readonly metadata: Record<string, unknown>;
}

export interface ProvLyIntakePayload {
  readonly operation?: ProvLyWorkflowType;
  readonly workflowType?: ProvLyWorkflowType;
  readonly intent?: ProvLyWorkflowType;
  readonly caseId?: string;
  readonly claimantName?: string;
  readonly claimType?: string;
  readonly inventoryItems?: unknown;
  readonly items?: unknown;
  readonly attachments?: unknown;
  readonly receipts?: unknown;
  readonly photos?: unknown;
  readonly images?: unknown;
  readonly inventoryPhotos?: unknown;
  readonly receiptPhotos?: unknown;
  readonly visualAssets?: unknown;
  readonly scans?: unknown;
  readonly rooms?: unknown;
  readonly claimContext?: Record<string, unknown>;
  readonly reminderEmail?: string;
  readonly reminderPhone?: string;
  readonly exportFormat?: ProvLyClaimExportFormat;
  readonly preferredCurrency?: string;
  readonly highValueThreshold?: number | string;
  readonly policyName?: string;
  readonly policyDeadline?: string;
  readonly documentationRules?: unknown;
  readonly preferences?: Record<string, unknown>;
  readonly reminderMode?: "dashboard" | "email" | "both";
  readonly notes?: string;
}

export interface ProvLyIntake {
  readonly goal: GoalInput;
  readonly caseId: string;
  readonly operation: ProvLyWorkflowType;
  readonly claimantName: string;
  readonly claimType: string;
  readonly inventoryItems: readonly unknown[];
  readonly attachments: readonly unknown[];
  readonly receipts: readonly unknown[];
  readonly visualAssets: readonly unknown[];
  readonly rooms: readonly string[];
  readonly claimContext: Record<string, unknown>;
  readonly reminderEmail?: string;
  readonly reminderPhone?: string;
  readonly exportFormat: ProvLyClaimExportFormat;
  readonly preferredCurrency: string;
  readonly highValueThreshold: number;
  readonly policyName?: string;
  readonly policyDeadline?: string;
  readonly documentationRules: Record<string, unknown>;
  readonly preferences: Record<string, unknown>;
  readonly reminderMode: "dashboard" | "email" | "both";
  readonly notes?: string;
}

export interface ProvLyAnalysisReport {
  readonly reportId: string;
  readonly tenantId: string;
  readonly caseId: string;
  readonly operation: ProvLyWorkflowType;
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
  readonly completeness: ProvLyCompletenessSummary;
  readonly claimExport: ProvLyClaimExport;
  readonly warnings: readonly string[];
  readonly reminders: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: Record<string, unknown>;
}

export interface ProvLyStore {
  getInventoryItem(itemId: string): Promise<ProvLyInventoryItem | undefined>;
  listInventoryItems(tenantId?: string, caseId?: string): Promise<readonly ProvLyInventoryItem[]>;
  upsertInventoryItem(item: ProvLyInventoryItem): Promise<ProvLyInventoryItem>;
  listInventoryCategories(tenantId?: string, caseId?: string): Promise<readonly ProvLyInventoryCategory[]>;
  upsertInventoryCategory(category: ProvLyInventoryCategory): Promise<ProvLyInventoryCategory>;
  listRooms(tenantId?: string, caseId?: string): Promise<readonly ProvLyRoom[]>;
  upsertRoom(room: ProvLyRoom): Promise<ProvLyRoom>;
  listAttachments(tenantId?: string, caseId?: string): Promise<readonly ProvLyAttachment[]>;
  upsertAttachment(attachment: ProvLyAttachment): Promise<ProvLyAttachment>;
  listReceipts(tenantId?: string, caseId?: string): Promise<readonly ProvLyReceipt[]>;
  upsertReceipt(receipt: ProvLyReceipt): Promise<ProvLyReceipt>;
  listCompletenessChecks(tenantId?: string, caseId?: string): Promise<readonly ProvLyCompletenessSummary[]>;
  upsertCompletenessCheck(check: ProvLyCompletenessSummary): Promise<ProvLyCompletenessSummary>;
  listClaimExports(tenantId?: string, caseId?: string): Promise<readonly ProvLyClaimExport[]>;
  upsertClaimExport(exportRecord: ProvLyClaimExport): Promise<ProvLyClaimExport>;
  listAnalysisReports(tenantId?: string, caseId?: string): Promise<readonly ProvLyAnalysisReport[]>;
  upsertAnalysisReport(report: ProvLyAnalysisReport): Promise<ProvLyAnalysisReport>;
  listUserPreferences(tenantId?: string): Promise<readonly ProvLyUserPreference[]>;
  upsertUserPreference(preference: ProvLyUserPreference): Promise<ProvLyUserPreference>;
}

export type NexusBuildWorkflowType =
  | "build-intake"
  | "compatibility-review"
  | "bottleneck-analysis"
  | "price-monitoring"
  | "recommendation-report"
  | "parts-comparison";

export type NexusBuildUseCase = "gaming" | "productivity" | "creator" | "budget" | "workstation" | "general";

export type NexusBuildComponentCategory =
  | "cpu"
  | "motherboard"
  | "gpu"
  | "memory"
  | "storage"
  | "psu"
  | "case"
  | "cooler"
  | "monitor"
  | "accessory";

export type NexusBuildPriceSourceKind = "retail" | "marketplace" | "watchlist" | "spec" | "benchmark" | "review";

export interface NexusBuildPriceSource {
  readonly label?: string;
  readonly url: string;
  readonly kind?: NexusBuildPriceSourceKind;
  readonly priority?: number;
}

export interface NexusBuildWatchItem {
  readonly label: string;
  readonly url: string;
  readonly targetPrice?: number;
  readonly currency?: string;
  readonly notes?: string;
}

export interface NexusBuildNormalizedPart {
  readonly partId: string;
  readonly category: NexusBuildComponentCategory;
  readonly name: string;
  readonly brand?: string;
  readonly model?: string;
  readonly quantity: number;
  readonly price?: number;
  readonly currency?: string;
  readonly url?: string;
  readonly source: "goal" | "saved" | "browser" | "api" | "catalog";
  readonly specs: Record<string, unknown>;
  readonly notes?: string;
}

export interface NexusBuildBuildSnapshot {
  readonly buildId: string;
  readonly tenantId: string;
  readonly name: string;
  readonly useCase: NexusBuildUseCase;
  readonly budget?: number;
  readonly currency: string;
  readonly parts: readonly NexusBuildNormalizedPart[];
  readonly preferred?: boolean;
  readonly notes?: string;
  readonly metadata: Record<string, unknown>;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface NexusBuildIntakePayload {
  readonly operation?: NexusBuildWorkflowType;
  readonly workflowType?: NexusBuildWorkflowType;
  readonly intent?: NexusBuildWorkflowType;
  readonly useCase?: NexusBuildUseCase;
  readonly buildName?: string;
  readonly budget?: number | string;
  readonly currency?: string;
  readonly parts?: unknown;
  readonly savedBuild?: Record<string, unknown>;
  readonly comparisonBuilds?: unknown;
  readonly priceSources?: unknown;
  readonly watchlist?: unknown;
  readonly preferences?: Record<string, unknown>;
  readonly benchmarkContext?: Record<string, unknown>;
  readonly priceMode?: "live" | "semi-live" | "offline";
}

export interface NexusBuildIntake {
  readonly goal: GoalInput;
  readonly buildId: string;
  readonly operation: NexusBuildWorkflowType;
  readonly useCase: NexusBuildUseCase;
  readonly buildName: string;
  readonly budget?: number;
  readonly currency: string;
  readonly parts: readonly NexusBuildNormalizedPart[];
  readonly savedBuilds: readonly NexusBuildBuildSnapshot[];
  readonly comparisonBuilds: readonly NexusBuildBuildSnapshot[];
  readonly priceSources: readonly NexusBuildPriceSource[];
  readonly watchlist: readonly NexusBuildWatchItem[];
  readonly preferences: Record<string, unknown>;
  readonly benchmarkContext: Record<string, unknown>;
  readonly livePricingEnabled: boolean;
}

export interface NexusBuildCompatibilityIssue {
  readonly severity: "info" | "warning" | "error";
  readonly category: "socket" | "memory" | "power" | "fit" | "interface" | "cooling" | "bottleneck" | "value" | "comparison";
  readonly message: string;
  readonly affectedPartIds: readonly string[];
  readonly resolution?: string;
  readonly data?: Record<string, unknown>;
}

export interface NexusBuildCompatibilitySummary {
  readonly status: "pass" | "warn" | "fail";
  readonly score: number;
  readonly issues: readonly NexusBuildCompatibilityIssue[];
  readonly passes: readonly string[];
  readonly unknowns: readonly string[];
}

export interface NexusBuildPerformanceSummary {
  readonly score: number;
  readonly useCaseFit: number;
  readonly expectedOutcome: string;
  readonly bottlenecks: readonly string[];
  readonly strengths: readonly string[];
  readonly estimatedCpuScore: number;
  readonly estimatedGpuScore: number;
  readonly estimatedBuildScore: number;
}

export interface NexusBuildValueSummary {
  readonly score: number;
  readonly estimatedBuildCost?: number;
  readonly budgetFit: number;
  readonly valueNotes: readonly string[];
  readonly pricePerformanceNotes: readonly string[];
}

export interface NexusBuildRecommendationSummary {
  readonly title: string;
  readonly purchaseStrategy: string;
  readonly upgradePath: readonly string[];
  readonly alternateParts: readonly {
    readonly category: NexusBuildComponentCategory;
    readonly suggestion: string;
    readonly reason: string;
  }[];
  readonly budgetOptimizations: readonly string[];
  readonly premiumGuidance: readonly string[];
}

export interface NexusBuildComparisonSummary {
  readonly comparedBuildIds: readonly string[];
  readonly winnerBuildId?: string;
  readonly notes: readonly string[];
  readonly matrix: readonly {
    readonly buildId: string;
    readonly score: number;
    readonly summary: string;
  }[];
}

export interface NexusBuildPricingSnapshot {
  readonly snapshotId: string;
  readonly tenantId: string;
  readonly buildId: string;
  readonly partId?: string;
  readonly source: string;
  readonly label?: string;
  readonly url: string;
  readonly currency: string;
  readonly price?: number;
  readonly capturedAt: string;
  readonly rawText?: string;
  readonly metadata: Record<string, unknown>;
}

export interface NexusBuildAnalysisReport {
  readonly reportId: string;
  readonly tenantId: string;
  readonly buildId: string;
  readonly operation: NexusBuildWorkflowType;
  readonly useCase: NexusBuildUseCase;
  readonly title: string;
  readonly summary: string;
  readonly compatibility: NexusBuildCompatibilitySummary;
  readonly performance: NexusBuildPerformanceSummary;
  readonly value: NexusBuildValueSummary;
  readonly recommendation: NexusBuildRecommendationSummary;
  readonly comparison?: NexusBuildComparisonSummary;
  readonly pricing: {
    readonly snapshotCount: number;
    readonly snapshots: readonly NexusBuildPricingSnapshot[];
    readonly livePricingEnabled: boolean;
    readonly notes: readonly string[];
  };
  readonly warnings: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: Record<string, unknown>;
}

export interface NexusBuildRecommendationRun {
  readonly runId: string;
  readonly tenantId: string;
  readonly buildId: string;
  readonly reportId?: string;
  readonly operation: NexusBuildWorkflowType;
  readonly status: "draft" | "final" | "watching";
  readonly score: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: Record<string, unknown>;
}

export interface NexusBuildSavedBuild {
  readonly buildId: string;
  readonly tenantId: string;
  readonly name: string;
  readonly useCase: NexusBuildUseCase;
  readonly budget?: number;
  readonly currency: string;
  readonly parts: readonly NexusBuildNormalizedPart[];
  readonly preferred?: boolean;
  readonly notes?: string;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface NexusBuildUserPreference {
  readonly preferenceId: string;
  readonly tenantId: string;
  readonly name?: string;
  readonly useCase?: NexusBuildUseCase;
  readonly preferredBrands: readonly string[];
  readonly avoidBrands: readonly string[];
  readonly targetBudget?: number;
  readonly currency?: string;
  readonly tone: "concise" | "balanced" | "premium";
  readonly updatedAt: string;
  readonly metadata: Record<string, unknown>;
}

export interface NexusBuildCompatibilityCheck {
  readonly checkId: string;
  readonly tenantId: string;
  readonly buildId: string;
  readonly status: "pass" | "warn" | "fail";
  readonly score: number;
  readonly issues: readonly NexusBuildCompatibilityIssue[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: Record<string, unknown>;
}

export interface NexusBuildStore {
  getSavedBuild(buildId: string): Promise<NexusBuildSavedBuild | undefined>;
  listSavedBuilds(tenantId?: string): Promise<readonly NexusBuildSavedBuild[]>;
  upsertSavedBuild(build: NexusBuildSavedBuild): Promise<NexusBuildSavedBuild>;
  listCompatibilityChecks(tenantId?: string): Promise<readonly NexusBuildCompatibilityCheck[]>;
  upsertCompatibilityCheck(check: NexusBuildCompatibilityCheck): Promise<NexusBuildCompatibilityCheck>;
  listPricingSnapshots(tenantId?: string): Promise<readonly NexusBuildPricingSnapshot[]>;
  upsertPricingSnapshot(snapshot: NexusBuildPricingSnapshot): Promise<NexusBuildPricingSnapshot>;
  listAnalysisReports(tenantId?: string): Promise<readonly NexusBuildAnalysisReport[]>;
  upsertAnalysisReport(report: NexusBuildAnalysisReport): Promise<NexusBuildAnalysisReport>;
  listRecommendationRuns(tenantId?: string): Promise<readonly NexusBuildRecommendationRun[]>;
  upsertRecommendationRun(run: NexusBuildRecommendationRun): Promise<NexusBuildRecommendationRun>;
  listUserPreferences(tenantId?: string): Promise<readonly NexusBuildUserPreference[]>;
  upsertUserPreference(preference: NexusBuildUserPreference): Promise<NexusBuildUserPreference>;
}

export interface SmsMessage {
  readonly to: string;
  readonly from: string;
  readonly body: string;
  readonly tenantId?: string;
  readonly provider?: string;
  readonly messageId?: string;
  readonly status?: "queued" | "sent" | "delivered" | "failed" | "unknown";
  readonly error?: string;
  readonly sentAt?: string;
}

export interface DeliveryVerification {
  readonly status: "delivered" | "queued" | "failed" | "unknown";
  readonly messageId?: string;
  readonly detail?: string;
  readonly deliveredAt?: string;
}

export type MemoryCategory =
  | "workflow-template"
  | "success-pattern"
  | "failure-pattern"
  | "user-preference"
  | "business-rule"
  | "communication-tone"
  | "tenant-constraint";

export type MemoryTier = "episodic" | "semantic" | "procedural";

export type MemoryLessonOutcome = "success" | "failure" | "fix" | "prevention";

export interface MemoryLesson {
  readonly outcome: MemoryLessonOutcome;
  readonly symptom?: string;
  readonly cause?: string;
  readonly fix?: string;
  readonly prevention?: string;
  readonly reuseRule?: string;
  readonly evidence?: string;
}

export interface MemoryEntry {
  readonly id: string;
  readonly tenantId: string;
  readonly product: ProductKey;
  readonly category: MemoryCategory;
  readonly key: string;
  readonly value: string | Record<string, unknown>;
  readonly confidence: number;
  readonly lesson?: MemoryLesson;
  readonly sourceJobId?: string;
  readonly sourceStepId?: string;
  readonly editable: boolean;
  readonly auditTrail?: readonly MemoryAuditEntry[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type MemoryAuditAction = "create" | "update" | "edit" | "archive" | "restore";

export interface MemoryAuditEntry {
  readonly at: string;
  readonly action: MemoryAuditAction;
  readonly actorRole: PrincipalRole;
  readonly actorId?: string;
  readonly note?: string;
  readonly sourceJobId?: string;
  readonly sourceStepId?: string;
  readonly diff?: Record<string, unknown>;
  readonly lesson?: MemoryLesson;
}

export interface JobEscalation {
  readonly escalationId: string;
  readonly jobId: string;
  readonly tenantId: string;
  readonly product: ProductKey;
  readonly workflow: WorkflowKey;
  readonly severity: RiskLevel;
  readonly status: "open" | "acknowledged" | "resolved";
  readonly reason: string;
  readonly source: "approval" | "verification" | "retry-exhausted" | "policy" | "tenant-isolation" | "memory-edit";
  readonly ownerRole?: PrincipalRole;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: Record<string, unknown>;
}

export interface DashboardSnapshot {
  readonly jobs: {
    readonly total: number;
    readonly queued: number;
    readonly running: number;
    readonly waitingApproval: number;
    readonly failed: number;
    readonly completed: number;
    readonly byWorkflow: Record<string, number>;
  };
  readonly memory: {
    readonly total: number;
    readonly byCategory: Record<string, number>;
    readonly recent: readonly MemoryEntry[];
  };
  readonly approvals: {
    readonly pending: number;
  };
  readonly knowledge: KnowledgeCoverageSummary;
  readonly recentJobs: readonly JobRecord[];
}

export interface JobStore {
  load(): Promise<readonly JobRecord[]>;
  save(jobs: readonly JobRecord[]): Promise<void>;
  list(): Promise<readonly JobRecord[]>;
  get(jobId: string): Promise<JobRecord | undefined>;
  upsert(job: JobRecord): Promise<JobRecord>;
}

export interface JobQueueStore {
  load(): Promise<readonly JobQueueEntry[]>;
  save(entries: readonly JobQueueEntry[]): Promise<void>;
  list(): Promise<readonly JobQueueEntry[]>;
  get(jobId: string): Promise<JobQueueEntry | undefined>;
  upsert(entry: JobQueueEntry): Promise<JobQueueEntry>;
  enqueue(job: JobRecord, reason?: string): Promise<JobQueueEntry>;
  claim(jobId: string, workerId: string): Promise<JobQueueEntry | undefined>;
  claimNext(workerId: string): Promise<JobQueueEntry | undefined>;
  complete(jobId: string, workerId?: string): Promise<JobQueueEntry | undefined>;
  defer(jobId: string, reason: string, availableAt?: string): Promise<JobQueueEntry | undefined>;
  fail(jobId: string, reason: string): Promise<JobQueueEntry | undefined>;
  releaseStaleClaims(staleAfterMs?: number, now?: string): Promise<number>;
}

export interface MemoryStore {
  load(): Promise<readonly MemoryEntry[]>;
  get(id: string): Promise<MemoryEntry | undefined>;
  save(entries: readonly MemoryEntry[]): Promise<void>;
  list(): Promise<readonly MemoryEntry[]>;
  upsert(entry: MemoryEntry): Promise<MemoryEntry>;
}

export interface KnowledgeChunk {
  readonly id: string;
  readonly sourcePath: string;
  readonly sourceTitle: string;
  readonly sectionPath: string;
  readonly chunkIndex: number;
  readonly summary: string;
  readonly content: string;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface KnowledgeChunkMatch extends KnowledgeChunk {
  readonly score: number;
  readonly excerpt: string;
}

export interface KnowledgeStore {
  load(): Promise<readonly KnowledgeChunk[]>;
  get(id: string): Promise<KnowledgeChunk | undefined>;
  save(entries: readonly KnowledgeChunk[]): Promise<void>;
  list(): Promise<readonly KnowledgeChunk[]>;
  upsert(entry: KnowledgeChunk): Promise<KnowledgeChunk>;
  search(query: string, limit?: number): Promise<readonly KnowledgeChunkMatch[]>;
}

export interface KnowledgeCoverageLaneSummary {
  readonly lane: string;
  readonly title: string;
  readonly sourcePath: string;
  readonly present: boolean;
  readonly chunkCount: number;
}

export interface KnowledgeCoverageSummary {
  readonly totalDocuments: number;
  readonly totalChunks: number;
  readonly expectedLaneDocuments: number;
  readonly presentLaneDocuments: number;
  readonly missingLaneDocuments: number;
  readonly coveragePercent: number;
  readonly lanes: readonly KnowledgeCoverageLaneSummary[];
  readonly unknownDocuments: readonly string[];
}

export interface DomainStore {
  loadLeads(): Promise<readonly LeadRecord[]>;
  saveLeads(leads: readonly LeadRecord[]): Promise<void>;
  getLeadByPhone(tenantId: string, phone: string): Promise<LeadRecord | undefined>;
  upsertLead(lead: LeadRecord): Promise<LeadRecord>;
  appendInteraction(interaction: LeadInteraction): Promise<void>;
  appendOutboundMessage(message: SmsMessage): Promise<void>;
  listInteractions(tenantId: string): Promise<readonly LeadInteraction[]>;
  listOutbounds(tenantId: string): Promise<readonly SmsMessage[]>;
  getCallEvent(eventId: string): Promise<LeadRecoveryEvent | undefined>;
  upsertCallEvent(event: LeadRecoveryEvent): Promise<LeadRecoveryEvent>;
}

export interface RuntimeStores {
  readonly jobs: JobStore;
  readonly queue: JobQueueStore;
  readonly memory: MemoryStore;
  readonly knowledge: KnowledgeStore;
  readonly domain: DomainStore;
  readonly nexusbuild: NexusBuildStore;
  readonly provly: ProvLyStore;
}

export interface NStepLogger {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
  child(scope: string): NStepLogger;
}

export interface RuntimeConfig {
  readonly serviceName: string;
  readonly port: number;
  readonly dataDir: string;
  readonly providerMode: "mock" | "openai" | "gemini";
  readonly executionMode: ExecutionMode;
  readonly openaiApiKey?: string;
  readonly openaiModel?: string;
  readonly openaiBaseUrl?: string;
  readonly geminiApiKey?: string;
  readonly geminiModel?: string;
  readonly geminiBaseUrl?: string;
  readonly ocr?: {
    readonly provider?: "mock" | "http";
    readonly endpoint?: string;
    readonly apiKey?: string;
    readonly timeoutMs?: number;
  };
  readonly twilio?: {
    readonly accountSid?: string;
    readonly authToken?: string;
    readonly fromNumber?: string;
    readonly baseUrl?: string;
  };
  readonly sms?: {
    readonly provider?: "mock" | "twilio";
    readonly statusCallbackUrl?: string;
  };
  readonly email?: {
    readonly from?: string;
    readonly webhookUrl?: string;
  };
  readonly database?: {
    readonly provider: "file" | "supabase" | "postgres";
    readonly connectionString?: string;
  };
  readonly browser?: {
    readonly provider: "mock" | "playwright";
  };
  readonly redis?: {
    readonly url?: string;
  };
  readonly auth?: {
    readonly internalToken?: string;
  };
  readonly worker: {
    readonly pollIntervalMs: number;
    readonly staleAfterMs: number;
  };
  readonly maxRetries: number;
  readonly approvalThreshold: RiskLevel;
}

export interface WorkflowExecutionContext {
  readonly config: RuntimeConfig;
  readonly logger: NStepLogger;
  readonly stores: RuntimeStores;
  readonly tools: Record<string, unknown>;
  readonly route: RouteDecision;
  readonly job: JobRecord;
}

export interface WorkflowPlanningContext {
  readonly config: RuntimeConfig;
  readonly logger: NStepLogger;
  readonly route: RouteDecision;
}

export interface WorkflowDefinition {
  readonly key: WorkflowKey;
  readonly title: string;
  readonly description: string;
  buildPlan(input: GoalInput, context: WorkflowPlanningContext): WorkflowPlan;
  executeStep(step: JobStepState, context: WorkflowExecutionContext): Promise<StepResult>;
  verify(job: JobRecord, context: WorkflowExecutionContext): Promise<VerificationResult>;
  createMemory(job: JobRecord, context: WorkflowExecutionContext): Promise<readonly MemoryEntry[]>;
  report(job: JobRecord, context: WorkflowExecutionContext): WorkflowResult;
}

export interface VerificationFinding {
  readonly severity: "info" | "warning" | "error" | "critical";
  readonly category:
    | "acceptance"
    | "allowed_files"
    | "forbidden_files"
    | "build"
    | "test"
    | "blocker"
    | "scope_expansion"
    | "deliverables"
    | "workspace"
    | "payload"
    | "delivery"
    | "compliance";
  readonly message: string;
  readonly paths?: readonly string[];
}

export interface VerificationResult {
  readonly outcome: "accepted" | "retry_required" | "rollback_required" | "human_review_required";
  readonly checkedAt: string;
  readonly findings: readonly VerificationFinding[];
  readonly score: {
    readonly acceptance: number;
    readonly scope: number;
    readonly commands: number;
    readonly integrity: number;
    readonly compliance: number;
    readonly overall: number;
  };
}

export interface DashboardSummary {
  readonly jobs: JobRecord[];
  readonly memory: MemoryEntry[];
  readonly approvedJobs: number;
}

export interface ApprovalPolicy {
  readonly minimumRole: PrincipalRole;
  readonly approvalThreshold: RiskLevel;
  readonly externalActionsRequireApproval: boolean;
  readonly systemBypassAllowed: boolean;
}

export interface AccessDecision {
  readonly allowed: boolean;
  readonly requiresApproval: boolean;
  readonly reason: string;
  readonly blockedBy?: string;
  readonly requiredRole?: PrincipalRole;
}
