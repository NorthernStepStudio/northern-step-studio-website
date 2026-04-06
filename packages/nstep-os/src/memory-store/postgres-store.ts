import type { Pool } from "pg";
import type { MemoryEntry, MemoryStore } from "../core/types.js";

const TABLE_NAME = "nstep_memory";

let schemaPromise: Promise<void> | null = null;

async function ensureSchema(pool: Pool): Promise<void> {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
          id text PRIMARY KEY,
          tenant_id text NOT NULL,
          product text NOT NULL,
          category text NOT NULL,
          key text NOT NULL,
          confidence double precision NOT NULL,
          created_at timestamptz NOT NULL,
          updated_at timestamptz NOT NULL,
          data jsonb NOT NULL
        );
      `);
      await pool.query(`CREATE INDEX IF NOT EXISTS ${TABLE_NAME}_tenant_updated_idx ON ${TABLE_NAME} (tenant_id, updated_at DESC);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS ${TABLE_NAME}_category_idx ON ${TABLE_NAME} (category);`);
    })();
  }

  await schemaPromise;
}

export async function createPostgresMemoryStore(pool: Pool): Promise<MemoryStore> {
  await ensureSchema(pool);

  return {
    async load() {
      return readEntries(pool);
    },
    async get(id) {
      const result = await pool.query(`SELECT data FROM ${TABLE_NAME} WHERE id = $1 LIMIT 1`, [id]);
      const row = result.rows[0] as { readonly data?: MemoryEntry } | undefined;
      return row?.data;
    },
    async save(entries) {
      await pool.query(`DELETE FROM ${TABLE_NAME}`);
      for (const entry of entries) {
        await pool.query(
          `
            INSERT INTO ${TABLE_NAME} (id, tenant_id, product, category, key, confidence, created_at, updated_at, data)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
            ON CONFLICT (id) DO UPDATE
            SET tenant_id = EXCLUDED.tenant_id,
                product = EXCLUDED.product,
                category = EXCLUDED.category,
                key = EXCLUDED.key,
                confidence = EXCLUDED.confidence,
                created_at = EXCLUDED.created_at,
                updated_at = EXCLUDED.updated_at,
                data = EXCLUDED.data
          `,
          [
            entry.id,
            entry.tenantId,
            entry.product,
            entry.category,
            entry.key,
            entry.confidence,
            entry.createdAt,
            entry.updatedAt,
            JSON.stringify(entry),
          ],
        );
      }
    },
    async list() {
      return readEntries(pool);
    },
    async upsert(entry) {
      await pool.query(
        `
          INSERT INTO ${TABLE_NAME} (id, tenant_id, product, category, key, confidence, created_at, updated_at, data)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
          ON CONFLICT (id) DO UPDATE
          SET tenant_id = EXCLUDED.tenant_id,
              product = EXCLUDED.product,
              category = EXCLUDED.category,
              key = EXCLUDED.key,
              confidence = EXCLUDED.confidence,
              created_at = EXCLUDED.created_at,
              updated_at = EXCLUDED.updated_at,
              data = EXCLUDED.data
        `,
        [
          entry.id,
          entry.tenantId,
          entry.product,
          entry.category,
          entry.key,
          entry.confidence,
          entry.createdAt,
          entry.updatedAt,
          JSON.stringify(entry),
        ],
      );
      return entry;
    },
  };
}

async function readEntries(pool: Pool): Promise<readonly MemoryEntry[]> {
  const result = await pool.query(`SELECT data FROM ${TABLE_NAME} ORDER BY updated_at ASC`);
  return result.rows.map((row) => row.data as MemoryEntry);
}
