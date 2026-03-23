import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Megaphone, Calendar, ArrowRight, Sparkles, Zap, Hammer, Rocket } from "lucide-react";
import { useTranslation } from "react-i18next";
import SEO from "@/react-app/components/SEO";
import GlitchedText from "@/react-app/components/GlitchedText";

interface Update {
  id: number;
  app_id: number;
  app_uuid: string;
  app_name?: string;
  app_slug?: string;
  title: string;
  content: string;
  update_type: string;
  version: string | null;
  created_at: string;
}

const getUpdateIcon = (type: string) => {
  switch (type) {
    case "release": return Rocket;
    case "feature": return Sparkles;
    case "progress": return Hammer;
    case "announcement": return Megaphone;
    default: return Zap;
  }
};

const getUpdateColor = (type: string) => {
  switch (type) {
    case "release": return "text-success bg-success/10 border-success/30";
    case "feature": return "text-accent bg-accent/10 border-accent/30";
    case "progress": return "text-blue-400 bg-blue-400/10 border-blue-400/30";
    case "announcement": return "text-amber-400 bg-amber-400/10 border-amber-400/30";
    default: return "text-muted-foreground bg-muted/10 border-border";
  }
};

export default function Updates() {
  const { t } = useTranslation();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const res = await fetch("/api/app-updates");
      const data = await res.json();
      setUpdates(data);
    } catch (error) {
      console.error("Failed to fetch updates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24 px-4 sm:px-6 pb-16">
      <SEO
        title={t("updates_page.title")}
        description={t("updates_page.subtitle")}
        keywords="Northern Step Studio updates, release notes, build notes, milestones"
      />
      
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 mb-6">
            <Megaphone className="w-4 h-4 text-accent" />
            <span className="text-sm font-black uppercase text-accent">{t("updates_page.label")}</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter mb-4">
            <GlitchedText text={t("updates_page.title")} duration={600} />
          </h1>
          
          <p className="text-muted-foreground font-normal text-lg max-w-2xl mx-auto">
            {t("updates_page.subtitle")}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-dark-wise">
                <div className="h-6 w-32 bg-secondary rounded-lg mb-4 animate-pulse" />
                <div className="h-8 w-3/4 bg-secondary rounded-lg mb-3 animate-pulse" />
                <div className="h-20 w-full bg-secondary rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Updates List */}
        {!isLoading && updates.length > 0 && (
          <div className="space-y-6">
            {updates.map((update) => {
              const Icon = getUpdateIcon(update.update_type);
              return (
                <div key={update.id} className="card-dark-wise group hover:border-accent/30 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getUpdateColor(update.update_type).replace('text-', 'bg-').replace('bg-bg-', 'bg-')}`}>
                        <Icon className={`w-5 h-5 ${getUpdateColor(update.update_type).split(' ')[0]}`} />
                      </div>
                      <div>
                        <span className={`text-xs font-black uppercase px-2 py-1 rounded-full border ${getUpdateColor(update.update_type)}`}>
                          {t(`updates_page.type_${update.update_type}`) || update.update_type}
                        </span>
                        {update.version && (
                          <span className="ml-2 text-xs font-bold text-muted-foreground">
                            v{update.version}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Calendar className="w-4 h-4" />
                      {formatDate(update.created_at)}
                    </div>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black uppercase mb-3 group-hover:text-accent transition-colors">
                    {update.title}
                  </h2>

                  <p className="text-muted-foreground font-normal leading-relaxed mb-4 whitespace-pre-line">
                    {update.content}
                  </p>

                  {update.app_slug && (
                    <Link
                      to={`/apps/${update.app_slug}`}
                      className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors text-sm font-bold uppercase group/link"
                    >
                      {t("updates_page.view_app")} {update.app_name || "App"}
                      <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && updates.length === 0 && (
          <div className="card-dark-wise text-center py-16">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Megaphone className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-2xl font-black uppercase mb-3">{t("updates_page.no_updates")}</h2>
            <p className="text-muted-foreground font-normal max-w-md mx-auto mb-8">
              {t("updates_page.no_updates_desc")}
            </p>
            <Link to="/apps" className="btn-pill-primary inline-flex items-center gap-2">
              {t("updates_page.browse_apps")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
