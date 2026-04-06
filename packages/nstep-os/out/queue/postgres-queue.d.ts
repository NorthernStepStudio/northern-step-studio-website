import type { Pool } from "pg";
import type { JobQueueStore } from "../core/types.js";
export declare function createPostgresJobQueueStore(pool: Pool): Promise<JobQueueStore>;
