import Link from "next/link";

import type { DashboardJobListResponse } from "@/lib/dashboard/contracts";
import { formatStatusLabel, productTitle } from "@/lib/dashboard/format";
import {
  countAppliedFilters,
  DASHBOARD_APPROVAL_STATUS_OPTIONS,
  DASHBOARD_LANE_OPTIONS,
  DASHBOARD_PRODUCT_OPTIONS,
  DASHBOARD_SORT_DIRECTION_OPTIONS,
  DASHBOARD_SORT_OPTIONS,
  DASHBOARD_STATUS_OPTIONS,
  pageSizeOptions,
  type DashboardFilterQuery,
} from "@/lib/dashboard/query";
import type { ProductKey } from "@/lib/dashboard/contracts";
import { DashboardJobTable } from "../job-table";
import { DashboardMetricStrip } from "../metric-strip";
import { DashboardPageHeader } from "../page-header";
import { DashboardPagination } from "../pagination";
import { DashboardQueryToolbar } from "../query-toolbar";
import { DashboardSection } from "../section";
import { DashboardStatusPill } from "../status-pill";

export function DashboardJobsRoute({
  jobs,
  query,
}: {
  readonly jobs: DashboardJobListResponse;
  readonly query: DashboardFilterQuery;
}) {
  return (
    <>
      <DashboardPageHeader
        eyebrow="NStepOS jobs"
        title="Job list"
        subtitle="Search and filter the full workflow run history across products, statuses, and execution lanes."
        actions={
          <Link className="button button-secondary" href="/dashboard">
            Back to overview
          </Link>
        }
        meta={
          <>
            <DashboardStatusPill value="filters" label={`${countAppliedFilters(query)} filters`} />
            <DashboardStatusPill value="jobs" label={`${jobs.summary.total} total`} />
            <DashboardStatusPill value="waiting_approval" label={`${jobs.summary.waitingApproval} waiting`} />
          </>
        }
      />

      <DashboardMetricStrip
        metrics={[
          { label: "Total", value: jobs.summary.total, detail: "All visible job runs.", tone: "accent" },
          { label: "Running", value: jobs.summary.running, detail: "Jobs currently in progress.", tone: "warning" },
          { label: "Waiting approval", value: jobs.summary.waitingApproval, detail: "Jobs paused for review.", tone: "warning" },
          { label: "Completed", value: jobs.summary.completed, detail: "Finished successfully.", tone: "success" },
          { label: "Failed", value: jobs.summary.failed, detail: "Jobs needing attention.", tone: "danger" },
        ]}
      />

      <DashboardSection title="Filters" subtitle="Search the run history by product, status, lane, and approval state">
        <DashboardQueryToolbar
          action="/dashboard/jobs"
          clearHref="/dashboard/jobs"
          note="Filters update the list immediately on submit."
          search={{
            name: "search",
            label: "Search",
            placeholder: "Goal, workflow, job id, or step text",
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
            {
              name: "lane",
              label: "Lane",
              value: query.lane,
              options: DASHBOARD_LANE_OPTIONS,
            },
            {
              name: "sortBy",
              label: "Sort by",
              value: query.sortBy,
              options: DASHBOARD_SORT_OPTIONS,
            },
            {
              name: "sortDirection",
              label: "Sort direction",
              value: query.sortDirection,
              options: DASHBOARD_SORT_DIRECTION_OPTIONS,
            },
            {
              name: "pageSize",
              label: "Page size",
              value: query.pageSize ? String(query.pageSize) : undefined,
              options: pageSizeOptions(),
            },
          ]}
        />
      </DashboardSection>

      <div className="grid-two">
        <DashboardSection title="Job list" subtitle={`${jobs.items.length} results in the current slice`}>
          <DashboardJobTable items={jobs.items} />
          <DashboardPagination pageInfo={jobs.pageInfo} pathname="/dashboard/jobs" query={query} />
        </DashboardSection>

        <div className="nsos-stack">
          <DashboardSection title="Status by product" subtitle="Jobs visible in the current filter set">
            <div className="summary-list">
              {Object.entries(jobs.summary.byProduct).map(([product, count]) => (
                <div className="summary-item" key={product}>
                  <div className="summary-head">
                    <p className="summary-name">{productTitle(product as ProductKey)}</p>
                    <span className="pill status-info">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </DashboardSection>

          <DashboardSection title="Approval state" subtitle="How many jobs in each review state">
            <div className="summary-list">
              {Object.entries(jobs.summary.byApprovalStatus).map(([status, count]) => (
                <div className="summary-item" key={status}>
                  <div className="summary-head">
                    <p className="summary-name">{formatStatusLabel(status)}</p>
                    <span className="pill status-info">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </DashboardSection>
        </div>
      </div>
    </>
  );
}
