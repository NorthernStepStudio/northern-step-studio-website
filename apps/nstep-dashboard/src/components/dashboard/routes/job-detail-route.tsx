import Link from "next/link";

import type { DashboardJobDetailResponse } from "@/lib/dashboard/contracts";
import { DashboardApprovalQueue } from "../approval-queue";
import { DashboardEmptyState } from "../empty-state";
import { DashboardJobEscalationPanel } from "../job-escalation";
import { DashboardJobScratchpad } from "../job-scratchpad";
import { DashboardJobWorldStatePanel } from "../job-world-state";
import { DashboardJobTimeline } from "../job-timeline";
import { DashboardLogFeed } from "../log-feed";
import { DashboardMemoryGrid } from "../memory-grid";
import { DashboardMetricStrip } from "../metric-strip";
import { DashboardPageHeader } from "../page-header";
import { DashboardProductPanel } from "../product-panel";
import { DashboardSection } from "../section";
import { DashboardStatusPill } from "../status-pill";
import { formatDateTimeLong, formatPercent, productTitle } from "@/lib/dashboard/format";

export function DashboardJobDetailRoute({
  job,
}: {
  readonly job: DashboardJobDetailResponse;
}) {
  const timelineMetrics = [
    { label: "Steps", value: job.job.stepCount, detail: "Total plan steps.", tone: "accent" as const },
    { label: "Completed", value: job.job.completedStepCount, detail: "Steps already finished.", tone: "success" as const },
    { label: "Waiting", value: job.job.waitingApprovalStepCount, detail: "Steps paused for review.", tone: "warning" as const },
    { label: "Failed", value: job.job.failedStepCount, detail: "Steps that failed.", tone: "danger" as const },
    { label: "Retries", value: job.job.retryableStepCount, detail: "Retryable steps.", tone: "accent" as const },
  ];

  return (
    <>
      <DashboardPageHeader
        eyebrow={`Job ${job.job.jobId}`}
        title={job.job.goal}
        subtitle={`${productTitle(job.job.product)} - ${job.job.workflow} - ${job.job.lane} lane`}
        actions={<Link className="button button-secondary" href="/dashboard">Back to overview</Link>}
        meta={
          <>
            <DashboardStatusPill value={job.job.approvalStatus} />
            <DashboardStatusPill value={job.job.riskLevel} />
            <DashboardStatusPill value={job.job.priority} />
            {job.job.escalation ? <DashboardStatusPill value={job.job.escalation.status} label={`Escalation ${job.job.escalation.status}`} /> : null}
            {job.job.escalation ? <DashboardStatusPill value={job.job.escalation.severity} label={job.job.escalation.severity} /> : null}
          </>
        }
      />

      <DashboardMetricStrip metrics={timelineMetrics} />

      <div className="nsos-layout-grid">
        <div className="nsos-stack">
          <DashboardSection title="Scratchpad" subtitle={`${job.job.scratchpad.length} working notes`}>
            <DashboardJobScratchpad items={job.job.scratchpad} />
          </DashboardSection>

          <DashboardJobWorldStatePanel worldState={job.job.worldState} />

          <DashboardSection title="Execution timeline" subtitle={`${job.timeline.length} step records`}>
            <DashboardJobTimeline items={job.timeline} />
          </DashboardSection>

          <DashboardSection title="Execution logs" subtitle={`${job.logs.length} log entries`}>
            <DashboardLogFeed items={job.logs} />
          </DashboardSection>
        </div>

        <div className="nsos-stack">
          <DashboardSection title="Job summary" subtitle="Route, plan, and status metadata">
            <div className="summary-list">
              <SummaryRow label="Workflow" value={job.job.workflow} />
              <SummaryRow label="Lane" value={job.job.lane} />
              <SummaryRow label="Created" value={formatDateTimeLong(job.job.createdAt)} />
              <SummaryRow label="Updated" value={formatDateTimeLong(job.job.updatedAt)} />
              <SummaryRow label="Logs" value={job.job.logCount} />
              <SummaryRow label="Memory updates" value={job.job.memoryUpdateCount} />
            </div>
          </DashboardSection>

          {job.job.escalation ? <DashboardJobEscalationPanel escalation={job.job.escalation} /> : null}

          <DashboardSection title="Approvals" subtitle="Steps that still need operator review">
            {job.approvals.length > 0 ? (
              <DashboardApprovalQueue items={job.approvals} />
            ) : (
              <DashboardEmptyState title="No pending approvals" message="This job is not blocked on operator review." />
            )}
          </DashboardSection>

          <DashboardSection title="Memory updates" subtitle="Patterns written by this job">
            <DashboardMemoryGrid auditTrail={[]} items={job.memoryUpdates} patterns={job.memoryUpdates} />
          </DashboardSection>
        </div>
      </div>

      {job.productPanel ? (
        <DashboardSection title="Product panel" subtitle="Product-specific context from the same job">
          <DashboardProductPanel panel={job.productPanel} />
        </DashboardSection>
      ) : null}

      {job.job.result ? (
        <DashboardSection title="Result" subtitle="Final outcome and structured data">
          <div className="summary-list">
            <div className="summary-item">
              <div className="summary-head">
                <p className="summary-name">{job.job.result.summary}</p>
                <DashboardStatusPill value={job.job.result.status} />
              </div>
              <p className="summary-detail">
                {formatPercent(job.job.result.actionsTaken.length / Math.max(job.job.stepCount, 1))} action coverage
              </p>
            </div>
            <pre className="code-block">{JSON.stringify(job.job.result.data, null, 2)}</pre>
          </div>
        </DashboardSection>
      ) : null}
    </>
  );
}

function SummaryRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: number | string;
}) {
  return (
    <div className="summary-item">
      <div className="summary-head">
        <p className="summary-name">{label}</p>
        <span className="pill status-info">{value}</span>
      </div>
    </div>
  );
}
