import Link from "next/link";

import type { DashboardSharedWorkflowOverview } from "@/lib/dashboard/contracts";
import { formatDateTime } from "@/lib/dashboard/format";
import { DashboardEmptyState } from "./empty-state";
import { DashboardJobTable } from "./job-table";
import { DashboardMetricStrip } from "./metric-strip";
import { DashboardSection } from "./section";

export function DashboardSharedWorkflowCard({
  sharedWorkflow,
}: {
  readonly sharedWorkflow: DashboardSharedWorkflowOverview;
}) {
  return (
    <DashboardSection
      title="Shared workflow runs"
      subtitle="Adapter-driven runs that are separate from the product workflows"
      actions={
        <Link className="button button-secondary" href="/dashboard/jobs?workflow=shared">
          Open shared jobs
        </Link>
      }
    >
      <DashboardMetricStrip
        metrics={[
          { label: "Total runs", value: sharedWorkflow.summary.total, tone: "neutral" },
          { label: "Running", value: sharedWorkflow.summary.running, tone: "accent" },
          { label: "Waiting approval", value: sharedWorkflow.summary.waitingApproval, tone: "warning" },
          { label: "Completed", value: sharedWorkflow.summary.completed, tone: "success" },
          { label: "Failed", value: sharedWorkflow.summary.failed, tone: "danger" },
        ]}
      />

      {sharedWorkflow.summary.lastRunAt ? (
        <p className="summary-detail" style={{ marginTop: 12 }}>
          Last shared run {formatDateTime(sharedWorkflow.summary.lastRunAt)}
        </p>
      ) : (
        <p className="summary-detail" style={{ marginTop: 12 }}>
          No shared workflow runs have been recorded yet.
        </p>
      )}

      <div style={{ marginTop: 12 }}>
        {sharedWorkflow.recentRuns.length > 0 ? (
          <DashboardJobTable items={sharedWorkflow.recentRuns.slice(0, 4)} compact />
        ) : (
          <DashboardEmptyState
            title="No shared runs"
            message="Shared adapter-driven runs will appear here once the sample workflow or other shared jobs execute."
          />
        )}
      </div>
    </DashboardSection>
  );
}
