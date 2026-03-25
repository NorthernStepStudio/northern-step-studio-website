import { useEffect, useState } from "react";
import { apiFetch } from "@/react-app/lib/api";
import { Plus, Edit2, Trash2, Megaphone, ExternalLink } from "lucide-react";
import { useApps } from "@/react-app/hooks/useApps";

interface Promotion {
  id: number;
  title: string;
  description: string | null;
  target_app: string | null;
  cta_url: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

const emptyForm = {
  title: "",
  description: "",
  target_app: "",
  cta_url: "",
  is_active: true,
};

export default function PromoManager() {
  const { apps } = useApps();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadPromotions = async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch("/api/promotions");
      const data = await res.json();
      setPromotions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load promotions:", err);
      setPromotions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPromotions();
  }, []);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingId(promotion.id);
    setFormData({
      title: promotion.title,
      description: promotion.description || "",
      target_app: promotion.target_app || "",
      cta_url: promotion.cta_url || "",
      is_active: promotion.is_active === 1,
    });
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        target_app: formData.target_app || null,
        cta_url: formData.cta_url.trim() || null,
        is_active: formData.is_active ? 1 : 0,
      };

      if (!payload.title) {
        throw new Error("Title is required");
      }

      const res = await fetch(editingId ? `/api/promotions/${editingId}` : "/api/promotions", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const responseError = await res.json().catch(() => null);
        throw new Error(responseError?.error || "Failed to save promotion");
      }

      await loadPromotions();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save promotion");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (promotion: Promotion) => {
    if (!confirm(`Delete promotion "${promotion.title}"?`)) return;

    try {
      const res = await apiFetch(`/api/promotions/${promotion.id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete promotion");
      }
      await loadPromotions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete promotion");
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-hero mb-2">Promo Manager</h1>
          <p className="text-muted-foreground font-normal">Create and manage cross-app promotions</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData(emptyForm);
            setShowForm((prev) => !prev);
            setError("");
          }}
          className="btn-pill-primary inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {showForm ? "Cancel" : "New Campaign"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-dark-wise space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase mb-2">Campaign Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:border-accent focus:outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase mb-2">Target App</label>
              <select
                value={formData.target_app}
                onChange={(e) => setFormData((prev) => ({ ...prev, target_app: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:border-accent focus:outline-none transition-colors"
              >
                <option value="">General campaign</option>
                {apps.map((app) => (
                  <option key={app.id} value={app.slug}>
                    {app.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-black uppercase mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:border-accent focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase mb-2">CTA URL</label>
              <input
                type="text"
                value={formData.cta_url}
                onChange={(e) => setFormData((prev) => ({ ...prev, cta_url: e.target.value }))}
                placeholder="https://... or /apps/slug"
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <label className="flex items-center gap-3 pt-8">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4 rounded border-border accent-accent"
              />
              <span className="text-sm font-medium">Active promotion</span>
            </label>
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-pill-primary">
              {saving ? "Saving..." : editingId ? "Update Campaign" : "Create Campaign"}
            </button>
            <button type="button" onClick={resetForm} className="btn-pill-ghost">
              Close
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="card-dark-wise text-center py-12">
          <p className="text-muted-foreground font-normal">Loading promotions...</p>
        </div>
      ) : promotions.length === 0 ? (
        <div className="card-dark-wise text-center py-12">
          <Megaphone className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground font-normal">
            No campaigns yet. Create the first one to drive cross-app engagement.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {promotions.map((promotion) => (
            <div key={promotion.id} className="card-dark-wise">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg font-black uppercase">{promotion.title}</h3>
                    <span
                      className={`text-[11px] px-2 py-1 rounded-full border ${
                        promotion.is_active === 1
                          ? "bg-success/10 text-success border-success/30"
                          : "bg-secondary text-muted-foreground border-border"
                      }`}
                    >
                      {promotion.is_active === 1 ? "Active" : "Inactive"}
                    </span>
                    {promotion.target_app && (
                      <span className="text-[11px] px-2 py-1 rounded-full border bg-accent/10 text-accent border-accent/30 uppercase">
                        {promotion.target_app}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{promotion.description || "No description"}</p>
                  {promotion.cta_url && (
                    <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-2">
                      <ExternalLink className="w-3 h-3" />
                      {promotion.cta_url}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(promotion)}
                    className="w-10 h-10 rounded-full bg-secondary hover:bg-accent/10 hover:text-accent transition-colors flex items-center justify-center"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(promotion)}
                    className="w-10 h-10 rounded-full bg-secondary hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


