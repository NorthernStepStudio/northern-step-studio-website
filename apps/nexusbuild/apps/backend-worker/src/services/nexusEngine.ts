import { getBudgetBuild, PartSpec } from "../data/parts";
import { AIService, type AIServiceConfig } from "./aiService";
import {
  searchParts,
  formatPartInfo,
  TERMINOLOGY,
  TROUBLESHOOTING,
  COMPATIBILITY,
  UPGRADE_ADVICE,
  RESPONSE_PATTERNS,
  BUILD_ARCHETYPES,
  GUIDE_KNOWLEDGE,
  SYNONYM_MAP,
  WORKSTATION_KNOWLEDGE,
  MONITOR_KNOWLEDGE,
  PSU_KNOWLEDGE,
  AUDIO_KNOWLEDGE,
  PREBUILT_KNOWLEDGE,
  LAPTOP_KNOWLEDGE,
  getKnowledgeStats,
} from "./knowledge";

const ai = new AIService();

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ConversationContext {
  awaitingType?: string;
  extractedBudget?: number;
  extractedUseCase?: string;
  lastQuestion?: string;
  recentEvents?: any[];
  currentBuild?: Record<string, PartSpec>;
}

export interface NexusResponse {
  text: string;
  suggestions: string[];
  build?: {
    parts: Record<string, any>;
    total: number;
    reasoning: string;
  };
  analysis?: any;
  context?: ConversationContext;
}

type GeneralChatResponse = {
  text: string;
  suggestions: string[];
  context?: Record<string, unknown>;
};

const normalizeBuildType = (
  value: unknown,
): "gaming" | "streaming" | "work" | null => {
  const normalized = String(value ?? "")
    .toLowerCase()
    .trim();
  if (!normalized) {
    return null;
  }

  if (normalized.includes("stream")) {
    return "streaming";
  }

  if (
    normalized.includes("work") ||
    normalized.includes("edit") ||
    normalized.includes("render") ||
    normalized.includes("creator") ||
    normalized.includes("productivity")
  ) {
    return "work";
  }

  if (normalized.includes("game")) {
    return "gaming";
  }

  return null;
};

export async function processChat(
  messages: ChatMessage[],
  context: ConversationContext = {},
  aiConfig: AIServiceConfig = {},
): Promise<NexusResponse> {
  const lastMsg = messages[messages.length - 1]?.content.toLowerCase() || "";

  // Intent detection
  const isBuild = /build|new pc|setup/i.test(lastMsg);
  const isUpgrade = /upgrade|better|improve/i.test(lastMsg);
  const isReview = /review|analyze|check|rate my build|how is my/i.test(
    lastMsg,
  );
  const isFPS = /fps|frames|how many|perform|run.*game/i.test(lastMsg);

  const budgetMatch =
    lastMsg.match(/\$(\d+)/) || lastMsg.match(/(\d+)\s*budget/);
  const messageBudget = budgetMatch ? parseInt(budgetMatch[1]) : null;
  const budget = messageBudget ?? context.extractedBudget;

  // 1. FPS DEEP DIVE
  if (isFPS && context.currentBuild?.gpu) {
    const review = await ai.analyzeBuild(
      context.currentBuild,
      budget,
      aiConfig,
    );
    let fpsText =
      "📊 **FPS Deep Dive**\n\nEstimated performance for your selection (1080p Ultra):\n\n";

    Object.entries(review.fpsEstimates).forEach(([game, frames]) => {
      fpsText += `- **${game}**: ~${frames} FPS\n`;
    });

    fpsText +=
      "\n*Note: High-refresh performance depends on both CPU and GPU balance.*";

    return {
      text: fpsText,
      suggestions: [
        "Check bottlenecks",
        "Is this good for 1440p?",
        "Save build",
      ],
      analysis: review,
      context,
    };
  }

  // 2. BUILD REVIEW (ROAST MODE)
  if (isReview && context.currentBuild) {
    const review = await ai.analyzeBuild(
      context.currentBuild,
      budget,
      aiConfig,
    );
    let reviewText = `## Build Analysis (Score: ${review.score}/100)\n\n`;

    reviewText += `**Summary:** ${review.summary}\n\n`;

    if (review.pros.length)
      reviewText += `✅ **Pros:**\n${review.pros.map((p: string) => `- ${p}`).join("\n")}\n\n`;
    if (review.cons.length)
      reviewText += `⚠️ **Warnings:**\n${review.cons.map((c: string) => `- ${c}`).join("\n")}\n\n`;
    if (review.bottlenecks.length)
      reviewText += `🔥 **Expert Critique:**\n${review.bottlenecks.map((b: string) => `- ${b}`).join("\n")}\n\n`;

    return {
      text: reviewText,
      suggestions: ["How many FPS?", "Upgrade suggestions", "Save build"],
      analysis: review,
      context,
    };
  }

  // 3. NEW BUILD GENERATION
  if (isBuild || messageBudget !== null) {
    const buildBudget = messageBudget ?? budget;

    if (!buildBudget) {
      context.awaitingType = "budget";
      return {
        text: "I can help you build a PC! What's your target budget? (e.g., $1000)",
        suggestions: ["$800", "$1200", "$1500", "$2000"],
        context,
      };
    }

    const buildUseCase =
      normalizeBuildType(context.extractedUseCase) ||
      normalizeBuildType(context.currentBuild?.useCase) ||
      normalizeBuildType(findUseCaseKey(lastMsg)) ||
      "gaming";
    const build = getBudgetBuild(buildBudget, buildUseCase);
    const total = build.reduce((sum, p) => sum + p.price, 0);
    const useCaseLabel =
      buildUseCase === "streaming"
        ? "Streaming"
        : buildUseCase === "work"
          ? "Workstation"
          : "Gaming";
    const fit =
      buildUseCase === "streaming"
        ? "Balanced encode and gameplay headroom."
        : buildUseCase === "work"
          ? "CPU-first balance for productivity and multitasking."
          : "Balanced gaming performance and value.";

    let table = "| Component | Part | Price |\n|---|---|---|\n";
    build.forEach((p) => {
      table += `| ${p.category} | ${p.name} | $${p.price} |\n`;
    });

    return {
      text: `## Recommended Build\n\n**Type:** ${useCaseLabel}\n**Target:** $${buildBudget}\n**Total:** $${total}\n**Fit:** ${fit}\n\n${table}`,
      suggestions: ["Review build", "Show FPS", "Save build"],
      build: {
        parts: build.reduce(
          (acc, p) => ({ ...acc, [p.category.toLowerCase()]: p }),
          {},
        ),
        total,
        reasoning: fit,
      },
      context: {
        ...context,
        extractedBudget: buildBudget,
        extractedUseCase: buildUseCase,
        currentBuild: build.reduce(
          (acc, p) => ({ ...acc, [p.category.toLowerCase()]: p }),
          {},
        ),
      },
    };
  }

  if (isUpgrade) {
    return {
      text: "To recommend an upgrade, I need to know your current specs. What GPU or CPU do you have now?",
      suggestions: [
        "I have an RTX 3060",
        "I have a Ryzen 3600",
        "Check my compatibility",
      ],
      context,
    };
  }

  return {
    text: "Hey! I'm Nexus, your PC building assistant. I can help you with builds, reviews, and FPS deep dives. What's on your mind?",
    suggestions: [
      "Build me a $1200 PC",
      "Review my current build",
      "FPS deep dive",
    ],
    context,
  };
}

