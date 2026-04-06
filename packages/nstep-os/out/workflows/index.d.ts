import type { WorkflowDefinition, WorkflowKey } from "../core/types.js";
export declare const workflowRegistry: Record<WorkflowKey, WorkflowDefinition>;
export declare function listWorkflowKeys(): WorkflowKey[];
export declare function resolveWorkflowDefinition(workflow: WorkflowKey): WorkflowDefinition;
