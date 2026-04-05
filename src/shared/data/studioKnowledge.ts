import { CATALOG_APPS } from "./appsCatalog";
import { docsArticles } from "./docs";

export type StudioLane = "service_automation" | "consumer_utility" | "finance" | "guided_support";

export type StudioExpertConfig = Readonly<{
  lane: StudioLane;
  label: string;
  summary: string;
  keywords: readonly string[];
  aliases: readonly string[];
  productSlugs: readonly string[];
  docCategories: readonly Array<(typeof docsArticles)[number]["category"]>;
  theme: "green" | "blue" | "amber" | "violet";
}>;

export type StudioAppFamily = Readonly<{
  lane: StudioLane;
  name: string;
  description: string;
  productSlugs: readonly string[];
}>;

export const STUDIO_IDENTITY = Object.freeze({
  name: "Northern Step Studio",
  mission:
    "Practical software, steady progress, and clear workflows that help people make confident decisions.",
  philosophy:
    "The studio prefers useful systems over hype, clarity over cleverness, and durable products over short-lived demos.",
  values: [
    "Useful over hype",
    "Clear beats clever",
    "Systems thinking",
    "Earned trust",
  ] as const,
  history:
    "Northern Step Studio is a hands-on product studio building practical software across home readiness, finance, therapy support, hardware planning, and service automation.",
} as const);

export const STUDIO_EXPERTS: readonly StudioExpertConfig[] = [
  {
    lane: "service_automation",
    label: "Service Automation Expert",
    summary:
      "Lead Recovery for missed-call follow-up, service-business response flows, and practical automation that keeps new leads moving.",
    keywords: [
      "lead recovery",
      "missed call",
      "text back",
      "mctb",
      "sms",
      "twilio",
      "lead",
      "service",
      "automation",
      "appointment",
      "quote",
      "response",
      "smb",
    ],
    aliases: ["MCTB", "Missed Call Text Back", "Lead Recovery"],
    productSlugs: ["missed-call-text-back"],
    docCategories: ["apps", "ai-tools"],
    theme: "green",
  },
  {
    lane: "consumer_utility",
    label: "Utility Expert",
    summary:
      "NexusBuild for hardware and performance planning, and ProvLy for home inventory and claim-ready documentation.",
    keywords: [
      "nexusbuild",
      "provly",
      "home",
      "inventory",
      "claim",
      "proof",
      "hardware",
      "pc",
      "build",
      "value",
      "organize",
      "utility",
      "save time",
    ],
    aliases: ["NexusBuild", "ProvLy", "utility suite", "home organization"],
    productSlugs: ["nexusbuild", "provly"],
    docCategories: ["getting-started", "apps"],
    theme: "blue",
  },
  {
    lane: "finance",
    label: "Finance Expert",
    summary:
      "NooBS Investing for financial literacy loops and PasoScore for deterministic credit guidance and next-step planning.",
    keywords: [
      "finance",
      "credit",
      "investing",
      "money",
      "budget",
      "score",
      "debt",
      "portfolio",
      "loan",
      "savings",
      "pasoscore",
      "noobs",
    ],
    aliases: ["NooBS Investing", "PasoScore", "credit guidance", "financial literacy"],
    productSlugs: ["noobs-investing", "pasoscore"],
    docCategories: ["getting-started", "ai-tools"],
    theme: "amber",
  },
  {
    lane: "guided_support",
    label: "Guided Support Expert",
    summary:
      "Neuromove for structured routines, progress tracking, and parent-facing therapy support tools.",
    keywords: [
      "neuromove",
      "neuromoves",
      "therapy",
      "therapeutic",
      "routine",
      "parent",
      "child",
      "ot",
      "progress",
      "guided",
      "support",
      "care",
    ],
    aliases: ["Neuromove", "Neuromoves", "OT", "therapy support"],
    productSlugs: ["neuromoves"],
    docCategories: ["getting-started", "apps"],
    theme: "violet",
  },
] as const;

export const STUDIO_GLOBAL_CONTEXT = Object.freeze({
  label: "Studio Context",
  summary:
    "All agents should ground answers in Northern Step Studio's public catalog, documentation, and practical product philosophy.",
  principles: [
    "Use the catalog for live status labels and product names.",
    "Use documentation for how-to and policy questions.",
    "Prefer clear, grounded answers over broad promises.",
    "When a question spans multiple products, synthesize across the studio instead of forcing one app.",
  ] as const,
  audience:
    "The studio serves consumers, service businesses, and teams looking for focused tools that reduce friction.",
} as const);

export const STUDIO_DOMAINS = STUDIO_EXPERTS.map((expert) => {
  const productNames = expert.productSlugs
    .map((slug) => CATALOG_APPS.find((app) => app.slug === slug)?.name)
    .filter((value): value is string => Boolean(value));

  return {
    ...expert,
    productNames,
  };
});

export type StudioDomainConfig = (typeof STUDIO_DOMAINS)[number];

export function getStudioDomainByLane(lane: StudioLane) {
  return STUDIO_DOMAINS.find((domain) => domain.lane === lane) || null;
}

export function getStudioProductFamily(slug: string): StudioAppFamily | null {
  const lowerSlug = slug.toLowerCase();

  if (["missed-call-text-back", "mctb", "lead-recovery"].includes(lowerSlug)) {
    return {
      lane: "service_automation",
      name: "Lead Recovery Service",
      description: "Missed-call response and lead capture for service businesses.",
      productSlugs: ["missed-call-text-back"],
    };
  }

  if (["nexusbuild", "provly"].includes(lowerSlug)) {
    return {
      lane: "consumer_utility",
      name: "Utility Suite",
      description: "Hardware planning and home inventory tools for everyday organization.",
      productSlugs: ["nexusbuild", "provly"],
    };
  }

  if (["noobs-investing", "pasoscore"].includes(lowerSlug)) {
    return {
      lane: "finance",
      name: "Finance Suite",
      description: "Financial literacy and credit guidance products.",
      productSlugs: ["noobs-investing", "pasoscore"],
    };
  }

  if (["neuromoves"].includes(lowerSlug)) {
    return {
      lane: "guided_support",
      name: "Guided Support",
      description: "Structured routines and progress support for families.",
      productSlugs: ["neuromoves"],
    };
  }

  return null;
}

export function getDomainTheme(lane: StudioLane) {
  return getStudioDomainByLane(lane)?.theme || "green";
}
