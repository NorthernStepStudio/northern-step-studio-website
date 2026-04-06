import { formatStatusLabel, statusTone } from "@/lib/dashboard/format";

export function DashboardStatusPill({
  value,
  label,
}: {
  readonly value: string;
  readonly label?: string;
}) {
  return <span className={`pill ${statusTone(value)}`}>{label ?? formatStatusLabel(value)}</span>;
}