const normalizeGeneralQuery = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9$+\s.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const includesAny = (query: string, values: string[]) => {
  const normalized = normalizeGeneralQuery(query);
  return values.some((value) => {
    const candidate = normalizeGeneralQuery(value);
    return candidate.length > 0 && normalized.includes(candidate);
  });
};

const listLines = (values: string[]) =>
  values
    .filter(Boolean)
    .map((value) => `- ${value}`)
    .join("\n");

const termSuggestions = (term: { relatedTerms?: string[] }) =>
  (term.relatedTerms || []).slice(0, 3).map((value) => `What is ${value}?`);

const findTerminologyMatch = (query: string) => {
  const normalized = normalizeGeneralQuery(query);
  for (const [key, term] of Object.entries(TERMINOLOGY)) {
    const label = normalizeGeneralQuery(term.term || key);
    const aliases = [key, label, ...(term.relatedTerms || [])].map(
      normalizeGeneralQuery,
    );
    if (
      aliases.some(
        (alias) =>
          alias &&
          (normalized === alias ||
            normalized.includes(alias) ||
            alias.includes(normalized)),
      )
    ) {
      return { key, term };
    }
  }
  return null;
};

const findGuideMatch = (query: string) => {
  const normalized = normalizeGeneralQuery(query);
  const sections = [
    { name: "troubleshooting", items: GUIDE_KNOWLEDGE.troubleshooting || [] },
    { name: "assembly", items: GUIDE_KNOWLEDGE.assembly || [] },
    { name: "concepts", items: GUIDE_KNOWLEDGE.concepts || [] },
    { name: "beginner", items: GUIDE_KNOWLEDGE.beginner || [] },
  ];

  for (const section of sections) {
    for (const item of section.items) {
      const triggers = (item?.triggers || []).map(normalizeGeneralQuery);
      if (triggers.some((trigger) => trigger && normalized.includes(trigger))) {
        return { section: section.name, item };
      }
    }
  }

  return null;
};

const findTroubleshootingMatch = (query: string) => {
  const normalized = normalizeGeneralQuery(query);
  for (const [key, issue] of Object.entries(TROUBLESHOOTING || {})) {
    const haystack = [
      key,
      issue?.issue,
      ...(issue?.symptoms || []),
      ...(issue?.causes || []),
    ].map(normalizeGeneralQuery);
    if (haystack.some((value) => value && normalized.includes(value))) {
      return issue;
    }
  }
  return null;
};

