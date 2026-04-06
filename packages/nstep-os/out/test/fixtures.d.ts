import type { GoalInput, JobRecord, MemoryEntry, NStepLogger, RuntimeConfig, RuntimeStores, RouteDecision, WorkflowExecutionContext, WorkflowPlan, WorkflowStep } from "../core/types.js";
export declare function makeRuntimeConfig(overrides?: Partial<RuntimeConfig>): RuntimeConfig;
export declare function makeGoalInput(overrides?: Partial<GoalInput>): GoalInput;
export declare function makeRouteDecision(overrides?: Partial<RouteDecision>): RouteDecision;
export declare function makeWorkflowStep(overrides?: Partial<WorkflowStep>): WorkflowStep;
export declare function makeWorkflowPlan(overrides?: Partial<WorkflowPlan>): WorkflowPlan;
export declare function makeJobRecord(goal: GoalInput, overrides?: Partial<JobRecord>): JobRecord;
export declare function makeMemoryEntry(overrides?: Partial<MemoryEntry>): MemoryEntry;
export declare function makeWorkflowExecutionContext(params: {
    readonly config: RuntimeConfig;
    readonly stores: RuntimeStores;
    readonly route: RouteDecision;
    readonly job: JobRecord;
    readonly logger?: NStepLogger;
    readonly tools?: Record<string, unknown>;
}): WorkflowExecutionContext;
export declare function makeRuntimeStores(): RuntimeStores;
