import { createLeadRecoveryWorkflow } from "./lead-recovery/index.js";
import { createNexusBuildWorkflow } from "./nexusbuild/index.js";
import { createSharedAdapterWorkflow } from "./shared/index.js";
import { createProvLyWorkflow } from "./provly/index.js";
import { createNeuroMovesWorkflow } from "./neurormoves/index.js";
export const workflowRegistry = {
    "lead-recovery": createLeadRecoveryWorkflow(),
    nexusbuild: createNexusBuildWorkflow(),
    provly: createProvLyWorkflow(),
    neurormoves: createNeuroMovesWorkflow(),
    shared: createSharedAdapterWorkflow(),
};
export function listWorkflowKeys() {
    return Object.keys(workflowRegistry);
}
export function resolveWorkflowDefinition(workflow) {
    return workflowRegistry[workflow] || workflowRegistry.shared;
}
//# sourceMappingURL=index.js.map