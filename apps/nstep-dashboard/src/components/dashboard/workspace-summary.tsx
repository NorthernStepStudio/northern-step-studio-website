"use client";

import Link from "next/link";

import type { DashboardOverviewResponse } from "@/lib/dashboard/contracts";
import { formatCompactNumber, formatDateTime, productTitle } from "@/lib/dashboard/format";
import { productHref } from "@/lib/dashboard/nav";
import { DashboardStatusPill } from "./status-pill";

export function DashboardWorkspaceSummary({
  overview,
}: {
  readonly overview: DashboardOverviewResponse;
}) {
  return (
    <section className="nsos-shell-summary" aria-label="Live workspace summary">
      <div className="section-title">
        <div>
          <h2>Live workspace</h2>
          <p className="section-subtitle">Current queue, approvals, alerts, and product coverage.</p>
        </div>
        <DashboardStatusPill value="live" label={formatDateTime(overview.generatedAt)} />
      </div>

      <div className="nsos-shell-stat-grid">
        {overview.summaryCards.slice(0, 4).map((metric) => (
          <div className="nsos-shell-stat" key={metric.label}>
            <span className="nsos-shell-stat-label">{metric.label}</span>
            <strong className="nsos-shell-stat-value">{renderSummaryValue(metric.value)}</strong>
          </div>
        ))}
      </div>

      <div className="nsos-shell-status-list">
        <div className="nsos-shell-status-row">
          <span className="nsos-shell-status-label">Active jobs</span>
          <strong>{formatCompactNumber(overview.activity.summary.totalActiveJobs)}</strong>
        </div>
        <div className="nsos-shell-status-row">
          <span className="nsos-shell-status-label">Waiting approvals</span>
          <strong>{formatCompactNumber(overview.recentApprovals.length)}</strong>
        </div>
        <div className="nsos-shell-status-row">
          <span className="nsos-shell-status-label">Open alerts</span>
          <strong>{formatCompactNumber(overview.alerts.length)}</strong>
        </div>
        <div className="nsos-shell-status-row">
          <span className="nsos-shell-status-label">Memory entries</span>
          <strong>{formatCompactNumber(overview.memory.total)}</strong>
        </div>
      </div>

      <div className="nsos-shell-product-list">
        {overview.productCards.map((card) => (
          <Link className="nsos-shell-product-link" href={productHref(card.product)} key={card.product}>
            <div className="nsos-shell-product-head">
              <span className="nsos-shell-product-title">{card.title}</span>
              <DashboardStatusPill value={card.product} label={productTitle(card.product)} />
            </div>
            <p className="nsos-shell-product-copy">
              {formatCompactNumber(card.activeJobs)} active - {formatCompactNumber(card.waitingApprovals)} approvals -{" "}
              {formatCompactNumber(card.alerts)} alerts
            </p>
            {card.lastActivityAt ? <p className="nsos-shell-product-copy">Updated {formatDateTime(card.lastActivityAt)}</p> : null}
          </Link>
        ))}
      </div>

      <div className="nsos-shell-actions">
        <Link className="button button-secondary" href="/dashboard/approvals">
          Review approvals
        </Link>
        <Link className="button button-secondary" href="/dashboard/activity">
          Open activity
        </Link>
      </div>
    </section>
  );
}

function renderSummaryValue(value: string | number): string {
  if (typeof value === "number") {
    return formatCompactNumber(value);
  }
  return value;
}
