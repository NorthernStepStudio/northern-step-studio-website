import { useState } from "react";
import { useApps } from "@/react-app/hooks/useApps";
import AppForm from "@/react-app/components/AppForm";
import { Edit2, Trash2, ExternalLink, Search, X } from "lucide-react";
import { Link } from "react-router";
import { getAppCategoryLabel } from "@/react-app/lib/appCategories";
import { getCatalogApp } from "@/react-app/data/appsCatalog";
import type { App } from "@/react-app/hooks/useApps";

export default function AppManager() {
  const { apps, isLoading, refetch, deleteApp } = useApps();
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState<App | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApps = apps.filter(app => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      app.name.toLowerCase().includes(query) ||
      app.slug.toLowerCase().includes(query) ||
      app.description?.toLowerCase().includes(query) ||
      app.category.toLowerCase().includes(query)
    );
  });

  const handleEdit = (app: App) => {
    setEditingApp(app);
    setShowForm(true);
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this app?")) return;

    try {
      await deleteApp(String(id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete app");
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingApp(undefined);
  };

  const handleSuccess = () => {
    refetch();
    handleCloseForm();
  };

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tighter mb-1 sm:mb-2">App Manager</h1>
          <p className="text-sm sm:text-base text-muted-foreground font-normal">
            Add, edit, and manage your products
          </p>
        </div>
        <button
          onClick={() => {
            setEditingApp(undefined);
            setShowForm(true);
          }}
          className="btn-pill-primary w-full sm:w-auto"
        >
          Add App
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search apps by name, slug, description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-10 py-3 bg-secondary border border-border rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="card-dark-wise text-center py-12">
          <p className="text-muted-foreground font-normal">Loading apps...</p>
        </div>
      ) : filteredApps.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {filteredApps.map((app) => {
            const displayLogo = app.logo || getCatalogApp(app.slug)?.logo || null;

            return (
              <div key={app.id} className="card-dark-wise">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full">
                    {displayLogo && (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl border border-border bg-gradient-to-br from-background to-secondary/80 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                          src={displayLogo}
                          alt={app.name}
                          className="w-full h-full object-contain p-2 sm:p-3"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-base sm:text-xl font-black uppercase tracking-tight">
                          {app.name}
                        </h3>
                        <span className="text-label text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full bg-secondary border border-border">
                          {getAppCategoryLabel(app.category)}
                        </span>
                        <span
                          className={`text-label text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full ${
                            app.status === "LIVE"
                              ? "bg-success/10 text-success border border-success/30"
                              : app.status === "COMING_SOON"
                              ? "bg-accent/10 text-accent border border-accent/30"
                              : "bg-muted/10 text-muted-foreground border border-border"
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground font-normal mb-2 line-clamp-2">
                        {app.description || "No description"}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground/60">
                        <span className="font-normal truncate">Slug: {app.slug}</span>
                        {app.cta_url && (
                          <a
                            href={app.cta_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-accent transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            CTA URL
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                    <Link
                      to={`/apps/${app.slug}`}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary hover:bg-accent/10 hover:text-accent transition-colors flex items-center justify-center"
                      title="View"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleEdit(app)}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary hover:bg-accent/10 hover:text-accent transition-colors flex items-center justify-center"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center justify-center"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-dark-wise text-center py-12">
          <p className="text-muted-foreground font-normal">
            {searchQuery 
              ? "No apps match your search." 
              : "No apps created yet. Click \"Add App\" to get started."}
          </p>
        </div>
      )}

      {showForm && (
        <AppForm
          app={editingApp}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
