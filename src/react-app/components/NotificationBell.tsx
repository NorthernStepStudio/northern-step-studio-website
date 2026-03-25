import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, FileText, MessageSquare, StickyNote, X } from "lucide-react";
import { Link } from "react-router";
import { apiFetch } from "@/react-app/lib/api";

interface Notification {
  id: number;
  recipient_id: number;
  sender_id: number;
  sender_email: string;
  sender_name: string | null;
  type: string;
  reference_type: string;
  reference_id: number;
  content: string;
  is_read: number;
  created_at: string;
  note_title?: string | null;
  blog_title?: string | null;
  blog_slug?: string | null;
  thread_title?: string | null;
  thread_slug?: string | null;
  post_thread_title?: string | null;
  post_thread_slug?: string | null;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const res = await apiFetch("/api/notifications/unread-count");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for new notifications
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch full list when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "PUT" });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const getNotificationLink = (n: Notification) => {
    if (n.reference_type === "note") {
      return "/admin/studio";
    }
    if (n.reference_type === "blog_post") {
      return n.blog_slug ? `/blog/${n.blog_slug}` : "/blog";
    }
    if (n.reference_type === "community_thread") {
      return n.thread_slug ? `/community/thread/${n.thread_slug}` : "/community";
    }
    if (n.reference_type === "community_post") {
      return n.post_thread_slug ? `/community/thread/${n.post_thread_slug}` : "/community";
    }
    return "/profile";
  };

  const getIcon = (_type: string, referenceType: string) => {
    if (referenceType === "note") {
      return <StickyNote className="w-4 h-4 text-yellow-400" />;
    }
    if (referenceType === "community_thread" || referenceType === "community_post") {
      return <MessageSquare className="w-4 h-4 text-blue-400" />;
    }
    return <FileText className="w-4 h-4 text-blue-400" />;
  };

  const getReferenceLabel = (notification: Notification) => {
    switch (notification.reference_type) {
      case "note":
        return "a note";
      case "community_thread":
        return "a community thread";
      case "community_post":
        return "a community reply";
      case "blog_post":
        return "a blog post";
      default:
        return "your account";
    }
  };

  const getReferenceTitle = (notification: Notification) => {
    switch (notification.reference_type) {
      case "note":
        return notification.note_title;
      case "community_thread":
        return notification.thread_title;
      case "community_post":
        return notification.post_thread_title;
      case "blog_post":
        return notification.blog_title;
      default:
        return null;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-accent text-accent-foreground rounded-full px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-hidden rounded-xl bg-card border border-border shadow-xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-bold uppercase text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-muted-foreground hover:text-accent transition-colors flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications list */}
          <div className="max-h-72 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center text-muted-foreground">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  to={getNotificationLink(n)}
                  onClick={() => {
                    if (!n.is_read) markAsRead(n.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0 ${
                    !n.is_read ? "bg-accent/5" : ""
                  }`}
                >
                  <div className="mt-0.5">
                    {getIcon(n.type, n.reference_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium text-accent">
                        @{n.sender_name || n.sender_email?.split("@")[0]}
                      </span>{" "}
                      mentioned you in {getReferenceLabel(n)}
                    </p>
                    {getReferenceTitle(n) && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {getReferenceTitle(n)}
                      </p>
                    )}
                    {n.content && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {n.content}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatTime(n.created_at)}
                    </p>
                  </div>
                  {!n.is_read && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        markAsRead(n.id);
                      }}
                      className="mt-1 p-1 hover:bg-accent/20 rounded transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-3 h-3 text-accent" />
                    </button>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
