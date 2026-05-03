import { GoogleGenerativeAI } from "@google/generative-ai";
import { CATALOG_APPS, type CatalogApp } from "../shared/data/appsCatalog.ts";
import { docsArticles, type DocsArticle } from "../shared/data/docs.ts";
import { siteFaqEntries } from "../shared/data/faq.ts";
import {
  STUDIO_APP_FAMILIES,
  STUDIO_EXPERTS,
  STUDIO_GLOBAL_CONTEXT,
  STUDIO_IDENTITY,
  getStudioDomainByLane,
  getStudioProductFamily,
  type StudioAppFamily,
  type StudioLane,
} from "../shared/data/studioKnowledge.ts";
import { searchKnowledgeChunks, type KnowledgeLane } from "./knowledge.ts";
import type { DBClient } from "./db.ts";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatSource {
  title: string;
  url: string;
}

export type StudioConfidence = "low" | "medium" | "high";
export type RetrievalRoute = "support" | "docs" | "faq" | "products" | "general";

export type StudioAgentRole =
  | "supervisor"
  | "utility-expert"
  | "finance-expert"
  | "support-expert"
  | "studio-expert"
  | "verifier";

interface AppSummary {
  readonly name: string;
  readonly slug: string;
  readonly path: string;
  readonly tagline: string;
  readonly description: string;
  readonly fullDescription: string;
  readonly category: string;
  readonly statusLabel: string;
  readonly techStack: readonly string[];
  readonly features: readonly string[];
  readonly monetization: string;
  readonly keywords: readonly string[];
  readonly aliases: readonly string[];
  readonly kind: "catalog" | "family";
}

interface RetrievalHit {
  score: number;
  text: string;
  source: ChatSource;
  kind: "app" | "doc" | "faq";
  appSlug?: string;
  docSlug?: string;
  faqId?: string;
}

interface RetrievalEvaluation {
  readonly verdict: "approved" | "needs_fallback";
  readonly confidence: number;
  readonly reason: string;
}

export interface StudioSupervisorDecision {
  readonly route: RetrievalRoute;
  readonly reason: string;
  readonly confidence: StudioConfidence;
  readonly selectedLanes: readonly StudioLane[];
  readonly selectedRoles: readonly StudioAgentRole[];
  readonly crossDomain: boolean;
  readonly searchHints: readonly string[];
}

interface StudioExpertSection {
  readonly role: StudioAgentRole;
  readonly lane: StudioLane | "studio";
  readonly title: string;
  readonly summary: string;
  readonly text: string;
  readonly sources: readonly ChatSource[];
  readonly hits: readonly RetrievalHit[];
  readonly confidence: number;
}

export interface StudioKnowledgeBundle {
  readonly text: string;
  readonly sources: readonly ChatSource[];
  readonly confidence: number;
  readonly hits: readonly RetrievalHit[];
  readonly searchHints: readonly string[];
  readonly route: RetrievalRoute;
  readonly evaluation: RetrievalEvaluation;
  readonly sections: readonly StudioExpertSection[];
}

/** Internal shape returned by the in-memory searchKnowledge helper. */
interface RetrievalBundle {
  readonly text: string;
  readonly sources: ChatSource[];
  readonly confidence: number;
  readonly hits: RetrievalHit[];
  readonly searchHints: string[];
  readonly route: RetrievalRoute;
  readonly evaluation: RetrievalEvaluation;
}

export interface StudioAgentState {
  readonly message: string;
  readonly history: readonly ChatMessage[];
  readonly conversationSignal: string;
  readonly decision: StudioSupervisorDecision;
  readonly bundle: StudioKnowledgeBundle;
}

export interface StudioThoughtStep {
  readonly role: StudioAgentRole;
  readonly title: string;
  readonly detail: string;
  readonly status: "selected" | "consulted" | "verified" | "fallback";
}

export interface StudioAnswerReview {
  readonly allowed: boolean;
  readonly reason?: string;
  readonly confidence: StudioConfidence;
}

export interface StudioChatResult {
  readonly answer: string;
  readonly sources: readonly ChatSource[];
  readonly mode: "gemini" | "fallback";
  readonly confidence: StudioConfidence;
  readonly warning?: string;
  readonly trace?: readonly StudioThoughtStep[];
  readonly route: RetrievalRoute;
  readonly retrievalConfidence: number;
  readonly evaluationVerdict: RetrievalEvaluation["verdict"];
  readonly evaluationReason: string;
  readonly sourceTitles: readonly string[];
  readonly sourceUrls: readonly string[];
  readonly sourceKinds: readonly RetrievalHit["kind"][];
}

