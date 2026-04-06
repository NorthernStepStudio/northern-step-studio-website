import { Hono } from "hono";
import { getDb, type Env } from "./db";
import { authMiddleware, type AppUser } from "./auth";

const maintenance = new Hono<{ Bindings: Env; Variables: { user: AppUser } }>();

maintenance.get("/status", async (c) => {
  const sql = getDb(c.env);
  const [row] = await sql<{ enabled: number; message: string | null }[]>`
    SELECT enabled, message FROM studio_maintenance WHERE id = 1
  `.catch(() => [{ enabled: 0, message: null }]);

  return c.json({
    enabled: row?.enabled === 1,
    message: row?.message || "We are currently performing scheduled maintenance. We'll be back shortly!",
  });
});

maintenance.post("/toggle", authMiddleware, async (c) => {
  const user = c.get("user");
  if (user.role !== "owner") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const body = await c.req.json().catch(() => null);
  const enabled = body?.enabled === true ? 1 : 0;
  const message = body?.message || null;

  const sql = getDb(c.env);
  await sql`
    INSERT INTO studio_maintenance (id, enabled, message, updated_at)
    VALUES (1, ${enabled}, ${message}, CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO UPDATE SET
      enabled = excluded.enabled,
      message = excluded.message,
      updated_at = CURRENT_TIMESTAMP
  `;

  return c.json({ success: true });
});

export default maintenance;
