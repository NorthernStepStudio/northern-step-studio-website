import { useTranslation } from "react-i18next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router";
import SEO from "@/react-app/components/SEO";

export default function RoguelikeGame() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-20 sm:pt-24 px-0 sm:px-6 pb-0 flex flex-col">
      <SEO
        title="DOOMED: A Very Silly Dungeon"
        description="A browser-playable roguelike game with meta upgrades and doom corruption."
        keywords="roguelike, game, dungeon crawler, web game, Northern Step Studio"
        canonicalUrl="/games/doomed"
      />
      
      <div className="container mx-auto max-w-6xl flex-1 flex flex-col h-full mb-6">
        <div className="px-4 sm:px-0 flex items-center justify-between mb-4">
          <Link to="/games" className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors font-black uppercase text-sm group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t("product.back")}
          </Link>
          <a href="/games/nexus-roguelike/index.html" target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-accent hover:underline flex items-center gap-1 font-bold">
            Open in Fullscreen <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        
        <div className="card-dark-wise flex-1 w-full rounded-none sm:rounded-2xl overflow-hidden p-0 border-0 sm:border sm:border-border min-h-[75vh] flex flex-col">
          <iframe 
            src="/games/nexus-roguelike/index.html" 
            className="flex-1 w-full border-0 bg-background"
            title="DOOMED: A Very Silly Dungeon"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
