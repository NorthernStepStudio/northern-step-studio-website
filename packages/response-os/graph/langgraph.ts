import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import type { ConversationTurn, StudioGraphState } from "../agents/types.ts";
import { agentNode, routeNode } from "./nodes.ts";
import { retrievalNode } from "./retrieval-node.ts";

const StudioStateAnnotation = Annotation.Root({
  sessionId: Annotation<string>({
    default: () => "",
  }),
  userMessage: Annotation<string>({
    default: () => "",
  }),
  route: Annotation<StudioGraphState["route"]>({
    default: () => undefined,
  }),
  retrieval: Annotation<StudioGraphState["retrieval"]>({
    default: () => undefined,
  }),
  response: Annotation<string | undefined>({
    default: () => undefined,
  }),
  confidence: Annotation<number | undefined>({
    default: () => undefined,
  }),
  sources: Annotation<string[]>({
    reducer: (_left = [], right = []) => (right.length ? right : _left),
    default: () => [],
  }),
  evidence: Annotation<StudioGraphState["evidence"]>({
    reducer: (_left = [], right = []) => (right?.length ? right : _left),
    default: () => [],
  }),
  ui: Annotation<StudioGraphState["ui"]>({
    default: () => undefined,
  }),
  history: Annotation<ConversationTurn[]>({
    reducer: (left = [], right = []) => (right.length ? right : left),
    default: () => [],
  }),
  metadata: Annotation<Record<string, any>>({
    reducer: (left = {}, right = {}) => ({ ...left, ...right }),
    default: () => ({}),
  }),
});

export type StudioStateAnnotationType = typeof StudioStateAnnotation;

type StudioCompiledGraph = ReturnType<StateGraph<typeof StudioStateAnnotation>["compile"]>;

const compiledGraphCache = new Map<string, Promise<StudioCompiledGraph>>();

async function createCheckpointSaver(databaseUrl?: string) {
  const resolved = databaseUrl?.trim();
  if (!resolved) {
    return null;
  }

  const saver = PostgresSaver.fromConnString(resolved);
  await saver.setup();
  return saver;
}

export async function getCompiledStudioGraph(databaseUrl?: string): Promise<StudioCompiledGraph> {
  const cacheKey = databaseUrl?.trim() || "__memory__";
  const cached = compiledGraphCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const compiledPromise = (async () => {
    const checkpointer = await createCheckpointSaver(databaseUrl);
    const builder = new StateGraph(StudioStateAnnotation)
      .addNode("classify", routeNode)
      .addNode("retrieve", retrievalNode)
      .addNode("respond", agentNode)
      .addEdge(START, "classify")
      .addEdge("classify", "retrieve")
      .addEdge("retrieve", "respond")
      .addEdge("respond", END);

    return checkpointer ? builder.compile({ checkpointer }) : builder.compile();
  })();

  compiledGraphCache.set(cacheKey, compiledPromise);
  return compiledPromise;
}
