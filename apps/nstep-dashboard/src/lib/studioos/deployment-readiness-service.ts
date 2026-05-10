import { DeploymentReadiness, GovernanceStatus } from "./governance-contracts";
import { appHealthService } from "./app-health-service";
import { verificationEngine } from "./verification-engine";

export class DeploymentReadinessService {
  async checkReadiness(appId: string): Promise<DeploymentReadiness> {
    const health = await appHealthService.getAllAppHealth();
    const appHealth = health.find(h => h.appId === appId);
    const verifications = await verificationEngine.runFullVerification();
    
    const checks: { label: string; status: GovernanceStatus; message?: string }[] = [];
    let score = 100;

    // Check 1: Build Status
    if (appHealth?.lastBuild.status === "success") {
      checks.push({ label: "Build Integrity", status: "pass", message: "Build is stable and verified." });
    } else if (appHealth?.lastBuild.status === "unknown") {
      checks.push({ label: "Build Integrity", status: "warn", message: "Build state is pending verification." });
      score -= 20;
    } else {
      checks.push({ label: "Build Integrity", status: "fail", message: "Build is failing or stale." });
      score -= 40;
    }

    // Check 2: Governance Status
    const govVerif = verifications.find(v => v.category === "Governance Verification");
    if (govVerif && govVerif.status === "pass") {
      checks.push({ label: "Governance Compliance", status: "pass", message: "Architecture and repo standards met." });
    } else {
      checks.push({ label: "Governance Compliance", status: "warn", message: "Minor architecture drift detected." });
      score -= 10;
    }

    // Check 3: Safety Guard
    const safetyVerif = verifications.find(v => v.category === "Matterhorn Safety");
    if (safetyVerif && safetyVerif.status === "pass") {
      checks.push({ label: "AI Safety Guard", status: "pass", message: "Advisory-only protocol active." });
    } else if (safetyVerif && safetyVerif.status === "warn") {
      checks.push({ label: "AI Safety Guard", status: "warn", message: "Safety verification is partially available." });
      score -= 20;
    } else {
      checks.push({ label: "AI Safety Guard", status: "fail", message: "Safety protocol mismatch." });
      score -= 50;
    }

    let status: "READY" | "WARNING" | "BLOCKED" = "READY";
    if (score < 60) status = "BLOCKED";
    else if (score < 90) status = "WARNING";

    return {
      appId,
      status,
      score,
      checks,
      at: new Date().toISOString()
    };
  }
}

export const deploymentReadinessService = new DeploymentReadinessService();
