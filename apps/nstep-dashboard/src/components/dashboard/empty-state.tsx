import type { ReactNode } from "react";

export function DashboardEmptyState({
  title,
  message,
  action,
}: {
  readonly title: string;
  readonly message: string;
  readonly action?: ReactNode;
}) {
  return (
    <div className="empty-state nsos-empty-state">
      <p className="summary-name">{title}</p>
      <p className="summary-detail">{message}</p>
      {action ? <div className="form-actions nsos-empty-action">{action}</div> : null}
    </div>
  );
}
