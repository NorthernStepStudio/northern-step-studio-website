import { Context } from "hono";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CATALOG_APPS } from "../shared/data/appsCatalog";
import { docsArticles } from "../shared/data/docs";

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

  const geminiKey = typeof c.env.GEMINI_API_KEY === "string" ? c.env.GEMINI_API_KEY.trim() : "";
  if (!geminiKey) {
    warnMissingGeminiKey();
    return c.json(
      getFallbackResponse(parsed.message, "Gemini API key is not configured on this deployment."),
    );
  }

  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const context = retrieveContext(parsed.message);
  const prompt = buildPrompt(parsed.message, parsed.history, context.text);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text().trim();

    if (!answer) {
      return c.json(
        getFallbackResponse(parsed.message, "Gemini returned an empty response, so a fallback answer was used."),
      );
    }

    return c.json({
      answer,
      sources: context.sources,
      mode: "gemini",
    });
  } catch (error) {
    console.error("[NStep AI] Gemini generation error:", error);
    return c.json(
      getFallbackResponse(parsed.message, "Gemini generation failed, so the assistant used a local fallback."),
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

function buildPrompt(message: string, history: ChatMessage[], contextText: string) {
  const conversationHistory = history.length
    ? history.map((entry) => `${entry.role.toUpperCase()}: ${entry.content}`).join("\n")
    : "No prior conversation.";

  return `
You are "NStep AI", the helpful public assistant for Northern Step Studio.
Your goal is to answer questions about the studio's products, documentation, and public information using ONLY the provided context and prior conversation.

BRAND VOICE:
- Direct, concise, and practical.
- Friendly but professional.
- No fluff.

CONSTRAINTS:
- Do not expose private, admin, or user data.
- Do not invent details not in the context.
- If the answer is not in the context, say "I'm not sure about that specifically, but you can find more information here:" and provide a relevant link.
- Keep answers short and scanable with bullet points if needed.

PRIOR CONVERSATION:
${conversationHistory}

CONTEXT:
${contextText || "No matching product or documentation context was found."}

CURRENT USER QUESTION:
${message}

RESPONSE FORMAT:
Return a concise answer. If you use information from a specific product or doc, mention it naturally or at the end.
`.trim();
}

function tokenize(query: string) {
  return Array.from(new Set(query.toLowerCase().match(/[a-z0-9]+/g) ?? [])).filter(
    (token) => token.length > 2,
  );
}

function scoreTextMatch(text: string, tokens: string[]) {
  let score = 0;

  for (const token of tokens) {
    if (text.includes(token)) {
      score += 1;
    }
  }

  return score;
}

function retrieveContext(query: string) {
  const normalizedQuery = query.toLowerCase();
  const tokens = tokenize(query);

  const appMatches = CATALOG_APPS.map((app) => {
    const searchableText = [
      app.name,
      app.slug,
      app.tagline,
      app.description,
      app.fullDescription,
      app.category,
      app.statusLabel,
      app.techStack.join(" "),
      app.features.join(" "),
      app.monetization,
      app.platform,
    ]
      .join(" ")
      .toLowerCase();

    let score = scoreTextMatch(searchableText, tokens);

    if (normalizedQuery.includes(app.name.toLowerCase())) {
      score += 8;
    }

    if (normalizedQuery.includes(app.slug.toLowerCase())) {
      score += 6;
    }

    return {
      score,
      text: `PRODUCT: ${app.name} (${app.statusLabel})
Tagline: ${app.tagline}
Description: ${app.fullDescription || app.description}
Features: ${app.features.join(", ")}
Tech Stack: ${app.techStack.join(", ")}
URL: /apps/${app.slug}`,
      source: { title: app.name, url: `/apps/${app.slug}` } satisfies ChatSource,
    };
  }).filter((match) => match.score > 0);

  const docMatches = docsArticles.map((doc) => {
    const searchableText = [doc.slug, doc.category, doc.summary, doc.body].join(" ").toLowerCase();

    let score = scoreTextMatch(searchableText, tokens);

    if (normalizedQuery.includes(doc.slug.toLowerCase())) {
      score += 6;
    }

    if (normalizedQuery.includes(doc.category.toLowerCase())) {
      score += 4;
    }

    return {
      score,
      text: `DOC: ${doc.slug} (${doc.category})
Summary: ${doc.summary}
Content: ${doc.body}
URL: /docs/${doc.slug}`,
      source: { title: `Doc: ${doc.slug}`, url: `/docs/${doc.slug}` } satisfies ChatSource,
    };
  }).filter((match) => match.score > 0);

  const rankedMatches = [...appMatches, ...docMatches]
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  if (rankedMatches.length === 0) {
    const welcomeDoc = docsArticles.find((doc) => doc.slug === "welcome");

    if (welcomeDoc) {
      return {
        text: `GENERAL INFO: ${welcomeDoc.body}`,
        sources: [{ title: "About NSS", url: "/about" }],
      };
    }

    return {
      text: "",
      sources: [],
    };
  }

  return {
    text: rankedMatches.map((match) => match.text).join("\n\n---\n\n"),
    sources: rankedMatches.map((match) => match.source),
  };
}

function getFallbackResponse(query: string, warning?: string): ChatResponse {
  const normalizedQuery = query.toLowerCase();

  if (normalizedQuery.includes("contact") || normalizedQuery.includes("support")) {
    return {
      answer:
        "You can reach Northern Step Studio via the Contact page or email hello@northernstepstudio.com. We typically respond within 24-48 hours.",
      sources: [{ title: "Contact Us", url: "/contact" }],
      mode: "fallback",
      warning,
    };
  }

  if (normalizedQuery.includes("apps") || normalizedQuery.includes("products")) {
    return {
      answer:
        "We have several active products including NexusBuild, Lead Recovery Service (Missed Call Text Back), and ProvLy. You can explore the full catalog in our App Hub.",
      sources: [{ title: "App Hub", url: "/apps" }],
      mode: "fallback",
      warning,
    };
  }

  return {
    answer:
      "I'm sorry, I couldn't find a specific answer to that right now. Please explore our documentation or contact our team for direct assistance.",
    sources: [
      { title: "Documentation", url: "/docs" },
      { title: "Contact Us", url: "/contact" },
    ],
    mode: "fallback",
    warning,
  };
}
