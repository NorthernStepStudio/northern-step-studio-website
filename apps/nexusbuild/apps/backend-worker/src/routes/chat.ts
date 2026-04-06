import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import { processChat, processGeneralChat } from "../services/nexusEngine";
import { verify } from "hono/jwt";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  JWT_SECRET: string;
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
  FRONTEND_URL?: string;
};

const chat = new Hono<{ Bindings: Bindings }>();

const getSupabase = (c: any) =>
  createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);

const getJwtSecret = (c: any) => c.env.JWT_SECRET || "dev-secret-key";

const normalizeTier = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const ASSISTANT_TOKEN_COSTS = {
  assistant_chat: 5,
  build_review: 100,
  fps_deep_dive: 15,
  smart_build: 150,
} as const;

type AssistantRequestType = keyof typeof ASSISTANT_TOKEN_COSTS;

const normalizeRequestType = (value: unknown): AssistantRequestType | null => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if (Object.prototype.hasOwnProperty.call(ASSISTANT_TOKEN_COSTS, normalized)) {
    return normalized as AssistantRequestType;
  }

  return null;
};

const hasBudgetContext = (text: string) =>
  /\bbudget\b|\$\s?\d{2,6}|\b\d{1,2}(?:\.\d)?k\b|\b\d{3,6}\s*(?:usd|dollars?|bucks)\b/.test(
    text,
  );

const hasPcContext = (text: string) =>
  /\b(pc|computer|rig|setup|gaming|streaming|workstation|custom pc|parts)\b/.test(
    text,
  );

const isBuildGenerationRequest = (text: string) => {
  const normalized = String(text ?? "").toLowerCase();
  if (!normalized.trim()) {
    return false;
  }

  const specificBuildPattern =
    /\b(build me|new pc|pc build|gaming pc|streaming pc|workstation|custom pc|parts list|recommend(?: a)? build|budget build|generate(?: my)? build|smart build ai|build a pc|build for gaming|build for streaming|build for workstation|what parts do i need for (?:a )?(?:pc|computer)|what should i buy for (?:a )?(?:pc|computer)|what do i need for (?:a )?(?:pc|computer)|suggest a build|spec me a build|assemble a build)\b/;
  const hasBuildVerb = /\bbuild\b/.test(normalized);

  return (
    specificBuildPattern.test(normalized) ||
    (hasBuildVerb && hasPcContext(normalized)) ||
    (hasBudgetContext(normalized) && hasPcContext(normalized))
  );
};

const inferAssistantRequestType = (
  message: string,
  context: Record<string, unknown> = {},
): AssistantRequestType => {
  const explicit = normalizeRequestType(context.requestType);
  if (explicit) {
    return explicit;
  }

  const normalized = String(message ?? "").toLowerCase();
  const hasCurrentBuild = Boolean(context.hasCurrentBuild);
  const hasGpu = Boolean(context.hasGpu);

  if (
    hasCurrentBuild &&
    /\b(review my build|review build|build review|analyze my build|check my build|rate my build|how is my build)\b/.test(
      normalized,
    )
  ) {
    return "build_review";
  }

  if (
    hasCurrentBuild &&
    hasGpu &&
    /\b(fps|frames|frame rate|show fps|fps estimate|fps deep dive|bottleneck)\b/.test(
      normalized,
    )
  ) {
    return "fps_deep_dive";
  }

  if (isBuildGenerationRequest(normalized)) {
    return "smart_build";
  }

  return "assistant_chat";
};

const getAssistantTokenCost = (
  message: string,
  context: Record<string, unknown> = {},
) => ASSISTANT_TOKEN_COSTS[inferAssistantRequestType(message, context)];

const resolveActiveEntitlementTier = async (
  c: any,
  userId: number,
): Promise<"pro" | "power" | "premium" | "unlimited" | null> => {
  const supabase = getSupabase(c);
  const { data, error } = await supabase
    .from("user_entitlements")
    .select("tier, expires_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !Array.isArray(data) || data.length === 0) {
    return null;
  }

  const now = Date.now();
  for (const entitlement of data) {
    const tier = normalizeTier(entitlement?.tier);
    if (!tier) continue;

    const expiresAt = entitlement?.expires_at
      ? new Date(entitlement.expires_at).getTime()
      : null;
    const hasValidExpiry =
      expiresAt !== null && !Number.isNaN(expiresAt) && expiresAt > now;

    if (
      tier === "pro" ||
      tier === "power" ||
      tier === "premium" ||
      tier === "unlimited"
    ) {
      if (!hasValidExpiry) continue;
      return tier as "pro" | "power" | "premium" | "unlimited";
    }

    if (tier === "enterprise") {
      if (!hasValidExpiry) continue;
      return "unlimited";
    }
  }

  return null;
};

