/**
 * knowledge.ts — Studio Knowledge Store
 *
 * This module is the single gateway to the `knowledge_chunks` table in Postgres.
 * It replaces the in-memory keyword scoring in studio-supervisor.ts with:
 *   1. Lexical search (keyword ranking) — works without embeddings (current default)
 *   2. Embedding-based vector search (pgvector) — enabled when OPENAI_API_KEY is set
 *   3. Lane-filtered retrieval — every search is scoped to a product domain
 *
 * Phase progression:
 *   Phase 1 (now)     → lexical DB search, provenance fields, lane filter
 *   Phase 3 (next)    → add embeddings column, HNSW index, vector search
 *   Phase 4 (after)   → add rerank stage, tracing spans
 */

import type { DBClient } from "./db";
import type { StudioLane } from "../shared/data/studioKnowledge";

// ─── Public Types ─────────────────────────────────────────────────────────────

/** A lane that can be queried. "studio" covers philosophy/brand chunks. */
export type KnowledgeLane = StudioLane | "studio";

/** Status values a chunk can have. Only "active" chunks are served. */
export type ChunkStatus = "active" | "deprecated" | "draft";

/** Access level. Only "public" chunks are served to the public AI assistant. */
export type ChunkAccess = "public" | "internal" | "sensitive";

/**
 * A single knowledge chunk returned by a search.
 * Includes full provenance so the Thought Accordion can cite exact evidence.
 */
export interface KnowledgeChunk {
  readonly id: string;
  readonly chunk_id: string;
  readonly doc_id: string;
  readonly doc_version: string;
  readonly lane: KnowledgeLane;
  readonly title: string | null;
  readonly section: string | null;
  readonly content: string;
  readonly score: number;
  readonly metadata: Record<string, unknown>;
  readonly source_url: string | null;
}

/** Options for a knowledge search. */
export interface KnowledgeSearchOptions {
  /** The lane to restrict the search to. Pass null for cross-lane (supervisor only). */
  readonly lane: KnowledgeLane | null;
  /** Free-text query used for lexical and/or vector search. */
  readonly query: string;
  /** Maximum number of candidates to retrieve before reranking. Default: 20 */
  readonly topK?: number;
  /** Maximum number of final chunks to return. Default: 5 */
  readonly topN?: number;
  /** Only serve chunks with this access level or lower. Default: "public" */
  readonly access?: ChunkAccess;
}

/** Result of a knowledge search, including provenance for tracing. */
export interface KnowledgeSearchResult {
  readonly chunks: readonly KnowledgeChunk[];
  readonly lane: KnowledgeLane | null;
  readonly query: string;
  readonly totalFound: number;
  readonly mode: "db_lexical" | "db_vector" | "fallback_empty";
  readonly hasResults: boolean;
}

// ─── DB Row Shape (internal) ──────────────────────────────────────────────────

interface KnowledgeChunkRow {
  id: string;
  chunk_id: string;
  doc_id: string;
  doc_version: string;
  lane: string;
  title: string | null;
  section: string | null;
  content: string;
  metadata: string | Record<string, unknown> | null;
  source_url: string | null;
  rank?: number | string | null;
}

// ─── Main Search Entry Point ──────────────────────────────────────────────────

/**
 * Search the knowledge_chunks table.
 *
 * Falls back to an empty result if the table does not exist yet (Phase 1 setup)
 * so the supervisor can still call in-memory fallbacks during the migration window.
 */
export async function searchKnowledgeChunks(
  db: DBClient,
  options: KnowledgeSearchOptions,
): Promise<KnowledgeSearchResult> {
  const topK = options.topK ?? 20;
  const topN = options.topN ?? 5;
  const access = options.access ?? "public";
  const { lane, query } = options;

  if (!query.trim()) {
    return emptyResult(lane, query);
  }

  try {
    const rows = await runLexicalSearch(db, { lane, query, topK, access });

    if (!rows.length) {
      return emptyResult(lane, query);
    }

    const scored = rankRows(rows, query);
    const top = scored.slice(0, topN);

    return {
      chunks: top.map(toKnowledgeChunk),
      lane,
      query,
      totalFound: rows.length,
      mode: "db_lexical",
      hasResults: true,
    };
  } catch (error) {
    // Table may not exist yet during Phase 1 migration.
    if (isTableMissingError(error)) {
      console.warn("[knowledge] knowledge_chunks table not found — falling back to empty. Run migrations first.");
      return emptyResult(lane, query);
    }

    console.error("[knowledge] Search failed:", error);
    return emptyResult(lane, query);
  }
}

