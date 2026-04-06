import type { JobStepState, LeadRecoveryInput, StepResult, WorkflowExecutionContext } from "../../core/types.js";
export declare function executeLeadRecoveryStep(step: JobStepState, context: WorkflowExecutionContext & {
    readonly input: LeadRecoveryInput;
}): Promise<StepResult>;
