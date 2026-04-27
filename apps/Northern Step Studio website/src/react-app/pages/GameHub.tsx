import { useState, useMemo } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Gamepad2, Filter, ExternalLink, Smartphone, Monitor, Globe } from "lucide-react";
import { useApps } from "@/react-app/hooks/useApps";
import GlitchedText from "@/react-app/components/GlitchedText";
import SEO from "@/react-app/components/SEO";

export default function GameHub() {
  const { t } = useTranslation();
  const { apps, isLoading } = useApps();
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const games = useMemo(() => {
    return apps.filter(app => app.category === "GAME" && app.visibility === "published");
  }, [apps]);

  const gameFilters = useMemo(() => {
    return ["ALL", ...new Set(games.map((game) => game.status || "LIVE"))];
  }, [games]);

  const filteredGames = useMemo(() => {
    if (selectedStatus === "ALL") return games;
    return games.filter((game) => game.status === selectedStatus);
  }, [games, selectedStatus]);

  const stats = useMemo(() => ({
    totalGames: games.length,
    liveGames: games.filter(g => g.status === "LIVE").length,
    inDevGames: games.filter(g => g.status !== "LIVE").length,
  }), [games]);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "mobile":
        return <Smartphone className="w-3.5 h-3.5" />;
      case "desktop":
        return <Monitor className="w-3.5 h-3.5" />;
      case "web":
        return <Globe className="w-3.5 h-3.5" />;
      default:
        return <Smartphone className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 pb-12">
      <SEO
        title={t("games.title")}
        description={t("seo.games_description")}
        keywords="Northern Step Studio games, interactive projects, mobile game concepts, public playtests"
        canonicalUrl="/games"
      />
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <span className="text-label text-accent mb-2 block flex items-center gap-2 text-xs sm:text-sm">
            <Gamepad2 className="w-4 h-4" />
            {t("games.label")}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter">
            <GlitchedText text={t("games.title")} duration={600} />
          </h1>
          <p className="text-muted-foreground mt-4 font-normal max-w-2xl text-sm sm:text-base">
            {t("games.subtitle")}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          <div className="card-dark-wise text-center py-4 sm:py-6">
            <div className="text-2xl sm:text-3xl font-black text-accent mb-1">{stats.totalGames}</div>
            <div className="text-xs sm:text-sm text-muted-foreground font-normal">{t("games.total")}</div>
          </div>
          <div className="card-dark-wise text-center py-4 sm:py-6">
            <div className="text-2xl sm:text-3xl font-black text-success mb-1">{stats.liveGames}</div>
            <div className="text-xs sm:text-sm text-muted-foreground font-normal">{t("games.live")}</div>
          </div>
          <div className="card-dark-wise text-center py-4 sm:py-6">
            <div className="text-2xl sm:text-3xl font-black text-accent mb-1">{stats.inDevGames}</div>
            <div className="text-xs sm:text-sm text-muted-foreground font-normal">{t("games.in_development", { defaultValue: "In Development" })}</div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="card-dark-wise mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-black uppercase">{t("games.filter")}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {gameFilters.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedStatus(category)}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-black uppercase transition-all ${
                  selectedStatus === category
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary border border-border hover:border-accent hover:text-accent"
                }`}
              >
                {category === "ALL" ? t("games.all") : category}
              </button>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-dark-wise animate-pulse">
                <div className="aspect-video rounded-2xl bg-secondary mb-4" />
                <div className="h-6 bg-secondary rounded-full w-3/4 mb-2" />
                <div className="h-4 bg-secondary rounded-full w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredGames.map((game) => {
              const coverImage = game.screenshots[0] || game.logo;

              return (
                <Link
                  key={game.id}
                  to={`/apps/${game.slug}`}
                  className="card-dark-wise group hover:border-accent transition-all duration-300"
                >
                  <div className="aspect-video rounded-2xl overflow-hidden border border-border bg-secondary mb-4">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gamepad2 className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-lg sm:text-xl uppercase tracking-tight truncate group-hover:text-accent transition-colors">
                        {game.name}
                      </h3>
                      <p className="text-sm text-muted-foreground font-normal line-clamp-2 mt-1">
                        {game.description || "An exciting game from Northern Step Studio"}
                      </p>
                    </div>
                    {game.logo && (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-border bg-gradient-to-br from-background to-secondary/80 flex-shrink-0">
                        <img src={game.logo} alt="" className="w-full h-full object-contain p-2" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <span className="text-[10px] sm:text-xs px-2.5 py-1 rounded-full bg-secondary border border-border inline-flex items-center gap-1">
                      {getPlatformIcon(game.platform)}
                      {t(`common.${game.platform || "mobile"}`)}
                    </span>
                    <span
                      className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-full ${
                        game.status === "LIVE"
                          ? "bg-success/10 text-success border border-success/30"
                          : game.status === "COMING_SOON"
                          ? "bg-accent/10 text-accent border border-accent/30"
                          : "bg-muted/10 text-muted-foreground border border-border"
                      }`}
                    >
                      {game.status}
                    </span>
                  </div>

                  {game.cta_url && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <span className="btn-pill-primary w-full text-center text-xs sm:text-sm inline-flex items-center justify-center gap-2">
                        {game.status === "LIVE" ? t("games.play_now") : t("apps.learn_more")}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="card-dark-wise text-center py-12">
            <Gamepad2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase mb-2">{t("games.no_games")}</h3>
            <p className="text-muted-foreground font-normal mb-6">
              {t("games.no_games_desc")}
            </p>
            <Link to="/apps" className="btn-pill-ghost inline-block">
              {t("games.browse_apps")}
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
