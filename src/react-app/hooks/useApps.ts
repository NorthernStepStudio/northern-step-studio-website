import { useEffect, useState } from "react";
import type { AppData, ProgressItem } from "@/react-app/types/apps";

export type App = AppData;

type AppRecord = {
  id: number;
  uuid?: string | null;
  name: string;
  slug: string;
  tagline?: string | null;
  description?: string | null;
  full_description?: string | null;
  category?: string | null;
  status?: string | null;
  status_label?: string | null;
  target_date?: string | null;
  tech_stack?: unknown;
  progress?: unknown;
  logo?: string | null;
  screenshots?: unknown;
  cta_url?: string | null;
  video_url?: string | null;
  features?: unknown;
  platform?: string | null;
  visibility?: string | null;
  progress_percent?: number | null;
  monetization?: string | null;
};

function parseStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [];
  } catch {
    return [];
  }
}

function parseProgress(value: unknown) {
  const normalizeItem = (item: unknown): ProgressItem | null => {
    if (!item || typeof item !== "object") {
      return null;
    }

    const record = item as { text?: unknown; completed?: unknown };
    if (typeof record.text !== "string" || !record.text.trim()) {
      return null;
    }

    return {
      text: record.text.trim(),
      completed: Boolean(record.completed),
    };
  };

  if (Array.isArray(value)) {
    return value.map(normalizeItem).filter((item): item is ProgressItem => Boolean(item));
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.map(normalizeItem).filter((item): item is ProgressItem => Boolean(item))
      : [];
  } catch {
    return [];
  }
}

function normalizeStatus(status: string | null | undefined) {
  const value = (status || "").trim().toUpperCase().replace(/\s+/g, "_");
  if (!value) return "COMING_SOON";
  if (value === "COMING SOON") return "COMING_SOON";
  return value;
}

function defaultStatusLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeApp(record: AppRecord): App {
  const progress = parseProgress(record.progress);
  const storedProgressPercent =
    typeof record.progress_percent === "number" && Number.isFinite(record.progress_percent)
      ? Math.max(0, Math.min(100, record.progress_percent))
      : 0;
  const status = normalizeStatus(record.status);

  return {
    id: record.id,
    uuid: record.uuid || null,
    name: record.name,
    slug: record.slug,
    tagline: record.tagline?.trim() || "",
    description: record.description?.trim() || "",
    fullDescription: record.full_description?.trim() || "",
    category: (record.category || "TOOL").trim(),
    status,
    statusLabel: record.status_label?.trim() || defaultStatusLabel(status),
    targetDate: record.target_date || null,
    techStack: parseStringArray(record.tech_stack),
    progress,
    logo: record.logo || null,
    screenshots: parseStringArray(record.screenshots),
    cta_url: record.cta_url || null,
    video_url: record.video_url || null,
    features: parseStringArray(record.features),
    platform: (record.platform || "mobile").trim().toLowerCase(),
    visibility: (record.visibility || "draft").trim().toLowerCase(),
    progressPercent: storedProgressPercent,
    monetization: record.monetization?.trim() || "Free",
  };
}

function transformToDb(app: Partial<App>) {
  const status = normalizeStatus(app.status);
  return {
    uuid: app.uuid,
    name: app.name,
    slug: app.slug,
    tagline: app.tagline || null,
    description: app.description || "",
    full_description: app.fullDescription || null,
    category: app.category || "TOOL",
    status,
    status_label: app.statusLabel || defaultStatusLabel(status),
    target_date: app.targetDate || null,
    tech_stack: Array.isArray(app.techStack) ? app.techStack : [],
    progress: Array.isArray(app.progress) ? app.progress : [],
    logo: app.logo || null,
    screenshots: Array.isArray(app.screenshots) ? app.screenshots : [],
    cta_url: app.cta_url || null,
    video_url: app.video_url || null,
    features: Array.isArray(app.features) ? app.features : [],
    platform: app.platform || "mobile",
    visibility: app.visibility || "draft",
    progress_percent: typeof app.progressPercent === "number" ? app.progressPercent : 0,
    monetization: app.monetization || "Free",
  };
}

export function useApps() {
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/apps");
      if (!response.ok) {
        throw new Error("Failed to fetch apps");
      }

      const data = await response.json();
      const normalized = Array.isArray(data) ? data.map((record) => normalizeApp(record as AppRecord)) : [];
      setApps(normalized);
      setError(null);
    } catch (err) {
      setApps([]);
      setError(err instanceof Error ? err.message : "Failed to fetch apps");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refetch();
  }, []);

  const createApp = async (input: Partial<App>): Promise<{ id: number; uuid: string }> => {
    const response = await fetch("/api/apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transformToDb(input)),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error || "Failed to create app");
    }

    const result = await response.json();
    await refetch();
    return result;
  };

  const updateApp = async (id: string | number, patch: Partial<App>): Promise<void> => {
    const response = await fetch(`/api/apps/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transformToDb(patch)),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error || "Failed to update app");
    }

    await refetch();
  };

  const upsertApp = async (input: Partial<App> & { id?: string | number }): Promise<{ id: number; uuid?: string }> => {
    if (input.id) {
      await updateApp(input.id, input);
      return { id: Number(input.id) };
    }

    return createApp(input);
  };

  const deleteApp = async (id: string | number): Promise<void> => {
    const response = await fetch(`/api/apps/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error || "Failed to delete app");
    }

    await refetch();
  };

  return { apps, isLoading, error, refetch, createApp, updateApp, upsertApp, deleteApp };
}

export function useApp(slug: string) {
  const [app, setApp] = useState<App | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setApp(null);
      setIsLoading(false);
      return;
    }

    const fetchApp = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/apps/${slug}`);
        if (!response.ok) {
          throw new Error(response.status === 404 ? "App not found" : "Failed to fetch app");
        }

        const data = await response.json();
        setApp(normalizeApp(data as AppRecord));
        setError(null);
      } catch (err) {
        setApp(null);
        setError(err instanceof Error ? err.message : "Failed to fetch app");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchApp();
  }, [slug]);

  return { app, isLoading, error };
}
