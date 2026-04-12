import type { AgentInput, AgentOutput, ConversationTurn, RetrievalContext } from "./types.ts";
import { buildEvidenceEntries, formatRecentHistory, formatRetrievedEvidence } from "./_shared.ts";

function detectStudioTopic(message: string): string[] {
  const msg = message.toLowerCase();
  const topics: string[] = [];

  if (msg.includes("pc") || msg.includes("gpu") || msg.includes("cpu") || msg.includes("build")) {
    topics.push("NexusBuild");
  }

  if (
    msg.includes("insurance") ||
    msg.includes("claim") ||
    msg.includes("inventory") ||
    msg.includes("home items")
  ) {
    topics.push("ProvLy");
  }

  if (
    msg.includes("invest") ||
    msg.includes("stock") ||
    msg.includes("portfolio") ||
    msg.includes("money")
  ) {
    topics.push("NooBS Investing");
  }

  if (
    msg.includes("routine") ||
    msg.includes("kids") ||
    msg.includes("therapy") ||
    msg.includes("skills")
  ) {
    topics.push("Neuromove");
  }

  if (
    msg.includes("score") ||
    msg.includes("sports") ||
    msg.includes("match") ||
    msg.includes("team")
  ) {
    topics.push("PasoScore");
  }

  if (
    msg.includes("automation") ||
    msg.includes("sms") ||
    msg.includes("follow-up")
  ) {
    topics.push("Automation");
  }

  return [...new Set(topics)];
}

function buildSystemPrompt(args: {
  userMessage: string;
  history?: ConversationTurn[];
  retrieval?: RetrievalContext;
}): string {
  const recentHistory = formatRecentHistory(args.history ?? []);
  const retrievedEvidence = formatRetrievedEvidence(args.retrieval?.chunks ?? []);

  return `
You are NStep AI, the central studio intelligence for Northern Step Studio.

Brand principles:
- Practical Software
- Steady Progress
- Clear, grounded, useful answers
- Never pretend certainty when uncertain
- Prefer structured, direct help over hype

Your responsibilities:
- Answer as the front door to the entire NStep studio ecosystem
- Help users understand products, features, use cases, and next actions
- Route conceptual attention to the right studio product when relevant
- Stay concise, helpful, and grounded in real value

Studio products:
- NexusBuild: PC build guidance, parts analysis, planning, workstation/gaming recommendations
- ProvLy: home inventory, claim readiness, insurance support workflows
- NooBS Investing: beginner-friendly investing education and simulation
- Neuromove: routines, support tools, skills and therapy-adjacent workflow support
- PasoScore: score/tracking/productivity or sports-adjacent experience
- Automation: workflow automation and communication system support

Response style:
- Clear
- Professional
- Not robotic
- No exaggerated claims
- When helpful, mention the most relevant NStep product naturally
- When the request is broad, answer first, then suggest the best product path

Recent conversation context:
${recentHistory || "No prior conversation history."}

Retrieved evidence:
${retrievedEvidence || "No retrieved evidence available."}

User message:
${args.userMessage}
`.trim();
}

async function callModel(systemPrompt: string, userMessage: string): Promise<string> {
  /**
   * Replace this with your actual Vercel AI SDK / provider call.
   * Example later:
   * const result = await generateText({ model, system: systemPrompt, prompt: userMessage })
   * return result.text;
   */

  void systemPrompt;

  return [
    "I'm NStep AI, here to help across the Northern Step Studio ecosystem.",
    "Right now, the general agent is active and ready to answer broad studio, product, and planning questions.",
    `You asked: "${userMessage}"`,
  ].join("\n\n");
}

export async function generalAgent(input: AgentInput): Promise<AgentOutput> {
  const { userMessage } = input;
  const history = Array.isArray(input.metadata?.history) ? (input.metadata.history as ConversationTurn[]) : [];
  const retrieval = input.metadata?.retrieval as RetrievalContext | undefined;
  const includeTrace = Boolean(input.metadata?.includeTrace);

  const matchedTopics = detectStudioTopic(userMessage);
  const systemPrompt = buildSystemPrompt({
    userMessage,
    history,
    retrieval,
  });
  const evidence = buildEvidenceEntries(retrieval?.chunks ?? []);

  const responseText = await callModel(systemPrompt, userMessage);
  const sources = includeTrace
    ? Array.from(
        new Set([
          ...matchedTopics,
          ...evidence.map((entry) => entry.title),
        ]),
      )
    : matchedTopics;

  return {
    response:
      matchedTopics.length > 0
        ? `${responseText}\n\nRelevant studio areas: ${matchedTopics.join(", ")}`
        : responseText,
    confidence: evidence.length > 0 ? 0.9 : matchedTopics.length > 0 ? 0.86 : 0.72,
    sources,
    evidence: includeTrace ? evidence : [],
    ui: {
      type: "message",
      tone: "grounded",
      matchedTopics,
      retrievalLane: retrieval?.lane ?? "studio",
      evidenceCount: evidence.length,
    },
  };
}
