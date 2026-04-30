import { useEffect, useState } from "react";
import { apiFetch } from "@/react-app/lib/api";
import { X, Upload, Image, Plus, Trash2, Check } from "lucide-react";
import { useApps, type App } from "@/react-app/hooks/useApps";
import type { ProgressItem } from "@/react-app/types/apps";
import { APP_CATEGORY_OPTIONS } from "@/react-app/lib/appCategories";

interface AppFormProps {
  app?: App;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS = ["COMING_SOON", "ALPHA", "PREVIEW", "LIVE", "ARCHIVED"] as const;
const VISIBILITY_OPTIONS = ["draft", "published", "hidden"] as const;
const PLATFORM_OPTIONS = ["mobile", "desktop", "web"] as const;
const MONETIZATION_OPTIONS = ["Free", "Subscription", "Tokens", "Affiliate", "Paid"] as const;

function makeEmptyProgressItem(): ProgressItem {
  return { text: "", completed: false };
}

export default function AppForm({ app, onClose, onSuccess }: AppFormProps) {
  const { upsertApp } = useApps();
  const [formData, setFormData] = useState({
    name: app?.name || "",
    slug: app?.slug || "",
    tagline: app?.tagline || "",
    description: app?.description || "",
    fullDescription: app?.fullDescription || "",
    category: app?.category || "TOOL",
    status: app?.status || "COMING_SOON",
    statusLabel: app?.statusLabel || "Coming Soon",
    targetDate: app?.targetDate || "",
    platform: app?.platform || "mobile",
    visibility: app?.visibility || "draft",
    monetization: app?.monetization || "Free",
    cta_url: app?.cta_url || "",
    video_url: app?.video_url || "",
    progressPercent: app?.progressPercent || 0,
    techStackInput: (app?.techStack || []).join(", "),
    featuresText: (app?.features || []).join("\n"),
  });
  const [progressItems, setProgressItems] = useState<ProgressItem[]>(
    app?.progress?.length ? app.progress : [makeEmptyProgressItem()],
  );
  const [existingScreenshots, setExistingScreenshots] = useState<string[]>(app?.screenshots || []);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(app?.logo || "");
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!app && formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.name, app]);

  const updateFormData = (patch: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Logo must be an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Logo must be smaller than 5MB");
      return;
    }

    setError("");
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (existingScreenshots.length + files.length > 10) {
      setError("Maximum 10 screenshots allowed");
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError("All screenshots must be image files");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Each screenshot must be smaller than 5MB");
        return;
      }
    }

    setError("");
    setScreenshotFiles(files);
    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          }),
      ),
    ).then(setScreenshotPreviews);
  };

  const updateProgressItem = (index: number, patch: Partial<ProgressItem>) => {
    setProgressItems((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  const removeProgressItem = (index: number) => {
    setProgressItems((prev) => {
      const next = prev.filter((_, itemIndex) => itemIndex !== index);
      return next.length ? next : [makeEmptyProgressItem()];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const name = formData.name.trim();
      const slug = formData.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      if (!name) throw new Error("Name is required.");
      if (!slug) throw new Error("Slug is required.");

      const progressPercent = Number(formData.progressPercent);
      if (Number.isNaN(progressPercent) || progressPercent < 0 || progressPercent > 100) {
        throw new Error("Progress must be between 0 and 100.");
      }

      const techStack = formData.techStackInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const features = formData.featuresText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
      const progress = progressItems
        .map((item) => ({ text: item.text.trim(), completed: Boolean(item.completed) }))
        .filter((item) => item.text.length > 0);

      const payload: Partial<App> & { id?: number } = {
        id: app?.id,
        uuid: app?.uuid || null,
        name,
        slug,
        tagline: formData.tagline.trim(),
        description: formData.description.trim(),
        fullDescription: formData.fullDescription.trim(),
        category: formData.category,
        status: formData.status,
        statusLabel: formData.statusLabel.trim() || formData.status.replace(/_/g, " "),
        targetDate: formData.targetDate.trim() || null,
        platform: formData.platform,
        visibility: formData.visibility,
        monetization: formData.monetization,
        cta_url: formData.cta_url.trim() || null,
        video_url: formData.video_url.trim() || null,
        progressPercent,
        techStack,
        features,
        progress,
        logo: app?.logo || null,
        screenshots: existingScreenshots,
      };

      setUploadProgress("Saving app...");
      const savedApp = await upsertApp(payload);
      const appId = savedApp.id || app?.id;

      if (logoFile && appId) {
        setUploadProgress("Uploading logo...");
        const logoFormData = new FormData();
        logoFormData.append("logo", logoFile);

        const logoResponse = await apiFetch(`/api/apps/${appId}/upload-logo`, {
          method: "POST",
          body: logoFormData,
        });

        if (!logoResponse.ok) {
          const logoError = await logoResponse.json().catch(() => null);
          throw new Error(logoError?.error || "Failed to upload logo");
        }
      }

      if (screenshotFiles.length > 0 && appId) {
        for (let index = 0; index < screenshotFiles.length; index += 1) {
          setUploadProgress(`Uploading screenshots (${index + 1}/${screenshotFiles.length})...`);
          const screenshotFormData = new FormData();
          screenshotFormData.append("screenshot", screenshotFiles[index]);

          const screenshotResponse = await apiFetch(`/api/apps/${appId}/upload-screenshot`, {
            method: "POST",
            body: screenshotFormData,
          });

          if (!screenshotResponse.ok) {
            const screenshotError = await screenshotResponse.json().catch(() => null);
            throw new Error(screenshotError?.error || `Failed to upload screenshot ${index + 1}`);
          }
        }
      }

      setUploadProgress("Saved");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save app");
    } finally {
      setIsSubmitting(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="card-dark-wise max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tighter">
            {app ? "Edit App" : "Add New App"}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center justify-center flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="px-4 py-3 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:border-accent focus:outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => updateFormData({ slug: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:border-accent focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-black uppercase mb-2">Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => updateFormData({ tagline: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:border-accent focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-black uppercase mb-2">Short Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:border-accent focus:outline-none transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-black uppercase mb-2">Full Description</label>
            <textarea
              value={formData.fullDescription}
              onChange={(e) => updateFormData({ fullDescription: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:border-accent focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => updateFormData({ category: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:border-accent focus:outline-none transition-colors"
              >
                {APP_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => updateFormData({ status: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:border-accent focus:outline-none transition-colors"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase mb-2">Visibility</label>
              <select
                value={formData.visibility}
                onChange={(e) => updateFormData({ visibility: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:border-accent focus:outline-none transition-colors"
              >
                {VISIBILITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase mb-2">Status Label</label>
              <input
                type="text"
                value={formData.statusLabel}
                onChange={(e) => updateFormData({ statusLabel: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase mb-2">Target Date</label>
              <input
                type="text"
                value={formData.targetDate}
                onChange={(e) => updateFormData({ targetDate: e.target.value })}
                placeholder="Q3 2026"
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:border-accent focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase mb-2">Platform</label>
              <select
                value={formData.platform}
                onChange={(e) => updateFormData({ platform: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:border-accent focus:outline-none transition-colors"
              >
                {PLATFORM_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase mb-2">Monetization</label>
              <select
                value={formData.monetization}
                onChange={(e) => updateFormData({ monetization: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:border-accent focus:outline-none transition-colors"
              >
                {MONETIZATION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase mb-2">
                Progress: {formData.progressPercent}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.progressPercent}
                onChange={(e) => updateFormData({ progressPercent: Number(e.target.value) })}
                className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-accent mt-3"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-black uppercase mb-2">Tech Stack</label>
            <input
              type="text"
              value={formData.techStackInput}
              onChange={(e) => updateFormData({ techStackInput: e.target.value })}
              placeholder="React Native, SQLite, RevenueCat"
              className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:border-accent focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-black uppercase mb-2">Features</label>
            <textarea
              value={formData.featuresText}
              onChange={(e) => updateFormData({ featuresText: e.target.value })}
              rows={4}
              placeholder="One feature per line"
              className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:border-accent focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs sm:text-sm font-black uppercase">Progress Checklist</label>
              <button
                type="button"
                onClick={() => setProgressItems((prev) => [...prev, makeEmptyProgressItem()])}
                className="inline-flex items-center gap-2 text-xs font-black uppercase text-accent"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
            </div>
            <div className="space-y-2">
              {progressItems.map((item, index) => (
                <div key={`${index}-${item.text}`} className="grid grid-cols-[auto,1fr,auto] gap-3 items-center">
                  <button
                    type="button"
                    onClick={() => updateProgressItem(index, { completed: !item.completed })}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                      item.completed ? "bg-accent/10 border-accent/40 text-accent" : "bg-secondary border-border text-muted-foreground"
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateProgressItem(index, { text: e.target.value })}
                    placeholder="Milestone"
                    className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:border-accent focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => removeProgressItem(index)}
                    className="w-10 h-10 rounded-xl bg-secondary hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase mb-2">CTA URL</label>
              <input
                type="text"
                value={formData.cta_url}
                onChange={(e) => updateFormData({ cta_url: e.target.value })}
                placeholder="https://... or /contact"
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase mb-2">Video URL</label>
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) => updateFormData({ video_url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:border-accent focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-black uppercase mb-2">Logo</label>
            <div className="flex items-start gap-4">
              {logoPreview && (
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-border bg-gradient-to-br from-background to-secondary/80 flex items-center justify-center flex-shrink-0">
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-3" />
                </div>
              )}
              <div className="flex-1">
                <label className="cursor-pointer flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Choose Logo Image</span>
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs sm:text-sm font-black uppercase">Screenshots</label>
            {existingScreenshots.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {existingScreenshots.map((screenshot) => (
                  <div key={screenshot} className="relative aspect-video rounded-xl overflow-hidden bg-secondary border border-border">
                    <img src={screenshot} alt="Screenshot" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setExistingScreenshots((prev) => prev.filter((item) => item !== screenshot))}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {screenshotPreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {screenshotPreviews.map((preview, index) => (
                  <div key={`${preview}-${index}`} className="aspect-video rounded-xl overflow-hidden bg-secondary border border-border">
                    <img src={preview} alt={`New screenshot ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
            <label className="cursor-pointer flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border transition-colors">
              <Image className="w-4 h-4" />
              <span className="text-sm">Choose Screenshot Images</span>
              <input type="file" accept="image/*" multiple onChange={handleScreenshotsChange} className="hidden" />
            </label>
          </div>

          {uploadProgress && (
            <div className="px-4 py-3 rounded-2xl bg-accent/10 border border-accent/30 text-accent text-sm">
              {uploadProgress}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-pill-primary flex-1">
              {isSubmitting ? uploadProgress || "Saving..." : app ? "Update App" : "Create App"}
            </button>
            <button type="button" onClick={onClose} disabled={isSubmitting} className="btn-pill-ghost flex-1">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


