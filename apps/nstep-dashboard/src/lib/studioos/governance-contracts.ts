export type GovernanceStatus = "pass" | "warn" | "fail" | "unknown" | "info";
export type RiskSeverity = "low" | "medium" | "high" | "critical";

export interface GovernanceFinding {
  id: string;
  category: "integrity" | "security" | "readiness" | "safety" | "compliance";
  status: GovernanceStatus;
  severity: RiskSeverity;
  title: string;
  message: string;
  recommendation?: string;
  source: string;
  at: string;
  affectedApps?: string[];
}

export interface RiskItem {
  id: string;
  title: string;
  severity: RiskSeverity;
  source: string;
  affectedApps: string[];
  recommendation: string;
  detectedAt: string;
  status: "active" | "mitigated" | "resolved" | "ignored";
}

export interface DeploymentReadiness {
  appId: string;
  status: "READY" | "WARNING" | "BLOCKED";
  score: number; // 0-100
  checks: {
    label: string;
    status: GovernanceStatus;
    message?: string;
  }[];
  at: string;
}

export interface RepoIntegrityReport {
  at: string;
  score: number;
  findings: GovernanceFinding[];
  stats: {
    totalFiles: number;
    protectedFiles: number;
    driftedFiles: number;
    brokenLinks: number;
  };
}

export interface ProtectedFileState {
  path: string;
  lastModified: string;
  status: "intact" | "modified" | "deleted" | "unknown";
  checksum?: string;
}