const buildComponentBasicsResponse = (
  query: string,
): GeneralChatResponse | null => {
  const normalized = normalizeGeneralQuery(query);
  const wantsExplanation =
    /\b(what is|what does|explain|meaning|purpose|why do i need|why is|how important)\b/.test(
      normalized,
    );

  if (!wantsExplanation) {
    return null;
  }

  if (
    normalized.includes("gpu") ||
    normalized.includes("graphics card") ||
    normalized.includes("video card")
  ) {
    return {
      text: `## GPU basics\n\nA GPU renders graphics, handles 3D workloads, and is the main driver of gaming performance.\n\n**What to look for**\n${listLines(["VRAM capacity", "Architecture generation", "Power draw", "Performance tier"])}`,
      suggestions: [
        "What is VRAM?",
        "Best GPU for 1440p?",
        "What does a GPU bottleneck mean?",
      ],
      context: { lastGeneralTopic: "basics", lastGeneralFocus: "gpu" },
    };
  }

  if (normalized.includes("cpu") || normalized.includes("processor")) {
    return {
      text: `## CPU basics\n\nA CPU runs game logic, background tasks, and most general system processing.\n\n**What matters**\n${listLines(["Single-core speed", "Core count", "Cache", "Power draw and cooling"])}`,
      suggestions: [
        "What is bottlenecking?",
        "Best CPU for gaming?",
        "What is cache?",
      ],
      context: { lastGeneralTopic: "basics", lastGeneralFocus: "cpu" },
    };
  }

  if (normalized.includes("ram") || normalized.includes("memory")) {
    return {
      text: `## RAM basics\n\nRAM is short-term working memory for active apps and games. More RAM helps with multitasking, but speed and dual-channel setup also matter.\n\n**Rule of thumb**\n${listLines(["16GB for most gaming PCs", "32GB for heavy multitasking or creators", "Enable XMP or EXPO to run at rated speed"])}`,
      suggestions: ["DDR4 vs DDR5", "What is XMP?", "Is 8GB enough?"],
      context: { lastGeneralTopic: "basics", lastGeneralFocus: "ram" },
    };
  }

  if (normalized.includes("motherboard") || normalized.includes("mobo")) {
    return {
      text: `## Motherboard basics\n\nThe motherboard connects everything and determines socket support, chipset features, expansion slots, and overall upgrade path.\n\n**Watch for**\n${listLines(["CPU socket compatibility", "DDR4 vs DDR5 support", "Form factor", "VRM quality"])}`,
      suggestions: [
        "CPU socket compatibility",
        "DDR4 vs DDR5",
        "What is a chipset?",
      ],
      context: { lastGeneralTopic: "basics", lastGeneralFocus: "motherboard" },
    };
  }

  if (
    normalized.includes("storage") ||
    normalized.includes("ssd") ||
    normalized.includes("nvme") ||
    normalized.includes("hard drive")
  ) {
    return {
      text: `## Storage basics\n\nStorage keeps your OS, apps, and files. NVMe SSDs are the modern default because they are much faster than SATA drives or hard drives.\n\n**Rule of thumb**\n${listLines(["NVMe for OS and games", "SATA SSD only if budget is tight", "Avoid HDD-only builds"])}`,
      suggestions: [
        "What is NVMe?",
        "SSD vs HDD",
        "How much storage do I need?",
      ],
      context: { lastGeneralTopic: "basics", lastGeneralFocus: "storage" },
    };
  }

  if (normalized.includes("psu") || normalized.includes("power supply")) {
    return {
      text: `## PSU basics\n\nThe PSU converts wall power into stable DC power for the PC. Quality and wattage both matter.\n\n**Rule of thumb**\n${listLines(["Buy from a reputable tier-list brand", "Use enough wattage headroom", "ATX 3.0 / 3.1 is ideal for modern high-power GPUs"])}`,
      suggestions: [
        "How many watts do I need?",
        "ATX 3.1 meaning",
        "Is this PSU safe?",
      ],
      context: { lastGeneralTopic: "basics", lastGeneralFocus: "psu" },
    };
  }

  if (normalized.includes("case") || normalized.includes("chassis")) {
    return {
      text: `## Case basics\n\nThe case holds your parts and strongly affects airflow, GPU clearance, and cooler fit.\n\n**Watch for**\n${listLines(["GPU length clearance", "CPU cooler height clearance", "Fan support", "Front-panel airflow"])}`,
      suggestions: [
        "Best airflow case?",
        "Will my GPU fit?",
        "How many fans do I need?",
      ],
      context: { lastGeneralTopic: "basics", lastGeneralFocus: "case" },
    };
  }

  if (
    normalized.includes("cooler") ||
    normalized.includes("cooling") ||
    normalized.includes("heatsink")
  ) {
    return {
      text: `## Cooling basics\n\nA cooler keeps the CPU within safe temperatures and prevents throttling.\n\n**Watch for**\n${listLines(["Socket compatibility", "TDP / heat output", "Case clearance", "Airflow"])}`,
      suggestions: [
        "Air cooler or AIO?",
        "How hot is too hot?",
        "Best cooler for my CPU",
      ],
      context: { lastGeneralTopic: "basics", lastGeneralFocus: "cooling" },
    };
  }

  if (normalized.includes("monitor") || normalized.includes("display")) {
    return {
      text: `## Monitor basics\n\nThe monitor is your display output. Resolution, refresh rate, panel type, and size all affect the experience.\n\n**Good starting points**\n${listLines(["1080p for budget setups", "1440p is the sweet spot for most gamers", "OLED and IPS have very different trade-offs"])}`,
      suggestions: [
        "OLED vs IPS",
        "What refresh rate do I need?",
        "Best monitor for gaming",
      ],
      context: { lastGeneralTopic: "basics", lastGeneralFocus: "monitor" },
    };
  }

  return null;
};

