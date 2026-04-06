import Link from "next/link";

import type { DashboardProductCard } from "@/lib/dashboard/contracts";
import { formatDateTime, formatRatio, toneClass } from "@/lib/dashboard/format";
import { productHref } from "@/lib/dashboard/nav";

export function DashboardProductCardGrid({ cards }: { readonly cards: readonly DashboardProductCard[] }) {
  if (cards.length === 0) {
    return <div className="empty-state">No product coverage data is available yet.</div>;
  }

  return (
    <div className="nsos-card-grid">
      {cards.map((card) => (
        <article className="panel panel-pad panel-strong nsos-product-card" key={card.product}>
          <div className="section-title">
            <div>
              <h2>{card.title}</h2>
              <p className="section-subtitle">{card.description}</p>
            </div>
            <Link className="button button-secondary" href={productHref(card.product)}>
              Open
            </Link>
          </div>

          <div className="metric-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
            <article className="metric-card">
              <div className="metric-label">{card.primaryMetric.label}</div>
              <div className="metric-value">{card.primaryMetric.value}</div>
              {card.primaryMetric.detail ? <div className="metric-note">{card.primaryMetric.detail}</div> : null}
            </article>
            <article className="metric-card">
              <div className="metric-label">Active jobs</div>
              <div className="metric-value">{card.activeJobs}</div>
              <div className="metric-note">{card.waitingApprovals} waiting approvals</div>
            </article>
          </div>

          <div className="summary-list" style={{ marginTop: 12 }}>
            {card.secondaryMetrics.map((metric) => (
              <div className="summary-item" key={`${card.product}-${metric.label}`}>
                <div className="summary-head">
                  <p className="summary-name">{metric.label}</p>
                  <span className={`pill ${toneClass(metric.tone) || "status-info"}`}>{metric.value}</span>
                </div>
                {metric.detail ? <p className="summary-detail">{metric.detail}</p> : null}
              </div>
            ))}
            {card.lastActivityAt ? (
              <div className="summary-item">
                <div className="summary-head">
                  <p className="summary-name">Last activity</p>
                  <span className="pill status-info">{formatDateTime(card.lastActivityAt)}</span>
                </div>
                <p className="summary-detail">{formatRatio(card.alerts / Math.max(card.activeJobs || 1, 1))} alert density</p>
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
