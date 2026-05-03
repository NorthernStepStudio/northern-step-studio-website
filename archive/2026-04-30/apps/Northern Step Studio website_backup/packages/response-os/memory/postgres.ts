import postgres from "postgres";
import type { ConversationTurn } from "../agents/types.ts";

type SqlClient = ReturnType<typeof postgres>;

const MAX_SQL_CLIENTS = 4;
const MAX_CACHED_SESSIONS = 250;
const MAX_TURNS_PER_SESSION = 80;

const sqlCache = new Map<string, SqlClient>();
const sessionHistoryCache = new Map<string, ConversationTurn[]>();

function sanitizeDatabaseUrl(candidate?: string): string {
  const value = typeof candidate === "string" ? candidate.trim() : "";
  if (!value) {
    return "";
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
      return "";
    }
    return value;
  } catch {
    return "";
  }
}

function resolveDatabaseUrl(explicitUrl?: string): string {
  const explicit = sanitizeDatabaseUrl(explicitUrl);
  if (explicit) {
    return explicit;
  }

  return (
    sanitizeDatabaseUrl(process.env.DATABASE_URL) ||
    sanitizeDatabaseUrl(process.env.SUPABASE_DB_URL) ||
    ""
  );
}

function setSessionCache(sessionId: string, turns: ConversationTurn[]): void {
  if (sessionHistoryCache.has(sessionId)) {
    sessionHistoryCache.delete(sessionId);
  }

  sessionHistoryCache.set(
    sessionId,
    turns.slice(-MAX_TURNS_PER_SESSION).map((turn) => ({ ...turn })),
  );

  while (sessionHistoryCache.size > MAX_CACHED_SESSIONS) {
    const oldestSession = sessionHistoryCache.keys().next().value;
    if (typeof oldestSession !== "string") {
      break;
    }
    sessionHistoryCache.delete(oldestSession);
  }
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

  if (sqlCache.size >= MAX_SQL_CLIENTS) {
    const oldestUrl = sqlCache.keys().next().value;
    if (typeof oldestUrl === "string") {
      const oldestClient = sqlCache.get(oldestUrl);
      sqlCache.delete(oldestUrl);
      void (oldestClient as any)?.end?.({ timeout: 1 });
    }
  }

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
    setSessionCache(sessionId, [...existing, ...turns]);
    return;
  }

  await sql.begin(async (tx) => {
    for (const turn of turns) {
      await (tx as any)`
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
