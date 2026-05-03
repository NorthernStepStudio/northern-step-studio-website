import type { StudioGraphState } from "../agents/types.ts";
import { retrieveLaneContext, routeToKnowledgeLane } from "../rag/index.ts";

function resolveDatabaseUrl(value?: string): string | undefined {
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

export function createRetrievalNode(databaseUrl?: string) {
  const resolvedDatabaseUrl = resolveDatabaseUrl(databaseUrl);

  return async function retrievalNode(state: StudioGraphState): Promise<StudioGraphState> {
    const lane = routeToKnowledgeLane(state.route ?? "general");
    const retrieval = await retrieveLaneContext({
      lane,
      query: state.userMessage,
      topK: 5,
      databaseUrl: resolvedDatabaseUrl,
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
  };
}
