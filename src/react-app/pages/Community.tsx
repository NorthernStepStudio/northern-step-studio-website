import { useState, useEffect } from "react";
import { Link } from "react-router";
import { MessageSquare, Users, Search } from "lucide-react";
import { Input } from "@/react-app/components/ui/input";
import { Button } from "@/react-app/components/ui/button";
import SEO from "@/react-app/components/SEO";
import { useTranslation } from "react-i18next";
import { apiFetch } from "@/react-app/lib/api";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
  thread_count?: number;
  post_count?: number;
  last_thread_title?: string;
  last_thread_slug?: string;
}

interface Thread {
  id: number;
  title: string;
  slug: string;
  category_name: string;
  category_slug: string;
  author_name: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  post_count: number;
  created_at: string;
}

export default function Community() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Thread[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetch("/api/community/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
        setLoading(false);
      });
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await apiFetch(`/api/community/threads?search=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      setSearchResults(data.threads || []);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearching(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-card rounded-lg"></div>
            <div className="h-32 bg-card rounded-lg"></div>
            <div className="h-32 bg-card rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <SEO
        title="Community"
        description="Join the Northern Step Studio community. Discuss our apps, games, and projects. Share feedback, get support, and connect with other users and developers."
        keywords="northern step studio community, app discussion, game forum, user support, developer community"
        canonicalUrl="/community"
      />
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent tracking-wide">
            {t("community.title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {t("community.subtitle")}
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("community.search_placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={searching}>
                {searching ? t("community.searching") : t("community.search_button")}
              </Button>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {t("community.search_results")} ({searchResults.length})
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                {t("community.clear")}
              </Button>
            </div>
            <div className="space-y-3">
              {searchResults.map((thread) => (
                <Link
                  key={thread.id}
                  to={`/community/thread/${thread.slug}`}
                  className="block bg-card hover:bg-card/80 border border-border rounded-xl p-5 transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-2">{thread.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="text-accent">{thread.category_name}</span>
                        <span>•</span>
                        <span>by {thread.author_name || "Community member"}</span>
                        <span>•</span>
                        <span>{formatDate(thread.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageSquare className="w-4 h-4" />
                      <span>{thread.post_count || 0}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {searchResults.length === 0 && searchQuery && !searching && (
          <div className="mb-8 text-center py-8 bg-card border border-border rounded-xl">
            <p className="text-muted-foreground">No threads found matching "{searchQuery}"</p>
          </div>
        )}

        {/* Categories */}
        <div className="space-y-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/community/${category.slug}`}
              className="block bg-card hover:bg-card/80 border border-border rounded-2xl p-6 transition-all hover:scale-[1.02] hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="text-4xl flex-shrink-0">{category.icon}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                    {category.name}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4">
                    {category.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>{category.thread_count || 0} threads</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{category.post_count || 0} posts</span>
                    </div>
                  </div>

                  {/* Last activity */}
                  {category.last_thread_title && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Latest: <span className="text-foreground">{category.last_thread_title}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {categories.length === 0 && !loading && (
          <div className="text-center py-16">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No categories available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
