import Link from "next/link";

import { DashboardEmptyState } from "@/components/dashboard/empty-state";
import {
  DashboardOverviewViewModel,
  formatOverviewSeverity,
  getApprovalConfidence,
  getSignalTone,
} from "@/lib/dashboard/view-models/overview-view-model";

function statusLabel(status: string): { label: string; className: string } {
  const normalized = status.toLowerCase();
  if (normalized === "online") {
    return { label: "Verified", className: "status-ok" };
  }
  if (normalized === "degraded") {
    return { label: "Warning", className: "status-warn" };
  }
  if (normalized === "offline") {
    return { label: "Blocked", className: "status-danger" };
  }
  return { label: "Unknown", className: "status-info" };
}

export function LockedExecutiveOverview({
  view,
}: {
  readonly view: DashboardOverviewViewModel;
}) {
  const pipelineRows = view.connectedApps.slice(0, 4);
  const queueRows = view.approvalQueue.slice(0, 3);
  const governanceRows = view.governanceMetrics.slice(0, 4);
  const signalRows = view.topSignals.slice(0, 3);
  const topQueueConfidence = queueRows[0] ? getApprovalConfidence(queueRows[0]) : "1.00";

  return (
    <div className="nsos-overview">
      <section className="nsos-exec-grid nsos-exec-grid-hero" aria-label="Executive hero">
        <article className={`panel panel-strong nsos-exec-health nsos-health-${view.health.tone}`}>
          <div className="nsos-exec-health-head">
            <div>
              <p className="nsos-exec-kicker">Studio health</p>
              <h2 className="nsos-exec-health-title">{view.health.label}</h2>
              <p className="nsos-exec-health-copy">{view.health.detail}</p>
            </div>
            <div className="nsos-exec-health-badge" aria-hidden>
              {view.health.glyph}
            </div>
          </div>

          <div className="nsos-exec-kpi-grid" role="list" aria-label="Operational metrics">
            {view.kpis.map((metric) => (
              <article className="nsos-exec-kpi-card" key={metric.label} role="listitem">
                <p className={`nsos-exec-kpi-value nsos-tone-${metric.tone}`}>{metric.value}</p>
                <p className="nsos-exec-kpi-label">{metric.label}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="panel panel-strong nsos-exec-matterhorn" aria-label="Matterhorn advisory">
          <div className="nsos-exec-matterhorn-head">
            <div>
              <h3 className="nsos-exec-matterhorn-title">Matterhorn</h3>
              <p className="nsos-exec-matterhorn-subtitle">Executive advisory intelligence</p>
            </div>
            <span className="pill status-warn">Advisory only</span>
          </div>

          <div className="nsos-exec-matterhorn-body">
            <p className="nsos-exec-matterhorn-callout">{view.matterhornCallout}</p>
            <ul className="nsos-exec-matterhorn-list">
              <li>{view.matterhornStats.waitingApproval} jobs waiting for approval</li>
              <li>{view.matterhornStats.failed} failed jobs need recovery</li>
              <li>{view.matterhornStats.alerts} active alerts in monitoring</li>
            </ul>
            <div className="nsos-exec-matterhorn-stats">
              <div>
                <p className="nsos-exec-small-label">Risk level</p>
                <p className={`nsos-exec-stat-value ${view.matterhornStats.riskLevel === "High" ? "nsos-tone-danger" : "nsos-tone-warning"}`}>
                  {view.matterhornStats.riskLevel}
                </p>
              </div>
              <div>
                <p className="nsos-exec-small-label">Confidence</p>
                <p className="nsos-exec-stat-value">{topQueueConfidence === "0.00" ? "1.00" : topQueueConfidence}</p>
              </div>
            </div>
          </div>

          <Link href="/dashboard/activity" className="button button-primary nsos-exec-fullwidth">
            Open Full Advisory Workspace
          </Link>
        </article>
      </section>

      <section className="nsos-exec-grid nsos-exec-grid-pipeline" aria-label="Operational pipeline and actions">
        <article className="panel nsos-exec-pipeline">
          <div className="nsos-exec-section-head">
            <div className="nsos-exec-section-head-stack">
              <h3 className="nsos-exec-section-title">Operational pipeline</h3>
              <p className="nsos-exec-section-subtitle">Build, verification, and deployment flow</p>
            </div>
            <Link href="/dashboard/activity" className="button button-secondary">
              View Full Pipeline
            </Link>
          </div>

          <div className="nsos-exec-pipeline-list">
            {pipelineRows.map((app) => {
              const state = statusLabel(app.status);
              return (
                <article className="nsos-exec-pipeline-row" key={app.id}>
                  <div>
                    <p className="nsos-exec-row-title">{app.displayName}</p>
                    <p className="nsos-exec-row-caption">Latest activity</p>
                  </div>
                  <p className="nsos-exec-row-stage">{app.type.toUpperCase()} lane</p>
                  <span className={`pill ${state.className}`}>{state.label}</span>
                  <Link className="button button-secondary nsos-exec-row-action" href={`/dashboard/apps/${app.id}`}>
                    Open
                  </Link>
                </article>
              );
            })}
          </div>
        </article>

        <article className="panel nsos-exec-queue">
          <div className="nsos-exec-section-head nsos-exec-section-head-stack">
            <h3 className="nsos-exec-section-title">Action queue</h3>
            <p className="nsos-exec-section-subtitle">Recommended manual actions</p>
          </div>

          {queueRows.length > 0 ? (
            <div className="nsos-exec-queue-list">
              {queueRows.map((item) => {
                const severity = formatOverviewSeverity(item.riskLevel);
                const severe = severity.includes("HIGH") || severity.includes("CRITICAL");
                return (
                  <article className="nsos-exec-queue-card" key={`${item.jobId}-${item.stepId}`}>
                    <div className={`nsos-exec-queue-bar ${severe ? "nsos-queue-danger" : "nsos-queue-warning"}`} />
                    <div className="nsos-exec-queue-body">
                      <div className="nsos-exec-queue-head">
                        <span className={`nsos-exec-severity ${severe ? "nsos-tone-danger" : "nsos-tone-warning"}`}>
                          {severity}
                        </span>
                        <span className="nsos-exec-queue-confidence">Confidence {getApprovalConfidence(item)}</span>
                      </div>
                      <p className="nsos-exec-queue-title">{item.stepTitle}</p>
                      <p className="nsos-exec-queue-copy">Impact: {item.reason}</p>
                      <p className="nsos-exec-queue-copy">Source: {item.preview.tool}</p>
                      <div className="nsos-exec-queue-actions">
                        <Link className="button button-primary" href="/dashboard/approvals">
                          Accept
                        </Link>
                        <Link className="button button-secondary" href="/dashboard/approvals">
                          Review
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <DashboardEmptyState title="No actions queued" message="Approvals and escalations will appear here when review is required." />
          )}
        </article>
      </section>

      <section className="nsos-exec-grid nsos-exec-grid-momentum" aria-label="Momentum and governance">
        <article className="panel nsos-exec-momentum">
          <div className="nsos-exec-section-head">
            <div className="nsos-exec-section-head-stack">
              <h3 className="nsos-exec-section-title">Operational momentum</h3>
              <p className="nsos-exec-section-subtitle">Build velocity and project activity</p>
            </div>
            <Link href="/dashboard/jobs" className="button button-secondary">
              View Jobs
            </Link>
          </div>
          <div className="nsos-exec-momentum-canvas">
            <div className="nsos-exec-momentum-strip">
              <div>
                <p className="nsos-exec-small-label">Completed 24h</p>
                <p className="nsos-exec-stat-value nsos-tone-ok">{view.kpis[3]?.value ?? "0"}</p>
              </div>
              <div>
                <p className="nsos-exec-small-label">Failed 24h</p>
                <p className="nsos-exec-stat-value nsos-tone-danger">{view.kpis[1]?.value ?? "0"}</p>
              </div>
              <div>
                <p className="nsos-exec-small-label">Active jobs</p>
                <p className="nsos-exec-stat-value">{view.kpis[0]?.value ?? "0"}</p>
              </div>
            </div>
          </div>
        </article>

        <div className="nsos-exec-side-stack">
          <article className="panel nsos-exec-governance">
            <div className="nsos-exec-section-head nsos-exec-section-head-stack">
              <h3 className="nsos-exec-section-title">Governance</h3>
            </div>
            <div className="nsos-exec-governance-list">
              {governanceRows.map((metric) => (
                <div className="nsos-exec-governance-row" key={metric.label}>
                  <span>{metric.label}</span>
                  <span
                    className={
                      metric.status === "fail"
                        ? "nsos-tone-danger"
                        : metric.status === "warn"
                          ? "nsos-tone-warning"
                          : "nsos-tone-ok"
                    }
                  >
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel nsos-exec-signals">
            <div className="nsos-exec-section-head nsos-exec-section-head-stack">
              <h3 className="nsos-exec-section-title">Recent signals</h3>
            </div>
            <div className="nsos-exec-signal-list">
              {signalRows.length > 0 ? (
                signalRows.map((signal) => {
                  const tone = getSignalTone(signal);
                  return (
                    <article className={`nsos-exec-signal nsos-signal-${tone}`} key={signal.id}>
                      <p className="nsos-exec-signal-title">{signal.message}</p>
                      <p className="nsos-exec-signal-time">{new Date(signal.createdAt).toLocaleString()}</p>
                    </article>
                  );
                })
              ) : (
                <DashboardEmptyState title="No recent signals" message="Signals from verification and runtime events will appear here." />
              )}
            </div>
          </article>
        </div>
      </section>

    </div>
  );
}
