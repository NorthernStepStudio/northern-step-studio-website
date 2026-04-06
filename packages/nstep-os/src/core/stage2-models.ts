import type {
  ApprovalStatus,
  GoalInput,
  GoalMode,
  JobRecord,
  JobStepState,
  DashboardSnapshot,
  MemoryEntry,
  NStepLogger,
  PrincipalRole,
  ProductKey,
  RouteDecision,
  RiskLevel,
  RuntimeConfig,
  RuntimeStores,
  StepResult,
  VerificationResult,
  WorkflowDefinition,
  WorkflowExecutionContext,
  WorkflowPlan,
  WorkflowPlanningContext,
  WorkflowResult,
  WorkflowKey,
} from "./types.js";

export type Stage2AgentId =
  | "supervisor-agent"
  | "thinker-agent"
  | "router-agent"
  | "source-gatherer-agent"
  | "planner-agent"
  | "research-agent"
  | "execution-agent"
  | "communication-agent"
  | "verification-agent"
  | "memory-agent"
  | "reporting-agent";

export type Stage2AgentCapability =
  | "review"
  | "reason"
  | "classify"
  | "gather"
  | "plan"
  | "research"
  | "execute"
  | "compose"
  | "verify"
  | "remember"
  | "report";

export type Stage2PermissionScope =
  | "supervision"
  | "goal"
  | "thinking"
  | "route"
  | "sources"
  | "plan"
  | "job"
  | "step"
  | "research"
  | "message"
  | "memory"
  | "report"
  | "dashboard";

export interface Stage2AgentPermission {
  readonly scope: Stage2PermissionScope;
  readonly capabilities: readonly Stage2AgentCapability[];
  readonly mayUseExternalTools: boolean;
  readonly requiresApprovalForExternalActions: boolean;
  readonly description: string;
}

export interface Stage2AgentResponsibility {
  readonly title: string;
  readonly summary: string;
  readonly stage1Touchpoints: readonly string[];
}

export interface Stage2AgentDescriptor {
  readonly id: Stage2AgentId;
  readonly title: string;
  readonly stage: "stage2";
  readonly responsibilities: readonly Stage2AgentResponsibility[];
  readonly permissions: readonly Stage2AgentPermission[];
}

export interface Stage2AgentFactoryContext {
  readonly config?: RuntimeConfig;
  readonly logger?: NStepLogger;
  readonly stores?: RuntimeStores;
  readonly tools?: Record<string, unknown>;
}

export interface Stage2ThinkRequest {
  readonly goal: GoalInput;
  readonly route?: RouteDecision;
  readonly notes?: readonly string[];
  readonly memory?: readonly MemoryEntry[];
  readonly context?: Record<string, unknown>;
}

export interface Stage2ThinkResult {
  readonly summary: string;
  readonly reasoning: readonly string[];
  readonly risks: readonly string[];
  readonly assumptions: readonly string[];
  readonly nextFocus: string;
  readonly confidence: number;
}

export interface Stage2SupervisionRequest {
  readonly goal?: GoalInput;
  readonly subject: string;
  readonly targetPhase: "thinking" | "planning" | "research" | "reporting";
  readonly summary: string;
  readonly evidence?: readonly string[];
  readonly constraints?: readonly string[];
  readonly context?: Record<string, unknown>;
}

export interface Stage2SupervisionResult {
  readonly subject: string;
  readonly targetPhase: "thinking" | "planning" | "research" | "reporting";
  readonly verdict: "approved" | "needs_adjustment" | "blocked";
  readonly findings: readonly string[];
  readonly corrections: readonly string[];
  readonly confidence: number;
  readonly notes: readonly string[];
}

export interface Stage2Bridge {
  readonly intakeGoal: (goalInput: unknown) => GoalInput;
  readonly routeGoal: (goal: GoalInput) => RouteDecision;
  readonly planGoal: (goal: GoalInput, workflow: WorkflowDefinition, context: WorkflowPlanningContext) => WorkflowPlan;
  readonly executeStep: (workflow: WorkflowDefinition, step: JobStepState, context: WorkflowExecutionContext) => Promise<StepResult>;
  readonly verifyJob: (workflow: WorkflowDefinition, job: JobRecord, context: WorkflowExecutionContext) => Promise<VerificationResult>;
  readonly createJobMemory: (workflow: WorkflowDefinition, job: JobRecord, context: WorkflowExecutionContext) => Promise<readonly MemoryEntry[]>;
  readonly buildWorkflowReport: (workflow: WorkflowDefinition, job: JobRecord, context: WorkflowExecutionContext) => WorkflowResult;
  readonly buildDashboardSnapshot: (jobs: readonly JobRecord[], memory: readonly MemoryEntry[]) => DashboardSnapshot;
}

