import { CATALOG_APPS } from "../shared/data/appsCatalog";
import { docsArticles } from "../shared/data/docs";
import {
  STUDIO_DOMAINS,
  STUDIO_GLOBAL_CONTEXT,
  STUDIO_IDENTITY,
  getStudioDomainByLane,
  type StudioDomainConfig,
  type StudioLane,
} from "../shared/data/studioKnowledge";

export type StudioChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatSource = {
  title: string;
  url: string;
};

export type StudioConfidence = "low" | "medium" | "high";

export type StudioSupervisorDecision = Readonly<{
  primaryLane: StudioLane;
  selectedLanes: StudioLane[];
  crossDomain: boolean;
  confidence: StudioConfidence;
  intentSummary: string;
  notes: readonly string[];
}>;

export type StudioKnowledgeBundle = Readonly<{
  text: string;
  sources: ChatSource[];
  sections: Array<{
    lane: StudioLane;
    label: string;
    summary: string;
    theme: StudioDomainConfig["theme"];
    content: string;
  }>;
}>;

const DEFAULT_LANES: StudioLane[] = ["service_automation", "consumer_utility"];
const MAX_SELECTED_LANES = 3;
const MAX_ITEMS_PER_LANE = 2;

const GENERIC_STUDIO_HINTS = [
  "how does nstep help",
  "what can nstep do",
  "what does nstep do",
  "how can nstep help",
  "save time",
  "save me time",
  "studio wide",
  "portfolio",
  "product suite",
  "across the studio",
  "nstep studio",
  "northern step studio",
];

const HYPE_WORDS = ["guarantee", "always", "never", "best", "perfect", "instant", "magic"];

export function buildStudioSupervisorDecision(message: string, history: StudioChatMessage[]): StudioSupervisorDecision {
  const searchText = buildSearchText(message, history);
  const rankedDomains = STUDIO_DOMAINS.map((domain) => scoreStudioDomain(domain, searchText))
    .sort((left, right) => right.score - left.score);

  const positiveDomains = rankedDomains.filter((domain) => domain.score > 0);
  const hasGenericStudioHint = GENERIC_STUDIO_HINTS.some((hint) => searchText.includes(hint));

  let selectedLanes = positiveDomains.map((domain) => domain.lane);

  if (selectedLanes.length === 0) {
    selectedLanes = [...DEFAULT_LANES];
  } else if (hasGenericStudioHint || positiveDomains.length > 1 || rankedDomains[0]?.score < 6) {
    selectedLanes = selectedLanes.slice(0, MAX_SELECTED_LANES);
  } else {
    selectedLanes = selectedLanes.slice(0, 1);
  }

  const primaryLane = selectedLanes[0] || DEFAULT_LANES[0];
  const crossDomain = selectedLanes.length > 1;
  const topScore = rankedDomains[0]?.score ?? 0;

  const confidence: StudioConfidence =
    selectedLanes.length === 1 && topScore >= 7
      ? "high"
      : selectedLanes.length > 1 || topScore >= 4
        ? "medium"
        : "low";

  const primaryDomain = getStudioDomainByLane(primaryLane);
  const intentSummary = primaryDomain
    ? crossDomain
      ? `Cross-domain studio answer spanning ${selectedLanes.map((lane) => getStudioDomainByLane(lane)?.label || lane).join(", ")}`
      : primaryDomain.label
    : "Studio-wide general inquiry";

  const notes = rankedDomains
    .slice(0, Math.max(1, selectedLanes.length))
    .map((domain) => {
      const label = getStudioDomainByLane(domain.lane)?.label || domain.lane;
      const matched = domain.matches.length ? `matched ${domain.matches.join(", ")}` : "matched studio context";
      return `${label}: ${matched}`;
    });

  return {
    primaryLane,
    selectedLanes,
    crossDomain,
    confidence,
    intentSummary,
    notes,
  };
}