const findUseCaseKey = (query: string) => {
  const normalized = normalizeGeneralQuery(query);
  for (const [key, aliases] of Object.entries(SYNONYM_MAP.useCases || {})) {
    if (
      (aliases || []).some((alias) =>
        normalized.includes(normalizeGeneralQuery(alias)),
      )
    ) {
      return key;
    }
  }
  return null;
};

const buildMonitorResponse = (query: string): GeneralChatResponse | null => {
  const normalized = normalizeGeneralQuery(query);
  const panelKeys = Object.keys(MONITOR_KNOWLEDGE.panels || {});
  const panelKey = panelKeys.find((key) =>
    normalized.includes(normalizeGeneralQuery(key)),
  );

  if (panelKey) {
    const panel =
      MONITOR_KNOWLEDGE.panels[
        panelKey as keyof typeof MONITOR_KNOWLEDGE.panels
      ];
    return {
      text: `## ${panel.name}\n\n**Pros**\n${listLines(panel.pros || [])}\n\n**Cons**\n${listLines(panel.cons || [])}\n\n**Best for**\n${listLines(panel.bestFor || [])}${panel.note ? `\n\n${panel.note}` : ""}${panel.subtypes ? `\n\n**Subtypes**\n${listLines(panel.subtypes)}` : ""}`,
      suggestions: [
        "OLED vs IPS",
        "Best 1440p monitor",
        "What resolution should I buy?",
      ],
      context: { lastGeneralTopic: "monitor", lastGeneralFocus: panelKey },
    };
  }

  const resolutionKeys = Object.keys(MONITOR_KNOWLEDGE.resolutions || {});
  const resolutionKey = resolutionKeys.find((key) =>
    normalized.includes(normalizeGeneralQuery(key)),
  );
  if (resolutionKey) {
    const resolution =
      MONITOR_KNOWLEDGE.resolutions[
        resolutionKey as keyof typeof MONITOR_KNOWLEDGE.resolutions
      ];
    return {
      text: `## ${resolutionKey} Monitor Guidance\n\n- Resolution: ${resolution.pixels}\n- Ideal size: ${resolution.idealSize}\n- GPU tier: ${resolution.gpuTier}\n- Note: ${resolution.note}`,
      suggestions: [
        "OLED vs IPS",
        "Best monitor for gaming",
        "What refresh rate do I need?",
      ],
      context: { lastGeneralTopic: "monitor", lastGeneralFocus: resolutionKey },
    };
  }

  if (
    normalized.includes("best monitor") ||
    normalized.includes("gaming monitor")
  ) {
    const pick = normalized.includes("4k")
      ? MONITOR_KNOWLEDGE.recommendations["High End Immersion"]
      : normalized.includes("productivity")
        ? MONITOR_KNOWLEDGE.recommendations.Productivity
        : MONITOR_KNOWLEDGE.recommendations["1440p Sweet Spot"];

    return {
      text: `## Monitor recommendation\n\n**Priority:** ${pick.priority}\n\n${listLines((pick.topPicks || []).map((value) => value))}`,
      suggestions: [
        "OLED vs IPS",
        "Best 1440p monitor",
        "Best monitor for productivity",
      ],
      context: {
        lastGeneralTopic: "monitor",
        lastGeneralFocus: "recommendations",
      },
    };
  }

  return null;
};

const buildPsuResponse = (query: string): GeneralChatResponse | null => {
  const normalized = normalizeGeneralQuery(query);
  if (
    !includesAny(normalized, [
      "psu",
      "power supply",
      "watt",
      "80 plus",
      "atx 3",
      "atx 3.0",
      "atx 3.1",
    ])
  ) {
    return null;
  }

  const tierA = PSU_KNOWLEDGE.tiers?.["Tier A (High End)"];
  return {
    text: `## PSU guidance\n\n- ATX 3.0 / 3.1 is the current target for high-power GPUs.\n- 80 Plus Gold is the sweet spot for most gaming PCs.\n- Tier A units are the safest pick for premium builds.\n- Avoid generic or Tier F units.\n\n**Tier A examples**\n${listLines(tierA?.series || [])}\n\n**Common mistakes**\n${listLines(PSU_KNOWLEDGE.mistakes || [])}`,
    suggestions: [
      "How many watts do I need?",
      "ATX 3.1 meaning",
      "Is this PSU safe?",
    ],
    context: { lastGeneralTopic: "psu", lastGeneralFocus: "overview" },
  };
};

