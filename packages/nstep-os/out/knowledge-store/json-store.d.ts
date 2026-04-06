import type { KnowledgeStore } from "../core/types.js";
export interface JsonKnowledgeStoreOptions {
    readonly dataDir: string;
    readonly fileName?: string;
}
export declare function createJsonKnowledgeStore(options: JsonKnowledgeStoreOptions): Promise<KnowledgeStore>;
