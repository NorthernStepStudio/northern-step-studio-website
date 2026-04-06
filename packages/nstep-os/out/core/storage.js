import { createJsonDomainStore } from "../tools/database/index.js";
import { createJsonJobQueueStore } from "../queue/index.js";
import { createJsonNexusBuildStore } from "../workflows/nexusbuild/store.js";
import { createJsonProvLyStore } from "../workflows/provly/store.js";
import { createJsonJobStore } from "../jobs/job-store.js";
import { createJsonMemoryStore } from "../memory-store/memory-store.js";
import { createJsonKnowledgeStore } from "../knowledge-store/index.js";
import { createPostgresJobQueueStore } from "../queue/index.js";
import { createPostgresJobStore } from "../jobs/postgres-store.js";
import { createPostgresMemoryStore } from "../memory-store/postgres-store.js";
import { createPostgresDomainStore } from "../tools/database/postgres-store.js";
import { createPostgresNexusBuildStore } from "../workflows/nexusbuild/store.js";
import { createPostgresProvLyStore } from "../workflows/provly/store.js";
import { createPostgresKnowledgeStore } from "../knowledge-store/index.js";
import { createPostgresPool } from "./postgres.js";
export async function createRuntimeStores(config, dependencies = {}) {
    if (config.database?.provider !== "file" && config.database?.connectionString) {
        const pool = createPostgresPool(config.database.connectionString);
        return {
            jobs: dependencies.jobs ?? (await createPostgresJobStore(pool)),
            queue: dependencies.queue ?? (await createPostgresJobQueueStore(pool)),
            memory: dependencies.memory ?? (await createPostgresMemoryStore(pool)),
            knowledge: dependencies.knowledge ?? (await createPostgresKnowledgeStore(pool)),
            domain: dependencies.domain ?? (await createPostgresDomainStore(pool)),
            nexusbuild: dependencies.nexusbuild ?? (await createPostgresNexusBuildStore(pool)),
            provly: dependencies.provly ?? (await createPostgresProvLyStore(pool)),
        };
    }
    return {
        jobs: dependencies.jobs ?? (await createJsonJobStore({ dataDir: config.dataDir })),
        queue: dependencies.queue ?? (await createJsonJobQueueStore({ dataDir: config.dataDir })),
        memory: dependencies.memory ?? (await createJsonMemoryStore({ dataDir: config.dataDir })),
        knowledge: dependencies.knowledge ?? (await createJsonKnowledgeStore({ dataDir: config.dataDir })),
        domain: dependencies.domain ?? (await createJsonDomainStore({ dataDir: config.dataDir })),
        nexusbuild: dependencies.nexusbuild ?? (await createJsonNexusBuildStore({ dataDir: config.dataDir })),
        provly: dependencies.provly ?? (await createJsonProvLyStore({ dataDir: config.dataDir })),
    };
}
//# sourceMappingURL=storage.js.map