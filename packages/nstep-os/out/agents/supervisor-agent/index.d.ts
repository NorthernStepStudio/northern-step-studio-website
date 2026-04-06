import type { GoalInput, JobRecord, WorkflowDefinition, WorkflowExecutionContext } from "../../core/types.js";
import { type Stage2AgentDescriptor, type Stage2AgentFactoryContext, type Stage2Bridge, type Stage2SupervisionRequest, type Stage2SupervisionResult } from "../../core/stage2-models.js";
export interface SupervisorAgent extends Stage2AgentDescriptor {
    supervise(request: Stage2SupervisionRequest, context: WorkflowExecutionContext & {
        readonly goal?: GoalInput;
        readonly job?: JobRecord;
        readonly workflow?: WorkflowDefinition;
    }): Promise<Stage2SupervisionResult>;
}
export declare function createSupervisorAgent(_context: Stage2AgentFactoryContext, _bridge: Stage2Bridge): SupervisorAgent;
