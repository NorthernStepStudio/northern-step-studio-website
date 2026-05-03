import { Hono } from "hono";
import { verify } from "hono/jwt";
import { createSupabaseServerClient } from "../utils/supabase";
import { getUserId } from "../middleware/auth";
import { getJwtSecret } from "../utils/jwt";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  JWT_SECRET: string;
};

const reports = new Hono<{ Bindings: Bindings }>();

const getSupabase = (c: any) => createSupabaseServerClient(c.env);

const resolveOptionalUserId = async (c: any): Promise<number | null> => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const payload = (await verify(
      token,
      getJwtSecret(c.env),
      "HS256",
    )) as {
      userId?: number;
    };
    return payload?.userId ?? null;
  } catch {
    return null;
  }
};

/**
 * POST /
 * Submit a bug report
 */
reports.post("/", async (c) => {
  try {
    const userId = await resolveOptionalUserId(c);
    const body = await c.req.parseBody();

    // The mobile app uses 'description' or 'message'
    const description = (body.description || body.message || "") as string;
    const email = body.email as string | undefined;
    const category = (body.category || "other") as string;
    const priority = (body.priority || "medium") as string;
    const platform = body.platform as string | undefined;
    const system_info = body.system_info as string | undefined;

    if (!description || description.trim().length === 0) {
      return c.json({ message: "Description is required" }, 400);
    }

    const supabase = getSupabase(c);

    // Prepare data for Supabase
    // Note: We're not handling image uploads to Supabase Storage here yet
    // to keep the implementation simple and fast, but we'll save the metadata.
    const { data, error } = await supabase
      .from("bug_reports")
      .insert({
        user_id: userId,
        email: email || null,
        description: description.trim(),
        category,
        priority,
        status: "pending",
        // Combine platform and system_info into admin_notes or just ignore if not in schema
        admin_notes: platform ? `Platform: ${platform}. ${system_info || ""}` : null
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error saving report:", error);
      return c.json({ message: "Failed to submit report", error: error.message }, 500);
    }

    return c.json({
      message: "Report submitted successfully",
      report: data,
    }, 201);
  } catch (error) {
    console.error("Error creating bug report:", error);
    return c.json({ message: "Failed to submit report" }, 500);
  }
});

/**
 * GET /my
 * Get current user's reports
 */
reports.get("/my", async (c) => {
  const userId = await resolveOptionalUserId(c);
  if (!userId) {
    return c.json({ message: "Authentication required" }, 401);
  }

  const supabase = getSupabase(c);
  const { data, error } = await supabase
    .from("bug_reports")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return c.json({ message: "Failed to fetch reports", error: error.message }, 500);
  }

  return c.json(data || []);
});

export default reports;
