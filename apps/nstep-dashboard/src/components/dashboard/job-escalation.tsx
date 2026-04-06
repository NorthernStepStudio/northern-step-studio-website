import type { DashboardJobEscalation } from "@/lib/dashboard/contracts";
import { formatDateTimeLong, formatStatusLabel } from "@/lib/dashboard/format";
import { DashboardSection } from "./section";
import { DashboardStatusPill } from "./status-pill";

export function DashboardJobEscalationPanel({
  escalation,
}: {
  readonly escalation: DashboardJobEscalation;
}) {
  return (
    <DashboardSection
      title="Escalation"
      subtitle="Policy, verification, or retry escalation details"
      actions={
        <>
          <DashboardStatusPill value={escalation.severity} label={formatStatusLabel(escalation.severity)} />
          <DashboardStatusPill value={escalation.status} label={formatStatusLabel(escalation.status)} />
        </>
      }
    >
      <div className="summary-list">
        <SummaryRow label="Reason" value={escalation.reason} />
        <SummaryRow label="Source" value={formatStatusLabel(escalation.source)} />
        <SummaryRow label="Owner role" value={escalation.ownerRole ? formatStatusLabel(escalation.ownerRole) : "Unassigned"} />
        <SummaryRow label="Created" value={formatDateTimeLong(escalation.createdAt)} />
        <SummaryRow label="Updated" value={formatDateTimeLong(escalation.updatedAt)} />
      </div>

      {Object.keys(escalation.metadata).length > 0 ? <pre className="code-block" style={{ marginTop: 16 }}>{JSON.stringify(escalation.metadata, null, 2)}</pre> : null}
    </DashboardSection>
  );
}

function SummaryRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
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