const buildWorkstationResponse = (
  query: string,
): GeneralChatResponse | null => {
  const normalized = normalizeGeneralQuery(query);
  if (
    !includesAny(normalized, [
      "workstation",
      "video editing",
      "editing",
      "rendering",
      "blender",
      "maya",
      "premiere",
      "resolve",
      "after effects",
      "coding",
      "machine learning",
      "ai",
      "music",
      "production",
    ])
  ) {
    return null;
  }

  if (
    includesAny(normalized, [
      "premiere",
      "after effects",
      "video editing",
      "editing",
    ])
  ) {
    const info = WORKSTATION_KNOWLEDGE.videoEditing;
    return {
      text: `## Video editing workstation\n\n${listLines([
        `Premiere Pro: ${info.recommendations["Premiere Pro"]}`,
        `DaVinci Resolve: ${info.recommendations["DaVinci Resolve"]}`,
        `After Effects: ${info.recommendations["After Effects"]}`,
      ])}\n\n**Priorities**\n${listLines(info.priorities.map((entry) => `${entry.component}: ${entry.note}`))}`,
      suggestions: [
        "Best CPU for editing?",
        "How much RAM do I need?",
        "NVIDIA vs AMD for Resolve",
      ],
      context: {
        lastGeneralTopic: "workstation",
        lastGeneralFocus: "videoEditing",
      },
    };
  }

  if (includesAny(normalized, ["blender", "maya", "3d", "rendering"])) {
    const info = WORKSTATION_KNOWLEDGE.rendering3D;
    return {
      text: `## 3D rendering workstation\n\n**CPU rendering**: ${info.engines["CPU Rendering"].bestHardware}\n**GPU rendering**: ${info.engines["GPU Rendering"].bestHardware}\n\n${listLines(
        [
          `Blender: ${info.recommendations.Blender}`,
          `V-Ray: ${info.recommendations["V-Ray"]}`,
        ],
      )}`,
      suggestions: [
        "Best GPU for Blender?",
        "How much VRAM do I need?",
        "Best CPU for rendering",
      ],
      context: {
        lastGeneralTopic: "workstation",
        lastGeneralFocus: "rendering3D",
      },
    };
  }

  if (
    includesAny(normalized, [
      "machine learning",
      "ai",
      "deep learning",
      "stable diffusion",
      "llm",
    ])
  ) {
    const info = WORKSTATION_KNOWLEDGE.machineLearning;
    return {
      text: `## AI / machine learning\n\n${info.ruleOfThumb}\n\n${listLines(info.notes || [])}\n\n**VRAM targets**\n${listLines(Object.values(info.requirements || {}))}`,
      suggestions: [
        "How much VRAM do I need?",
        "Best GPU for AI?",
        "NVIDIA or AMD for ML?",
      ],
      context: {
        lastGeneralTopic: "workstation",
        lastGeneralFocus: "machineLearning",
      },
    };
  }

  if (
    includesAny(normalized, [
      "music",
      "audio production",
      "ableton",
      "fl studio",
      "pro tools",
      "logic pro",
    ])
  ) {
    const info = WORKSTATION_KNOWLEDGE.musicProduction;
    return {
      text: `## Music production PC\n\n${listLines(info.priorities.map((entry) => `${entry.component}: ${entry.note}`))}\n\n${info.notes}`,
      suggestions: [
        "Best CPU for music production?",
        "Need a silent PC",
        "How much RAM for samples?",
      ],
      context: {
        lastGeneralTopic: "workstation",
        lastGeneralFocus: "musicProduction",
      },
    };
  }

  const info = WORKSTATION_KNOWLEDGE.development;
  return {
    text: `## Workstation guidance\n\n${listLines([
      `Web dev: ${info.scenarios["Web Dev"].hardware}`,
      `Game dev: ${info.scenarios["Game Dev (Unreal/Unity)"].hardware}`,
      `Virtualization: ${info.scenarios["Virtualization/Servers"].hardware}`,
    ])}`,
    suggestions: [
      "Best CPU for coding?",
      "Need 64GB RAM?",
      "Best GPU for Blender",
    ],
    context: { lastGeneralTopic: "workstation", lastGeneralFocus: "overview" },
  };
};

