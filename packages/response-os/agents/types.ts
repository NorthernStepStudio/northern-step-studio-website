export type AgentRoute =
  | "general"
  | "nexusbuild"
  | "provly"
  | "noobs"
  | "neuromove"
  | "pasoscore"
  | "automation";

export interface AgentInput {
  userMessage: string;
  sessionId: string;
  metadata?: Record<string, any>;
}

export interface AgentContext {
  route: AgentRoute;
  memory?: any;
  tools?: string[];
}

export interface AgentOutput {
  response: string;
  confidence?: number;
  sources?: string[];
  evidence?: Array<{
    title: string;
    sourceId: string;
    url?: string;
  }>;
  ui?: {
    type?: string;
    tone?: "grounded" | "helpful" | "technical" | "supportive";
    matchedTopics?: string[];
    product?: string;
    [key: string]: any;
  };
}

export interface ConversationTurn {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

export interface RetrievedChunk {
  id: string;
  lane: string;
  sourceId: string;
  sourceTitle: string;
  content: string;
  score?: number;
  url?: string;
  metadata?: Record<string, any>;
}

export interface RetrievalContext {
  lane: string;
  query: string;
  chunks: RetrievedChunk[];
}

export interface StudioGraphState {
  sessionId: string;
  userMessage: string;
  route?: AgentRoute;
  retrieval?: RetrievalContext;
  response?: string;
  confidence?: number;
  sources?: string[];
  evidence?: AgentOutput["evidence"];
  ui?: AgentOutput["ui"];
  history: ConversationTurn[];
  metadata?: Record<string, any>;
}
