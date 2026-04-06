import type { KnowledgeChunk, KnowledgeChunkMatch, KnowledgeCoverageSummary } from "../core/types.js";
export interface KnowledgeDocumentSource {
    readonly sourcePath: string;
    readonly markdown: string;
    readonly title?: string;
}
export interface KnowledgeLaneDefinition {
    readonly lane: string;
    readonly title: string;
    readonly sourcePath: string;
}
export declare const KNOWLEDGE_LANE_SPECS: readonly KnowledgeLaneDefinition[];
export declare function chunkKnowledgeCorpus(sources: readonly KnowledgeDocumentSource[]): readonly KnowledgeChunk[];
export declare function chunkKnowledgeDocument(source: KnowledgeDocumentSource): readonly KnowledgeChunk[];
export declare function searchKnowledgeChunks(query: string, chunks: readonly KnowledgeChunk[], limit?: number): readonly KnowledgeChunkMatch[];
export declare function summarizeKnowledgeCoverage(chunks: readonly KnowledgeChunk[]): KnowledgeCoverageSummary;
