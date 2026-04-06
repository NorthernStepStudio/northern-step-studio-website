"use client";

import { useTranslation } from "react-i18next";

export default function ScanPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
          {t("scan.label")}
        </p>
        <h1 className="text-3xl font-semibold">{t("scan.title")}</h1>
        <p className="text-sm text-[color:var(--muted)]">
          {t("scan.subtitle")}
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <button className="flex h-44 flex-col items-start justify-between rounded-3xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-6 text-left shadow-sm">
          <span className="rounded-full bg-[color:var(--chip)] px-3 py-1 text-xs font-semibold text-[color:var(--foreground)]">
            {t("scan.receipt")}
          </span>
          <p className="text-lg font-semibold">{t("scan.receiptHint")}</p>
        </button>
        <button className="flex h-44 flex-col items-start justify-between rounded-3xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-6 text-left shadow-sm">
          <span className="rounded-full bg-[color:var(--chip)] px-3 py-1 text-xs font-semibold text-[color:var(--foreground)]">
            {t("scan.labelScan")}
          </span>
          <p className="text-lg font-semibold">{t("scan.labelHint")}</p>
        </button>
      </section>
    </div>
  );
}