export interface StudioChatOptions {
  readonly message: string;
  readonly history: readonly ChatMessage[];
  readonly geminiApiKey?: string;
  readonly includeTrace?: boolean;
  /** Pass the DB client to enable database-backed knowledge retrieval.
   *  If omitted the supervisor falls back to in-memory keyword scoring. */
  readonly db?: DBClient;
}



export async function createStudioAgentState(
  message: string,
  history: readonly ChatMessage[],
  db?: DBClient,
): Promise<StudioAgentState> {
  const conversationSignal = buildConversationSignal(message, history);
  const decision = buildStudioSupervisorDecision(message, history, conversationSignal);
  const bundle = await buildStudioKnowledgeBundle(message, history, decision, conversationSignal, db);

  return {
    message,
    history,
    conversationSignal,
    decision,
    bundle,
  };
}

export async function runStudioChat(options: StudioChatOptions): Promise<StudioChatResult> {
  const state = await createStudioAgentState(options.message, options.history, options.db);

  if (!options.geminiApiKey?.trim()) {
    return buildFallbackOutcome(
      state,
      "Gemini API key is not configured on this deployment.",
      "Gemini API key missing",
      options.includeTrace === true,
    );
  }

  if (state.bundle.evaluation.verdict !== "approved") {
    return buildFallbackOutcome(
      state,
      "I could not find enough grounded studio knowledge to answer confidently, so I used the fallback path.",
      state.bundle.evaluation.reason,
      options.includeTrace === true,
    );
  }

  const genAI = new GoogleGenerativeAI(options.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = buildStudioPrompt(state);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text().trim();

    if (!answer) {
      return buildFallbackOutcome(
        state,
        "Gemini returned an empty response, so a fallback answer was used.",
        "Gemini returned an empty response",
        options.includeTrace === true,
      );
    }

    const review = evaluateStudioAnswer(answer, state);
    if (!review.allowed) {
      return buildFallbackOutcome(
        state,
        `The model answer was too speculative (${review.reason}), so the fallback path was used instead.`,
        review.reason || "unsupported claim",
        options.includeTrace === true,
      );
    }

    return finalizeStudioChatResult(
      state,
      {
        answer,
        sources: state.bundle.sources,
        mode: "gemini",
        confidence: review.confidence,
      },
      review,
      options.includeTrace === true,
    );
  } catch (error) {
    console.error("[NStep AI] Gemini generation error:", error);
    return buildFallbackOutcome(
      state,
      "Gemini generation failed, so the assistant used a local fallback.",
      "Gemini generation failed",
      options.includeTrace === true,
    );
  }
}

export function buildStudioSupervisorDecision(
  message: string,
  history: readonly ChatMessage[],
  conversationSignal = buildConversationSignal(message, history),
): StudioSupervisorDecision {
  const route = classifyQuery(conversationSignal);
  const laneScores = STUDIO_EXPERTS.map((expert) => ({
    lane: expert.lane,
    score: scoreLane(conversationSignal, route, expert),
  })).sort((left, right) => right.score - left.score);

  const strongestScore = laneScores[0]?.score ?? 0;
  let selectedLanes = laneScores
    .filter((entry) => entry.score >= 2 || entry.score >= strongestScore - 1.25)
    .map((entry) => entry.lane)
    .slice(0, 3);

  if (!selectedLanes.length && strongestScore > 0.25) {
    selectedLanes = laneScores.slice(0, 1).map((entry) => entry.lane);
  }

  const crossDomain = selectedLanes.length > 1;
  const selectedRoles = [
    "supervisor" as const,
    ...selectedLanes.map((lane) => laneRoleForLane(lane)),
    "studio-expert" as const,
    "verifier" as const,
  ];

  const reason = selectedLanes.length
    ? `Supervisor routed the question through ${selectedLanes.map((lane) => getStudioDomainByLane(lane)?.label ?? lane).join(", ")}.`
    : "Supervisor kept the question on the studio philosophy path because no domain clearly dominated.";

  const confidence = strongestScore >= 5 ? "high" : strongestScore >= 2.5 ? "medium" : "low";

  return {
    route,
    reason,
    confidence,
    selectedLanes,
    selectedRoles,
    crossDomain,
    searchHints: buildSearchHints(route, selectedLanes),
  };
}

