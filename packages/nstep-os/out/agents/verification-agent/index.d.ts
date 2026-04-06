import type { JobRecord, VerificationResult, WorkflowDefinition, WorkflowExecutionContext } from "../../core/types.js";
import { type Stage2AgentDescriptor, type Stage2AgentFactoryContext, type Stage2Bridge } from "../../core/stage2-models.js";
export interface VerificationAgent extends Stage2AgentDescriptor {
    verify(workflow: WorkflowDefinition, job: JobRecord, context: WorkflowExecutionContext): Promise<VerificationResult>;
}
export declare function createVerificationAgent(_context: Stage2AgentFactoryContext, bridge: Stage2Bridge): VerificationAgent;
