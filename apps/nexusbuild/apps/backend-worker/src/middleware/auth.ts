import { createClient } from "@supabase/supabase-js";
import { Context, Next } from "hono";
import { verify } from "hono/jwt";

export const requireAuth = async (c: Context, next: Next) => {
  const jwtSecret = c.env.JWT_SECRET || "dev-secret-key";
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  try {
    const payload = (await verify(authHeader.slice(7), jwtSecret, "HS256")) as {
      userId?: number;
    };

    if (!payload?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    c.set("jwtPayload", payload);

    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
    const { data: user, error } = await supabase
      .from("users")
      .select("id, is_suspended")
      .eq("id", payload.userId)
      .maybeSingle();

    if (error || !user) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    if (user.is_suspended) {
      return c.json(
        {
          message: "Please verify your email before logging in.",
          verification_required: true,
        },
        403,
      );
    }

    return next();
  } catch {
    return c.json({ message: "Unauthorized" }, 401);
  }
};

export const getUserId = (c: Context): number | null => {
  const payload = c.get("jwtPayload") as { userId: number } | undefined;
  return payload ? payload.userId : null;
};
