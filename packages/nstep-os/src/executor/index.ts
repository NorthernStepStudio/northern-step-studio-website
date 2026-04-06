import { createNoopLogger } from "../core/logger.js";
import { buildWorkflowStatusModel } from "../core/stage1-models.js";
import type {
  JobRecord,
  JobStepState,
  NStepLogger,
  StepResult,
  WorkflowDefinition,
  WorkflowExecutionContext,
  WorkflowStatusModel,
} from "../core/types.js";
import { executeAdapterToolStep } from "./tool-path.js";
import { shouldRetryToolError } from "../tools/policy.js";

export { executeAdapterToolStep } from "./tool-path.js";

export interface ExecutionOutcome {
  readonly result: StepResult;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly durationMs: number;
  readonly jobId: string;
  readonly stepId: string;
  readonly workflow: WorkflowDefinition["key"];
  readonly attempt: number;
  readonly retryable: boolean;
}

export interface ExecutionSummary extends WorkflowStatusModel {
  readonly approvedStepCount: number;
  readonly logCount: number;
}

export interface ExecutionService {
  executeStep(
    workflow: WorkflowDefinition,
    step: JobStepState,
    context: WorkflowExecutionContext,
  ): Promise<ExecutionOutcome>;
  summarizeJob(job: JobRecord): ExecutionSummary;
}

export interface ExecutionServiceOptions {
  readonly logger?: NStepLogger;
}

export function createExecutionService(options: ExecutionServiceOptions = {}): ExecutionService {
  const logger = options.logger ?? createNoopLogger();

  return {
    async executeStep(workflow, step, context) {
      const startedAt = new Date().toISOString();
      const startedMs = Date.now();
      logger.info(`Executing ${workflow.key} step ${step.id}.`, {
        jobId: context.job.jobId,
        stepId: step.id,
        workflow: workflow.key,
        tool: step.tool,
        attempt: step.attempts,
      });

      try {
        const adapterResult = await executeAdapterToolStep(step, context);
        const result = normalizeStepResult(adapterResult || (await workflow.executeStep(step, context)));
        const completedAt = new Date().toISOString();
        const durationMs = Math.max(0, Date.now() - startedMs);
        logger.info(`Completed ${workflow.key} step ${step.id}.`, {
          jobId: context.job.jobId,
          stepId: step.id,
          workflow: workflow.key,
          status: result.status,
          durationMs,
        });

        return {
          result,
          startedAt,
          completedAt,
          durationMs,
          jobId: context.job.jobId,
          stepId: step.id,
          workflow: workflow.key,
          attempt: step.attempts,
          retryable: Boolean(result.retryable),
        };
      } catch (error) {
        const completedAt = new Date().toISOString();
        const durationMs = Math.max(0, Date.now() - startedMs);
        const message = error instanceof Error ? error.message : String(error);
        const retryable = shouldRetryToolError(error);
        logger.error(`Failed ${workflow.key} step ${step.id}.`, {
          jobId: context.job.jobId,
          stepId: step.id,
          workflow: workflow.key,
          durationMs,
          error: message,
          retryable,
        });

        return {
          result: {
            status: "failed",
            message,
            retryable,
          },
          startedAt,
          completedAt,
          durationMs,
          jobId: context.job.jobId,
          stepId: step.id,
          workflow: workflow.key,
          attempt: step.attempts,
          retryable,
        };
      }
    },
    summarizeJob(job) {
      const workflowStatus = buildWorkflowStatusModel(job);
      return {
        jobId: workflowStatus.jobId,
        workflow: workflowStatus.workflow,
        status: workflowStatus.status,
        approvalStatus: workflowStatus.approvalStatus,
        totalSteps: workflowStatus.totalSteps,
        completedSteps: workflowStatus.completedSteps,
        runningSteps: workflowStatus.runningSteps,
        waitingApprovalSteps: workflowStatus.waitingApprovalSteps,
        failedSteps: workflowStatus.failedSteps,
        retryableSteps: workflowStatus.retryableSteps,
        approvedStepCount: job.approvedStepIds.length,
        logCount: job.logs.length,
        updatedAt: workflowStatus.updatedAt,
      };
    },
  };
}

export async function executeStep(
  workflow: WorkflowDefinition,
  step: JobStepState,
  context: WorkflowExecutionContext,
): Promise<StepResult> {
  const service = createExecutionService();
  return (await service.executeStep(workflow, step, context)).result;
}

export async function executeJob(
  workflow: WorkflowDefinition,
  job: JobRecord,
  context: WorkflowExecutionContext,
): Promise<JobRecord> {
  job.workflowStatus = createExecutionService().summarizeJob(job);
  return job;
}

function normalizeStepResult(result: StepResult): StepResult {
  return {
    status: result.status,
    message: result.message.trim() || "Step execution completed.",
    output: result.output,
    retryable: Boolean(result.retryable),
  };
}
