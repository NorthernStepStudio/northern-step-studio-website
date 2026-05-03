import { Hono } from "hono";
import { getDb, type Env } from "./db";
import { authMiddleware, type AppUser } from "./auth";
import { OWNER_EMAIL } from "../shared/auth";

const maintenance = new Hono<{ Bindings: Env; Variables: { user: AppUser } }>();

type MaintenanceRow = {
  id: number;
  is_active: unknown;
  message: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
};

function toBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "t";
  }
  return false;
}

function normalizeMaintenanceRow(row: MaintenanceRow | null) {
  return {
    id: row?.id ?? 1,
    is_active: toBoolean(row?.is_active),
    message:
      row?.message ||
      "We are currently performing scheduled maintenance. We'll be back shortly!",
    scheduled_date: row?.scheduled_date ?? null,
    scheduled_time: row?.scheduled_time ?? null,
  };
}

async function getCurrentRole(env: Env, email: string) {
  const sql = getDb(env);
  const [row] = await sql<{ role: string }[]>`
    SELECT role
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `;
  if (row?.role) {
    return row.role;
  }
  return email === OWNER_EMAIL ? "owner" : "user";
}

async function readMaintenance(env: Env) {
  const sql = getDb(env);
  const [row] = await sql<MaintenanceRow[]>`
    SELECT id, is_active, message, scheduled_date, scheduled_time
    FROM maintenance_settings
    ORDER BY id ASC
    LIMIT 1
  `.catch(() => []);

  return normalizeMaintenanceRow(row || null);
}

maintenance.get("/", async (c) => {
  const settings = await readMaintenance(c.env);
  return c.json(settings);
});

maintenance.get("/status", async (c) => {
  const settings = await readMaintenance(c.env);
  return c.json(settings);
});

maintenance.put("/", authMiddleware, async (c) => {
  const user = c.get("user");
  const role = await getCurrentRole(c.env, user.email);
  if (role !== "owner" && role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const body = await c.req.json().catch(() => null);
  const id = Number(body?.id || 1);
  const isActive = Boolean(body?.is_active);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const scheduledDate =
    typeof body?.scheduled_date === "string" && body.scheduled_date.trim()
      ? body.scheduled_date.trim()
      : null;
  const scheduledTime =
    typeof body?.scheduled_time === "string" && body.scheduled_time.trim()
      ? body.scheduled_time.trim()
      : null;

  const sql = getDb(c.env);
  await sql`
    INSERT INTO maintenance_settings (id, is_active, message, scheduled_date, scheduled_time, updated_at)
    VALUES (${id}, ${isActive}, ${message || null}, ${scheduledDate}, ${scheduledTime}, CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO UPDATE SET
      is_active = excluded.is_active,
      message = excluded.message,
      scheduled_date = excluded.scheduled_date,
      scheduled_time = excluded.scheduled_time,
      updated_at = CURRENT_TIMESTAMP
  `;

  const settings = await readMaintenance(c.env);
  return c.json(settings);
});

maintenance.post("/toggle", authMiddleware, async (c) => {
  const user = c.get("user");
  const role = await getCurrentRole(c.env, user.email);
  if (role !== "owner" && role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const body = await c.req.json().catch(() => null);
  const sql = getDb(c.env);
  const current = await readMaintenance(c.env);
  const nextActive = typeof body?.enabled === "boolean" ? body.enabled : !current.is_active;
  const message = typeof body?.message === "string" ? body.message.trim() : current.message;

  await sql`
    INSERT INTO maintenance_settings (id, is_active, message, scheduled_date, scheduled_time, updated_at)
    VALUES (1, ${nextActive}, ${message || null}, ${current.scheduled_date}, ${current.scheduled_time}, CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO UPDATE SET
      is_active = excluded.is_active,
      message = excluded.message,
      scheduled_date = excluded.scheduled_date,
      scheduled_time = excluded.scheduled_time,
      updated_at = CURRENT_TIMESTAMP
  `;

  return c.json(await readMaintenance(c.env));
});

export default maintenance;
