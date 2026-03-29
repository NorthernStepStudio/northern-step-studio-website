import {
  ArrowRight,
  Cpu,
  Home,
  Monitor,
  TrendingUp,
  HeartPulse,
  CreditCard,
  PhoneOff,
  Wrench,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import SEO from "@/react-app/components/SEO";
import StudioHomeLink from "@/react-app/components/StudioHomeLink";

export default function NStepWorkspaceAI() {
  const { t } = useTranslation();

  const products = [
    { name: "ProvLy", descKey: "workspace_ai.products.provly_desc", icon: Home },
    { name: "NexusBuild", descKey: "workspace_ai.products.nexusbuild_desc", icon: Monitor },
    { name: "NooBS Investing", descKey: "workspace_ai.products.noobs_desc", icon: TrendingUp },
    { name: "NeuroMoves", descKey: "workspace_ai.products.neuromoves_desc", icon: HeartPulse },
    { name: "PasoScore", descKey: "workspace_ai.products.pasoscore_desc", icon: CreditCard },
    { name: "Missed Call Text Back", descKey: "workspace_ai.products.mctb_desc", icon: PhoneOff },
  ];

  const principles = [
    t("workspace_ai.principles.0"),
    t("workspace_ai.principles.1"),
    t("workspace_ai.principles.2"),
  ];

  return (
    <div>
      <SEO
        title={t("workspace_ai.title")}
        description={t("seo.workspace_description")}
        keywords={t("seo.workspace_keywords")}
        canonicalUrl="/workspace-ai"
      />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-20 left-1/4 w-[400px] h-[400px] rounded-full bg-accent/[0.03] blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/[0.02] blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <div className="mb-8 flex justify-center">
            <StudioHomeLink />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 mb-6">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-black uppercase tracking-wider text-blue-400">{t("workspace_ai.label")}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter mb-8 leading-[0.9]">
            {t("workspace_ai.title")}
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 leading-relaxed">
            {t("workspace_ai.hero_subtitle")}
          </p>

          <p className="text-base text-muted-foreground max-w-3xl mx-auto mb-6 leading-relaxed">
            {t("workspace_ai.hero_description")}
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="py-20 px-4 sm:px-6 border-t border-border bg-gradient-to-b from-accent/[0.01] to-transparent">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 mb-6">
              <Wrench className="w-4 h-4 text-accent" />
              <span className="text-xs font-black uppercase tracking-wider text-accent">{t("workspace_ai.portfolio_label")}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-4">
              {t("workspace_ai.portfolio_title")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("workspace_ai.portfolio_subtitle")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.name} className="card-dark-wise flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <product.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-black uppercase text-sm">{product.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(product.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-20 px-4 sm:px-6 border-t border-border bg-gradient-to-b from-transparent via-blue-500/[0.03] to-transparent">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-4">
              {t("workspace_ai.philosophy_title")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("workspace_ai.philosophy_subtitle")}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mb-14">
            {principles.map((principle, i) => (
              <div key={i} className="card-dark-wise text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-accent font-black">
                  {i + 1}
                </div>
                <p className="font-bold text-foreground">{principle}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-muted-foreground max-w-2xl mx-auto">
            {t("workspace_ai.footer_note")}
          </p>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-4 sm:px-6 border-t border-border">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="card-dark-wise">
            <div className="inline-flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              {t("workspace_ai.footer_note")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/apps" className="btn-pill-primary inline-flex items-center gap-2">
                {t("workspace_ai.explore_products")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/contact" className="btn-pill-ghost">
                {t("workspace_ai.talk_to_studio")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
