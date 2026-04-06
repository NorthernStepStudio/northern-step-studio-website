import type { DashboardJobScratchpadEntry } from "@/lib/dashboard/contracts";
import { formatDateTimeLong, formatStatusLabel, statusTone } from "@/lib/dashboard/format";
import { DashboardEmptyState } from "./empty-state";

export function DashboardJobScratchpad({
  items,
}: {
  readonly items: readonly DashboardJobScratchpadEntry[];
}) {
  if (items.length === 0) {
    return <DashboardEmptyState title="No scratchpad notes" message="The job has not written working notes yet." />;
  }

  return (
    <div className="summary-list">
      {items.map((item) => (
        <article className="summary-item" key={item.id}>
          <div className="summary-head">
            <p className="summary-name">{item.title}</p>
            <span className={`pill ${statusTone(item.phase)}`}>{formatStatusLabel(item.phase)}</span>
          </div>
          <p className="summary-detail">{item.note}</p>
          <p className="summary-detail">
            {formatDateTimeLong(item.at)}
            {item.stepId ? ` - Step ${item.stepId}` : ""}
            {item.actorRole ? ` - ${formatStatusLabel(item.actorRole)}` : ""}
          </p>
        </article>
      ))}
    </div>
  );
}
