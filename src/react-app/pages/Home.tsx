import { useState, useEffect, useRef } from "react";
import { ArrowRight, Gamepad2, Cpu, Wrench, GraduationCap, TrendingUp, Sparkles, Zap, Target, Smartphone, Brain, Rocket, House, HeartPulse, Check, Circle, Calendar, Code2 } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useApps } from "@/react-app/hooks/useApps";
import CountUp from "@/react-app/components/CountUp";
import SEO from "@/react-app/components/SEO";
import FeatureGate from "@/react-app/components/FeatureGate";
import { BRAND_ASSETS } from "@/react-app/lib/site";
import { useSiteContent } from "@/react-app/hooks/useSiteContent";


const getCategoryIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case "tool": return Wrench;
    case "ai tool": return Cpu;
    case "education": return GraduationCap;
    case "finance": return TrendingUp;
    case "home": return House;
    case "therapy": return HeartPulse;
    case "game": return Gamepad2;
    default: return Cpu;
  }
};

const getStatusColor = (statusLabel: string) => {
  switch (statusLabel?.toLowerCase()) {
    case "alpha": return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    case "prototype": return "bg-accent/10 text-accent border-accent/30";
    case "design": return "bg-purple-500/10 text-purple-400 border-purple-500/30";
    case "concept": return "bg-muted/20 text-muted-foreground border-border";
    case "beta": return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    case "live": return "bg-success/10 text-success border-success/30";
    default: return "bg-muted/10 text-muted-foreground border-border";
  }
};

