import { randomUUID } from "node:crypto";
import { createMemoryLesson } from "../../memory/index.js";
const STEP_TYPES = {
    databaseProbe: "database-probe",
    apiProbe: "api-probe",
    browserProbe: "browser-probe",
};
export function createSharedAdapterWorkflow() {
    return {
        key: "shared",
        title: "Shared Adapter Sample",
        description: "Neutral adapter-driven sample that exercises the generic database, API, and browser dispatch path.",
        buildPlan(goal, context) {
            const sample = readSharedSample(goal);
            const healthUrl = sample.healthUrl || `http://127.0.0.1:${context.config.port}/health`;
            return {
                workflow: "shared",
                jobId: `job_${randomUUID()}`,
                approvalsRequired: false,
                summary: `Shared adapter sample will query the database and read ${healthUrl} through API and browser adapters.`,
                steps: [
                    {
                        id: "s1",
                        type: STEP_TYPES.databaseProbe,
                        title: "Probe database adapter",
                        tool: "database",
                        dependsOn: [],
                        input: {
                            tool: "database",
                            action: "query",
                            request: {
                                sql: "SELECT 1 AS ok, $1::text AS label",
                                params: [goal.goal],
                            },
                        },
                        approvalRequired: false,
                        retryable: true,
                    },
                    {
                        id: "s2",
                        type: STEP_TYPES.apiProbe,
                        title: "Fetch health endpoint",
                        tool: "api",
                        dependsOn: ["s1"],
                        input: {
                            tool: "api",
                            action: "GET",
                            request: {
                                url: healthUrl,
                            },
                        },
                        approvalRequired: false,
                        retryable: true,
                    },
                    {
                        id: "s3",
                        type: STEP_TYPES.browserProbe,
                        title: "Read health endpoint in browser",
                        tool: "browser",
                        dependsOn: ["s2"],
                        input: {
                            tool: "browser",
                            action: "visit",
                            request: {
                                url: healthUrl,
                            },
                        },
                        approvalRequired: false,
                        retryable: true,
                    },
                ],
            };
        },
        async executeStep(step, context) {
            return {
                status: "failed",
                message: `Shared adapter sample does not implement a custom fallback for ${step.id}.`,
                retryable: false,
            };
        },
        async verify(job, context) {
            return buildVerification(job);
        },
        async createMemory(job, context) {
            const sample = readSharedSample(job.goal);
            const completed = job.steps.every((step) => step.status === "completed");
            return [
                buildMemoryEntry(job, {
                    key: "workflow.shared.adapter-sample",
                    confidence: completed ? 0.86 : 0.58,
                    value: {
                        workflow: "shared",
                        completed,
                        healthUrl: sample.healthUrl,
                        summary: job.result?.summary || "Shared adapter sample executed.",
                        stepStatuses: job.steps.map((step) => ({
                            id: step.id,
                            status: step.status,
                            tool: step.tool,
                        })),
                    },
                    lesson: createMemoryLesson(completed
                        ? {
                            outcome: "success",
                            evidence: "Shared adapter workflow completed all probes.",
                            reuseRule: "Reuse the same adapter probe set to validate infrastructure changes.",
                        }
                        : {
                            outcome: "failure",
                            symptom: "One or more adapter probes did not complete.",
                            cause: "The generic adapter path returned a partial or failed result.",
                            fix: "Use the result to inspect the failing adapter and retry the probe.",
                            prevention: "Check adapter availability before running shared workflow validation.",
                            reuseRule: "Apply this probe set whenever verifying runtime adapter health.",
                        }),
                }),
            ];
        },
        report(job, context) {
            const completed = job.steps.every((step) => step.status === "completed");
            const status = job.steps.some((step) => step.status === "failed")
                ? "failed"
                : completed
                    ? "succeeded"
                    : "partial";
            const sample = readSharedSample(job.goal);
            const actionsTaken = job.steps
                .filter((step) => step.result?.status === "completed")
                .map((step) => `${step.tool}:${step.type}`);
            return {
                status,
                summary: completed
                    ? "Shared adapter sample completed successfully."
                    : "Shared adapter sample completed with warnings or failures.",
                actionsTaken,
                data: {
                    workflow: "shared",
                    healthUrl: sample.healthUrl,
                    steps: job.steps.map((step) => ({
                        id: step.id,
                        status: step.status,
                        tool: step.tool,
                        message: step.result?.message,
                    })),
                },
            };
        },
    };
}
function readSharedSample(input) {
    const payload = input.payload && typeof input.payload === "object" && !Array.isArray(input.payload)
        ? input.payload
        : undefined;
    const sample = payload && typeof payload.shared === "object" && payload.shared && !Array.isArray(payload.shared)
        ? payload.shared
        : undefined;
    return {
        healthUrl: typeof sample?.healthUrl === "string" ? sample.healthUrl : undefined,
        label: typeof sample?.label === "string" ? sample.label : undefined,
    };
}
function buildVerification(job) {
    const failedSteps = job.steps.filter((step) => step.status === "failed");
    const completedSteps = job.steps.filter((step) => step.status === "completed");
    const total = job.steps.length || 1;
    const completedRatio = completedSteps.length / total;
    const failureRatio = failedSteps.length / total;
    const accepted = failedSteps.length === 0 && completedSteps.length === job.steps.length && job.steps.length > 0;
    return {
        outcome: accepted ? "accepted" : "human_review_required",
        checkedAt: new Date().toISOString(),
        findings: accepted
            ? [
                {
                    severity: "info",
                    category: "acceptance",
                    message: "Shared adapter sample completed successfully.",
                },
            ]
            : failedSteps.map((step) => ({
                severity: "warning",
                category: "blocker",
                message: `Shared step ${step.id} did not complete.`,
                paths: [step.id],
            })),
        score: {
            acceptance: Math.round(completedRatio * 100),
            scope: 100,
            commands: accepted ? 100 : Math.max(0, Math.round((1 - failureRatio) * 100)),
            integrity: accepted ? 100 : 75,
            compliance: 100,
            overall: accepted ? 100 : Math.max(0, Math.round((completedRatio * 100 + (1 - failureRatio) * 100 + 100 + 100 + 100) / 5)),
        },
    };
}
function buildMemoryEntry(job, entry) {
    const now = new Date().toISOString();
    return {
        id: `memory_${job.jobId}_${randomUUID()}`,
        tenantId: job.tenantId,
        product: job.goal.product,
        category: "workflow-template",
        key: entry.key,
        value: entry.value,
        confidence: entry.confidence,
        lesson: entry.lesson,
        sourceJobId: job.jobId,
        sourceStepId: job.steps[0]?.id,
        editable: true,
        createdAt: now,
        updatedAt: now,
    };
}
//# sourceMappingURL=index.js.map