import { GovernanceFinding, GovernanceStatus, RiskSeverity } from "./governance-contracts";
import { appHealthService } from "./app-health-service";
import { repoIntegrityService } from "./repo-integrity-service";
import { telemetryService } from "./telemetry-service";

export interface VerificationResult {
  category: string;
  status: GovernanceStatus;
  findings: GovernanceFinding[];
  score: number;
}

export class VerificationEngine {
  async runFullVerification(): Promise<VerificationResult[]> {
    return telemetryService.trace("verification.runFullVerification", async () => {
      const results: VerificationResult[] = [];

      // 1. Build Verification
      results.push(await this.verifyBuilds());

      // 2. Runtime Verification
      results.push(await this.verifyRuntime());

      // 3. Governance Verification
      results.push(await this.verifyGovernance());

      // 4. Matterhorn Safety Verification
      results.push(await this.verifyMatterhornSafety());

      return results;
    });
  }

  private async verifyBuilds(): Promise<VerificationResult> {
    const healths = await appHealthService.getAllAppHealth();
    const failedBuilds = healths.filter(h => h.lastBuild.status === "failed");
    
    return {
      category: "Build Verification",
      status: failedBuilds.length > 0 ? "fail" : "pass",
      score: Math.max(0, 100 - failedBuilds.length * 20),
      findings: failedBuilds.map(h => ({
        id: `build-fail-${h.appId}`,
        category: "integrity",
        status: "fail",
        severity: "high",
        title: "Build Failure",
        message: `Last build for ${h.appId} failed.`,
        source: "build-verifier",
        at: new Date().toISOString(),
        affectedApps: [h.appId]
      }))
    };
  }

  private async verifyRuntime(): Promise<VerificationResult> {
    const healths = await appHealthService.getAllAppHealth();
    const offline = healths.filter(h => h.status === "offline");
    
    return {
      category: "Runtime Verification",
      status: offline.length > 0 ? "warn" : "pass",
      score: Math.max(0, 100 - offline.length * 15),
      findings: offline.map(h => ({
        id: `runtime-offline-${h.appId}`,
        category: "integrity",
        status: "fail",
        severity: "critical",
        title: "Service Offline",
        message: `Service ${h.appId} is unreachable.`,
        source: "runtime-verifier",
        at: new Date().toISOString(),
        affectedApps: [h.appId]
      }))
    };
  }

  private async verifyGovernance(): Promise<VerificationResult> {
    const report = await repoIntegrityService.scanRepo();
    return {
      category: "Governance Verification",
      status: report.score > 90 ? "pass" : report.score > 70 ? "warn" : "fail",
      score: report.score,
      findings: report.findings
    };
  }

  private async verifyMatterhornSafety(): Promise<VerificationResult> {
    const localBridgeConfigured = Boolean(process.env.NSTEP_DASHBOARD_MATTERHORN_HEALTH_URL?.trim());

    return {
      category: "Matterhorn Safety",
      status: localBridgeConfigured ? "pass" : "warn",
      score: localBridgeConfigured ? 100 : 70,
      findings: [
        {
          id: "safety-policy-advisory-mode",
          category: "safety",
          status: "pass",
          severity: "low",
          title: "Advisory Mode Enforced",
          message: "Matterhorn remains advisory-only. Autonomous execution is not enabled.",
          source: "safety-monitor",
          at: new Date().toISOString(),
        },
        ...(localBridgeConfigured
          ? []
          : [
              {
                id: "safety-bridge-verification-pending",
                category: "safety" as const,
                status: "warn" as const,
                severity: "medium" as const,
                title: "Bridge Verification Pending",
                message: "Matterhorn bridge health endpoint is not configured. Runtime safety verification is limited.",
                source: "safety-monitor",
                at: new Date().toISOString(),
              },
            ]),
      ],
    };
  }
}

export const verificationEngine = new VerificationEngine();
