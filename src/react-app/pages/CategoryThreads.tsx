import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router";
import { MessageSquare, Eye, Pin, Lock, ArrowLeft, Plus, X, Search, Bold, Italic, Code, Link as LinkIcon, List, ListOrdered, Image } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import MentionInput, { replaceMentionTokens } from "@/react-app/components/MentionInput";
import { useAuth } from "@/react-app/lib/auth";
import { sendMentionNotifications } from "@/react-app/lib/notifications";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslation } from "react-i18next";

interface Thread {
  id: number;
  title: string;
  slug: string;
  category_name: string;
  category_slug: string;
  author_id?: number | null;
  author_name: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  post_count: number;
  created_at: string;
  updated_at: string;
  last_post_at: string;
}

export default function CategoryThreads() {
  const { t } = useTranslation();
  const { category } = useParams<{ category: string }>();
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [newThread, setNewThread] = useState({ title: "", content: "" });
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const threadContentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mentionedUserIds = useRef<number[]>([]);

  const handleImageUpload = async (file: File) => {
    if (!file || !threadContentTextareaRef.current) return;
    
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      
      const res = await fetch("/api/community-files/upload-image", {
        method: "POST",
        body: formData,
      });
      
      if (res.ok) {
        const data = await res.json();
        const imageMarkdown = `![${file.name}](${data.url})`;
        
        const textarea = threadContentTextareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const newText = text.substring(0, start) + imageMarkdown + text.substring(end);
        
        setNewThread({ ...newThread, content: newText });
        
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
        }, 0);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to upload image");
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
      alert("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const insertMarkdown = (before: string, after = "", textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    
    setNewThread({ ...newThread, content: newText });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const [searchTrigger, setSearchTrigger] = useState(0);

  useEffect(() => {
    if (!category) return;

    setLoading(true);
    const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "";
    fetch(`/api/community/threads?category=${category}&page=${page}&limit=20${searchParam}`)
      .then((res) => res.json())
      .then((data) => {
        setThreads(data.threads || []);
        setHasMore(data.pagination?.hasMore || false);
        setTotalPages(Math.ceil((data.pagination?.total || 0) / (data.pagination?.limit || 20)));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load threads:", err);
        setLoading(false);
      });
  }, [category, page, searchTrigger]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchTrigger(prev => prev + 1); // Trigger search
  };

  const handleCreateThread = async () => {
    if (!newThread.title.trim() || !newThread.content.trim() || !category) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/community/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_slug: category,
          title: newThread.title.trim(),
          content: newThread.content.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        await sendMentionNotifications({
          recipientIds: mentionedUserIds.current,
          referenceType: "community_thread",
          referenceId: data.id,
          content: `Mentioned you in the thread "${newThread.title.trim()}"`,
        }).catch((error) => {
          console.error("Failed to send thread mention notifications:", error);
        });

        setThreads((current) => [data, ...current]);
        setNewThread({ title: "", content: "" });
        setShowNewThreadForm(false);
        mentionedUserIds.current = [];
      } else {
        alert("Failed to create thread");
      }
    } catch (err) {
      console.error("Failed to create thread:", err);
      alert("Failed to create thread");
    } finally {
      setSubmitting(false);
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
            <div className="h-24 bg-card rounded-lg"></div>
            <div className="h-24 bg-card rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const categoryName = threads[0]?.category_name || category;

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/community"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to categories
          </Link>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              {categoryName}
            </h1>
            {user ? (
              <Button 
                className="gap-2"
                onClick={() => setShowNewThreadForm(true)}
              >
                <Plus className="w-4 h-4" />
                {t("community.create_thread", "Create Thread")}
              </Button>
            ) : (
              <Link to="/login">
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t("community.login_to_post", "Login to Post")}
                </Button>
              </Link>
            )}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("community.search_placeholder", "Search threads...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setPage(1);
                  setSearchTrigger(prev => prev + 1);
                }}
              >
                {t("community.clear", "Clear")}
              </Button>
            )}
          </form>
        </div>

        {/* New Thread Form */}
        {showNewThreadForm && (
          <div className="mb-6 bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{t("community.create_thread", "Create Thread")}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNewThreadForm(false);
                  setShowPreview(false);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t("community.thread_form.title_placeholder", "Thread title...")}</label>
                <Input
                  id="thread-title"
                  placeholder={t("community.thread_form.title_placeholder", "Thread title...")}
                  value={newThread.title}
                  onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                  disabled={submitting}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">{t("community.thread_form.content_placeholder", "Write your post content here...")}</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? t("community.thread_form.edit", "Edit") : t("community.thread_form.preview", "Preview")}
                  </Button>
                </div>

                {!showPreview ? (
                  <>
                    <div className="flex items-center gap-1 mb-2 pb-2 border-b border-border">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => insertMarkdown("**", "**", threadContentTextareaRef.current)}
                        title="Bold"
                      >
                        <Bold className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => insertMarkdown("*", "*", threadContentTextareaRef.current)}
                        title="Italic"
                      >
                        <Italic className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => insertMarkdown("`", "`", threadContentTextareaRef.current)}
                        title="Code"
                      >
                        <Code className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => insertMarkdown("[", "](url)", threadContentTextareaRef.current)}
                        title="Link"
                      >
                        <LinkIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => insertMarkdown("- ", "", threadContentTextareaRef.current)}
                        title="Bullet List"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => insertMarkdown("1. ", "", threadContentTextareaRef.current)}
                        title="Numbered List"
                      >
                        <ListOrdered className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={uploadingImage}
                        title="Upload Image"
                      >
                        <Image className="w-4 h-4" />
                      </Button>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                          e.target.value = "";
                        }}
                      />
                    </div>
                    <MentionInput
                      placeholder={t("community.thread_form.content_placeholder", "Write your post content here...")}
                      value={newThread.content}
                      onChange={(value) => setNewThread({ ...newThread, content: value })}
                      onMentionsChange={(ids) => {
                        mentionedUserIds.current = ids;
                      }}
                      textareaRef={threadContentTextareaRef}
                      disabled={submitting || uploadingImage}
                      rows={6}
                      className="font-mono text-sm"
                    />
                  </>
                ) : (
                  <div className="min-h-32 p-4 bg-background rounded-lg border border-border prose prose-invert prose-sm max-w-none">
                    {newThread.content ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {replaceMentionTokens(newThread.content)}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-muted-foreground">Nothing to preview</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleCreateThread}
                  disabled={!newThread.title.trim() || !newThread.content.trim() || submitting}
                >
                  {submitting ? t("community.thread_form.posting", "Posting...") : t("community.thread_form.post_thread", "Post Thread")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewThreadForm(false);
                    setShowPreview(false);
                  }}
                  disabled={submitting}
                >
                  {t("community.thread_form.cancel", "Cancel")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Threads */}
        <div className="space-y-3">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              to={`/community/thread/${thread.slug}`}
              className="block bg-card hover:bg-card/80 border border-border rounded-xl p-5 transition-all hover:scale-[1.01]"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {thread.is_pinned && (
                      <Pin className="w-4 h-4 text-accent flex-shrink-0" />
                    )}
                    {thread.is_locked && (
                      <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <h2 className="font-semibold truncate">{thread.title}</h2>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>by {thread.author_name || "Community member"}</span>
                    <span>•</span>
                    <span>{formatDate(thread.created_at)}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{thread.post_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{thread.view_count || 0}</span>
                  </div>
                </div>
              </div>

              {/* Last activity */}
              {thread.last_post_at && (
                <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                  Last activity {formatDate(thread.last_post_at)}
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {threads.length === 0 && !loading && (
          <div className="text-center py-16">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">No threads in this category yet.</p>
            {user && (
              <Button 
                className="gap-2"
                onClick={() => setShowNewThreadForm(true)}
              >
                <Plus className="w-4 h-4" />
                Start the first discussion
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={!hasMore}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
