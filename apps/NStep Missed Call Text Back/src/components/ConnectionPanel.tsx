import type { ConnectionCheck, ConnectionState, RequestState, SavedBusinessSummary } from '../types';
import { MetricCard, StatusBadge, StatusRow, toneFromConnection } from '../components';

interface ConnectionPanelProps {
  connection: ConnectionState;
  setConnection: React.Dispatch<React.SetStateAction<ConnectionState>>;
  connectionCheck: ConnectionCheck;
  systemSetupLocked: boolean;
  setConnectionEditingUnlocked: React.Dispatch<React.SetStateAction<boolean>>;
  requestState: RequestState;
  onTestConnection: () => Promise<void>;
  onOpenBusiness: () => Promise<void>;
  onDetectGateway: () => Promise<void>;
  onLoadDemo: () => Promise<void>;
  savedBusinesses: SavedBusinessSummary[];
  savedBusinessLiveCount: number;
  savedBusinessRecoveredCalls: number;
  savedBusinessOpenTasks: number;
  clientLaunchDraft: any; // Using any for brevity in this initial pass, will refine
  setClientLaunchDraft: any;
  onPrepareNewClient: () => Promise<void>;
  onDuplicateClient: () => Promise<void>;
  onResetClientLaunchDraft: (sourceTenantId?: string) => void;
  onLoadWorkspace: (syncForms: boolean, conn: ConnectionState) => Promise<void>;
  onUseBusinessAsTemplate: (id: string, name: string) => void;
}

