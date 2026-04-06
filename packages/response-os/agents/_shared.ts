import type { AgentInput, AgentOutput, ConversationTurn, RetrievedChunk, RetrievalContext } from "./types.ts";

export interface SimpleAgentConfig {
  product: string;
  description: string;
  expertise: string[];
  tone?: "grounded" | "helpful" | "technical" | "supportive";
}

export function buildSpecialistSystemPrompt(
  config: SimpleAgentConfig,
  userMessage: string,
  context?: {
    history?: ConversationTurn[];
    retrieval?: RetrievalContext;
  },
): string {
  const recentHistory = formatRecentHistory(context?.history ?? []);
  const retrievedEvidence = formatRetrievedEvidence(context?.retrieval?.chunks ?? []);

  return `
You are NStep AI acting as the ${config.product} specialist for Northern Step Studio.

Product:
${config.product}

Description:
${config.description}

Core expertise:
${config.expertise.map((item) => `- ${item}`).join("\n")}

Brand principles:
- Practical Software
- Steady Progress
- Clear, grounded, useful answers
- Never exaggerate
- Never invent unavailable product capabilities
- If unsure, state limits clearly
- Help the user move to a next step

Response behavior:
- Be concise but useful
- Answer like a product expert
- Prefer actionable guidance
- Mention constraints when relevant
- Keep tone aligned with NStep: calm, smart, practical

Recent conversation context:
${recentHistory || "No prior conversation history."}

Retrieved evidence:
${retrievedEvidence || "No retrieved evidence available."}

User message:
${userMessage}
`.trim();
}

export async function callSpecialistModel(
  config: SimpleAgentConfig,
  input: AgentInput,
): Promise<AgentOutput> {
  const { userMessage } = input;
  const history = Array.isArray(input.metadata?.history) ? (input.metadata.history as ConversationTurn[]) : [];
  const retrieval = input.metadata?.retrieval as RetrievalContext | undefined;
  const includeTrace = Boolean(input.metadata?.includeTrace);
  const systemPrompt = buildSpecialistSystemPrompt(config, userMessage, { history, retrieval });
  const evidence = buildEvidenceEntries(retrieval?.chunks ?? []);
  const sources = includeTrace && evidence.length ? evidence.map((entry) => entry.title) : [config.product];

  void systemPrompt;

  const response = [
    `NStep AI: ${config.product} specialist active.`,
    "",
    `${config.description}`,
    "",
    `Your request: "${userMessage}"`,
    "",
    `This agent scaffold is ready. Replace the mock model call with your Vercel AI SDK or LangGraph execution path next.`,
  ].join("\n");

  return {
    response,
    confidence: evidence.length > 0 ? 0.9 : 0.8,
    sources,
    evidence,
    ui: {
      type: "message",
      tone: config.tone ?? "grounded",
      product: config.product,
      retrievalLane: retrieval?.lane ?? "studio",
      evidenceCount: evidence.length,
    },
  };
}

export function formatRecentHistory(history: ConversationTurn[] = [], limit = 6): string {
  return history
    .slice(-limit)
    .map((turn) => `${turn.role.toUpperCase()}: ${turn.content}`)
    .join("\n");
}

export function formatRetrievedEvidence(chunks: RetrievedChunk[] = [], limit = 4): string {
  if (!chunks.length) {
    return "";
  }

  return chunks
    .slice(0, limit)
    .map((chunk, index) => {
      const lines = [`[${index + 1}] ${chunk.sourceTitle}`, chunk.content];
      if (chunk.url) {
        lines.push(`Source: ${chunk.url}`);
      }

      return lines.join("\n");
    })
    .join("\n\n");
}

export function buildEvidenceEntries(
  chunks: RetrievedChunk[] = [],
): NonNullable<AgentOutput["evidence"]> {
  if (!chunks.length) {
    return [];
  }

  return chunks.map((chunk) => ({
    title: chunk.sourceTitle,
    sourceId: chunk.sourceId,
    url: chunk.url,
  }));
}
