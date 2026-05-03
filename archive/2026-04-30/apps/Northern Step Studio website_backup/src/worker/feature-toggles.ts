import { Hono } from "hono";
import { authMiddleware, type AppUser } from "./auth";
import { OWNER_EMAIL } from "../shared/auth";
import { getDb, type Env } from "./db";

const featureToggles = new Hono<{ Bindings: Env; Variables: { user: AppUser } }>();

type FeatureToggleRow = {
  id: number;
  feature_key: string;
  feature_name: string;
  is_enabled: unknown;
  description: string | null;
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

function normalizeFeatureToggle(row: FeatureToggleRow) {
  return {
    id: row.id,
    feature_key: row.feature_key,
    feature_name: row.feature_name,
    is_enabled: toBoolean(row.is_enabled),
    description: row.description || "",
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

featureToggles.get("/", async (c) => {
  const sql = getDb(c.env);
  try {
    const rows = await sql<FeatureToggleRow[]>`
      SELECT id, feature_key, feature_name, is_enabled, description
      FROM feature_toggles
      ORDER BY feature_key ASC
    `;
    return c.json(rows.map(normalizeFeatureToggle));
  } catch (error) {
    return c.json(
      {
        error: "Feature toggles table is unavailable.",
        detail: error instanceof Error ? error.message : String(error),
        expectedTable: "feature_toggles",
        readPath: "src/worker/feature-toggles.ts -> GET /api/feature-toggles",
      },
      500,
    );
  }
});

featureToggles.put("/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  const role = await getCurrentRole(c.env, user.email);
  if (role !== "owner" && role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id) || id <= 0) {
    return c.json({ error: "Invalid feature id" }, 400);
  }

  const body = await c.req.json().catch(() => null);
  if (typeof body?.is_enabled !== "boolean") {
    return c.json({ error: "`is_enabled` must be a boolean" }, 400);
  }

  const sql = getDb(c.env);
  await sql`
    UPDATE feature_toggles
    SET is_enabled = ${body.is_enabled}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `;

  return c.json({ success: true, id, is_enabled: body.is_enabled });
});

featureToggles.patch("/:key", authMiddleware, async (c) => {
  const user = c.get("user");
  const role = await getCurrentRole(c.env, user.email);
  if (role !== "owner" && role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const key = c.req.param("key");
  const body = await c.req.json().catch(() => null);
  const enabled = Boolean(body?.enabled ?? body?.is_enabled);

  const sql = getDb(c.env);
  await sql`
    UPDATE feature_toggles
    SET is_enabled = ${enabled}, updated_at = CURRENT_TIMESTAMP
    WHERE feature_key = ${key}
  `;

  return c.json({ success: true, feature_key: key, is_enabled: enabled });
});

export default featureToggles;
