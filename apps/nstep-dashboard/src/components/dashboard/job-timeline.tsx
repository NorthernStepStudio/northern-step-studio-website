import type { DashboardStepTimelineItem } from "@/lib/dashboard/contracts";
import { formatDateTimeLong, formatStatusLabel } from "@/lib/dashboard/format";
import { DashboardStatusPill } from "./status-pill";

export function DashboardJobTimeline({ items }: { readonly items: readonly DashboardStepTimelineItem[] }) {
  if (items.length === 0) {
    return <div className="empty-state">The timeline will appear once steps are planned or executed.</div>;
  }

  return (
    <div className="step-list nsos-timeline">
      {items.map((step) => (
        <article className="step-item nsos-timeline-item" key={step.stepId}>
          <div className="step-item-top nsos-timeline-head">
            <div>
              <p className="step-title">{step.title}</p>
              <div className="step-meta nsos-timeline-meta">
                <span>{step.stepId}</span>
                <span>{step.type}</span>
                <span>{step.tool}</span>
                <span>deps: {step.dependsOn.length}</span>
                <span>attempts: {step.attempts}</span>
              </div>
            </div>
            <div className="stack-small" style={{ justifyItems: "end" }}>
              <DashboardStatusPill value={step.status} label={formatStatusLabel(step.status)} />
              {step.retry ? <DashboardStatusPill value={step.retry.retryable ? "retryable" : "final"} /> : null}
            </div>
          </div>
          <div className="nsos-timeline-body">
            <p className="summary-detail">{step.message || step.inputSummary}</p>
            {step.outputSummary ? <p className="summary-detail">{step.outputSummary}</p> : null}
            <div className="pill-row">
              <span className="pill">{step.approvalRequired ? "Approval required" : "Auto step"}</span>
              <span className="pill">{step.retryable ? "Retryable" : "Single pass"}</span>
              {step.startedAt ? <span className="pill">{formatDateTimeLong(step.startedAt)}</span> : null}
              {step.completedAt ? <span className="pill">{formatDateTimeLong(step.completedAt)}</span> : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
