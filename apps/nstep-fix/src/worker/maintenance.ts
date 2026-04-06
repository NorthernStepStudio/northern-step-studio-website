import { Hono } from "hono";
import { authMiddleware, type AppUser } from "./auth";
import { getDb } from "./db";

const maintenance = new Hono<{ Bindings: Env; Variables: { user: AppUser } }>();

// Get maintenance settings
maintenance.get("/", async (c) => {
  try {
    const sql = getDb(c.env);
    
    // Manual timeout to prevent hanging on localhost/slow connections
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Database timeout")), 2000)
    );
    
    const settingsPromise = sql`SELECT * FROM maintenance_settings WHERE id = 1`;
    const [settings] = await Promise.race([settingsPromise, timeoutPromise]) as any[];
    
    return c.json(settings || { is_active: false, message: "" });
  } catch (error) {
    console.error("[Maintenance] Database query failed or timed out:", error);
    return c.json({ is_active: false, message: "" });
  }
});

// Update maintenance settings (owner/admin only)
maintenance.put("/", authMiddleware, async (c) => {
  const sql = getDb(c.env);
  const user = c.get("user");
  
  if (!user) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  // Check user role from database
  const [dbUser] = await sql<{ role: string }[]>`
    SELECT role FROM users WHERE email = ${user.email}
  `;

  if (!dbUser || (dbUser.role !== "owner" && dbUser.role !== "admin")) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const { is_active, message, scheduled_date, scheduled_time } = await c.req.json();

  await sql`
    UPDATE maintenance_settings 
    SET is_active = ${is_active ? true : false}, message = ${message || ""}, 
        scheduled_date = ${scheduled_date || null}, scheduled_time = ${scheduled_time || null}, 
        updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `;

  const [updated] = await sql`SELECT * FROM maintenance_settings WHERE id = 1`;

  return c.json(updated);
});

export default maintenance;