export async function buildStudioKnowledgeBundle(
  message: string,
  history: readonly ChatMessage[],
  decision: StudioSupervisorDecision,
  conversationSignal = buildConversationSignal(message, history),
  db?: DBClient,
): Promise<StudioKnowledgeBundle> {
  const tokens = tokenize(conversationSignal);
  const genericBundle = searchKnowledge(conversationSignal, decision.route, tokens);

  // Build expert sections — DB-backed when a db client is available
  const sectionPromises = [
    Promise.resolve(buildStudioPhilosophySection(conversationSignal)),
    ...decision.selectedLanes.map((lane) =>
      buildLaneSection(lane, conversationSignal, decision.route, tokens, db),
    ),
  ];
  const sections: StudioExpertSection[] = await Promise.all(sectionPromises);

  const sectionHits = sections.flatMap((section) => section.hits);
  const combinedHits = dedupeHits([...genericBundle.hits, ...sectionHits]).slice(0, 8);
  const combinedSources = dedupeSources(
    [...genericBundle.sources, ...sections.flatMap((section) => section.sources)],
  ).slice(0, 8);

  return {
    text: [
      `SUPERVISOR ROUTE\nRoute: ${decision.route}\nReason: ${decision.reason}\nConfidence: ${decision.confidence}\nCross-domain: ${decision.crossDomain ? "yes" : "no"}`,
      ...sections.map(formatSection),
      genericBundle.text,
    ]
      .filter(Boolean)
      .join("\n\n===\n\n"),
    sources: combinedSources,
    confidence: Math.max(genericBundle.confidence, ...sections.map((section) => section.confidence), 0),
    hits: combinedHits,
    searchHints: dedupeStrings([...decision.searchHints, ...genericBundle.searchHints]),
    route: decision.route,
    evaluation: evaluateRetrieval(combinedHits, decision.route),
    sections,
  };
}

export function buildStudioPrompt(state: StudioAgentState) {
  const conversationHistory = state.history.length
    ? state.history.map((entry) => `${entry.role.toUpperCase()}: ${entry.content}`).join("\n")
    : "No prior conversation.";

  const expertNames = state.decision.selectedLanes.length
    ? state.decision.selectedLanes
        .map((lane) => getStudioDomainByLane(lane)?.label ?? lane)
        .join(", ")
    : "Studio Philosophy";

  return `
You are "NStep AI", the public assistant for ${STUDIO_IDENTITY.name}.
You answer as a studio-wide coordinator that can route across product experts when needed.

ROUTING SUMMARY:
- Route: ${state.decision.route}
- Selected experts: ${expertNames}
- Cross-domain: ${state.decision.crossDomain ? "yes" : "no"}
- Supervisor reason: ${state.decision.reason}

VOICE:
- ${STUDIO_IDENTITY.voice}
- Stay concise, practical, and professional.
- Do not mention internal agent names, traces, or supervisor notes to the user.
- Use only the context below. If the answer is not grounded, say you are not sure and point to the best public page.

PRIOR CONVERSATION:
${conversationHistory}

STUDIO PHILOSOPHY:
${STUDIO_GLOBAL_CONTEXT}

EXPERT BRIEFS:
${state.bundle.sections.map((section) => formatSection(section)).join("\n\n")}

GENERAL EVIDENCE:
${state.bundle.text}

CURRENT USER QUESTION:
${state.message}

RESPONSE RULES:
- Answer the question directly.
- If multiple experts are relevant, synthesize them into one clean answer.
- If the context is weak, keep the answer short and point to the most relevant public page.
- Never invent prices, availability, or product behavior.
`.trim();
}

export function evaluateStudioAnswer(answer: string, state: StudioAgentState): StudioAnswerReview {
  const lower = answer.toLowerCase();
  const sourceText = state.bundle.hits.map((hit) => hit.text.toLowerCase()).join(" ");
  const suspiciousClaims = ["pricing", "price", "download", "early access", "release date", "launch date", "support", "login"];

  if (!state.bundle.sources.length) {
    return { allowed: false, reason: "no grounded sources", confidence: "low" };
  }

  if (suspiciousClaims.some((claim) => lower.includes(claim) && !sourceText.includes(claim))) {
    return { allowed: false, reason: "unsupported claim", confidence: "low" };
  }

  if (state.bundle.confidence < 0.18 && lower.includes("maybe")) {
    return { allowed: false, reason: "speculative answer without enough grounding", confidence: "low" };
  }

  return {
    allowed: true,
    confidence: inferConfidenceLabel("gemini", state.bundle.confidence),
  };
}

export function buildStudioThoughtTrail(state: StudioAgentState, review?: StudioAnswerReview): readonly StudioThoughtStep[] {
  const trail: StudioThoughtStep[] = [
    {
      role: "supervisor",
      title: "Route the question",
      detail: `Route ${state.decision.route} with ${state.decision.crossDomain ? "cross-domain" : "single-domain"} handling.`,
      status: "selected",
    },
  ];

  if (state.decision.selectedLanes.length) {
    for (const lane of state.decision.selectedLanes) {
      const expert = getStudioDomainByLane(lane);
      trail.push({
        role: laneRoleForLane(lane),
        title: `Consult ${expert?.label ?? lane}`,
        detail: expert?.summary ?? lane,
        status: "consulted",
      });
    }
  }

  trail.push({
    role: "studio-expert",
    title: "Check studio philosophy",
    detail: STUDIO_IDENTITY.publicPromise,
    status: "consulted",
  });

  trail.push({
    role: "verifier",
    title: review?.allowed ? "Verify grounded answer" : "Use fallback answer",
    detail: review?.reason ?? state.bundle.evaluation.reason,
    status: review?.allowed ? "verified" : "fallback",
  });

  return trail;
}

