import { Hono } from "hono";
import { authMiddleware, type AppUser } from "./auth";
import { OWNER_EMAIL } from "../shared/auth";
import { getDb } from "./db";

const featureToggles = new Hono<{ Bindings: Env; Variables: { user: AppUser } }>();

// Get all feature toggles
featureToggles.get("/", async (c) => {
  const sql = getDb(c.env);
  const results = await sql`
    SELECT * FROM feature_toggles ORDER BY feature_name ASC
  `;

  return c.json(results);
});

// Update feature toggle (owner/admin only)
featureToggles.put("/:id", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const featureId = c.req.param("id");
  const body = await c.req.json();

  if (!authUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const sql = getDb(c.env);

  // Check user role
  const [dbUser] = await sql<{ role: string }[]>`
    SELECT role FROM users WHERE email = ${authUser.email}
  `;

  const role = dbUser?.role || (authUser.email === OWNER_EMAIL ? "owner" : "user");

  if (role !== "owner" && role !== "admin") {
    return c.json({ error: "Forbidden: Only owner and admin can modify feature toggles" }, 403);
  }

  // Update the feature toggle
  await sql`
    UPDATE feature_toggles 
    SET is_enabled = ${body.is_enabled ? true : false}, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ${featureId}
  `;

  return c.json({ success: true });
});

export default featureToggles;
