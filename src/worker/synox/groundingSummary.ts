import { getDb, type Env } from "../db";
import { GroundingSummary } from "../../shared/synox/memory";
import { getLatestRepoSnapshot } from "../admin-assistant";

export const getGroundingSummary = async (env: Env): Promise<GroundingSummary> => {
  const sql = getDb(env);
  
  // 1. Fetch Basic Metrics
  const [projectCount] = await sql`SELECT COUNT(*) as count FROM projects WHERE status = 'active'`;
  const [riskCount] = await sql`SELECT COUNT(*) as count FROM project_risks WHERE impact = 'high'`;
  const [decisionCount] = await sql`SELECT COUNT(*) as count FROM project_decisions WHERE created_at > date('now', '-30 days')`;
  
  // 2. Fetch Latest Snapshot
  const snapshot = await getLatestRepoSnapshot(env);
  let snapshotMeta = null;
  const warnings: string[] = [];

  if (snapshot) {
    const snap = snapshot.snapshot_data;
    snapshotMeta = {
      repoName: snap.repoName,
      scannedAt: snap.scannedAt,
      apps: snap.apps.length
    };
    
    const age = Date.now() - new Date(snapshot.created_at).getTime();
    if (age > 1000 * 60 * 60 * 24 * 3) {
      warnings.push("Synox: Latest repo snapshot is more than 3 days old.");
    }
  } else {
    warnings.push("Synox: No repository snapshot found.");
  }

  // 3. Operational Memory Metrics
  const [memoryCount] = await sql`SELECT COUNT(*) as count FROM assistant_memory WHERE is_archived = 0`;
  const recentMemory = await sql`SELECT key, category FROM assistant_memory WHERE is_archived = 0 ORDER BY created_at DESC LIMIT 3`;

  return {
    productNaming: {
      ecosystem: "NStep AI",
      agent: "Matterhorn",
      engine: "Synox",
      dashboard: "Studio Intelligence"
    },
    studioIdentity: "Northern Step Studio (NStep) is a boutique engineering and design studio building high-fidelity software and games.",
    activeProjects: (projectCount as any).count,
    highRisks: (riskCount as any).count,
    recentDecisions: (decisionCount as any).count,
    operationalMemory: {
      totalActive: (memoryCount as any).count,
      recentKeys: recentMemory.map((m: any) => `${m.category || 'general'}:${m.key}`)
    },
    latestSnapshot: snapshotMeta,
    warnings
  };
};