export function getStudioFallbackResponse(
  query: string,
  decision?: StudioSupervisorDecision,
  warning?: string,
  searchHints: readonly string[] = [],
): { answer: string; sources: ChatSource[]; mode: "fallback"; confidence: "low"; warning?: string } {
  const normalizedQuery = query.toLowerCase();
  const sources = collectFallbackSources(normalizedQuery, decision, searchHints);

  if (normalizedQuery.includes("contact") || normalizedQuery.includes("support")) {
    return {
      answer:
        "Use the Contact page for studio and partnership questions. Product support should go to the Product support contact shown there.",
      sources,
      mode: "fallback",
      confidence: "low",
      warning,
    };
  }

  if (normalizedQuery.includes("doc") || normalizedQuery.includes("how") || normalizedQuery.includes("setup") || normalizedQuery.includes("fix")) {
    return {
      answer:
        "I couldn't find a specific answer in the current context. Start with the documentation or the most relevant product page for the app you are asking about.",
      sources,
      mode: "fallback",
      confidence: "low",
      warning,
    };
  }

  if (
    normalizedQuery.includes("about") ||
    normalizedQuery.includes("studio") ||
    normalizedQuery.includes("mission") ||
    normalizedQuery.includes("brand")
  ) {
    return {
      answer:
        "You can learn more about Northern Step Studio on the About page and browse the current products from the Apps page.",
      sources,
      mode: "fallback",
      confidence: "low",
      warning,
    };
  }

  if (normalizedQuery.includes("price") || normalizedQuery.includes("product") || normalizedQuery.includes("app")) {
    return {
      answer:
        "Open the Apps page to browse the current catalog, or use the Contact page if you want a direct conversation about a specific product.",
      sources,
      mode: "fallback",
      confidence: "low",
      warning,
    };
  }

  return {
    answer:
      "I'm not sure about that specifically. The best next step is to check the About, Apps, or Contact pages for the most relevant public information.",
    sources,
    mode: "fallback",
    confidence: "low",
    warning,
  };
}

function buildFallbackOutcome(
  state: StudioAgentState,
  warning: string,
  fallbackReason: string,
  includeTrace: boolean,
): StudioChatResult {
  const response = getStudioFallbackResponse(state.message, state.decision, warning, state.bundle.searchHints);
  return finalizeStudioChatResult(
    state,
    response,
    {
      allowed: false,
      reason: fallbackReason,
      confidence: "low",
    },
    includeTrace,
  );
}

function finalizeStudioChatResult(
  state: StudioAgentState,
  response: {
    readonly answer: string;
    readonly sources: readonly ChatSource[];
    readonly mode: "gemini" | "fallback";
    readonly confidence: StudioConfidence;
    readonly warning?: string;
  },
  review: StudioAnswerReview,
  includeTrace: boolean,
): StudioChatResult {
  const trace = includeTrace ? buildStudioThoughtTrail(state, review) : undefined;

  return {
    answer: response.answer,
    sources: response.sources,
    mode: response.mode,
    confidence: response.confidence,
    warning: response.warning,
    trace,
    route: state.decision.route,
    retrievalConfidence: state.bundle.confidence,
    evaluationVerdict: state.bundle.evaluation.verdict,
    evaluationReason: review.reason || state.bundle.evaluation.reason,
    sourceTitles: response.sources.map((source) => source.title),
    sourceUrls: response.sources.map((source) => source.url),
    sourceKinds: state.bundle.hits.map((hit) => hit.kind),
  };
}

function buildStudioPhilosophySection(signal: string): StudioExpertSection {
  return {
    role: "studio-expert",
    lane: "studio",
    title: `${STUDIO_IDENTITY.name} Philosophy`,
    summary: STUDIO_IDENTITY.philosophy,
    text: `${STUDIO_GLOBAL_CONTEXT}\n\nCurrent question focus: ${truncateText(signal, 220)}`,
    sources: [{ title: "About Northern Step Studio", url: "/about" }],
    hits: [],
    confidence: 0.95,
  };
}