export function defineStage2Permission(
  scope: Stage2PermissionScope,
  capabilities: readonly Stage2AgentCapability[],
  description: string,
  options: {
    readonly mayUseExternalTools?: boolean;
    readonly requiresApprovalForExternalActions?: boolean;
  } = {},
): Stage2AgentPermission {
  return {
    scope,
    capabilities: [...capabilities],
    mayUseExternalTools: options.mayUseExternalTools ?? false,
    requiresApprovalForExternalActions: options.requiresApprovalForExternalActions ?? false,
    description,
  };
}

export function defineStage2Responsibility(
  title: string,
  summary: string,
  stage1Touchpoints: readonly string[],
): Stage2AgentResponsibility {
  return {
    title,
    summary,
    stage1Touchpoints: [...stage1Touchpoints],
  };
}

export type Stage2MessageChannel = "sms" | "email" | "internal";

export interface Stage2ResearchRequest {
  readonly goal?: GoalInput;
  readonly subject: string;
  readonly sources: readonly string[];
  readonly maxSources?: number;
  readonly constraints?: readonly string[];
  readonly context?: Record<string, unknown>;
}

export interface Stage2SourceRequest {
  readonly goal?: GoalInput;
  readonly subject: string;
  readonly seedSources: readonly string[];
  readonly maxSources?: number;
  readonly constraints?: readonly string[];
  readonly context?: Record<string, unknown>;
}

export interface Stage2SourceItem {
  readonly title: string;
  readonly url?: string;
  readonly excerpt?: string;
  readonly kind: "api" | "browser" | "document" | "manual" | "unknown";
}

export interface Stage2SourceResult {
  readonly subject: string;
  readonly sources: readonly Stage2SourceItem[];
  readonly summary: string;
  readonly confidence: number;
  readonly notes: readonly string[];
}

export interface Stage2ResearchResult {
  readonly summary: string;
  readonly findings: readonly string[];
  readonly sourcesUsed: readonly string[];
  readonly confidence: number;
  readonly notes: readonly string[];
}

export interface Stage2MessageRequest {
  readonly goal?: GoalInput;
  readonly subject: string;
  readonly audience: string;
  readonly tone: "business-safe" | "warm" | "urgent";
  readonly channel: Stage2MessageChannel;
  readonly context: Record<string, unknown>;
  readonly constraints: readonly string[];
  readonly template?: string;
}

export interface Stage2MessageDraft {
  readonly subject: string;
  readonly body: string;
  readonly tone: "business-safe" | "warm" | "urgent";
  readonly channel: Stage2MessageChannel;
  readonly notes: readonly string[];
}

export type Stage2RuntimePhase =
  | "supervision"
  | "thinking"
  | "routing"
  | "source-gathering"
  | "planning"
  | "research"
  | "execution"
  | "communication"
  | "verification"
  | "memory"
  | "reporting";

export interface Stage2OrchestrationContext {
  readonly jobId?: string;
  readonly tenantId?: string;
  readonly product?: ProductKey;
  readonly workflow?: WorkflowKey;
  readonly stepId?: string;
  readonly stepType?: string;
  readonly actorRole?: PrincipalRole;
  readonly requestedByRole?: PrincipalRole;
  readonly approvalStatus?: ApprovalStatus;
  readonly mode?: GoalMode;
  readonly riskLevel?: RiskLevel;
  readonly source?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface Stage2OrchestrationSelection {
  readonly phase: Stage2RuntimePhase;
  readonly agentId: Stage2AgentId;
  readonly agentTitle: string;
  readonly capability: Stage2AgentCapability;
  readonly permissionScope: Stage2PermissionScope;
  readonly mayUseExternalTools: boolean;
  readonly requiresApprovalForExternalActions: boolean;
  readonly reason: string;
}

export interface Stage2InvocationRecord {
  readonly invocationId: string;
  readonly phase: Stage2RuntimePhase;
  readonly agentId: Stage2AgentId;
  readonly agentTitle: string;
  readonly selection: Stage2OrchestrationSelection;
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
  readonly input?: unknown;
  readonly output?: unknown;
  readonly error?: string;
}

export interface Stage2InvocationOutcome<T> {
  readonly record: Stage2InvocationRecord;
  readonly output: T;
}
