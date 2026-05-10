import { promises as fs } from "node:fs";
import path from "node:path";

import { APP_REGISTRY } from "./app-registry";
import { RepoIntegrityReport, GovernanceFinding } from "./governance-contracts";

function scoreFromFindings(findings: GovernanceFinding[]): number {
  let score = 100;
  for (const finding of findings) {
    if (finding.status !== "fail" && finding.status !== "warn") {
      continue;
    }
    if (finding.severity === "critical") {
      score -= 20;
    } else if (finding.severity === "high") {
      score -= 12;
    } else if (finding.severity === "medium") {
      score -= 8;
    } else {
      score -= 4;
    }
  }
  return Math.max(0, score);
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export class RepoIntegrityService {
  async scanRepo(): Promise<RepoIntegrityReport> {
    const now = new Date().toISOString();
    const findings: GovernanceFinding[] = [];

    for (const app of Object.values(APP_REGISTRY)) {
      const resolvedRepoPath = path.join(process.cwd(), app.repoPath);
      const exists = await pathExists(resolvedRepoPath);
      if (!exists) {
        findings.push({
          id: `integrity-missing-repo-${app.id}`,
          category: "integrity",
          status: "fail",
          severity: "high",
          title: "Missing Repository Path",
          message: `Registered path does not exist: ${app.repoPath}`,
          recommendation: "Update app-registry path or restore the missing workspace directory.",
          source: "app-registry-validator",
          at: now,
          affectedApps: [app.id],
        });
      }
    }

    findings.push({
      id: "integrity-deep-scan-status",
      category: "integrity",
      status: "unknown",
      severity: "low",
      title: "Deep Structural Scan Pending",
      message: "Broken imports, duplicate files, and circular dependency scans are not yet connected to a live scanner.",
      recommendation: "Connect Synox or CI structural scanner output into the integrity service.",
      source: "repo-integrity-service",
      at: now,
    });

    return {
      at: now,
      score: scoreFromFindings(findings),
      findings,
      stats: {
        totalFiles: 0,
        protectedFiles: 0,
        driftedFiles: 0,
        brokenLinks: 0,
      },
    };
  }
}

export const repoIntegrityService = new RepoIntegrityService();
