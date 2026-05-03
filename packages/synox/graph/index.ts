import type { AgentInput, AgentOutput, StudioGraphState } from "../agents/types.ts";
import { appendSessionTurns, getSessionHistory } from "../memory/postgres.ts";
import { createInitialStudioState } from "./state.ts";
import { getCompiledStudioGraph } from "./langgraph.ts";

function resolveDatabaseUrl(metadata?: Record<string, any>): string | undefined {
  const candidate = metadata?.databaseUrl;
  return typeof candidate === "string" && candidate.trim() ? candidate.trim() : undefined;
}

export async function runStudioGraph(input: AgentInput): Promise<AgentOutput> {
  const databaseUrl = resolveDatabaseUrl(input.metadata);
  const existingHistory = await getSessionHistory(input.sessionId, databaseUrl);

  let state: StudioGraphState = createInitialStudioState({
    sessionId: input.sessionId,
    userMessage: input.userMessage,
    metadata: input.metadata,
    history: existingHistory,
  });

  const graph = await getCompiledStudioGraph(databaseUrl);
  const result = (await graph.invoke(state, {
    configurable: {
      thread_id: input.sessionId,
    },
  })) as StudioGraphState;

  const newTurns = result.history.slice(existingHistory.length);
  await appendSessionTurns(input.sessionId, newTurns, databaseUrl);

  return {
    response: result.response ?? "No response generated.",
    confidence: result.confidence,
    sources: result.sources ?? [],
    evidence: result.evidence ?? [],
    ui: {
      ...(result.ui ?? {}),
      route: result.route,
    },
  };
}

export { createInitialStudioState } from "./state.ts";
export { getCompiledStudioGraph } from "./langgraph.ts";
