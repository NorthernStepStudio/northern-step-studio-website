import { RepoIntegrityReport, ProtectedFileState, DeploymentReadiness } from "@/lib/studioos/governance-contracts";
import { protectedFileMonitor } from "@/lib/studioos/protected-file-monitor";
import { repoIntegrityService } from "@/lib/studioos/repo-integrity-service";
import { deploymentReadinessService } from "@/lib/studioos/deployment-readiness-service";
import { ALL_APPS } from "@/lib/studioos/app-registry";

export interface GovernanceViewModel {
  integrity: {
    score: number;
    stats: {
      total: number;
      protected: number;
      drifted: number;
      broken: number;
    };
    findings: Array<{
      id: string;
      title: string;
      status: string;
      severity: string;
    }>;
  };
  files: Array<{
    path: string;
    status: string;
    lastModified: string;
    isDrifted: boolean;
  }>;
  readiness: Array<{
    appId: string;
    status: string;
    score: number;
    checks: Array<{ label: string; status: string }>;
  }>;
}

export function buildGovernanceViewModel(
  report: RepoIntegrityReport,
  files: ProtectedFileState[],
  readiness: DeploymentReadiness[]
): GovernanceViewModel {
  return {
    integrity: {
      score: report.score,
      stats: {
        total: report.stats.totalFiles,
        protected: report.stats.protectedFiles,
        drifted: report.stats.driftedFiles,
        broken: report.stats.brokenLinks
      },
      findings: report.findings.map(f => ({
        id: f.id,
        title: f.title,
        status: f.status,
        severity: f.severity
      }))
    },
    files: files.map(f => ({
      path: f.path,
      status: f.status.toUpperCase(),
      lastModified: new Date(f.lastModified).toLocaleString(),
      isDrifted: f.status === "modified" || f.status === "deleted"
    })),
    readiness: readiness.map(r => ({
      appId: r.appId,
      status: r.status,
      score: r.score,
      checks: r.checks.map(c => ({ label: c.label, status: c.status }))
    }))
  };
}

export async function loadGovernanceViewModel(): Promise<GovernanceViewModel> {
  const [protectedFiles, integrity] = await Promise.all([
    protectedFileMonitor.detectDrift(),
    repoIntegrityService.scanRepo(),
  ]);

  const readiness = await Promise.all(ALL_APPS.map(a => deploymentReadinessService.checkReadiness(a.id)));

  return buildGovernanceViewModel(integrity, protectedFiles, readiness);
}
