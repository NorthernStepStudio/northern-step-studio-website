import Link from "next/link";

import type { DashboardApprovalQueueResponse } from "@/lib/dashboard/contracts";
import { DashboardApprovalQueue } from "../approval-queue";
import { DashboardEmptyState } from "../empty-state";
import { DashboardMetricStrip } from "../metric-strip";
import { DashboardPageHeader } from "../page-header";
import { DashboardPagination } from "../pagination";
import { DashboardQueryToolbar } from "../query-toolbar";
import { DashboardSection } from "../section";
import { DashboardStatusPill } from "../status-pill";
import { formatDateTime } from "@/lib/dashboard/format";
import {
  countAppliedFilters,
  DASHBOARD_APPROVAL_STATUS_OPTIONS,
  DASHBOARD_LANE_OPTIONS,
  DASHBOARD_PRODUCT_OPTIONS,
  DASHBOARD_SORT_DIRECTION_OPTIONS,
  DASHBOARD_SORT_OPTIONS,
  type DashboardFilterQuery,
} from "@/lib/dashboard/query";

export function DashboardApprovalsRoute({
  approvals,
  query,
}: {
  readonly approvals: DashboardApprovalQueueResponse;
  readonly query: DashboardFilterQuery;
}) {
  return (
    <>
      <DashboardPageHeader
        eyebrow="NStepOS approvals"
        title="Approval queue"
        subtitle="Review steps that are risky, uncertain, or policy-gated before they execute."
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
            <DashboardStatusPill value="pending" label={`${approvals.summary.total} total`} />
            <DashboardStatusPill value="critical" label={`${approvals.summary.highRisk} high risk`} />
            <DashboardStatusPill value="warning" label={`${approvals.summary.mediumRisk} medium risk`} />
          </>
        }
      />

      <DashboardMetricStrip
        metrics={[
          { label: "Total", value: approvals.summary.total, detail: "Items waiting on review.", tone: "accent" },
          { label: "High risk", value: approvals.summary.highRisk, detail: "Requires operator judgment.", tone: "danger" },
          { label: "Medium risk", value: approvals.summary.mediumRisk, detail: "Needs a quick review.", tone: "warning" },
          { label: "Low risk", value: approvals.summary.lowRisk, detail: "Safe but visible.", tone: "success" },
        ]}
      />

      <DashboardSection title="Filters" subtitle="Search, narrow, and sort approval items">
        <DashboardQueryToolbar
          action="/dashboard/approvals"
          clearHref="/dashboard/approvals"
          note="Approval filters are applied directly in the URL."
          search={{
            name: "search",
            label: "Search",
            placeholder: "Step title, product, workflow, or reason",
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
              name: "workflow",
              label: "Workflow",
              value: query.workflow,
              options: [
                { value: "", label: "All workflows" },
                { value: "lead-recovery", label: "Lead recovery" },
                { value: "nexusbuild", label: "NexusBuild" },
                { value: "provly", label: "ProvLy" },
                { value: "neurormoves", label: "NeuroMoves" },
              ],
            },
            {
              name: "status",
              label: "Status",
              value: query.status,
              options: [
                { value: "", label: "All statuses" },
                { value: "pending", label: "Pending" },
                { value: "queued", label: "Queued" },
                { value: "routing", label: "Routing" },
                { value: "planning", label: "Planning" },
                { value: "waiting_approval", label: "Waiting approval" },
                { value: "running", label: "Running" },
                { value: "verifying", label: "Verifying" },
                { value: "failed", label: "Failed" },
                { value: "completed", label: "Completed" },
              ],
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
              options: [
                { value: "10", label: "10" },
                { value: "20", label: "20" },
                { value: "50", label: "50" },
                { value: "100", label: "100" },
              ],
            },
          ]}
        />
      </DashboardSection>

      <DashboardSection title="Queued approvals" subtitle="Approve, reject, or edit before execution">
        {approvals.items.length > 0 ? (
          <DashboardApprovalQueue items={approvals.items} />
        ) : (
          <DashboardEmptyState title="Approval queue is empty" message="Safe workflows are moving without operator review." />
        )}
        <DashboardPagination pageInfo={approvals.pageInfo} pathname="/dashboard/approvals" query={query} />
      </DashboardSection>

      <DashboardSection title="Queue summary" subtitle="Approval inventory by product and lane">
        <div className="summary-list">
          {Object.entries(approvals.summary.byProduct).map(([product, count]) => (
            <div className="summary-item" key={product}>
              <div className="summary-head">
                <p className="summary-name">{product}</p>
                <span className="pill status-info">{count}</span>
              </div>
            </div>
          ))}
          {Object.entries(approvals.summary.byLane).map(([lane, count]) => (
            <div className="summary-item" key={lane}>
              <div className="summary-head">
                <p className="summary-name">{lane}</p>
                <span className="pill status-info">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </DashboardSection>

      <DashboardSection title="Latest queue updates" subtitle="Most recent approval items by recency">
        {approvals.items.length > 0 ? (
          <div className="summary-list">
            {approvals.items.slice(0, 6).map((item) => (
              <article className="summary-item" key={item.jobId}>
                <div className="summary-head">
                  <p className="summary-name">{item.stepTitle}</p>
                  <DashboardStatusPill value={item.riskLevel} />
                </div>
                <p className="summary-detail">
                  {item.product} - {item.workflow} - updated {formatDateTime(item.updatedAt)}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <DashboardEmptyState title="No queue items" message="Approval updates will appear here as jobs enter review." />
        )}
      </DashboardSection>
    </>
  );
}
