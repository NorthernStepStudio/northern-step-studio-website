import { useState, useEffect } from "react";
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
import { useApps, type App } from "@/react-app/hooks/useApps";
import SEO from "@/react-app/components/SEO";
import { BRAND_ASSETS } from "@/react-app/lib/site";
import { useSiteContent } from "@/react-app/hooks/useSiteContent";
import type { LucideIcon } from "lucide-react";

const getCategoryIcon = (category: string | null | undefined) => {
  switch (category?.toLowerCase()) {
    case "tool":
      return Zap;
    case "ai tool":
      return Cpu;
    case "education":
      return Sparkles;
    case "finance":
      return Target;
    case "home":
      return Smartphone;
    case "therapy":
      return Check;
    case "game":
      return Gamepad2;
    default:
      return Cpu;
  }
};

const getStatusColor = (statusLabel: string) => {
  switch (statusLabel?.toLowerCase()) {
    case "alpha":
      return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    case "prototype":
      return "bg-accent/10 text-accent border-accent/30";
    case "design":
      return "bg-purple-500/10 text-purple-400 border-purple-500/30";
    case "concept":
      return "bg-muted/20 text-muted-foreground border-border";
    case "beta":
      return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    case "live":
      return "bg-success/10 text-success border-success/30";
    default:
      return "bg-muted/10 text-muted-foreground border-border";
  }
};

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

type FeatureToggle = {
  feature_key: string;
  is_enabled: boolean | number;
};

function PortfolioCard({ app }: { app: App }) {
  const { t } = useTranslation();
  const IconComponent = getCategoryIcon(app.category);
  const summary = app.tagline || app.description || t("home.portfolio_default_description");

  return (
    <Link
      to={`/apps/${app.slug}`}
      className="card-dark-wise flex flex-col gap-3 border border-border bg-card hover:border-accent/60 hover:shadow-[0_18px_35px_rgba(88,171,255,0.25)] transition-all"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-secondary/40">
            {app.logo ? (
              <img src={app.logo} alt={app.name} className="h-8 w-8 object-contain" />
            ) : (
              <IconComponent className="h-6 w-6 text-accent" />
            )}
          </div>
          <h3 className="text-lg font-black tracking-tight text-foreground">{app.name}</h3>
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border px-3 py-1 ${getStatusColor(
            app.statusLabel,
          )}`}
        >
          {app.statusLabel}
        </span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{summary}</p>
    </Link>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  const { apps: allApps, isLoading } = useApps();
  const { content: dynamicHeroTitle } = useSiteContent("home_hero_title");
  const { content: dynamicHeroSubtitle } = useSiteContent("home_hero_subtitle");
  const apps = allApps.filter((app) => app.visibility === "published");
  const [appsFeatureEnabled, setAppsFeatureEnabled] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAppsFeature = async () => {
      try {
        const res = await fetch("/api/feature-toggles");
        const data = await res.json();
        const features: FeatureToggle[] = Array.isArray(data) ? data : [];
        const appsFeature = features.find((feature) => feature.feature_key === "apps");
        if (isMounted) {
          setAppsFeatureEnabled(appsFeature?.is_enabled !== false);
        }
      } catch (err) {
        console.error("Failed to check apps feature:", err);
      }
    };

    checkAppsFeature();

    return () => {
      isMounted = false;
    };
  }, []);

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
            <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-accent mb-2">{t("home.focus_title")}</p>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-3">{t("home.focus_title")}</h2>
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
            <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-accent">{t("home.portfolio_title")}</p>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground">{t("home.portfolio_title")}</h2>
            <p className="text-sm sm:text-base text-muted-foreground">{t("home.portfolio_subtitle")}</p>
          </div>

          {appsFeatureEnabled ? (
            <div className="grid gap-5 md:grid-cols-2">
              {isLoading ? (
                [1, 2].map((card) => <div key={card} className="card-dark-wise animate-pulse h-52" />)
              ) : apps.length > 0 ? (
                apps.map((app) => <PortfolioCard key={app.id} app={app} />)
              ) : (
                <p className="text-center text-muted-foreground">{t("home.portfolio_empty")}</p>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">{t("home.portfolio_disabled")}</p>
          )}
        </div>
      </section>

      <section className="px-4 pb-16 sm:pb-20 border-t border-border bg-gradient-to-b from-transparent via-secondary/30 to-transparent">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-accent">{t("home.testimonials_title")}</p>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground">{t("home.testimonials_title")}</h2>
            <p className="text-sm sm:text-base text-muted-foreground">{t("home.testimonials_subtitle")}</p>
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
            <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-accent">{t("home.process_title")}</p>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground">{t("home.process_title")}</h2>
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
