import type { RevenueWorkspace, ConnectionCheck, StatusTone } from '../types';
import { MetricCard, StatusBadge } from './components';

interface DashboardProps {
  workspace: RevenueWorkspace | null;
  connectionCheck: ConnectionCheck;
  onOpenSetup: () => void;
  onOpenOperating: () => void;
  onOpenDemo: () => void;
}

export function Dashboard({
  workspace,
  connectionCheck,
  onOpenSetup,
  onOpenOperating,
  onOpenDemo,
}: DashboardProps) {
  const isLive = workspace?.summary.mode === 'live';
  const statusTone: StatusTone = isLive ? 'success' : 'warning';
  const automation = workspace?.settings.automation;
  
  return (
    <div className="dashboard-container">
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="status-dot tone-success" />
          Plumbing Starter
        </div>
        <h1>Dashboard</h1>
        <p className="hero-body">
          {isLive 
            ? "Your Starter plumbing automation is live and capturing leads." 
            : "System is in protected mode. Finish the Starter plumbing setup to go live."}
        </p>
        <p className="hero-subnote">
          {automation
            ? `${automation.tier.toUpperCase()} tier in ${automation.mode} mode with a ${automation.maxRequestsPerDay}/day request cap.`
            : 'Starter plumbing playbook with local, cloud, or hybrid runtime options.'}
        </p>
        
        <div className="button-row button-row-top-gap">
          <button className="action-button primary" onClick={onOpenDemo}>
            Open Demo
          </button>
          <button className="action-button" onClick={onOpenOperating}>
            View Operations
          </button>
          <button className="action-button" onClick={onOpenSetup}>
            System Setup
          </button>
        </div>
      </div>

      <div className="metric-grid">
        <MetricCard label="Recovered Calls" value={workspace?.metrics.missedCallsRecovered ?? 0} />
        <MetricCard label="Qualified Leads" value={workspace?.leads.length ?? 0} />
        <MetricCard label="Open Tasks" value={workspace?.summary.openTaskCount ?? 0} />
        <MetricCard label="Due Followups" value={workspace?.summary.dueFollowups ?? 0} />
      </div>

      <div className="subsection">
        <div className="panel-header">
          <div>
            <h2>Connectivity Status</h2>
            <p>Verification of the gateway and automation runtime.</p>
          </div>
        </div>
        <div className="ops-grid">
          <div className="ops-card">
            <strong>Gateway</strong>
            <StatusBadge tone={connectionCheck.status === 'connected' ? 'success' : 'error'}>
              {connectionCheck.status}
            </StatusBadge>
            <p>{connectionCheck.message}</p>
          </div>
          <div className="ops-card">
            <strong>Automation</strong>
            <StatusBadge tone={statusTone}>
              {workspace?.summary.mode ?? 'unknown'}
            </StatusBadge>
            <p>{isLive ? 'Starter plumbing flow is active' : 'Starter plumbing flow is protected'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
