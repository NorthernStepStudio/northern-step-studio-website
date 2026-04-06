import { Hono } from "hono";
import { authMiddleware, type AppUser } from "./auth";
import { OWNER_EMAIL } from "../shared/auth";
import { getDb, type Env } from "./db";

const featureToggles = new Hono<{ Bindings: Env; Variables: { user: AppUser } }>();

featureToggles.get("/", authMiddleware, async (c) => {
  const user = c.get("user");
  if (user.email !== OWNER_EMAIL) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const sql = getDb(c.env);
  const rows = await sql<{ key: string; enabled: number; description: string | null }[]>`
    SELECT key, enabled, description FROM nstep_feature_toggles ORDER BY key ASC
  `.catch(() => []);
  
  return c.json({ toggles: rows });
});

featureToggles.patch("/:key", authMiddleware, async (c) => {
  const user = c.get("user");
  if (user.email !== OWNER_EMAIL) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const key = c.req.param("key");
  const body = await c.req.json().catch(() => null);
  const enabled = body?.enabled === true ? 1 : 0;

  const sql = getDb(c.env);
  await sql`
    UPDATE nstep_feature_toggles 
    SET enabled = ${enabled}, updated_at = CURRENT_TIMESTAMP 
    WHERE key = ${key}
  `;

  return c.json({ success: true });
});

export default featureToggles;
