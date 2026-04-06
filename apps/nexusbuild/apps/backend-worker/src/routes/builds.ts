import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import { verify } from "hono/jwt";
import { getUserId, requireAuth } from "../middleware/auth";
import { validateBuild } from "../utils/validation";
import {
  normalizeIncomingParts,
  parseNumber,
  serializeBuild,
  toOptionalString,
} from "../utils/serializers";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  JWT_SECRET: string;
};

const builds = new Hono<{ Bindings: Bindings }>();
const BUILD_SELECT = "*, users(id, username, email), parts(*)";

const getSupabase = (c: any) =>
  createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);

const getSortColumn = (sort: string) => {
  switch (sort) {
    case "popular":
      return "likes_count";
    case "price_low":
    case "price_high":
      return "total_price";
    case "recent":
    default:
      return "created_at";
  }
};

const isAscendingSort = (sort: string) => sort === "price_low";

const parseLimit = (value: unknown, fallback: number, max: number) => {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.min(parsed, max);
};

const computeTotalPrice = (
  provided: unknown,
  parts: ReturnType<typeof normalizeIncomingParts>,
) => {
  const explicit = parseNumber(provided);
  if (explicit > 0) {
    return explicit;
  }
  return parts.reduce((sum, part) => sum + part.price, 0);
};

const hydrateBuild = async (supabase: any, id: number) => {
  const { data, error } = await supabase
    .from("builds")
    .select(BUILD_SELECT)
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return serializeBuild(data);
};

const resolveOptionalUserId = async (c: any): Promise<number | null> => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const payload = (await verify(
      token,
      c.env.JWT_SECRET || "dev-secret-key",
      "HS256",
    )) as {
      userId?: number;
    };
    return payload?.userId ?? null;
  } catch {
    return null;
  }
};

builds.get("/community", async (c) => {
  try {
    const supabase = getSupabase(c);
    const sort =
      typeof c.req.query("sort") === "string" ? c.req.query("sort")! : "recent";
    const limit = parseLimit(c.req.query("limit"), 20, 50);
    const offset = Math.max(
      Number.parseInt(String(c.req.query("offset") ?? 0), 10) || 0,
      0,
    );

    const { data, error, count } = await supabase
      .from("builds")
      .select(BUILD_SELECT, { count: "exact" })
      .eq("is_public", true)
      .order(getSortColumn(sort), { ascending: isAscendingSort(sort) })
      .range(offset, offset + limit - 1);

    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }

    const buildsList = (data || []).map(serializeBuild);
    return c.json({
      builds: buildsList,
      total: count ?? buildsList.length,
      has_more: offset + buildsList.length < (count ?? buildsList.length),
    });
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to fetch community builds" },
      500,
    );
  }
});

builds.get("/featured", async (c) => {
  try {
    const supabase = getSupabase(c);
    const { data, error } = await supabase
      .from("builds")
      .select(BUILD_SELECT)
      .eq("is_public", true)
      .eq("is_featured", true)
      .order("likes_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({
      success: true,
      builds: (data || []).map(serializeBuild),
    });
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to fetch featured builds" },
      500,
    );
  }
});

builds.post("/calculate-score", async (c) => {
  try {
    const body = await c.req.json();
    const cpuScore = Math.max(parseNumber(body?.cpu_score), 0);
    const gpuScore = Math.max(parseNumber(body?.gpu_score), 0);
    const nexusPowerScore = Math.round(gpuScore * 0.7 + cpuScore * 0.3);
    const bottleneckDetected =
      cpuScore > 0 &&
      gpuScore > 0 &&
      Math.abs(cpuScore - gpuScore) / Math.max(cpuScore, gpuScore) > 0.4;

    return c.json({
      nexus_power_score: nexusPowerScore,
      cpu_score: cpuScore,
      gpu_score: gpuScore,
      bottleneck_detected: bottleneckDetected,
    });
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to calculate build score" },
      500,
    );
  }
});

