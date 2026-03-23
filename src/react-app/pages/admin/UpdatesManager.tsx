import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, Megaphone } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { useApps } from "@/react-app/hooks/useApps";

interface Update {
  id: number;
  app_id: number | null;
  app_uuid: string | null;
  app_name?: string;
  title: string;
  content: string;
  update_type: string;
  version: string | null;
  is_published: number;
  created_at: string;
}

export default function UpdatesManager() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { apps } = useApps();

  const [formData, setFormData] = useState({
    app_uuid: "",
    title: "",
    content: "",
    update_type: "announcement",
    version: "",
    is_published: true,
  });

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const res = await fetch("/api/app-updates");
      const data = await res.json();
      setUpdates(data);
    } catch (error) {
      console.error("Failed to fetch updates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const app = apps.find(a => a.uuid === formData.app_uuid);

    try {
      if (editingId) {
        await fetch(`/api/app-updates/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            app_id: app?.id || null,
            is_published: formData.is_published ? 1 : 0,
          }),
        });
      } else {
        await fetch("/api/app-updates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            app_id: app?.id || null,
            is_published: formData.is_published ? 1 : 0,
          }),
        });
      }

      fetchUpdates();
      resetForm();
    } catch (error) {
      console.error("Failed to save update:", error);
    }
  };

  const handleEdit = (update: Update) => {
    setEditingId(update.id);
    setFormData({
      app_uuid: update.app_uuid || "",
      title: update.title,
      content: update.content,
      update_type: update.update_type,
      version: update.version || "",
      is_published: update.is_published === 1,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this update?")) return;

    try {
      await fetch(`/api/app-updates/${id}`, { method: "DELETE" });
      fetchUpdates();
    } catch (error) {
      console.error("Failed to delete update:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      app_uuid: "",
      title: "",
      content: "",
      update_type: "announcement",
      version: "",
      is_published: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return <div className="p-8">Loading updates...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase">Updates Manager</h1>
          <p className="text-muted-foreground mt-2">Manage app news, progress reports, and announcements</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          {showForm ? "Cancel" : "New Update"}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card-dark-wise">
          <h2 className="text-xl font-black uppercase mb-4">
            {editingId ? "Edit Update" : "Create New Update"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">App (Optional)</label>
              <select
                value={formData.app_uuid}
                onChange={(e) => setFormData({ ...formData, app_uuid: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border"
              >
                <option value="">No App (General Update)</option>
                {apps.map((app) => (
                  <option key={app.id} value={app.uuid ?? ""}>
                    {app.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Content *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border min-h-[120px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Type</label>
                <select
                  value={formData.update_type}
                  onChange={(e) => setFormData({ ...formData, update_type: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-secondary border border-border"
                >
                  <option value="announcement">Announcement</option>
                  <option value="progress">Progress Update</option>
                  <option value="feature">New Feature</option>
                  <option value="release">Release</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Version (Optional)</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="e.g., 1.0.0"
                  className="w-full px-4 py-2 rounded-lg bg-secondary border border-border"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="is_published" className="text-sm font-bold">
                Publish immediately
              </label>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1">
                {editingId ? "Update" : "Create"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Updates List */}
      <div className="space-y-4">
        {updates.length === 0 ? (
          <div className="card-dark-wise text-center py-12">
            <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No updates yet. Create your first one!</p>
          </div>
        ) : (
          updates.map((update) => (
            <div key={update.id} className="card-dark-wise">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${
                      update.update_type === "release" ? "bg-success/10 text-success" :
                      update.update_type === "feature" ? "bg-accent/10 text-accent" :
                      update.update_type === "progress" ? "bg-blue-400/10 text-blue-400" :
                      "bg-amber-400/10 text-amber-400"
                    }`}>
                      {update.update_type}
                    </span>
                    {update.version && (
                      <span className="text-xs font-bold text-muted-foreground">
                        v{update.version}
                      </span>
                    )}
                    {update.is_published === 1 ? (
                      <span className="flex items-center gap-1 text-xs text-success">
                        <Eye className="w-3 h-3" />
                        Published
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <EyeOff className="w-3 h-3" />
                        Draft
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black">{update.title}</h3>
                  {update.app_name && (
                    <p className="text-sm text-muted-foreground">App: {update.app_name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(update)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(update.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <p className="text-muted-foreground text-sm mb-3 whitespace-pre-line line-clamp-3">
                {update.content}
              </p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {formatDate(update.created_at)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
