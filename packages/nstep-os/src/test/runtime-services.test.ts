import { strict as assert } from "node:assert";
import { test } from "node:test";
import { createRuntimeServices } from "../core/runtime-services.js";
import { createNoopLogger } from "../core/logger.js";
import type { WorkflowDefinition } from "../core/types.js";
import { makeGoalInput, makeJobRecord, makeRouteDecision, makeRuntimeConfig, makeRuntimeStores, makeWorkflowExecutionContext, makeWorkflowStep } from "./fixtures.js";

test("runtime services execute steps through the assembled execution service", async () => {
  const config = makeRuntimeConfig();
  const stores = makeRuntimeStores();
  const services = createRuntimeServices({ config, stores, logger: createNoopLogger() });
  const job = makeJobRecord(makeGoalInput());
  const route = makeRouteDecision();
  const context = makeWorkflowExecutionContext({ config, stores, route, job, logger: createNoopLogger() });
  const step = {
    ...makeWorkflowStep({
    id: "step-execution",
    title: "Execute runtime step",
    input: {},
    }),
    status: "pending" as const,
    attempts: 0,
  };

  const workflow: WorkflowDefinition = {
    key: "lead-recovery",
    title: "Lead Recovery",
    description: "Test workflow",
    buildPlan: () => ({
      workflow: "lead-recovery",
      jobId: job.jobId,
      steps: [step],
      approvalsRequired: false,
      summary: "Test plan.",
    }),
    executeStep: async () => ({
      status: "completed" as const,
      message: "  step completed successfully.  ",
      output: { ok: true },
      retryable: false,
    }),
    verify: async () => ({
      outcome: "accepted" as const,
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
      status: "succeeded" as const,
      summary: "Done.",
      actionsTaken: ["done"],
      data: {},
    }),
  };

  const outcome = await services.execution.executeStep(workflow, step, context);

  assert.equal(outcome.workflow, workflow.key);
  assert.equal(outcome.stepId, step.id);
  assert.equal(outcome.result.status, "completed");
  assert.equal(outcome.result.message, "step completed successfully.");
  assert.deepEqual(outcome.result.output, { ok: true });
  assert.equal(outcome.retryable, false);
});

test("verification service falls back to human review when workflow verification fails", async () => {
  const config = makeRuntimeConfig();
  const stores = makeRuntimeStores();
  const services = createRuntimeServices({ config, stores, logger: createNoopLogger() });
  const job = makeJobRecord(makeGoalInput());
  const route = makeRouteDecision();
  const context = makeWorkflowExecutionContext({ config, stores, route, job, logger: createNoopLogger() });

  const workflow: WorkflowDefinition = {
    key: "lead-recovery",
    title: "Lead Recovery",
    description: "Test workflow",
    buildPlan: () => ({
      workflow: "lead-recovery",
      jobId: job.jobId,
      steps: [],
      approvalsRequired: false,
      summary: "Test plan.",
    }),
    executeStep: async () => ({
      status: "completed" as const,
      message: "ok",
      output: null,
      retryable: false,
    }),
    verify: async () => {
      throw new Error("verification pipeline failed");
    },
    createMemory: async () => [],
    report: () => ({
      status: "succeeded" as const,
      summary: "Done.",
      actionsTaken: [],
      data: {},
    }),
  };

  const outcome = await services.verification.verifyJob(workflow, job, context);

  assert.equal(outcome.accepted, false);
  assert.equal(outcome.result.outcome, "human_review_required");
  assert.equal(outcome.findingCount, 1);
  assert.equal(outcome.errorCount, 1);
  assert.match(outcome.result.findings[0].message, /verification pipeline failed/);
});