builds.get("/", requireAuth, async (c) => {
  const userId = getUserId(c);
  if (!userId) {
    return c.json({ success: false, error: "Unauthorized" }, 401);
  }

  const supabase = getSupabase(c);
  const { data, error } = await supabase
    .from("builds")
    .select(BUILD_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  const buildsList = (data || []).map(serializeBuild);
  return c.json({
    success: true,
    builds: buildsList,
    count: buildsList.length,
  });
});

builds.post("/", requireAuth, async (c) => {
  try {
    const userId = getUserId(c);
    if (!userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const parts = normalizeIncomingParts(body?.parts);
    const totalPrice = computeTotalPrice(
      body?.totalPrice ?? body?.total_price,
      parts,
    );
    const name =
      typeof body?.name === "string" && body.name.trim().length > 0
        ? body.name.trim()
        : "My Build";
    const description = toOptionalString(body?.description);

    const validation = validateBuild({ name, description, totalPrice });
    if (!validation.isValid) {
      return c.json(
        { success: false, error: validation.errors.join(", ") },
        400,
      );
    }

    const supabase = getSupabase(c);
    const { data: createdBuild, error } = await supabase
      .from("builds")
      .insert({
        user_id: userId,
        name,
        description,
        total_price: totalPrice,
        image_url: toOptionalString(body?.imageUrl ?? body?.image_url),
        is_public:
          typeof body?.isPublic === "boolean"
            ? body.isPublic
            : typeof body?.is_public === "boolean"
              ? body.is_public
              : true,
      })
      .select("id")
      .single();

    if (error || !createdBuild) {
      return c.json(
        { success: false, error: error?.message || "Failed to create build" },
        500,
      );
    }

    if (parts.length > 0) {
      const insertResult = await supabase.from("parts").insert(
        parts.map((part) => ({
          build_id: createdBuild.id,
          name: part.name,
          category: part.category,
          price: part.price,
          url: part.url,
          image_url: part.imageUrl,
          specifications: part.specifications,
        })),
      );

      if (insertResult.error) {
        return c.json(
          { success: false, error: insertResult.error.message },
          500,
        );
      }
    }

    const build = await hydrateBuild(supabase, createdBuild.id);
    return c.json(
      {
        success: true,
        build,
        message: "Build created successfully",
      },
      201,
    );
  } catch (error) {
    return c.json({ success: false, error: "Failed to create build" }, 500);
  }
});

builds.post("/sync", requireAuth, async (c) => {
  try {
    const userId = getUserId(c);
    if (!userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const supabase = getSupabase(c);
    const body = await c.req.json();
    const localBuilds = Array.isArray(body?.local_builds)
      ? body.local_builds
      : [];
    let created = 0;
    let updated = 0;

    for (const rawBuild of localBuilds) {
      if (!rawBuild || typeof rawBuild !== "object") continue;
      const build = rawBuild as Record<string, unknown>;
      const name =
        typeof build.name === "string" && build.name.trim().length > 0
          ? build.name.trim()
          : null;
      if (!name) continue;

      const parts = normalizeIncomingParts(build.parts);
      const totalPrice = computeTotalPrice(
        build.totalPrice ?? build.total_price,
        parts,
      );
      const { data: existing } = await supabase
        .from("builds")
        .select("id, is_public")
        .eq("user_id", userId)
        .eq("name", name)
        .maybeSingle();

      if (!existing) {
        const createResult = await supabase
          .from("builds")
          .insert({
            user_id: userId,
            name,
            description: toOptionalString(build.description),
            total_price: totalPrice,
            image_url: toOptionalString(build.imageUrl ?? build.image_url),
            is_public:
              typeof build.is_public === "boolean" ? build.is_public : true,
          })
          .select("id")
          .single();

        if (createResult.error || !createResult.data) {
          continue;
        }

        if (parts.length > 0) {
          await supabase.from("parts").insert(
            parts.map((part) => ({
              build_id: createResult.data.id,
              name: part.name,
              category: part.category,
              price: part.price,
              url: part.url,
              image_url: part.imageUrl,
              specifications: part.specifications,
            })),
          );
        }

        created += 1;
        continue;
      }

      await supabase
        .from("builds")
        .update({
          description: toOptionalString(build.description),
          total_price: totalPrice,
          image_url: toOptionalString(build.imageUrl ?? build.image_url),
          is_public:
            typeof build.is_public === "boolean"
              ? build.is_public
              : existing.is_public,
        })
        .eq("id", existing.id)
        .eq("user_id", userId);

      await supabase.from("parts").delete().eq("build_id", existing.id);
      if (parts.length > 0) {
        await supabase.from("parts").insert(
          parts.map((part) => ({
            build_id: existing.id,
            name: part.name,
            category: part.category,
            price: part.price,
            url: part.url,
            image_url: part.imageUrl,
            specifications: part.specifications,
          })),
        );
      }

      updated += 1;
    }

    const { data, error } = await supabase
      .from("builds")
      .select(BUILD_SELECT)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({
      success: true,
      builds: (data || []).map(serializeBuild),
      stats: {
        total: created + updated,
        created,
        updated,
      },
    });
  } catch (error) {
    return c.json({ success: false, error: "Failed to sync builds" }, 500);
  }
});

builds.get("/:id", async (c) => {
  const buildId = Number.parseInt(c.req.param("id"), 10);
  if (Number.isNaN(buildId)) {
    return c.json({ success: false, error: "Invalid build ID" }, 400);
  }

  const supabase = getSupabase(c);
  const { data, error } = await supabase
    .from("builds")
    .select(BUILD_SELECT)
    .eq("id", buildId)
    .single();

  if (error || !data) {
    return c.json({ success: false, error: "Build not found" }, 404);
  }

  const build = serializeBuild(data);
  const optionalUserId = await resolveOptionalUserId(c);
  if (!build.is_public && build.user_id !== optionalUserId) {
    return c.json(
      { success: false, error: "Build not found or access denied" },
      404,
    );
  }

  return c.json({
    success: true,
    build,
  });
});

builds.post("/:id/like", async (c) => {
  try {
    const buildId = Number.parseInt(c.req.param("id"), 10);
    if (Number.isNaN(buildId)) {
      return c.json({ success: false, error: "Invalid build ID" }, 400);
    }

    const supabase = getSupabase(c);
    const { data: existing, error: existingError } = await supabase
      .from("builds")
      .select("likes_count")
      .eq("id", buildId)
      .single();

    if (existingError || !existing) {
      return c.json({ success: false, error: "Build not found" }, 404);
    }

    const { error } = await supabase
      .from("builds")
      .update({ likes_count: Number(existing.likes_count || 0) + 1 })
      .eq("id", buildId);

    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }

    const build = await hydrateBuild(supabase, buildId);
    return c.json({ success: true, build });
  } catch (error) {
    return c.json({ success: false, error: "Failed to like build" }, 500);
  }
});

builds.post("/:id/clone", requireAuth, async (c) => {
  try {
    const userId = getUserId(c);
    const buildIdParam = c.req.param("id");
    const buildId = buildIdParam
      ? Number.parseInt(buildIdParam, 10)
      : Number.NaN;

    if (!userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }
    if (Number.isNaN(buildId)) {
      return c.json({ success: false, error: "Invalid build ID" }, 400);
    }

    const supabase = getSupabase(c);
    const { data: sourceBuild, error } = await supabase
      .from("builds")
      .select("*, parts(*)")
      .eq("id", buildId)
      .eq("is_public", true)
      .single();

    if (error || !sourceBuild) {
      return c.json({ success: false, error: "Build not found" }, 404);
    }

    const { data: createdBuild, error: createError } = await supabase
      .from("builds")
      .insert({
        user_id: userId,
        name: `${sourceBuild.name} Copy`,
        description: sourceBuild.description,
        total_price: Number(sourceBuild.total_price || 0),
        image_url: sourceBuild.image_url ?? null,
        is_public: false,
      })
      .select("id")
      .single();

    if (createError || !createdBuild) {
      return c.json(
        {
          success: false,
          error: createError?.message || "Failed to clone build",
        },
        500,
      );
    }

    if (Array.isArray(sourceBuild.parts) && sourceBuild.parts.length > 0) {
      await supabase.from("parts").insert(
        sourceBuild.parts.map((part: any) => ({
          build_id: createdBuild.id,
          name: part.name,
          category: part.category,
          price: part.price,
          url: part.url,
          image_url: part.image_url ?? null,
          specifications: part.specifications ?? null,
        })),
      );
    }

    const build = await hydrateBuild(supabase, createdBuild.id);
    return c.json({ success: true, build }, 201);
  } catch (error) {
    return c.json({ success: false, error: "Failed to clone build" }, 500);
  }
});

builds.put("/:id", requireAuth, async (c) => {
  try {
    const userId = getUserId(c);
    const buildIdParam = c.req.param("id");
    const buildId = buildIdParam
      ? Number.parseInt(buildIdParam, 10)
      : Number.NaN;

    if (!userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }
    if (Number.isNaN(buildId)) {
      return c.json({ success: false, error: "Invalid build ID" }, 400);
    }

    const supabase = getSupabase(c);
    const { data: existingBuild, error: existingError } = await supabase
      .from("builds")
      .select("*")
      .eq("id", buildId)
      .eq("user_id", userId)
      .single();

    if (existingError || !existingBuild) {
      return c.json(
        { success: false, error: "Build not found or access denied" },
        404,
      );
    }

    const body = await c.req.json();
    const parts = normalizeIncomingParts(body?.parts);
    const name =
      typeof body?.name === "string" && body.name.trim().length > 0
        ? body.name.trim()
        : existingBuild.name;
    const description = toOptionalString(body?.description);
    const totalPrice = computeTotalPrice(
      body?.totalPrice ?? body?.total_price,
      parts,
    );

    const validation = validateBuild({ name, description, totalPrice });
    if (!validation.isValid) {
      return c.json(
        { success: false, error: validation.errors.join(", ") },
        400,
      );
    }

    const { error } = await supabase
      .from("builds")
      .update({
        name,
        description,
        total_price: totalPrice,
        image_url: toOptionalString(body?.imageUrl ?? body?.image_url),
        is_public:
          typeof body?.isPublic === "boolean"
            ? body.isPublic
            : typeof body?.is_public === "boolean"
              ? body.is_public
              : existingBuild.is_public,
      })
      .eq("id", buildId)
      .eq("user_id", userId);

    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }

    if (body?.parts !== undefined) {
      await supabase.from("parts").delete().eq("build_id", buildId);
      if (parts.length > 0) {
        await supabase.from("parts").insert(
          parts.map((part) => ({
            build_id: buildId,
            name: part.name,
            category: part.category,
            price: part.price,
            url: part.url,
            image_url: part.imageUrl,
            specifications: part.specifications,
          })),
        );
      }
    }

    const build = await hydrateBuild(supabase, buildId);
    return c.json({
      success: true,
      build,
      message: "Build updated successfully",
    });
  } catch (error) {
    return c.json({ success: false, error: "Failed to update build" }, 500);
  }
});

builds.delete("/:id", requireAuth, async (c) => {
  try {
    const userId = getUserId(c);
    const buildIdParam = c.req.param("id");
    const buildId = buildIdParam
      ? Number.parseInt(buildIdParam, 10)
      : Number.NaN;

    if (!userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }
    if (Number.isNaN(buildId)) {
      return c.json({ success: false, error: "Invalid build ID" }, 400);
    }

    const supabase = getSupabase(c);
    const { data: existingBuild, error: existingError } = await supabase
      .from("builds")
      .select("id")
      .eq("id", buildId)
      .eq("user_id", userId)
      .single();

    if (existingError || !existingBuild) {
      return c.json(
        { success: false, error: "Build not found or access denied" },
        404,
      );
    }

    const { error } = await supabase
      .from("builds")
      .delete()
      .eq("id", buildId)
      .eq("user_id", userId);

    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({
      success: true,
      message: "Build deleted successfully",
    });
  } catch (error) {
    return c.json({ success: false, error: "Failed to delete build" }, 500);
  }
});

export default builds;
