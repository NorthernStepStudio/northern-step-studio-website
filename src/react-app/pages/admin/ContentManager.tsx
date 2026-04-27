import { useState, useEffect } from "react";
import { apiFetch } from "@/react-app/lib/api";
import { Plus, Edit2, Trash2, Eye, EyeOff, Globe, Calendar, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/react-app/components/ui/dialog";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string | null;
  language: string;
  is_published: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const emptyPost: Omit<BlogPost, "id" | "created_at" | "updated_at"> = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  cover_image: null,
  language: "en",
  is_published: 0,
  published_at: null,
};

export default function ContentManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState(emptyPost);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLang, setFilterLang] = useState<string>("all");

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await apiFetch("/api/blog/all");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  }

  function openNewPost() {
    setEditingPost(null);
    setFormData(emptyPost);
    setIsModalOpen(true);
  }

  function openEditPost(post: BlogPost) {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content || "",
      excerpt: post.excerpt || "",
      cover_image: post.cover_image,
      language: post.language || "en",
      is_published: post.is_published,
      published_at: post.published_at,
    });
    setIsModalOpen(true);
  }

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  function handleTitleChange(title: string) {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: editingPost ? prev.slug : generateSlug(title),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingPost ? `/api/blog/${editingPost.id}` : "/api/blog";
      const method = editingPost ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save post");

      await fetchPosts();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save post:", err);
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(post: BlogPost) {
    try {
      await apiFetch(`/api/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...post,
          is_published: post.is_published ? 0 : 1,
        }),
      });
      await fetchPosts();
    } catch (err) {
      console.error("Failed to toggle publish:", err);
    }
  }

  async function deletePost(id: number) {
    const shouldDelete =
      typeof window === "undefined" ? true : window.confirm("Are you sure you want to delete this post?");
    if (!shouldDelete) return;

    try {
      const res = await apiFetch(`/api/blog/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Failed to delete post");
      }

      setPosts((prev) => prev.filter((post) => post.id !== id));
      await fetchPosts();
    } catch (err) {
      console.error("Failed to delete post:", err);
      if (typeof window !== "undefined") {
        window.alert(err instanceof Error ? err.message : "Failed to delete post");
      }
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const languageLabels: Record<string, string> = {
    en: "English",
    es: "Español",
    it: "Italiano",
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang = filterLang === "all" || post.language === filterLang;
    return matchesSearch && matchesLang;
  });

  const stats = {
    total: posts.length,
    published: posts.filter((p) => p.is_published).length,
    drafts: posts.filter((p) => !p.is_published).length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-hero mb-2">Content Manager</h1>
          <p className="text-muted-foreground font-normal">
            Manage blog posts and announcements
          </p>
        </div>
        <button onClick={openNewPost} className="btn-pill-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card-dark-wise p-4 text-center">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Total</div>
        </div>
        <div className="card-dark-wise p-4 text-center">
          <div className="text-2xl font-bold text-green-500">{stats.published}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Published</div>
        </div>
        <div className="card-dark-wise p-4 text-center">
          <div className="text-2xl font-bold text-yellow-500">{stats.drafts}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Drafts</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>
        <select
          value={filterLang}
          onChange={(e) => setFilterLang(e.target.value)}
          className="px-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
        >
          <option value="all">All Languages</option>
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="it">Italiano</option>
        </select>
      </div>

      {/* Posts list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-dark-wise animate-pulse h-20" />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="card-dark-wise text-center py-12">
          <p className="text-muted-foreground font-normal">
            {posts.length === 0
              ? 'No blog posts yet. Click "New Post" to publish your first article.'
              : "No posts match your search."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="card-dark-wise p-4 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              {/* Post info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold truncate">{post.title}</h3>
                  {post.is_published ? (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded-full">
                      Published
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-xs rounded-full">
                      Draft
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {languageLabels[post.language] || post.language}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.is_published
                      ? `Published ${formatDate(post.published_at)}`
                      : `Created ${formatDate(post.created_at)}`}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePublish(post)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title={post.is_published ? "Unpublish" : "Publish"}
                >
                  {post.is_published ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-green-500" />
                  )}
                </button>
                <button
                  onClick={() => openEditPost(post)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => deletePost(post.id)}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit Post" : "New Post"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData((prev) => ({ ...prev, language: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="it">Italiano</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Cover Image URL</label>
                <input
                  type="url"
                  value={formData.cover_image || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, cover_image: e.target.value || null }))
                  }
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                rows={2}
                placeholder="A brief summary of the post..."
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Content (Markdown supported)
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                rows={12}
                placeholder="Write your post content here using Markdown..."
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Supports headings (#, ##, ###), bold (**text**), italic (*text*), links, lists, code blocks, and more.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!formData.is_published}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, is_published: e.target.checked ? 1 : 0 }))
                  }
                  className="w-4 h-4 rounded border-border bg-muted accent-accent"
                />
                <span className="text-sm">Publish immediately</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-pill-primary">
                {saving ? "Saving..." : editingPost ? "Update Post" : "Create Post"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


