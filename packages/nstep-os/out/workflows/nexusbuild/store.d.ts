import type { Pool } from "pg";
import type { NexusBuildStore } from "../../core/types.js";
export interface JsonNexusBuildStoreOptions {
    readonly dataDir: string;
    readonly fileName?: string;
}
export declare function createJsonNexusBuildStore(options: JsonNexusBuildStoreOptions): Promise<NexusBuildStore>;
export declare function createPostgresNexusBuildStore(pool: Pool): Promise<NexusBuildStore>;
export declare function createNexusBuildBuildId(): string;
