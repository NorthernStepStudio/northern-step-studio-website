import { createPostgresPool } from "../../core/postgres.js";
import { createConsoleLogger } from "../../core/logger.js";
import { defineStage3Descriptor, defineStage3Permission } from "../../core/stage3-models.js";
const DATABASE_PERMISSION = defineStage3Permission("database", ["query", "execute"], "May query or execute database operations through the runtime boundary.", {
    allowExternalActions: false,
    requiresApprovalForExternalActions: false,
    permittedAgents: [],
});
const DATABASE_DESCRIPTOR = defineStage3Descriptor("database", "postgres", ["query", "execute"], DATABASE_PERMISSION, {
    canRetry: true,
    scoped: true,
});
export function createDatabaseAdapter(config) {
    const logger = config.logger ?? createConsoleLogger("tools/database");
    const provider = resolveProvider(config.provider, config.connectionString);
    let pool = null;
    let scope = config.scope;
    async function getPool() {
        if (!config.connectionString || provider === "file") {
            return null;
        }
        if (!pool) {
            pool = createPostgresPool(config.connectionString);
        }
        return pool;
    }
    async function query(request) {
        const currentPool = await getPool();
        if (!currentPool) {
            logger.debug("Database scaffold executed in file mode.", {
                scope,
                sqlPreview: previewSql(request.sql),
            });
            return {
                rows: [],
                rowCount: 0,
                command: "SELECT",
            };
        }
        const result = await currentPool.query(request.sql, [...(request.params ?? [])]);
        return {
            rows: result.rows,
            rowCount: result.rowCount ?? 0,
            command: result.command,
        };
    }
    async function execute(request) {
        return query(request);
    }
    return {
        provider,
        descriptor: { ...DATABASE_DESCRIPTOR, provider },
        async query(request, nextScope) {
            scope = mergeScope(scope, nextScope);
            return query(request);
        },
        async execute(request, nextScope) {
            scope = mergeScope(scope, nextScope);
            return execute(request);
        },
        async close() {
            if (pool) {
                await pool.end().catch(() => undefined);
            }
            pool = null;
        },
        describe() {
            return { ...DATABASE_DESCRIPTOR, provider };
        },
        scope(nextScope) {
            return createDatabaseAdapter({
                provider,
                connectionString: config.connectionString,
                logger,
                maxAttempts: config.maxAttempts,
                scope: mergeScope(scope, nextScope),
            });
        },
    };
}
function resolveProvider(provider, connectionString) {
    if (provider === "supabase" || provider === "postgres" || provider === "file") {
        return provider;
    }
    return connectionString ? "postgres" : "file";
}
function previewSql(sql) {
    return sql.replace(/\s+/g, " ").slice(0, 120);
}
function mergeScope(current, next) {
    if (!current && !next) {
        return undefined;
    }
    return {
        ...(current || {}),
        ...(next || {}),
    };
}
//# sourceMappingURL=runtime.js.map