import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import GlitchedText from "@/react-app/components/GlitchedText";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string | null;
  language: string;
  published_at: string;
  content: string;
}

export default function Blog() {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch(`/api/blog?lang=${i18n.language}`);
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Failed to fetch blog posts:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [i18n.language]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 pb-16">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <span className="text-label text-accent mb-2 block text-xs sm:text-sm">
            {t("blog.label")}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter">
            <GlitchedText text={t("blog.title")} duration={600} />
          </h1>
          <p className="text-muted-foreground mt-4 font-normal text-sm sm:text-base max-w-2xl">
            {t("blog.subtitle")}
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-dark-wise animate-pulse">
                <div className="h-48 bg-muted rounded-xl mb-4" />
                <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && posts.length === 0 && (
          <div className="card-dark-wise text-center py-16 sm:py-20">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="text-xl font-black uppercase mb-3">{t("blog.coming_soon")}</h3>
            <p className="text-muted-foreground font-normal max-w-md mx-auto">
              {t("blog.coming_soon_desc")}
            </p>
          </div>
        )}

        {/* Posts grid */}
        {!loading && posts.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="card-dark-wise group hover:border-accent/30 transition-all duration-300"
              >
                {/* Cover image */}
                {post.cover_image ? (
                  <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-[28px]">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                  </div>
                ) : (
                  <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-[28px] bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                    <span className="text-5xl opacity-50">📝</span>
                  </div>
                )}

                {/* Content */}
                <h2 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors line-clamp-2">
                  {post.title}
                </h2>

                {post.excerpt && (
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(post.published_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {estimateReadTime(post.content)} min
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
