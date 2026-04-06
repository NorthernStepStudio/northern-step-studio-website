import type { JobStepState, StepResult, WorkflowExecutionContext } from "../core/types.js";
export declare function executeAdapterToolStep(step: JobStepState, context: WorkflowExecutionContext): Promise<StepResult | undefined>;
