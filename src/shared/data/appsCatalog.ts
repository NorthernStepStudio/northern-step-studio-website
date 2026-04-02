
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
    id: 1004,
    name: "Lead Recovery Service",
    slug: "missed-call-text-back",
    tagline: "Every missed call becomes a second chance.",
    description:
      "Automated missed-call recovery that instantly texts, qualifies, and follows up with leads so you never lose a job again.",
    fullDescription:
      "NStep Missed Call Text Back is the lead recovery engine for local service businesses that cannot afford to lose jobs when the phone is missed. It responds immediately, qualifies the caller, and keeps the conversation moving until you can step in.",
    category: "HOME",
    status: "LIVE",
    statusLabel: "Live",
    targetDate: null,
    techStack: ["ResponseOS", "Twilio", "Lead Routing", "SMS Automation"],
    progress: [{ text: "Live lead recovery workflow", completed: true }],
    logo: "/brand/studio-mark.png",
    screenshots: [],
    cta_url: "/request-setup-review",
    video_url: null,
    features: [
      "Missed Call Recovery: Text back instantly when no one answers the phone",
      "Smart Qualification: Ask short questions to route the lead correctly",
      "Owner Summary: Keep the follow-up concise and actionable",
    ],
    platform: "web",
    visibility: "published",
    progressPercent: 100,
    monetization: "Service",
  },
  {
    id: 1001,
    name: "NexusBuild",
    slug: "nexusbuild",
    tagline: "Build smarter. Not just faster.",
    description:
      "AI-powered PC build intelligence that analyzes performance, compatibility, and real-world value before you buy.",
    fullDescription:
      "NexusBuild is an AI-powered PC build companion that helps people compare parts, validate compatibility, and plan better hardware choices without guesswork. It keeps the tradeoffs visible so the build stays grounded in real performance and value.",
    category: "AI TOOL",
    status: "BETA",
    statusLabel: "Beta",
    targetDate: "Q3 2026",
    techStack: ["React Native", "React", "PostgreSQL"],
    progress: [
      { text: "Mobile app, web app, and backend foundation", completed: true },
      { text: "Compatibility engine and build management", completed: true },
      { text: "AI recommendation workflow", completed: true },
      { text: "Price tracking and deal alert surfaces", completed: true },
    ],
    logo: "/brand/nexusbuild-logo.png",
    screenshots: [],
    cta_url: "https://drive.google.com/uc?export=download&id=1xkZFmxgmZisxI3XttBL9Q3fzAK4obqe0",
    video_url: null,
    features: [
      "AI Recommendations: Compare budget, performance, and intent before buying parts",
      "Compatibility Engine: Check socket, power, and fit constraints before the build goes wrong",
      "Build and Deal Tracking: Save builds, compare options, and watch pricing in one place",
    ],
    platform: "mobile",
    visibility: "published",
    progressPercent: 84,
    monetization: "Free",
  },
  {
    id: 1006,
    name: "Neuromove",
    slug: "neuromoves",
    tagline: "Guided OT Companion for Children",
    description:
      "A guided occupational therapy companion for young children, with structured routines, parent tools, and progress tracking.",
    fullDescription:
      "Neuromove is designed around structured movement, communication, and routine-building activities for children. It combines approachable visuals, guided prompts, parent-facing tools, and therapy-friendly reporting to keep the app useful outside of a single session.",
    category: "THERAPY",
    status: "BETA",
    statusLabel: "Beta",
    targetDate: "Q3 2026",
    techStack: ["React Native", "Therapy Activities", "Parent Profiles"],
    progress: [
      { text: "Core OT activity flows, auth, and onboarding", completed: true },
      { text: "Child profile management and routine setup", completed: true },
      { text: "Text-to-speech guidance and haptic feedback", completed: true },
      { text: "Progress reports, journal, and rewards systems", completed: true },
      { text: "Production billing and auth hardening", completed: false },
      { text: "Therapy content QA and launch cleanup", completed: false },
    ],
    logo: "/brand/neuromoves-logo.png",
    screenshots: [],
    cta_url: "/contact",
    video_url: null,
    features: [
      "Errorless Learning Activities: Guide children through structured tasks with gentle feedback instead of failure-heavy loops",
      "Parent and Therapist Tools: Manage child profiles, routines, journals, and progress reporting in one place",
      "Engagement Systems: Use rewards, avatar progression, and guided prompts to keep routines consistent",
    ],
    platform: "mobile",
    visibility: "published",
    progressPercent: 63,
    monetization: "Free",
  },
  {
    id: 1002,
    name: "ProvLy",
    slug: "provly",
    tagline: "Know what you own. Prove it when it matters.",
    description:
      "A home inventory system that turns your belongings into claim-ready records for insurance, loss, or emergencies.",
    fullDescription:
      "ProvLy is a privacy-first home inventory vault designed for insurance readiness and long-term household care. It keeps inventory records, receipts, warranties, exports, and reminders in one place without turning the product into a bloated enterprise platform.",
    category: "HOME",
    status: "BETA",
    statusLabel: "Beta",
    targetDate: "Q4 2026",
    techStack: ["React Native", "SQLite", "Claim Pack Export"],
    progress: [
      { text: "Homes, rooms, and item capture flow", completed: true },
      { text: "Receipt, warranty, and document attachment flow", completed: true },
      { text: "Claim Pack export for insurance-ready reports", completed: true },
      { text: "Maintenance reminder engine", completed: true },
    ],
    logo: "/brand/provly-logo.png",
    screenshots: [],
    cta_url: "https://drive.google.com/uc?export=download&id=1-HgGFNgREMH3v_s3SvygVBBaLD4lXtCI",
    video_url: null,
    features: [
      "Claim Pack Export: Generate PDF, CSV, and ZIP exports with receipts, photos, and item records",
      "Maintenance Reminders: Keep appliances and equipment on predictable care schedules",
      "AI Assist: Use optional scan assist to speed up setup",
    ],
    platform: "mobile",
    visibility: "published",
    progressPercent: 76,
    monetization: "Free",
  },
  {
    id: 1003,
    name: "NooBS Investing",
    slug: "noobs-investing",
    tagline: "Learn investing by doing, not guessing.",
    description:
      "A guided investing system that teaches you how money actually grows, step by step, without confusion.",
    fullDescription:
      "NooBS Investing is a mobile-first learning companion built to make intimidating finance concepts easier to absorb. It blends structured lessons, interactive practice, and visual feedback into a product that feels approachable instead of academic.",
    category: "FINANCE",
    status: "BETA",
    statusLabel: "Beta",
    targetDate: "Q2 2026",
    techStack: ["React Native", "Interactive Lessons", "Gamified Learning"],
    progress: [
      { text: "Language-first onboarding and lesson flow", completed: true },
      { text: "Core mini-games and learning modules", completed: true },
      { text: "Portfolio analytics and progress systems", completed: true },
      { text: "Premium paywall and entitlement scaffold", completed: true },
    ],
    logo: "/brand/noobs-investing-logo.png",
    screenshots: [],
    cta_url: "https://drive.google.com/uc?export=download&id=1Sf7j0viRyWQGPPmXE-rww5SI2l4Qmsd1",
    video_url: null,
    features: [
      "Structured Lessons: Learn core investing ideas through guided flows",
      "Interactive Simulations: Practice concepts with behavior-driven mini-games",
      "Visual Progress Systems: Track understanding and momentum clearly",
    ],
    platform: "mobile",
    visibility: "published",
    progressPercent: 72,
    monetization: "Free",
  },
  {
    id: 1005,
    name: "PasoScore",
    slug: "pasoscore",
    tagline: "Clear steps for credit improvement.",
    description:
      "A deterministic credit builder companion that walks users through month-by-month improvement steps without bureau access.",
    fullDescription:
      "PasoScore is a mobile-first credit guidance app that walks users through month-by-month improvement steps with deterministic decision paths, multilingual support, and privacy-first boundaries. It keeps the process understandable without pretending to be a credit bureau product.",
    category: "FINANCE",
    status: "ALPHA",
    statusLabel: "Alpha",
    targetDate: "Q3 2026",
    techStack: ["React Native", "Decision Tree Engine", "RevenueCat"],
    progress: [
      { text: "Dual onboarding for anonymous and personalized paths", completed: true },
      { text: "Deterministic roadmap engine and step tracking", completed: true },
      { text: "Multilingual UX across Spanish, English, and Italian", completed: true },
      { text: "Letter generator and PDF export flow", completed: false },
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
    progressPercent: 58,
    monetization: "Free",
  },
];

export function getCatalogApp(slug: string) {
  return CATALOG_APPS.find((app) => app.slug === slug) || null;
}