const buildLaptopResponse = (query: string): GeneralChatResponse | null => {
  const normalized = normalizeGeneralQuery(query);
  if (
    !includesAny(normalized, [
      "laptop",
      "gaming laptop",
      "portable",
      "tgp",
      "battery",
      "ultrabook",
    ])
  ) {
    return null;
  }

  if (normalized.includes("tgp") || normalized.includes("gpu power")) {
    const info = LAPTOP_KNOWLEDGE.tgpExplained;
    return {
      text: `## ${info.title}\n\n${info.explanation}\n\n${listLines(info.examples || [])}\n\n${info.advice}`,
      suggestions: [
        "Best gaming laptop",
        "Thin and light gaming",
        "What does HX mean?",
      ],
      context: { lastGeneralTopic: "laptop", lastGeneralFocus: "tgp" },
    };
  }

  if (
    normalized.includes("screen") ||
    normalized.includes("display") ||
    normalized.includes("brightness")
  ) {
    return {
      text: `## Laptop display guidance\n\n${listLines(LAPTOP_KNOWLEDGE.displays?.recommendations || [])}`,
      suggestions: [
        "Best gaming laptop",
        "What does TGP mean?",
        "Intel H vs U",
      ],
      context: { lastGeneralTopic: "laptop", lastGeneralFocus: "display" },
    };
  }

  const pick = normalized.includes("thin")
    ? LAPTOP_KNOWLEDGE.recommendations["Thin & Light Gaming"]
    : normalized.includes("desktop")
      ? LAPTOP_KNOWLEDGE.recommendations["Desktop Replacement"]
      : LAPTOP_KNOWLEDGE.recommendations["Best Value"];

  return {
    text: `## Laptop recommendation\n\n**Why:** ${pick.why}\n\n${listLines(pick.topPicks || [])}`,
    suggestions: [
      "What is TGP?",
      "Best battery life gaming laptop",
      "What CPU suffix should I buy?",
    ],
    context: { lastGeneralTopic: "laptop", lastGeneralFocus: "recommendation" },
  };
};

const buildAudioResponse = (query: string): GeneralChatResponse | null => {
  const normalized = normalizeGeneralQuery(query);
  if (
    !includesAny(normalized, [
      "headphone",
      "headset",
      "microphone",
      "mic",
      "dac",
      "amp",
      "audio",
    ])
  ) {
    return null;
  }

  if (includesAny(normalized, ["headphone", "headset"])) {
    const types = AUDIO_KNOWLEDGE.headphones?.types || {};
    const openBack = types["Open Back"];
    const closedBack = types["Closed Back"];
    return {
      text: `## Headphone guidance\n\n**Open back**\n${listLines(openBack?.pros || [])}\n\n**Closed back**\n${listLines(closedBack?.pros || [])}\n\n**Budget picks**: ${AUDIO_KNOWLEDGE.headphones?.recommendations?.budget}\n**Competitive FPS**: ${AUDIO_KNOWLEDGE.headphones?.recommendations?.competitiveFPS}`,
      suggestions: [
        "Open back vs closed back",
        "Do I need a DAC?",
        "Best gaming headset",
      ],
      context: { lastGeneralTopic: "audio", lastGeneralFocus: "headphones" },
    };
  }

  if (includesAny(normalized, ["mic", "microphone"])) {
    const mic = AUDIO_KNOWLEDGE.microphones;
    return {
      text: `## Microphone guidance\n\n**Dynamic**: ${mic.types.Dynamic.bestFor}\n**Condenser**: ${mic.types.Condenser.bestFor}\n\n**USB**: ${mic.interfaces.USB.description}\n**XLR**: ${mic.interfaces.XLR.description}`,
      suggestions: [
        "USB or XLR mic?",
        "Best mic for gaming?",
        "Do I need an interface?",
      ],
      context: { lastGeneralTopic: "audio", lastGeneralFocus: "microphones" },
    };
  }

  return {
    text: `## Audio guidance\n\nDAC: ${AUDIO_KNOWLEDGE.dacAmp.basics.DAC}\nAmp: ${AUDIO_KNOWLEDGE.dacAmp.basics.Amp}\n\n${listLines(AUDIO_KNOWLEDGE.dacAmp.doINeedOne || [])}`,
    suggestions: [
      "Do I need a DAC?",
      "Open back vs closed back",
      "Best mic for Discord",
    ],
    context: { lastGeneralTopic: "audio", lastGeneralFocus: "dacAmp" },
  };
};

const buildPrebuiltResponse = (query: string): GeneralChatResponse | null => {
  const normalized = normalizeGeneralQuery(query);
  if (
    !includesAny(normalized, [
      "prebuilt",
      "pre-built",
      "pre built",
      "scam",
      "dell",
      "hp",
      "alienware",
      "i7 pc",
      "gaming pc",
    ])
  ) {
    return null;
  }

  const redFlag = (PREBUILT_KNOWLEDGE.redFlags || []).find((item) =>
    normalized.includes(normalizeGeneralQuery(item.term)),
  );

  if (redFlag) {
    return {
      text: `## Prebuilt warning\n\n**${redFlag.term}**\n${redFlag.check}\n\nSeverity: ${redFlag.severity}`,
      suggestions: [
        "Check another listing",
        "What brands are safe?",
        "Is this GPU any good?",
      ],
      context: { lastGeneralTopic: "prebuilt", lastGeneralFocus: redFlag.term },
    };
  }

  const tier = PREBUILT_KNOWLEDGE.brandTiers?.["S Tier (Premium/Custom)"];
  return {
    text: `## Prebuilt guidance\n\n**Safer brands**\n${listLines(tier?.brands || [])}\n\n**Why:** ${tier?.verdict || "Look for standard parts and good airflow."}\n\n**Red flags**\n${listLines((PREBUILT_KNOWLEDGE.redFlags || []).map((item) => `${item.term}: ${item.check}`))}`,
    suggestions: [
      "Is this prebuilt a scam?",
      "What brands should I avoid?",
      "How do I check the PSU?",
    ],
    context: { lastGeneralTopic: "prebuilt", lastGeneralFocus: "overview" },
  };
};

