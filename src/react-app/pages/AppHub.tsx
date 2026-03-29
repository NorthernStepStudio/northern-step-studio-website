import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApps } from "@/react-app/hooks/useApps";
import AppCard from "@/react-app/components/AppCard";
import { Link } from "react-router";
import GlitchedText from "@/react-app/components/GlitchedText";
import { Search, X } from "lucide-react";
import SEO from "@/react-app/components/SEO";
import { getAppCategoryLabel } from "@/react-app/lib/appCategories";
import { CATALOG_APPS } from "@/react-app/data/appsCatalog";

export default function AppHub() {
  const { t } = useTranslation();
  const { apps, isLoading } = useApps();
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [activeStatus, setActiveStatus] = useState<"ALL" | "BETA" | "LIVE">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const fallbackApps = CATALOG_APPS;
  const curatedApps = apps.length > 0
    ? [
        ...apps,
        ...fallbackApps.filter((fallback) => !apps.some((app) => app.slug === fallback.slug)),
      ]
    : fallbackApps;
  const isHidden = (app: { visibility?: string }) => app.visibility === "hidden";
  const featuredSlugs = new Set(fallbackApps.map((app) => app.slug));
  const remoteApps = curatedApps.filter((app) => !featuredSlugs.has(app.slug) && !isHidden(app));

  const filters = [
    { key: "ALL", label: "All" },
    ...Array.from(
      new Set(
        curatedApps
          .filter((app) => !isHidden(app))
          .map((app) => app.category)
      )
    ).map((category) => ({
      key: category,
      label: getAppCategoryLabel(category),
    })),
  ];

  const filteredApps = curatedApps.filter(app => {
    if (isHidden(app)) {
      return false;
    }

    const status = (app.status || "").toUpperCase();
    const matchesStatus =
      activeStatus === "ALL" ||
      (activeStatus === "BETA" && status === "BETA") ||
      (activeStatus === "LIVE" && status === "LIVE");
    const matchesCategory = activeFilter === "ALL" || app.category === activeFilter;
    const matchesSearch = searchQuery === "" || 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen px-4 pb-12 pt-16 sm:pt-20 sm:px-6">
      <SEO
        title={t("seo.apps_title")}
        description={t("seo.apps_description")}
        keywords={t("seo.apps_keywords")}
        canonicalUrl="/apps"
      />
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 sm:mb-12">
          <span className="text-label text-accent mb-2 block text-xs sm:text-sm">{t("apps.label")}</span>
          <h1 className="mb-4 text-2xl font-black uppercase tracking-tight sm:text-3xl lg:text-4xl leading-tight">
            <GlitchedText text={t("apps.title")} duration={600} />
          </h1>
          <p className="text-muted-foreground mt-4 font-normal text-sm sm:text-base max-w-2xl">
            {t("apps.subtitle")}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("apps.search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-secondary border border-border rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
              title="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8 flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter.key}
              className={`text-xs sm:text-sm px-3 sm:px-6 py-2 sm:py-3 ${activeFilter === filter.key ? "btn-pill-primary" : "btn-pill-ghost"}`}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          {[
            { key: "ALL", label: "All Apps" },
            { key: "BETA", label: "Beta" },
            { key: "LIVE", label: "Live" },
          ].map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveStatus(filter.key as "ALL" | "BETA" | "LIVE")}
              className={`rounded-full px-4 py-2 text-xs sm:text-sm font-black uppercase tracking-wide transition-all ${
                activeStatus === filter.key
                  ? "bg-accent text-accent-foreground"
                  : "border border-border bg-background text-muted-foreground hover:border-accent/40 hover:text-accent"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-normal">{t("common.loading")}</p>
          </div>
        ) : filteredApps.length > 0 ? (
          <div className="space-y-10">
            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-sm font-black uppercase tracking-[0.24em] text-accent">Featured apps</h2>
                <p className="text-xs text-muted-foreground">{curatedApps.length} curated products</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredApps
                    .filter((app) => featuredSlugs.has(app.slug))
                    .map((app) => (
                    <AppCard key={app.id} {...app} progressPercent={app.progressPercent} />
                  ))}
              </div>
            </div>

            {remoteApps.length > 0 && (
              <div>
                <h2 className="mb-4 text-sm font-black uppercase tracking-[0.24em] text-muted-foreground">
                  More from the studio
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredApps
                    .filter((app) => !featuredSlugs.has(app.slug))
                    .map((app) => (
                    <AppCard key={app.id} {...app} progressPercent={app.progressPercent} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card-dark-wise text-center py-12">
            <p className="text-muted-foreground font-normal mb-4">
              {searchQuery 
                ? t("apps.no_search_results")
                : t("apps.no_apps")}
            </p>
            <Link to="/contact" className="btn-pill-primary inline-block">
              {t("apps.empty_cta")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
