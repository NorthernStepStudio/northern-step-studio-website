import type { Pool } from "pg";
import { createPostgresPool } from "../../core/postgres.js";
import { createConsoleLogger } from "../../core/logger.js";
import type { NStepLogger } from "../../core/types.js";
import { defineStage3Descriptor, defineStage3Permission, type Stage3ToolDescriptor, type Stage3ToolScope } from "../../core/stage3-models.js";

export interface DatabaseQueryRequest {
  readonly sql: string;
  readonly params?: readonly unknown[];
}

export interface DatabaseQueryResult<T = Record<string, unknown>> {
  readonly rows: readonly T[];
  readonly rowCount: number;
  readonly command?: string;
}

export interface DatabaseAdapter {
  readonly provider: "file" | "postgres" | "supabase";
  readonly descriptor: Stage3ToolDescriptor;
  query<T = Record<string, unknown>>(request: DatabaseQueryRequest, scope?: Stage3ToolScope): Promise<DatabaseQueryResult<T>>;
  execute(request: DatabaseQueryRequest, scope?: Stage3ToolScope): Promise<DatabaseQueryResult>;
  close(): Promise<void>;
  describe(): Stage3ToolDescriptor;
  scope(scope: Stage3ToolScope): DatabaseAdapter;
}

export interface DatabaseAdapterConfig {
  readonly provider?: "file" | "postgres" | "supabase";
  readonly connectionString?: string;
  readonly logger?: NStepLogger;
  readonly maxAttempts?: number;
  readonly scope?: Stage3ToolScope;
}

const DATABASE_PERMISSION = defineStage3Permission(
  "database",
  ["query", "execute"],
  "May query or execute database operations through the runtime boundary.",
  {
    allowExternalActions: false,
    requiresApprovalForExternalActions: false,
    permittedAgents: [],
  },
);

const DATABASE_DESCRIPTOR = defineStage3Descriptor("database", "postgres", ["query", "execute"], DATABASE_PERMISSION, {
  canRetry: true,
  scoped: true,
});

export function createDatabaseAdapter(config: DatabaseAdapterConfig): DatabaseAdapter {
  const logger = config.logger ?? createConsoleLogger("tools/database");
  const provider = resolveProvider(config.provider, config.connectionString);
  let pool: Pool | null = null;
  let scope: Stage3ToolScope | undefined = config.scope;

  async function getPool(): Promise<Pool | null> {
    if (!config.connectionString || provider === "file") {
      return null;
    }
    if (!pool) {
      pool = createPostgresPool(config.connectionString);
    }
    return pool;
  }

  async function query<T = Record<string, unknown>>(request: DatabaseQueryRequest): Promise<DatabaseQueryResult<T>> {
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
      rows: result.rows as T[],
      rowCount: result.rowCount ?? 0,
      command: result.command,
    };
  }

  async function execute(request: DatabaseQueryRequest): Promise<DatabaseQueryResult> {
    return query(request);
  }

  return {
    provider,
    descriptor: { ...DATABASE_DESCRIPTOR, provider },
    async query<T = Record<string, unknown>>(request: DatabaseQueryRequest, nextScope?: Stage3ToolScope) {
      scope = mergeScope(scope, nextScope);
      return query<T>(request);
    },
    async execute(request: DatabaseQueryRequest, nextScope?: Stage3ToolScope) {
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
    scope(nextScope: Stage3ToolScope) {
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

function resolveProvider(
  provider: DatabaseAdapterConfig["provider"],
  connectionString: string | undefined,
): DatabaseAdapter["provider"] {
  if (provider === "supabase" || provider === "postgres" || provider === "file") {
    return provider;
  }
  return connectionString ? "postgres" : "file";
}

function previewSql(sql: string): string {
  return sql.replace(/\s+/g, " ").slice(0, 120);
}

function mergeScope(current: Stage3ToolScope | undefined, next: Stage3ToolScope | undefined): Stage3ToolScope | undefined {
  if (!current && !next) {
    return undefined;
  }
  return {
    ...(current || {}),
    ...(next || {}),
  };
}
