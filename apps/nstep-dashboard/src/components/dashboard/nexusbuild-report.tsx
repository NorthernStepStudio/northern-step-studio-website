import type { DashboardNexusBuildReport } from "@/lib/dashboard/contracts";
import { formatCurrency, formatDateTime, formatRatio } from "@/lib/dashboard/format";
import { DashboardEmptyState } from "./empty-state";
import { DashboardSection } from "./section";
import { DashboardStatusPill } from "./status-pill";

export function DashboardNexusBuildReportPanel({
  report,
}: {
  readonly report?: DashboardNexusBuildReport;
}) {
  if (!report) {
    return (
      <DashboardSection title="Latest report" subtitle="NexusBuild analysis output">
        <DashboardEmptyState
          title="No NexusBuild report yet"
          message="Run a build analysis to surface compatibility, warnings, comparisons, and live pricing."
        />
      </DashboardSection>
    );
  }

  return (
    <div className="nsos-stack">
      <DashboardSection
        title={report.title}
        subtitle={report.summary}
        actions={
          <>
            <DashboardStatusPill value={report.compatibility.status} />
            <DashboardStatusPill
              value={report.pricing.livePricingEnabled ? "live" : "offline"}
              label={report.pricing.livePricingEnabled ? "Live pricing" : "Offline pricing"}
            />
          </>
        }
      >
        <div className="metric-grid">
          <Metric
            label="Compatibility"
            value={report.compatibility.score}
            detail={report.compatibility.issues.length > 0 ? `${report.compatibility.issues.length} issue(s)` : "No blockers"}
          />
          <Metric
            label="Performance"
            value={report.performance.score}
            detail={report.performance.expectedOutcome}
          />
          <Metric
            label="Value"
            value={report.value.score}
            detail={report.value.valueNotes[0] || "Value is based on the current build mix."}
          />
          <Metric
            label="Price snapshots"
            value={report.pricing.snapshotCount}
            detail={report.pricing.livePricingEnabled ? "Live retailer sources enabled" : "No live pricing sources"}
          />
        </div>
      </DashboardSection>

      <div className="grid-two">
        <DashboardSection title="Warnings" subtitle="Issues that should be reviewed before checkout">
          {report.warnings.length > 0 ? (
            <div className="summary-list">
              {report.warnings.slice(0, 8).map((warning) => (
                <article className="summary-item" key={warning}>
                  <div className="summary-head">
                    <p className="summary-name">Warning</p>
                    <DashboardStatusPill value="warn" label="Warning" />
                  </div>
                  <p className="summary-detail">{warning}</p>
                </article>
              ))}
            </div>
          ) : (
            <DashboardEmptyState title="No warnings" message="The report did not surface any blockers or notable risks." />
          )}
        </DashboardSection>

        <DashboardSection title="Comparison matrix" subtitle="Builds ranked by score and recommendation fit">
          {report.comparison?.matrix.length ? (
            <div className="nsos-table-wrap">
              <table className="table nsos-table">
                <thead>
                  <tr>
                    <th>Build</th>
                    <th>Score</th>
                    <th>Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {report.comparison.matrix.map((row) => {
                    const isWinner = row.buildId === report.comparison?.winnerBuildId;
                    return (
                      <tr key={row.buildId}>
                        <td>
                          <div className="nsos-table-link">
                            <span className="nsos-table-primary">{row.buildId}</span>
                            {isWinner ? <span className="nsos-table-secondary">Winner</span> : null}
                          </div>
                        </td>
                        <td>
                          <DashboardStatusPill
                            value={isWinner ? "completed" : "info"}
                            label={formatRatio(row.score)}
                          />
                        </td>
                        <td>{row.summary}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <DashboardEmptyState title="No comparison data" message="Add saved builds or a comparison input to render the matrix." />
          )}
          {report.comparison?.notes.length ? (
            <div className="summary-list" style={{ marginTop: "14px" }}>
              {report.comparison.notes.map((note) => (
                <article className="summary-item" key={note}>
                  <p className="summary-detail">{note}</p>
                </article>
              ))}
            </div>
          ) : null}
        </DashboardSection>
      </div>

      <div className="grid-two">
        <DashboardSection title="Recommendation" subtitle="Purchase strategy and upgrade path">
          <div className="summary-list">
            <article className="summary-item">
              <div className="summary-head">
                <p className="summary-name">Purchase strategy</p>
                <DashboardStatusPill value="info" label="Strategy" />
              </div>
              <p className="summary-detail">{report.recommendation.purchaseStrategy}</p>
            </article>
            {report.recommendation.upgradePath.length > 0 ? (
              <article className="summary-item">
                <p className="summary-name">Upgrade path</p>
                <div className="summary-list">
                  {report.recommendation.upgradePath.slice(0, 6).map((step) => (
                    <p className="summary-detail" key={step}>
                      {step}
                    </p>
                  ))}
                </div>
              </article>
            ) : null}
            {report.recommendation.alternateParts.length > 0 ? (
              <article className="summary-item">
                <p className="summary-name">Alternate parts</p>
                <div className="summary-list">
                  {report.recommendation.alternateParts.slice(0, 6).map((part) => (
                    <p className="summary-detail" key={`${part.category}:${part.suggestion}`}>
                      {part.category}: {part.suggestion}
                    </p>
                  ))}
                </div>
              </article>
            ) : null}
            {report.recommendation.premiumGuidance.length > 0 ? (
              <article className="summary-item">
                <p className="summary-name">Premium guidance</p>
                <div className="summary-list">
                  {report.recommendation.premiumGuidance.slice(0, 6).map((note) => (
                    <p className="summary-detail" key={note}>
                      {note}
                    </p>
                  ))}
                </div>
              </article>
            ) : null}
          </div>
        </DashboardSection>

        <DashboardSection title="Live retailer pricing" subtitle="Current snapshots and extraction notes">
          {report.pricing.snapshots.length > 0 ? (
            <div className="summary-list">
              {report.pricing.snapshots.slice(0, 8).map((snapshot) => (
                <article className="summary-item" key={snapshot.snapshotId}>
                  <div className="summary-head">
                    <p className="summary-name">{snapshot.label || snapshot.source}</p>
                    {snapshot.price !== undefined ? (
                      <DashboardStatusPill value="info" label={formatCurrency(snapshot.price, snapshot.currency)} />
                    ) : (
                      <DashboardStatusPill value="warning" label="No price" />
                    )}
                  </div>
                  <p className="summary-detail">{snapshot.url}</p>
                  <p className="summary-detail">Captured {formatDateTime(snapshot.capturedAt)}</p>
                  {snapshot.metadata.retailer ? <p className="summary-detail">Retailer: {String(snapshot.metadata.retailer)}</p> : null}
                </article>
              ))}
            </div>
          ) : (
            <DashboardEmptyState title="No live pricing" message="Enable retailer sources to see snapshots here." />
          )}
          {report.pricing.notes.length > 0 ? (
            <div className="summary-list" style={{ marginTop: "14px" }}>
              {report.pricing.notes.slice(0, 6).map((note) => (
                <article className="summary-item" key={note}>
                  <p className="summary-detail">{note}</p>
                </article>
              ))}
            </div>
          ) : null}
        </DashboardSection>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  readonly label: string;
  readonly value: number | string;
  readonly detail?: string;
}) {
  return (
    <article className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {detail ? <div className="metric-note">{detail}</div> : null}
    </article>
  );
}
