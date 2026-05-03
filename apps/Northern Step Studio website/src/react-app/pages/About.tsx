import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useMemo } from "react";
import type { Components } from "react-markdown";
import { Rocket, Code, Gamepad2, Cpu, Sparkles, ArrowRight, Smartphone, Zap } from "lucide-react";
import GlitchedText from "@/react-app/components/GlitchedText";
import SEO from "@/react-app/components/SEO";
import { BRAND_ASSETS } from "@/react-app/lib/site";
import { brandifyMarkdown, brandifyText, isBrandText } from "@/react-app/lib/brand";
import { useApps } from "@/react-app/hooks/useApps";
import { getAppCategoryLabel } from "@/react-app/lib/appCategories";
import { useSiteContent } from "@/react-app/hooks/useSiteContent";
import type { App } from "@/react-app/hooks/useApps";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function About() {
  const { t } = useTranslation();
  const { apps } = useApps();
  const { content: dynamicContent } = useSiteContent("about_content");

  // Translation keys from JSON locales (about.*)
  const pageLabel = t("about.label", { defaultValue: "Who We Are" });
  const pageTitle = t("about.title", { defaultValue: "Northern Step Studio" });
  const pageSubtitle = t("about.subtitle", {
    defaultValue:
      "Northern Step Studio is a hands-on product studio building practical software across home readiness, learning, hardware planning, and focused consumer utility.",
  });

  const storyTitle = t("about.story.title", { defaultValue: "What This Studio Actually Is" });
  const storyParagraphs = [
    t("about.story.p1", {
      defaultValue:
        "Northern Step Studio is a hands-on product studio, not a generic agency. We build software around specific real-world jobs: protecting a home inventory, planning a PC build, making investing easier to learn, supporting guided routines for children, and helping people improve credit with clearer next steps.",
    }),
    t("about.story.p2", {
      defaultValue:
        "That range is intentional. We like products with a practical edge, where UX clarity, trust, and structured workflows matter more than hype. Even when the categories look different, the design goal stays the same: reduce friction, raise confidence, and help users make better decisions.",
    }),
    t("about.story.p3", {
      defaultValue:
        "The studio is shaped by small-team discipline, real product iteration, and a bias toward building things people can keep using with clarity and confidence.",
    }),
  ];

  const mission = {
    label: t("about.mission.label", { defaultValue: "How We Work" }),
    title: t("about.mission.title", {
      defaultValue: "Small Team. Real Products. Long-Term Thinking.",
    }),
    description: t("about.mission.desc", {
      defaultValue:
        "We build deliberately, keep scope tied to the problem, and prefer clarity, privacy, and reliability over bloated feature lists. Northern Step Studio is meant to become a durable portfolio of focused products, not a pile of disconnected experiments.",
    }),
  };

  const portfolio = {
    label: t("apps.label", { defaultValue: "Current Portfolio" }),
    title: t("apps.title", { defaultValue: "Products Shaping the Studio" }),
    description: t("apps.subtitle", {
      defaultValue: "These are the products that best show what Northern Step Studio is building right now.",
    }),
    view: t("product.browse", { defaultValue: "View Product" }),
  };

  const valuesTitle = t("about.values.title", { defaultValue: "What Matters Here" });
  const focusTitle = t("about.focus.title", { defaultValue: "Where We're Focused" });

  const cta = {
    title: t("about.cta.title", { defaultValue: "Explore the Work" }),
    description: t("about.cta.desc", {
      defaultValue: "Browse the portfolio or reach out if you want to follow what the studio is building next.",
    }),
    explore: t("about.cta.explore", { defaultValue: "Explore Products" }),
    contact: t("about.cta.contact", { defaultValue: "Contact the Studio" }),
  };

  const values = [
    {
      icon: Sparkles,
      title: t("about.values.quality.title", { defaultValue: "Quality First" }),
      description: t("about.values.quality.desc", {
        defaultValue: "We never ship something we wouldn't use ourselves. Every detail matters.",
      }),
    },
    {
      icon: Zap,
      title: t("about.values.simplicity.title", { defaultValue: "Simplicity" }),
      description: t("about.values.simplicity.desc", {
        defaultValue: "Complex problems deserve elegant solutions. We make powerful tools feel effortless.",
      }),
    },
    {
      icon: Rocket,
      title: t("about.values.innovation.title", { defaultValue: "Innovation" }),
      description: t("about.values.innovation.desc", {
        defaultValue: "We embrace new technologies and approaches to stay ahead of the curve.",
      }),
    },
    {
      icon: Code,
      title: t("about.values.craft.title", { defaultValue: "Craftsmanship" }),
      description: t("about.values.craft.desc", {
        defaultValue: "We take pride in our work. Every line of code, every pixel, every interaction.",
      }),
    },
  ];

  const focus = [
    {
      icon: Gamepad2,
      title: t("about.focus.games.title", { defaultValue: "Mobile Games" }),
      description: t("about.focus.games.desc", {
        defaultValue: "Casual games that are fun, engaging, and perfect for quick play sessions.",
      }),
    },
    {
      icon: Smartphone,
      title: t("about.focus.apps.title", { defaultValue: "Productivity Apps" }),
      description: t("about.focus.apps.desc", {
        defaultValue: "Smart tools that help people learn, organize, and make better decisions.",
      }),
    },
    {
      icon: Cpu,
      title: t("about.focus.ai.title", { defaultValue: "AI-Powered Tools" }),
      description: t("about.focus.ai.desc", {
        defaultValue: "Intelligent assistants and product guidance that amplify human capabilities.",
      }),
    },
  ];

  const studioProducts = useMemo(() => {
    return apps.filter((app: App) => app.visibility !== "hidden").slice(0, 6);
  }, [apps]);

  const markdownComponents: Components = {
    strong: ({ children }) => (
      <strong className={isBrandText(children) ? "font-black text-accent" : "font-semibold text-foreground"}>
        {children}
      </strong>
    ),
  };

  return (
    <div className="min-h-screen pt-16 sm:pt-20 px-4 sm:px-6 pb-12">
      <SEO
        title="About Us"
        description="Learn how Northern Step Studio builds practical software across home readiness, finance education, guided support experiences, and hardware planning."
        keywords="about northern step studio, indie development studio, mobile app developers, game developers, business automation"
        canonicalUrl="/about"
      />
      <div className="container mx-auto max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-black border border-white/5 mb-5 overflow-hidden">
            <img src={BRAND_ASSETS.studioMark} alt="Northern Step Studio" className="w-full h-full object-contain p-0.5" />
          </div>
          <span className="text-label text-accent mb-2 block text-xs sm:text-sm">{pageLabel}</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-normal mb-4 leading-tight">
            <GlitchedText text={pageTitle} duration={600} className="text-accent" />
          </h1>
          <div className="max-w-2xl mx-auto">
             <p className="text-muted-foreground font-normal text-sm sm:text-base leading-relaxed">
              {brandifyText(pageSubtitle)}
            </p>
          </div>
        </div>

        {/* Story */}
        <div className="card-dark-wise mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-black border border-white/5 flex items-center justify-center overflow-hidden">
              <img src={BRAND_ASSETS.studioMark} alt="" className="w-full h-full object-contain p-1" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase">{storyTitle}</h2>
          </div>
          <div className="space-y-4 text-muted-foreground font-normal text-sm sm:text-base leading-relaxed">
            {dynamicContent ? (
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {brandifyMarkdown(dynamicContent)}
                </ReactMarkdown>
              </div>
            ) : (
              storyParagraphs.map((paragraph, idx) => (
                <p key={idx}>{brandifyText(paragraph)}</p>
              ))
            )}
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
              {brandifyText(mission.description)}
            </p>
          </div>
        </div>

        {/* Portfolio */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <span className="text-label text-accent mb-2 block text-xs sm:text-sm">{portfolio.label}</span>
            <h2 className="text-xl sm:text-2xl font-black uppercase mb-3">{portfolio.title}</h2>
            <p className="text-muted-foreground font-normal max-w-2xl mx-auto text-sm sm:text-base">
              {brandifyText(portfolio.description)}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studioProducts.map((app: App) => (
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
                    <p className="text-sm text-muted-foreground font-normal line-clamp-2">{app.description}</p>
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
                    <p className="text-sm text-muted-foreground font-normal leading-relaxed">{value.description}</p>
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
                <p className="text-sm text-muted-foreground font-normal leading-relaxed">{item.description}</p>
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
