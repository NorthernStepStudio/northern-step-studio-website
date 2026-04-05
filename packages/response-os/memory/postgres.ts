import postgres from "postgres";
import type { ConversationTurn } from "../agents/types.ts";

type SqlClient = ReturnType<typeof postgres>;

const sqlCache = new Map<string, SqlClient>();
const sessionHistoryCache = new Map<string, ConversationTurn[]>();

function resolveDatabaseUrl(explicitUrl?: string): string {
  return (
    explicitUrl?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    process.env.SUPABASE_DB_URL?.trim() ||
    ""
  );
}

function getSqlClient(explicitUrl?: string): SqlClient | null {
  const databaseUrl = resolveDatabaseUrl(explicitUrl);
  if (!databaseUrl) {
    return null;
  }

  const cached = sqlCache.get(databaseUrl);
  if (cached) {
    return cached;
  }

  const sql = postgres(databaseUrl, {
    ssl: "require",
    max: 1,
  });

  sqlCache.set(databaseUrl, sql);
  return sql;
}

export async function getSessionHistory(
  sessionId: string,
  explicitUrl?: string,
): Promise<ConversationTurn[]> {
  const sql = getSqlClient(explicitUrl);
  if (!sql) {
    return sessionHistoryCache.get(sessionId)?.map((turn) => ({ ...turn })) ?? [];
  }

  const rows = await sql<
    Array<{
      role: ConversationTurn["role"];
      content: string;
      created_at: Date | string;
    }>
  >`
    select role, content, created_at
    from ai_session_history
    where session_id = ${sessionId}
    order by created_at asc
  `;

  return rows.map((row) => ({
    role: row.role,
    content: row.content,
    timestamp: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  }));
}

export async function appendSessionTurns(
  sessionId: string,
  turns: ConversationTurn[],
  explicitUrl?: string,
): Promise<void> {
  if (!turns.length) {
    return;
  }

  const sql = getSqlClient(explicitUrl);
  if (!sql) {
    const existing = sessionHistoryCache.get(sessionId) ?? [];
    sessionHistoryCache.set(sessionId, [...existing, ...turns.map((turn) => ({ ...turn }))]);
    return;
  }

  await sql.begin(async (tx) => {
    for (const turn of turns) {
      await tx`
        insert into ai_session_history (session_id, role, content, created_at)
        values (
          ${sessionId},
          ${turn.role},
          ${turn.content},
          ${turn.timestamp ?? null}
        )
      `;
    }
  });
}
