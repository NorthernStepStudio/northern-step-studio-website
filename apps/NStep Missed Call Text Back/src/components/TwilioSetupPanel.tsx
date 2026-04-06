import type { TwilioDraft, ValidationState, RequestState, RevenueWorkspace, ConnectionState } from '../types';
import { StatusBadge, toneFromValidation } from './components';

interface TwilioSetupPanelProps {
  twilioDraft: TwilioDraft;
  setTwilioDraft: React.Dispatch<React.SetStateAction<TwilioDraft>>;
  validation: ValidationState;
  requestState: RequestState;
  workspace: RevenueWorkspace | null;
  connection: ConnectionState;
  twilioLive: boolean;
  twilioSetupLocked: boolean;
  twilioMaintenanceMode: boolean;
  twilioSectionTitle: string;
  twilioSectionCopy: string;
  onValidateTwilio: () => Promise<void>;
  onConnectTwilio: () => Promise<void>;
  onCopyWebhook: () => Promise<void>;
  onSendTestMissedCall: () => Promise<void>;
  setTwilioMaintenanceUnlocked: React.Dispatch<React.SetStateAction<boolean>>;
  setValidation: React.Dispatch<React.SetStateAction<ValidationState>>;
  webhookUrl: string;
  twilioRequirements: string[];
  twilioSetupGuide: any[];
  twilioTrialChecklist: string[];
  firstLiveTestChecklist: string[];
}

export function TwilioSetupPanel({
  twilioDraft,
  setTwilioDraft,
  validation,
  requestState,
  workspace,
  connection,
  twilioLive,
  twilioSetupLocked,
  twilioMaintenanceMode,
  twilioSectionTitle,
  twilioSectionCopy,
  onValidateTwilio,
  onConnectTwilio,
  onCopyWebhook,
  onSendTestMissedCall,
  setTwilioMaintenanceUnlocked,
  setValidation,
  webhookUrl,
  twilioRequirements,
  twilioSetupGuide,
  twilioTrialChecklist,
  firstLiveTestChecklist,
}: TwilioSetupPanelProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>{twilioSectionTitle}</h2>
          <p>{twilioSectionCopy}</p>
        </div>
        <StatusBadge tone={twilioMaintenanceMode ? 'warning' : twilioSetupLocked ? 'success' : 'warning'}>
          {twilioMaintenanceMode ? 'Maintenance unlocked' : twilioSetupLocked ? 'Locked and connected' : 'Needs setup'}
        </StatusBadge>
      </div>

      {twilioLive && (
        <div className="button-row">
          <button
            className="action-button action-button-quiet"
            type="button"
            disabled={requestState.busy}
            onClick={() => {
              setTwilioMaintenanceUnlocked((current) => !current);
              setValidation({ status: 'idle', message: 'Enter Twilio credentials to validate.' });
              if (!twilioMaintenanceMode) {
                setTwilioDraft({
                  connectorId: 'business-sms-twilio',
                  accountSid: '',
                  authToken: '',
                  baseUrl: '',
                });
              }
            }}
          >
            {twilioMaintenanceMode ? 'Cancel Twilio Maintenance' : 'Unlock Twilio Maintenance'}
          </button>
        </div>
      )}

      {twilioSetupLocked ? (
        <div className="guide-grid guide-grid-tight">
          <article className="guide-card">
            <span className="guide-step">Relay</span>
            <h3>{workspace?.profile.callbackNumber || 'Not set'}</h3>
            <p>The hidden Twilio relay number that receives missed-call forwards and sends the text-back.</p>
          </article>
          <article className="guide-card">
            <span className="guide-step">Webhook</span>
            <h3>{webhookUrl ? 'Ready' : 'Needs public URL'}</h3>
            <p>{webhookUrl || 'Set a public base URL before re-wiring the live webhook.'}</p>
          </article>
        </div>
      ) : (
        <>
          <div className="form-grid">
            <label>
              Account SID (automation-managed)
              <input
                value={twilioDraft.accountSid}
                onChange={(event) =>
                  setTwilioDraft((current) => ({ ...current, accountSid: event.target.value }))
                }
                placeholder="AC..."
              />
            </label>
            <label>
              Auth Token (automation-managed)
              <input
                type="password"
                value={twilioDraft.authToken}
                onChange={(event) =>
                  setTwilioDraft((current) => ({ ...current, authToken: event.target.value }))
                }
              />
            </label>
          </div>
          <div className="button-row">
            <button
              className="action-button"
              type="button"
              disabled={requestState.busy}
              onClick={onValidateTwilio}
            >
              Check Twilio
            </button>
            <button
              className="action-button primary"
              type="button"
              disabled={requestState.busy}
              onClick={onConnectTwilio}
            >
              {twilioLive ? 'Reconnect Twilio' : 'Connect Twilio'}
            </button>
          </div>
        </>
      )}

      {twilioSetupLocked && (
        <div className="button-row">
          <button
            className="action-button"
            type="button"
            disabled={requestState.busy || !webhookUrl}
            onClick={onCopyWebhook}
          >
            Copy Live Webhook
          </button>
          <button
            className="action-button primary"
            type="button"
            disabled={requestState.busy}
            onClick={onSendTestMissedCall}
          >
            Run Live Test
          </button>
        </div>
      )}

      <div className="status-strip">
        <StatusBadge tone={toneFromValidation(validation.status)}>{validation.message}</StatusBadge>
      </div>
    </section>
  );
}
