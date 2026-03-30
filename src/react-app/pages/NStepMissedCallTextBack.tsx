import {
  ArrowRight,
  ClipboardList,
  Clock3,
  Check,
  FileText,
  MessageSquareText,
  PhoneCall,
  Shield,
  TrendingUp,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import SEO from "@/react-app/components/SEO";

export default function NStepMissedCallTextBack() {
  const { t } = useTranslation();

  const setupHref = "/contact?intent=setup-review&source=missed_call_offer";
  const demoHref = "/contact?intent=lead-recovery-demo&source=missed_call_offer";
  const publicDemoHref = "/missed-call-text-back/demo";

  const valueCards = [
    {
      icon: PhoneCall,
      label: t("mctb_page.value_cards.what_is.label"),
      title: t("mctb_page.value_cards.what_is.title"),
      description: t("mctb_page.value_cards.what_is.desc"),
    },
    {
      icon: ClipboardList,
      label: t("mctb_page.value_cards.what_does.label"),
      title: t("mctb_page.value_cards.what_does.title"),
      description: t("mctb_page.value_cards.what_does.desc"),
    },
    {
      icon: Users,
      label: t("mctb_page.value_cards.who_for.label"),
      title: t("mctb_page.value_cards.who_for.title"),
      description: t("mctb_page.value_cards.who_for.desc"),
    },
  ];

  const workflowSteps = [
    {
      icon: PhoneCall,
      step: "Step 1",
      title: t("mctb_page.workflow.step1.title"),
      description: t("mctb_page.workflow.step1.desc"),
    },
    {
      icon: MessageSquareText,
      step: "Step 2",
      title: t("mctb_page.workflow.step2.title"),
      description: t("mctb_page.workflow.step2.desc"),
    },
    {
      icon: Wrench,
      step: "Step 3",
      title: t("mctb_page.workflow.step3.title"),
      description: t("mctb_page.workflow.step3.desc"),
    },
    {
      icon: FileText,
      step: "Step 4",
      title: t("mctb_page.workflow.step4.title"),
      description: t("mctb_page.workflow.step4.desc"),
    },
  ];

  const packageItems = [
    "Instant text reply to missed calls",
    "Qualifies the customer in seconds",
    "Detects urgency (same-day vs later)",
    "Sends you a clean lead summary",
    "Built-in compliance (STOP / HELP)",
  ];

  const pricingTiers = [
    {
      name: "Starter",
      badge: "Best first step",
      audience: "Solo operators, small shops, and low-volume service teams that want a focused first automation.",
      setup: "$500",
      monthly: "$200-$300/mo",
      accent: "yellow",
      cta: "/contact?intent=setup-review&tier=starter&source=missed_call_offer",
      items: [
        "Missed-call auto-response",
        "Basic lead capture",
        "Urgency check",
        "Owner summary",
      ],
    },
    {
      name: "Pro",
      badge: "For growing teams",
      audience: "Businesses handling multiple new calls a day and wanting stronger automation.",
      setup: "$750-$1200",
      monthly: "$300-$500/mo",
      accent: "accent",
      cta: "/contact?intent=setup-review&tier=pro&source=missed_call_offer",
      items: [
        "Everything in Starter",
        "Lead qualification flow",
        "Better categorization",
        "Follow-up messaging",
      ],
    },
    {
      name: "Elite",
      badge: "For heavier workflows",
      audience: "Busy operators who want more logic, deeper routing, and higher-touch automation.",
      setup: "$1200-$2000+",
      monthly: "$500-$800+/mo",
      accent: "blue",
      cta: "/contact?intent=setup-review&tier=elite&source=missed_call_offer",
      items: [
        "Everything in Pro",
        "Multi-step conversations",
        "Scheduling and quote logic",
        "Priority handling",
      ],
    },
  ];

  const ownerSummary = [
    { label: "Customer", value: "John" },
    { label: "Issue", value: "Leak under sink" },
    { label: "Priority", value: "High" },
    { label: "Recommended Action", value: "Same-day callback" },
  ];

  return (
    <div>
      <SEO
        title={t("mctb.title")}
        description={t("seo.mctb_description")}
        keywords={t("seo.mctb_keywords")}
        canonicalUrl="/missed-call-text-back"
      />

      <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-20 left-1/4 w-[400px] h-[400px] rounded-full bg-accent/[0.03] blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-yellow-500/[0.02] blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-4xl relative z-10 text-center">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 mb-6">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-black uppercase tracking-wider text-yellow-400">{t("mctb_page.hero.badge")}</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-normal mb-4 leading-tight">
            {t("mctb_page.hero.title")}
          </h1>

          <p className="text-xl sm:text-2xl text-accent font-bold mb-6">
            {t("mctb_page.hero.subtitle")}
          </p>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 font-normal">
            {t("mctb_page.hero.description")}
          </p>

          <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-yellow-400">
              {t("mctb_page.hero.demo_badge")}
            </span>
            <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              {t("mctb_page.hero.summary_badge")}
            </span>
            <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              {t("mctb_page.hero.compliance_badge")}
            </span>
            <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              {t("mctb_page.hero.verticals_badge")}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={setupHref} className="btn-pill-primary group w-full sm:w-auto">
              Request Setup Review
              <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to={publicDemoHref} className="btn-pill-ghost w-full sm:w-auto border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
              Try Public Demo
            </Link>
            <Link to={demoHref} className="btn-pill-ghost w-full sm:w-auto">
              Request Live Demo Walkthrough
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 border-t border-border bg-gradient-to-b from-accent/[0.01] to-transparent">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-normal text-foreground leading-tight">
              {t("mctb_page.value_cards.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-muted-foreground font-normal">
              {t("mctb_page.value_cards.description")}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {valueCards.map((card) => (
              <div key={card.title} className="card-dark-wise">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-accent">
                  <card.icon className="h-3.5 w-3.5" />
                  {card.label}
                </div>
                <h3 className="text-2xl font-black uppercase tracking-normal text-foreground">
                  {card.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 via-transparent to-transparent px-6 py-6 font-normal">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-wider text-yellow-400">
                  {t("mctb_page.roi.line")}
                </p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {t("mctb_page.roi.text")}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-bold text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-accent" />
                {t("mctb_page.roi.tags")}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-background/60 px-6 py-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-wider text-accent">
                  Try it now
                </p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  Visitors can test the customer-side flow directly on the website.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  The public demo strips out the operator controls and keeps only the parts that matter: the conversation and the owner summary.
                </p>
              </div>
              <Link to={publicDemoHref} className="btn-pill-primary inline-flex items-center justify-center gap-2 whitespace-nowrap">
                Open Public Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 border-t border-border bg-gradient-to-b from-transparent via-yellow-500/[0.03] to-transparent">
        <div className="container mx-auto max-w-6xl">
          <div className="grid items-start gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="mb-6">
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground leading-tight">
                  {t("mctb_page.workflow.title")}
                </h2>
                <p className="mt-4 max-w-3xl text-muted-foreground font-normal">
                  {t("mctb_page.workflow.desc")}
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {workflowSteps.map((item) => (
                  <div key={item.title} className="card-dark-wise">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/10">
                        <item.icon className="h-6 w-6 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-wider text-yellow-400">{item.step}</p>
                        <h3 className="text-lg font-black uppercase tracking-tight text-foreground">
                          {item.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-dark-wise">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5 text-accent" />
                Example conversation
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                This sample is shown in the plumbing version because that is the current demo script. The same structure can be adapted to HVAC, electrical, cleaning, towing, locksmith, and other local service workflows.
              </p>
              <div className="space-y-4">
                <div className="rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-wider text-accent">System</p>
                  <p className="mt-2 text-sm text-foreground">
                    Hey, this is Mike from ABC Plumbing. Sorry we missed your call. What&apos;s going on: leak, clog, water heater, or something else?
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-background/80 px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Customer</p>
                  <p className="mt-2 text-sm text-foreground">Leak under the sink.</p>
                </div>
                <div className="rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-wider text-accent">System</p>
                  <p className="mt-2 text-sm text-foreground">
                    Got it. Is the leak constant or only when you use the sink? Is there flooding or urgent damage right now? Where is it located? Can I get your name so the technician can reach you?
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-background/80 px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Customer</p>
                  <p className="mt-2 text-sm text-foreground">
                    Constant. Yes, a little. Kitchen. John.
                  </p>
                </div>
                <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-wider text-yellow-400">System</p>
                  <p className="mt-2 text-sm text-foreground">
                    Thanks, John. We&apos;ve got your request. A technician will reach out shortly to schedule.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-foreground leading-tight">
              Never Miss Another Customer Again
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base sm:text-lg leading-relaxed text-muted-foreground font-normal">
              Every missed call is a lost job. NStep responds instantly, qualifies the lead, and sends you exactly what matters - so you can call back and close.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="card-dark-wise">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-blue-400">
                <FileText className="h-3.5 w-3.5" />
                What the owner sees
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tight text-foreground leading-tight">
                This is what you get instantly
              </h2>
              <div className="mt-6 space-y-3 rounded-3xl border border-border bg-background/70 p-5">
                {ownerSummary.map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-4 border-b border-border/60 pb-3 last:border-b-0 last:pb-0">
                    <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                      {row.label}
                    </span>
                    <span className="text-right text-sm font-medium text-foreground">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="card-dark-wise border-yellow-500/30">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-yellow-400">
                  <Zap className="h-3.5 w-3.5" />
                  Automation flow
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">
                  What happens automatically
                </h3>
                <div className="mt-5 space-y-3">
                  {packageItems.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                      <p className="text-sm text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-dark-wise">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-accent">
                  <Shield className="h-3.5 w-3.5" />
                  Messaging safeguards
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">
                  Compliance still needs to be obvious
                </h3>
                <div className="mt-5 space-y-3">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                      <p className="text-sm text-muted-foreground">{t(`mctb.compliance.${i}`)}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-sm text-muted-foreground">
                  {t("mctb.legal_note")}{" "}
                  <Link to="/terms" className="text-accent hover:underline">
                    Terms & Privacy
                  </Link>{" "}
                  {t("mctb.legal_detail")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 border-t border-border bg-gradient-to-b from-accent/[0.02] via-transparent to-yellow-500/[0.02]">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-yellow-400">
              <TrendingUp className="h-3.5 w-3.5" />
              {t("divisions.automation.cta")}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase leading-[1.05] tracking-normal text-foreground">
              {t("mctb_page.pricing.title")}
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-muted-foreground font-normal">
              {t("mctb_page.pricing.desc")}
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            {pricingTiers.map((tier) => {
              const accentClasses =
                tier.accent === "yellow"
                  ? {
                      border: "border-yellow-500/30",
                      badge: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
                      price: "text-yellow-400",
                      button: "btn-pill-primary",
                    }
                  : tier.accent === "blue"
                    ? {
                        border: "border-blue-500/30",
                        badge: "border-blue-500/30 bg-blue-500/10 text-blue-400",
                        price: "text-blue-400",
                        button: "btn-pill-ghost border-blue-500/30 text-blue-400 hover:bg-blue-500/10",
                      }
                    : {
                        border: "border-accent/30",
                        badge: "border-accent/20 bg-accent/10 text-accent",
                        price: "text-accent",
                        button: "btn-pill-ghost",
                      };

              return (
                <div key={tier.name} className={`card-dark-wise flex h-full flex-col ${accentClasses.border}`}>
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <div className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${accentClasses.badge}`}>
                        {tier.badge}
                      </div>
                      <h3 className="mt-4 text-3xl font-black uppercase tracking-tight text-foreground">
                        {tier.name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Setup</p>
                      <p className={`text-lg font-black ${accentClasses.price}`}>{tier.setup}</p>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {tier.audience}
                  </p>

                  <div className="mt-6 rounded-2xl border border-border bg-background/70 p-4">
                    <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Monthly</p>
                    <p className="mt-1 text-2xl font-black text-foreground">{tier.monthly}</p>
                  </div>

                  <div className="mt-6 space-y-3">
                    {tier.items.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                        <p className="text-sm text-muted-foreground">{item}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8">
                    <Link to={tier.cta} className={`${accentClasses.button} inline-flex w-full items-center justify-center gap-2`}>
                      Request {tier.name} Review
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-3xl border border-border bg-background/60 px-6 py-6 font-normal">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-wider text-accent">
                  {t("mctb_page.pricing.recommendation_title")}
                </p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {t("mctb_page.pricing.recommendation_text")}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Plumbing is simply the current packaged demo and easiest first rollout. The same offer structure can be adapted for other service businesses once the first flow is proven.
                </p>
              </div>
              <Link to="/contact?intent=setup-review&tier=starter&source=missed_call_offer" className="btn-pill-primary inline-flex items-center justify-center gap-2 whitespace-nowrap">
                Start With Starter
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 border-t border-border bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="card-dark-wise">
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-4">
              Want this flow set up for your business?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Start with the narrow version: missed-call response, qualification, urgency routing, and owner summary. Expand later if the business needs more.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={setupHref} className="btn-pill-primary inline-flex items-center gap-2">
                Request Setup Review
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to={publicDemoHref} className="btn-pill-ghost inline-flex items-center gap-2 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                Try Public Demo
              </Link>
              <Link to={demoHref} className="btn-pill-ghost inline-flex items-center gap-2">
                Ask for Live Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
