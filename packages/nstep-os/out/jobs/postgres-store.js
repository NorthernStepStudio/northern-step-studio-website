const TABLE_NAME = "nstep_jobs";
let schemaPromise = null;
async function ensureSchema(pool) {
    if (!schemaPromise) {
        schemaPromise = (async () => {
            await pool.query(`
        CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
          job_id text PRIMARY KEY,
          tenant_id text NOT NULL,
          status text NOT NULL,
          created_at timestamptz NOT NULL,
          updated_at timestamptz NOT NULL,
          data jsonb NOT NULL
        );
      `);
            await pool.query(`CREATE INDEX IF NOT EXISTS ${TABLE_NAME}_tenant_updated_idx ON ${TABLE_NAME} (tenant_id, updated_at DESC);`);
            await pool.query(`CREATE INDEX IF NOT EXISTS ${TABLE_NAME}_status_idx ON ${TABLE_NAME} (status);`);
        })();
    }
    await schemaPromise;
}
export async function createPostgresJobStore(pool) {
    await ensureSchema(pool);
    return {
        async load() {
            return readJobs(pool);
        },
        async save(jobs) {
            await pool.query(`DELETE FROM ${TABLE_NAME}`);
            for (const job of jobs) {
                await pool.query(`
            INSERT INTO ${TABLE_NAME} (job_id, tenant_id, status, created_at, updated_at, data)
            VALUES ($1, $2, $3, $4, $5, $6::jsonb)
            ON CONFLICT (job_id) DO UPDATE
            SET tenant_id = EXCLUDED.tenant_id,
                status = EXCLUDED.status,
                created_at = EXCLUDED.created_at,
                updated_at = EXCLUDED.updated_at,
                data = EXCLUDED.data
          `, [job.jobId, job.tenantId, job.status, job.createdAt, job.updatedAt, JSON.stringify(job)]);
            }
        },
        async list() {
            return readJobs(pool);
        },
        async get(jobId) {
            const result = await pool.query(`SELECT data FROM ${TABLE_NAME} WHERE job_id = $1 LIMIT 1`, [jobId]);
            const row = result.rows[0];
            return row?.data;
        },
        async upsert(job) {
            await pool.query(`
          INSERT INTO ${TABLE_NAME} (job_id, tenant_id, status, created_at, updated_at, data)
          VALUES ($1, $2, $3, $4, $5, $6::jsonb)
          ON CONFLICT (job_id) DO UPDATE
          SET tenant_id = EXCLUDED.tenant_id,
              status = EXCLUDED.status,
              created_at = EXCLUDED.created_at,
              updated_at = EXCLUDED.updated_at,
              data = EXCLUDED.data
        `, [job.jobId, job.tenantId, job.status, job.createdAt, job.updatedAt, JSON.stringify(job)]);
            return job;
        },
    };
}
async function readJobs(pool) {
    const result = await pool.query(`SELECT data FROM ${TABLE_NAME} ORDER BY updated_at ASC`);
    return result.rows.map((row) => row.data);
}
//# sourceMappingURL=postgres-store.js.map