function ProjectCard({ app, index, t }: { app: any, index: number, t: any }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const IconComponent = getCategoryIcon(app.category);

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.animationDelay = `${index * 100}ms`;
    }
    if (progressRef.current) {
      progressRef.current.style.width = `${app.progressPercent}%`;
    }
  }, [index, app.progressPercent]);

  return (
    <Link
      ref={cardRef}
      to={`/apps/${app.slug}`}
      className="card-dark-wise group hover:card-dark-wise-active cursor-pointer transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl border border-border bg-gradient-to-br from-background to-secondary/80 flex items-center justify-center group-hover:border-accent/30 group-hover:bg-accent/5 transition-all overflow-hidden flex-shrink-0">
          {app.logo ? (
            <img src={app.logo} alt={app.name} className="w-full h-full object-contain p-2.5" />
          ) : (
            <IconComponent className="w-7 h-7 text-accent" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-lg font-black uppercase tracking-tight text-foreground group-hover:text-accent transition-colors">
              {app.name}
            </h3>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${getStatusColor(app.statusLabel)}`}>
              {app.statusLabel}
            </span>
          </div>
          <p className="text-sm text-muted-foreground font-normal line-clamp-1">
            {app.tagline}
          </p>
        </div>
      </div>

      {/* Target & Tech */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        {app.targetDate && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {t("building.target")}: {app.targetDate}
          </span>
        )}
        {app.techStack && app.techStack.length > 0 && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Code2 className="w-3 h-3" />
            {app.techStack.slice(0, 2).join(", ")}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-muted-foreground">{t("building.progress")}</span>
          <span className="text-accent font-bold">{app.progressPercent}%</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div 
            ref={progressRef}
            className="h-full bg-accent transition-all duration-500"
          />
        </div>
      </div>

      {/* Progress Steps */}
      {app.progress && app.progress.length > 0 && (
        <div className="space-y-2">
          {app.progress.slice(0, 3).map((step: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              {step.completed ? (
                <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0" />
              )}
              <span className={step.completed ? "text-muted-foreground line-through" : "text-foreground"}>
                {step.text}
              </span>
            </div>
          ))}
          {app.progress.length > 3 && (
            <span className="text-xs text-accent font-bold pl-5">{t("building.more_steps", { count: app.progress.length - 3 })}</span>
          )}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-border">
        <span className="text-xs text-accent font-bold uppercase flex items-center gap-2 group-hover:gap-3 transition-all">
          {t("building.view_details")}
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}


export default function HomePage() {
  const { t } = useTranslation();
  const { apps: allApps, isLoading } = useApps();
  const { content: dynamicHeroTitle } = useSiteContent("home_hero_title");
  const { content: dynamicHeroSubtitle } = useSiteContent("home_hero_subtitle");
  
  // Filter to only show published apps on public pages
  const apps = allApps.filter(app => app.visibility === "published");
  
  // Check if apps feature is enabled
  const [appsFeatureEnabled, setAppsFeatureEnabled] = useState(true);
  
  useEffect(() => {
    interface FeatureToggleResponse {
      feature_key: string;
      is_enabled: boolean | number;
    }

    const checkAppsFeature = async () => {
      try {
        const res = await fetch("/api/feature-toggles");
        const features: FeatureToggleResponse[] = await res.json();
        const appsFeature = features.find((feature) => feature.feature_key === "apps");
        setAppsFeatureEnabled(appsFeature?.is_enabled !== false);
      } catch (err) {
        console.error("Failed to check apps feature:", err);
      }
    };
    checkAppsFeature();
  }, []);

  // Stats for the studio
  const stats = [
    { label: t("stats.projects"), value: apps.length, icon: Target },
    { label: t("stats.categories"), value: t("home.focus_areas_count"), icon: Sparkles },
    { label: t("stats.updates"), value: new Set(apps.map((app) => app.statusLabel)).size, icon: Zap },
  ];

  return (
    <div>
      <SEO
        title="Home"
        description={t("home.hero_subtitle")}
        keywords={t("seo.default_keywords")}
        canonicalUrl="/"
      />
      {/* Hero Section - Product Infrastructure */}
      <section className="pt-16 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-[400px] h-[400px] rounded-full bg-accent/[0.03] blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-yellow-500/[0.02] blur-3xl pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          {/* Company badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-accent/10 border border-accent/30 backdrop-blur-sm">
              <img src={BRAND_ASSETS.studioMark} alt="Northern Step Studio" className="w-6 h-6" />
              <span className="text-label text-foreground text-sm sm:text-base font-black tracking-widest uppercase">Northern Step Studio</span>
            </div>
          </div>
          
          {/* Main headline */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-normal mb-5 leading-[1.05] text-foreground">
              {dynamicHeroTitle ? (
                <span className="block whitespace-pre-line">{dynamicHeroTitle}</span>
              ) : (
                <>
                  <span className="block mb-1">{t("home.hero_line_1")}</span>
                  <span className="block">{t("home.hero_line_2")}</span>
                </>
              )}
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto font-normal leading-relaxed">
              {dynamicHeroSubtitle || t("home.hero_subtitle")}
            </p>
          </div>
          
          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/contact?intent=setup-review"
              className="btn-pill-primary group w-full sm:w-auto hover:shadow-lg hover:shadow-accent/20 transition-all text-sm sm:text-base"
            >
              Request Setup Review
              <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <FeatureGate feature="automation">
              <Link
                to="/missed-call-text-back"
                className="btn-pill-ghost w-full sm:w-auto text-sm sm:text-base border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              >
                {t("home.lead_recovery")}
              </Link>
            </FeatureGate>
            <FeatureGate feature="apps">
              <Link 
                to="/apps" 
                className="btn-pill-ghost group w-full sm:w-auto text-sm sm:text-base"
              >
                {t("divisions.consumer.cta")}
                <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </FeatureGate>
            <Link 
              to="/workspace-ai" 
              className="btn-pill-ghost w-full sm:w-auto text-sm sm:text-base border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            >
              {t("home.studio_ai")}
            </Link>
          </div>

          {/* Studio stats */}
          <div className="grid grid-cols-3 gap-6 sm:gap-8 max-w-2xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1.5">
                  <stat.icon className="w-4 h-4 text-accent" />
                  <span className="text-3xl sm:text-4xl font-black text-foreground">
                    <CountUp value={Number(stat.value)} duration={1200} />
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-bold">{stat.label}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Core Divisions */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border bg-gradient-to-b from-accent/[0.01] to-transparent">
        <div className="container mx-auto max-w-6xl">
          {/* Section header */}
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 text-label text-accent mb-2.5 text-xs sm:text-sm font-black uppercase">
              <Rocket className="w-3.5 h-3.5" />
              {t("divisions.label")}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-normal mb-3 text-foreground leading-tight">
              {t("divisions.title")}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto font-normal">
              {t("divisions.subtitle")}
            </p>
          </div>

          {/* Divisions grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* NSS Studio */}
            <div className="card-dark-wise group hover:card-dark-wise-active transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
                  <Smartphone className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">{t("divisions.consumer.name")}</h3>
              </div>
              
              <p className="text-sm text-muted-foreground font-normal leading-relaxed mb-6">
                {t("divisions.consumer.desc")}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-secondary border border-border font-bold uppercase">{t("divisions.consumer.tag1")}</span>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-secondary border border-border font-bold uppercase">{t("divisions.consumer.tag2")}</span>
              </div>

              <FeatureGate feature="apps">
                <Link 
                  to="/apps" 
                  className="inline-flex items-center gap-2 text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition-colors font-black uppercase"
                >
                  {t("divisions.consumer.cta")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </FeatureGate>
            </div>

            {/* Guided Support */}
            <div className="card-dark-wise group hover:card-dark-wise-active transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-all">
                  <Brain className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">{t("divisions.guided.name")}</h3>
              </div>
              
              <p className="text-sm text-muted-foreground font-normal leading-relaxed mb-6">
                {t("divisions.guided.desc")}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-secondary border border-border font-bold uppercase">{t("divisions.guided.tag1")}</span>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-secondary border border-border font-bold uppercase">{t("divisions.guided.tag2")}</span>
              </div>

              <FeatureGate feature="apps">
                <Link 
                  to="/apps" 
                  className="inline-flex items-center gap-2 text-xs sm:text-sm text-accent hover:text-accent/80 transition-colors font-black uppercase"
                >
                  {t("divisions.guided.cta")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </FeatureGate>
            </div>

            {/* Service Automation */}
            <FeatureGate feature="responseos">
              <div className="card-dark-wise group hover:card-dark-wise-active transition-all duration-300 border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500/[0.03] to-transparent relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-all">
                      <Zap className="w-7 h-7 text-yellow-400" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-yellow-400">{t("divisions.automation.name")}</h3>
                  </div>
                  
                  <p className="text-base font-bold text-yellow-400 mb-3">
                    {t("divisions.automation.tagline")}
                  </p>
                  
                  <p className="text-sm text-muted-foreground font-normal leading-relaxed mb-6">
                    {t("divisions.automation.desc")}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-bold uppercase">{t("divisions.automation.tag1")}</span>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-bold uppercase">{t("divisions.automation.tag2")}</span>
                  </div>

                  <Link 
                    to="/missed-call-text-back" 
                    className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 transition-all font-black uppercase text-sm"
                  >
                    {t("divisions.automation.cta")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </FeatureGate>

            {/* Studio Systems - NEW */}
            <div className="card-dark-wise group hover:card-dark-wise-active transition-all duration-300 border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/[0.03] to-transparent relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
                    <Cpu className="w-7 h-7 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-blue-400">{t("divisions.studio_tech.name")}</h3>
                </div>
                
                <p className="text-base font-bold text-blue-400 mb-3">
                  {t("divisions.studio_tech.tagline")}
                </p>
                
                <p className="text-sm text-muted-foreground font-normal leading-relaxed mb-6">
                  {t("divisions.studio_tech.desc")}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold uppercase">{t("divisions.studio_tech.tag1")}</span>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold uppercase">{t("divisions.studio_tech.tag2")}</span>
                </div>

                <Link 
                  to="/workspace-ai" 
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all font-black uppercase text-sm"
                >
                  {t("divisions.studio_tech.cta")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Now Building Section - Execution Showcase */}
      {appsFeatureEnabled && (
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 sm:mb-14 gap-4">
            <div>
              <span className="inline-flex items-center gap-2 text-label text-accent mb-2 block text-xs sm:text-sm">
                <Code2 className="w-3 h-3" />
                {t("building.label")}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-normal text-foreground">{t("building.title")}</h2>
            </div>
            <FeatureGate feature="apps">
              <Link 
                to="/apps" 
                className="group flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-accent transition-colors uppercase font-black"
              >
                {t("building.view_all")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </FeatureGate>
          </div>
          
          {/* Project Cards - Execution Focused */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading ? (
              [1, 2].map((i) => (
                <div key={i} className="card-dark-wise animate-pulse">
                  <div className="h-6 bg-secondary rounded w-1/2 mb-4" />
                  <div className="h-4 bg-secondary rounded w-full mb-6" />
                  <div className="space-y-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-4 bg-secondary rounded w-3/4" />
                    ))}
                  </div>
                </div>
              ))
            ) : apps.length > 0 ? (
              apps.map((app, index) => {
                return (
                  <ProjectCard key={app.id} app={app} index={index} t={t} />
                );

              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">{t("building.no_projects")}</p>
              </div>
            )}
          </div>
        </div>
      </section>
      )}
    </div>
  );
}
