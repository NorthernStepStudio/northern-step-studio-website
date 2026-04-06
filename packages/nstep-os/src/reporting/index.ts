import type {
  DashboardSnapshot,
  KnowledgeChunk,
  JobRecord,
  MemoryEntry,
  NStepLogger,
  WorkflowDefinition,
  WorkflowExecutionContext,
  WorkflowResult,
} from "../core/types.js";
import { createNoopLogger } from "../core/logger.js";
import { buildWorkflowStatusModel } from "../core/stage1-models.js";
import { summarizeKnowledgeCoverage } from "../knowledge/index.js";

export interface JobExecutionReport {
  readonly jobId: string;
  readonly tenantId: string;
  readonly product: JobRecord["goal"]["product"];
  readonly workflow?: string;
  readonly status: JobRecord["status"];
  readonly approvalStatus: JobRecord["approvalStatus"];
  readonly summary: string;
  readonly actionsTaken: readonly string[];
  readonly stepCount: number;
  readonly completedStepCount: number;
  readonly failedStepCount: number;
  readonly waitingApprovalStepCount: number;
  readonly logCount: number;
  readonly memoryCount: number;
  readonly updatedAt: string;
  readonly escalationStatus?: string;
}

export interface ReportingService {
  buildWorkflowReport(
    workflow: WorkflowDefinition,
    job: JobRecord,
    context: WorkflowExecutionContext,
  ): WorkflowResult;
  buildJobSummary(job: JobRecord): string;
  buildDashboardSnapshot(
    jobs: readonly JobRecord[],
    memory: readonly MemoryEntry[],
    knowledge?: readonly KnowledgeChunk[],
  ): DashboardSnapshot;
  buildJobExecutionReport(job: JobRecord, memoryCount?: number): JobExecutionReport;
}

export interface ReportingServiceOptions {
  readonly logger?: NStepLogger;
}

export function createReportingService(options: ReportingServiceOptions = {}): ReportingService {
  const logger = options.logger ?? createNoopLogger();

  return {
    buildWorkflowReport(workflow, job, context) {
      const result = normalizeWorkflowResult(workflow.report(job, context));
      logger.info(`Built report for ${workflow.key} job ${job.jobId}.`, {
        jobId: job.jobId,
        workflow: workflow.key,
        status: result.status,
      });
      return result;
    },
    buildJobSummary,
    buildDashboardSnapshot,
    buildJobExecutionReport(job, memoryCount = 0) {
      const result = job.result;
      const workflowStatus = job.workflowStatus || buildWorkflowStatusModel(job);
      return {
        jobId: job.jobId,
        tenantId: job.tenantId,
        product: job.goal.product,
        workflow: job.route?.workflow || job.goal.product,
        status: job.status,
        approvalStatus: job.approvalStatus,
        summary: result?.summary || buildJobSummary(job),
        actionsTaken: result?.actionsTaken || [],
        stepCount: job.steps.length,
        completedStepCount: workflowStatus.completedSteps,
        failedStepCount: workflowStatus.failedSteps,
        waitingApprovalStepCount: workflowStatus.waitingApprovalSteps,
        logCount: job.logs.length,
        memoryCount,
        updatedAt: job.updatedAt,
        escalationStatus: job.escalation?.status,
      };
    },
  };
}

export function buildWorkflowReport(
  workflow: WorkflowDefinition,
  job: JobRecord,
  context: WorkflowExecutionContext,
): WorkflowResult {
  return normalizeWorkflowResult(workflow.report(job, context));
}

export function buildJobSummary(job: JobRecord): string {
  const result = job.result?.summary || "No result yet.";
  return `${job.goal.goal} :: ${result}`;
}

export function buildDashboardSnapshot(
  jobs: readonly JobRecord[],
  memory: readonly MemoryEntry[],
  knowledge: readonly KnowledgeChunk[] = [],
): DashboardSnapshot {
  const byWorkflow: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const knowledgeCoverage = summarizeKnowledgeCoverage(knowledge);

  for (const job of jobs) {
    const workflow = job.route?.workflow || job.goal.product;
    byWorkflow[workflow] = (byWorkflow[workflow] || 0) + 1;
  }

  for (const entry of memory) {
    byCategory[entry.category] = (byCategory[entry.category] || 0) + 1;
  }

  return {
    jobs: {
      total: jobs.length,
      queued: jobs.filter((job) => job.status === "queued").length,
      running: jobs.filter((job) => job.status === "running").length,
      waitingApproval: jobs.filter((job) => job.status === "waiting_approval").length,
      failed: jobs.filter((job) => job.status === "failed").length,
      completed: jobs.filter((job) => job.status === "completed").length,
      byWorkflow,
    },
    memory: {
      total: memory.length,
      byCategory,
      recent: [...memory].slice(-5).reverse(),
    },
    approvals: {
      pending: jobs.filter((job) => job.approvalStatus === "pending").length,
    },
    knowledge: knowledgeCoverage,
    recentJobs: [...jobs].slice(-8).reverse(),
  };
}

function normalizeWorkflowResult(result: WorkflowResult): WorkflowResult {
  return {
    status: result.status,
    summary: result.summary.trim(),
    actionsTaken: result.actionsTaken.map((action) => action.trim()).filter(Boolean),
    data: result.data,
  };
}
