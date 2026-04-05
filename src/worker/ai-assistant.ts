import { Context } from "hono";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  buildStudioKnowledgeBundle,
  buildStudioPrompt,
  buildStudioSupervisorDecision,
  evaluateStudioAnswer,
  getStudioFallbackResponse,
} from "./studio-supervisor";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatSource {
  title: string;
  url: string;
}

export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
  mode: "gemini" | "fallback";
  confidence: "low" | "medium" | "high";
  warning?: string;
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

  const supervisorDecision = buildStudioSupervisorDecision(parsed.message, parsed.history);
  const geminiKey = typeof c.env.GEMINI_API_KEY === "string" ? c.env.GEMINI_API_KEY.trim() : "";
  if (!geminiKey) {
    warnMissingGeminiKey();
    return c.json(
      getStudioFallbackResponse(
        parsed.message,
        supervisorDecision,
        "Gemini API key is not configured on this deployment.",
      ),
    );
  }

  const knowledgeBundle = buildStudioKnowledgeBundle(parsed.message, parsed.history, supervisorDecision);
  if (supervisorDecision.confidence === "low" && knowledgeBundle.sources.length === 0) {
    return c.json(
      getStudioFallbackResponse(
        parsed.message,
        supervisorDecision,
        "The studio supervisor could not ground this answer in public studio context.",
      ),
    );
  }

  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = buildStudioPrompt(parsed.message, parsed.history, supervisorDecision, knowledgeBundle);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text().trim();

    if (!answer) {
      return c.json(
        getStudioFallbackResponse(
          parsed.message,
          supervisorDecision,
          "Gemini returned an empty response, so the studio supervisor used a fallback answer.",
        ),
      );
    }

    const review = evaluateStudioAnswer(answer, supervisorDecision, knowledgeBundle);

    if (review.confidence === "low" && knowledgeBundle.sources.length === 0) {
      return c.json(
        getStudioFallbackResponse(
          parsed.message,
          supervisorDecision,
          review.warning || "The answer could not be grounded enough for a public response.",
        ),
      );
    }

    return c.json({
      answer,
      sources: knowledgeBundle.sources,
      mode: "gemini",
      confidence: review.confidence,
      warning: review.warning,
    });
  } catch (error) {
    console.error("[NStep AI] Gemini generation error:", error);
    return c.json(
      getStudioFallbackResponse(
        parsed.message,
        supervisorDecision,
        "Gemini generation failed, so the studio supervisor used a fallback answer.",
      ),
    );
  }
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

