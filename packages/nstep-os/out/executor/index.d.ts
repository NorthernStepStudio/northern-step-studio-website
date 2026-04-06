import type { JobRecord, JobStepState, NStepLogger, StepResult, WorkflowDefinition, WorkflowExecutionContext, WorkflowStatusModel } from "../core/types.js";
export { executeAdapterToolStep } from "./tool-path.js";
export interface ExecutionOutcome {
    readonly result: StepResult;
    readonly startedAt: string;
    readonly completedAt: string;
    readonly durationMs: number;
    readonly jobId: string;
    readonly stepId: string;
    readonly workflow: WorkflowDefinition["key"];
    readonly attempt: number;
    readonly retryable: boolean;
}
export interface ExecutionSummary extends WorkflowStatusModel {
    readonly approvedStepCount: number;
    readonly logCount: number;
}
export interface ExecutionService {
    executeStep(workflow: WorkflowDefinition, step: JobStepState, context: WorkflowExecutionContext): Promise<ExecutionOutcome>;
    summarizeJob(job: JobRecord): ExecutionSummary;
}
export interface ExecutionServiceOptions {
    readonly logger?: NStepLogger;
}
export declare function createExecutionService(options?: ExecutionServiceOptions): ExecutionService;
export declare function executeStep(workflow: WorkflowDefinition, step: JobStepState, context: WorkflowExecutionContext): Promise<StepResult>;
export declare function executeJob(workflow: WorkflowDefinition, job: JobRecord, context: WorkflowExecutionContext): Promise<JobRecord>;
