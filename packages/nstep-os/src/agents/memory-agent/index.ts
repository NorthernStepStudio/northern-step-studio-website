import type { JobRecord, MemoryEntry, WorkflowDefinition, WorkflowExecutionContext } from "../../core/types.js";
import {
  defineStage2Permission,
  defineStage2Responsibility,
  type Stage2AgentDescriptor,
  type Stage2AgentFactoryContext,
  type Stage2Bridge,
} from "../../core/stage2-models.js";
import { inferMemoryLesson } from "../../memory/index.js";

const memoryResponsibilities = [
  defineStage2Responsibility(
    "Pattern capture",
    "Captures successful workflow shapes and known failure patterns for future reuse.",
    ["createJobMemory"],
  ),
  defineStage2Responsibility(
    "Preference persistence",
    "Stores user and tenant preferences that improve later routing and planning decisions.",
    ["createJobMemory", "memory store"],
  ),
  defineStage2Responsibility(
    "Audit trail support",
    "Keeps memory entries editable and traceable back to the job that generated them.",
    ["createJobMemory", "job audit"],
  ),
] as const;

const memoryPermissions = [
  defineStage2Permission("memory", ["remember"], "May create memory entries from approved workflow outcomes."),
] as const;

export interface MemoryAgent extends Stage2AgentDescriptor {
  remember(workflow: WorkflowDefinition, job: JobRecord, context: WorkflowExecutionContext): Promise<readonly MemoryEntry[]>;
}

export function createMemoryAgent(_context: Stage2AgentFactoryContext, bridge: Stage2Bridge): MemoryAgent {
  return {
    id: "memory-agent",
    title: "NStep Memory Agent",
    stage: "stage2",
    responsibilities: memoryResponsibilities,
    permissions: memoryPermissions,
    async remember(workflow, job, context) {
      const entries = await bridge.createJobMemory(workflow, job, context);
      return entries.map((entry) => ({
        ...entry,
        lesson: inferMemoryLesson(job, entry),
      }));
    },
  };
}
