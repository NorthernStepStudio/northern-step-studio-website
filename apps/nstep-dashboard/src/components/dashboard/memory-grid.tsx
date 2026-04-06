import type { DashboardMemoryAuditEntry, DashboardMemoryItem } from "@/lib/dashboard/contracts";
import { formatDateTime, formatRatio, formatStatusLabel, productTitle } from "@/lib/dashboard/format";
import { DashboardEmptyState } from "./empty-state";
import { DashboardStatusPill } from "./status-pill";

export function DashboardMemoryGrid({
  items,
  patterns,
  auditTrail,
}: {
  readonly items: readonly DashboardMemoryItem[];
  readonly patterns: readonly DashboardMemoryItem[];
  readonly auditTrail: readonly DashboardMemoryAuditEntry[];
}) {
  const hasItems = items.length > 0 || patterns.length > 0 || auditTrail.length > 0;
  if (!hasItems) {
    return <DashboardEmptyState title="No memory entries" message="Reusable patterns will show up after workflows complete." />;
  }

  return (
    <div className="nsos-stack">
      {items.length > 0 ? (
        <section className="panel panel-pad panel-strong">
          <div className="section-title">
            <div>
              <h2>Memory entries</h2>
              <p className="section-subtitle">{items.length} items</p>
            </div>
          </div>
          {renderLessonGroups(items)}
        </section>
      ) : null}

      {patterns.length > 0 ? (
        <section className="panel panel-pad panel-strong">
          <div className="section-title">
            <div>
              <h2>Patterns</h2>
              <p className="section-subtitle">{patterns.length} learned templates</p>
            </div>
          </div>
          <div className="summary-list">
            {patterns.map((pattern) => (
              <article className="summary-item" key={pattern.id}>
                <div className="summary-head">
                  <p className="summary-name">{pattern.key}</p>
                  <DashboardStatusPill value={pattern.editable ? "editable" : "locked"} />
                </div>
                <p className="summary-detail">{pattern.summary}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {auditTrail.length > 0 ? (
        <section className="panel panel-pad panel-strong">
          <div className="section-title">
            <div>
              <h2>Audit trail</h2>
              <p className="section-subtitle">{auditTrail.length} memory updates</p>
            </div>
          </div>
          <div className="table-wrap">
            <table className="table nsos-table">
              <thead>
                <tr>
                  <th>Updated</th>
                  <th>Product</th>
                  <th>Key</th>
                  <th>Actor</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody>
                {auditTrail.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatDateTime(entry.at)}</td>
                    <td>{productTitle(entry.product)}</td>
                    <td>{entry.key}</td>
                    <td>
                      <div className="nsos-table-link">
                        <span className="nsos-table-primary">{formatStatusLabel(entry.actorRole || "system")}</span>
                        <span className="nsos-table-secondary">{entry.actorId ? entry.actorId : "system"}</span>
                      </div>
                    </td>
                    <td>{entry.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function renderLessonGroups(items: readonly DashboardMemoryItem[]) {
  const groups = [
    {
      title: "Success",
      subtitle: "Patterns that worked and should be reused.",
      items: items.filter((item) => item.lesson?.outcome === "success"),
      tone: "success" as const,
    },
    {
      title: "Failure",
      subtitle: "Cases that failed or drifted and need caution.",
      items: items.filter((item) => item.lesson?.outcome === "failure"),
      tone: "danger" as const,
    },
    {
      title: "Fix",
      subtitle: "What resolved the issue or stabilized the run.",
      items: items.filter((item) => item.lesson?.outcome === "fix"),
      tone: "accent" as const,
    },
    {
      title: "Prevention",
      subtitle: "Rules that keep the same mistake from repeating.",
      items: items.filter((item) => item.lesson?.outcome === "prevention"),
      tone: "warning" as const,
    },
  ].filter((group) => group.items.length > 0);

  return (
    <div className="nsos-stack">
      {groups.map((group) => (
        <section className="panel panel-pad panel-soft" key={group.title}>
          <div className="section-title">
            <div>
              <h3>{group.title}</h3>
              <p className="section-subtitle">
                {group.items.length} lesson{group.items.length === 1 ? "" : "s"} - {group.subtitle}
              </p>
            </div>
            <DashboardStatusPill value={group.tone} label={group.title} />
          </div>
          <div className="summary-list">
            {group.items.map((item) => (
              <article className="summary-item" key={item.id}>
                <div className="summary-head">
                  <p className="summary-name">{item.key}</p>
                  <DashboardStatusPill value={item.tier} label={formatStatusLabel(item.tier)} />
                  <DashboardStatusPill value={item.category} label={item.category} />
                </div>
                <p className="summary-detail">
                  {productTitle(item.product)} - confidence {formatRatio(item.confidence)} - {item.summary}
                </p>
                {item.lesson ? (
                  <div className="memory-lesson">
                    <p className="summary-detail">
                      <strong>{formatStatusLabel(item.lesson.outcome)}.</strong>{" "}
                      {item.lesson.symptom ? `Symptom: ${item.lesson.symptom}` : ""}
                    </p>
                    {item.lesson.cause ? <p className="summary-detail">Cause: {item.lesson.cause}</p> : null}
                    {item.lesson.fix ? <p className="summary-detail">Fix: {item.lesson.fix}</p> : null}
                    {item.lesson.prevention ? <p className="summary-detail">Prevention: {item.lesson.prevention}</p> : null}
                    {item.lesson.reuseRule ? <p className="summary-detail">Reuse rule: {item.lesson.reuseRule}</p> : null}
                    {item.lesson.evidence ? <p className="summary-detail">Evidence: {item.lesson.evidence}</p> : null}
                  </div>
                ) : null}
                <p className="summary-detail">
                  Updated {formatDateTime(item.updatedAt)}
                  {item.sourceLabel ? ` - ${item.sourceLabel}` : ""}
                </p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
