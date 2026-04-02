import { Hono } from 'hono';
import { getDb } from './db';
import { sendEmail } from './email';
import { 
  normalizeEmailAddress, 
  normalizeSingleLineText, 
  normalizeMultilineText, 
  isValidEmailAddress 
} from './utils';
import { 
  testerRequestNotificationEmail, 
  testerApprovalEmail 
} from './email-templates';
import { requireRole } from './auth';

const OWNER_EMAIL = "winston@northernstepstudio.com";

export function registerTesterRoutes(app: Hono<any>) {
  // Public Signup
  app.post("/api/testers", async (c) => {
    try {
      const body = await c.req.json().catch(() => null);
      const email = normalizeEmailAddress(body?.email);
      const name = normalizeSingleLineText(body?.name, 80);
      const appSlug = normalizeSingleLineText(body?.app_slug, 80);
      const reason = normalizeMultilineText(body?.reason, 1000);

      if (!email || !name || !appSlug) {
        return c.json({ error: "Email, name, and app are required." }, 400);
      }

      if (!isValidEmailAddress(email)) {
        return c.json({ error: "Invalid email address." }, 400);
      }

      const sql = getDb(c.env);
      
      const [existing] = await sql`SELECT id FROM nstep_testers WHERE email = ${email} AND app_slug = ${appSlug}`;
      if (existing) {
        return c.json({ error: "You have already requested access for this app." }, 409);
      }

      await sql`
        INSERT INTO nstep_testers (email, name, app_slug, reason, status)
        VALUES (${email}, ${name}, ${appSlug}, ${reason}, 'pending')
      `;

      await sendEmail(c.env, {
        to: OWNER_EMAIL,
        subject: `[Tester Request] ${appSlug}`,
        html_body: testerRequestNotificationEmail({ name, email, appSlug, reason }),
        text_body: `New tester request from ${name} for ${appSlug}. Reason: ${reason}`
      }).catch(err => console.error("Email notify error", err));

      return c.json({ success: true }, 201);
    } catch (error) {
      console.error("Tester signup failed:", error);
      return c.json({ error: "Unable to process request." }, 500);
    }
  });

  // Admin List
  app.get("/api/admin/testers", async (c) => {
    const role = await requireRole(c, ["owner", "admin"]);
    if (!role) return c.json({ error: "Unauthorized" }, 403);

    const sql = getDb(c.env);
    const rows = await sql`SELECT * FROM nstep_testers ORDER BY created_at DESC`;
    return c.json(rows);
  });

  // Admin Action
  app.patch("/api/admin/testers/:id", async (c) => {
    const role = await requireRole(c, ["owner", "admin"]);
    if (!role) return c.json({ error: "Unauthorized" }, 403);

    const id = c.req.param("id");
    const body = await c.req.json();
    const { status, admin_notes } = body;

    if (status !== "approved" && status !== "denied") {
      return c.json({ error: "Invalid status." }, 400);
    }

    const sql = getDb(c.env);
    const [tester] = await sql<any[]>`SELECT * FROM nstep_testers WHERE id = ${id}`;
    if (!tester) return c.json({ error: "Tester not found" }, 404);

    await sql`
      UPDATE nstep_testers 
      SET status = ${status}, admin_notes = ${admin_notes}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

    if (status === "approved") {
      await sendEmail(c.env, {
        to: tester.email,
        subject: `Welcome to the ${tester.app_slug} Beta!`,
        html_body: testerApprovalEmail({ name: tester.name, appSlug: tester.app_slug, adminNotes: admin_notes }),
        text_body: `Your request for ${tester.app_slug} has been approved!`
      }).catch(err => console.error(err));
    }

    return c.json({ success: true });
  });

  // Admin Stats
  app.get("/api/admin/testers/stats", async (c) => {
    const role = await requireRole(c, ["owner", "admin"]);
    if (!role) return c.json({ error: "Unauthorized" }, 403);

    const sql = getDb(c.env);
    const rows = await sql`SELECT status, app_slug, COUNT(*) as count FROM nstep_testers GROUP BY status, app_slug`;
    return c.json(rows);
  });

  // Admin Delete
  app.delete("/api/admin/testers/:id", async (c) => {
    const role = await requireRole(c, ["owner", "admin"]);
    if (!role) return c.json({ error: "Unauthorized" }, 403);

    const id = c.req.param("id");
    const sql = getDb(c.env);
    await sql`DELETE FROM nstep_testers WHERE id = ${id}`;
    return c.json({ success: true });
  });
}