export function ConnectionPanel({
  connection,
  setConnection,
  connectionCheck,
  systemSetupLocked,
  setConnectionEditingUnlocked,
  requestState,
  onTestConnection,
  onOpenBusiness,
  onDetectGateway,
  onLoadDemo,
  savedBusinesses,
  savedBusinessLiveCount,
  savedBusinessRecoveredCalls,
  savedBusinessOpenTasks,
  clientLaunchDraft,
  setClientLaunchDraft,
  onPrepareNewClient,
  onDuplicateClient,
  onResetClientLaunchDraft,
  onLoadWorkspace,
  onUseBusinessAsTemplate,
}: ConnectionPanelProps) {
  return (
    <section className="panel panel-wide">
      <div className="panel-header">
        <div>
          <h2>1. Automation-Managed Setup</h2>
          <p>
            These system fields start locked so day-to-day operators do not accidentally change the
            gateway target. Unlock them when this install needs a different connection.
          </p>
        </div>
        <StatusBadge tone={connectionCheck.status === 'connected' ? 'success' : 'warning'}>
          {connectionCheck.status === 'connected' ? 'Connected' : 'Needs open'}
        </StatusBadge>
      </div>

      <div className="connection-grid">
        <article className="step-card">
          <span className="step-chip">{systemSetupLocked ? 'Locked' : 'Unlocked'}</span>
          <h3>System connection fields</h3>
          <div className="form-grid">
            <label>
              Gateway URL (automation-managed)
              <input
                value={connection.gatewayUrl}
                disabled={systemSetupLocked}
                onChange={(event) =>
                  setConnection((current) => ({ ...current, gatewayUrl: event.target.value }))
                }
                placeholder="https://gateway.your-domain.com"
              />
            </label>
            <label>
              Access Key (automation-managed)
              <input
                value={connection.apiKey}
                disabled={systemSetupLocked}
                onChange={(event) =>
                  setConnection((current) => ({ ...current, apiKey: event.target.value }))
                }
                placeholder="client gateway key"
              />
            </label>
            <label>
              Workspace App ID (automation-managed)
              <input
                value={connection.appId}
                disabled={systemSetupLocked}
                onChange={(event) =>
                  setConnection((current) => ({ ...current, appId: event.target.value }))
                }
                placeholder="responseos-app"
              />
            </label>
            <label>
              Business ID (automation-managed)
              <input
                value={connection.tenantId}
                disabled={systemSetupLocked}
                onChange={(event) =>
                  setConnection((current) => ({ ...current, tenantId: event.target.value }))
                }
                placeholder="auto-created from business name if left as default"
              />
            </label>
          </div>
          <p className="panel-copy">
            These values start locked, but you can unlock them when this install needs a different
            gateway, access key, app ID, or business.
          </p>
          <div className="button-row">
            <button
              className="action-button"
              type="button"
              disabled={requestState.busy}
              onClick={onTestConnection}
            >
              Test Connection
            </button>
            <button
              className="action-button primary"
              type="button"
              disabled={requestState.busy}
              onClick={onOpenBusiness}
            >
              Open Business
            </button>
            <button
              className="action-button action-button-quiet"
              type="button"
              disabled={requestState.busy}
              onClick={() => setConnectionEditingUnlocked((current) => !current)}
            >
              {systemSetupLocked ? 'Unlock Connection Settings' : 'Lock Connection Settings'}
            </button>
          </div>
          <div className="signal-card">
            <div className="check-top">
              <strong>Client Dashboard</strong>
              <StatusBadge tone={savedBusinesses.length ? 'success' : 'neutral'}>
                {savedBusinesses.length ? `${savedBusinesses.length} clients` : 'None yet'}
              </StatusBadge>
            </div>
            <div className="metric-grid">
              <MetricCard label="Clients" value={savedBusinesses.length} />
              <MetricCard label="Live" value={savedBusinessLiveCount} />
              <MetricCard label="Recovered" value={savedBusinessRecoveredCalls} />
              <MetricCard label="Open Tasks" value={savedBusinessOpenTasks} />
            </div>
            <div className="subsection">
              <div className="subsection-header">
                <div>
                  <h3>Launch A Client Workspace</h3>
                  <p>
                    Start a brand-new client or duplicate a proven setup pattern. Duplicate copies
                    templates and operating rules, but clears live Twilio wiring so each client can
                    keep a unique relay number.
                  </p>
                </div>
                <StatusBadge tone={clientLaunchDraft.sourceTenantId ? 'success' : 'warning'}>
                  {clientLaunchDraft.sourceTenantId ? 'Template ready' : 'Pick template'}
                </StatusBadge>
              </div>
              <div className="form-grid">
                <label>
                  New Client Name
                  <input
                    value={clientLaunchDraft.businessName}
                    onChange={(event) =>
                      setClientLaunchDraft((current: any) => ({
                        ...current,
                        businessName: event.target.value,
                      }))
                    }
                    placeholder="Acme Plumbing"
                  />
                </label>
                <label>
                  New Business ID
                  <input
                    value={clientLaunchDraft.tenantId}
                    onChange={(event) =>
                      setClientLaunchDraft((current: any) => ({
                        ...current,
                        tenantId: event.target.value,
                      }))
                    }
                    placeholder="auto-generated from client name"
                  />
                </label>
                <label>
                  Primary Client Phone
                  <input
                    value={clientLaunchDraft.primaryNumber}
                    onChange={(event) =>
                      setClientLaunchDraft((current: any) => ({
                        ...current,
                        primaryNumber: event.target.value,
                      }))
                    }
                    placeholder="+19172809154"
                  />
                </label>
                <label>
                  Duplicate From Client
                  <select
                    value={clientLaunchDraft.sourceTenantId}
                    onChange={(event) =>
                      setClientLaunchDraft((current: any) => ({
                        ...current,
                        sourceTenantId: event.target.value,
                      }))
                    }
                  >
                    <option value="">Select template client</option>
                    {savedBusinesses.map((item) => (
                      <option key={item.tenantId} value={item.tenantId}>
                        {item.businessName || item.tenantId}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field-span">
                  Additional Client Phone Numbers
                  <textarea
                    rows={3}
                    value={clientLaunchDraft.additionalNumbers}
                    onChange={(event) =>
                      setClientLaunchDraft((current: any) => ({
                        ...current,
                        additionalNumbers: event.target.value,
                      }))
                    }
                    placeholder={'+19175550111\n+19175550112'}
                  />
                </label>
              </div>
              <div className="button-row">
                <button
                  className="action-button primary"
                  type="button"
                  disabled={requestState.busy}
                  onClick={onPrepareNewClient}
                >
                  Start New Client
                </button>
                <button
                  className="action-button"
                  type="button"
                  disabled={requestState.busy || !clientLaunchDraft.sourceTenantId.trim()}
                  onClick={onDuplicateClient}
                >
                  Duplicate Client
                </button>
                <button
                  className="action-button action-button-quiet"
                  type="button"
                  disabled={requestState.busy}
                  onClick={() => onResetClientLaunchDraft(clientLaunchDraft.sourceTenantId)}
                >
                  Clear Draft
                </button>
              </div>
            </div>
            {savedBusinesses.length > 0 ? (
              <div className="stack-list">
                {savedBusinesses.map((item) => (
                  <div key={item.tenantId} className="stack-item">
                    <div className="stack-item-top">
                      <strong>{item.businessName || item.tenantId}</strong>
                      <span>{item.mode === 'live' ? 'Live' : 'Safe mode'}</span>
                    </div>
                    <div className="button-row">
                      <button
                        className="action-button"
                        type="button"
                        disabled={requestState.busy}
                        onClick={() =>
                          onLoadWorkspace(true, {
                            ...connection,
                            tenantId: item.tenantId,
                          })
                        }
                      >
                        Open Saved Business
                      </button>
                      <button
                        className="action-button action-button-quiet"
                        type="button"
                        disabled={requestState.busy}
                        onClick={() => onUseBusinessAsTemplate(item.tenantId, item.businessName || item.tenantId)}
                      >
                        Use As Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                Save a business once and it will stay in ResponseOS on this machine.
              </div>
            )}
          </div>
        </article>

        <article className="step-card">
          <span className="step-chip">Automation tools</span>
          <h3>System helper tools</h3>
          <div className="button-row">
            <button
              className="action-button"
              type="button"
              disabled={requestState.busy}
              onClick={onDetectGateway}
            >
              Detect Local Install
            </button>
            <button
              className="action-button action-button-quiet"
              type="button"
              disabled={requestState.busy}
              onClick={onLoadDemo}
            >
              Load Plumbing Demo
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
