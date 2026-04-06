import type { DashboardSnapshot, GoalInput, JobRecord, JobStepState, MemoryEntry, NStepLogger, RouteDecision, StepResult, VerificationResult, WorkflowDefinition, WorkflowExecutionContext, WorkflowPlan, WorkflowPlanningContext, WorkflowResult } from "./types.js";
import type { Stage2AgentDescriptor, Stage2InvocationOutcome, Stage2InvocationRecord, Stage2MessageDraft, Stage2MessageRequest, Stage2OrchestrationContext, Stage2OrchestrationSelection, Stage2ThinkRequest, Stage2ThinkResult, Stage2SupervisionRequest, Stage2SupervisionResult, Stage2SourceRequest, Stage2SourceResult, Stage2ResearchRequest, Stage2ResearchResult, Stage2RuntimePhase } from "./stage2-models.js";
import type { Stage2Agents } from "../agents/index.js";
export interface Stage2RuntimeOrchestrator {
    readonly descriptors: readonly Stage2AgentDescriptor[];
    select(phase: Stage2RuntimePhase, context?: Stage2OrchestrationContext): Stage2OrchestrationSelection;
    think(request: Stage2ThinkRequest, context?: Stage2OrchestrationContext): Promise<Stage2InvocationOutcome<Stage2ThinkResult>>;
    supervise(request: Stage2SupervisionRequest, context?: Stage2OrchestrationContext): Promise<Stage2InvocationOutcome<Stage2SupervisionResult>>;
    gatherSources(request: Stage2SourceRequest, context?: Stage2OrchestrationContext): Promise<Stage2InvocationOutcome<Stage2SourceResult>>;
    route(goal: GoalInput, context?: Stage2OrchestrationContext): Promise<Stage2InvocationOutcome<RouteDecision>>;
    plan(goal: GoalInput, workflow: WorkflowDefinition, context: WorkflowPlanningContext & Stage2OrchestrationContext): Promise<Stage2InvocationOutcome<WorkflowPlan>>;
    research(request: Stage2ResearchRequest, context?: Stage2OrchestrationContext): Promise<Stage2InvocationOutcome<Stage2ResearchResult>>;
    executeStep(workflow: WorkflowDefinition, step: JobStepState, context: WorkflowExecutionContext & Stage2OrchestrationContext): Promise<Stage2InvocationOutcome<StepResult>>;
    composeMessage(request: Stage2MessageRequest, context?: Stage2OrchestrationContext): Promise<Stage2InvocationOutcome<Stage2MessageDraft>>;
    verifyJob(workflow: WorkflowDefinition, job: JobRecord, context: WorkflowExecutionContext & Stage2OrchestrationContext): Promise<Stage2InvocationOutcome<VerificationResult>>;
    remember(workflow: WorkflowDefinition, job: JobRecord, context: WorkflowExecutionContext & Stage2OrchestrationContext): Promise<Stage2InvocationOutcome<readonly MemoryEntry[]>>;
    report(workflow: WorkflowDefinition, job: JobRecord, context: WorkflowExecutionContext & Stage2OrchestrationContext): Promise<Stage2InvocationOutcome<WorkflowResult>>;
    summarize(jobs: readonly JobRecord[], memory: readonly MemoryEntry[], context?: Stage2OrchestrationContext): Promise<Stage2InvocationOutcome<DashboardSnapshot>>;
    history(jobId?: string): readonly Stage2InvocationRecord[];
}
export interface Stage2OrchestratorOptions {
    readonly logger?: NStepLogger;
}
export declare function createStage2Orchestrator(agents: Stage2Agents, options?: Stage2OrchestratorOptions): Stage2RuntimeOrchestrator;