async function buildLaneSection(
  lane: StudioLane,
  signal: string,
  route: RetrievalRoute,
  tokens: readonly string[],
  db?: DBClient,
): Promise<StudioExpertSection> {
  const expert = getStudioDomainByLane(lane);

  // ── Phase 1: Try DB-backed search first ─────────────────────────────────
  if (db) {
    try {
      const dbResult = await searchKnowledgeChunks(db, {
        lane: lane as KnowledgeLane,
        query: signal,
        topN: 5,
      });

      if (dbResult.hasResults) {
        const dbHits: RetrievalHit[] = dbResult.chunks.map((chunk) => ({
          score: chunk.score,
          kind: "doc" as const,
          text: [
            chunk.title ? `[${chunk.title}]` : "",
            chunk.section ? `Section: ${chunk.section}` : "",
            chunk.content,
          ].filter(Boolean).join("\n"),
          source: {
            title: chunk.title ?? (expert?.label ?? lane),
            url: chunk.source_url ?? `/apps/${lane}`,
          },
          docSlug: chunk.doc_id,
        }));

        const dbSources = dedupeSources(dbHits.map((h) => h.source));

        return {
          role: laneRoleForLane(lane),
          lane,
          title: expert?.label ?? lane,
          summary: expert?.summary ?? lane,
          text: dbHits.map((h) => h.text).join("\n\n---\n\n"),
          sources: dbSources,
          hits: dbHits,
          confidence: computeConfidence(dbHits),
        };
      }
    } catch (err) {
      // DB search failed — fall through to in-memory scoring silently
      console.warn(`[supervisor] DB lane search failed for ${lane}, using in-memory fallback:`, err);
    }
  }

  // ── Fallback: In-memory keyword scoring (always available) ───────────────
  const routeBoost = laneBoost(route, lane);
  const laneSummaries = buildLaneAppSummaries(lane);
  const appHits = scoreAppSummaries(laneSummaries, tokens, signal.toLowerCase(), routeBoost);
  const docHits = scoreDocs(tokens, signal.toLowerCase(), routeBoost, expert?.docCategories);
  const faqHits = scoreFaqs(
    tokens,
    signal.toLowerCase(),
    routeBoost,
    [...(expert?.keywords ?? []), ...(expert?.aliases ?? []), ...(expert?.productSlugs ?? [])],
  );
  const hits = dedupeHits([...appHits, ...docHits, ...faqHits]).slice(0, 4);
  const sources = dedupeSources(hits.map((hit) => hit.source));

  return {
    role: laneRoleForLane(lane),
    lane,
    title: expert?.label ?? lane,
    summary: expert?.summary ?? lane,
    text: hits.length
      ? hits.map((hit) => hit.text).join("\n\n---\n\n")
      : `${expert?.summary ?? lane}\n\nNo direct evidence matched this lane, so the expert stays on standby.`,
    sources,
    hits,
    confidence: computeConfidence(hits),
  };
}

function buildLaneAppSummaries(lane: StudioLane): AppSummary[] {
  const expert = getStudioDomainByLane(lane);
  const productSlugSet = new Set(expert?.productSlugs ?? []);

  const catalogSummaries = CATALOG_APPS.filter((app) => productSlugSet.has(app.slug)).map(toCatalogAppSummary);
  const familySummaries = STUDIO_APP_FAMILIES.filter((family) => family.lane === lane).map(toFamilySummary);

  return dedupeAppSummaries([...catalogSummaries, ...familySummaries]);
}

