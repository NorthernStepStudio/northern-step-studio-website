import type { StudioGraphState } from "../agents/types.ts";

export function createInitialStudioState(args: {
  sessionId: string;
  userMessage: string;
  metadata?: Record<string, any>;
  history?: StudioGraphState["history"];
}): StudioGraphState {
  return {
    sessionId: args.sessionId,
    userMessage: args.userMessage,
    metadata: args.metadata ?? {},
    history: args.history ?? [],
    route: undefined,
    retrieval: undefined,
    response: undefined,
    confidence: undefined,
    sources: [],
    evidence: [],
    ui: undefined,
  };
}
