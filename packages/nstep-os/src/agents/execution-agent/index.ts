import type { JobRecord, JobStepState, StepResult, WorkflowDefinition, WorkflowExecutionContext } from "../../core/types.js";
import {
  defineStage2Permission,
  defineStage2Responsibility,
  type Stage2AgentDescriptor,
  type Stage2AgentFactoryContext,
  type Stage2Bridge,
} from "../../core/stage2-models.js";

const executionResponsibilities = [
  defineStage2Responsibility(
    "Step execution",
    "Executes a planned workflow step through the Stage 1 runtime contract.",
    ["executeStep"],
  ),
  defineStage2Responsibility(
    "Runtime handoff",
    "Keeps the execution interface thin so the durable job engine remains the source of truth for state.",
    ["job engine", "workflow execution"],
  ),
  defineStage2Responsibility(
    "Execution safety",
    "Preserves approval boundaries and retry handling by delegating to the core execution pipeline.",
    ["executeStep", "approval gating", "retries"],
  ),
] as const;

const executionPermissions = [
  defineStage2Permission(
    "job",
    ["execute"],
    "May execute job steps against the Stage 1 runtime and durable state.",
    {
      mayUseExternalTools: true,
      requiresApprovalForExternalActions: true,
    },
  ),
] as const;

export interface ExecutionAgent extends Stage2AgentDescriptor {
  runStep(workflow: WorkflowDefinition, step: JobStepState, context: WorkflowExecutionContext): Promise<StepResult>;
  runJob(workflow: WorkflowDefinition, job: JobRecord, context: WorkflowExecutionContext): Promise<JobRecord>;
}

export function createExecutionAgent(_context: Stage2AgentFactoryContext, bridge: Stage2Bridge): ExecutionAgent {
  return {
    id: "execution-agent",
    title: "NStep Execution Agent",
    stage: "stage2",
    responsibilities: executionResponsibilities,
    permissions: executionPermissions,
    runStep: bridge.executeStep,
    async runJob(_workflow, job, context) {
      context.logger.debug("Execution agent job scaffold received control from the Stage 1 runtime.", {
        jobId: job.jobId,
        workflow: job.route?.workflow || job.goal.product,
      });
      return job;
    },
  };
}
