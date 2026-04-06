import type { Pool } from "pg";
import type { JobStore } from "../core/types.js";
export declare function createPostgresJobStore(pool: Pool): Promise<JobStore>;
