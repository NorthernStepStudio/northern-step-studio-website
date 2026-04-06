import type { JobStore } from "../core/types.js";
export interface JsonJobStoreOptions {
    readonly dataDir: string;
    readonly fileName?: string;
}
export declare function createJsonJobStore(options: JsonJobStoreOptions): Promise<JobStore>;
