import type { Pool } from "pg";
import type { ProvLyStore } from "../../core/types.js";
export interface JsonProvLyStoreOptions {
    readonly dataDir: string;
    readonly fileName?: string;
}
export declare function createProvLyCaseId(): string;
export declare function createJsonProvLyStore(options: JsonProvLyStoreOptions): Promise<ProvLyStore>;
export declare function createPostgresProvLyStore(pool: Pool): Promise<ProvLyStore>;
