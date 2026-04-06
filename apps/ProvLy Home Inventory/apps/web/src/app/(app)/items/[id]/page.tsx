"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";

import {
  formatCurrency,
  formatDate,
  getDocumentCount,
  isProofReady,
  ItemRecord,
  loadItemDetails,
  MaintenanceTaskRecord,
} from "@/lib/appData";

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

export default function ItemDetailsPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const itemId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [item, setItem] = useState<ItemRecord | null>(null);
  const [tasks, setTasks] = useState<MaintenanceTaskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const details = await loadItemDetails(itemId);
        if (!cancelled) {
          setItem(details.item);
          setTasks(details.tasks);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load item",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (itemId) {
      void load();
    }

    return () => {
      cancelled = true;
    };
  }, [itemId]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-6 shadow-sm">
        <p className="text-sm text-[color:var(--muted)]">Loading item…</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="rounded-3xl border border-[color:var(--danger)]/20 bg-[color:var(--card)] p-6 shadow-sm">
        <p className="text-sm font-semibold text-[color:var(--danger)]">Item unavailable</p>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          {error || "This item could not be found."}
        </p>
      </div>
    );
  }

  const documents = [
    { label: "item.documentLabels.receipts", count: getDocumentCount(item, "receipt") },
    { label: "item.documentLabels.warranty", count: getDocumentCount(item, "warranty") },
    { label: "item.documentLabels.manuals", count: getDocumentCount(item, "manual") },
    { label: "item.documentLabels.photos", count: getDocumentCount(item, "photo") },
  ];

  const checklist = [
    {
      label: t("item.checklist.serial"),
      ready: Boolean(item.serial_number || item.model),
    },
    {
      label: t("item.checklist.receipts"),
      ready: getDocumentCount(item, "receipt") > 0 || Number(item.purchase_price || 0) > 0,
    },
    {
      label: t("item.checklist.photos"),
      ready: getDocumentCount(item, "photo") > 0,
    },
    {
      label: t("item.checklist.export"),
      ready: isProofReady(item),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
          {t("item.label")}
        </p>
        <div className="rounded-3xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[160px_1fr]">
            <div className="flex h-36 w-full items-center justify-center rounded-2xl bg-[color:var(--chip)] text-sm text-[color:var(--muted)]">
              {getDocumentCount(item, "photo") > 0
                ? `${getDocumentCount(item, "photo")} photo files`
                : t("item.photo")}
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold">{item.name}</h1>
              <p className="text-sm text-[color:var(--muted)]">
                {(item.rooms?.name || "Unassigned room") +
                  (item.category ? ` - ${item.category}` : "")}
              </p>
              <span className="w-fit rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--accent)]">
                {isProofReady(item) ? t("item.proofReady") : "Proof in progress"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-5 shadow-sm">
          <h2 className="text-lg font-semibold">{t("item.details")}</h2>
          <div className="mt-4 grid gap-3 text-sm text-[color:var(--muted)]">
            <div className="flex items-center justify-between">
              <span>{t("item.brand")}</span>
              <span className="font-semibold text-[color:var(--foreground)]">
                {item.brand || "Not recorded"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t("item.model")}</span>
              <span className="font-semibold text-[color:var(--foreground)]">
                {item.model || "Not recorded"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t("item.serial")}</span>
              <span className="font-semibold text-[color:var(--foreground)]">
                {item.serial_number || "Not recorded"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t("item.value")}</span>
              <span className="font-semibold text-[color:var(--foreground)]">
                {formatCurrency(item.purchase_price)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Purchased</span>
              <span className="font-semibold text-[color:var(--foreground)]">
                {formatDate(item.purchase_date)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-5 shadow-sm">
          <h2 className="text-lg font-semibold">{t("item.documents")}</h2>
          <div className="mt-4 grid gap-3 text-sm">
            {documents.map((document) => (
              <div
                key={document.label}
                className="flex items-center justify-between rounded-2xl bg-[color:var(--chip)] px-4 py-2"
              >
                <span>{t(document.label)}</span>
                <span className="text-xs font-semibold text-[color:var(--muted)]">
                  {t("common.files", { count: document.count })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-5 shadow-sm">
          <h2 className="text-lg font-semibold">{t("item.maintenance")}</h2>
          <div className="mt-4 rounded-2xl bg-[color:var(--chip)] px-4 py-3 text-sm text-[color:var(--foreground)]">
            {tasks[0]?.due_date
              ? `Next due: ${formatDate(tasks[0].due_date)}`
              : "No maintenance tasks scheduled"}
          </div>
        </div>

        <div className="rounded-3xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-5 shadow-sm">
          <h2 className="text-lg font-semibold">
            {t("item.exportChecklist")}
          </h2>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            {checklist.map((check) => (
              <div key={check.label} className="flex items-center gap-3">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: check.ready
                      ? "var(--accent-soft)"
                      : "var(--chip)",
                    color: check.ready ? "var(--accent)" : "var(--muted)",
                  }}
                >
                  <CheckIcon />
                </span>
                <span>{check.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
