import { getDb, type Env } from "../db";
import { getBuildIntelligence } from "./buildIntelligence";
import { getBusinessIntelligence } from "./businessIntelligence";

export interface CommandCenterSummary {
  studioHealth: 'healthy' | 'warning' | 'critical';
  topPriorities: any[];
  topRisks: any[];
  launchReadiness: {
    closestProject: string | null;
    blockerCount: number;
  };
  staleWarnings: string[];
  recentFailures: any[];
  suggestedActions: string[];
  dataFreshness: {
    repoSnapshotAge: number;
    lastBuildAge: number;
  };
}

export const getCommandCenterSummary = async (env: Env): Promise<CommandCenterSummary> => {
  const sql = getDb(env);
  
  // 1. Fetch Core Data via Helpers
  const [builds, biz] = await Promise.all([
    getBuildIntelligence(env),
    getBusinessIntelligence(env)
  ]);

  // 2. Fetch Top Risks and Priorities
  const topRisks = await sql`SELECT * FROM project_risks WHERE impact = 'high' ORDER BY created_at DESC LIMIT 5`;
  const topPriorities = await sql`SELECT * FROM projects WHERE status = 'active' ORDER BY priority DESC LIMIT 5`;

  // 3. Failures
  const recentFailures = builds.recentBuilds.filter((b: any) => b.status === 'failed');

  // 4. Stale Warnings
  const warnings: string[] = [...builds.warnings, ...biz.recommendations];
  
  // 5. Readiness
  const closest = biz.readiness.launchCandidates[0] || null;
  const blockers = builds.releaseReadiness.failed;

  let health: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (blockers > 0 || recentFailures.length > 2) health = 'warning';
  if (topRisks.length > 3) health = 'critical';

  return {
    studioHealth: health,
    topPriorities,
    topRisks,
    launchReadiness: {
      closestProject: closest,
      blockerCount: blockers
    },
    staleWarnings: warnings,
    recentFailures,
    suggestedActions: [
      "Review high-impact risks for Nexus Build",
      "Sync stale repo snapshots",
      "Finalize A11Y audit for NeuroMoves"
    ],
    dataFreshness: {
      repoSnapshotAge: 0, // Placeholder
      lastBuildAge: 0 // Placeholder
    }
  };
};
