import { useRef, useEffect } from "react";
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

  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = `${progressPercent}%`;
    }
  }, [progressPercent]);

  return (
    <Link
      to={`/apps/${slug}`}
      className="card-dark-wise group hover:card-dark-wise-active cursor-pointer transition-all duration-300 block"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
            <IconComponent size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {getAppCategoryLabel(category)}
          </span>
        </div>
        <div className="px-2 py-0.5 rounded-full bg-secondary border border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground">
          {getStatusLabel(status)}
        </div>
      </div>

      <div className="mb-4 aspect-square rounded-xl bg-secondary relative overflow-hidden flex items-center justify-center p-6 border border-border group-hover:border-accent/40 transition-colors">
        {displayLogo ? (
          <img src={displayLogo} alt={name} className="w-full h-full object-contain relative z-10" />
        ) : (
          <IconComponent size={48} className="text-muted-foreground/20" />
        )}
      </div>

      <h3 className="text-lg font-black mb-2 flex items-center gap-2 group-hover:text-accent transition-colors">
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
              ref={progressRef}
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent/80 progress-bar-fill"
            />
          </div>
        </div>
      )}

      <div className="w-full py-3 rounded-full bg-secondary border border-border group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-all font-black uppercase text-sm text-center">
        {status === "LIVE" ? t("apps.open") : t("apps.learn_more")}
      </div>
    </Link>
  );
}
