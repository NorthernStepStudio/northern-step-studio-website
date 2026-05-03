import type { StudioGraphState } from "../agents/types.ts";
import { retrieveLaneContext, routeToKnowledgeLane } from "../rag/index.ts";

function resolveDatabaseUrl(metadata?: Record<string, any>): string | undefined {
  const candidate = metadata?.databaseUrl;
  return typeof candidate === "string" && candidate.trim() ? candidate.trim() : undefined;
}

export async function retrievalNode(state: StudioGraphState): Promise<StudioGraphState> {
  const lane = routeToKnowledgeLane(state.route ?? "general");
  const databaseUrl = resolveDatabaseUrl(state.metadata);
  const retrieval = await retrieveLaneContext({
    lane,
    query: state.userMessage,
    topK: 5,
    databaseUrl,
  });

  return {
    ...state,
    retrieval,
    metadata: {
      ...state.metadata,
      retrieval,
      retrievalLane: lane,
    },
  };
}
