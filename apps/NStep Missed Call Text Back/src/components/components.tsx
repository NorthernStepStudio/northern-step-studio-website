import type { ReactNode } from 'react';

import { formatDate } from '../helpers';
export { formatDate };
import type {
  ConnectionCheck,
  RevenueChecklistItem,
  RevenueTask,
  StatusTone,
  ValidationState,
} from '../types';

export function StatusBadge({
  tone,
  children,
}: {
  tone: StatusTone;
  children: ReactNode;
}) {
  return <span className={`status-badge status-badge-${tone}`}>{children}</span>;
}

export function StatusRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: StatusTone;
}) {
  return (
    <div className="status-row">
      <span>{label}</span>
      <strong className={`tone-${tone}`}>{value}</strong>
    </div>
  );
}

export function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

export function ChecklistCard({
  item,
}: {
  item: RevenueChecklistItem;
}) {
  const tone: StatusTone =
    item.status === 'complete' ? 'success' : item.severity === 'required' ? 'error' : 'warning';
  const label =
    item.status === 'complete' ? 'Ready' : item.severity === 'required' ? 'Required' : 'Recommended';

  return (
    <article className="check-card">
      <div className="check-top">
        <strong>{item.title}</strong>
        <StatusBadge tone={tone}>{label}</StatusBadge>
      </div>
      <p>{item.detail}</p>
    </article>
  );
}

export function TaskCard({
  task,
  actionLabel,
  onAction,
  actionDisabled = false,
}: {
  task: RevenueTask;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
}) {
  return (
    <div className="stack-item">
      <div className="stack-item-top">
        <strong>{task.title}</strong>
        <span>{task.status}</span>
      </div>
      <p>{task.detail}</p>
      <div className="stack-meta">
        <span>{task.severity}</span>
        <span>{formatDate(task.updatedAt)}</span>
      </div>
      {onAction && (
        <div className="button-row stack-item-actions">
          <button className="action-button action-button-quiet" type="button" disabled={actionDisabled} onClick={onAction}>
            {actionLabel || 'Run Action'}
          </button>
        </div>
      )}
    </div>
  );
}

export function toneFromValidation(status: ValidationState['status']): StatusTone {
  if (status === 'success') return 'success';
  if (status === 'error') return 'error';
  if (status === 'validating') return 'warning';
  return 'neutral';
}

export function toneFromConnection(check: ConnectionCheck): StatusTone {
  if (check.status === 'connected') return 'success';
  if (check.status === 'error') return 'error';
  return 'warning';
}
