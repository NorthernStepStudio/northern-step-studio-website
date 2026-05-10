import { repoIntegrityService } from "./repo-integrity-service";
import { verificationEngine } from "./verification-engine";
import { riskRegisterService } from "./risk-register-service";
import { protectedFileMonitor } from "./protected-file-monitor";
import { deploymentReadinessService } from "./deployment-readiness-service";
import { Incident, incidentService } from "./incident-service";
import { RiskItem } from "./governance-contracts";
import { telemetryService } from "./telemetry-service";

type Escalation = {
  id: string;
  type: "stale_incident" | "recurring_failure" | "critical_risk_cluster";
  severity: "high" | "critical";
  message: string;
};

export class GovernanceService {
  async getOverviewSummary() {
    return telemetryService.trace("governance.getOverviewSummary", async () => {
      const [integrity, verifications, risks, protectedFiles, incidents] = await Promise.all([
        repoIntegrityService.scanRepo(),
        verificationEngine.runFullVerification(),
        riskRegisterService.getActiveRisks(),
        protectedFileMonitor.getProtectedFiles(),
        incidentService.getIncidents(),
      ]);

      const activeIncidents = incidents.filter((inc) => inc.status !== "RESOLVED");
      const deploymentReady = await deploymentReadinessService.checkReadiness("synox");
      const hasUnknownProtectedFileState = protectedFiles.some((file) => file.status === "unknown");
      const protectedFilesIntact = protectedFiles.every((file) => file.status === "intact");

      const policyViolations = verifications
        .flatMap((verification) => verification.findings)
        .filter((finding) => finding.status === "fail" && (finding.category === "safety" || finding.category === "compliance"));

      const governanceMetrics = [
        {
          label: "Snapshot Integrity",
          value: hasUnknownProtectedFileState ? "Pending verification" : `${protectedFiles.filter((file) => file.status === "intact").length}/${protectedFiles.length} intact`,
          status: hasUnknownProtectedFileState ? ("warn" as const) : protectedFilesIntact ? ("pass" as const) : ("fail" as const),
        },
        {
          label: "Safety Compliance",
          value: "Advisory-only policy enforced",
          status: policyViolations.length > 0 ? ("warn" as const) : ("pass" as const),
        },
        {
          label: "Policy Violations",
          value: `${policyViolations.length} Active`,
          status: policyViolations.length === 0 ? ("pass" as const) : ("warn" as const),
        },
        {
          label: "Protected Files",
          value: hasUnknownProtectedFileState ? "Pending verification" : protectedFilesIntact ? "Intact" : "Drifted",
          status: hasUnknownProtectedFileState ? ("warn" as const) : protectedFilesIntact ? ("pass" as const) : ("fail" as const),
        },
      ];

      const verificationMetrics = [
        { label: "Integrity Score", value: integrity.score.toString(), status: integrity.score > 80 ? ("pass" as const) : ("warn" as const) },
        {
          label: "Verification Status",
          value: verifications.every((verification) => verification.status === "pass")
            ? "Active"
            : verifications.some((verification) => verification.status === "fail")
              ? "Blocked"
              : "Attention",
          status: verifications.every((verification) => verification.status === "pass")
            ? ("pass" as const)
            : verifications.some((verification) => verification.status === "fail")
              ? ("fail" as const)
              : ("warn" as const),
        },
        { label: "Deployment Readiness", value: deploymentReady.status, status: deploymentReady.status === "READY" ? ("pass" as const) : ("warn" as const) },
        { label: "Risk Register", value: `${risks.length} Items`, status: risks.length === 0 ? ("pass" as const) : ("warn" as const) },
      ];

      const escalations = this.checkEscalations(activeIncidents, risks);
      const verificationAverage = verifications.length
        ? verifications.reduce((sum, verification) => sum + verification.score, 0) / verifications.length
        : 0;

      return {
        score: Math.round((integrity.score + verificationAverage) / 2),
        riskCount: risks.length,
        activeIncidentCount: activeIncidents.length,
        incidents: activeIncidents,
        escalations,
        deploymentReady: deploymentReady.status,
        protectedFilesIntact,
        governanceMetrics,
        verificationMetrics,
      };
    });
  }

  private checkEscalations(incidents: Incident[], risks: RiskItem[]): Escalation[] {
    const escalations: Escalation[] = [];
    const fiveHoursAgo = Date.now() - 3600000 * 5;
    incidents.forEach((inc) => {
      if (new Date(inc.createdAt).getTime() < fiveHoursAgo && inc.status !== "RESOLVED") {
        escalations.push({
          id: `esc-${inc.id}`,
          type: "stale_incident",
          severity: "high",
          message: `Incident ${inc.id} (${inc.title}) has been open for over 5 hours.`,
        });
      }
    });

    const buildFailures = incidents.filter((inc) => inc.title.toLowerCase().includes("build failure"));
    if (buildFailures.length >= 2) {
      escalations.push({
        id: "esc-build-stability",
        type: "recurring_failure",
        severity: "critical",
        message: "Multiple recurring build failures detected across studio projects.",
      });
    }

    const criticalRisks = risks.filter((risk) => risk.severity === "critical");
    if (criticalRisks.length > 0) {
      escalations.push({
        id: "esc-critical-risk-cluster",
        type: "critical_risk_cluster",
        severity: "critical",
        message: `${criticalRisks.length} critical risk item(s) require executive approval before execution.`,
      });
    }

    return escalations;
  }
}

export const governanceService = new GovernanceService();