const resolveOptionalUserId = async (c: any): Promise<number | null> => {
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
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const SESSION_MAX_AGE_MS = 30 * 60 * 1000;

const rateLimits = new Map<string, { count: number; resetTime: number }>();
const sessionContexts = new Map<
  string,
  { context: Record<string, unknown>; lastUsed: number }
>();

const createGeneralSuggestions = () => [
  "What does a GPU do?",
  "What parts do I need for a PC?",
  "How does NexusBuild work?",
  "What can Assistant Chat do?",
];

const checkRateLimit = (key: string) => {
  const now = Date.now();
  const current = rateLimits.get(key);

  if (!current || now > current.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  current.count += 1;
  return true;
};

const cleanupSessions = () => {
  const now = Date.now();
  for (const [key, value] of sessionContexts.entries()) {
    if (now - value.lastUsed > SESSION_MAX_AGE_MS) {
      sessionContexts.delete(key);
    }
  }
};

chat.post("/", async (c) => {
  try {
    cleanupSessions();

    const ip = c.req.header("cf-connecting-ip") || "anon";
    if (!checkRateLimit(ip)) {
      return c.json(
        { error: "Rate limit exceeded. Please wait a minute." },
        429,
      );
    }

    const body = await c.req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const sessionId =
      typeof body?.sessionId === "string" && body.sessionId.trim().length > 0
        ? body.sessionId.trim()
        : ip;
    const mode = body?.mode === "assistant" ? "assistant" : "general";
    const requestedTier =
      typeof body?.userTier === "string" ? body.userTier : "free";
    let userTier = requestedTier;

    if (messages.length === 0) {
      return c.json({ error: "Messages array is required" }, 400);
    }

    const latestUserMessage = [...messages]
      .reverse()
      .find(
        (message) =>
          message?.role === "user" && typeof message?.content === "string",
      );

    if (!latestUserMessage) {
      return c.json({ error: "At least one user message is required" }, 400);
    }

    if (mode === "general") {
      const existingSession = sessionContexts.get(sessionId);
      const response = processGeneralChat(
        latestUserMessage.content,
        existingSession?.context as Record<string, unknown> | undefined,
      );
      if (response.context) {
        sessionContexts.set(sessionId, {
          context: response.context,
          lastUsed: Date.now(),
        });
      }

      return c.json({
        mode,
        message: response.text,
        suggestions: response.suggestions,
        build: undefined,
        assistant_available: true,
      });
    }

    // --- ASSISTANT MODE TOKEN GATING ---
    const supabase = getSupabase(c);
    const userId = await resolveOptionalUserId(c);

    if (userId) {
      const activeTier = await resolveActiveEntitlementTier(c, userId);
      userTier = activeTier || "free";
    }

    const assistantRequestType = inferAssistantRequestType(
      latestUserMessage.content,
      {
        requestType: body?.userContext?.requestType,
        hasCurrentBuild: Boolean(body?.userContext?.hasCurrentBuild),
        hasGpu: Boolean(body?.userContext?.hasGpu),
      },
    );
    const assistantTokenCost = getAssistantTokenCost(
      latestUserMessage.content,
      {
        requestType: body?.userContext?.requestType,
        hasCurrentBuild: Boolean(body?.userContext?.hasCurrentBuild),
        hasGpu: Boolean(body?.userContext?.hasGpu),
      },
    );

    if (!userId && mode === "assistant") {
      return c.json(
        {
          error: "Authentication required for Assistant Chat.",
          code: "AUTH_REQUIRED",
        },
        401,
      );
    }

    if (userId) {
      // Fetch user tokens and tier
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("tokens, is_admin, is_moderator")
        .eq("id", userId)
        .single();

      if (userError || !user) {
        return c.json({ error: "User not found" }, 404);
      }

      const isUnlimited =
        user.is_admin ||
        user.is_moderator ||
        userTier === "pro" ||
        userTier === "power" ||
        userTier === "unlimited";

      if (!isUnlimited && Number(user.tokens || 0) < assistantTokenCost) {
        return c.json(
          {
            error:
              "Insufficient tokens. Please purchase a token pack to continue using this request.",
            code: "INSUFFICIENT_TOKENS",
            tokens: Number(user.tokens || 0),
            required_tokens: assistantTokenCost,
          },
          403,
        );
      }

      // Process the chat
      const existingSession = sessionContexts.get(sessionId);
      const previousContext = (existingSession?.context || {}) as Record<
        string,
        unknown
      >;
      const requestedUseCase =
        typeof body?.userContext?.useCase === "string"
          ? body.userContext.useCase
          : typeof previousContext.extractedUseCase === "string"
            ? previousContext.extractedUseCase
            : undefined;
      const context = {
        ...previousContext,
        ...(body?.userContext || {}),
        tier: userTier,
        recentEvents: body?.events || [],
        extractedUseCase: requestedUseCase,
        requestType: assistantRequestType,
      };
      const result = await processChat(messages, context, {
        openRouterApiKey: c.env.OPENROUTER_API_KEY,
        openRouterModel: c.env.OPENROUTER_MODEL,
        appName: "NexusBuild",
        appUrl: c.env.FRONTEND_URL || "https://northernstepstudio.com",
      });

      // Deduct token if not unlimited
      if (!isUnlimited) {
        await supabase
          .from("users")
          .update({ tokens: Number(user.tokens || 0) - assistantTokenCost })
          .eq("id", userId);
      }

      if (result.context) {
        sessionContexts.set(sessionId, {
          context: result.context as Record<string, unknown>,
          lastUsed: Date.now(),
        });
      }

      return c.json({
        mode,
        message: result.text,
        suggestions: result.suggestions,
        build: result.build
          ? {
              parts: Object.entries(result.build.parts).map(
                ([category, part]: [string, any]) => ({
                  category,
                  name: part.name,
                  price: part.price,
                }),
              ),
              totalPrice: result.build.total,
              reasoning: result.build.reasoning,
            }
          : undefined,
        tokens_remaining: isUnlimited
          ? "unlimited"
          : Math.max(0, Number(user.tokens || 0) - assistantTokenCost),
        assistant_available: true,
      });
    }

    return c.json({ error: "Unexpected error in chat processing" }, 500);
  } catch (error) {
    return c.json(
      {
        error: "An error occurred while processing your request.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

export default chat;
