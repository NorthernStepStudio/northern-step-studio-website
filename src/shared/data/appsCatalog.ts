
export type CatalogApp = {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  fullDescription: string;
  category: string;
  status: string;
  statusLabel: string;
  targetDate: string | null;
  techStack: string[];
  progress: { text: string; completed: boolean }[];
  logo: string | null;
  screenshots: string[];
  cta_url: string | null;
  video_url: string | null;
  features: string[];
  platform: string;
  visibility: string;
  progressPercent: number;
  monetization: string;
};

export const CATALOG_APPS: CatalogApp[] = [

  {
    id: 1001,
    name: "NexusBuild",
    slug: "nexusbuild",
    tagline: "Build your dream PC with AI.",
    description:
      "AI-powered PC building companion with instant compatible builds, deal tracking, and expert guidance.",
    fullDescription:
      "NexusBuild is an AI-powered PC building companion that generates compatible builds from your budget, helps compare parts, and tracks deals so hardware choices stay grounded in real performance and value.",
    category: "AI TOOL",
    status: "COMING_SOON",
    statusLabel: "Coming Soon",
    targetDate: null,
    techStack: ["React Native", "React", "Node.js API"],
    progress: [
      { text: "AI builder and compatibility workflow", completed: true },
      { text: "Price and deal tracking surfaces", completed: true },
      { text: "Build compare and management flows", completed: true },
      { text: "Store listing hardening and release prep", completed: false },
    ],
    logo: "/brand/nexusbuild-logo.png",
    screenshots: [],
    cta_url: "/contact",
    video_url: null,
    features: [
      "AI PC Builder: Generate complete compatible parts lists from budget and intent",
      "Deal Tracking: Watch live prices and alerts across major retailers",
      "Build Comparison: Compare full builds and component tradeoffs clearly",
    ],
    platform: "mobile",
    visibility: "published",
    progressPercent: 76,
    monetization: "Freemium",
  },
  {
    id: 1006,
    name: "NeuroMoves",
    slug: "neuromoves",
    tagline: "Routines, progress support, and guidance workflows.",
    description:
      "Future product surface for routines, progress support, and guidance workflows.",
    fullDescription:
      "NeuroMoves is currently in planning with a workflow scaffold focused on guided routines, progress support, and practical guidance flows.",
    category: "LEARNING",
    status: "COMING_SOON",
    statusLabel: "Coming Soon",
    targetDate: null,
    techStack: ["Workflow Scaffold"],
    progress: [
      { text: "Workflow scaffold established", completed: true },
      { text: "Product content and release scope", completed: false },
    ],
    logo: "/brand/neuromoves-logo.png",
    screenshots: [],
    cta_url: "/contact",
    video_url: null,
    features: [
      "Structured routines support",
      "Progress-oriented guidance",
      "Workflow-based experience planning",
    ],
    platform: "mobile",
    visibility: "published",
    progressPercent: 22,
    monetization: "Free",
  },
  {
    id: 1002,
    name: "ProvLy",
    slug: "provly",
    tagline: "Know what you own. Prove it when it matters.",
    description:
      "A local-first home inventory app for claim-ready documentation, exports, and maintenance reminders.",
    fullDescription:
      "ProvLy is a privacy-first, local-first home inventory vault with homes, rooms, and item capture, claim pack exports, maintenance reminders, and optional AI assist features.",
    category: "HOME",
    status: "COMING_SOON",
    statusLabel: "Coming Soon",
    targetDate: null,
    techStack: ["React Native", "Expo", "Supabase"],
    progress: [
      { text: "MVP core flows and claim exports", completed: true },
      { text: "Mobile camera scan and AI assist integration", completed: true },
      { text: "RevenueCat upgrade flow", completed: true },
      { text: "ZIP claim pack generation", completed: true },
      { text: "Offline queue and import wizard", completed: false },
      { text: "Advanced AI scan and compliance prep", completed: false },
    ],
    logo: "/brand/provly-logo.png",
    screenshots: [],
    cta_url: "/contact",
    video_url: null,
    features: [
      "Inventory Vault: Manage homes, rooms, items, and attached documents",
      "Claim Pack Export: Generate PDF, CSV, and ZIP claim-ready bundles",
      "Maintenance Reminders: Keep household care tasks on schedule",
    ],
    platform: "mobile",
    visibility: "published",
    progressPercent: 74,
    monetization: "Freemium",
  },
  {
    id: 1003,
    name: "NooBS Investing",
    slug: "noobs-investing",
    tagline: "Brutally honest investing education.",
    description:
      "Interactive investing education focused on discipline, behavior, and long-term wealth habits.",
    fullDescription:
      "NooBS Investing is a mobile-first educational simulator with structured lessons, market simulation tools, and behavioral guardrails designed to reduce gambling-style investing habits.",
    category: "FINANCE",
    status: "COMING_SOON",
    statusLabel: "Coming Soon",
    targetDate: null,
    techStack: ["React Native", "Expo Router", "SQLite"],
    progress: [
      { text: "Lessons, simulator, and core app flow", completed: true },
      { text: "Advanced analytics and pro feature scaffolds", completed: true },
      { text: "RevenueCat production integration", completed: false },
      { text: "Store review and onboarding polish", completed: false },
    ],
    logo: "/brand/noobs-investing-logo.png",
    screenshots: [],
    cta_url: "/contact",
    video_url: null,
    features: [
      "Residency Lessons: Follow structured investing education tracks",
      "Market Simulator: Practice discipline with behavior-driven scenarios",
      "Freedom Number Tracking: Measure long-term progress against goals",
    ],
    platform: "mobile",
    visibility: "published",
    progressPercent: 68,
    monetization: "Freemium",
  },
  {
    id: 1005,
    name: "PasoScore",
    slug: "pasoscore",
    tagline: "Clear steps for credit improvement.",
    description:
      "A mobile-first credit guidance app with deterministic month-by-month actions and multilingual support.",
    fullDescription:
      "PasoScore provides deterministic credit guidance with dual onboarding paths, step tracking, and educational modules while keeping strict privacy boundaries and avoiding credit bureau integrations.",
    category: "FINANCE",
    status: "ALPHA",
    statusLabel: "Alpha",
    targetDate: null,
    techStack: ["React Native", "Expo", "RevenueCat"],
    progress: [
      { text: "Deterministic onboarding and roadmap engine", completed: true },
      { text: "Multilingual UX and credit education modules", completed: true },
      { text: "RevenueCat paywall, restore, and account linking", completed: true },
      { text: "Store release hardening and production keys", completed: false },
    ],
    logo: "/brand/pasoscore-logo.png",
    screenshots: [],
    cta_url: "/contact",
    video_url: null,
    features: [
      "Deterministic Guidance Paths: Follow a clear month-by-month decision system",
      "Dual Onboarding: Start anonymously or personalize later",
      "Privacy-First Boundaries: No SSN collection and no credit report access",
    ],
    platform: "mobile",
    visibility: "published",
    progressPercent: 74,
    monetization: "Freemium",
  },
];

export function getCatalogApp(slug: string) {
  return CATALOG_APPS.find((app) => app.slug === slug) || null;
}
