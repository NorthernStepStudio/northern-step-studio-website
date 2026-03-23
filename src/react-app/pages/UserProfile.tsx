import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { MessageSquare, Calendar, User, Settings, Edit, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useAuth } from "@/react-app/lib/auth";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/react-app/hooks/usePermissions";
import { getRoleDisplayLabel } from "@/shared/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/react-app/components/ui/avatar";

interface UserActivity {
  threads: {
    id: number;
    title: string;
    slug: string;
    category: string;
    created_at: string;
    is_pinned: boolean;
    is_locked: boolean;
  }[];
  posts: {
    id: number;
    content: string;
    thread_id: number;
    thread_title: string;
    thread_slug: string;
    category: string;
    created_at: string;
  }[];
  user: {
    email?: string;
    display_name?: string;
    bio?: string;
    avatar_url?: string | null;
    created_at: string;
  } | null;
}

interface UserProfileProps {
  isOwnProfile?: boolean;
}

export default function UserProfile({ isOwnProfile = false }: UserProfileProps) {
  const { t } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  const { user: authUser, isPending } = useAuth();
  const { userRole, isModerator } = usePermissions();
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"threads" | "posts">("threads");
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    const fetchActivity = async () => {
      if (isOwnProfile && isPending) {
        return;
      }

      if (isOwnProfile && !authUser) {
        setLoading(false);
        return;
      }

      if (isOwnProfile && authUser) {
        try {
          const response = await fetch("/api/user/activity");
          if (response.ok) {
            const data = await response.json();
            setActivity(data);
          }
        } catch (error) {
          console.error("Failed to fetch user activity:", error);
        } finally {
          setLoading(false);
        }
      } else if (userId) {
        try {
          const response = await fetch(`/api/users/${userId}/activity`);
          if (response.ok) {
            const data = await response.json();
            setActivity(data);
          }
        } catch (error) {
          console.error("Failed to fetch user activity:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [isOwnProfile, isPending, authUser, userId]);

  useEffect(() => {
    setAvatarFailed(false);
  }, [activity?.user?.avatar_url]);

  if (isPending || loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="animate-pulse">
            <div className="h-40 bg-secondary rounded-3xl mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-secondary rounded-2xl" />
                ))}
              </div>
              <div className="space-y-4">
                <div className="h-40 bg-secondary rounded-2xl" />
                <div className="h-40 bg-secondary rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isOwnProfile && !authUser) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="card-dark-wise text-center py-16">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-black uppercase mb-2">{t("profile.sign_in_required")}</h2>
            <p className="text-muted-foreground mb-6">{t("profile.sign_in_message")}</p>
            <Link to="/login" className="btn-pill-primary inline-block">
              {t("profile.sign_in_button")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!activity || !activity.user) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="card-dark-wise text-center py-16">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-black uppercase mb-2">{t("profile.user_not_found")}</h2>
            <p className="text-muted-foreground">{t("profile.user_not_found_message")}</p>
          </div>
        </div>
      </div>
    );
  }

  const displayName = activity.user.display_name || activity.user.email?.split("@")[0] || "Member";
  const avatarUrl = activity.user.avatar_url?.trim() || "";
  const showAvatar = Boolean(avatarUrl) && !avatarFailed;
  const avatarFallback = displayName.charAt(0).toUpperCase();
  const joinDate = new Date(activity.user.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const totalActivity = activity.threads.length + activity.posts.length;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="relative mb-8">
          <div className="h-48 rounded-3xl bg-gradient-to-br from-accent/20 via-accent/10 to-blue-500/20 border border-border mb-[-60px]" />

          <div className="relative card-dark-wise">
            <div className="flex flex-col lg:flex-row items-start gap-6">
              <Avatar className="size-32 rounded-3xl flex-shrink-0 border-4 border-background shadow-2xl -mt-16 bg-gradient-to-br from-accent to-accent/60 text-white" size="lg">
                {showAvatar ? (
                  <AvatarImage
                    src={avatarUrl}
                    alt={`${displayName} avatar`}
                    className="rounded-3xl"
                    onError={() => setAvatarFailed(true)}
                  />
                ) : null}
                <AvatarFallback className="rounded-3xl bg-gradient-to-br from-accent to-accent/60 text-4xl font-black text-white">
                  {avatarFallback || <User className="w-12 h-12 text-white" />}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 pt-2">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-4xl font-black uppercase tracking-tight">
                    {displayName}
                  </h1>
                  {isOwnProfile && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-accent">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {getRoleDisplayLabel(userRole)}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  {isOwnProfile && activity.user.email ? activity.user.email : "Northern Step Studio community member"}
                </p>
                {activity.user.bio && (
                  <p className="text-sm text-foreground mb-4 max-w-2xl">
                    {activity.user.bio}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{t("profile.joined")} {joinDate}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>{totalActivity} total contributions</span>
                  </span>
                </div>
              </div>

              {isOwnProfile && (
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 self-stretch lg:self-start">
                  <Link to="/profile/edit" className="btn-pill-primary-compact w-full sm:w-auto lg:min-w-[11.5rem]">
                    <Edit className="w-3.5 h-3.5" />
                    {t("profile.edit_profile")}
                  </Link>
                  <Link to="/preferences" className="btn-pill-ghost-compact w-full sm:w-auto lg:min-w-[11.5rem]">
                    <Settings className="w-3.5 h-3.5" />
                    {t("profile.settings")}
                  </Link>
                  {isModerator && (
                    <Link to="/admin" className="btn-pill-ghost-compact w-full sm:w-auto lg:min-w-[11.5rem]">
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Admin Console
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="card-dark-wise bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-black">{activity.threads.length}</p>
                    <p className="text-xs text-muted-foreground uppercase font-bold">{t("profile.threads_started")}</p>
                  </div>
                </div>
              </div>

              <div className="card-dark-wise bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-black">{activity.posts.length}</p>
                    <p className="text-xs text-muted-foreground uppercase font-bold">{t("profile.replies_posted")}</p>
                  </div>
                </div>
              </div>

              <div className="card-dark-wise bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-black">{totalActivity}</p>
                    <p className="text-xs text-muted-foreground uppercase font-bold">{t("profile.total_activity")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab("threads")}
                className={`px-6 py-3 rounded-2xl text-sm font-black uppercase transition-all ${
                  activeTab === "threads"
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("profile.my_threads")} ({activity.threads.length})
              </button>
              <button
                onClick={() => setActiveTab("posts")}
                className={`px-6 py-3 rounded-2xl text-sm font-black uppercase transition-all ${
                  activeTab === "posts"
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("profile.my_posts")} ({activity.posts.length})
              </button>
            </div>

            {activeTab === "threads" && (
              <div className="space-y-4">
                {activity.threads.length > 0 ? (
                  activity.threads.map((thread) => (
                    <Link
                      key={thread.id}
                      to={`/community/thread/${thread.slug}`}
                      className="card-dark-wise hover:card-dark-wise-active block transition-all"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="text-lg font-black uppercase tracking-tight flex-1">
                          {thread.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-label px-2.5 py-1 rounded-full bg-secondary border border-border text-xs">
                            {thread.category}
                          </span>
                          {thread.is_pinned && (
                            <span className="text-label px-2.5 py-1 rounded-full bg-accent/20 text-accent border border-accent/30 text-xs">
                              {t("profile.pinned")}
                            </span>
                          )}
                          {thread.is_locked && (
                            <span className="text-label px-2.5 py-1 rounded-full bg-muted/20 text-muted-foreground border border-border text-xs">
                              {t("profile.locked")}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(thread.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="card-dark-wise text-center py-12">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">{t("profile.no_threads")}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t("profile.no_threads_message")}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "posts" && (
              <div className="space-y-4">
                {activity.posts.length > 0 ? (
                  activity.posts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/community/thread/${post.thread_slug}`}
                      className="card-dark-wise hover:card-dark-wise-active block transition-all"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-label px-2.5 py-1 rounded-full bg-secondary border border-border text-xs">
                          {post.category}
                        </span>
                        <span className="text-sm text-muted-foreground">{t("profile.posted_in")}</span>
                        <span className="text-sm font-bold">{post.thread_title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                        {post.content}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="card-dark-wise text-center py-12">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">{t("profile.no_posts")}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t("profile.no_posts_message")}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="card-dark-wise">
              <h2 className="text-lg font-black uppercase mb-4">Account Overview</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs uppercase font-black text-muted-foreground mb-1">Display Name</p>
                  <p className="text-foreground">{displayName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase font-black text-muted-foreground mb-1">Email</p>
                  <p className="text-foreground break-all">
                    {isOwnProfile && activity.user.email ? activity.user.email : "Private"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase font-black text-muted-foreground mb-1">Joined</p>
                  <p className="text-foreground">{joinDate}</p>
                </div>
                {isOwnProfile && (
                  <div>
                    <p className="text-xs uppercase font-black text-muted-foreground mb-1">Role</p>
                    <p className="text-foreground">{getRoleDisplayLabel(userRole)}</p>
                  </div>
                )}
              </div>
            </div>

            {isOwnProfile && (
              <div className="card-dark-wise">
                <h2 className="text-lg font-black uppercase mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link to="/profile/edit" className="flex items-center justify-between rounded-2xl border border-border bg-secondary/40 px-4 py-3 hover:border-accent transition-colors">
                    <span className="flex items-center gap-3 text-sm font-bold uppercase">
                      <Edit className="w-4 h-4 text-accent" />
                      Edit Profile
                    </span>
                    <span className="text-xs text-muted-foreground">Open</span>
                  </Link>
                  <Link to="/preferences" className="flex items-center justify-between rounded-2xl border border-border bg-secondary/40 px-4 py-3 hover:border-accent transition-colors">
                    <span className="flex items-center gap-3 text-sm font-bold uppercase">
                      <Settings className="w-4 h-4 text-accent" />
                      Preferences
                    </span>
                    <span className="text-xs text-muted-foreground">Manage</span>
                  </Link>
                  {isModerator && (
                    <Link to="/admin" className="flex items-center justify-between rounded-2xl border border-border bg-secondary/40 px-4 py-3 hover:border-accent transition-colors">
                      <span className="flex items-center gap-3 text-sm font-bold uppercase">
                        <LayoutDashboard className="w-4 h-4 text-accent" />
                        Admin Console
                      </span>
                      <span className="text-xs text-muted-foreground">Enter</span>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
