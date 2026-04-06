import { randomUUID } from "node:crypto";
const LEADS_TABLE = "nstep_leads";
const INTERACTIONS_TABLE = "nstep_lead_interactions";
const OUTBOUNDS_TABLE = "nstep_lead_outbounds";
const EVENTS_TABLE = "nstep_lead_events";
let schemaPromise = null;
function normalizePhone(value) {
    const digits = String(value || "").replace(/\D+/g, "");
    if (!digits) {
        return String(value || "").trim();
    }
    if (digits.length === 11 && digits.startsWith("1")) {
        return `+${digits}`;
    }
    if (digits.length === 10) {
        return `+1${digits}`;
    }
    return `+${digits}`;
}
async function ensureSchema(pool) {
    if (!schemaPromise) {
        schemaPromise = (async () => {
            await pool.query(`
        CREATE TABLE IF NOT EXISTS ${LEADS_TABLE} (
          lead_id text PRIMARY KEY,
          tenant_id text NOT NULL,
          phone text NOT NULL,
          updated_at timestamptz NOT NULL,
          data jsonb NOT NULL
        );
      `);
            await pool.query(`CREATE INDEX IF NOT EXISTS ${LEADS_TABLE}_tenant_phone_idx ON ${LEADS_TABLE} (tenant_id, phone);`);
            await pool.query(`
        CREATE TABLE IF NOT EXISTS ${INTERACTIONS_TABLE} (
          interaction_id text PRIMARY KEY,
          tenant_id text NOT NULL,
          lead_id text NOT NULL,
          at timestamptz NOT NULL,
          data jsonb NOT NULL
        );
      `);
            await pool.query(`CREATE INDEX IF NOT EXISTS ${INTERACTIONS_TABLE}_tenant_at_idx ON ${INTERACTIONS_TABLE} (tenant_id, at DESC);`);
            await pool.query(`
        CREATE TABLE IF NOT EXISTS ${OUTBOUNDS_TABLE} (
          message_id text PRIMARY KEY,
          tenant_id text NOT NULL,
          to_phone text NOT NULL,
          sent_at timestamptz NOT NULL,
          data jsonb NOT NULL
        );
      `);
            await pool.query(`CREATE INDEX IF NOT EXISTS ${OUTBOUNDS_TABLE}_tenant_at_idx ON ${OUTBOUNDS_TABLE} (tenant_id, sent_at DESC);`);
            await pool.query(`
        CREATE TABLE IF NOT EXISTS ${EVENTS_TABLE} (
          event_id text PRIMARY KEY,
          tenant_id text NOT NULL,
          missed_at timestamptz NOT NULL,
          data jsonb NOT NULL
        );
      `);
            await pool.query(`CREATE INDEX IF NOT EXISTS ${EVENTS_TABLE}_tenant_at_idx ON ${EVENTS_TABLE} (tenant_id, missed_at DESC);`);
        })();
    }
    await schemaPromise;
}
export async function createPostgresDomainStore(pool) {
    await ensureSchema(pool);
    return {
        async loadLeads() {
            const result = await pool.query(`SELECT data FROM ${LEADS_TABLE} ORDER BY updated_at ASC`);
            return result.rows.map((row) => row.data);
        },
        async saveLeads(leads) {
            await pool.query(`DELETE FROM ${LEADS_TABLE}`);
            for (const lead of leads) {
                await pool.query(`
            INSERT INTO ${LEADS_TABLE} (lead_id, tenant_id, phone, updated_at, data)
            VALUES ($1, $2, $3, $4, $5::jsonb)
            ON CONFLICT (lead_id) DO UPDATE
            SET tenant_id = EXCLUDED.tenant_id,
                phone = EXCLUDED.phone,
                updated_at = EXCLUDED.updated_at,
                data = EXCLUDED.data
          `, [lead.leadId, lead.tenantId, normalizePhone(lead.phone), new Date().toISOString(), JSON.stringify({ ...lead, phone: normalizePhone(lead.phone) })]);
            }
        },
        async getLeadByPhone(tenantId, phone) {
            const result = await pool.query(`SELECT data FROM ${LEADS_TABLE} WHERE tenant_id = $1 AND phone = $2 LIMIT 1`, [tenantId, normalizePhone(phone)]);
            const row = result.rows[0];
            return row?.data;
        },
        async upsertLead(lead) {
            const normalized = { ...lead, phone: normalizePhone(lead.phone) };
            await pool.query(`
          INSERT INTO ${LEADS_TABLE} (lead_id, tenant_id, phone, updated_at, data)
          VALUES ($1, $2, $3, $4, $5::jsonb)
          ON CONFLICT (lead_id) DO UPDATE
          SET tenant_id = EXCLUDED.tenant_id,
              phone = EXCLUDED.phone,
              updated_at = EXCLUDED.updated_at,
              data = EXCLUDED.data
        `, [normalized.leadId, normalized.tenantId, normalized.phone, new Date().toISOString(), JSON.stringify(normalized)]);
            return normalized;
        },
        async appendInteraction(interaction) {
            await pool.query(`
          INSERT INTO ${INTERACTIONS_TABLE} (interaction_id, tenant_id, lead_id, at, data)
          VALUES ($1, $2, $3, $4, $5::jsonb)
          ON CONFLICT (interaction_id) DO UPDATE
          SET tenant_id = EXCLUDED.tenant_id,
              lead_id = EXCLUDED.lead_id,
              at = EXCLUDED.at,
              data = EXCLUDED.data
        `, [interaction.interactionId, interaction.tenantId, interaction.leadId, interaction.at, JSON.stringify(interaction)]);
        },
        async appendOutboundMessage(message) {
            await pool.query(`
          INSERT INTO ${OUTBOUNDS_TABLE} (message_id, tenant_id, to_phone, sent_at, data)
          VALUES ($1, $2, $3, $4, $5::jsonb)
          ON CONFLICT (message_id) DO UPDATE
          SET tenant_id = EXCLUDED.tenant_id,
              to_phone = EXCLUDED.to_phone,
              sent_at = EXCLUDED.sent_at,
              data = EXCLUDED.data
        `, [message.messageId || `sms_${randomUUID()}`, inferTenantId(message), normalizePhone(message.to), message.sentAt || new Date().toISOString(), JSON.stringify(message)]);
        },
        async listInteractions(tenantId) {
            const result = await pool.query(`SELECT data FROM ${INTERACTIONS_TABLE} WHERE tenant_id = $1 ORDER BY at ASC`, [tenantId]);
            return result.rows.map((row) => row.data);
        },
        async listOutbounds(tenantId) {
            const result = await pool.query(`SELECT data FROM ${OUTBOUNDS_TABLE} WHERE tenant_id = $1 ORDER BY sent_at ASC`, [tenantId]);
            return result.rows.map((row) => row.data);
        },
        async getCallEvent(eventId) {
            const result = await pool.query(`SELECT data FROM ${EVENTS_TABLE} WHERE event_id = $1 LIMIT 1`, [eventId]);
            const row = result.rows[0];
            return row?.data;
        },
        async upsertCallEvent(event) {
            await pool.query(`
          INSERT INTO ${EVENTS_TABLE} (event_id, tenant_id, missed_at, data)
          VALUES ($1, $2, $3, $4::jsonb)
          ON CONFLICT (event_id) DO UPDATE
          SET tenant_id = EXCLUDED.tenant_id,
              missed_at = EXCLUDED.missed_at,
              data = EXCLUDED.data
        `, [event.eventId, event.tenantId, event.missedAt, JSON.stringify(event)]);
            return event;
        },
    };
}
function inferTenantId(message) {
    const raw = message.tenantId;
    return typeof raw === "string" && raw.trim() ? raw.trim() : "default";
}
//# sourceMappingURL=postgres-store.js.map