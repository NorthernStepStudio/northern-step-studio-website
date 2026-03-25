import { Link } from "react-router";
import {
  ArrowRight,
  Gamepad2,
  Smartphone,
  Zap,
  Cpu,
  Target,
  Sparkles,
  Check,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import SEO from "@/react-app/components/SEO";
import { BRAND_ASSETS } from "@/react-app/lib/site";
import { useSiteContent } from "@/react-app/hooks/useSiteContent";
import type { LucideIcon } from "lucide-react";

type FocusArea = {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
};

const FOCUS_AREAS: FocusArea[] = [
  {
    icon: Smartphone,
    titleKey: "home.focus_area_apps_title",
    descKey: "home.focus_area_apps_desc",
  },
  {
    icon: Gamepad2,
    titleKey: "home.focus_area_gaming_title",
    descKey: "home.focus_area_gaming_desc",
  },
  {
    icon: Zap,
    titleKey: "home.focus_area_ai_title",
    descKey: "home.focus_area_ai_desc",
  },
  {
    icon: Cpu,
    titleKey: "home.focus_area_systems_title",
    descKey: "home.focus_area_systems_desc",
  },
];

type Testimonial = {
  quoteKey: string;
  authorKey: string;
  roleKey: string;
  highlightKey: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quoteKey: "home.testimonials.provly.quote",
    authorKey: "home.testimonials.provly.author",
    roleKey: "home.testimonials.provly.role",
    highlightKey: "home.testimonials.provly.highlight",
  },
  {
    quoteKey: "home.testimonials.nexus.quote",
    authorKey: "home.testimonials.nexus.author",
    roleKey: "home.testimonials.nexus.role",
    highlightKey: "home.testimonials.nexus.highlight",
  },
  {
    quoteKey: "home.testimonials.paso.quote",
    authorKey: "home.testimonials.paso.author",
    roleKey: "home.testimonials.paso.role",
    highlightKey: "home.testimonials.paso.highlight",
  },
];

type ProcessStep = {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
};

const PROCESS_STEPS: ProcessStep[] = [
  {
    icon: Target,
    titleKey: "home.process.discovery.title",
    descKey: "home.process.discovery.description",
  },
  {
    icon: Sparkles,
    titleKey: "home.process.build.title",
    descKey: "home.process.build.description",
  },
  {
    icon: Check,
    titleKey: "home.process.launch.title",
    descKey: "home.process.launch.description",
  },
];

const PROOF_LOGOS = [
  { src: BRAND_ASSETS.provly, alt: "Provly" },
  { src: BRAND_ASSETS.nexusbuild, alt: "NexusBuild" },
  { src: BRAND_ASSETS.noobsInvesting, alt: "NooBS Investing" },
  { src: BRAND_ASSETS.neuromoves, alt: "Neuromoves" },
  { src: BRAND_ASSETS.pasoscore, alt: "PasoScore" },
];
type PortfolioItem = {
  nameKey: string;
  descriptionKey: string;
  outcomeKey: string;
  link: string;
  badge: string;
};

const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    nameKey: "home.portfolio_nexus_title",
    descriptionKey: "home.portfolio_nexus_desc",
    outcomeKey: "home.portfolio_nexus_outcome",
    link: "/apps/nexusbuild",
    badge: "NexusBuild | Live",
  },
  {
    nameKey: "home.portfolio_provly_title",
    descriptionKey: "home.portfolio_provly_desc",
    outcomeKey: "home.portfolio_provly_outcome",
    link: "/apps/provly",
    badge: "ProvLy | Operational",
  },
  {
    nameKey: "home.portfolio_lead_title",
    descriptionKey: "home.portfolio_lead_desc",
    outcomeKey: "home.portfolio_lead_outcome",
    link: "/missed-call-text-back",
    badge: "Lead Recovery | Automation",
  },
];

