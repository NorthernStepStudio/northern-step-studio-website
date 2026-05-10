import { RecoveryOption, recoveryWorkflowService } from "@/lib/studioos/recovery-workflow-service";

export interface RecoveryViewModel {
  options: Array<{
    id: string;
    title: string;
    description: string;
    risk: string;
    riskTone: "ok" | "warning" | "danger";
    steps: number;
  }>;
}

export function buildRecoveryViewModel(options: RecoveryOption[]): RecoveryViewModel {
  return {
    options: options.map(opt => ({
      id: opt.snapshotId,
      title: `Snapshot ${opt.snapshotId}`,
      description: opt.recommendation,
      risk: String(opt.integrityScore),
      riskTone: opt.safeToRollback ? "ok" : "warning",
      steps: 1
    }))
  };
}

export async function loadRecoveryViewModel(tenantId: string): Promise<RecoveryViewModel> {
  const options = await recoveryWorkflowService.getRecoveryOptions(tenantId);
  return buildRecoveryViewModel(options);
}
