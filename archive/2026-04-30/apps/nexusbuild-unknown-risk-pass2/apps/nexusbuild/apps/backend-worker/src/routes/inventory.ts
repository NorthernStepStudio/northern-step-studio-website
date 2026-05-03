import { Hono } from "hono";
import { createSupabaseServerClient } from "../utils/supabase";
import { ALL_PARTS } from "../data/parts";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

const inventory = new Hono<{ Bindings: Bindings }>();

/**
 * GET /api/inventory
 * Fetches the canonical parts database from Supabase.
 * Handles pagination to ensure all parts are loaded.
 */
inventory.get("/", async (c) => {
  try {
    const supabase = createSupabaseServerClient(c.env);
    const category = c.req.query("category");
    const pageSize = 1000;
    let allParts: any[] = [];
    let from = 0;
    let hasMore = true;

    while (hasMore) {
      let query = supabase
        .from("parts")
        .select("*")
        .is("build_id", null) // Fetch only global inventory parts
        .range(from, from + pageSize - 1);

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) {
        console.warn("[Inventory] Supabase error:", error.message);
        break; // Fallback to local data below
      }

      if (data && data.length > 0) {
        allParts = [...allParts, ...data];
        from += pageSize;
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    // If Supabase is empty or failed, fallback to hardcoded ALL_PARTS
    if (allParts.length === 0) {
      console.log("[Inventory] Supabase empty/failed, falling back to ALL_PARTS");
      allParts = category 
        ? ALL_PARTS.filter(p => p.category.toLowerCase() === category.toLowerCase())
        : ALL_PARTS;
    }

    return c.json({
      success: true,
      count: allParts.length,
      parts: allParts,
      source: allParts.length > ALL_PARTS.length ? "database" : "unified",
    });
  } catch (error) {
    console.error("Inventory fetch error:", error);
    // Ultimate fallback for crash safety
    return c.json({
      success: true,
      count: ALL_PARTS.length,
      parts: ALL_PARTS,
      source: "fallback",
      message: "Recovered from server error using fallback data"
    });
  }
});

/**
 * GET /api/inventory/stats
 * Quick check for debug panel.
 */
inventory.get("/stats", async (c) => {
  try {
    const supabase = createSupabaseServerClient(c.env);
    
    // Count by category
    const { data: categories, error } = await supabase
      .from("parts")
      .select("category")
      .is("build_id", null);

    if (error) throw error;

    const stats: Record<string, number> = {};
    categories?.forEach((p) => {
      stats[p.category] = (stats[p.category] || 0) + 1;
    });

    return c.json({
      success: true,
      total: categories?.length || 0,
      byCategory: stats,
      env: {
        hasUrl: !!c.env.SUPABASE_URL,
        hasKey: !!c.env.SUPABASE_ANON_KEY,
        apiUrl: c.env.SUPABASE_URL ? new URL(c.env.SUPABASE_URL).hostname : null,
      }
    });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

export default inventory;
