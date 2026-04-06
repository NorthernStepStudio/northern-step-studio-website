import { MessageSquareText, Globe, Smartphone, Database, Zap, Clock, DollarSign, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AdminProposals() {
  const { t } = useTranslation();

  const whatYouGet = [
    {
      icon: Globe,
      title: "Website",
      details: t("services.proposal.what_you_get.website"),
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      icon: Smartphone,
      title: "Mobile App",
      details: t("services.proposal.what_you_get.mobile"),
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      icon: Database,
      title: "Backend System",
      details: t("services.proposal.what_you_get.backend"),
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
    {
      icon: Zap,
      title: "Automation",
      details: t("services.proposal.what_you_get.automation"),
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
    },
  ];

  const processSteps = [
    "Planning (features + structure)",
    "Design (UI/UX)",
    "Development (app + site + backend)",
    "Testing",
    "Launch",
  ];

  const pricingTiers = [
    { label: "Starter", price: "$500–$1,500" },
    { label: "Standard", price: "$1,500–$3,500" },
    { label: "Advanced", price: "$3,500–$7,500+" },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="card-dark-wise border-accent/20 bg-accent/5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-accent">
              <MessageSquareText className="h-3 w-3" />
              {t("services.proposal.badge")}
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
              {t("services.proposal.title")}
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl font-normal">
              {t("services.proposal.overview")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* What You Get */}
        <div className="card-dark-wise space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-black uppercase text-foreground">
              {t("services.proposal.what_you_get.title")}
            </h2>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
              Business Systems & Operations
            </p>
          </div>

          <div className="grid gap-4">
            {whatYouGet.map((item) => (
              <div key={item.title} className="flex gap-4 p-4 rounded-2xl border border-border bg-background/50">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.bgColor} ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                    {item.details}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 flex items-center gap-3">
            <Zap className="h-4 w-4 text-accent" />
            <p className="text-xs font-black uppercase text-accent tracking-wide">
              {t("services.proposal.revenue_driver")}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Process & Timeline */}
          <div className="card-dark-wise space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-black uppercase text-foreground">
                {t("services.proposal.process.title")}
              </h2>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-6 relative">
                {processSteps.map((step, idx) => (
                  <div key={step} className="flex items-center gap-4 pl-4">
                    <div className="absolute left-4 -translate-h-1/2 w-4 h-4 rounded-full bg-background border-2 border-accent z-10 -ml-2" />
                    <div className="flex-1 rounded-xl border border-border bg-background/40 p-3 ml-4">
                      <p className="text-xs font-black uppercase text-foreground">
                        Step {idx + 1}: {step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-black uppercase text-foreground">
                  {t("services.proposal.timeline.title")}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 font-normal">
                <div className="rounded-xl border border-border bg-secondary/30 p-3">
                  <p className="text-xs text-muted-foreground">{t("services.proposal.timeline.basic")}</p>
                </div>
                <div className="rounded-xl border border-border bg-secondary/30 p-3">
                  <p className="text-xs text-muted-foreground">{t("services.proposal.timeline.full")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="card-dark-wise space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black uppercase text-foreground">
                {t("services.proposal.pricing.title")}
              </h2>
              <DollarSign className="h-5 w-5 text-accent" />
            </div>

            <div className="space-y-3">
              {pricingTiers.map((tier) => (
                <div key={tier.label} className="flex items-center justify-between p-3 rounded-xl border border-border bg-background/40 text-sm">
                  <span className="font-black uppercase text-muted-foreground">{tier.label}</span>
                  <span className="font-bold text-foreground">{tier.price}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-emerald-400">
                  {t("services.proposal.pricing.monthly.title")}
                </h3>
                <span className="text-sm font-black font-bold text-emerald-400">
                  {t("services.proposal.pricing.monthly.price")}
                </span>
              </div>
              <p className="text-xs text-emerald-400/80 font-normal">
                {t("services.proposal.pricing.monthly.desc")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-dark-wise text-center py-10 space-y-4">
        <blockquote className="text-xl md:text-2xl font-black uppercase tracking-tight text-foreground max-w-3xl mx-auto italic">
          "{t("services.proposal.positioning")}"
        </blockquote>
        <div className="flex items-center justify-center gap-2 text-accent">
          <CheckCircle2 className="h-5 w-5" />
          <p className="text-sm font-black uppercase tracking-wider">The Northern Step Standard</p>
        </div>
      </div>
    </div>
  );
}
