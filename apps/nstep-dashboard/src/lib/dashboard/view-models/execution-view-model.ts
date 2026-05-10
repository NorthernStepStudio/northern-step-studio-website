import { SafeOperation, SAFE_OPERATIONS } from "@/lib/studioos/safe-operation-catalog";
import { formatDateTime } from "@/lib/dashboard/format";
import { ExecutionWorkflow, executionWorkflowService } from "@/lib/studioos/execution-workflow-service";

export interface ExecutionViewModel {
  workflows: Array<{
    id: string;
    status: string;
    statusTone: "ok" | "warning" | "info";
    title: string;
    description: string;
    at: string;
    targets: string;
    verifications: string[];
  }>;
  catalog: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    riskLevel: string;
    riskTone: "ok" | "warning" | "danger";
  }>;
}

export function buildExecutionViewModel(workflows: ExecutionWorkflow[], catalog: SafeOperation[]): ExecutionViewModel {
  return {
    workflows: workflows.map(wf => {
      const op = SAFE_OPERATIONS[wf.operationType as keyof typeof SAFE_OPERATIONS];
      return {
        id: wf.id,
        status: wf.status,
        statusTone: wf.status === 'COMPLETED' ? 'ok' : wf.status === 'WAITING_APPROVAL' ? 'warning' : 'info',
        title: op?.label || wf.operationType,
        description: op?.description || "",
        at: formatDateTime(wf.createdAt),
        targets: wf.targetApps.join(", "),
        verifications: wf.verificationRequirements
      };
    }),
    catalog: catalog.map(op => ({
      id: op.type,
      title: op.label,
      description: op.description,
      category: op.type.toUpperCase(),
      riskLevel: op.riskLevel.toUpperCase(),
      riskTone: op.riskLevel === "low" ? "ok" : op.riskLevel === "medium" ? "warning" : "danger"
    }))
  };
}

export async function loadExecutionViewModel(): Promise<ExecutionViewModel> {
  const [workflows, catalog] = await Promise.all([
    executionWorkflowService.getWorkflows(),
    Promise.resolve(Object.values(SAFE_OPERATIONS))
  ]);

  return buildExecutionViewModel(workflows, catalog);
}