export function buildStudioKnowledgeBundle(
  message: string,
  history: StudioChatMessage[],
  decision: StudioSupervisorDecision,
): StudioKnowledgeBundle {
  const searchText = buildSearchText(message, history);
  const sources: ChatSource[] = [];
  const sections = decision.selectedLanes.map((lane) => {
    const domain = getStudioDomainByLane(lane);

    if (!domain) {
      return null;
    }

    const relevantApps = selectRelevantApps(domain, searchText);
    const relevantDocs = selectRelevantDocs(domain, searchText);
    const content = [
      `### ${domain.label}`,
      `Focus: ${domain.summary}`,
      `Studio fit: ${domain.productNames.join(", ") || "Studio products"}`,
      "",
      "Relevant products:",
      ...(relevantApps.length
        ? relevantApps.map((app) => {
            sources.push({ title: app.name, url: `/apps/${app.slug}` });
            return formatAppSection(app);
          })
        : ["- No product match found in this lane, so use the studio context and related documentation."]
      ),
      "",
      "Relevant docs:",
      ...(relevantDocs.length
        ? relevantDocs.map((doc) => {
            sources.push({ title: `Doc: ${doc.slug}`, url: `/docs/${doc.slug}` });
            return formatDocSection(doc);
          })
        : ["- No lane-specific doc matched, so use the studio principles and product summaries."]
      ),
    ]
      .filter(Boolean)
      .join("\n");

    return {
      lane,
      label: domain.label,
      summary: domain.summary,
      theme: domain.theme,
      content,
    };
  }).filter((section): section is NonNullable<typeof section> => section !== null);

  const bundleText = [
    `STUDIO IDENTITY`,
    `Name: ${STUDIO_IDENTITY.name}`,
    `Mission: ${STUDIO_IDENTITY.mission}`,
    `Philosophy: ${STUDIO_IDENTITY.philosophy}`,
    `Values: ${STUDIO_IDENTITY.values.join(", ")}`,
    `History: ${STUDIO_IDENTITY.history}`,
    "",
    `GLOBAL CONTEXT`,
    `Summary: ${STUDIO_GLOBAL_CONTEXT.summary}`,
    `Audience: ${STUDIO_GLOBAL_CONTEXT.audience}`,
    `Principles: ${STUDIO_GLOBAL_CONTEXT.principles.join(" | ")}`,
    "",
    `SUPERVISOR DECISION`,
    `Primary lane: ${decision.primaryLane}`,
    `Selected lanes: ${decision.selectedLanes.join(", ")}`,
    `Cross-domain: ${decision.crossDomain ? "yes" : "no"}`,
    `Intent: ${decision.intentSummary}`,
    `Confidence: ${decision.confidence}`,
    `Notes: ${decision.notes.join(" | ")}`,
    "",
    `EXPERT MODULES`,
    ...sections.map((section) => section.content),
  ]
    .filter((line) => Boolean(line))
    .join("\n");

  return {
    text: bundleText,
    sources: dedupeSources(sources),
    sections,
  };
}

export function buildStudioPrompt(
  message: string,
  history: StudioChatMessage[],
  decision: StudioSupervisorDecision,
  bundle: StudioKnowledgeBundle,
) {
  const conversationHistory = history.length
    ? history.map((entry) => `${entry.role.toUpperCase()}: ${entry.content}`).join("\n")
    : "No prior conversation.";

  return `
You are "NStep AI", the public assistant for Northern Step Studio.
You are operating under a studio supervisor that selected the relevant expert modules for this question.

PUBLIC RESPONSE RULES:
- Answer only with grounded public information from the supplied studio context.
- Keep the tone direct, concise, and practical.
- If the question spans multiple products, synthesize the relevant products naturally in one answer.
- Do not mention internal routing, scores, confidence values, or retrieval mechanics.
- Do not expose private, admin, or user data.
- If evidence is weak, say so plainly and point to the most relevant public page.
- Prefer useful systems over hype, clarity over cleverness, and practical next steps over vague promises.

SUPERVISOR DECISION:
- Primary lane: ${decision.primaryLane}
- Selected lanes: ${decision.selectedLanes.join(", ")}
- Cross-domain: ${decision.crossDomain ? "yes" : "no"}
- Intent: ${decision.intentSummary}
- Confidence: ${decision.confidence}

STUDIO CONTEXT:
${bundle.text}

PRIOR CONVERSATION:
${conversationHistory}

CURRENT USER QUESTION:
${message}

RESPONSE FORMAT:
Return a concise public answer. If the answer should mention multiple products, keep the synthesis clear and compact.
`.trim();
}

export function evaluateStudioAnswer(
  answer: string,
  decision: StudioSupervisorDecision,
  bundle: StudioKnowledgeBundle,
): { confidence: StudioConfidence; warning?: string } {
  const normalizedAnswer = answer.toLowerCase();
  const warnings: string[] = [];
  let confidence: StudioConfidence = decision.confidence;

  if (decision.selectedLanes.length > 1 && confidence === "high") {
    confidence = "medium";
  }

  if (bundle.sources.length === 0 && confidence !== "low") {
    confidence = "low";
    warnings.push("Response was generated from studio context without a lane-specific source match.");
  }

  if (HYPE_WORDS.some((word) => normalizedAnswer.includes(word))) {
    warnings.push("Response language drifted toward hype instead of practical guidance.");
    if (confidence === "high") {
      confidence = "medium";
    }
  }

  const selectedProductNames = decision.selectedLanes
    .flatMap((lane) => getStudioDomainByLane(lane)?.productNames || [])
    .map((value) => value.toLowerCase());

  if (
    selectedProductNames.length > 0 &&
    !selectedProductNames.some((productName) => normalizedAnswer.includes(productName.toLowerCase())) &&
    confidence === "high"
  ) {
    confidence = "medium";
    warnings.push("Response did not name the selected product family directly.");
  }

  return {
    confidence,
    warning: warnings.length ? warnings.join(" ") : undefined,
  };
}

