import type { RevenueWorkspace } from '../types';
import { MetricCard, StatusBadge, TaskCard, formatDate } from './components';

interface OperatingViewProps {
  workspace: RevenueWorkspace | null;
  missedCallActivities: RevenueWorkspace['activity'];
  starterFlowSteps: Array<{ key: string; title: string; detail: string }>;
  busy: boolean;
  onRunDueFollowups: () => void;
  onCompleteTask: (taskId: string, title: string) => void;
  onCompleteFollowup: (followupId: string, title: string) => void;
}

export function OperatingView({
  workspace,
  missedCallActivities,
  starterFlowSteps,
  busy,
  onRunDueFollowups,
  onCompleteTask,
  onCompleteFollowup,
}: OperatingViewProps) {
  function renderLeadMessagingStatus(lead: NonNullable<RevenueWorkspace>['leads'][number]) {
    const status = lead.messaging?.consentStatus || 'unknown';
    const outboundStatus = lead.messaging?.lastOutboundStatus
      ? ` | last delivery: ${lead.messaging.lastOutboundStatus}`
      : '';
    if (status === 'opted_out') {
      return `SMS: opted out${lead.messaging?.optedOutAt ? ` on ${formatDate(lead.messaging.optedOutAt)}` : ''}${outboundStatus}`;
    }
    if (status === 'active') {
      return `SMS: active${lead.messaging?.consentSource ? ` via ${lead.messaging.consentSource}` : ''}${outboundStatus}`;
    }
    return `SMS: consent not recorded yet${outboundStatus}`;
  }

  return (
    <section className="panel panel-wide">
      <div className="panel-header">
        <div>
          <h2>Operating View</h2>
          <p>Once installed, this is the part that matters: recoveries, leads, tasks, and activity.</p>
        </div>
      </div>
      <div className="metric-grid">
        <MetricCard label="Recovered Calls" value={workspace?.metrics.missedCallsRecovered ?? 0} />
        <MetricCard label="Auto Replies" value={workspace?.metrics.inboundAutoReplies ?? 0} />
        <MetricCard label="Open Tasks" value={workspace?.summary.openTaskCount ?? 0} />
        <MetricCard label="Pending Follow-Ups" value={workspace?.summary.pendingFollowups ?? 0} />
      </div>
      <div className="button-row">
        <button className="action-button" type="button" disabled={busy || !workspace} onClick={onRunDueFollowups}>
          Run Due Follow-Ups Now
        </button>
      </div>

      <div className="subsection">
        <div className="panel-header">
          <div>
            <h2>Starter Intake Flow</h2>
            <p>This is the live plumbing intake sequence the customer moves through after a missed call.</p>
          </div>
        </div>
        <div className="guide-grid guide-grid-tight">
          {starterFlowSteps.map((item) => (
            <article key={item.key} className="guide-card">
              <span className="guide-step">{item.key}</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="ops-grid">
        <article className="ops-card">
          <div className="check-top">
            <strong>Latest Recovered Calls</strong>
            <StatusBadge tone={missedCallActivities.length > 0 ? 'success' : 'neutral'}>
              {missedCallActivities.length}
            </StatusBadge>
          </div>
          <div className="stack-list">
            {missedCallActivities.slice(0, 5).map((item) => (
              <div key={item.activityId} className="stack-item">
                <div className="stack-item-top">
                  <strong>{item.title}</strong>
                  <span>{formatDate(item.timestamp)}</span>
                </div>
                <p>{item.summary}</p>
              </div>
            ))}
            {missedCallActivities.length === 0 && (
              <div className="empty-state">No missed-call recoveries yet.</div>
            )}
          </div>
        </article>

        <article className="ops-card">
          <div className="check-top">
            <strong>Recent Leads</strong>
            <StatusBadge tone={workspace?.leads.length ? 'success' : 'neutral'}>
              {workspace?.leads.length ?? 0}
            </StatusBadge>
          </div>
          <div className="stack-list">
            {(workspace?.leads ?? []).slice(0, 5).map((lead) => (
              <div key={lead.leadId} className="stack-item">
                <div className="stack-item-top">
                  <strong>{lead.name || lead.phone}</strong>
                  <span>{lead.urgencyLabel || lead.stage}</span>
                </div>
                <p>
                  {lead.phone}
                  {lead.serviceCategory ? ` | ${lead.serviceCategory}` : ''}
                  {lead.email ? ` | ${lead.email}` : ''}
                </p>
                <p>{renderLeadMessagingStatus(lead)}</p>
                {(lead.address || lead.notes) && (
                  <p>
                    {lead.address ? `${lead.address}` : ''}
                    {lead.address && lead.notes ? ' | ' : ''}
                    {lead.notes ? `${lead.notes}` : ''}
                  </p>
                )}
              </div>
            ))}
            {(workspace?.leads ?? []).length === 0 && (
              <div className="empty-state">No leads captured yet.</div>
            )}
          </div>
        </article>

        <article className="ops-card">
          <div className="check-top">
            <strong>Recent Messaging Activity</strong>
            <StatusBadge tone={workspace?.activity.length ? 'success' : 'neutral'}>
              {workspace?.activity.length ?? 0}
            </StatusBadge>
          </div>
          <div className="stack-list">
            {(workspace?.activity ?? []).slice(0, 5).map((item) => (
              <div key={item.activityId} className="stack-item">
                <div className="stack-item-top">
                  <strong>{item.title}</strong>
                  <span>{formatDate(item.timestamp)}</span>
                </div>
                <p>{item.summary}</p>
              </div>
            ))}
            {(workspace?.activity ?? []).length === 0 && (
              <div className="empty-state">No messaging activity yet.</div>
            )}
          </div>
        </article>

        <article className="ops-card">
          <div className="check-top">
            <strong>Human Tasks</strong>
            <StatusBadge tone={workspace?.summary.openTaskCount ? 'warning' : 'success'}>
              {workspace?.summary.openTaskCount ?? 0}
            </StatusBadge>
          </div>
          <div className="stack-list">
            {(workspace?.tasks ?? [])
              .filter((task) => task.status !== 'done')
              .slice(0, 5)
              .map((task) => (
                <TaskCard
                  key={task.taskId}
                  task={task}
                  actionLabel="Mark Done"
                  actionDisabled={busy}
                  onAction={() => onCompleteTask(task.taskId, task.title)}
                />
              ))}
            {(workspace?.tasks ?? []).filter((task) => task.status !== 'done').length === 0 && (
              <div className="empty-state">No human fallback tasks right now.</div>
            )}
          </div>
        </article>

        <article className="ops-card">
          <div className="check-top">
            <strong>Follow-Up Queue</strong>
            <StatusBadge tone={workspace?.summary.dueFollowups ? 'warning' : 'neutral'}>
              {workspace?.summary.pendingFollowups ?? 0}
            </StatusBadge>
          </div>
          <div className="stack-list">
            {(workspace?.followups ?? [])
              .filter((followup) => followup.status !== 'done')
              .slice(0, 5)
              .map((followup) => (
                <div key={followup.followupId} className="stack-item">
                  <div className="stack-item-top">
                    <strong>{followup.title}</strong>
                    <span>{followup.status}</span>
                  </div>
                  <p>
                    {formatDate(followup.scheduledFor)}
                    {followup.leadPhone ? ` | ${followup.leadPhone}` : ''}
                  </p>
                  <p>{followup.detail}</p>
                  <div className="button-row stack-item-actions">
                    <button
                      className="action-button action-button-quiet"
                      type="button"
                      disabled={busy}
                      onClick={() => onCompleteFollowup(followup.followupId, followup.title)}
                    >
                      Mark Done
                    </button>
                  </div>
                </div>
              ))}
            {(workspace?.followups ?? []).filter((followup) => followup.status !== 'done').length === 0 && (
              <div className="empty-state">No follow-ups are scheduled yet.</div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
