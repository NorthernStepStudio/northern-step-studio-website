import Link from "next/link";

import type { DashboardSettingsOrchestrationHistory } from "@/lib/dashboard/contracts";
import {
  formatDateTimeLong,
  formatDurationMs,
  formatNumber,
  formatStatusLabel,
  productTitle,
} from "@/lib/dashboard/format";
import { DashboardEmptyState } from "./empty-state";
import { DashboardMetricStrip } from "./metric-strip";
import { DashboardSection } from "./section";
import { DashboardStatusPill } from "./status-pill";

export function DashboardOrchestrationHistoryPanel({
  history,
}: {
  readonly history: DashboardSettingsOrchestrationHistory;
}) {
  const phaseEntries = Object.entries(history.summary.byPhase) as [keyof typeof history.summary.byPhase, number][];
  const agentEntries = Object.entries(history.summary.byAgent) as [keyof typeof history.summary.byAgent, number][];

  return (
    <DashboardSection
      title="Orchestration history"
      subtitle="Inspect agent selection, permission scope, and runtime phase by job."
    >
      <DashboardMetricStrip
        metrics={[
          {
            label: "Invocations",
            value: history.summary.total,
            detail: "Total agent selections logged.",
            tone: "accent",
          },
          {
            label: "Jobs covered",
            value: history.summary.uniqueJobs,
            detail: "Distinct jobs present in the history.",
            tone: "success",
          },
          {
            label: "Completed",
            value: history.summary.completed,
            detail: "Invocations that completed successfully.",
            tone: "success",
          },
          {
            label: "Failed",
            value: history.summary.failed,
            detail: "Invocations that threw or returned errors.",
            tone: "danger",
          },
          {
            label: "Approval gated",
            value: history.summary.approvalGated,
            detail: "Selections that require external-action approval.",
            tone: "warning",
          },
          {
            label: "External-capable",
            value: history.summary.externalCapable,
            detail: "Selections allowed to use external tools.",
            tone: "accent",
          },
        ]}
      />

      <div className="grid-two">
        <article className="panel panel-pad panel-strong">
          <div className="section-title">
            <div>
              <h3>Phase breakdown</h3>
              <p className="section-subtitle nsos-section-subtitle">How often each runtime phase selected an agent.</p>
            </div>
          </div>
          <div className="summary-list">
            {phaseEntries.map(([phase, count]) => (
              <div className="summary-item" key={phase}>
                <div className="summary-head">
                  <p className="summary-name">{formatStatusLabel(phase)}</p>
                  <span className="pill status-info">{formatNumber(count)}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel panel-pad panel-strong">
          <div className="section-title">
            <div>
              <h3>Agent breakdown</h3>
              <p className="section-subtitle nsos-section-subtitle">Which internal worker handled each phase.</p>
            </div>
          </div>
          <div className="summary-list">
            {agentEntries.map(([agentId, count]) => (
              <div className="summary-item" key={agentId}>
                <div className="summary-head">
                  <p className="summary-name">{formatStatusLabel(agentId)}</p>
                  <span className="pill status-info">{formatNumber(count)}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      {history.recent.length > 0 ? (
        <div className="table-wrap">
          <table className="table nsos-table">
            <thead>
              <tr>
                <th>Started</th>
                <th>Job</th>
                <th>Phase</th>
                <th>Agent</th>
                <th>Selection</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {history.recent.map((entry) => (
                <tr key={entry.invocationId}>
                  <td>{formatDateTimeLong(entry.startedAt)}</td>
                  <td>
                    {entry.jobId ? (
                      <Link className="nsos-table-link" href={`/dashboard/jobs/${encodeURIComponent(entry.jobId)}`}>
                        <span className="nsos-table-primary">{entry.jobId}</span>
                        <span className="nsos-table-secondary">
                          {entry.product ? productTitle(entry.product) : "No product"}
                          {entry.workflow ? ` - ${formatStatusLabel(entry.workflow)}` : ""}
                        </span>
                        <span className="nsos-table-secondary">Open job details</span>
                      </Link>
                    ) : (
                      <div className="summary-item">
                        <div className="summary-head">
                          <p className="summary-name">No job</p>
                          {entry.product ? <span className="pill status-info">{productTitle(entry.product)}</span> : null}
                        </div>
                        <p className="summary-detail">
                          {entry.workflow ? formatStatusLabel(entry.workflow) : "No workflow"}
                          {entry.stepType ? ` - ${formatStatusLabel(entry.stepType)}` : ""}
                        </p>
                        {entry.stepId ? <p className="summary-detail">{entry.stepId}</p> : null}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="summary-item">
                      <div className="summary-head">
                        <p className="summary-name">{formatStatusLabel(entry.phase)}</p>
                        <DashboardStatusPill value={entry.phase} />
                      </div>
                      <p className="summary-detail">{entry.selection.reason}</p>
                    </div>
                  </td>
                  <td>
                    <div className="summary-item">
                      <div className="summary-head">
                        <p className="summary-name">{entry.agentTitle}</p>
                        <DashboardStatusPill value={entry.agentId} />
                      </div>
                      <p className="summary-detail">
                        {formatStatusLabel(entry.selection.capability)} - {formatStatusLabel(entry.selection.permissionScope)}
                      </p>
                    </div>
                  </td>
                  <td>
                    <div className="pill-row">
                      <span className={`pill ${entry.selection.mayUseExternalTools ? "status-ok" : "status-info"}`}>
                        {entry.selection.mayUseExternalTools ? "External tools allowed" : "Internal only"}
                      </span>
                      <span className={`pill ${entry.selection.requiresApprovalForExternalActions ? "status-warn" : "status-ok"}`}>
                        {entry.selection.requiresApprovalForExternalActions ? "Approval required" : "No approval gate"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <DashboardStatusPill value={entry.status} />
                  </td>
                  <td>{formatDurationMs(entry.durationMs)}</td>
                  <td>
                    <div className="summary-item">
                      <p className="summary-detail">{entry.summary}</p>
                      {entry.error ? <p className="summary-detail">{entry.error}</p> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <DashboardEmptyState
          title="No orchestration history yet"
          message="Agent selection will appear here once jobs move through the runtime phases."
        />
      )}
    </DashboardSection>
  );
}
