import type { MemoryStore } from "../core/types.js";
export interface JsonMemoryStoreOptions {
    readonly dataDir: string;
    readonly fileName?: string;
}
export declare function createJsonMemoryStore(options: JsonMemoryStoreOptions): Promise<MemoryStore>;
