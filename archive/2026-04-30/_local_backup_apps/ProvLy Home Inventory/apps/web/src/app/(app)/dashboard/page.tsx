"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import {
  formatDateTime,
  getDocumentCount,
  isProofReady,
} from "@/lib/appData";
import { useAppSnapshot } from "@/lib/useAppSnapshot";

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m5 10 3 3 7-7" />
    </svg>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, loading, error, reload } = useAppSnapshot();
  const [selectedHomeId, setSelectedHomeId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedHomeId && data?.homes[0]?.id) {
      setSelectedHomeId(data.homes[0].id);
    }
  }, [data?.homes, selectedHomeId]);

  const activeHome = data?.homes.find((home) => home.id === selectedHomeId) ?? null;
  const scopedRooms = data?.rooms.filter((room) => room.home_id === selectedHomeId) ?? [];
  const scopedItems =
    data?.items.filter((item) => item.rooms?.home_id === selectedHomeId) ?? [];
  const receiptsCount = scopedItems.reduce(
    (sum, item) => sum + getDocumentCount(item, "receipt"),
    0,
  );
  const proofReadyCount = scopedItems.filter(isProofReady).length;
  const latestExport =
    data?.exportJobs.find((job) => job.home_id === selectedHomeId) ?? null;
  const claimPackReady = scopedItems.length > 0 && proofReadyCount === scopedItems.length;

  const stats = [
    {
      label: t("dashboard.items"),
      value: String(scopedItems.length),
      action: t("dashboard.addItem"),
      href: "/inventory",
    },
    {
      label: t("dashboard.receipts"),
      value: String(receiptsCount),
      action: t("dashboard.uploadProof"),
      href: "/inventory",
    },
    {
      label: t("dashboard.rooms"),
      value: String(scopedRooms.length),
      action: t("dashboard.manageRooms"),
      href: "/inventory",
    },
  ];

  const checklist = [
    {
      label: t("dashboard.checklist.rooms"),
      ready: scopedRooms.length > 0,
    },
    {
      label: t("dashboard.checklist.receipts"),
      ready: scopedItems.length > 0 && receiptsCount > 0,
    },
    {
      label: t("dashboard.checklist.highValue"),
      ready:
        scopedItems.filter((item) => Number(item.purchase_price || 0) >= 500).length === 0 ||
        scopedItems
          .filter((item) => Number(item.purchase_price || 0) >= 500)
          .every(isProofReady),
    },
    {
      label: t("dashboard.checklist.export"),
      ready: Boolean(latestExport),
    },
  ];

  async function handleGenerateExport() {
    if (!activeHome || exporting) {
      return;
    }

    setExporting(true);
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
        throw new Error(payload?.error || "Failed to create export");
      }

      await reload();
      router.push("/exports");
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to create export",
      );
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-6 shadow-sm">
        <p className="text-sm text-[color:var(--muted)]">Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-[color:var(--danger)]/20 bg-[color:var(--card)] p-6 shadow-sm">
        <p className="text-sm font-semibold text-[color:var(--danger)]">Dashboard unavailable</p>
        <p className="mt-2 text-sm text-[color:var(--muted)]">{error}</p>
      </div>
    );
  }

  if (!data || data.homes.length === 0) {
    return (
      <div className="rounded-3xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
          {t("dashboard.label")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[color:var(--foreground)]">
          {t("dashboard.title")}
        </h1>
        <p className="mt-3 text-sm text-[color:var(--muted)]">
          Your account is active, but there are no homes in cloud inventory yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
          {t("dashboard.label")}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-[color:var(--foreground)]">
            {t("dashboard.title")}
          </h1>
          <span className="rounded-full border border-[color:var(--accent)] bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--accent)]">
            {claimPackReady
              ? t("dashboard.statusReady")
              : t("dashboard.statusMissing")}
          </span>
        </div>
        <p className="text-sm text-[color:var(--muted)]">
          {t("dashboard.subtitle")}
        </p>
      </header>

      {data.homes.length > 1 ? (
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

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-3 rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-5 shadow-sm"
          >
            <div>
              <p className="text-sm text-[color:var(--muted)]">{stat.label}</p>
              <p className="text-3xl font-semibold">{stat.value}</p>
            </div>
            <Link
              href={stat.href}
              className="w-fit rounded-full border border-black/10 px-4 py-1.5 text-xs font-semibold text-[color:var(--foreground)]"
            >
              {stat.action}
            </Link>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4 rounded-3xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            {t("dashboard.generateTitle")}
          </h2>
          <p className="text-sm text-[color:var(--muted)]">
            {activeHome
              ? `${t("dashboard.generateSubtitle")} Active home: ${activeHome.name}.`
              : t("dashboard.generateSubtitle")}
          </p>
          <button
            className="w-full rounded-2xl bg-[color:var(--primary)] px-5 py-3 text-sm font-semibold text-[color:var(--primary-foreground)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!activeHome || exporting}
            onClick={handleGenerateExport}
          >
            {exporting ? "Generating…" : t("dashboard.generateButton")}
          </button>
          <div className="rounded-2xl bg-[color:var(--chip)] px-4 py-3 text-xs text-[color:var(--muted)]">
            {latestExport
              ? `Latest export: ${formatDateTime(latestExport.created_at)}`
              : "No claim pack generated yet."}
          </div>
          {actionError ? (
            <p className="text-xs text-[color:var(--danger)]">{actionError}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 rounded-3xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            {t("dashboard.checklistTitle")}
          </h2>
          <div className="flex flex-col gap-3 text-sm">
            {checklist.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: item.ready
                      ? "var(--accent-soft)"
                      : "var(--chip)",
                    color: item.ready ? "var(--accent)" : "var(--muted)",
                  }}
                >
                  <CheckIcon />
                </span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
