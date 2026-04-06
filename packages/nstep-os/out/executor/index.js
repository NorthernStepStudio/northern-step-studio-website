import { createNoopLogger } from "../core/logger.js";
import { buildWorkflowStatusModel } from "../core/stage1-models.js";
import { executeAdapterToolStep } from "./tool-path.js";
import { shouldRetryToolError } from "../tools/policy.js";
export { executeAdapterToolStep } from "./tool-path.js";
export function createExecutionService(options = {}) {
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
            }
            catch (error) {
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
export async function executeStep(workflow, step, context) {
    const service = createExecutionService();
    return (await service.executeStep(workflow, step, context)).result;
}
export async function executeJob(workflow, job, context) {
    job.workflowStatus = createExecutionService().summarizeJob(job);
    return job;
}
function normalizeStepResult(result) {
    return {
        status: result.status,
        message: result.message.trim() || "Step execution completed.",
        output: result.output,
        retryable: Boolean(result.retryable),
    };
}
//# sourceMappingURL=index.js.map