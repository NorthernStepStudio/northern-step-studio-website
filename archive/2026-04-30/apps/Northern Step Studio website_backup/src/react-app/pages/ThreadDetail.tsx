import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router";
import { Eye, Pin, Lock, Edit2, Trash2, X, Check, Bold, Italic, Code, Link as LinkIcon, List, ListOrdered, Image } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import MentionInput, { extractMentionedUserIds, replaceMentionTokens } from "@/react-app/components/MentionInput";
import { useAuth } from "@/react-app/lib/auth";
import { sendMentionNotifications } from "@/react-app/lib/notifications";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslation } from "react-i18next";
import { apiFetch } from "@/react-app/lib/api";
import { getMockCommunityThreadBySlug } from "@/react-app/data/communityMock";

interface Thread {
  id: number;
  title: string;
  slug: string;
  content: string;
  category_name: string;
  category_slug: string;
  author_id?: number | null;
  author_name: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  created_at: string;
}

interface Post {
  id: number;
  content: string;
  author_id: number;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export default function ThreadDetail() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const newPostTextareaRef = useRef<HTMLTextAreaElement>(null);
  const editPostTextareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editImageInputRef = useRef<HTMLInputElement>(null);
  const newPostMentionedUserIds = useRef<number[]>([]);
  const editMentionedUserIds = useRef<number[]>([]);

  const handleImageUpload = async (file: File, textarea: HTMLTextAreaElement | null) => {
    if (!file || !textarea) return;
    
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
        
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const newText = text.substring(0, start) + imageMarkdown + text.substring(end);
        
        if (editingPostId) {
          setEditContent(newText);
        } else {
          setNewPost(newText);
        }
        
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
    
    if (editingPostId) {
      setEditContent(newText);
    } else {
      setNewPost(newText);
    }
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  useEffect(() => {
    if (!slug) return;

    const loadThread = async () => {
      let loadedLiveThread = false;

      try {
        const threadRes = await apiFetch(`/api/community/threads/${slug}`);
        const threadData = await threadRes.json().catch(() => null);
        if (threadData?.id) {
          setThread(threadData);

          const postsRes = await apiFetch(`/api/community/posts?thread_id=${threadData.id}&page=${page}&limit=50`);
          const postsData = await postsRes.json().catch(() => null);
          setPosts(Array.isArray(postsData?.posts) ? postsData.posts : []);
          setHasMore(postsData?.pagination?.hasMore || false);
          setTotalPages(Math.ceil((postsData?.pagination?.total || 0) / (postsData?.pagination?.limit || 50)));
          setUsingMockData(false);
          loadedLiveThread = true;
        }
      } catch (err) {
        console.error("Failed to load thread:", err);
      }

      if (!loadedLiveThread) {
        const mockThread = slug ? getMockCommunityThreadBySlug(slug) : null;
        if (mockThread) {
          setThread(mockThread);
          setPosts(mockThread.posts);
          setHasMore(false);
          setTotalPages(mockThread.posts.length > 0 ? 1 : 0);
          setUsingMockData(true);
        } else {
          setThread(null);
        }
      }

      setLoading(false);
    };

    loadThread();
  }, [slug, page]);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !thread || !user) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thread_id: thread.id,
          content: newPost.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        await sendMentionNotifications({
          recipientIds: newPostMentionedUserIds.current,
          referenceType: "community_post",
          referenceId: data.id,
          content: `Mentioned you in a reply on "${thread.title}"`,
        }).catch((error) => {
          console.error("Failed to send reply mention notifications:", error);
        });