export function getStudioFallbackResponse(
  query: string,
  decision?: Pick<StudioSupervisorDecision, "selectedLanes" | "primaryLane">,
  warning?: string,
) {
  const normalizedQuery = query.toLowerCase();
  const selectedLane = decision?.selectedLanes[0] || decision?.primaryLane;

  if (normalizedQuery.includes("contact") || normalizedQuery.includes("support")) {
    return {
      answer:
        "You can reach Northern Step Studio through the Contact page. For studio and partnerships, use hello@northernstepstudio.com. For product support, use support@northernstepstudio.com.",
      sources: [{ title: "Contact Us", url: "/contact" }],
      mode: "fallback" as const,
      confidence: "low" as const,
      warning,
    };
  }

  if (selectedLane === "service_automation") {
    return {
      answer:
        "Lead Recovery Service is our missed-call text-back workflow for local service businesses. If you want the quickest path, start with the Lead Recovery page and the Contact page for setup questions.",
      sources: [
        { title: "Lead Recovery Service", url: "/apps/missed-call-text-back" },
        { title: "Contact Us", url: "/contact" },
      ],
      mode: "fallback" as const,
      confidence: "low" as const,
      warning,
    };
  }

  if (selectedLane === "consumer_utility") {
    return {
      answer:
        "NexusBuild helps with PC build planning, and ProvLy helps with home inventory and claim-ready records. If you're comparing tools, start with the Apps page and the two product pages that match your goal.",
      sources: [
        { title: "Apps", url: "/apps" },
        { title: "NexusBuild", url: "/apps/nexusbuild" },
        { title: "ProvLy", url: "/apps/provly" },
      ],
      mode: "fallback" as const,
      confidence: "low" as const,
      warning,
    };
  }

  if (selectedLane === "finance") {
    return {
      answer:
        "NooBS Investing and PasoScore cover guided financial literacy and credit planning. The best next step is to read the app pages or reach out from Contact if you want help choosing which one fits your goal.",
      sources: [
        { title: "Apps", url: "/apps" },
        { title: "NooBS Investing", url: "/apps/noobs-investing" },
        { title: "PasoScore", url: "/apps/pasoscore" },
      ],
      mode: "fallback" as const,
      confidence: "low" as const,
      warning,
    };
  }

  if (selectedLane === "guided_support") {
    return {
      answer:
        "Neuromove is the guided support product for structured routines and progress tracking. If that's the area you're asking about, the app page and Contact page are the right places to start.",
      sources: [
        { title: "Neuromove", url: "/apps/neuromoves" },
        { title: "Contact Us", url: "/contact" },
      ],
      mode: "fallback" as const,
      confidence: "low" as const,
      warning,
    };
  }

  return {
    answer:
      "I'm sorry, I couldn't find a specific answer to that right now. Please explore the Apps page, documentation, or contact our team for direct assistance.",
    sources: [
      { title: "Apps", url: "/apps" },
      { title: "Documentation", url: "/docs" },
      { title: "Contact Us", url: "/contact" },
    ],
    mode: "fallback" as const,
    confidence: "low" as const,
    warning,
  };
}

function buildSearchText(message: string, history: StudioChatMessage[]) {
  const historyText = history
    .slice(-4)
    .map((entry) => entry.content)
    .join(" ");

  return `${message} ${historyText}`.toLowerCase();
}

