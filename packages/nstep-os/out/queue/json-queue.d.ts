import type { JobQueueStore } from "../core/types.js";
export interface JsonJobQueueStoreOptions {
    readonly dataDir: string;
    readonly fileName?: string;
}
export declare function createJsonJobQueueStore(options: JsonJobQueueStoreOptions): Promise<JobQueueStore>;
