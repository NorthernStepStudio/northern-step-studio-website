import type { DashboardProvLyReport } from "@/lib/dashboard/contracts";
import { formatCurrency, formatDateTime, formatRatio } from "@/lib/dashboard/format";
import { DashboardEmptyState } from "./empty-state";
import { DashboardSection } from "./section";
import { DashboardStatusPill } from "./status-pill";

type ProvLyExtractionSummary = {
  readonly candidateCount: number;
  readonly extractedItemCount: number;
  readonly extractedReceiptCount: number;
  readonly attachmentCount: number;
  readonly ocrStatus: "used" | "blocked" | "fallback" | "unavailable";
  readonly ocrProvider?: string;
  readonly usedOcr: boolean;
  readonly notes: readonly string[];
  readonly extractedAt: string;
};

export function DashboardProvLyReportPanel({
  report,
}: {
  readonly report?: DashboardProvLyReport;
}) {
  if (!report) {
    return (
      <DashboardSection title="Latest report" subtitle="ProvLy claim readiness output">
        <DashboardEmptyState
          title="No ProvLy report yet"
          message="Run an inventory review to surface completeness, claim export readiness, and documentation gaps."
        />
      </DashboardSection>
    );
  }

  const extraction = report.metadata.visualExtraction as ProvLyExtractionSummary | undefined;

  return (
    <div className="nsos-stack">
      <DashboardSection
        title={report.title}
        subtitle={report.summary}
        actions={
          <>
            <DashboardStatusPill value={report.completeness.status} />
            <DashboardStatusPill value={report.claimExport.status} label={report.claimExport.format} />
          </>
        }
      >
        <div className="metric-grid">
          <Metric
            label="Completeness"
            value={formatRatio(report.completeness.score)}
            detail={report.completeness.claimReady ? "Claim-ready" : `${report.completeness.missingFields.length} missing field(s)`}
          />
          <Metric label="Items" value={report.inventory.itemCount} detail={`${report.inventory.roomCount} room(s)`} />
          <Metric label="High-value" value={report.inventory.highValueItemCount} detail="Needs stronger documentation" />
          <Metric
            label="Attachments"
            value={report.inventory.attachmentCount}
            detail={report.inventory.receiptCount > 0 ? `${report.inventory.receiptCount} receipt(s)` : "No receipts yet"}
          />
        </div>
      </DashboardSection>

      {extraction ? (
        <DashboardSection title="Visual extraction" subtitle="Photo and receipt OCR intake">
          <div className="metric-grid">
            <Metric label="Candidates" value={extraction.candidateCount} detail={extraction.ocrProvider ? `Provider: ${extraction.ocrProvider}` : "No OCR provider"} />
            <Metric label="Item drafts" value={extraction.extractedItemCount} detail={extraction.usedOcr ? "Extracted from OCR" : "Heuristic only"} />
            <Metric label="Receipt drafts" value={extraction.extractedReceiptCount} detail={extraction.ocrStatus} />
            <Metric label="Attached" value={extraction.attachmentCount} detail={formatDateTime(extraction.extractedAt)} />
          </div>
          {extraction.notes.length > 0 ? (
            <div className="summary-list" style={{ marginTop: "16px" }}>
              {extraction.notes.slice(0, 4).map((note) => (
                <article className="summary-item" key={note}>
                  <p className="summary-detail">{note}</p>
                </article>
              ))}
            </div>
          ) : null}
        </DashboardSection>
      ) : null}

      <div className="grid-two">
        <DashboardSection title="Rooms" subtitle="Inventory grouped by room">
          {report.inventory.organizedByRoom.length > 0 ? (
            <div className="nsos-table-wrap">
              <table className="table nsos-table">
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Items</th>
                    <th>High-value</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {report.inventory.organizedByRoom.map((room) => (
                    <tr key={room.roomId}>
                      <td>{room.roomLabel}</td>
                      <td>{room.itemCount}</td>
                      <td>{room.highValueCount}</td>
                      <td>{room.estimatedValue !== undefined ? formatCurrency(room.estimatedValue) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <DashboardEmptyState title="No rooms" message="Room groupings will appear once inventory is organized." />
          )}
        </DashboardSection>

        <DashboardSection title="Categories" subtitle="Inventory grouped by category">
          {report.inventory.organizedByCategory.length > 0 ? (
            <div className="nsos-table-wrap">
              <table className="table nsos-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Items</th>
                    <th>High-value</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {report.inventory.organizedByCategory.map((category) => (
                    <tr key={category.categoryId}>
                      <td>{category.categoryLabel}</td>
                      <td>{category.itemCount}</td>
                      <td>{category.highValueCount}</td>
                      <td>{category.estimatedValue !== undefined ? formatCurrency(category.estimatedValue) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <DashboardEmptyState title="No categories" message="Category groupings will appear once inventory is organized." />
          )}
        </DashboardSection>
      </div>

      <div className="grid-two">
        <DashboardSection title="Completeness" subtitle="What still needs attention">
          {report.completeness.issues.length > 0 ? (
            <div className="summary-list">
              {report.completeness.issues.slice(0, 8).map((issue, index) => (
                <article className="summary-item" key={`${issue.itemId || "issue"}-${issue.field || index}-${issue.message}`}>
                  <div className="summary-head">
                    <p className="summary-name">{issue.message}</p>
                    <DashboardStatusPill value={issue.severity} label={issue.severity} />
                  </div>
                  {issue.resolution ? <p className="summary-detail">{issue.resolution}</p> : null}
                </article>
              ))}
            </div>
          ) : (
            <DashboardEmptyState title="No completeness issues" message="The latest review did not surface missing documentation." />
          )}
        </DashboardSection>

        <DashboardSection title="Claim export" subtitle="Packet status and missing documentation">
          <div className="summary-list">
            <SummaryRow label="Export status" value={report.claimExport.status} />
            <SummaryRow label="Format" value={report.claimExport.format} />
            <SummaryRow label="Missing fields" value={report.claimExport.missingFieldCount} />
            <SummaryRow label="High-value items" value={report.claimExport.highValueItemCount} />
          </div>
          {report.claimExport.sections.notes.length > 0 ? (
            <div className="summary-list" style={{ marginTop: "16px" }}>
              {report.claimExport.sections.notes.slice(0, 5).map((note) => (
                <article className="summary-item" key={note}>
                  <p className="summary-detail">{note}</p>
                </article>
              ))}
            </div>
          ) : null}
        </DashboardSection>
      </div>

      <div className="grid-two">
        <DashboardSection title="High-value items" subtitle="Items needing stronger evidence">
          {report.claimExport.sections.highValueItems.length > 0 ? (
            <div className="nsos-table-wrap">
              <table className="table nsos-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Room</th>
                    <th>Category</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {report.claimExport.sections.highValueItems.map((item) => (
                    <tr key={item.itemId}>
                      <td>
                        <div className="nsos-table-link">
                          <span className="nsos-table-primary">{item.name}</span>
                          <span className="nsos-table-secondary">{item.missingFields.length} missing</span>
                        </div>
                      </td>
                      <td>{item.roomLabel}</td>
                      <td>{item.categoryLabel}</td>
                      <td>{item.estimatedValue !== undefined ? formatCurrency(item.estimatedValue) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <DashboardEmptyState title="No high-value items" message="High-value documentation will appear here when inventory demands it." />
          )}
        </DashboardSection>

        <DashboardSection title="Warnings and reminders" subtitle="Operational follow-up">
          <div className="summary-list">
            {report.warnings.length > 0 ? (
              report.warnings.slice(0, 6).map((warning) => (
                <article className="summary-item" key={warning}>
                  <div className="summary-head">
                    <p className="summary-name">Warning</p>
                    <DashboardStatusPill value="warning" />
                  </div>
                  <p className="summary-detail">{warning}</p>
                </article>
              ))
            ) : (
              <DashboardEmptyState title="No warnings" message="The report did not surface any blockers." />
            )}
          </div>
          {report.reminders.length > 0 ? (
            <div className="summary-list" style={{ marginTop: "16px" }}>
              {report.reminders.slice(0, 6).map((reminder) => (
                <article className="summary-item" key={reminder}>
                  <p className="summary-detail">{reminder}</p>
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
