const TABLE_NAME = "nstep_job_queue";
const DEFAULT_DELAY_MS = 60 * 60 * 1000;
let schemaPromise = null;
async function ensureSchema(pool) {
    if (!schemaPromise) {
        schemaPromise = (async () => {
            await pool.query(`
        CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
          job_id text PRIMARY KEY,
          tenant_id text NOT NULL,
          product text NOT NULL,
          workflow text NOT NULL,
          priority text NOT NULL,
          status text NOT NULL,
          attempts integer NOT NULL,
          available_at timestamptz NOT NULL,
          claimed_at timestamptz,
          completed_at timestamptz,
          worker_id text,
          reason text,
          last_error text,
          created_at timestamptz NOT NULL,
          updated_at timestamptz NOT NULL,
          data jsonb NOT NULL
        );
      `);
            await pool.query(`CREATE INDEX IF NOT EXISTS ${TABLE_NAME}_tenant_status_idx ON ${TABLE_NAME} (tenant_id, status);`);
            await pool.query(`CREATE INDEX IF NOT EXISTS ${TABLE_NAME}_available_idx ON ${TABLE_NAME} (available_at);`);
            await pool.query(`CREATE INDEX IF NOT EXISTS ${TABLE_NAME}_updated_idx ON ${TABLE_NAME} (updated_at DESC);`);
        })();
    }
    await schemaPromise;
}
export async function createPostgresJobQueueStore(pool) {
    await ensureSchema(pool);
    return {
        async load() {
            return readEntries(pool);
        },
        async save(entries) {
            await pool.query(`DELETE FROM ${TABLE_NAME}`);
            for (const entry of entries) {
                await persistEntry(pool, entry);
            }
        },
        async list() {
            return readEntries(pool);
        },
        async get(jobId) {
            const result = await pool.query(`SELECT data FROM ${TABLE_NAME} WHERE job_id = $1 LIMIT 1`, [jobId]);
            const row = result.rows[0];
            return row?.data;
        },
        async upsert(entry) {
            await persistEntry(pool, entry);
            return entry;
        },
        async enqueue(job, reason) {
            const now = new Date().toISOString();
            const existing = await getEntry(pool, job.jobId);
            const entry = buildEntry(job, existing, {
                status: "queued",
                attempts: existing?.attempts ?? 0,
                availableAt: now,
                claimedAt: undefined,
                completedAt: existing?.completedAt,
                workerId: undefined,
                reason,
                lastError: existing?.lastError,
                updatedAt: now,
            });
            await persistEntry(pool, entry);
            return entry;
        },
        async claim(jobId, workerId) {
            return withClient(pool, async (client) => {
                const now = new Date().toISOString();
                const result = await client.query(`SELECT data FROM ${TABLE_NAME} WHERE job_id = $1 LIMIT 1 FOR UPDATE`, [jobId]);
                const row = result.rows[0];
                const current = row?.data;
                if (!current || !canClaim(current, Date.now())) {
                    return undefined;
                }
                const claimed = {
                    ...current,
                    status: "claimed",
                    attempts: current.attempts + 1,
                    claimedAt: now,
                    workerId,
                    updatedAt: now,
                };
                await persistEntry(client, claimed);
                return claimed;
            });
        },
        async claimNext(workerId) {
            return withClient(pool, async (client) => {
                const now = new Date().toISOString();
                const result = await client.query(`
            SELECT data
            FROM ${TABLE_NAME}
            WHERE status IN ('queued', 'deferred') AND available_at <= NOW()
            ORDER BY ${priorityOrderSql()}, available_at ASC, created_at ASC
            LIMIT 1
            FOR UPDATE SKIP LOCKED
          `);
                const row = result.rows[0];
                if (!row?.data) {
                    return undefined;
                }
                const current = row.data;
                const claimed = {
                    ...current,
                    status: "claimed",
                    attempts: current.attempts + 1,
                    claimedAt: now,
                    workerId,
                    updatedAt: now,
                };
                await persistEntry(client, claimed);
                return claimed;
            });
        },
        async complete(jobId, workerId) {
            return updateByJobId(pool, jobId, (entry) => ({
                ...entry,
                status: "completed",
                completedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                workerId: workerId || entry.workerId,
            }));
        },
        async defer(jobId, reason, availableAt) {
            return updateByJobId(pool, jobId, (entry) => ({
                ...entry,
                status: "deferred",
                reason,
                availableAt: availableAt || new Date(Date.now() + DEFAULT_DELAY_MS).toISOString(),
                updatedAt: new Date().toISOString(),
                workerId: undefined,
                claimedAt: undefined,
            }));
        },
        async fail(jobId, reason) {
            return updateByJobId(pool, jobId, (entry) => ({
                ...entry,
                status: "failed",
                reason,
                lastError: reason,
                updatedAt: new Date().toISOString(),
            }));
        },
        async releaseStaleClaims(staleAfterMs = DEFAULT_DELAY_MS, now = new Date().toISOString()) {
            const cutoff = new Date(Date.now() - staleAfterMs).toISOString();
            const staleEntries = await withClient(pool, async (client) => {
                const result = await client.query(`SELECT data FROM ${TABLE_NAME} WHERE status = 'claimed' AND claimed_at < $1`, [cutoff]);
                return result.rows.map((row) => row.data);
            });
            let updated = 0;
            for (const entry of staleEntries) {
                const nextEntry = {
                    ...entry,
                    status: "queued",
                    availableAt: now,
                    claimedAt: undefined,
                    workerId: undefined,
                    reason: entry.reason || "stale claim requeued",
                    updatedAt: now,
                };
                await persistEntry(pool, nextEntry);
                updated += 1;
            }
            return updated;
        },
    };
}
async function readEntries(pool) {
    const result = await pool.query(`SELECT data FROM ${TABLE_NAME} ORDER BY updated_at ASC`);
    return result.rows.map((row) => row.data);
}
function canClaim(entry, nowMs) {
    if (!entry) {
        return false;
    }
    if (entry.status !== "queued" && entry.status !== "deferred") {
        return false;
    }
    const availableAt = Date.parse(entry.availableAt);
    return Number.isFinite(availableAt) ? availableAt <= nowMs : true;
}
async function getEntry(poolOrClient, jobId) {
    const result = await poolOrClient.query(`SELECT data FROM ${TABLE_NAME} WHERE job_id = $1 LIMIT 1`, [jobId]);
    const row = result.rows[0];
    return row?.data;
}
async function updateByJobId(pool, jobId, mapper) {
    return withClient(pool, async (client) => {
        const result = await client.query(`SELECT data FROM ${TABLE_NAME} WHERE job_id = $1 LIMIT 1 FOR UPDATE`, [jobId]);
        const row = result.rows[0];
        if (!row?.data) {
            return undefined;
        }
        const next = mapper(row.data);
        await persistEntry(client, next);
        return next;
    });
}
async function persistEntry(poolOrClient, entry) {
    await poolOrClient.query(`
      INSERT INTO ${TABLE_NAME} (
        job_id, tenant_id, product, workflow, priority, status, attempts,
        available_at, claimed_at, completed_at, worker_id, reason, last_error,
        created_at, updated_at, data
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16::jsonb)
      ON CONFLICT (job_id) DO UPDATE
      SET tenant_id = EXCLUDED.tenant_id,
          product = EXCLUDED.product,
          workflow = EXCLUDED.workflow,
          priority = EXCLUDED.priority,
          status = EXCLUDED.status,
          attempts = EXCLUDED.attempts,
          available_at = EXCLUDED.available_at,
          claimed_at = EXCLUDED.claimed_at,
          completed_at = EXCLUDED.completed_at,
          worker_id = EXCLUDED.worker_id,
          reason = EXCLUDED.reason,
          last_error = EXCLUDED.last_error,
          created_at = EXCLUDED.created_at,
          updated_at = EXCLUDED.updated_at,
          data = EXCLUDED.data
    `, [
        entry.jobId,
        entry.tenantId,
        entry.product,
        entry.workflow,
        entry.priority,
        entry.status,
        entry.attempts,
        entry.availableAt,
        entry.claimedAt ?? null,
        entry.completedAt ?? null,
        entry.workerId ?? null,
        entry.reason ?? null,
        entry.lastError ?? null,
        entry.createdAt,
        entry.updatedAt,
        JSON.stringify(entry),
    ]);
}
function buildEntry(job, existing, overrides) {
    const now = new Date().toISOString();
    return {
        jobId: job.jobId,
        tenantId: job.tenantId,
        product: job.goal.product,
        workflow: job.route?.workflow || job.goal.product,
        priority: job.goal.priority,
        status: overrides.status || existing?.status || "queued",
        attempts: overrides.attempts ?? existing?.attempts ?? 0,
        availableAt: overrides.availableAt || existing?.availableAt || now,
        createdAt: existing?.createdAt || now,
        updatedAt: overrides.updatedAt || now,
        claimedAt: overrides.claimedAt !== undefined ? overrides.claimedAt : existing?.claimedAt,
        completedAt: overrides.completedAt !== undefined ? overrides.completedAt : existing?.completedAt,
        workerId: overrides.workerId !== undefined ? overrides.workerId : existing?.workerId,
        reason: overrides.reason !== undefined ? overrides.reason : existing?.reason,
        lastError: overrides.lastError !== undefined ? overrides.lastError : existing?.lastError,
        metadata: {
            ...(existing?.metadata || {}),
            product: job.goal.product,
            goal: job.goal.goal,
            mode: job.goal.mode,
            requestedBy: job.goal.requestedBy,
            requestedByRole: job.goal.requestedByRole,
            source: job.goal.source,
        },
    };
}
function priorityOrderSql() {
    return "CASE priority WHEN 'critical' THEN 4 WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END DESC";
}
async function withClient(pool, handler) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await handler(client);
        await client.query("COMMIT");
        return result;
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
}
//# sourceMappingURL=postgres-queue.js.map