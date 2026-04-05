import { Context } from "hono";
import { type ChatMessage } from "./studio-supervisor.ts";
import { getDb } from "./db.ts";
import { routeMessage } from "../../packages/response-os/router.ts";
import { runStudioGraph } from "../../packages/response-os/graph/index.ts";
import type { AgentInput, AgentOutput } from "../../packages/response-os/agents/types.ts";

export interface ChatResponse {
  answer: string;
  sources?: string[];
  mode?: "gemini" | "fallback";
  confidence: "low" | "medium" | "high";
  warning?: string;
  error?: string;
}

type ChatRequest = {
  message?: unknown;
  history?: unknown;
};

type ParsedChatRequest =
  | {
      message: string;
      history: ChatMessage[];
    }
  | {
      error: string;
      status: number;
    };

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const AI_CHAT_WINDOW_MS = 60_000;
const AI_CHAT_MAX_REQUESTS = 12;
const AI_CHAT_MAX_MESSAGE_LENGTH = 2_000;
const AI_CHAT_MAX_HISTORY_ENTRIES = 8;
const aiChatBuckets = new Map<string, RateLimitBucket>();
let missingGeminiKeyWarned = false;

export async function handleAIRequest(input: AgentInput): Promise<AgentOutput> {
  return runStudioGraph(input);
}

export const handleAiChat = async (c: Context) => {
  const parsed = await parseChatRequest(c);
  if ("error" in parsed) {
    return c.json({ error: parsed.error }, parsed.status);
  }

  const rateLimit = enforceAiChatRateLimit(c);
  if (rateLimit) {
    return c.json(
      {
        error: rateLimit.error,
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      },
      429,
    );
  }

  const geminiKey = typeof c.env.GEMINI_API_KEY === "string" ? c.env.GEMINI_API_KEY.trim() : "";
  const includeTrace = c.req.header("x-nstep-trace") === "1";
  if (!geminiKey) {
    warnMissingGeminiKey();
  }

  const route = await routeMessage(parsed.message);
  const input: AgentInput = {
    userMessage: parsed.message,
    sessionId: getClientIdentifier(c),
    metadata: {
      history: parsed.history,
      geminiApiKey: geminiKey || undefined,
      databaseUrl: c.env.SUPABASE_DB_URL || c.env.DATABASE_URL || undefined,
      includeTrace,
      requestPath: c.req.path,
      requestUrl: c.req.url,
    },
  };

  let result: AgentOutput;
  try {
    result = await handleAIRequest(input);
  } catch (error) {
    console.error("[NStep AI] Chat pipeline error:", error);
    result = {
      response: buildAssistantErrorMessage(error),
      confidence: 0.25,
      sources: [],
      ui: {
        type: "error",
        route,
        warning: "The assistant could not complete the request.",
      },
    };
  }

  const finalRoute = typeof result.ui?.route === "string" ? result.ui.route : route;
  await recordAiChatAnalytics(c, parsed.message, finalRoute, result);
  return c.json(toPublicChatResponse(result));
};

async function parseChatRequest(c: Context): Promise<ParsedChatRequest> {
  let body: ChatRequest;

  try {
    body = await c.req.json<ChatRequest>();
  } catch {
    return { error: "Invalid JSON payload.", status: 400 };
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return { error: "Message is required.", status: 400 };
  }

  if (message.length > AI_CHAT_MAX_MESSAGE_LENGTH) {
    return {
      error: `Message must be ${AI_CHAT_MAX_MESSAGE_LENGTH.toLocaleString()} characters or less.`,
      status: 400,
    };
  }

  return {
    message,
    history: normalizeHistory(body.history),
  };
}

function normalizeHistory(history: unknown): ChatMessage[] {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const role = (entry as { role?: unknown }).role;
      const content = (entry as { content?: unknown }).content;

      if ((role !== "user" && role !== "assistant") || typeof content !== "string") {
        return null;
      }

      const trimmedContent = content.trim();
      if (!trimmedContent) {
        return null;
      }

      return {
        role,
        content: trimmedContent,
      } satisfies ChatMessage;
    })
    .filter((entry): entry is ChatMessage => entry !== null)
    .slice(-AI_CHAT_MAX_HISTORY_ENTRIES);
}

