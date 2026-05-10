import { getDb, type Env } from "../db";

export interface BuildIntelligenceSummary {
  recentBuilds: any[];
  failedPhases: string[];
  deploymentStatus: {
    production: any | null;
    staging: any | null;
  };
  releaseReadiness: {
    total: number;
    passed: number;
    failed: number;
  };
  warnings: string[];
}

export const getBuildIntelligence = async (env: Env): Promise<BuildIntelligenceSummary> => {
  const sql = getDb(env);
  
  // 1. Recent Builds
  const recentBuilds = await sql`
    SELECT id, app_key, platform, status, finished_at, version_name 
    FROM build_runs 
    ORDER BY created_at DESC 
    LIMIT 10
  `;

  // 2. Failed Phases (from logs of failed builds)
  const failedLogs = await sql`
    SELECT phase, COUNT(*) as count 
    FROM build_run_logs 
    WHERE level = 'error' 
    GROUP BY phase 
    ORDER BY count DESC 
    LIMIT 5
  `;

  // 3. Deployment Status
  const [prodDeploy] = await sql`
    SELECT * FROM deployment_runs 
    WHERE environment = 'production' AND status = 'success' 
    ORDER BY finished_at DESC LIMIT 1
  `;
  const [stageDeploy] = await sql`
    SELECT * FROM deployment_runs 
    WHERE environment = 'staging' AND status = 'success' 
    ORDER BY finished_at DESC LIMIT 1
  `;

  // 4. Release Readiness
  const readiness = await sql`
    SELECT status, COUNT(*) as count 
    FROM release_readiness_checks 
    GROUP BY status
  `;

  const totalChecks = readiness.reduce((acc, curr: any) => acc + curr.count, 0);
  const passedChecks = readiness.find((r: any) => r.status === 'pass')?.count || 0;
  const failedChecks = readiness.find((r: any) => r.status === 'fail')?.count || 0;

  const warnings: string[] = [];
  if (failedChecks > 0) warnings.push(`${failedChecks} release readiness checks are failing.`);
  
  const staleLimit = 1000 * 60 * 60 * 24 * 7; // 7 days
  if (prodDeploy && (Date.now() - new Date(prodDeploy.finished_at).getTime() > staleLimit)) {
    warnings.push("Production deployment is more than 7 days old.");
  }

  return {
    recentBuilds,
    failedPhases: failedLogs.map((l: any) => l.phase),
    deploymentStatus: {
      production: prodDeploy || null,
      staging: stageDeploy || null
    },
    releaseReadiness: {
      total: totalChecks,
      passed: passedChecks,
      failed: failedChecks
    },
    warnings
  };
};
