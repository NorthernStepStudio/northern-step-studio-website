export interface HealthSnapshot {
  readonly status: string;
  readonly service: string;
  readonly providerMode: string;
  readonly databaseProvider?: string;
  readonly redisProvider?: string;
  readonly checkedAt: string;
  readonly workflowKeys: readonly string[];
  readonly jobs: number;
  readonly memory: number;
  readonly dataDir: string;
}

export interface WorkflowSummary {
  readonly key: string;
  readonly title: string;
  readonly description: string;
}

export interface RouteDecision {
  readonly workflow: string;
  readonly lane: string;
  readonly riskLevel: string;
  readonly approvalRequired: boolean;
  readonly reasoning: string;
  readonly confidence: number;
  readonly tags: readonly string[];
}

export interface WorkflowStep {
  readonly id: string;
  readonly type: string;
  readonly title: string;
  readonly tool: string;
  readonly dependsOn: readonly string[];
  readonly input: Record<string, unknown>;
  readonly approvalRequired?: boolean;
  readonly retryable?: boolean;
}

export interface JobStepResult {
  readonly status: string;
  readonly message: string;
  readonly output?: Record<string, unknown>;
  readonly retryable?: boolean;
}

export interface JobStepState extends WorkflowStep {
  readonly status: string;
  readonly attempts: number;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly result?: JobStepResult;
  readonly error?: string;
}

export interface GoalInput {
  readonly goal: string;
  readonly product: string;
  readonly priority: string;
  readonly constraints: readonly string[];
  readonly mode: "assist" | "autonomous";
  readonly tenantId: string;
  readonly requestedBy?: string;
  readonly source?: "user" | "system";
  readonly payload?: Record<string, unknown>;
}

export interface StepLogEntry {
  readonly id: string;
  readonly at: string;
  readonly level: "debug" | "info" | "warn" | "error";
  readonly message: string;
  readonly data?: Record<string, unknown>;
}

export interface WorkflowPlan {
  readonly workflow: string;
  readonly jobId: string;
  readonly steps: readonly WorkflowStep[];
  readonly approvalsRequired: boolean;
  readonly summary: string;
}

export interface WorkflowResult {
  readonly status: string;
  readonly summary: string;
  readonly actionsTaken: readonly string[];
  readonly data: Record<string, unknown>;
}

export interface JobRecord {
  readonly jobId: string;
  readonly tenantId: string;
  readonly goal: GoalInput;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly route?: RouteDecision;
  readonly plan?: WorkflowPlan;
  readonly steps: readonly JobStepState[];
  readonly logs: readonly StepLogEntry[];
  readonly approvedStepIds: readonly string[];
  readonly approvalStatus: string;
  readonly result?: WorkflowResult;
  readonly error?: string;
}

export interface MemoryEntry {
  readonly id: string;
  readonly tenantId: string;
  readonly product: string;
  readonly category: string;
  readonly key: string;
  readonly value: string | Record<string, unknown>;
  readonly confidence: number;
  readonly sourceJobId?: string;
  readonly sourceStepId?: string;
  readonly editable: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface DashboardSnapshot {
  readonly jobs: {
    readonly total: number;
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
  readonly recentJobs: readonly JobRecord[];
}
