import type { JobRecord, JobStepState, RetryState, StepLogEntry, WorkflowStatusModel } from "./types.js";
export type LogModel = StepLogEntry;
export type RetryModel = RetryState;
export declare function buildWorkflowStatusModel(job: JobRecord): WorkflowStatusModel;
export declare function buildRetryModel(step: JobStepState, maxAttempts: number): RetryModel;
