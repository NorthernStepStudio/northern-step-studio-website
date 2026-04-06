import type { AgentOutput, RetrievedChunk, StudioGraphState } from "../agents/types.ts";
import { runAgent } from "../agents/index.ts";
import { routeMessage } from "../router.ts";

async function inferRouteFromHistory(state: StudioGraphState): Promise<StudioGraphState["route"]> {
  for (let index = state.history.length - 1; index >= 0; index -= 1) {
    const turn = state.history[index];
    if (turn.role !== "user") {
      continue;
    }

    const historicalRoute = await routeMessage(turn.content);
    if (historicalRoute !== "general") {
      return historicalRoute;
    }
  }

  return undefined;
}

export async function routeNode(state: StudioGraphState): Promise<StudioGraphState> {
  const currentRoute = await routeMessage(state.userMessage);
  const route = currentRoute !== "general" ? currentRoute : await inferRouteFromHistory(state);

  return {
    ...state,
    route: route ?? currentRoute,
  };
}

export async function agentNode(state: StudioGraphState): Promise<StudioGraphState> {
  const retrieval = state.retrieval ?? state.metadata?.retrieval;
  const result = await runAgent({
    route: state.route ?? "general",
    input: {
      userMessage: state.userMessage,
      sessionId: state.sessionId,
      metadata: {
        ...state.metadata,
        history: state.history,
        retrieval,
      },
    },
  });

  const timestamp = new Date().toISOString();
  const evidence = result.evidence ?? buildEvidenceFromRetrieval(retrieval?.chunks ?? []);
  const sources = result.sources?.length ? result.sources : deriveSourcesFromEvidence(evidence ?? []);


  return {
    ...state,
    response: result.response,
    confidence: result.confidence,
    sources,
    evidence,
    ui: result.ui,
    history: [
      ...state.history,
      {
        role: "user",
        content: state.userMessage,
        timestamp,
      },
      {
        role: "assistant",
        content: result.response,
        timestamp,
      },
    ],
  };
}

function buildEvidenceFromRetrieval(chunks: RetrievedChunk[]): AgentOutput["evidence"] {
  if (!chunks.length) {
    return [];
  }

  return chunks.map((chunk) => ({
    title: chunk.sourceTitle,
    sourceId: chunk.sourceId,
    url: chunk.url,
  }));
}

function deriveSourcesFromEvidence(evidence: NonNullable<AgentOutput["evidence"]>): string[] {
  if (!evidence || !evidence.length) {
    return [];
  }

  return Array.from(
    new Set(
      evidence.map((entry) => entry.title).filter((title): title is string => typeof title === "string" && title.trim().length > 0),
    ),
  );
}
