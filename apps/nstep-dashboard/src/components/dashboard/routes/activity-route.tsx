import Link from "next/link";

import type { DashboardProvLyPanelResponse, DashboardWorkflowActivityResponse } from "@/lib/dashboard/contracts";
import { DashboardActivityCard } from "../activity-card";
import { DashboardEmptyState } from "../empty-state";
import { DashboardJobTable } from "../job-table";
import { DashboardMetricStrip } from "../metric-strip";
import { DashboardPageHeader } from "../page-header";
import { DashboardProvLyActivityPanel } from "../provly-activity-panel";
import { DashboardQueryToolbar } from "../query-toolbar";
import { DashboardSection } from "../section";
import { DashboardStatusPill } from "../status-pill";
import { formatDateTime } from "@/lib/dashboard/format";
import {
  countAppliedFilters,
  DASHBOARD_APPROVAL_STATUS_OPTIONS,
  DASHBOARD_LANE_OPTIONS,
  DASHBOARD_PRODUCT_OPTIONS,
  DASHBOARD_STATUS_OPTIONS,
  type DashboardFilterQuery,
} from "@/lib/dashboard/query";

export function DashboardActivityRoute({
  activity,
  provlyPanel,
  query,
}: {
  readonly activity: DashboardWorkflowActivityResponse;
  readonly provlyPanel?: DashboardProvLyPanelResponse;
  readonly query: DashboardFilterQuery;
}) {
  const provlyActivity = activity.products.find((item) => item.product === "provly");
  const shouldShowProvLyPanel = Boolean(provlyPanel && provlyActivity && (!query.product || query.product === "provly"));

  return (
    <>
      <DashboardPageHeader
        eyebrow="NStepOS activity"
        title="Workflow activity"
        subtitle="Inspect product-level execution lanes, recurring jobs, recent completions, and failure patterns."
        actions={
          <div className="form-actions">
            <Link className="button button-secondary" href="/dashboard">
              Back to overview
            </Link>
            <Link className="button button-secondary" href="/dashboard/jobs">
              Open jobs
            </Link>
          </div>
        }
        meta={
          <>
            <DashboardStatusPill value="filters" label={`${countAppliedFilters(query)} filters`} />
            <DashboardStatusPill value="running" label={`${activity.summary.totalActiveJobs} active jobs`} />
            <DashboardStatusPill value="waiting_approval" label={`${activity.summary.waitingApproval} waiting approval`} />
            <DashboardStatusPill value="failed" label={`${activity.summary.failed} failed`} />
          </>
        }
      />

      <DashboardMetricStrip
        metrics={[
          { label: "Active jobs", value: activity.summary.totalActiveJobs, detail: "Currently in flight.", tone: "accent" },
          { label: "Waiting approval", value: activity.summary.waitingApproval, detail: "Paused for review.", tone: "warning" },
          { label: "Failed", value: activity.summary.failed, detail: "Needs operator attention.", tone: "danger" },
          { label: "Completed 24h", value: activity.summary.completed24h, detail: "Successful runs in the last day.", tone: "success" },
          { label: "Failed 24h", value: activity.summary.failed24h, detail: "Failures in the last day.", tone: "danger" },
        ]}
      />

      <DashboardSection title="Filters" subtitle="Search and narrow activity by product, lane, and state">
        <DashboardQueryToolbar
          action="/dashboard/activity"
          clearHref="/dashboard/activity"
          note="Activity filters affect the visible product lanes and job history."
          search={{
            name: "search",
            label: "Search",
            placeholder: "Job title, workflow, step, or alert text",
            value: query.search,
          }}
          selects={[
            {
              name: "product",
              label: "Product",
              value: query.product,
              options: DASHBOARD_PRODUCT_OPTIONS,
            },
            {
              name: "lane",
              label: "Lane",
              value: query.lane,
              options: DASHBOARD_LANE_OPTIONS,
            },
            {
              name: "status",
              label: "Status",
              value: query.status,
              options: DASHBOARD_STATUS_OPTIONS,
            },
            {
              name: "approvalStatus",
              label: "Approval",
              value: query.approvalStatus,
              options: DASHBOARD_APPROVAL_STATUS_OPTIONS,
            },
          ]}
        />
      </DashboardSection>

      {shouldShowProvLyPanel && provlyActivity && provlyPanel ? (
        <DashboardProvLyActivityPanel activity={provlyActivity} panel={provlyPanel} />
      ) : null}

      <div className="nsos-activity-stack">
        {activity.products.length > 0 ? (
          activity.products.map((item) => <DashboardActivityCard key={item.product} item={item} />)
        ) : (
          <DashboardEmptyState title="No activity data" message="Product activity cards will appear as runs are recorded." />
        )}
      </div>

      <div className="grid-two">
        <DashboardSection title="Recent completed runs" subtitle="Newest successful workflows">
          {activity.recentCompletedRuns.length > 0 ? (
            <DashboardJobTable items={activity.recentCompletedRuns.slice(0, 8)} />
          ) : (
            <DashboardEmptyState title="No completed runs" message="Completed jobs will appear here." />
          )}
        </DashboardSection>

        <DashboardSection title="Recent failed runs" subtitle="Failures that need inspection">
          {activity.recentFailedRuns.length > 0 ? (
            <DashboardJobTable items={activity.recentFailedRuns.slice(0, 8)} />
          ) : (
            <DashboardEmptyState title="No failed runs" message="Failed jobs will appear here if execution breaks." />
          )}
        </DashboardSection>
      </div>

      <div className="grid-two">
        <DashboardSection title="Recurring jobs" subtitle="Scheduled or repeating job runs">
          {activity.recurringJobs.length > 0 ? (
            <div className="summary-list">
              {activity.recurringJobs.slice(0, 8).map((job) => (
                <article className="summary-item" key={`${job.jobId}:${job.stepId || "root"}`}>
                  <div className="summary-head">
                    <p className="summary-name">{job.title}</p>
                    <DashboardStatusPill value={job.status} />
                  </div>
                  <p className="summary-detail">
                    {job.product} - {job.workflow} - {job.source} - {formatDateTime(job.runAt)}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <DashboardEmptyState title="No recurring jobs" message="Recurring jobs will show up after the scheduler starts runs." />
          )}
        </DashboardSection>

        <DashboardSection title="Alerts" subtitle="System alerts tied to product activity">
          {activity.alerts.length > 0 ? (
            <div className="summary-list">
              {activity.alerts.slice(0, 8).map((alert) => (
                <article className="summary-item" key={alert.id}>
                  <div className="summary-head">
                    <p className="summary-name">{alert.title}</p>
                    <DashboardStatusPill value={alert.level} />
                  </div>
                  <p className="summary-detail">{alert.message}</p>
                </article>
              ))}
            </div>
          ) : (
            <DashboardEmptyState title="No alerts" message="Alerts will appear here if workflow health degrades." />
          )}
        </DashboardSection>
      </div>
    </>
  );
}
