import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Sparkles, Zap, Gamepad2, GraduationCap, TrendingUp, House, HeartPulse } from "lucide-react";
import { getAppCategoryLabel } from "@/react-app/lib/appCategories";
import { getCatalogApp } from "@/react-app/data/appsCatalog";

interface AppCardProps {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  status: string;
  logo?: string | null;
  cta_url?: string | null;
  screenshots?: string[];
  video_url?: string | null;
  features?: string[] | null;
  platform?: string;
  progressPercent?: number;
}

const categoryIcons = {
  GAME: Gamepad2,
  "AI TOOL": Sparkles,
  TOOL: Zap,
  EDUCATION: GraduationCap,
  FINANCE: TrendingUp,
  HOME: House,
  THERAPY: HeartPulse,
};

function getStatusLabel(status: string) {
  const normalized = status.trim().toUpperCase();
  if (normalized === "LIVE") return "Live";
  if (normalized === "BETA") return "Beta";
  if (normalized === "COMING_SOON") return "Coming soon";
  return status;
}

export default function AppCard({
  name,
  slug,
  description,
  category,
  status,
  logo,
  progressPercent,
}: AppCardProps) {
  const { t } = useTranslation();
  const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Sparkles;
  const catalogLogo = getCatalogApp(slug)?.logo || null;
  const displayLogo = logo || catalogLogo;

  return (
    <Link
      to={`/apps/${slug}`}
      className="card-dark-wise group hover:card-dark-wise-active cursor-pointer transition-all duration-300 block"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 rounded-2xl border border-border bg-gradient-to-br from-background to-secondary/80 flex items-center justify-center group-hover:border-accent/30 group-hover:bg-accent/5 transition-colors overflow-hidden">
          {displayLogo ? (
            <img src={displayLogo} alt={name} className="w-full h-full object-contain p-2.5" />
          ) : (
            <IconComponent className="w-7 h-7 text-accent" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-label px-3 py-1 rounded-full bg-secondary border border-border">
            {t(`apps.categories.${category}`, { defaultValue: getAppCategoryLabel(category) })}
          </span>
          <span
            className={`text-label px-3 py-1 rounded-full ${
              status === "LIVE"
                ? "bg-success/10 text-success border border-success/30"
                : status === "BETA"
                ? "bg-accent/10 text-accent border border-accent/30"
                : "bg-muted/10 text-muted-foreground border border-border"
            }`}
          >
            {status.trim().toUpperCase() === "LIVE" ? t("apps.status_filters.live", { defaultValue: "Live" }) : status.trim().toUpperCase() === "BETA" ? t("apps.status_filters.beta", { defaultValue: "Beta" }) : t("apps.status_filters.coming_soon", { defaultValue: "Coming soon" })}
          </span>
        </div>
      </div>

      <h3 className="text-xl font-black mb-2 uppercase tracking-tight">
        {name}
      </h3>

      <p className="text-sm text-muted-foreground font-normal mb-6 line-clamp-2">
        {description || t("apps.no_description", { defaultValue: "No description available" })}
      </p>

      {typeof progressPercent === "number" && (
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-[11px] font-black uppercase tracking-wide text-muted-foreground">
            <span>{t("apps.completion", { defaultValue: "Completion" })}</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent/80"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="w-full py-3 rounded-full bg-secondary border border-border group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-all font-black uppercase text-sm text-center">
        {status === "LIVE" ? t("apps.open") : status === "BETA" ? t("apps.join_beta") : t("apps.learn_more")}
      </div>
    </Link>
  );
}
