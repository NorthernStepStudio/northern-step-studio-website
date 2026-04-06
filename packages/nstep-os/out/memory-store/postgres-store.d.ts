import type { Pool } from "pg";
import type { MemoryStore } from "../core/types.js";
export declare function createPostgresMemoryStore(pool: Pool): Promise<MemoryStore>;
