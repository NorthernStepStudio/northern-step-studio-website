import { getDb, type Env } from "../db";
import { getLatestRepoSnapshot } from "../admin-assistant";
import { getActiveProjects, getFullProjectIntelligence } from "../admin-assistant";
import { getBusinessIntelligence } from "./businessIntelligence";
import { AssistantModeId, ASSISTANT_MODES } from "./assistantModes";

export interface AggregatedContext {
  mode: AssistantModeId;
  docs: string[];
  projects: any[];
  repoSnapshot: any | null;
  risks: any[];
  memory: string[];
  builds: any[];
  deployments: any[];
  analytics: any[];
  businessSummary: any | null;
  warnings: string[];
}

export const aggregateAssistantContext = async (
  env: Env, 
  modeId: AssistantModeId, 
  projectId?: number
): Promise<AggregatedContext> => {
  const mode = ASSISTANT_MODES[modeId];
  const sql = getDb(env);
  const context: AggregatedContext = {
    mode: modeId,
    docs: [],
    projects: [],
    repoSnapshot: null,
    risks: [],
    memory: [],
    builds: [],
    deployments: [],
    analytics: [],
    businessSummary: null,
    warnings: []
  };

  const allowed = mode.allowedContext;

  // 1. Fetch Company Context Docs
  if (allowed.includes('company-context') || modeId === 'prompt_generator') {
    const docs = await sql`SELECT title, content FROM assistant_context_docs LIMIT 10`;
    context.docs = docs.map((d: any) => `## ${d.title}\n${d.content}`);
  }

  // 2. Fetch Projects / Project Detail
  if (allowed.includes('projects') || modeId === 'prompt_generator') {
    if (projectId) {
      const details = await getFullProjectIntelligence(env, projectId);
      if (details) context.projects.push(details);
    } else {
      const actives = await getActiveProjects(env);
      context.projects = actives;
    }
  }

  // 3. Fetch Repo Snapshot
  if (allowed.includes('repo-snapshots') || modeId === 'prompt_generator') {
    const snapshot = await getLatestRepoSnapshot(env);
    if (snapshot) {
      context.repoSnapshot = snapshot;
      const age = Date.now() - new Date(snapshot.created_at).getTime();
      if (age > 1000 * 60 * 60 * 24 * 3) { // 3 days
        context.warnings.push("Repo snapshot is more than 3 days old and may be outdated.");
      }
    } else {
      context.warnings.push("No repo snapshot found. Technical reasoning will be limited.");
    }
  }
  // 4. Fetch Operational Memory
  if (allowed.includes('notes') || allowed.includes('memory') || modeId === 'prompt_generator') {
    const memory = await sql`SELECT value FROM assistant_memory ORDER BY created_at DESC LIMIT 5`;
    context.memory = memory.map((m: any) => m.value);
  }

  // 5. Fetch Build & Deployment Intelligence
  if (allowed.includes('builds') || modeId === 'build' || modeId === 'prompt_generator') {
    const builds = await sql`SELECT * FROM build_runs ORDER BY created_at DESC LIMIT 5`;
    context.builds = builds;
  }
  if (allowed.includes('deployments') || modeId === 'deployment' || modeId === 'prompt_generator') {
    const deployments = await sql`SELECT * FROM deployment_runs ORDER BY created_at DESC LIMIT 3`;
    context.deployments = deployments;
  }

  // 6. Fetch Analytics & Business Intelligence
  if (allowed.includes('analytics') || modeId === 'prompt_generator') {
    const momentum = await sql`SELECT * FROM app_momentum_daily ORDER BY date_key DESC LIMIT 5`;
    context.analytics = momentum;
    
    const summary = await getBusinessIntelligence(env);
    context.businessSummary = summary;
  }

  return context;
};

export const formatContextForPrompt = (context: AggregatedContext): string => {
  let prompt = `### Synox / Studio Intelligence Operational Context\n\n`;

  if (context.warnings.length > 0) {
    prompt += `#### ⚠️ CONTEXT WARNINGS\n${context.warnings.map(w => `- ${w}`).join('\n')}\n\n`;
  }

  if (context.docs.length > 0) {
    prompt += `#### GROUNDING DOCUMENTS\n${context.docs.join('\n\n')}\n\n`;
  }

  if (context.projects.length > 0) {
    prompt += `#### PROJECT INTELLIGENCE\n${JSON.stringify(context.projects, null, 2)}\n\n`;
  }

  if (context.repoSnapshot) {
    // Only include metadata-heavy parts of snapshot, not every single TODO
    const snap = context.repoSnapshot.snapshot_data;
    const summary = {
      repoName: snap.repoName,
      scannedAt: snap.scannedAt,
      apps: snap.apps,
      packages: snap.packages,
      cloudflareWorkers: snap.cloudflareSummary.workers,
      risks: snap.risks
    };
    prompt += `#### REPO SNAPSHOT (STRUCTURAL)\n${JSON.stringify(summary, null, 2)}\n\n`;
  }

  if (context.memory.length > 0) {
    prompt += `#### OPERATIONAL MEMORY\n${context.memory.join('\n---\n')}\n\n`;
  }

  if (context.builds.length > 0) {
    prompt += `#### BUILD INTELLIGENCE\n${JSON.stringify(context.builds, null, 2)}\n\n`;
  }

  if (context.deployments.length > 0) {
    prompt += `#### DEPLOYMENT INTELLIGENCE\n${JSON.stringify(context.deployments, null, 2)}\n\n`;
  }

  if (context.analytics.length > 0) {
    prompt += `#### APP MOMENTUM (ANALYTICS)\n${JSON.stringify(context.analytics, null, 2)}\n\n`;
  }

  if (context.businessSummary) {
    prompt += `#### BUSINESS INTELLIGENCE SUMMARY\n${JSON.stringify(context.businessSummary, null, 2)}\n\n`;
  }

  return prompt;
};
