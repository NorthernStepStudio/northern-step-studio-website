import type { DashboardSnapshot, JobRecord, MemoryEntry, WorkflowDefinition, WorkflowExecutionContext, WorkflowResult } from "../../core/types.js";
import { type Stage2AgentDescriptor, type Stage2AgentFactoryContext, type Stage2Bridge } from "../../core/stage2-models.js";
export interface ReportingAgent extends Stage2AgentDescriptor {
    report(workflow: WorkflowDefinition, job: JobRecord, context: WorkflowExecutionContext): WorkflowResult;
    summarize(jobs: readonly JobRecord[], memory: readonly MemoryEntry[]): DashboardSnapshot;
}
export declare function createReportingAgent(_context: Stage2AgentFactoryContext, bridge: Stage2Bridge): ReportingAgent;
