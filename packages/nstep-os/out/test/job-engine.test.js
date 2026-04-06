import { strict as assert } from "node:assert";
import { test } from "node:test";
import { createNoopLogger } from "../core/logger.js";
import { createRuntimeServices } from "../core/runtime-services.js";
import { createJobEngine } from "../jobs/job-engine.js";
import { workflowRegistry } from "../workflows/index.js";
import { makeGoalInput, makeMemoryEntry, makeRuntimeConfig, makeRuntimeStores } from "./fixtures.js";
test("job engine uses the runtime service bundle to execute, verify, remember, and report jobs", async () => {
    const originalWorkflow = workflowRegistry["lead-recovery"];
    const callLog = [];
    const config = makeRuntimeConfig({
        executionMode: "inline",
        approvalThreshold: "high",
        maxRetries: 1,
    });
    const stores = makeRuntimeStores();
    const fakeWorkflow = {
        key: "lead-recovery",
        title: "Lead Recovery",
        description: "Test workflow",
        buildPlan: (input) => ({
            workflow: "lead-recovery",
            jobId: `job_${input.tenantId}`,
            steps: [
                {
                    id: "step-1",
                    type: "collect",
                    title: "Collect lead data",
                    tool: "database",
                    dependsOn: [],
                    input: {},
                    approvalRequired: false,
                    retryable: false,
                },
            ],
            approvalsRequired: false,
            summary: "Collect and verify lead data.",
        }),
        executeStep: async () => ({
            status: "completed",
            message: "workflow executeStep should not be used in this test",
            output: { skipped: true },
            retryable: false,
        }),
        verify: async () => ({
            outcome: "accepted",
            checkedAt: "2026-04-03T00:00:00.000Z",
            findings: [],
            score: {
                acceptance: 100,
                scope: 100,
                commands: 100,
                integrity: 100,
                compliance: 100,
                overall: 100,
            },
        }),
        createMemory: async () => [],
        report: () => ({
            status: "succeeded",
            summary: "Workflow completed successfully.",
            actionsTaken: ["completed", "verified"],
            data: {},
        }),
    };
    workflowRegistry["lead-recovery"] = fakeWorkflow;
    try {
        const runtimeServices = createRuntimeServices({ config, stores, logger: createNoopLogger() });
        const engine = createJobEngine({
            config,
            stores,
            logger: createNoopLogger(),
            services: {
                ...runtimeServices,
                execution: {
                    ...runtimeServices.execution,
                    executeStep: async (workflow, step, context) => {
                        callLog.push(`execution:${workflow.key}:${step.id}`);
                        return {
                            result: {
                                status: "completed",
                                message: "Step completed through runtime services.",
                                output: { stepId: step.id, workflow: workflow.key },
                                retryable: false,
                            },
                            startedAt: "2026-04-03T00:00:00.000Z",
                            completedAt: "2026-04-03T00:00:00.001Z",
                            durationMs: 1,
                            jobId: context.job.jobId,
                            stepId: step.id,
                            workflow: workflow.key,
                            attempt: step.attempts,
                            retryable: false,
                        };
                    },
                },
                verification: {
                    ...runtimeServices.verification,
                    verifyJob: async (workflow, job, context) => {
                        callLog.push(`verification:${workflow.key}:${job.jobId}`);
                        return {
                            result: {
                                outcome: "accepted",
                                checkedAt: "2026-04-03T00:00:00.002Z",
                                findings: [],
                                score: {
                                    acceptance: 100,
                                    scope: 100,
                                    commands: 100,
                                    integrity: 100,
                                    compliance: 100,
                                    overall: 100,
                                },
                            },
                            startedAt: "2026-04-03T00:00:00.002Z",
                            completedAt: "2026-04-03T00:00:00.003Z",
                            durationMs: 1,
                            accepted: true,
                            findingCount: 0,
                            errorCount: 0,
                            warningCount: 0,
                        };
                    },
                },
                memory: {
                    ...runtimeServices.memory,
                    createJobMemory: async (workflow, job, context) => {
                        callLog.push(`memory:${workflow.key}:${job.jobId}`);
                        return [
                            makeMemoryEntry({
                                tenantId: job.tenantId,
                                product: job.goal.product,
                                sourceJobId: job.jobId,
                                sourceStepId: context.job.steps[0]?.id,
                                key: `workflow.${workflow.key}.result`,
                            }),
                        ];
                    },
                    persistJobMemory: async (entries, options) => {
                        callLog.push(`persist:${entries.length}`);
                        return {
                            total: entries.length,
                            created: entries.length,
                            updated: 0,
                            ids: entries.map((entry) => entry.id),
                            byCategory: {
                                workflow: entries.length,
                            },
                            editable: entries.filter((entry) => entry.editable).length,
                        };
                    },
                },
                reporting: {
                    ...runtimeServices.reporting,
                    buildWorkflowReport: (workflow, job, context) => {
                        callLog.push(`report:${workflow.key}:${job.jobId}`);
                        return {
                            status: "succeeded",
                            summary: "Lead recovery completed.",
                            actionsTaken: ["executed", "verified"],
                            data: {
                                workflow: workflow.key,
                                jobId: job.jobId,
                            },
                        };
                    },
                },
            },
        });
        const goal = makeGoalInput({
            goal: "Recover a missed call lead",
            product: "lead-recovery",
            mode: "autonomous",
            priority: "high",
            tenantId: "tenant-alpha",
            requestedByRole: "operator",
        });
        const job = await engine.intake(goal);
        const completed = await engine.run(job.jobId);
        const queueEntry = await stores.queue.get(job.jobId);
        assert.equal(completed.status, "completed");
        assert.equal(completed.approvalStatus, "not_required");
        assert.equal(completed.result?.status, "succeeded");
        assert.equal(completed.steps[0]?.status, "completed");
        assert.equal(completed.steps[0]?.result?.message, "Step completed through runtime services.");
        assert.equal(queueEntry?.status, "completed");
        assert.deepEqual(callLog, [
            `execution:lead-recovery:step-1`,
            `verification:lead-recovery:${job.jobId}`,
            `memory:lead-recovery:${job.jobId}`,
            "persist:1",
            `report:lead-recovery:${job.jobId}`,
        ]);
    }
    finally {
        workflowRegistry["lead-recovery"] = originalWorkflow;
    }
});
//# sourceMappingURL=job-engine.test.js.map