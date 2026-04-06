import type { Pool } from "pg";
import type { DomainStore } from "../../core/types.js";
export declare function createPostgresDomainStore(pool: Pool): Promise<DomainStore>;