function warnMissingGeminiKey() {
  if (missingGeminiKeyWarned) {
    return;
  }

  missingGeminiKeyWarned = true;
  console.warn("[NStep AI] GEMINI_API_KEY is not configured. Serving fallback answers only.");
}

function getClientIdentifier(c: Context) {
  const headerCandidates = [
    c.req.header("cf-connecting-ip"),
    c.req.header("x-real-ip"),
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim(),
  ];

  return headerCandidates.find((value) => Boolean(value && value.trim()))?.trim() || "local";
}

function enforceAiChatRateLimit(c: Context) {
  const now = Date.now();

  for (const [key, bucket] of aiChatBuckets.entries()) {
    if (bucket.resetAt <= now) {
      aiChatBuckets.delete(key);
    }
  }

  const clientId = getClientIdentifier(c);
  const bucket = aiChatBuckets.get(clientId);

  if (!bucket || bucket.resetAt <= now) {
    aiChatBuckets.set(clientId, {
      count: 1,
      resetAt: now + AI_CHAT_WINDOW_MS,
    });

    return null;
  }

  if (bucket.count >= AI_CHAT_MAX_REQUESTS) {
    return {
      error: `Too many requests. Please wait ${Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))} seconds and try again.`,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  aiChatBuckets.set(clientId, bucket);

  return null;
}

function buildAssistantErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    if (error.message.startsWith("I'm sorry")) {
      return error.message;
    }

    return `I'm sorry, ${error.message.charAt(0).toLowerCase()}${error.message.slice(1)}`;
  }

  return "I'm sorry, I'm having trouble connecting right now. Please try again or contact support if the issue persists.";
}

function toPublicChatResponse(result: AgentOutput): Pick<ChatResponse, "answer" | "mode" | "confidence" | "warning" | "sources"> {
  const confidence = toConfidenceLabel(result.confidence);
  const response: Pick<ChatResponse, "answer" | "mode" | "confidence" | "warning" | "sources"> = {
    answer: result.response,
    mode: confidence === "low" ? "fallback" : "gemini",
    confidence,
    sources: result.sources,
  };

  if (confidence === "low") {
    response.warning = "The assistant may need human follow-up.";
  }

  return response;
}

async function recordAiChatAnalytics(c: Context, question: string, route: string, result: AgentOutput): Promise<void> {
  try {
    const sql = getDb(c.env);
    await sql`
      INSERT INTO analytics (event, app_id, app_uuid, user_id, metadata)
      VALUES (
        ${"nstep_ai.chat"},
        ${"nstep-ai"},
        ${"nstep-ai"},
        ${null},
        ${JSON.stringify({
          route,
          sourceCount: result.sources?.length ?? 0,
          evidenceCount: result.evidence?.length ?? 0,
          retrievalLane: result.ui && typeof result.ui === "object" ? (result.ui as { retrievalLane?: string }).retrievalLane ?? null : null,
          matchedTopics: result.ui && typeof result.ui === "object" ? (result.ui as { matchedTopics?: string[] }).matchedTopics ?? [] : [],
          warning: result.ui && typeof result.ui === "object" ? (result.ui as { warning?: string }).warning ?? null : null,
          answerLength: result.response.length,
          question: question.slice(0, 240),
        })},
      )
    `;
  } catch (error) {
    console.error("[NStep AI] Failed to record analytics event:", error);
  }
}

function toConfidenceLabel(confidence?: number): "low" | "medium" | "high" {
  if (typeof confidence !== "number" || Number.isNaN(confidence) || confidence <= 0) {
    return "low";
  }

  if (confidence >= 0.75) {
    return "high";
  }

  if (confidence >= 0.45) {
    return "medium";
  }

  return "low";
}
