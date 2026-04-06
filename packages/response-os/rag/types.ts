import type { KnowledgeLane } from "./lane-map.ts";

export interface RetrievedChunk {
  id: string;
  lane: KnowledgeLane;
  sourceId: string;
  sourceTitle: string;
  content: string;
  score?: number;
  url?: string;
  metadata?: Record<string, any>;
}

export interface RetrievalResult {
  lane: KnowledgeLane;
  query: string;
  chunks: RetrievedChunk[];
}
