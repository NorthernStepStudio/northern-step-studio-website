import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import type { ConversationTurn, StudioGraphState } from "../agents/types.ts";
import { agentNode, routeNode } from "./nodes.ts";
import { retrievalNode } from "./retrieval-node.ts";

const StudioStateAnnotation = Annotation.Root({
  sessionId: Annotation<string>({
    value: (_l, r) => r,
    default: () => "",
  }),
  userMessage: Annotation<string>({
    value: (_l, r) => r,
    default: () => "",
  }),
  route: Annotation<StudioGraphState["route"]>({
    value: (_l, r) => r,
    default: () => undefined,
  }),
  retrieval: Annotation<StudioGraphState["retrieval"]>({
    value: (_l, r) => r,
    default: () => undefined,
  }),
  response: Annotation<string | undefined>({
    value: (_l, r) => r,
    default: () => undefined,
  }),
  confidence: Annotation<number | undefined>({
    value: (_l, r) => r,
    default: () => undefined,
  }),
  sources: Annotation<string[]>({
    value: (_left = [], right = []) => (right.length ? right : _left),
    default: () => [],
  }),
  evidence: Annotation<StudioGraphState["evidence"]>({
    value: (_left = [], right = []) => (right?.length ? right : _left),
    default: () => [],
  }),
  ui: Annotation<StudioGraphState["ui"]>({
    value: (_l, r) => r,
    default: () => undefined,
  }),
  history: Annotation<ConversationTurn[]>({
    value: (left = [], right = []) => (right.length ? right : left),
    default: () => [],
  }),
  metadata: Annotation<Record<string, any>>({
    value: (left = {}, right = {}) => ({ ...left, ...right }),
    default: () => ({}),
  }),
});

export type StudioStateAnnotationType = typeof StudioStateAnnotation;

type StudioCompiledGraph = any;

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
