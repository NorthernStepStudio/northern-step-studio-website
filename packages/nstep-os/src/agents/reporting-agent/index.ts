import type { DashboardSnapshot, JobRecord, MemoryEntry, WorkflowDefinition, WorkflowExecutionContext, WorkflowResult } from "../../core/types.js";
import {
  defineStage2Permission,
  defineStage2Responsibility,
  type Stage2AgentDescriptor,
  type Stage2AgentFactoryContext,
  type Stage2Bridge,
} from "../../core/stage2-models.js";

const reportingResponsibilities = [
  defineStage2Responsibility(
    "Workflow reporting",
    "Produces the final workflow result that the runtime can show to users and operators.",
    ["buildWorkflowReport"],
  ),
  defineStage2Responsibility(
    "Dashboard summarization",
    "Builds a dashboard snapshot from jobs and memory without exposing runtime internals.",
    ["buildDashboardSnapshot"],
  ),
  defineStage2Responsibility(
    "Operational visibility",
    "Keeps reporting aligned with audit logs, approvals, and step-level execution history.",
    ["buildWorkflowReport", "buildDashboardSnapshot"],
  ),
] as const;

const reportingPermissions = [
  defineStage2Permission("report", ["report"], "May summarize workflow outcomes and dashboard state."),
] as const;

export interface ReportingAgent extends Stage2AgentDescriptor {
  report(workflow: WorkflowDefinition, job: JobRecord, context: WorkflowExecutionContext): WorkflowResult;
  summarize(jobs: readonly JobRecord[], memory: readonly MemoryEntry[]): DashboardSnapshot;
}

export function createReportingAgent(_context: Stage2AgentFactoryContext, bridge: Stage2Bridge): ReportingAgent {
  return {
    id: "reporting-agent",
    title: "NStep Reporting Agent",
    stage: "stage2",
    responsibilities: reportingResponsibilities,
    permissions: reportingPermissions,
    report: bridge.buildWorkflowReport,
    summarize: bridge.buildDashboardSnapshot,
  };
}
