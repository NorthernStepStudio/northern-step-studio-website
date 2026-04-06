import { useState, useEffect, type ElementType } from "react";
import { Link } from "react-router";
import {
  AlertTriangle,
  BarChart3,
  Clock3,
  Users,
  Zap,
  TrendingUp,
  FileText,
  Eye,
  Plus,
  ArrowRight,
  Globe,
  Calendar,
  Sparkles,
  DollarSign,
  CreditCard,
  Inbox,
} from "lucide-react";
import {
  ADMIN_RECENT_STORAGE_KEY,
  getAdminNavItem,
} from "@/react-app/lib/adminNav";

interface DashboardStats {
  totalApps: number;
  publishedApps: number;
  totalPosts: number;
  publishedPosts: number;
  totalEvents: number;
  uniqueUsers: number;
  recentPosts: RecentPost[];
  topApps: TopApp[];
}

interface RecentPost {
  id: number;
  title: string;
  slug: string;
  language: string;
  is_published: number;
  created_at: string;
}

interface TopApp {
  name: string;
  count: number;
}

interface RevenueSummary {
  availableBalance: number;
  pendingBalance: number;
  monthlyRevenue: number;
  totalCharges: number;
  currency: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentAdminPaths, setRecentAdminPaths] = useState<string[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch apps
        const appsRes = await fetch("/api/apps");
        const apps = await appsRes.json();
        
        // Fetch blog posts
        const postsRes = await fetch("/api/blog/all");
        const posts = await postsRes.json();
        
        // Fetch analytics
        const analyticsRes = await fetch("/api/analytics?range=30d");
        const analytics = await analyticsRes.json();

        setStats({
          totalApps: apps.length,
          publishedApps: apps.filter((a: { visibility?: string; status: string }) => a.visibility === "published" || a.status === "LIVE").length,
          totalPosts: posts.length,
          publishedPosts: posts.filter((p: { is_published: number }) => p.is_published).length,
          totalEvents: analytics.totalEvents || 0,
          uniqueUsers: analytics.uniqueUsers || 0,
          recentPosts: posts.slice(0, 5),
          topApps: analytics.topApps || [],
        });

        // Fetch revenue (don't fail if Stripe not configured)
        try {
          const revenueRes = await fetch("/api/stripe/summary");
          if (revenueRes.ok) {
            setRevenue(await revenueRes.json());
          }
        } catch {
          // Stripe not configured, skip
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(ADMIN_RECENT_STORAGE_KEY);
      if (!stored) {
        return;
      }
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setRecentAdminPaths(parsed.filter((value): value is string => typeof value === "string"));
      }
    } catch {
      // ignore storage issues
    }
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const languageLabels: Record<string, string> = {
    en: "EN",
    es: "ES",
    it: "IT",
  };

  const languageFlags: Record<string, string> = {
    en: "🇬🇧",
    es: "🇪🇸",
    it: "🇮🇹",
  };

  const formatCurrency = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const recentAdminItems = recentAdminPaths
    .map((path) => getAdminNavItem(path))
    .filter((item): item is NonNullable<ReturnType<typeof getAdminNavItem>> => Boolean(item))
    .filter((item) => item.path !== "/admin")
    .slice(0, 4);

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-hero mb-2">Dashboard</h1>
          <p className="text-muted-foreground font-normal">Studio overview and key metrics</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-dark-wise animate-pulse h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card-dark-wise animate-pulse h-64 lg:col-span-2" />
          <div className="card-dark-wise animate-pulse h-64" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Apps",
      value: stats?.totalApps || 0,
      subtext: `${stats?.publishedApps || 0} live`,
      icon: Zap,
      gradient: "from-accent/20 to-accent/5",
      iconColor: "text-accent",
    },
    {
      label: "Blog Posts",
      value: stats?.totalPosts || 0,
      subtext: `${stats?.publishedPosts || 0} published`,
      icon: FileText,
      gradient: "from-blue-500/20 to-blue-500/5",
      iconColor: "text-blue-500",
    },
    {
      label: "Total Events",
      value: stats?.totalEvents || 0,
      subtext: "Last 30 days",
      icon: BarChart3,
      gradient: "from-purple-500/20 to-purple-500/5",
      iconColor: "text-purple-500",
    },
    {
      label: "Unique Visitors",
      value: stats?.uniqueUsers || 0,
      subtext: "Last 30 days",
      icon: Users,
      gradient: "from-emerald-500/20 to-emerald-500/5",
      iconColor: "text-emerald-500",
    },
  ];

  const priorityActions = [
    stats && stats.totalApps > stats.publishedApps
      ? {
          label: "Review unpublished apps",
          detail: `${stats.totalApps - stats.publishedApps} app entries still are not live.`,
          to: "/admin/apps",
          icon: Zap,
          tone: "text-accent",
        }
      : null,
    stats && stats.totalPosts > stats.publishedPosts
      ? {
          label: "Publish queued content",
          detail: `${stats.totalPosts - stats.publishedPosts} posts are still in draft.`,
          to: "/admin/content",
          icon: FileText,
          tone: "text-blue-500",
        }
      : null,
    !revenue
      ? {
          label: "Check revenue setup",
          detail: "Stripe summary is unavailable. Review revenue configuration.",
          to: "/admin/revenue",
          icon: DollarSign,
          tone: "text-yellow-500",
        }
      : null,
    {
      label: "Review feature toggles",
      detail: "Make sure the public site only exposes what should be live.",
      to: "/admin/settings",
      icon: Sparkles,
      tone: "text-purple-500",
    },
  ].filter(Boolean) as Array<{
    label: string;
    detail: string;
    to: string;
    icon: ElementType;
    tone: string;
  }>;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-hero">Dashboard</h1>
          <span className="px-2.5 py-1 bg-accent/10 text-accent text-xs font-bold uppercase rounded-full">
            Admin
          </span>
        </div>
        <p className="text-muted-foreground font-normal">
          Welcome back! Here's what's happening with your studio.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`card-dark-wise relative overflow-hidden bg-gradient-to-br ${stat.gradient}`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </span>
              <div className={`p-2 rounded-xl bg-background/50 ${stat.iconColor}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black mb-1">{stat.value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{stat.subtext}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card-dark-wise">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Clock3 className="w-5 h-5 text-accent" />
              Jump Back In
            </h2>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
              Recent sections
            </span>
          </div>

          {recentAdminItems.length > 0 ? (
            <div className="space-y-3">
              {recentAdminItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-background/50 p-4 transition-colors hover:border-accent/30 hover:bg-accent/5"
                >
                  <div className="p-2 rounded-xl bg-accent/10 text-accent">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black uppercase text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-background/50 p-5">
              <p className="text-sm text-muted-foreground">
                Your recently visited admin sections will appear here once you move through the console.
              </p>
            </div>
          )}
        </div>

        <div className="card-dark-wise">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Priority Actions
            </h2>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
              Useful next steps
            </span>
          </div>

          <div className="space-y-3">
            {priorityActions.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="flex items-start gap-3 rounded-2xl border border-border bg-background/50 p-4 transition-colors hover:border-accent/30 hover:bg-accent/5"
              >
                <div className={`p-2 rounded-xl bg-background/60 ${action.tone}`}>
                  <action.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black uppercase text-sm">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {action.detail}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Blog Posts */}
        <div className="card-dark-wise lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              Recent Posts
            </h2>
            <Link
              to="/admin/content"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {stats?.recentPosts && stats.recentPosts.length > 0 ? (
            <div className="space-y-3">
              {stats.recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="text-sm font-bold uppercase text-muted-foreground"
                      title={languageFlags[post.language] || "International"}
                    >
                      {languageLabels[post.language] || "INTL"}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{post.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.created_at)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full shrink-0 ${
                      post.is_published
                        ? "bg-green-500/20 text-green-500"
                        : "bg-yellow-500/20 text-yellow-500"
                    }`}
                  >
                    {post.is_published ? "Live" : "Draft"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">No blog posts yet</p>
              <Link to="/admin/content" className="text-sm text-accent hover:underline">
                Create your first post
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card-dark-wise">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-accent" />
            Quick Actions
          </h2>

          <div className="space-y-3">
            <Link
              to="/admin/apps"
              className="flex items-center gap-3 p-3 bg-accent/10 hover:bg-accent/20 rounded-xl transition-colors group"
            >
              <div className="p-2 bg-accent/20 rounded-lg">
                <Plus className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Add New App</p>
                <p className="text-xs text-muted-foreground">Register a new project</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/admin/content"
              className="flex items-center gap-3 p-3 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl transition-colors group"
            >
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FileText className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Write Blog Post</p>
                <p className="text-xs text-muted-foreground">Share updates & news</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/admin/analytics"
              className="flex items-center gap-3 p-3 bg-purple-500/10 hover:bg-purple-500/20 rounded-xl transition-colors group"
            >
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">View Analytics</p>
                <p className="text-xs text-muted-foreground">Track performance</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/admin/leads"
              className="flex items-center gap-3 p-3 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-xl transition-colors group"
            >
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Inbox className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Review Leads</p>
                <p className="text-xs text-muted-foreground">Check setup reviews and demo requests</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/admin/studio"
              className="flex items-center gap-3 p-3 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl transition-colors group"
            >
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Globe className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Studio Notes</p>
                <p className="text-xs text-muted-foreground">Internal documentation</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Revenue Summary */}
      {revenue && (
        <div className="card-dark-wise mb-6 relative overflow-hidden bg-gradient-to-br from-green-500/10 to-green-500/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Revenue Summary
            </h2>
            <Link
              to="/admin/revenue"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              View details <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-background/30 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
              <p className="text-xl font-bold text-green-500">
                {formatCurrency(revenue.availableBalance, revenue.currency)}
              </p>
            </div>
            <div className="p-3 bg-background/30 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Pending</p>
              <p className="text-xl font-bold text-yellow-500">
                {formatCurrency(revenue.pendingBalance, revenue.currency)}
              </p>
            </div>
            <div className="p-3 bg-background/30 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Monthly Revenue</p>
              <p className="text-xl font-bold">
                {formatCurrency(revenue.monthlyRevenue, revenue.currency)}
              </p>
            </div>
            <div className="p-3 bg-background/30 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-accent/20 rounded-lg">
                <CreditCard className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Transactions</p>
                <p className="text-lg font-bold">{revenue.totalCharges}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Apps by Activity */}
      {stats?.topApps && stats.topApps.length > 0 && (
        <div className="card-dark-wise">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Eye className="w-5 h-5 text-accent" />
              Top Apps by Activity
            </h2>
            <span className="text-xs text-muted-foreground">Last 30 days</span>
          </div>

          <div className="space-y-3">
            {stats.topApps.slice(0, 5).map((app, index) => (
              <div key={app.name} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{app.name}</span>
                    <span className="text-xs text-muted-foreground">{app.count} events</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{
                        width: `${(app.count / stats.topApps[0].count) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
