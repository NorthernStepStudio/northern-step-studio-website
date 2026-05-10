import { RiskItem, RiskSeverity } from "./governance-contracts";
import { verificationEngine } from "./verification-engine";
import { repoIntegrityService } from "./repo-integrity-service";

export class RiskRegisterService {
  async getActiveRisks(): Promise<RiskItem[]> {
    const risks: RiskItem[] = [];
    
    // 1. Pull risks from Repo Integrity
    const integrityReport = await repoIntegrityService.scanRepo();
    integrityReport.findings.filter(f => f.severity === "high" || f.severity === "critical").forEach(f => {
      risks.push({
        id: f.id,
        title: f.title,
        severity: f.severity,
        source: f.source,
        affectedApps: f.affectedApps || [],
        recommendation: f.recommendation || "Manual review required.",
        detectedAt: f.at,
        status: "active"
      });
    });

    // 2. Pull risks from Verification Engine
    const verifications = await verificationEngine.runFullVerification();
    verifications.forEach(v => {
      v.findings.filter(f => f.severity === "high" || f.severity === "critical").forEach(f => {
        // Avoid duplicates
        if (!risks.find(r => r.id === f.id)) {
          risks.push({
            id: f.id,
            title: f.title,
            severity: f.severity,
            source: f.source,
            affectedApps: f.affectedApps || [],
            recommendation: f.recommendation || "Triage required via dashboard.",
            detectedAt: f.at,
            status: "active"
          });
        }
      });
    });

    // 3. Static risks (Simulated)
    if (risks.length === 0) {
      risks.push({
        id: "risk-static-1",
        title: "Delayed NexusBuild Deployment",
        severity: "medium",
        source: "project-manager",
        affectedApps: ["nexusbuild"],
        recommendation: "Check timeline alignment.",
        detectedAt: new Date().toISOString(),
        status: "active"
      });
    }

    return risks;
  }
}

export const riskRegisterService = new RiskRegisterService();
