import { searchKnowledgeChunks } from "../knowledge/index.js";
const TABLE_NAME = "knowledge_chunks";
let schemaPromise = null;
async function ensureSchema(pool) {
    if (!schemaPromise) {
        schemaPromise = (async () => {
            await pool.query(`
        CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
          chunk_id text PRIMARY KEY,
          source_path text NOT NULL,
          source_title text NOT NULL,
          section_path text NOT NULL,
          chunk_index integer NOT NULL,
          summary text NOT NULL,
          content text NOT NULL,
          metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
          created_at timestamptz NOT NULL,
          updated_at timestamptz NOT NULL
        );
      `);
            await pool.query(`CREATE INDEX IF NOT EXISTS ${TABLE_NAME}_source_path_idx ON ${TABLE_NAME} (source_path);`);
            await pool.query(`CREATE INDEX IF NOT EXISTS ${TABLE_NAME}_source_title_idx ON ${TABLE_NAME} (source_title);`);
            await pool.query(`CREATE INDEX IF NOT EXISTS ${TABLE_NAME}_section_path_idx ON ${TABLE_NAME} (section_path);`);
            await pool.query(`CREATE INDEX IF NOT EXISTS ${TABLE_NAME}_updated_at_idx ON ${TABLE_NAME} (updated_at DESC);`);
        })();
    }
    await schemaPromise;
}
export async function createPostgresKnowledgeStore(pool) {
    await ensureSchema(pool);
    return {
        async load() {
            return readKnowledgeChunks(pool);
        },
        async get(id) {
            const result = await pool.query(`SELECT * FROM ${TABLE_NAME} WHERE chunk_id = $1 LIMIT 1`, [id]);
            const row = result.rows[0];
            return row ? mapRow(row) : undefined;
        },
        async save(entries) {
            const client = await pool.connect();
            try {
                await client.query("BEGIN");
                await client.query(`DELETE FROM ${TABLE_NAME}`);
                for (const entry of entries) {
                    await upsertKnowledgeChunk(client, entry);
                }
                await client.query("COMMIT");
            }
            catch (error) {
                await client.query("ROLLBACK").catch(() => undefined);
                throw error;
            }
            finally {
                client.release();
            }
        },
        async list() {
            return readKnowledgeChunks(pool);
        },
        async upsert(entry) {
            await upsertKnowledgeChunk(pool, entry);
            return entry;
        },
        async search(query, limit = 5) {
            const entries = await readKnowledgeChunks(pool);
            return searchKnowledgeChunks(query, entries, limit);
        },
    };
}
async function readKnowledgeChunks(pool) {
    const result = await pool.query(`SELECT * FROM ${TABLE_NAME} ORDER BY source_path ASC, chunk_index ASC`);
    return result.rows.map((row) => mapRow(row));
}
function mapRow(row) {
    return {
        id: row.chunk_id,
        sourcePath: row.source_path,
        sourceTitle: row.source_title,
        sectionPath: row.section_path,
        chunkIndex: row.chunk_index,
        summary: row.summary,
        content: row.content,
        metadata: normalizeMetadata(row.metadata),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
function normalizeMetadata(value) {
    if (!value) {
        return {};
    }
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
        }
        catch {
            return {};
        }
    }
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
async function upsertKnowledgeChunk(poolOrClient, entry) {
    await poolOrClient.query(`
      INSERT INTO ${TABLE_NAME} (
        chunk_id,
        source_path,
        source_title,
        section_path,
        chunk_index,
        summary,
        content,
        metadata,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10)
      ON CONFLICT (chunk_id) DO UPDATE
      SET source_path = EXCLUDED.source_path,
          source_title = EXCLUDED.source_title,
          section_path = EXCLUDED.section_path,
          chunk_index = EXCLUDED.chunk_index,
          summary = EXCLUDED.summary,
          content = EXCLUDED.content,
          metadata = EXCLUDED.metadata,
          updated_at = EXCLUDED.updated_at
    `, [
        entry.id,
        entry.sourcePath,
        entry.sourceTitle,
        entry.sectionPath,
        entry.chunkIndex,
        entry.summary,
        entry.content,
        JSON.stringify(entry.metadata || {}),
        entry.createdAt,
        entry.updatedAt,
    ]);
}
//# sourceMappingURL=postgres-store.js.map