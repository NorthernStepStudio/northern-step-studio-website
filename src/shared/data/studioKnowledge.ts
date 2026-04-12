import type { DocsArticle } from "./docs";

export type StudioLane = "consumer_utility" | "finance" | "guided_support";

export interface StudioExpertConfig {
  readonly lane: StudioLane;
  readonly label: string;
  readonly summary: string;
  readonly keywords: readonly string[];
  readonly aliases: readonly string[];
  readonly productSlugs: readonly string[];
  readonly docCategories: readonly DocsArticle["category"][];
  readonly theme: "green" | "blue" | "amber" | "violet";
}

export interface StudioAppFamily {
  readonly slug: string;
  readonly name: string;
  readonly lane: StudioLane;
  readonly summary: string;
  readonly path: string;
  readonly keywords: readonly string[];
  readonly aliases: readonly string[];
}

export const STUDIO_IDENTITY = {
  name: "Northern Step Studio",
  tagline: "Practical software for real-world workflows.",
  mission:
    "Build focused products that help people move work forward with less friction, less guesswork, and more clarity.",
  philosophy:
    "Practical Software. Steady, Deliberate Progress. Keep the product useful, grounded, and easy to explain.",
  voice:
    "Direct, calm, and practical. Avoid hype, keep context visible, and favor simple next steps.",
  values: [
    "Clarity over clutter",
    "Deliberate progress over feature bloat",
    "Helpful automation over flashy complexity",
    "Public-facing copy should stay professional and grounded",
  ],
  publicPromise:
    "Show what the product does, why it matters, and what the user should do next without overselling the outcome.",
} as const;

export const STUDIO_GLOBAL_CONTEXT = [
  `Studio: ${STUDIO_IDENTITY.name}`,
  `Tagline: ${STUDIO_IDENTITY.tagline}`,
  `Mission: ${STUDIO_IDENTITY.mission}`,
  `Philosophy: ${STUDIO_IDENTITY.philosophy}`,
  `Voice: ${STUDIO_IDENTITY.voice}`,
  `Values: ${STUDIO_IDENTITY.values.join("; ")}`,
  `Public promise: ${STUDIO_IDENTITY.publicPromise}`,
].join("\n");

export const STUDIO_EXPERTS: readonly StudioExpertConfig[] = [
  {
    lane: "consumer_utility",
    label: "Consumer Utility Expert",
    summary: "NexusBuild, ProvLy, home organization, and asset documentation workflows.",
    keywords: ["nexusbuild", "provly", "hardware", "pc build", "inventory", "claim", "receipts", "home"],
    aliases: ["utility", "home organization", "build planning", "claim readiness"],
    productSlugs: ["nexusbuild", "provly"],
    docCategories: ["apps", "getting-started"],
    theme: "blue",
  },
  {
    lane: "finance",
    label: "Finance Expert",
    summary: "NooBS Investing and PasoScore guidance for financial literacy and credit progress.",
    keywords: ["noobs investing", "pasoscore", "investing", "credit", "finance", "debt", "score", "budget"],
    aliases: ["financial literacy", "credit guidance", "money planning"],
    productSlugs: ["noobs-investing", "pasoscore"],
    docCategories: ["apps", "ai-tools"],
    theme: "amber",
  },
  {
    lane: "guided_support",
    label: "Guided Support Expert",
    summary: "Neuromove routines, progress tracking, parent-facing tools, and therapeutic support.",
    keywords: ["neuromove", "neuromoves", "therapy", "ot", "routine", "parent", "child", "progress"],
    aliases: ["guided support", "therapy support", "ot companion"],
    productSlugs: ["neuromoves"],
    docCategories: ["getting-started", "apps"],
    theme: "violet",
  },
];

export const STUDIO_DOMAINS = STUDIO_EXPERTS;

export const STUDIO_APP_FAMILIES: readonly StudioAppFamily[] = [
  {
    slug: "nexusbuild",
    name: "NexusBuild",
    lane: "consumer_utility",
    summary: "AI-powered build planning for performance, compatibility, and value.",
    path: "/apps/nexusbuild",
    keywords: ["nexusbuild", "pc build", "hardware", "parts"],
    aliases: ["build planning", "utility"],
  },
  {
    slug: "provly",
    name: "ProvLy",
    lane: "consumer_utility",
    summary: "Home inventory and claim-ready documentation for the things people own.",
    path: "/apps/provly",
    keywords: ["provly", "inventory", "claim", "receipts", "home"],
    aliases: ["claim readiness", "asset documentation"],
  },
  {
    slug: "noobs-investing",
    name: "NooBS Investing",
    lane: "finance",
    summary: "Guided investing literacy and step-by-step financial learning.",
    path: "/apps/noobs-investing",
    keywords: ["noobs investing", "investing", "financial literacy"],
    aliases: ["investing guide", "finance"],
  },
  {
    slug: "pasoscore",
    name: "PasoScore",
    lane: "finance",
    summary: "Deterministic credit guidance and month-by-month improvement paths.",
    path: "/apps/pasoscore",
    keywords: ["pasoscore", "credit", "score", "debt"],
    aliases: ["credit guidance", "credit builder"],
  },
  {
    slug: "neuromoves",
    name: "Neuromove",
    lane: "guided_support",
    summary: "Guided therapy routines, progress tracking, and parent tools.",
    path: "/apps/neuromoves",
    keywords: ["neuromove", "therapy", "ot", "routine", "parent"],
    aliases: ["guided support", "therapy companion"],
  },
];

export function getStudioDomainByLane(lane: StudioLane) {
  return STUDIO_EXPERTS.find((expert) => expert.lane === lane) ?? null;
}

export function getStudioProductFamily(slug: string) {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return (
    STUDIO_APP_FAMILIES.find((family) => {
      const comparisons = [family.slug, family.name, ...family.keywords, ...family.aliases]
        .map((value) => value.toLowerCase())
        .filter(Boolean);
      return comparisons.some((value) => normalized === value || normalized.includes(value) || value.includes(normalized));
    }) ?? null
  );
}
