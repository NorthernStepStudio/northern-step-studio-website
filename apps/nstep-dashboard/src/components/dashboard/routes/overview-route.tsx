import Link from "next/link";

import type { DashboardOverviewResponse } from "@/lib/dashboard/contracts";
import type { DashboardSession } from "@/lib/auth-types";
import { DashboardApprovalQueue } from "../approval-queue";
import { DashboardEmptyState } from "../empty-state";
import { DashboardJobTable } from "../job-table";
import { DashboardLogFeed } from "../log-feed";
import { DashboardMemoryGrid } from "../memory-grid";
import { DashboardMetricStrip } from "../metric-strip";
import { DashboardPageHeader } from "../page-header";
import { DashboardProductCardGrid } from "../product-card-grid";
import { DashboardSharedWorkflowCard } from "../shared-workflow-card";
import { DashboardSection } from "../section";
import { DashboardStatusPill } from "../status-pill";
import { formatDateTime, formatPercent } from "@/lib/dashboard/format";

export function DashboardOverviewRoute({
  overview,
  session,
}: {
  readonly overview: DashboardOverviewResponse;
  readonly session?: DashboardSession | null;
}) {
  return (
    <>
      <DashboardPageHeader
        eyebrow="NStepOS dashboard"
        title="Operational overview"
        subtitle="Monitor jobs, approvals, alerts, memory, and product coverage from one control surface."
        actions={
          <>
            <Link className="button button-secondary" href="/dashboard/jobs">
              Open jobs
            </Link>
            <Link className="button button-primary" href="/dashboard/activity">
              Open activity
            </Link>
            <Link className="button button-secondary" href="/dashboard/approvals">
              Review approvals
            </Link>
            <Link className="button button-secondary" href="/dashboard/memory">
              Inspect memory
            </Link>
          </>
        }
        meta={
          <>
            <DashboardStatusPill value="live" label={`Updated ${formatDateTime(overview.generatedAt)}`} />
            <DashboardStatusPill value="jobs" label={`${overview.recentJobs.length} visible jobs`} />
            <DashboardStatusPill value="memory" label={`${overview.memory.total} memory entries`} />
            {session ? <DashboardStatusPill value={session.role} label={session.displayName} /> : null}
          </>
        }
      />

      <DashboardMetricStrip metrics={overview.summaryCards} />

      <div className="nsos-layout-grid">
        <div className="nsos-stack">
          <DashboardSection title="Recent jobs" subtitle="Latest runs across all products">
            <DashboardJobTable items={overview.recentJobs.slice(0, 8)} />
          </DashboardSection>

          <DashboardSection title="Recent logs" subtitle="System, job, and step output">
            <DashboardLogFeed items={overview.recentLogs.slice(0, 10)} />
          </DashboardSection>

          <DashboardSection title="Workflow activity" subtitle="Current execution health and recent output">
            <DashboardMetricStrip
              metrics={[
                { label: "Active jobs", value: overview.activity.summary.totalActiveJobs, detail: "Jobs currently in flight.", tone: "accent" },
                { label: "Waiting approval", value: overview.activity.summary.waitingApproval, detail: "Jobs paused for review.", tone: "warning" },
                { label: "Failed", value: overview.activity.summary.failed, detail: "Jobs that need attention.", tone: "danger" },
                { label: "Completed 24h", value: overview.activity.summary.completed24h, detail: "Successful runs in the last day.", tone: "success" },
                { label: "Failed 24h", value: overview.activity.summary.failed24h, detail: "Failures in the last day.", tone: "danger" },
              ]}
            />
          </DashboardSection>

          <DashboardSharedWorkflowCard sharedWorkflow={overview.sharedWorkflow} />
        </div>

        <div className="nsos-stack">
          <DashboardSection
            title="Approvals"
            subtitle={`${overview.recentApprovals.length} queued review items`}
            actions={
              <Link className="button button-secondary" href="/dashboard/approvals">
                Open queue
              </Link>
            }
          >
            <DashboardApprovalQueue items={overview.recentApprovals.slice(0, 4)} />
          </DashboardSection>

          <DashboardSection title="Alerts" subtitle={`${overview.alerts.length} recent alerts`}>
            {overview.alerts.length > 0 ? (
              <div className="summary-list">
                {overview.alerts.slice(0, 6).map((alert) => (
                  <article className="summary-item" key={alert.id}>
                    <div className="summary-head">
                      <p className="summary-name">{alert.title}</p>
                      <DashboardStatusPill value={alert.level} />
                    </div>
                    <p className="summary-detail">{alert.message}</p>
                    <p className="summary-detail">
                      {alert.relatedProduct ? `${alert.relatedProduct} - ` : ""}
                      {formatDateTime(alert.createdAt)}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <DashboardEmptyState title="No alerts" message="Alerts will surface here when jobs require attention." />
            )}
          </DashboardSection>

          <DashboardSection title="Memory" subtitle={`${overview.memory.total} stored patterns and preferences`}>
            <DashboardMemoryGrid
              auditTrail={[]}
              items={overview.memory.recent.slice(0, 6)}
              patterns={overview.memory.recent.slice(0, 4)}
            />
            <p className="summary-detail" style={{ marginTop: 12 }}>
              {overview.memory.editable} editable entries -{" "}
              {formatPercent(overview.memory.total === 0 ? 0 : overview.memory.editable / overview.memory.total)} editable ratio
            </p>
          </DashboardSection>
        </div>
      </div>

      <DashboardSection title="Product coverage" subtitle="Per-product operational views and quick links">
        <DashboardProductCardGrid cards={overview.productCards} />
      </DashboardSection>
    </>
  );
}