function scoreStudioDomain(domain: StudioDomainConfig, searchText: string) {
  const matches: string[] = [];
  let score = 0;

  for (const alias of domain.aliases) {
    const normalizedAlias = alias.toLowerCase();
    if (searchText.includes(normalizedAlias)) {
      score += normalizedAlias.length > 7 ? 4 : 3;
      matches.push(alias);
    }
  }

  for (const keyword of domain.keywords) {
    const normalizedKeyword = keyword.toLowerCase();
    if (searchText.includes(normalizedKeyword)) {
      score += normalizedKeyword.length > 7 ? 3 : 2;
      matches.push(keyword);
    }
  }

  for (const productName of domain.productNames) {
    const normalizedProductName = productName.toLowerCase();
    if (searchText.includes(normalizedProductName)) {
      score += 6;
      matches.push(productName);
    }
  }

  for (const slug of domain.productSlugs) {
    if (searchText.includes(slug.toLowerCase())) {
      score += 6;
      matches.push(slug);
    }
  }

  if (domain.lane === "service_automation" && (searchText.includes("save time") || searchText.includes("faster"))) {
    score += 2;
    matches.push("time savings");
  }

  if (domain.lane === "consumer_utility" && (searchText.includes("save time") || searchText.includes("organize"))) {
    score += 3;
    matches.push("organization");
  }

  if (domain.lane === "finance" && (searchText.includes("credit") || searchText.includes("invest") || searchText.includes("money"))) {
    score += 3;
    matches.push("finance context");
  }

  if (domain.lane === "guided_support" && (searchText.includes("therapy") || searchText.includes("routine") || searchText.includes("parent"))) {
    score += 3;
    matches.push("support context");
  }

  return {
    lane: domain.lane,
    score,
    matches,
  };
}

function selectRelevantApps(domain: StudioDomainConfig, searchText: string) {
  const laneApps = CATALOG_APPS.filter((app) => domain.productSlugs.includes(app.slug));
  const scoredApps = laneApps
    .map((app) => ({
      app,
      score: scoreApp(app, searchText),
    }))
    .sort((left, right) => right.score - left.score);

  const selectedApps = scoredApps.filter((entry) => entry.score > 0).slice(0, MAX_ITEMS_PER_LANE);

  if (selectedApps.length > 0) {
    return selectedApps.map((entry) => entry.app);
  }

  return scoredApps.slice(0, MAX_ITEMS_PER_LANE).map((entry) => entry.app);
}

function selectRelevantDocs(domain: StudioDomainConfig, searchText: string) {
  const laneDocs = docsArticles
    .filter((doc) => domain.docCategories.includes(doc.category))
    .map((doc) => ({
      doc,
      score: scoreDoc(doc, searchText),
    }))
    .sort((left, right) => right.score - left.score)
    ;

  const selectedDocs = laneDocs.filter((entry) => entry.score > 0).slice(0, MAX_ITEMS_PER_LANE);

  if (selectedDocs.length > 0) {
    return selectedDocs.map((entry) => entry.doc);
  }

  return laneDocs.slice(0, MAX_ITEMS_PER_LANE).map((entry) => entry.doc);
}

function scoreApp(app: (typeof CATALOG_APPS)[number], searchText: string) {
  let score = 0;
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

  const tokens = tokenize(searchText);
  score += scoreTextMatch(searchableText, tokens);

  if (searchText.includes(app.name.toLowerCase())) {
    score += 8;
  }

  if (searchText.includes(app.slug.toLowerCase())) {
    score += 6;
  }

  if (searchText.includes(app.category.toLowerCase())) {
    score += 2;
  }

  return score;
}

function scoreDoc(doc: (typeof docsArticles)[number], searchText: string) {
  let score = 0;
  const searchableText = [doc.slug, doc.category, doc.summary, doc.body].join(" ").toLowerCase();
  const tokens = tokenize(searchText);
  score += scoreTextMatch(searchableText, tokens);

  if (searchText.includes(doc.slug.toLowerCase())) {
    score += 6;
  }

  if (searchText.includes(doc.category.toLowerCase())) {
    score += 4;
  }

  return score;
}

function formatAppSection(app: (typeof CATALOG_APPS)[number]) {
  return [
    `- ${app.name} (${app.statusLabel})`,
    `  Tagline: ${app.tagline}`,
    `  Summary: ${app.fullDescription || app.description}`,
    `  Features: ${app.features.join(", ")}`,
    `  URL: /apps/${app.slug}`,
  ].join("\n");
}

function formatDocSection(doc: (typeof docsArticles)[number]) {
  return [
    `- ${doc.slug} (${doc.category})`,
    `  Summary: ${doc.summary}`,
    `  Content: ${doc.body}`,
    `  URL: /docs/${doc.slug}`,
  ].join("\n");
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

function tokenize(query: string) {
  return Array.from(new Set(query.toLowerCase().match(/[a-z0-9]+/g) ?? [])).filter(
    (token) => token.length > 2,
  );
}

function dedupeSources(sources: ChatSource[]) {
  const seen = new Set<string>();
  return sources.filter((source) => {
    const key = `${source.title}|${source.url}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
