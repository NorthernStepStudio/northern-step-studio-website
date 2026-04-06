export function buildWorkflowStatusModel(job) {
    const steps = job.steps || [];
    const counts = countStepStatuses(steps);
    const currentStep = steps.find((step) => step.status === "running" || step.status === "waiting_approval") || steps.find((step) => step.status === "pending");
    return {
        jobId: job.jobId,
        workflow: job.route?.workflow,
        status: job.status,
        approvalStatus: job.approvalStatus,
        currentStepId: currentStep?.id,
        totalSteps: steps.length,
        completedSteps: counts.completed,
        runningSteps: counts.running,
        waitingApprovalSteps: counts.waiting_approval,
        failedSteps: counts.failed,
        retryableSteps: counts.retryable,
        updatedAt: job.updatedAt,
    };
}
export function buildRetryModel(step, maxAttempts) {
    const attempts = Math.max(0, step.attempts || 0);
    const retryable = Boolean(step.retryable) && attempts < maxAttempts && step.status !== "completed";
    return {
        attempts,
        maxAttempts,
        retryable,
        exhausted: attempts >= maxAttempts,
        lastAttemptAt: step.completedAt || step.startedAt,
        lastError: step.error || step.result?.message,
        nextRetryAt: retryable ? undefined : undefined,
    };
}
function countStepStatuses(steps) {
    return steps.reduce((accumulator, step) => {
        if (step.status === "completed") {
            accumulator.completed += 1;
        }
        else if (step.status === "running") {
            accumulator.running += 1;
        }
        else if (step.status === "waiting_approval") {
            accumulator.waiting_approval += 1;
        }
        else if (step.status === "failed") {
            accumulator.failed += 1;
        }
        if (step.retry?.retryable || step.retryable) {
            accumulator.retryable += 1;
        }
        return accumulator;
    }, {
        completed: 0,
        running: 0,
        waiting_approval: 0,
        failed: 0,
        retryable: 0,
    });
}
//# sourceMappingURL=stage1-models.js.map