function scoreAppSummaries(
  summaries: readonly AppSummary[],
  tokens: readonly string[],
  normalizedQuery: string,
  boost: number,
): RetrievalHit[] {
  return summaries
    .map((summary) => {
      const searchableText = [
        summary.name,
        summary.slug,
        summary.tagline,
        summary.description,
        summary.fullDescription,
        summary.category,
        summary.statusLabel,
        summary.techStack.join(" "),
        summary.features.join(" "),
        summary.monetization,
        summary.keywords.join(" "),
        summary.aliases.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      let score = scoreTextMatch(searchableText, tokens);
      if (normalizedQuery.includes(summary.name.toLowerCase())) {
        score += 8;
      }
      if (normalizedQuery.includes(summary.slug.toLowerCase())) {
        score += 6;
      }
      score = Math.round(score * boost * 100) / 100;

      return {
        score,
        kind: "app" as const,
        text: [
          `PRODUCT: ${summary.name} (${summary.statusLabel})`,
          `Tagline: ${summary.tagline}`,
          `Description: ${summary.fullDescription || summary.description}`,
          `Features: ${summary.features.join(", ") || summary.description}`,
          `Tech Stack: ${summary.techStack.join(", ") || "Not listed"}`,
          `URL: ${summary.path}`,
        ].join("\n"),
        source: { title: summary.name, url: summary.path } satisfies ChatSource,
        appSlug: summary.slug,
      };
    })
    .filter((match) => match.score > 0);
}

function scoreDocs(
  tokens: readonly string[],
  normalizedQuery: string,
  boost: number,
  allowedCategories?: readonly DocsArticle["category"][],
): RetrievalHit[] {
  return docsArticles
    .filter((doc) => !allowedCategories?.length || allowedCategories.includes(doc.category))
    .map((doc) => {
      const searchableText = [doc.slug, doc.category, doc.summary, doc.body].join(" ").toLowerCase();
      let score = scoreTextMatch(searchableText, tokens);
      if (normalizedQuery.includes(doc.slug.toLowerCase())) {
        score += 6;
      }
      if (normalizedQuery.includes(doc.category.toLowerCase())) {
        score += 4;
      }
      score = Math.round(score * boost * 100) / 100;
      return {
        score,
        kind: "doc" as const,
        text: `DOC: ${doc.slug} (${doc.category})\nSummary: ${doc.summary}\nContent: ${doc.body}\nURL: /docs/${doc.slug}`,
        source: { title: `Doc: ${doc.slug}`, url: `/docs/${doc.slug}` } satisfies ChatSource,
        docSlug: doc.slug,
      };
    })
    .filter((match) => match.score > 0);
}

function scoreFaqs(
  tokens: readonly string[],
  normalizedQuery: string,
  boost: number,
  allowedTerms: readonly string[] = [],
): RetrievalHit[] {
  return siteFaqEntries
    .map((faq) => {
      const searchableText = [faq.question, faq.answer, faq.tags.join(" ")].join(" ").toLowerCase();
      let score = scoreTextMatch(searchableText, tokens);
      if (normalizedQuery.includes(faq.id.toLowerCase())) {
        score += 5;
      }
      if (faq.tags.some((tag) => normalizedQuery.includes(tag.toLowerCase()))) {
        score += 3;
      }
      if (allowedTerms.some((term) => searchableText.includes(term.toLowerCase()))) {
        score += 1.5;
      }
      score = Math.round(score * boost * 100) / 100;
      return {
        score,
        kind: "faq" as const,
        text: `FAQ: ${faq.question}\nAnswer: ${faq.answer}\nURL: ${faq.url}`,
        source: { title: `FAQ: ${faq.question}`, url: faq.url } satisfies ChatSource,
        faqId: faq.id,
      };
    })
    .filter((match) => match.score > 0);
}

function evaluateRetrieval(hits: readonly RetrievalHit[], route: RetrievalRoute): RetrievalEvaluation {
  const confidence = computeConfidence(hits);
  const threshold =
    route === "support" ? 0.12 : route === "docs" ? 0.14 : route === "faq" ? 0.14 : route === "products" ? 0.18 : 0.16;
  if (!hits.length) {
    return {
      verdict: "needs_fallback",
      confidence,
      reason: "no grounded matches",
    };
  }
  if (confidence < threshold) {
    return {
      verdict: "needs_fallback",
      confidence,
      reason: `confidence ${confidence.toFixed(2)} below threshold ${threshold.toFixed(2)}`,
    };
  }
  return {
    verdict: "approved",
    confidence,
    reason: `confidence ${confidence.toFixed(2)} meets threshold ${threshold.toFixed(2)}`,
  };
}

function computeConfidence(hits: readonly RetrievalHit[]): number {
  if (hits.length === 0) {
    return 0;
  }

  const top = hits[0]?.score || 0;
  const support = hits.slice(1).reduce((total, hit) => total + hit.score, 0);
  return Math.min(1, (top * 0.8 + support * 0.2) / 12);
}

function formatSection(section: StudioExpertSection) {
  return [section.title.toUpperCase(), `Summary: ${section.summary}`, section.text].join("\n");
}

function dedupeStrings(values: readonly string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function dedupeSources(sources: readonly ChatSource[]) {
  const seen = new Map<string, ChatSource>();
  for (const source of sources) {
    if (!seen.has(source.url)) {
      seen.set(source.url, source);
    }
  }
  return [...seen.values()];
}

function dedupeHits(hits: readonly RetrievalHit[]) {
  const seen = new Map<string, RetrievalHit>();
  for (const hit of hits) {
    const key = `${hit.kind}:${hit.source.url}`;
    if (!seen.has(key) || (seen.get(key)?.score ?? 0) < hit.score) {
      seen.set(key, hit);
    }
  }
  return [...seen.values()].sort((left, right) => right.score - left.score);
}

function dedupeAppSummaries(summaries: readonly AppSummary[]) {
  const seen = new Map<string, AppSummary>();
  for (const summary of summaries) {
    if (!seen.has(summary.slug) || (seen.get(summary.slug)?.tagline.length ?? 0) < summary.tagline.length) {
      seen.set(summary.slug, summary);
    }
  }
  return [...seen.values()];
}

function buildSearchHints(route: RetrievalRoute, selectedLanes: readonly StudioLane[]): string[] {
  const hints = new Set<string>();
  hints.add("/about");
  hints.add("/contact");

  if (route === "docs" || route === "support") {
    hints.add("/docs");
  }

  if (route === "products" || route === "faq" || route === "general") {
    hints.add("/apps");
  }

  for (const lane of selectedLanes) {
    if (lane === "consumer_utility" || lane === "finance" || lane === "guided_support") {
      hints.add("/apps");
    }
  }

  return [...hints];
}

function collectFallbackSources(
  query: string,
  decision: StudioSupervisorDecision | undefined,
  searchHints: readonly string[],
): ChatSource[] {
  const links = new Map<string, ChatSource>();
  const add = (title: string, url: string | undefined | null) => {
    if (!url || links.has(url)) {
      return;
    }

    links.set(url, { title, url });
  };

  add("About Northern Step Studio", "/about");
  add("Apps", "/apps");
  add("Docs", "/docs");
  add("Contact", "/contact");

  if (query.includes("contact") || query.includes("support")) {
    add("Contact", "/contact");
  }

  if (query.includes("doc") || query.includes("setup") || query.includes("how") || query.includes("fix")) {
    add("Docs", "/docs");
  }

  if (query.includes("about") || query.includes("studio") || query.includes("brand") || query.includes("mission")) {
    add("About Northern Step Studio", "/about");
  }



  for (const lane of decision?.selectedLanes ?? []) {
    const expert = getStudioDomainByLane(lane);


    if (lane === "consumer_utility") {
      add("NexusBuild", getStudioProductFamily("nexusbuild")?.path ?? "/apps/nexusbuild");
      add("ProvLy", getStudioProductFamily("provly")?.path ?? "/apps/provly");
      continue;
    }

    if (lane === "finance") {
      add("NooBS Investing", getStudioProductFamily("noobs-investing")?.path ?? "/apps/noobs-investing");
      add("PasoScore", getStudioProductFamily("pasoscore")?.path ?? "/apps/pasoscore");
      continue;
    }

    if (lane === "guided_support") {
      add("Neuromove", getStudioProductFamily("neuromoves")?.path ?? "/apps/neuromoves");
    }
  }

  for (const hint of searchHints) {
    if (hint === "/about") {
      add("About Northern Step Studio", hint);
    } else if (hint === "/apps") {
      add("Apps", hint);
    } else if (hint === "/docs") {
      add("Docs", hint);
    } else if (hint === "/contact") {
      add("Contact", hint);

    }
  }

  return [...links.values()].slice(0, 6);
}

function buildConversationSignal(message: string, history: readonly ChatMessage[]) {
  const recentUserMessages = history
    .filter((entry) => entry.role === "user")
    .slice(-2)
    .map((entry) => entry.content);

  return [message, ...recentUserMessages].filter(Boolean).join(" ").trim();
}

function laneRoleForLane(lane: StudioLane): Exclude<StudioAgentRole, "supervisor" | "studio-expert" | "verifier"> {
  switch (lane) {
    case "consumer_utility":
      return "utility-expert";
    case "finance":
      return "finance-expert";
    case "guided_support":
      return "support-expert";
  }
}

function scoreLane(signal: string, route: RetrievalRoute, expert: (typeof STUDIO_EXPERTS)[number]) {
  const normalized = signal.toLowerCase();
  let score = 0;

  for (const keyword of expert.keywords) {
    if (normalized.includes(keyword.toLowerCase())) {
      score += 2;
    }
  }

  for (const alias of expert.aliases) {
    if (normalized.includes(alias.toLowerCase())) {
      score += 3.5;
    }
  }

  for (const slug of expert.productSlugs) {
    if (normalized.includes(slug.toLowerCase())) {
      score += 4;
    }
  }

  if (route === "products" && expert.lane !== "guided_support") {
    score += 0.75;
  }

  if (route === "docs" && expert.lane === "consumer_utility") {
    score += 0.9;
  }



  if (route === "faq" && expert.lane === "consumer_utility") {
    score += 0.75;
  }

  return Math.round(score * 100) / 100;
}

function classifyQuery(query: string): RetrievalRoute {
  const normalized = query.toLowerCase();
  if (
    normalized.includes("contact") ||
    normalized.includes("support") ||
    normalized.includes("help") ||
    normalized.includes("email")
  ) {
    return "support";
  }

  if (
    normalized.includes("price") ||
    normalized.includes("pricing") ||
    normalized.includes("cost") ||
    normalized.includes("how much")
  ) {
    return "products";
  }

  if (
    normalized.includes("faq") ||
    normalized.includes("question") ||
    normalized.includes("what is") ||
    normalized.includes("what do")
  ) {
    return "faq";
  }

  if (
    normalized.includes("doc") ||
    normalized.includes("documentation") ||
    normalized.includes("how do") ||
    normalized.includes("install") ||
    normalized.includes("setup") ||
    normalized.includes("fix") ||
    normalized.includes("troubleshoot")
  ) {
    return "docs";
  }

  if (normalized.includes("app") || normalized.includes("product") || normalized.includes("feature") || normalized.includes("status")) {
    return "products";
  }

  return "general";
}

function tokenize(query: string) {
  return Array.from(new Set(query.toLowerCase().match(/[a-z0-9]+/g) ?? [])).filter(
    (token) => token.length > 2,
  );
}

function scoreTextMatch(text: string, tokens: readonly string[]) {
  let score = 0;

  for (const token of tokens) {
    if (text.includes(token)) {
      score += 1;
    }
  }

  return score;
}

function truncateText(value: string, maxLength: number) {
  return value.length <= maxLength ? value : `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function laneBoost(route: RetrievalRoute, lane: StudioLane) {
  if (route === "products") {
    return lane === "consumer_utility" ? 1.45 : lane === "finance" ? 1.3 : 1.15;
  }

  if (route === "docs") {
    return lane === "consumer_utility" ? 1.3 : lane === "finance" ? 1.15 : 1.25;
  }

  if (route === "support") {
    return 1.2;
  }

  if (route === "faq") {
    return lane === "consumer_utility" ? 1.3 : lane === "finance" ? 1.2 : 1.1;
  }

  return lane === "consumer_utility" ? 1.15 : lane === "finance" ? 1.05 : 1;
}

function toCatalogAppSummary(app: CatalogApp): AppSummary {
  return {
    name: app.name,
    slug: app.slug,
    path: `/apps/${app.slug}`,
    tagline: app.tagline,
    description: app.description,
    fullDescription: app.fullDescription,
    category: app.category,
    statusLabel: app.statusLabel,
    techStack: app.techStack,
    features: app.features,
    monetization: app.monetization,
    keywords: [app.category, app.statusLabel, app.platform, ...app.features],
    aliases: [app.name, app.slug],
    kind: "catalog",
  };
}

function toFamilySummary(family: StudioAppFamily): AppSummary {
  return {
    name: family.name,
    slug: family.slug,
    path: family.path,
    tagline: family.summary,
    description: family.summary,
    fullDescription: family.summary,
    category: family.lane,
    statusLabel: "Public",
    techStack: [],
    features: [family.summary],
    monetization: "Free",
    keywords: family.keywords,
    aliases: family.aliases,
    kind: "family",
  };
}

function inferConfidenceLabel(_mode: "gemini" | "fallback", retrievalConfidence: number): StudioConfidence {
  if (retrievalConfidence >= 0.45) {
    return "high";
  }

  if (retrievalConfidence >= 0.22) {
    return "medium";
  }

  return "low";
}

function searchKnowledge(query: string, route: RetrievalRoute, tokens = tokenize(query)): RetrievalBundle {
  const normalizedQuery = query.toLowerCase();
  const appBoost = route === "products" ? 1.35 : route === "general" ? 1.05 : 0.95;
  const familyBoost = route === "products" ? 1.3 : route === "general" ? 1.1 : 0.95;
  const docBoost = route === "docs" || route === "support" ? 1.35 : route === "faq" ? 1.15 : 1;
  const faqBoost = route === "faq" || route === "support" ? 1.4 : route === "docs" ? 1.1 : 1;

  const appHits = scoreAppSummaries(
    dedupeAppSummaries(CATALOG_APPS.map(toCatalogAppSummary)),
    tokens,
    normalizedQuery,
    appBoost,
  );
  const familyHits = scoreAppSummaries(
    dedupeAppSummaries(STUDIO_APP_FAMILIES.map(toFamilySummary)),
    tokens,
    normalizedQuery,
    familyBoost,
  );
  const docHits = scoreDocs(tokens, normalizedQuery, docBoost);
  const faqHits = scoreFaqs(tokens, normalizedQuery, faqBoost);

  const pool = [...docHits, ...faqHits, ...familyHits, ...appHits].sort((left, right) => right.score - left.score).slice(0, 6);

  const parts = [
    docHits.length ? `SITE DOCS\n${docHits.slice(0, 3).map((hit) => hit.text).join("\n\n---\n\n")}` : "",
    faqHits.length ? `SITE FAQS\n${faqHits.slice(0, 3).map((hit) => hit.text).join("\n\n---\n\n")}` : "",
    [...familyHits, ...appHits].length
      ? `PRODUCT CONTEXT\n${[...familyHits, ...appHits]
          .slice(0, 4)
          .map((hit) => hit.text)
          .join("\n\n---\n\n")}`
      : "",
  ].filter(Boolean);

  return {
    text: parts.join("\n\n===\n\n"),
    sources: pool.map((hit) => hit.source),
    confidence: computeConfidence(pool),
    hits: pool,
    searchHints: buildSearchHints(route, []),
    route,
    evaluation: evaluateRetrieval(pool, route),
  };
}
