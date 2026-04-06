import type { WorkflowDefinition, WorkflowKey } from "../core/types.js";
import { createLeadRecoveryWorkflow } from "./lead-recovery/index.js";
import { createNexusBuildWorkflow } from "./nexusbuild/index.js";
import { createSharedAdapterWorkflow } from "./shared/index.js";
import { createProvLyWorkflow } from "./provly/index.js";
import { createNeuroMovesWorkflow } from "./neurormoves/index.js";

export const workflowRegistry: Record<WorkflowKey, WorkflowDefinition> = {
  "lead-recovery": createLeadRecoveryWorkflow(),
  nexusbuild: createNexusBuildWorkflow(),
  provly: createProvLyWorkflow(),
  neurormoves: createNeuroMovesWorkflow(),
  shared: createSharedAdapterWorkflow(),
};

export function listWorkflowKeys(): WorkflowKey[] {
  return Object.keys(workflowRegistry) as WorkflowKey[];
}

export function resolveWorkflowDefinition(workflow: WorkflowKey): WorkflowDefinition {
  return workflowRegistry[workflow] || workflowRegistry.shared;
}