export default function HomePage() {
  const { t } = useTranslation();
  const { content: dynamicHeroTitle } = useSiteContent("home_hero_title");
  const { content: dynamicHeroSubtitle } = useSiteContent("home_hero_subtitle");
  const heroTitle = dynamicHeroTitle
    ? dynamicHeroTitle
    : `${t("home.hero_line_1")} ${t("home.hero_line_2")}`;
  const heroPitch = dynamicHeroSubtitle || t("home.hero_pitch");

  return (
    <div className="space-y-16">
      <SEO title="Home" description={t("home.hero_subtitle")} keywords={t("seo.default_keywords")} canonicalUrl="/" />

      <section className="relative overflow-hidden px-4 pt-16 pb-12 sm:pt-20 sm:pb-16">
        <div className="pointer-events-none absolute top-12 left-1/4 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent/[0.08] blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-10 h-[360px] w-[360px] rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-4">
            Northern Step Studio
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-foreground mb-6">
            {heroTitle}
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">{heroPitch}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/apps"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-black uppercase text-accent-foreground transition-all hover:shadow-lg"
            >
              {t("home.cta_view_work")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact?intent=start-project"
              className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-black uppercase text-foreground transition-all hover:border-accent"
            >
              {t("home.cta_get_quote")}
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:pb-20 border-t border-border bg-gradient-to-b from-secondary/20 to-transparent">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="text-3xl sm:text-4xl font-black uppercase tracking-[0.3em] text-accent mb-3">
              {t("home.focus_title")}
            </p>
            <p className="text-sm sm:text-base text-muted-foreground">{t("home.focus_subtitle")}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {FOCUS_AREAS.map((area) => (
              <div key={area.titleKey} className="card-dark-wise flex flex-col gap-3 border border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
                    <area.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-foreground">{t(area.titleKey)}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(area.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:pb-20 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-2 text-center">
            <p className="text-3xl sm:text-4xl font-black uppercase tracking-[0.3em] text-accent">
              {t("home.portfolio_title")}
            </p>
            <p className="text-sm sm:text-base text-muted-foreground">{t("home.portfolio_subtitle")}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {PORTFOLIO_ITEMS.map((item) => (
              <Link
                key={item.nameKey}
                to={item.link}
                className="card-dark-wise flex flex-col gap-3 border border-border bg-card hover:border-accent/60 hover:shadow-[0_18px_35px_rgba(88,171,255,0.25)] transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-black tracking-tight text-foreground">{t(item.nameKey)}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{item.badge}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(item.descriptionKey)}</p>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{t(item.outcomeKey)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:pb-20 border-t border-border bg-gradient-to-b from-transparent via-secondary/30 to-transparent">
          <div className="container mx-auto max-w-6xl">
          <div className="hidden" aria-hidden="true">
            {/* Proof & Outcomes headline hidden temporarily */}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((entry) => (
              <article key={entry.quoteKey} className="card-dark-wise flex flex-col gap-4 border border-border">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">{t(entry.highlightKey)}</span>
                <p className="text-sm text-foreground leading-relaxed">{t(entry.quoteKey)}</p>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-foreground">{t(entry.authorKey)}</p>
                  <p className="text-[11px] text-muted-foreground">{t(entry.roleKey)}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            {PROOF_LOGOS.map((logo) => (
              <img key={logo.alt} src={logo.src} alt={logo.alt} className="h-6 grayscale opacity-70" />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:pb-20 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="text-3xl sm:text-4xl font-black uppercase tracking-[0.3em] text-accent">
              {t("home.process_title")}
            </p>
            <p className="text-sm sm:text-base text-muted-foreground">{t("home.process_subtitle")}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {PROCESS_STEPS.map((step) => (
              <div key={step.titleKey} className="card-dark-wise flex flex-col gap-3 border border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10">
                    <step.icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-foreground">{t(step.titleKey)}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(step.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:pb-20 border-t border-border">
        <div className="container mx-auto max-w-5xl">
          <div className="rounded-3xl border border-accent/60 bg-accent/5 p-8 text-center shadow-[0_12px_35px_rgba(6,182,212,0.12)]">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-accent mb-2">{t("home.final_cta_title")}</p>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">{t("home.final_cta_title")}</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">{t("home.final_cta_subtitle")}</p>
            <Link
              to="/contact?intent=start-project"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-black uppercase text-accent-foreground transition-all hover:shadow-lg"
            >
              {t("home.final_cta_button")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