// ─── Lexical Search ───────────────────────────────────────────────────────────

async function runLexicalSearch(
  db: DBClient,
  opts: { lane: KnowledgeLane | null; query: string; topK: number; access: ChunkAccess },
): Promise<KnowledgeChunkRow[]> {
  const { lane, query, topK, access } = opts;

  // Build a normalized search string for Postgres full-text search
  const tsQuery = buildTsQuery(query);

  if (lane) {
    // Lane-scoped search (99% of queries)
    return db<KnowledgeChunkRow[]>`
      SELECT
        id, chunk_id, doc_id, doc_version, lane, title, section,
        content, metadata, source_url,
        ts_rank(
          to_tsvector('english', coalesce(title, '') || ' ' || coalesce(section, '') || ' ' || content),
          to_tsquery('english', ${tsQuery})
        ) AS rank
      FROM knowledge_chunks
      WHERE
        lane = ${lane}
        AND status = 'active'
        AND access = ${access}
        AND to_tsvector('english', coalesce(title, '') || ' ' || coalesce(section, '') || ' ' || content)
            @@ to_tsquery('english', ${tsQuery})
      ORDER BY rank DESC
      LIMIT ${topK}
    `;
  }

  // Cross-lane search (supervisor cross-domain only)
  return db<KnowledgeChunkRow[]>`
    SELECT
      id, chunk_id, doc_id, doc_version, lane, title, section,
      content, metadata, source_url,
      ts_rank(
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(section, '') || ' ' || content),
        to_tsquery('english', ${tsQuery})
      ) AS rank
    FROM knowledge_chunks
    WHERE
      status = 'active'
      AND access = ${access}
      AND to_tsvector('english', coalesce(title, '') || ' ' || coalesce(section, '') || ' ' || content)
          @@ to_tsquery('english', ${tsQuery})
    ORDER BY rank DESC
    LIMIT ${topK}
  `;
}

// ─── Scoring / Ranking ────────────────────────────────────────────────────────

/**
 * Re-rank rows with a simple hybrid score:
 *   - Postgres ts_rank as the base signal
 *   - Exact term bonus for any query word appearing verbatim in title or section
 */
function rankRows(rows: KnowledgeChunkRow[], query: string): KnowledgeChunkRow[] {
  const terms = tokenize(query);

  return rows
    .map((row) => {
      const dbRank = Number(row.rank ?? 0);
      const titleText = (row.title ?? "").toLowerCase();
      const sectionText = (row.section ?? "").toLowerCase();
      const exactBonus = terms.filter(
        (term) => titleText.includes(term) || sectionText.includes(term),
      ).length * 0.15;

      return { row, score: dbRank + exactBonus };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ row, score }) => ({ ...row, rank: score }));
}

// ─── Schema Helpers ───────────────────────────────────────────────────────────

/**
 * Returns the SQL to create the knowledge_chunks table.
 * Run once via a migration script or seed:knowledge command.
 */
