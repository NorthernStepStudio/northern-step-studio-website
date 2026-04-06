import type { JobRecord, MemoryEntry, WorkflowDefinition, WorkflowExecutionContext } from "../../core/types.js";
import { type Stage2AgentDescriptor, type Stage2AgentFactoryContext, type Stage2Bridge } from "../../core/stage2-models.js";
export interface MemoryAgent extends Stage2AgentDescriptor {
    remember(workflow: WorkflowDefinition, job: JobRecord, context: WorkflowExecutionContext): Promise<readonly MemoryEntry[]>;
}
export declare function createMemoryAgent(_context: Stage2AgentFactoryContext, bridge: Stage2Bridge): MemoryAgent;
