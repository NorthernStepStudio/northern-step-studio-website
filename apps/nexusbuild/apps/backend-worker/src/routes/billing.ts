import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import { verify } from "hono/jwt";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  JWT_SECRET?: string;
  REVENUECAT_WEBHOOK_SECRET?: string;
};

const billing = new Hono<{ Bindings: Bindings }>();

const getSupabase = (c: any) =>
  createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);

const TOKEN_MAP: Record<string, number> = {
  tokens_20: 20,
  tokens_60: 60,
  tokens_120: 120,
  tokens_160: 160,
  tokens_280: 280,
  tokens_600: 600,
  bonus_20: 20,
  bonus_50: 50,
  bonus_120: 120,
  bonus_260: 260,
  bonus_273: 273,
  bonus_600: 600,
};

const NORMALIZED_TOKEN_MAP = new Map(
  Object.entries(TOKEN_MAP).map(([productId, tokenCount]) => [
    productId.replace(/[^a-z0-9]+/gi, "").toLowerCase(),
    tokenCount,
  ]),
);

const normalizeIdentifier = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const normalizeHeader = (value: unknown) => String(value ?? "").trim();

const getJwtSecret = (c: any) => c.env.JWT_SECRET || "dev-secret-key";

const isWebhookAuthorized = (c: any) => {
  const secret = normalizeHeader(c.env.REVENUECAT_WEBHOOK_SECRET);
  if (!secret) return false;

  const header = normalizeHeader(c.req.header("Authorization"));
  if (!header) return false;

  return (
    header === secret ||
    header === `Bearer ${secret}` ||
    header === `Token ${secret}`
  );
};

const resolveAuthenticatedUserId = async (c: any): Promise<number | null> => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const payload = (await verify(token, getJwtSecret(c), "HS256")) as {
      userId?: number;
    };
    return payload?.userId ?? null;
  } catch {
    return null;
  }
};

const getTokenCountForProduct = (productId: unknown) =>
  NORMALIZED_TOKEN_MAP.get(normalizeIdentifier(productId)) || 0;

const toDateFromMilliseconds = (value: unknown) => {
  const parsed =
    typeof value === "string" ? Number.parseInt(value, 10) : Number(value);
  if (!Number.isFinite(parsed)) return null;
  return new Date(parsed);
};

const extractEntitlementIds = (event: any): string[] => {
  const rawIds = Array.isArray(event?.entitlement_ids)
    ? event.entitlement_ids
    : event?.entitlement_id
      ? [event.entitlement_id]
      : [];

  return rawIds
    .map((id: unknown) => String(id).trim())
    .filter((id: string) => id.length > 0);
};

const hasProEntitlement = (event: any) => {
  const normalizedIds = extractEntitlementIds(event).map(normalizeIdentifier);
  return normalizedIds.some((id) => id === "pro" || id === "promonthly");
};

const hasPowerEntitlement = (event: any) => {
  const normalizedIds = extractEntitlementIds(event).map(normalizeIdentifier);
  return normalizedIds.some((id) => id === "power" || id === "powermonthly");
};

const resolveGrantedTier = (event: any): "pro" | "power" | null => {
  const productId = normalizeIdentifier(event?.product_id);
  if (productId === "powermonthly") {
    return "power";
  }

  if (productId === "promonthly" || productId === "pro") {
    return "pro";
  }

  if (hasPowerEntitlement(event)) {
    return "power";
  }

  if (hasProEntitlement(event)) {
    return "pro";
  }

  return null;
};

const shouldCreditTokens = (event: any) => {
  const eventType = String(event?.type || "")
    .trim()
    .toUpperCase();
  if (!eventType) {
    return true;
  }

  return new Set([
    "INITIAL_PURCHASE",
    "NON_RENEWING_PURCHASE",
    "RENEWAL",
    "PRODUCT_CHANGE",
    "TEST",
  ]).has(eventType);
};

const buildProcessedEventTier = (event: any) => {
  const eventKey = String(event?.id || event?.transaction_id || "").trim();
  if (!eventKey) {
    return null;
  }

  return `rc_event:${eventKey}`;
};