export function getKnowledgeTableSchema(): string {
  return `
-- Enable pgvector extension (needed for Phase 3 embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Provenance (Phase 2 requirements)
  chunk_id     TEXT        NOT NULL,
  doc_id       TEXT        NOT NULL,
  doc_version  TEXT        NOT NULL DEFAULT '1.0',
  doc_hash     TEXT        NOT NULL DEFAULT '',
  lane         TEXT        NOT NULL CHECK (lane IN (
                             'studio',
                             'nexusbuild',
                             'provly',
                             'noobs',
                             'neuromove',
                             'pasoscore',
                             'automation'
                           )),
  status       TEXT        NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active', 'deprecated', 'draft')),
  access       TEXT        NOT NULL DEFAULT 'public'
                           CHECK (access IN ('public', 'internal', 'sensitive')),

  -- Content
  title        TEXT,
  section      TEXT,
  content      TEXT        NOT NULL,

  -- Phase 3: Embedding vector (sized for text-embedding-3-small = 1536 dims)
  -- Uncomment when OPENAI_API_KEY is configured and pgvector extension is active.
  -- embedding   vector(1536),

  -- Extra metadata (tags, doc frontmatter overrides, etc.)
  metadata     JSONB       NOT NULL DEFAULT '{}',
  source_url   TEXT,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Deduplication: same doc + chunk + content hash = same row
  UNIQUE (doc_id, chunk_id, doc_hash)
);

-- Patch existing tables: drop and recreate lane constraint with correct values
ALTER TABLE knowledge_chunks DROP CONSTRAINT IF EXISTS knowledge_chunks_lane_check;
ALTER TABLE knowledge_chunks ADD CONSTRAINT knowledge_chunks_lane_check
  CHECK (lane IN ('studio','nexusbuild','provly','noobs','neuromove','pasoscore','automation'));

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_lane   ON knowledge_chunks (lane);
CREATE INDEX IF NOT EXISTS idx_knowledge_doc    ON knowledge_chunks (doc_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_status ON knowledge_chunks (status);
CREATE INDEX IF NOT EXISTS idx_knowledge_access ON knowledge_chunks (access);

-- Full-text search index (used by Phase 1 lexical search)
CREATE INDEX IF NOT EXISTS idx_knowledge_fts ON knowledge_chunks
  USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(section, '') || ' ' || content));

-- Phase 3: HNSW vector index (uncomment when embedding column is added)
-- CREATE INDEX IF NOT EXISTS idx_knowledge_hnsw ON knowledge_chunks
--   USING hnsw (embedding vector_cosine_ops)
--   WITH (m = 16, ef_construction = 64);
  `.trim();
}

/**
 * Returns the SQL to verify the knowledge_chunks table health.
 * Use this as a "go / no-go" check after running seed:knowledge.
 */
export function getKnowledgeHealthQuery(): string {
  return `
SELECT
  lane,
  status,
  COUNT(*)             AS chunk_count,
  COUNT(DISTINCT doc_id) AS doc_count
FROM knowledge_chunks
GROUP BY lane, status
ORDER BY lane, status;
  `.trim();
}

// ─── Ingestion Helpers ────────────────────────────────────────────────────────

export interface KnowledgeChunkInput {
  chunk_id: string;
  doc_id: string;
  doc_version: string;
  doc_hash: string;
  lane: KnowledgeLane;
  status?: ChunkStatus;
  access?: ChunkAccess;
  title?: string | null;
  section?: string | null;
  content: string;
  metadata?: Record<string, unknown>;
  source_url?: string | null;
}

/**
 * Upserts a single knowledge chunk into the database.
 * Uses (doc_id, chunk_id, doc_hash) as the deduplication key — if the content
 * hasn't changed (same hash), the row stays the same.
 */
export async function upsertKnowledgeChunk(
  db: DBClient,
  chunk: KnowledgeChunkInput,
): Promise<void> {
  const metadata = JSON.stringify(chunk.metadata ?? {});
  await db`
    INSERT INTO knowledge_chunks (
      chunk_id, doc_id, doc_version, doc_hash, lane,
      status, access, title, section, content, metadata, source_url,
      updated_at
    )
    VALUES (
      ${chunk.chunk_id},
      ${chunk.doc_id},
      ${chunk.doc_version},
      ${chunk.doc_hash},
      ${chunk.lane},
      ${chunk.status ?? "active"},
      ${chunk.access ?? "public"},
      ${chunk.title ?? null},
      ${chunk.section ?? null},
      ${chunk.content},
      ${metadata},
      ${chunk.source_url ?? null},
      NOW()
    )
    ON CONFLICT (doc_id, chunk_id, doc_hash) DO UPDATE
      SET
        doc_version = EXCLUDED.doc_version,
        lane        = EXCLUDED.lane,
        status      = EXCLUDED.status,
        access      = EXCLUDED.access,
        title       = EXCLUDED.title,
        section     = EXCLUDED.section,
        content     = EXCLUDED.content,
        metadata    = EXCLUDED.metadata,
        source_url  = EXCLUDED.source_url,
        updated_at  = NOW()
  `;
}

