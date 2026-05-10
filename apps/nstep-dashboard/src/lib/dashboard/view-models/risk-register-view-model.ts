import { riskRegisterService } from "@/lib/studioos/risk-register-service";
import type { RiskItem } from "@/lib/studioos/governance-contracts";
import { formatDateTime } from "@/lib/dashboard/format";

export interface RiskRegisterViewModel {
  risks: Array<{
    id: string;
    title: string;
    severity: string;
    severityTone: "danger" | "warning" | "ok";
    affectedApps: string;
    detectedAt: string;
    status: string;
    recommendation: string;
  }>;
}

export function buildRiskRegisterViewModel(risks: RiskItem[]): RiskRegisterViewModel {
  return {
    risks: risks.map(r => ({
      id: r.id,
      title: r.title,
      severity: r.severity.toUpperCase(),
      severityTone: r.severity === "critical" || r.severity === "high" ? "danger" : r.severity === "medium" ? "warning" : "ok",
      affectedApps: r.affectedApps.join(", "),
      detectedAt: formatDateTime(r.detectedAt),
      status: r.status.toUpperCase(),
      recommendation: r.recommendation
    }))
  };
}

export async function loadRiskRegisterViewModel(): Promise<RiskRegisterViewModel> {
  const risks = await riskRegisterService.getActiveRisks();
  return buildRiskRegisterViewModel(risks);
}
