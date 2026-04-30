import { useMemo, useState } from "react";
import { useParams, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { 
  ArrowLeft, ExternalLink, Play, X, ChevronLeft, ChevronRight, Check, 
  Smartphone, Monitor, Globe, Download, Zap, Star, ArrowRight,
  Calendar, Code2, Target, Clock, Hammer, Rocket, Circle
} from "lucide-react";
import { useApp } from "@/react-app/hooks/useApps";
import { useAppMedia } from "@/react-app/hooks/useAppMedia";
import GlitchedText from "@/react-app/components/GlitchedText";
import SEO from "@/react-app/components/SEO";
import { getAppCategoryLabel } from "@/react-app/lib/appCategories";

export default function ProductDetail() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { app, isLoading, error } = useApp(slug || "");
  const { media } = useAppMedia(slug || "");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const screenshots = useMemo(() => {
    if (!app) {
      return [];
    }

    if (media.length > 0) {
      return media.filter((item) => item.media_type === "screenshot").map((item) => item.url);
    }
    return app.screenshots || [];
  }, [app, media]);
  const features = useMemo(
    () => (app?.features || []),
    [app]
  );
  const progress = useMemo(
    () => (app?.progress || []),
    [app]
  );

  const trackDownload = async () => {
    if (!app) return;
    
    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "app_download",
          app_id: app.id,
          app_uuid: app.uuid,
          user_id: null,
          metadata: JSON.stringify({
            app_name: app.name,
            app_slug: app.slug,
            platform: app.platform,
            status: app.status,
            timestamp: new Date().toISOString(),
          }),
        }),
      });
    } catch (error) {
      console.error("Download tracking failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-accent/10 animate-pulse mx-auto mb-6" />
            <div className="h-8 w-48 bg-secondary rounded-lg mx-auto mb-3 animate-pulse" />
            <p className="text-muted-foreground font-normal">{t("common.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="min-h-screen pt-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <Link to="/apps" className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-8 font-black uppercase text-sm group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t("product.back")}
          </Link>
          <div className="card-dark-wise text-center py-16">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <X className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase mb-4">{t("product.not_found")}</h1>
            <p className="text-muted-foreground font-normal mb-8 max-w-sm mx-auto">
              {t("product.not_found_desc")}
            </p>
            <Link to="/apps" className="btn-pill-primary inline-flex items-center gap-2">
              {t("product.browse")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const completedSteps = progress.filter(p => p.completed).length;
  const totalSteps = progress.length;
  const progressPercent = app.progressPercent || 0;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % screenshots.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  const getPlatformIcon = () => {
    switch (app.platform) {
      case "mobile": return <Smartphone className="w-4 h-4" />;
      case "desktop": return <Monitor className="w-4 h-4" />;
      case "web": return <Globe className="w-4 h-4" />;
      default: return <Smartphone className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    const label = app.statusLabel?.toLowerCase() || "";
    if (label === "live" || label === "released") return "text-success bg-success/10 border-success/30";
    if (label === "preview") return "text-accent bg-accent/10 border-accent/30";
    if (label === "alpha") return "text-blue-400 bg-blue-400/10 border-blue-400/30";
    if (label === "prototype") return "text-violet-400 bg-violet-400/10 border-violet-400/30";
    if (label === "design") return "text-amber-400 bg-amber-400/10 border-amber-400/30";
    return "text-muted-foreground bg-muted/10 border-border";
  };

  const getStatusIcon = () => {
    const label = app.statusLabel?.toLowerCase() || "";
    if (label === "live" || label === "released") return Rocket;
    if (label === "preview" || label === "alpha") return Zap;
    if (label === "prototype") return Hammer;
    if (label === "design") return Target;
    return Clock;
  };

  const StatusIcon = getStatusIcon();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": app.name,
    "description": app.description,
    "applicationCategory": app.category,
    "operatingSystem": app.platform === "mobile" ? "iOS, Android" : "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24 px-4 sm:px-6 pb-16">
      <SEO
        title={app.name}
        description={app.description}
        keywords={`${app.name}, ${app.category}, ${app.platform} app, ${app.techStack?.join(", ") || ""}`}
        canonicalUrl={`/apps/${app.slug}`}
        ogImage={app.logo || undefined}
        ogType="website"
        structuredData={structuredData}
      />
      <div className="container mx-auto max-w-5xl">
        {/* Back Link */}
        <Link to="/apps" className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-6 sm:mb-8 font-black uppercase text-sm group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {t("product.back")}
        </Link>

        {/* Hero Section with Build Status */}
        <div className="card-dark-wise mb-6 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
              {/* App Icon */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-background to-secondary/80 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-accent/20 shadow-xl shadow-accent/10">
                {app.logo ? (
                  <img src={app.logo} alt={app.name} className="w-full h-full object-contain p-4 sm:p-5" />
                ) : (
                  <Zap className="w-12 h-12 text-accent" />
                )}
              </div>
              
              <div className="flex-1">
                {/* Status & Category Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`text-label px-3 py-1.5 rounded-full text-xs inline-flex items-center gap-1.5 border font-black ${getStatusColor()}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {app.statusLabel || t("common.coming_soon")}
                  </span>
                  <span className="text-label px-3 py-1.5 rounded-full bg-secondary border border-border inline-flex items-center gap-1.5 text-xs">
                    {getPlatformIcon()}
                    {t(`common.${app.platform || "mobile"}`)}
                  </span>
                  <span className="text-label px-3 py-1.5 rounded-full bg-secondary border border-border text-xs uppercase">
                    {getAppCategoryLabel(app.category)}
                  </span>
                </div>
                
                {/* Title with Glitch */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter mb-3">
                  <GlitchedText text={app.name} duration={600} />
                </h1>
                
                {/* Tagline */}
                <p className="text-accent font-bold text-sm sm:text-base uppercase tracking-wide mb-3">
                  {app.tagline}
                </p>
                
                <p className="text-sm sm:text-base text-muted-foreground font-normal leading-relaxed max-w-2xl">
                  {app.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Build Progress Card - Main Feature */}
        <div className="card-dark-wise mb-6 border-2 border-accent/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-black uppercase flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Hammer className="w-5 h-5 text-accent" />
              </div>
              {t("building.build_progress")}
            </h2>
            <div className="text-right">
              <span className="text-3xl sm:text-4xl font-black text-accent">{progressPercent}%</span>
              <p className="text-xs text-muted-foreground uppercase">{t("building.complete")}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 rounded-full bg-secondary/80 overflow-hidden mb-8">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-accent/80 rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-transparent rounded-full animate-pulse opacity-50"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Meta Info Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {app.targetDate && (
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs uppercase">Target</span>
                </div>
                <p className="font-black text-lg">{app.targetDate}</p>
              </div>
            )}
            <div className="p-4 rounded-xl bg-secondary/50 border border-border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Target className="w-4 h-4" />
                <span className="text-xs uppercase">{t("product.stage")}</span>
              </div>
              <p className="font-black text-lg">{app.statusLabel || t("product.planning")}</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Check className="w-4 h-4" />
                <span className="text-xs uppercase">{t("product.steps")}</span>
              </div>
              <p className="font-black text-lg">{completedSteps}/{totalSteps}</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Code2 className="w-4 h-4" />
                <span className="text-xs uppercase">{t("product.tech_stack")}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(app.techStack || []).slice(0, 2).map((tech, i) => (
                  <span key={i} className="text-xs font-bold bg-accent/10 text-accent px-2 py-0.5 rounded">
                    {tech}
                  </span>
                ))}
                {(app.techStack || []).length > 2 && (
                  <span className="text-xs text-muted-foreground">+{(app.techStack || []).length - 2}</span>
                )}
              </div>
            </div>
          </div>

          {/* Progress Checklist */}
          {progress.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-black uppercase text-muted-foreground mb-4">{t("product.milestones")}</h3>
              {progress.map((step, i) => {
                const isNext = !step.completed && (i === 0 || progress[i - 1]?.completed);
                return (
                  <div 
                    key={i} 
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                      step.completed 
                        ? "bg-accent/5 border border-accent/20" 
                        : isNext
                        ? "bg-amber-400/5 border border-amber-400/30"
                        : "bg-secondary/30 border border-border/50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      step.completed 
                        ? "bg-accent/20" 
                        : isNext
                        ? "bg-amber-400/20"
                        : "bg-secondary"
                    }`}>
                      {step.completed ? (
                        <Check className="w-4 h-4 text-accent" />
                      ) : isNext ? (
                        <Circle className="w-4 h-4 text-amber-400 animate-pulse" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground/30" />
                      )}
                    </div>
                    <span className={`font-medium text-sm ${
                      step.completed 
                        ? "text-foreground" 
                        : isNext
                        ? "text-amber-400"
                        : "text-muted-foreground"
                    }`}>
                      {step.text}
                    </span>
                    {isNext && (
                      <span className="ml-auto text-xs font-black uppercase text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
                        {t("product.in_progress")}
                      </span>
                    )}
                    {step.completed && (
                      <span className="ml-auto text-xs font-black uppercase text-accent bg-accent/10 px-2 py-1 rounded">
                        {t("product.done")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tech Stack Full */}
        {app.techStack && app.techStack.length > 0 && (
          <div className="card-dark-wise mb-6">
            <h2 className="text-xl sm:text-2xl font-black uppercase mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-accent" />
              </div>
              {t("product.tech_stack")}
            </h2>
            <div className="flex flex-wrap gap-3">
              {app.techStack.map((tech, i) => (
                <span 
                  key={i} 
                  className="px-4 py-2 rounded-xl bg-gradient-to-br from-secondary to-secondary/50 border border-border text-sm font-bold"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="card-dark-wise mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5 border border-accent/20">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                {app.status === "LIVE" ? t("product.available_now") : app.status === "PREVIEW" ? t("product.join_preview") : `Target: ${app.targetDate || "TBA"}`}
              </p>
              <p className="font-black uppercase text-lg">
                {app.status === "LIVE" ? t("product.get_app") : app.status === "PREVIEW" ? t("product.be_first") : t("product.follow_build")}
              </p>
            </div>
            {app.cta_url ? (
              app.cta_url.startsWith("/") ? (
                <Link
                  to={app.cta_url}
                  className="btn-pill-primary inline-flex items-center justify-center gap-3 text-sm animate-neon-pulse min-w-[200px]"
                >
                  <Download className="w-5 h-5" />
                  {app.status === "LIVE" ? t("product.download_now") : <GlitchedText text={t("apps.join_preview")} speed={150} duration={2400} />}
                  <ExternalLink className="w-4 h-4" />
                </Link>
              ) : (
                <a
                  href={app.cta_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={trackDownload}
                  className="btn-pill-primary inline-flex items-center justify-center gap-3 text-sm animate-neon-pulse min-w-[200px]"
                >
                  <Download className="w-5 h-5" />
                  {app.status === "LIVE" ? t("product.download_now") : <GlitchedText text={t("apps.join_preview")} speed={150} duration={2400} />}
                  <ExternalLink className="w-4 h-4" />
                </a>
              )
            ) : (
              <button className="btn-pill-ghost inline-flex items-center justify-center gap-2 text-sm min-w-[200px]" disabled>
                <Star className="w-4 h-4" />
                Notify Me
              </button>
            )}
          </div>
        </div>

        {/* Video Section */}
        {app.video_url && (
          <div className="card-dark-wise mb-6">
            <h2 className="text-xl sm:text-2xl font-black uppercase mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Play className="w-5 h-5 text-accent" />
              </div>
              {t("product.preview")}
            </h2>
            <div className="aspect-video rounded-2xl overflow-hidden border border-border bg-secondary shadow-xl">
              <iframe
                src={app.video_url.replace("watch?v=", "embed/")}
                title={`${app.name} preview`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Screenshots Gallery */}
        {screenshots.length > 0 && (
          <div className="card-dark-wise mb-6">
            <h2 className="text-xl sm:text-2xl font-black uppercase mb-6">{t("product.screenshots")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {screenshots.map((url: string, index: number) => (
                <button
                  key={index}
                  onClick={() => openLightbox(index)}
                  className="relative rounded-2xl overflow-hidden border border-border bg-secondary hover:border-accent transition-all group aspect-[9/16] sm:aspect-video shadow-lg hover:shadow-accent/10"
                >
                  <img 
                    src={url} 
                    alt={`${app.name} screenshot ${index + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <span className="text-xs font-black uppercase bg-accent text-accent-foreground px-3 py-1.5 rounded-full">
                      View
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="card-dark-wise">
          <h2 className="text-xl sm:text-2xl font-black uppercase mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            {t("product.features")}
          </h2>
          {features.length > 0 ? (
            <div className="space-y-4">
              {features.map((feature: string, index: number) => {
                // Parse feature format "Title: Description"
                const colonIndex = feature.indexOf(":");
                const hasTitle = colonIndex > 0 && colonIndex < 80;
                const title = hasTitle ? feature.substring(0, colonIndex).trim() : null;
                const description = hasTitle ? feature.substring(colonIndex + 1).trim() : feature;
                
                return (
                  <div 
                    key={index} 
                    className="p-5 rounded-2xl bg-gradient-to-br from-secondary to-secondary/50 border border-border hover:border-accent/30 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                        <Check className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        {title && (
                          <h3 className="font-black uppercase text-sm mb-1.5 text-accent">{title}</h3>
                        )}
                        <p className="text-sm font-normal text-muted-foreground leading-relaxed">{description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl bg-secondary/50 border border-border border-dashed">
              <Star className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-normal text-sm">
                {t("product.features_soon")}
              </p>
            </div>
          )}
        </div>

        {/* Bottom CTA - Sticky on mobile */}
        {app.cta_url && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent lg:hidden z-40">
            {app.cta_url.startsWith("/") ? (
              <Link
                to={app.cta_url}
                className="btn-pill-primary w-full flex items-center justify-center gap-3 text-sm py-4"
              >
                <Download className="w-5 h-5" />
                {app.status === "LIVE" ? t("product.download_now") : <GlitchedText text={t("apps.join_preview")} speed={150} duration={2400} />}
                <ExternalLink className="w-4 h-4" />
              </Link>
            ) : (
              <a
                href={app.cta_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackDownload}
                className="btn-pill-primary w-full flex items-center justify-center gap-3 text-sm py-4"
              >
                <Download className="w-5 h-5" />
                {app.status === "LIVE" ? t("product.download_now") : <GlitchedText text={t("apps.join_preview")} speed={150} duration={2400} />}
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && screenshots.length > 0 && (
        <div 
          className="fixed inset-0 bg-background/98 backdrop-blur-2xl z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-secondary border border-border hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-all flex items-center justify-center z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {screenshots.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-secondary border border-border hover:bg-accent/10 hover:border-accent transition-all flex items-center justify-center z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-secondary border border-border hover:bg-accent/10 hover:border-accent transition-all flex items-center justify-center z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div 
            className="max-w-5xl max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={screenshots[lightboxIndex]}
              alt={`${app.name} screenshot ${lightboxIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl border border-border shadow-2xl"
            />
            <div className="flex items-center justify-center gap-2 mt-6">
              {screenshots.map((_: string, i: number) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === lightboxIndex ? "bg-accent w-8" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