const buildUpgradeResponse = (query: string): GeneralChatResponse | null => {
  const normalized = normalizeGeneralQuery(query);
  if (
    !includesAny(normalized, [
      "upgrade",
      "better",
      "improve",
      "replace",
      "what should i upgrade",
    ])
  ) {
    return null;
  }

  return {
    text: `## Upgrade advice\n\n${listLines(
      UPGRADE_ADVICE.bestUpgrades.map(
        (item) => `${item.upgrade}: ${item.impact} (${item.cost})`,
      ),
    )}\n\n**Platform rule:** ${UPGRADE_ADVICE.upgradeVsNew}`,
    suggestions: [
      "What should I upgrade first?",
      "HDD to SSD?",
      "Is my GPU the bottleneck?",
    ],
    context: { lastGeneralTopic: "upgrade", lastGeneralFocus: "overview" },
  };
};

const buildCompatibilityResponse = (
  query: string,
): GeneralChatResponse | null => {
  const normalized = normalizeGeneralQuery(query);
  if (
    !includesAny(normalized, [
      "compatibility",
      "compatible",
      "fit",
      "socket",
      "bottleneck",
      "will it work",
      "check my build",
    ])
  ) {
    return null;
  }

  return {
    text: `## Compatibility rules\n\n**CPU + motherboard**\n${COMPATIBILITY.cpuMotherboard.rule}\n\n**RAM**\n${COMPATIBILITY.ramMotherboard.rule}\n\n**Case fit**\n${COMPATIBILITY.gpuCase.rule}\n${COMPATIBILITY.coolerCase.rule}\n\n**PSU sizing**\n${COMPATIBILITY.psuWattage.rule}\n${COMPATIBILITY.psuWattage.tips}`,
    suggestions: [
      "Will this CPU fit?",
      "DDR4 vs DDR5",
      "Will this GPU fit my case?",
    ],
    context: {
      lastGeneralTopic: "compatibility",
      lastGeneralFocus: "overview",
    },
  };
};

const buildGeneralFallback = (query: string): GeneralChatResponse => {
  const stats = getKnowledgeStats();
  const useCase = findUseCaseKey(query);

  if (useCase === "gaming") {
    return {
      text: `## Gaming guidance\n\n${listLines([
        `${BUILD_ARCHETYPES.esports.name}: ${BUILD_ARCHETYPES.esports.target}`,
        `${BUILD_ARCHETYPES["1440p gaming"].name}: ${BUILD_ARCHETYPES["1440p gaming"].target}`,
        `${BUILD_ARCHETYPES["4k gaming"].name}: ${BUILD_ARCHETYPES["4k gaming"].target}`,
      ])}\n\nIf you want a full parts list, switch to Assistant Mode.`,
      suggestions: [
        "Best GPU for 1440p",
        "What parts do I need?",
        "What monitor should I buy?",
      ],
      context: { lastGeneralTopic: "gaming", lastGeneralFocus: "archetypes" },
    };
  }

  if (useCase === "work" || useCase === "streaming") {
    return {
      text: `## ${useCase === "streaming" ? "Streaming" : "Workstation"} guidance\n\n${
        useCase === "streaming"
          ? BUILD_ARCHETYPES.streaming.notes
          : "Tell me the software you use and I can narrow it to CPU, GPU, and RAM priorities."
      }\n\nI can help with video editing, 3D rendering, coding, and audio production.`,
      suggestions: [
        "Premiere Pro PC",
        "Best CPU for coding",
        "How much RAM do I need?",
      ],
      context: { lastGeneralTopic: useCase, lastGeneralFocus: "overview" },
    };
  }

  return {
    text: `## NexusAI general knowledge\n\nI can help with:\n${listLines([
      "PC terminology and component basics",
      "Troubleshooting and assembly steps",
      "Compatibility and upgrade advice",
      "Monitor, PSU, laptop, audio, and prebuilt guidance",
      `Knowledge base coverage: ${stats.totalParts} parts across ${Object.keys(stats.byCategory).length} categories`,
    ])}`,
    suggestions: [
      "What does a GPU do?",
      "How do I fix no display?",
      "What PSU do I need?",
    ],
    context: { lastGeneralTopic: "general", lastGeneralFocus: "overview" },
  };
};

