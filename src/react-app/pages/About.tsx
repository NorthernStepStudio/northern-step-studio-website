import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Mountain, Target, Rocket, Heart, Code, Gamepad2, Cpu, Sparkles, ArrowRight } from "lucide-react";
import GlitchedText from "@/react-app/components/GlitchedText";
import SEO from "@/react-app/components/SEO";
import { BRAND_ASSETS } from "@/react-app/lib/site";
import { useApps } from "@/react-app/hooks/useApps";
import { getAppCategoryLabel } from "@/react-app/lib/appCategories";

export default function About() {
  const { t } = useTranslation();
  const { apps } = useApps();
  const pageLabel = t("about_page.label", { defaultValue: "Who We Are" });
  const pageTitle = t("about_page.title", { defaultValue: "Northern Step Studio" });
  const pageSubtitle = t("about_page.subtitle", {
    defaultValue:
      "Northern Step Studio is a hands-on product studio building practical software across home readiness, learning, therapy support, hardware planning, and service automation.",
  });
  const storyTitle = t("about_page.story.title", { defaultValue: "What This Studio Actually Is" });
  const storyParagraphs = [
    t("about_page.story.p1", {
      defaultValue:
        "Northern Step Studio is a hands-on product studio, not a generic agency. We build software around specific real-world jobs: protecting a home inventory, planning a PC build, making investing easier to learn, supporting guided routines for children, and helping people improve credit with clearer next steps.",
    }),
    t("about_page.story.p2", {
      defaultValue:
        "That range is intentional. We like products with a practical edge, where UX clarity, trust, and structured workflows matter more than hype. Even when the categories look different, the design goal stays the same: reduce friction, raise confidence, and help users make better decisions.",
    }),
    t("about_page.story.p3", {
      defaultValue:
        "We also build operational systems for automated lead recovery, where speed and execution matter for service businesses. Across all of it, the studio is shaped by small-team discipline, real product iteration, and a bias toward building things people can keep using.",
    }),
  ];
  const mission = {
    label: t("about_page.mission.label", { defaultValue: "How We Work" }),
    title: t("about_page.mission.title", {
      defaultValue: "Small Team. Real Products. Long-Term Thinking.",
    }),
    description: t("about_page.mission.desc", {
      defaultValue:
        "We build deliberately, keep scope tied to the problem, and prefer clarity, privacy, and reliability over bloated feature lists. Northern Step Studio is meant to become a durable portfolio of focused products, not a pile of disconnected experiments.",
    }),
  };
  const portfolio = {
    label: t("about_page.portfolio.label", { defaultValue: "Current Portfolio" }),
    title: t("about_page.portfolio.title", { defaultValue: "Products Shaping the Studio" }),
    description: t("about_page.portfolio.desc", {
      defaultValue: "These are the products that best show what Northern Step Studio is building right now.",
    }),
    view: t("about_page.portfolio.view", { defaultValue: "View Product" }),
  };
  const valuesTitle = t("about_page.values.title", { defaultValue: "What Matters Here" });
  const focusTitle = t("about_page.focus.title", { defaultValue: "Where We're Focused" });
  const cta = {
    title: t("about_page.cta.title", { defaultValue: "Explore the Work" }),
    description: t("about_page.cta.desc", {
      defaultValue: "Browse the portfolio or reach out if you want to follow what the studio is building next.",
    }),
    explore: t("about_page.cta.explore", { defaultValue: "Explore Products" }),
    contact: t("about_page.cta.contact", { defaultValue: "Contact the Studio" }),
  };

  const values = [
    {
      icon: Heart,
      title: t("about_page.values.utility.title", { defaultValue: "Useful Over Hype" }),
      description: t("about_page.values.utility.desc", {
        defaultValue: "We judge work by whether it solves the job well, not by whether it sounds impressive.",
      }),
    },
    {
      icon: Target,
      title: t("about_page.values.clarity.title", { defaultValue: "Clear Beats Clever" }),
      description: t("about_page.values.clarity.desc", {
        defaultValue: "If an experience is confusing, we keep refining until it feels direct and obvious.",
      }),
    },
    {
      icon: Rocket,
      title: t("about_page.values.systems.title", { defaultValue: "Systems Thinking" }),
      description: t("about_page.values.systems.desc", {
        defaultValue: "We design products, data, and automation as parts of a larger ecosystem that can grow with the studio.",
      }),
    },
    {
      icon: Code,
      title: t("about_page.values.trust.title", { defaultValue: "Earned Trust" }),
      description: t("about_page.values.trust.desc", {
        defaultValue: "Better details, stronger execution, and consistent quality are how we earn trust over time.",
      }),
    },
  ];

  const focus = [
    {
      icon: Gamepad2,
      title: t("about_page.focus.consumer.title", { defaultValue: "Home, Finance, and Planning Tools" }),
      description: t("about_page.focus.consumer.desc", {
        defaultValue:
          "Products like ProvLy, NooBS Investing, PasoScore, and NexusBuild help people stay organized and make clearer decisions.",
      }),
    },
    {
      icon: Cpu,
      title: t("about_page.focus.guided.title", { defaultValue: "Guided Learning and Support" }),
      description: t("about_page.focus.guided.desc", {
        defaultValue:
          "Products like NeuroMoves turn structured routines, progress tracking, and support workflows into approachable experiences.",
      }),
    },
    {
      icon: Sparkles,
      title: t("about_page.focus.ops.title", { defaultValue: "Automation for Service Work" }),
      description: t("about_page.focus.ops.desc", {
        defaultValue:
          "Internal systems and Lead Recovery tools focus on faster response, qualification, and operational follow-through.",
      }),
    },
  ];

  const studioProducts = apps.filter((app) => app.visibility !== "hidden").slice(0, 5);

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 pb-12">
      <SEO
        title="About Us"
        description="Learn how Northern Step Studio builds practical software across home readiness, finance education, guided support experiences, hardware planning, and lead recovery automation."
        keywords="about northern step studio, indie development studio, mobile app developers, game developers, lead recovery, business automation"
        canonicalUrl="/about"
      />
      <div className="container mx-auto max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-accent/10 border border-accent/30 mb-6">
            <img src={BRAND_ASSETS.studioMark} alt="Northern Step Studio" className="w-16 h-16 sm:w-20 sm:h-20" />
          </div>
          <span className="text-label text-accent mb-2 block text-xs sm:text-sm">{pageLabel}</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter mb-4">
            <GlitchedText text={pageTitle} duration={600} />
          </h1>
          <p className="text-muted-foreground font-normal max-w-2xl mx-auto text-sm sm:text-base">
            {pageSubtitle}
          </p>
        </div>

        {/* Story */}
        <div className="card-dark-wise mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Mountain className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase">{storyTitle}</h2>
          </div>
          <div className="space-y-4 text-muted-foreground font-normal text-sm sm:text-base leading-relaxed">
            {storyParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Mission */}
        <div className="card-dark-wise mb-8 border-accent/30">
          <div className="text-center">
            <span className="text-label text-accent mb-3 block text-xs sm:text-sm">{mission.label}</span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-wide mb-4">
              {mission.title}
            </h2>
            <p className="text-muted-foreground font-normal max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              {mission.description}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <div className="text-center mb-6">
            <span className="text-label text-accent mb-2 block text-xs sm:text-sm">{portfolio.label}</span>
            <h2 className="text-xl sm:text-2xl font-black uppercase mb-3">{portfolio.title}</h2>
            <p className="text-muted-foreground font-normal max-w-2xl mx-auto text-sm sm:text-base">
              {portfolio.description}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studioProducts.map((app) => (
              <Link
                key={app.slug}
                to={`/apps/${app.slug}`}
                className="card-dark-wise group block hover:border-accent/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/60 border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img
                      src={app.logo || BRAND_ASSETS.studioMark}
                      alt={app.name}
                      className="w-full h-full object-contain p-2.5"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[11px] font-black uppercase tracking-wide text-accent">
                        {app.statusLabel}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                        {getAppCategoryLabel(app.category)}
                      </span>
                    </div>
                    <h3 className="font-black uppercase text-base sm:text-lg mb-1">{app.name}</h3>
                    <p className="text-sm font-bold text-foreground/80 mb-2">{app.tagline}</p>
                    <p className="text-sm text-muted-foreground font-normal">{app.description}</p>
                    <span className="inline-flex items-center gap-2 mt-3 text-sm font-black uppercase text-accent">
                      {portfolio.view}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-black uppercase mb-6 text-center">{valuesTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map((value, index) => (
              <div key={index} className="card-dark-wise">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <value.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-base sm:text-lg mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground font-normal">{value.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Focus Areas */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-black uppercase mb-6 text-center">{focusTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {focus.map((item, index) => (
              <div key={index} className="card-dark-wise text-center">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="font-black uppercase text-base sm:text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground font-normal">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="card-dark-wise text-center">
          <h2 className="text-xl sm:text-2xl font-black uppercase mb-4">{cta.title}</h2>
          <p className="text-muted-foreground font-normal mb-6 text-sm sm:text-base max-w-lg mx-auto">
            {cta.description}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/apps" className="btn-pill-primary group w-full sm:w-auto">
              {cta.explore}
              <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/contact" className="btn-pill-ghost w-full sm:w-auto">
              {cta.contact}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