        setPosts((current) => [...current, data]);
        setNewPost("");
        newPostMentionedUserIds.current = [];
      } else {
        alert("Failed to post reply");
      }
    } catch (err) {
      console.error("Failed to submit post:", err);
      alert("Failed to post reply");
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

  const canEditPost = (post: Post) => {
    if (usingMockData) return false;
    const currentUserId = user?.db_user_id ?? Number(user?.id);
    if (!currentUserId || post.author_id !== currentUserId) return false;
    const postTime = new Date(post.created_at).getTime();
    const now = Date.now();
    const minutesSincePost = (now - postTime) / 1000 / 60;
    return minutesSincePost <= 15;
  };

  const handleEditPost = (post: Post) => {
    setEditingPostId(post.id);
    setEditContent(post.content);
    editMentionedUserIds.current = extractMentionedUserIds(post.content);
  };

  const handleSaveEdit = async (postId: number) => {
    if (!editContent.trim()) return;

    setEditSubmitting(true);
    try {
      const existingPost = posts.find((post) => post.id === postId);
      const previousMentionIds = existingPost ? extractMentionedUserIds(existingPost.content) : [];
      const res = await apiFetch(`/api/community/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (res.ok) {
        if (thread) {
          await sendMentionNotifications({
            recipientIds: editMentionedUserIds.current.filter((id) => !previousMentionIds.includes(id)),
            referenceType: "community_post",
            referenceId: postId,
            content: `Mentioned you in a reply on "${thread.title}"`,
          }).catch((error) => {
            console.error("Failed to send edited reply mention notifications:", error);
          });
        }

        setPosts((current) =>
          current.map((post) =>
            post.id === postId
              ? { ...post, content: editContent.trim(), updated_at: new Date().toISOString() }
              : post,
          ),
        );
        setEditingPostId(null);
        setEditContent("");
        editMentionedUserIds.current = [];
      } else {
        const error = await res.json();
        alert(error.error || "Failed to edit post");
      }
    } catch (err) {
      console.error("Failed to edit post:", err);
      alert("Failed to edit post");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await apiFetch(`/api/community/posts/${postId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPosts(posts.filter(p => p.id !== postId));
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete post");
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Failed to delete post");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-card rounded-lg"></div>
            <div className="h-48 bg-card rounded-lg"></div>
            <div className="h-32 bg-card rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Thread not found</h1>
          <Link to="/community" className="text-accent hover:underline">
            Back to community
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/community" className="hover:text-foreground">Community</Link>
          <span>/</span>
          <Link to={`/community/${thread.category_slug}`} className="hover:text-foreground">
            {thread.category_name}
          </Link>
        </div>

        {usingMockData && (
          <div className="mb-4 rounded-xl border border-dashed border-accent/30 bg-accent/5 px-4 py-3 text-sm text-muted-foreground">
            Showing sample discussion data.
          </div>
        )}

        {/* Thread header */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            {thread.is_pinned && <Pin className="w-5 h-5 text-accent flex-shrink-0 mt-1" />}
            {thread.is_locked && <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />}
            <h1 className="text-2xl md:text-3xl font-bold flex-1">{thread.title}</h1>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <span>Started by {thread.author_name || "Community member"}</span>
            <span>•</span>
            <span>{formatDate(thread.created_at)}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{thread.view_count} views</span>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {replaceMentionTokens(thread.content)}
            </ReactMarkdown>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4 mb-8">
          {posts.map((post) => (
            <div key={post.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <Link
                    to={`/user/${post.author_id}`}
                    className="font-medium hover:text-accent transition-colors"
                  >
                    {post.author_name || "Community member"}
                  </Link>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {formatDate(post.created_at)}
                    {post.updated_at !== post.created_at && " (edited)"}
                  </span>
                </div>
                {canEditPost(post) && editingPostId !== post.id && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPost(post)}
                      className="h-8 px-2"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                      className="h-8 px-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              {editingPostId === post.id ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1 mb-2 pb-2 border-b border-border">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => insertMarkdown("**", "**", editPostTextareaRef.current)}
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => insertMarkdown("*", "*", editPostTextareaRef.current)}
                      title="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => insertMarkdown("`", "`", editPostTextareaRef.current)}
                      title="Code"
                    >
                      <Code className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => insertMarkdown("[", "](url)", editPostTextareaRef.current)}
                      title="Link"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => insertMarkdown("- ", "", editPostTextareaRef.current)}
                      title="Bullet List"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => insertMarkdown("1. ", "", editPostTextareaRef.current)}
                      title="Numbered List"
                    >
                      <ListOrdered className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => editImageInputRef.current?.click()}
                      disabled={uploadingImage}
                      title="Upload Image"
                    >
                      <Image className="w-4 h-4" />
                    </Button>
                    <input
                      ref={editImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, editPostTextareaRef.current);
                        e.target.value = "";
                      }}
                    />
                  </div>
                  <MentionInput
                    value={editContent}
                    onChange={setEditContent}
                    onMentionsChange={(ids) => {
                      editMentionedUserIds.current = ids;
                    }}
                    textareaRef={editPostTextareaRef}
                    disabled={editSubmitting || uploadingImage}
                    className="min-h-24 font-mono text-sm"
                    placeholder={t("community.thread_form.content_placeholder", "Write your post content here...")}
                    rows={6}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(post.id)}
                      disabled={!editContent.trim() || editSubmitting}
                      className="gap-1"
                    >
                      <Check className="w-3 h-3" />
                      {editSubmitting ? t("community.thread_form.saving", "Saving...") : t("community.thread_form.save", "Save")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingPostId(null);
                        setEditContent("");
                        editMentionedUserIds.current = [];
                      }}
                      disabled={editSubmitting}
                      className="gap-1"
                    >
                      <X className="w-3 h-3" />
                      {t("community.thread_form.cancel", "Cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {replaceMentionTokens(post.content)}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Reply form */}
        {usingMockData ? (
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <p className="text-muted-foreground">Sample thread data only. Replies are disabled until the live community backend is ready.</p>
          </div>
        ) : user && !thread.is_locked ? (
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t("community.thread_form.post_reply", "Post a Reply")}</h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? t("community.thread_form.edit", "Edit") : t("community.thread_form.preview", "Preview")}
              </Button>
            </div>
            <form onSubmit={handleSubmitPost}>
              {!showPreview ? (
                <>
                  <div className="flex items-center gap-1 mb-2 pb-2 border-b border-border">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => insertMarkdown("**", "**", newPostTextareaRef.current)}
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => insertMarkdown("*", "*", newPostTextareaRef.current)}
                      title="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => insertMarkdown("`", "`", newPostTextareaRef.current)}
                      title="Code"
                    >
                      <Code className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => insertMarkdown("[", "](url)", newPostTextareaRef.current)}
                      title="Link"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => insertMarkdown("- ", "", newPostTextareaRef.current)}
                      title="Bullet List"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => insertMarkdown("1. ", "", newPostTextareaRef.current)}
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
                        if (file) handleImageUpload(file, newPostTextareaRef.current);
                        e.target.value = "";
                      }}
                    />
                  </div>
                  <MentionInput
                    value={newPost}
                    onChange={setNewPost}
                    onMentionsChange={(ids) => {
                      newPostMentionedUserIds.current = ids;
                    }}
                    textareaRef={newPostTextareaRef}
                    disabled={submitting || uploadingImage}
                    placeholder={t("community.thread_form.content_placeholder", "Write your post content here...")}
                    className="mb-4 min-h-32 font-mono text-sm"
                    rows={8}
                  />
                </>
              ) : (
                <div className="mb-4 min-h-32 p-4 bg-background rounded-lg border border-border prose prose-invert prose-sm max-w-none">
                  {newPost ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {replaceMentionTokens(newPost)}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-muted-foreground">Nothing to preview</p>
                  )}
                </div>
              )}
              <Button type="submit" disabled={!newPost.trim() || submitting}>
                {submitting ? t("community.thread_form.posting", "Posting...") : t("community.thread_form.post_reply", "Post Reply")}
              </Button>
            </form>
          </div>
        ) : thread.is_locked ? (
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">This thread is locked. No new replies can be posted.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <p className="text-muted-foreground mb-4">Sign in to post a reply</p>
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
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
