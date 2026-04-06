import type { Pool } from "pg";
import type { KnowledgeStore } from "../core/types.js";
export declare function createPostgresKnowledgeStore(pool: Pool): Promise<KnowledgeStore>;
