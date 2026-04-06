import Link from "next/link";

import type { DashboardWorkflowActivityProductItem } from "@/lib/dashboard/contracts";
import { productHref } from "@/lib/dashboard/nav";
import { formatDateTime, formatPercent, productTitle } from "@/lib/dashboard/format";
import { DashboardJobTable } from "./job-table";
import { DashboardStatusPill } from "./status-pill";

export function DashboardActivityCard({ item }: { readonly item: DashboardWorkflowActivityProductItem }) {
  return (
    <article className="panel panel-pad panel-strong nsos-activity-card">
      <div className="section-title">
        <div>
          <h2>{item.title}</h2>
          <p className="section-subtitle">{productTitle(item.product)}</p>
        </div>
        <Link className="button button-secondary" href={productHref(item.product)}>
          Open panel
        </Link>
      </div>

      <div className="metric-grid">
        <Metric label="Active" value={item.activeJobs} tone="accent" />
        <Metric label="Running" value={item.runningJobs} tone="success" />
        <Metric label="Waiting" value={item.waitingApprovalJobs} tone="warning" />
        <Metric label="Failed" value={item.failedJobs} tone="danger" />
      </div>

      <div className="pill-row" style={{ marginTop: 12 }}>
        {Object.entries(item.laneBreakdown).map(([lane, count]) => (
          <span className="pill" key={lane}>
            {lane} - {count}
          </span>
        ))}
        {item.lastActivityAt ? <span className="pill status-info">Updated {formatDateTime(item.lastActivityAt)}</span> : null}
      </div>

      <div className="grid-two" style={{ marginTop: 14 }}>
        <section className="detail-block">
          <p className="detail-label">Recent jobs</p>
          <DashboardJobTable compact items={item.recentJobs.slice(0, 3)} />
        </section>
        <section className="detail-block">
          <p className="detail-label">Recurring jobs</p>
          {item.recurringJobs.length > 0 ? (
            <div className="summary-list">
              {item.recurringJobs.slice(0, 4).map((job) => (
                <div className="summary-item" key={`${job.jobId}:${job.stepId || "root"}`}>
                  <div className="summary-head">
                    <p className="summary-name">{job.title}</p>
                    <DashboardStatusPill value={job.status} />
                  </div>
                  <p className="summary-detail">
                    {job.workflow} - {job.source} - {formatDateTime(job.runAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No recurring jobs are scheduled for this product.</div>
          )}
        </section>
      </div>

      {item.alerts.length > 0 ? (
        <section className="detail-block" style={{ marginTop: 14 }}>
          <p className="detail-label">Alerts</p>
          <div className="summary-list">
            {item.alerts.slice(0, 4).map((alert) => (
              <div className="summary-item" key={alert.id}>
                <div className="summary-head">
                  <p className="summary-name">{alert.title}</p>
                  <DashboardStatusPill value={alert.level} />
                </div>
                <p className="summary-detail">{alert.message}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  readonly label: string;
  readonly value: number;
  readonly tone: "accent" | "success" | "warning" | "danger";
}) {
  return (
    <article className="metric-card">
      <div
        className={`metric-label ${
          tone === "accent" ? "status-info" : tone === "success" ? "status-ok" : tone === "warning" ? "status-warn" : "status-danger"
        }`}
      >
        {label}
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-note">{formatPercent(Math.min(value / 10, 1))} normalized load</div>
    </article>
  );
}
