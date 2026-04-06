import postgres from "postgres";
import type { KnowledgeLane } from "./lane-map.ts";

export interface IngestDocument {
  lane: KnowledgeLane;
  sourceId: string;
  sourceTitle: string;
  sourceType?: string;
  content: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface IngestOptions {
  databaseUrl?: string;
  embedText?: (text: string) => Promise<number[] | null> | number[] | null;
  chunkSizeWords?: number;
  overlapWords?: number;
}

type SqlClient = ReturnType<typeof postgres>;

const sqlCache = new Map<string, SqlClient>();

function getSqlClient(databaseUrl?: string): SqlClient | null {
  const resolved = typeof databaseUrl === "string" ? databaseUrl.trim() : "";
  if (!resolved) {
    return null;
  }

  const cached = sqlCache.get(resolved);
  if (cached) {
    return cached;
  }

  const sql = postgres(resolved, {
    ssl: "require",
    max: 1,
  });

  sqlCache.set(resolved, sql);
  return sql;
}

export async function ingestDocuments(docs: IngestDocument[], options: IngestOptions = {}): Promise<void> {
  if (!docs.length) {
    return;
  }

  const sql = getSqlClient(options.databaseUrl);
  if (!sql) {
    return;
  }

  const chunkSizeWords = options.chunkSizeWords ?? 320;
  const overlapWords = options.overlapWords ?? 60;

  await sql.begin(async (tx) => {
    for (const doc of docs) {
      const chunks = chunkDocument(doc.content, chunkSizeWords, overlapWords);
      for (const [index, chunk] of chunks.entries()) {
        const embedding = options.embedText ? await options.embedText(chunk) : null;

        await tx`
          insert into knowledge_chunks (
            lane,
            source_id,
            source_title,
            source_type,
            content,
            embedding,
            url,
            metadata
          )
          values (
            ${doc.lane},
            ${doc.sourceId},
            ${doc.sourceTitle},
            ${doc.sourceType ?? null},
            ${chunk},
            ${embedding ? formatVector(embedding) : null},
            ${doc.url ?? null},
            ${JSON.stringify({
              ...(doc.metadata ?? {}),
              chunkIndex: index,
              chunkCount: chunks.length,
            })}::jsonb
          )
        `;
      }
    }
  });
}

function chunkDocument(content: string, chunkSizeWords: number, overlapWords: number): string[] {
  const words = content.split(/\s+/).filter(Boolean);
  if (!words.length) {
    return [];
  }

  const chunks: string[] = [];
  const step = Math.max(1, chunkSizeWords - overlapWords);

  for (let start = 0; start < words.length; start += step) {
    const slice = words.slice(start, start + chunkSizeWords);
    if (slice.length) {
      chunks.push(slice.join(" "));
    }
    if (start + chunkSizeWords >= words.length) {
      break;
    }
  }

  return chunks;
}

function formatVector(values: number[]): string {
  return `[${values.map((value) => Number.isFinite(value) ? Number(value).toFixed(6) : "0").join(",")}]`;
}
