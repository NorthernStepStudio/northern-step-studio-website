import type { JobRecord, JobStepState, StepResult, WorkflowDefinition, WorkflowExecutionContext } from "../../core/types.js";
import { type Stage2AgentDescriptor, type Stage2AgentFactoryContext, type Stage2Bridge } from "../../core/stage2-models.js";
export interface ExecutionAgent extends Stage2AgentDescriptor {
    runStep(workflow: WorkflowDefinition, step: JobStepState, context: WorkflowExecutionContext): Promise<StepResult>;
    runJob(workflow: WorkflowDefinition, job: JobRecord, context: WorkflowExecutionContext): Promise<JobRecord>;
}
export declare function createExecutionAgent(_context: Stage2AgentFactoryContext, bridge: Stage2Bridge): ExecutionAgent;
