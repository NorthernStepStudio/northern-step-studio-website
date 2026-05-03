import type { AgentInput, AgentOutput, StudioGraphState } from "../agents/types.ts";
import { appendSessionTurns, getSessionHistory } from "../memory/postgres.ts";
import { createInitialStudioState } from "./state.ts";
import { getCompiledStudioGraph } from "./langgraph.ts";

export interface StudioRuntimeOptions {
  databaseUrl?: string;
}

function resolveRuntimeDatabaseUrl(value?: string): string | undefined {
  const candidate = typeof value === "string" ? value.trim() : "";
  if (!candidate) {
    return undefined;
  }

  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "postgres:" || parsed.protocol === "postgresql:" ? candidate : undefined;
  } catch {
    return undefined;
  }
}

export async function runStudioGraph(input: AgentInput, runtime: StudioRuntimeOptions = {}): Promise<AgentOutput> {
  const databaseUrl = resolveRuntimeDatabaseUrl(runtime.databaseUrl);
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