/**
 * Marks all chunks for a given doc_id as deprecated.
 * Call this when a document is removed or replaced entirely.
 */
export async function deprecateDocChunks(
  db: DBClient,
  docId: string,
): Promise<void> {
  await db`
    UPDATE knowledge_chunks
    SET status = 'deprecated', updated_at = NOW()
    WHERE doc_id = ${docId}
  `;
}

/**
 * Returns a lane distribution summary — use as the go/no-go health check
 * after running seed:knowledge against real Postgres.
 */
export async function getKnowledgeLaneHealth(
  db: DBClient,
): Promise<{ lane: string; status: string; chunk_count: number; doc_count: number }[]> {
  try {
    return db<{ lane: string; status: string; chunk_count: number; doc_count: number }[]>`
      SELECT
        lane,
        status,
        COUNT(*)               AS chunk_count,
        COUNT(DISTINCT doc_id) AS doc_count
      FROM knowledge_chunks
      GROUP BY lane, status
      ORDER BY lane, status
    `;
  } catch {
    return [];
  }
}

// ─── Internal Utilities ───────────────────────────────────────────────────────

/**
 * Converts a user query into a Postgres to_tsquery-safe string.
 * Joins tokens with & (AND) for precision. Falls back to an OR join if
 * the query is a single phrase (e.g., "nexusbuild").
 */
function buildTsQuery(query: string): string {
  const tokens = tokenize(query);
  if (!tokens.length) return "studio | northern";
  // Use OR (|) join so short queries still match
  return tokens.map(escapeTsToken).join(" | ");
}

function escapeTsToken(token: string): string {
  // Postgres to_tsquery tokens can't contain special chars
  return token.replace(/[^a-z0-9]/g, "");
}

function tokenize(text: string): string[] {
  return Array.from(
    new Set(
      (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter(
        (token) => token.length > 2 && !STOP_WORDS.has(token),
      ),
    ),
  );
}

const STOP_WORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "any",
  "can", "had", "her", "was", "one", "our", "out", "day", "get",
  "has", "him", "his", "how", "its", "let", "may", "now", "old",
  "say", "she", "too", "use", "way", "who", "why", "will", "with",
  "about", "above", "after", "also", "been", "from", "have", "here",
  "into", "just", "make", "more", "most", "over", "than", "that",
  "their", "them", "then", "there", "they", "this", "time", "were",
  "what", "when", "where", "which", "while", "your",
]);

function toKnowledgeChunk(row: KnowledgeChunkRow): KnowledgeChunk {
  let metadata: Record<string, unknown> = {};
  if (typeof row.metadata === "string") {
    try { metadata = JSON.parse(row.metadata); } catch { /* ignore */ }
  } else if (row.metadata && typeof row.metadata === "object") {
    metadata = row.metadata as Record<string, unknown>;
  }

  return {
    id: row.id,
    chunk_id: row.chunk_id,
    doc_id: row.doc_id,
    doc_version: row.doc_version,
    lane: row.lane as KnowledgeLane,
    title: row.title ?? null,
    section: row.section ?? null,
    content: row.content,
    score: Number(row.rank ?? 0),
    metadata,
    source_url: row.source_url ?? null,
  };
}

function emptyResult(lane: KnowledgeLane | null, query: string): KnowledgeSearchResult {
  return {
    chunks: [],
    lane,
    query,
    totalFound: 0,
    mode: "fallback_empty",
    hasResults: false,
  };
}

function isTableMissingError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("relation") && msg.includes("does not exist") ||
    msg.includes("knowledge_chunks") ||
    msg.includes("table") && msg.includes("not found")
  );
}