export function processGeneralChat(
  query: string,
  context: ConversationContext = {},
): GeneralChatResponse {
  const normalized = normalizeGeneralQuery(query);

  if (!normalized) {
    return buildGeneralFallback(query);
  }

  if (
    /^(hi|hello|hey|yo|what can you do|help|who are you)\b/.test(normalized)
  ) {
    return {
      text: `## NexusAI General Chat\n\nI can explain PC parts, troubleshooting, compatibility, upgrades, monitors, PSUs, laptops, audio, and prebuilt checks.\n\nAsk me about a part, a guide, or a specific problem and I will use the Nexus knowledge base to answer it.`,
      suggestions: [
        "What does a GPU do?",
        "How do I fix no display?",
        "What PSU do I need?",
      ],
      context: {
        ...context,
        lastGeneralTopic: "intro",
        lastGeneralFocus: "overview",
        lastGeneralQuery: query,
      },
    };
  }

  const termMatch = findTerminologyMatch(query);
  if (termMatch) {
    const { key, term } = termMatch;
    return {
      text: `## ${term.term}\n\n${term.definition}\n\n**Example:** ${term.example}${term.relatedTerms?.length ? `\n\n**Related terms**\n${listLines(term.relatedTerms.map((value) => `What is ${value}?`))}` : ""}`,
      suggestions: termSuggestions(term),
      context: {
        ...context,
        lastGeneralTopic: "terminology",
        lastGeneralFocus: key,
        lastGeneralQuery: query,
      },
    };
  }

  const guideMatch = findGuideMatch(query);
  if (guideMatch) {
    const item = guideMatch.item;
    return {
      text: `## ${item.title}\n\n${item.content}`,
      suggestions: ["Next step", "Troubleshooting", "Compatibility rules"],
      context: {
        ...context,
        lastGeneralTopic: `guide:${guideMatch.section}`,
        lastGeneralFocus: item.title,
        lastGeneralQuery: query,
      },
    };
  }

  const troubleshootingMatch = findTroubleshootingMatch(query);
  if (troubleshootingMatch) {
    return {
      text: `## ${troubleshootingMatch.issue}\n\n**Symptoms**\n${listLines(troubleshootingMatch.symptoms || [])}\n\n**Causes**\n${listLines(troubleshootingMatch.causes || [])}\n\n**Fixes**\n${listLines(troubleshootingMatch.solutions || [])}${troubleshootingMatch.prevention ? `\n\n**Prevention**\n${troubleshootingMatch.prevention}` : ""}`,
      suggestions: [
        "Explain this issue",
        "How do I fix it?",
        "What causes this?",
      ],
      context: {
        ...context,
        lastGeneralTopic: "troubleshooting",
        lastGeneralFocus: troubleshootingMatch.issue,
        lastGeneralQuery: query,
      },
    };
  }

  const basicComponentResponse = buildComponentBasicsResponse(query);
  if (basicComponentResponse) return basicComponentResponse;

  const partMatch = searchParts(query);
  if (partMatch) {
    if (Array.isArray(partMatch)) {
      const limited = partMatch.slice(0, 5);
      return {
        text: `## Found ${limited.length} matching parts\n\n${limited
          .map(
            (part) =>
              `### ${part.name}\n${part.type ? `- Type: ${part.type}\n` : ""}${part.msrp ? `- MSRP: $${part.msrp}\n` : ""}`,
          )
          .join("\n")}\nWant details on one of these?`,
        suggestions: limited.map((part) => `Details on ${part.name}`),
        context: {
          ...context,
          lastGeneralTopic: "parts",
          lastGeneralFocus: "list",
          lastGeneralQuery: query,
        },
      };
    }

    return {
      text: formatPartInfo(partMatch),
      suggestions: [
        "Compare parts",
        "What is the socket?",
        "What should I buy instead?",
      ],
      context: {
        ...context,
        lastGeneralTopic: "parts",
        lastGeneralFocus: partMatch.name,
        lastGeneralQuery: query,
      },
    };
  }

  const monitorResponse = buildMonitorResponse(query);
  if (monitorResponse) return monitorResponse;

  const psuResponse = buildPsuResponse(query);
  if (psuResponse) return psuResponse;

  const workstationResponse = buildWorkstationResponse(query);
  if (workstationResponse) return workstationResponse;

  const laptopResponse = buildLaptopResponse(query);
  if (laptopResponse) return laptopResponse;

  const audioResponse = buildAudioResponse(query);
  if (audioResponse) return audioResponse;

  const prebuiltResponse = buildPrebuiltResponse(query);
  if (prebuiltResponse) return prebuiltResponse;

  const compatibilityResponse = buildCompatibilityResponse(query);
  if (compatibilityResponse) return compatibilityResponse;

  const upgradeResponse = buildUpgradeResponse(query);
  if (upgradeResponse) return upgradeResponse;

  if (includesAny(query, ["build", "pc", "computer", "rig", "setup"])) {
    return {
      text: `## General PC guidance\n\nIf you are starting from scratch, the core parts are:\n${listLines(
        [
          "CPU",
          "Motherboard",
          "RAM",
          "Storage",
          "PSU",
          "Case",
          "GPU if you are gaming or doing GPU-heavy work",
        ],
      )}\n\nFor a full parts list and pricing, switch to Assistant Mode.`,
      suggestions: [
        "What parts do I need?",
        "What PSU do I need?",
        "What does a GPU do?",
      ],
      context: {
        ...context,
        lastGeneralTopic: "general-pc",
        lastGeneralFocus: "core-parts",
        lastGeneralQuery: query,
      },
    };
  }

  return buildGeneralFallback(query);
}
