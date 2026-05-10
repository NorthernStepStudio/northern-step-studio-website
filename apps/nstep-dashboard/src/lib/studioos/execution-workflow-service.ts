import { SafeOperationType } from "./safe-operation-catalog";

export type WorkflowStatus = 
  | "QUEUED" 
  | "READY" 
  | "WAITING_APPROVAL" 
  | "EXECUTING" 
  | "VERIFYING" 
  | "COMPLETED" 
  | "FAILED" 
  | "ROLLED_BACK";

export interface WorkflowEvent {
  id: string;
  timestamp: string;
  type: "status_change" | "log" | "verification" | "approval";
  message: string;
}

export interface ExecutionWorkflow {
  id: string;
  operationType: SafeOperationType;
  targetApps: string[];
  status: WorkflowStatus;
  approvalRequired: boolean;
  approvedAt?: string;
  approvedBy?: string;
  verificationRequirements: string[];
  rollbackReference?: string;
  logs: WorkflowEvent[];
  createdAt: string;
  updatedAt: string;
}

class ExecutionWorkflowService {
  private workflows: ExecutionWorkflow[] = [
    {
      id: "wf-001",
      operationType: "create_snapshot",
      targetApps: ["synox-engine"],
      status: "COMPLETED",
      approvalRequired: false,
      verificationRequirements: ["protected_files_intact"],
      logs: [
        { id: "e1", timestamp: new Date(Date.now() - 3600000).toISOString(), type: "status_change", message: "Workflow initialized." },
        { id: "e2", timestamp: new Date(Date.now() - 3500000).toISOString(), type: "verification", message: "Verification passed: Protected files intact." },
        { id: "e3", timestamp: new Date(Date.now() - 3400000).toISOString(), type: "log", message: "Snapshot 'snap-20240509-1300' created." },
        { id: "e4", timestamp: new Date(Date.now() - 3400000).toISOString(), type: "status_change", message: "Workflow completed." }
      ],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3400000).toISOString()
    },
    {
      id: "wf-002",
      operationType: "restart_bridge",
      targetApps: ["synox-engine"],
      status: "WAITING_APPROVAL",
      approvalRequired: true,
      verificationRequirements: ["no_active_deployments"],
      logs: [
        { id: "e5", timestamp: new Date(Date.now() - 1800000).toISOString(), type: "status_change", message: "Workflow queued, awaiting manual approval." }
      ],
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      updatedAt: new Date(Date.now() - 1800000).toISOString()
    }
  ];

  async getWorkflows(): Promise<ExecutionWorkflow[]> {
    return [...this.workflows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getWorkflowById(id: string): Promise<ExecutionWorkflow | undefined> {
    return this.workflows.find(wf => wf.id === id);
  }

  async createWorkflow(op: SafeOperationType, apps: string[]): Promise<ExecutionWorkflow> {
    const newWf: ExecutionWorkflow = {
      id: `wf-${Math.random().toString(36).substr(2, 9)}`,
      operationType: op,
      targetApps: apps,
      status: "QUEUED",
      approvalRequired: true, // Default to true for safety
      verificationRequirements: [],
      logs: [{ id: "log-1", timestamp: new Date().toISOString(), type: "status_change", message: "Workflow initialized." }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.workflows.push(newWf);
    return newWf;
  }
}

export const executionWorkflowService = new ExecutionWorkflowService();
