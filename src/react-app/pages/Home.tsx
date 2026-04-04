import { Link } from "react-router";
import {
  ArrowRight,
  PhoneCall,
  Sparkles,
  Smartphone,
  HeartPulse,
  Gamepad2,
  Cpu,
  CreditCard,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import SEO from "@/react-app/components/SEO";
import { BRAND_ASSETS, SITE_NAME } from "@/react-app/lib/site";

type PortfolioItem = {
  nameKey: string;
  descriptionKey: string;
  outcomeKey: string;
  statusKey: string;
  link: string;
  image?: string;
  icon: typeof PhoneCall;
};

const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    nameKey: "home.portfolio_lead_title",
    descriptionKey: "home.portfolio_lead_desc",
    outcomeKey: "home.portfolio_lead_outcome",
    statusKey: "home.portfolio_status_service",
    link: "/missed-call-text-back",
    icon: PhoneCall,
  },
  {
    nameKey: "home.portfolio_nexus_title",
    descriptionKey: "home.portfolio_nexus_desc",
    outcomeKey: "home.portfolio_nexus_outcome",
    statusKey: "home.portfolio_status_close_to_launch",
    link: "/apps/nexusbuild",
    image: BRAND_ASSETS.nexusbuild,
    icon: Smartphone,
  },
  {
    nameKey: "home.portfolio_neuromove_title",
    descriptionKey: "home.portfolio_neuromove_desc",
    outcomeKey: "home.portfolio_neuromove_outcome",
    statusKey: "home.portfolio_status_close_to_launch",
    link: "/apps/neuromoves",
    image: BRAND_ASSETS.neuromoves,
    icon: HeartPulse,
  },
  {
    nameKey: "home.portfolio_provly_title",
    descriptionKey: "home.portfolio_provly_desc",
    outcomeKey: "home.portfolio_provly_outcome",
    statusKey: "home.portfolio_status_close_to_launch",
    link: "/apps/provly",
    image: BRAND_ASSETS.provly,
    icon: Gamepad2,
  },
  {
    nameKey: "home.portfolio_noobs_title",
    descriptionKey: "home.portfolio_noobs_desc",
    outcomeKey: "home.portfolio_noobs_outcome",
    statusKey: "home.portfolio_status_close_to_launch",
    link: "/apps/noobs-investing",
    image: BRAND_ASSETS.noobsInvesting,
    icon: Sparkles,
  },
  {
    nameKey: "home.portfolio_pasoscore_title",
    descriptionKey: "home.portfolio_pasoscore_desc",
    outcomeKey: "home.portfolio_pasoscore_outcome",
    statusKey: "home.portfolio_status_close_to_launch",
    link: "/apps/pasoscore",
    image: BRAND_ASSETS.pasoscore,
    icon: CreditCard,
  },
];

type PortfolioCardProps = PortfolioItem;