const updateUserEntitlement = async (
  supabase: ReturnType<typeof getSupabase>,
  userId: string,
  tier: string,
  expiresAt: Date | null,
) => {
  const expiryValue = expiresAt ? expiresAt.toISOString() : null;
  const { data: existing, error: fetchError } = await supabase
    .from("user_entitlements")
    .select("id")
    .eq("user_id", userId)
    .eq("tier", tier)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    console.warn(
      "[Billing] Failed to read entitlement state:",
      fetchError.message,
    );
    return;
  }

  if (existing?.id) {
    const { error } = await supabase
      .from("user_entitlements")
      .update({ expires_at: expiryValue })
      .eq("id", existing.id);

    if (error) {
      console.warn(
        "[Billing] Failed to update entitlement state:",
        error.message,
      );
    }
    return;
  }

  const { error } = await supabase.from("user_entitlements").insert({
    user_id: userId,
    tier,
    expires_at: expiryValue,
  });

  if (error) {
    console.warn(
      "[Billing] Failed to create entitlement state:",
      error.message,
    );
  }
};

const creditUserTokens = async (
  supabase: ReturnType<typeof getSupabase>,
  userId: string,
  tokenCount: number,
) => {
  const { data: user, error: fetchError } = await supabase
    .from("users")
    .select("tokens")
    .eq("id", userId)
    .single();

  if (fetchError || !user) {
    console.error("[Billing] User not found for ID:", userId);
    return;
  }

  const newBalance = (user.tokens || 0) + tokenCount;

  const { error: updateError } = await supabase
    .from("users")
    .update({ tokens: newBalance })
    .eq("id", userId);

  if (updateError) {
    console.error("[Billing] Failed to update tokens:", updateError.message);
    return;
  }

  console.log(
    `[Billing] Fulfilled ${tokenCount} tokens for user ${userId}. New balance: ${newBalance}`,
  );
};

/**
 * RevenueCat Webhook Handler
 * Fulfills token purchases and updates user profiles.
 */
billing.post("/webhook", async (c) => {
  try {
    const webhookSecret = normalizeHeader(c.env.REVENUECAT_WEBHOOK_SECRET);
    if (!webhookSecret) {
      console.error("[Billing] RevenueCat webhook secret is not configured.");
      return c.json({ error: "Webhook secret not configured" }, 500);
    }

    if (!isWebhookAuthorized(c)) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const event = body?.event;

    if (!event) {
      return c.json({ error: "Invalid event payload" }, 400);
    }

    const productId = String(event.product_id || "").trim();
    const userId = String(event.app_user_id || "").trim();

    if (!userId || !productId) {
      console.warn("[Billing] Missing userId or productId in event:", event.id);
      return c.json({ success: true });
    }

    const supabase = getSupabase(c);
    const processedTier = buildProcessedEventTier(event);
    if (processedTier) {
      const { data: alreadyProcessed, error: ledgerError } = await supabase
        .from("user_entitlements")
        .select("id")
        .eq("user_id", userId)
        .eq("tier", processedTier)
        .limit(1)
        .maybeSingle();

      if (!ledgerError && alreadyProcessed?.id) {
        return c.json({ success: true });
      }
    }

    const grantedTier = resolveGrantedTier(event);
    if (grantedTier) {
      const expiration =
        toDateFromMilliseconds(event.expiration_at_ms) ||
        toDateFromMilliseconds(event.expires_at_ms) ||
        null;
      await updateUserEntitlement(supabase, userId, grantedTier, expiration);
    }

    const tokenCount = getTokenCountForProduct(productId);
    if (tokenCount > 0 && shouldCreditTokens(event)) {
      await creditUserTokens(supabase, userId, tokenCount);
    }

    if (processedTier) {
      const { error: ledgerInsertError } = await supabase
        .from("user_entitlements")
        .insert({
          user_id: userId,
          tier: processedTier,
          expires_at: null,
        });

      if (ledgerInsertError) {
        console.warn(
          "[Billing] Failed to record processed webhook event:",
          ledgerInsertError.message,
        );
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("[Billing] Webhook error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * Manual Token Sync (Called by Mobile App)
 */
billing.post("/sync-purchase", async (c) => {
  try {
    const { productId, userId } = await c.req.json();

    if (!productId || !userId) {
      return c.json({ error: "Missing productId or userId" }, 400);
    }

    const authenticatedUserId = await resolveAuthenticatedUserId(c);
    if (!authenticatedUserId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (String(authenticatedUserId) !== String(userId)) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const tokenCount = getTokenCountForProduct(productId);
    if (!tokenCount) {
      console.warn("[Billing] Unknown productId for manual sync:", productId);
      return c.json({ error: "Unknown product" }, 400);
    }

    const supabase = getSupabase(c);
    await creditUserTokens(supabase, String(userId), tokenCount);
    return c.json({ success: true });
  } catch (error) {
    console.error("[Billing] Manual sync error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default billing;
