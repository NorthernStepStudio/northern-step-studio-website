import { getDb, type Env } from "../db";

export interface BusinessSummary {
  momentum: {
    topApp: string;
    trendingUp: string[];
    staleApps: string[];
  };
  readiness: {
    launchCandidates: string[];
    blockedProjects: string[];
  };
  risks: {
    highRiskProjects: any[];
  };
  recommendations: string[];
}

export const getBusinessIntelligence = async (env: Env): Promise<BusinessSummary> => {
  const sql = getDb(env);

  // 1. Fetch App Momentum Trends
  const momentum = await sql`
    SELECT app_key, SUM(page_views) as views, SUM(cta_clicks) as clicks
    FROM app_momentum_daily
    WHERE date_key >= date('now', '-7 days')
    GROUP BY app_key
    ORDER BY views DESC
  `;

  // 2. Fetch Project Activity
  const activity = await sql`
    SELECT project_id, SUM(decisions_count) as decisions, SUM(notes_count) as notes
    FROM project_activity_daily
    WHERE date_key >= date('now', '-7 days')
    GROUP BY project_id
  `;

  // 3. Fetch Risks
  const risks = await sql`
    SELECT id, risk, impact FROM project_risks WHERE impact = 'high' LIMIT 5
  `;

  // 4. Intelligence Summaries
  const [latestSummary] = await sql`
    SELECT summary FROM intelligence_summaries 
    WHERE summary_type = 'weekly_momentum' 
    ORDER BY created_at DESC LIMIT 1
  `;

  const trendingUp = (momentum as any[])
    .filter(m => m.views > 100)
    .slice(0, 2)
    .map(m => m.app_key);

  const staleApps = (momentum as any[])
    .filter(m => m.views < 10)
    .map(m => m.app_key);

  const recommendations: string[] = [];
  if (risks.length > 0) recommendations.push(`Address ${risks.length} high-impact risks.`);
  if (staleApps.length > 0) recommendations.push(`Revive momentum for: ${staleApps.join(', ')}.`);

  return {
    momentum: {
      topApp: (momentum[0] as any)?.app_key || "None",
      trendingUp,
      staleApps
    },
    readiness: {
      launchCandidates: [], // To be implemented with readiness scores
      blockedProjects: []
    },
    risks: {
      highRiskProjects: risks
    },
    recommendations
  };
};
