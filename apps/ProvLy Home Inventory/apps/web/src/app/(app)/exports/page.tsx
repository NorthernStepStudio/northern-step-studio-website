"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { formatDateTime } from "@/lib/appData";
import { useAppSnapshot } from "@/lib/useAppSnapshot";

const statusStyles: Record<string, string> = {
  completed:
    "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--accent)]",
  processing:
    "border-black/10 bg-[color:var(--chip)] text-[color:var(--muted)]",
  pending:
    "border-black/10 bg-[color:var(--chip)] text-[color:var(--muted)]",
  failed:
    "border-[color:var(--danger)]/20 bg-[color:var(--chip)] text-[color:var(--danger)]",
};

export default function ExportsPage() {
  const { t } = useTranslation();
  const { data, loading, error, reload } = useAppSnapshot();
  const [selectedHomeId, setSelectedHomeId] = useState<string | null>(null);
  const [workingFormat, setWorkingFormat] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedHomeId && data?.homes[0]?.id) {
      setSelectedHomeId(data.homes[0].id);
    }
  }, [data?.homes, selectedHomeId]);

  const activeHome = data?.homes.find((home) => home.id === selectedHomeId) ?? null;
  const exportJobs =
    data?.exportJobs.filter((job) => job.home_id === selectedHomeId) ?? [];

  async function handleGenerateExport() {
    if (!activeHome) {
      return;
    }

    setWorkingFormat("generate");
    setActionError(null);

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeId: activeHome.id }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to generate export");
      }

      await reload();
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to generate export",
      );
    } finally {
      setWorkingFormat(null);
    }
  }

  async function handleDownload(jobId: string, extension: ".pdf" | ".csv" | ".zip") {
    setWorkingFormat(`${jobId}:${extension}`);
    setActionError(null);

    try {
      const response = await fetch(`/api/export/${jobId}/download`);
      const payload = (await response.json().catch(() => null)) as
        | { error?: string; downloadLinks?: Array<{ name: string; url?: string }> }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load export links");
      }

      const link = payload?.downloadLinks?.find((entry) =>
        entry.name.toLowerCase().endsWith(extension),
      );

      if (!link?.url) {
        throw new Error(`No ${extension.toUpperCase()} file available for this export`);
      }

      window.open(link.url, "_blank", "noopener,noreferrer");
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to download export",
      );
    } finally {
      setWorkingFormat(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-6 shadow-sm">
        <p className="text-sm text-[color:var(--muted)]">Loading exports…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-[color:var(--danger)]/20 bg-[color:var(--card)] p-6 shadow-sm">
        <p className="text-sm font-semibold text-[color:var(--danger)]">Exports unavailable</p>
        <p className="mt-2 text-sm text-[color:var(--muted)]">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
          {t("exports.label")}
        </p>
        <h1 className="text-3xl font-semibold">{t("exports.title")}</h1>
        <p className="text-sm text-[color:var(--muted)]">{t("exports.subtitle")}</p>
      </header>

      {data && data.homes.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {data.homes.map((home) => {
            const active = home.id === selectedHomeId;

            return (
              <button
                key={home.id}
                className="rounded-full border px-3 py-1 text-xs font-semibold"
                onClick={() => setSelectedHomeId(home.id)}
                style={{
                  borderColor: active ? "var(--accent)" : "var(--card-border)",
                  backgroundColor: active ? "var(--accent-soft)" : "var(--chip)",
                  color: active ? "var(--accent)" : "var(--foreground)",
                }}
              >
                {home.name}
              </button>
            );
          })}
        </div>
      ) : null}

      <section className="rounded-3xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Claim pack</p>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Generate a fresh PDF and CSV export for {activeHome?.name || "your home"}.
            </p>
          </div>
          <button
            className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-xs font-semibold text-[color:var(--primary-foreground)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!activeHome || workingFormat === "generate"}
            onClick={handleGenerateExport}
          >
            {workingFormat === "generate" ? "Generating…" : "Generate"}
          </button>
        </div>
        {actionError ? (
          <p className="mt-3 text-xs text-[color:var(--danger)]">{actionError}</p>
        ) : null}
      </section>

      <section className="flex flex-col gap-4">
        {exportJobs.length === 0 ? (
          <div className="rounded-3xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-5 shadow-sm">
            <p className="text-sm text-[color:var(--muted)]">
              No exports generated for this home yet.
            </p>
          </div>
        ) : (
          exportJobs.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-3xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-5 shadow-sm md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-base font-semibold">
                  {item.format === "zip" ? "ZIP claim pack" : "Claim pack"}
                </p>
                <p className="text-sm text-[color:var(--muted)]">
                  {formatDateTime(item.created_at)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    statusStyles[item.status || "processing"] ??
                    "border-black/10 bg-[color:var(--chip)]"
                  }`}
                >
                  {item.status === "completed"
                    ? t("common.ready")
                    : item.status === "failed"
                      ? "Failed"
                      : t("common.processing")}
                </span>
                <div className="flex gap-2">
                  <button
                    className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={
                      item.status !== "completed" || workingFormat === `${item.id}:.pdf`
                    }
                    onClick={() => handleDownload(item.id, ".pdf")}
                  >
                    {workingFormat === `${item.id}:.pdf` ? "…" : "PDF"}
                  </button>
                  <button
                    className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={
                      item.status !== "completed" || workingFormat === `${item.id}:.csv`
                    }
                    onClick={() => handleDownload(item.id, ".csv")}
                  >
                    {workingFormat === `${item.id}:.csv` ? "…" : "CSV"}
                  </button>
                  {item.format === "zip" ? (
                    <button
                      className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-xs font-semibold text-[color:var(--primary-foreground)] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={
                        item.status !== "completed" ||
                        workingFormat === `${item.id}:.zip`
                      }
                      onClick={() => handleDownload(item.id, ".zip")}
                    >
                      {workingFormat === `${item.id}:.zip` ? "…" : "ZIP"}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