function PortfolioCard({
  nameKey,
  descriptionKey,
  outcomeKey,
  statusKey,
  link,
  image,
  icon: Icon,
}: PortfolioCardProps) {
  const { t } = useTranslation();
  const isService = nameKey === "home.portfolio_lead_title";

  return (
    <Link
      to={link}
      className="group rounded-3xl border border-border bg-card p-6 sm:p-7 transition-all hover:border-accent/50 hover:shadow-[0_18px_35px_rgba(88,171,255,0.16)]"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-background/80 overflow-hidden">
          {image ? (
            <img src={image} alt="" className="h-full w-full object-contain p-2" />
          ) : (
            <Icon className="h-5 w-5 text-accent" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
              {t(statusKey)}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {isService ? t("home.portfolio_type_service") : t("home.portfolio_type_app")}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-foreground">
            {t(nameKey)}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {t(descriptionKey)}
          </p>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-accent">
            {t(outcomeKey)}
          </p>
        </div>
      </div>
    </Link>
  );
}

function FeaturedPortfolioCard(props: PortfolioItem) {
  const { t } = useTranslation();
  const isService = props.nameKey === "home.portfolio_lead_title";

  return (
    <Link
      to={props.link}
      className="group relative overflow-hidden rounded-[2rem] border border-accent/35 bg-gradient-to-br from-card via-card to-accent/10 p-6 sm:p-8 lg:p-10 transition-all hover:border-accent/60 hover:shadow-[0_24px_60px_rgba(88,171,255,0.18)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(177,225,85,0.12),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(88,171,255,0.08),transparent_35%)] pointer-events-none" />
      <div className="relative z-10 flex flex-col gap-6 sm:gap-7">
        <div className="flex flex-wrap items-center justify-center gap-2 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
            {t(props.statusKey)}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {isService ? t("home.portfolio_type_service") : t("home.portfolio_type_app")}
          </span>
        </div>

        <div className="flex justify-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-accent/30 bg-accent/10 shadow-[0_0_0_1px_rgba(177,225,85,0.15)]">
            {props.image ? (
              <img src={props.image} alt="" className="h-full w-full object-contain p-3" />
            ) : (
              <PhoneCall className="h-7 w-7 text-accent" />
            )}
          </div>
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <h3 className="text-2xl sm:text-3xl lg:text-5xl font-black uppercase tracking-tighter text-foreground">
            {t(props.nameKey)}
          </h3>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
            {t(props.descriptionKey)}
          </p>
          <p className="mt-6 text-sm font-black uppercase tracking-[0.24em] text-accent">
            {t(props.outcomeKey)}
          </p>
        </div>

        <div className="flex flex-col gap-4 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {t("home.portfolio_lead_live_today")}
          </p>
          <span className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-black uppercase text-accent-foreground transition-transform group-hover:translate-x-0.5">
            {t("apps.open")}
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-14">
      <SEO
        title="Home"
        description={t("home.hero_subtitle")}
        keywords={t("seo.default_keywords")}
        canonicalUrl="/"
      />

      <section className="px-4 pt-16 sm:pt-20">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
            {SITE_NAME}
          </p>
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] text-foreground">
            {t("home.hero_title")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm sm:text-base leading-relaxed text-muted-foreground">
            {t("home.hero_subtitle")}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/apps"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-black uppercase text-accent-foreground transition-all hover:shadow-lg"
            >
              {t("home.hero_primary")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact?intent=start-project"
              className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-black uppercase text-foreground transition-all hover:border-accent"
            >
              {t("home.hero_secondary")}
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-accent">
              {t("home.portfolio_title")}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground">
              {t("home.portfolio_subtitle")}
            </p>
          </div>

          <div className="space-y-10">
            <FeaturedPortfolioCard {...PORTFOLIO_ITEMS[0]} />
            <div className="grid gap-10 md:grid-cols-2 lg:gap-12">
              {PORTFOLIO_ITEMS.slice(1).map((item) => (
                <PortfolioCard key={item.nameKey} {...item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10">
                <Cpu className="h-5 w-5 text-accent" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {t("home.about_title")}
              </h2>
            </div>
            <p className="max-w-3xl text-sm sm:text-base leading-relaxed text-muted-foreground">
              {t("home.about_text")}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <p className="text-sm font-black text-foreground">{t("home.about_point_1_title")}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t("home.about_point_1_desc")}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <p className="text-sm font-black text-foreground">{t("home.about_point_2_title")}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t("home.about_point_2_desc")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:pb-20">
        <div className="container mx-auto max-w-5xl">
          <div className="rounded-3xl border border-accent/40 bg-accent/5 p-6 sm:p-8 text-center">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              {t("home.final_cta_title")}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground">
              {t("home.final_cta_subtitle")}
            </p>
            <Link
              to="/contact?intent=start-project"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-black uppercase text-accent-foreground transition-all hover:shadow-lg"
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
