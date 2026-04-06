import type { ProfileDraft, RequestState, RevenueWorkspace, WebsiteDiscoveryResult } from '../types';
import { StatusBadge } from './components';

interface ProfilePanelProps {
  profileDraft: ProfileDraft;
  setProfileDraft: React.Dispatch<React.SetStateAction<ProfileDraft>>;
  setProfileDraftWithReplySync: (updater: (current: ProfileDraft) => ProfileDraft, sync?: boolean) => void;
  requestState: RequestState;
  workspace: RevenueWorkspace | null;
  businessNumberLocked: boolean;
  onSaveBusiness: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onAutoFillFromWebsite: () => Promise<void>;
  discoveryResult: WebsiteDiscoveryResult | null;
}

const STARTER_FLOW_STEPS = [
  ['1', 'Opening prompt', "Ask: What's going on - leak, clog, water heater, or something else?"],
  ['2', 'Fallback branch', 'If they pick other, offer toilet, fixture, disposal, sewer, water pressure, or a custom issue description.'],
  ['3', 'Severity branch', 'For leaks ask constant vs sink-use only. For clogs ask fully blocked vs draining slowly.'],
  ['4', 'Urgency check', 'Ask whether the issue is causing flooding or urgent damage right now.'],
  ['5', 'Location', 'Collect where the issue is happening: kitchen, bathroom, basement, or somewhere else.'],
  ['6', 'Customer name', 'Collect the customer name so the technician can call back with the owner summary ready.'],
] as const;

export function ProfilePanel({
  profileDraft,
  setProfileDraft,
  setProfileDraftWithReplySync,
  businessNumberLocked,
  onSaveBusiness,
  onAutoFillFromWebsite,
  requestState,
  discoveryResult,
}: ProfilePanelProps) {
  return (
    <section className="panel panel-wide">
      <div className="panel-header">
        <div>
          <h2>2. Client Fields</h2>
          <p>
            This is the Plumbing AI Starter setup. Clients hear Starter, Pro, and Elite as
            automation levels. Internal model routing stays hidden.
          </p>
        </div>
      </div>

      <form onSubmit={onSaveBusiness}>
        <div className="setup-grid">
          <article className="step-card">
            <span className="step-chip">Client fields</span>
            <h3>Client business details</h3>
            <div className="form-grid">
              <label>
                Client Business Name
                <input
                  value={profileDraft.businessName}
                  onChange={(event) =>
                    setProfileDraftWithReplySync(
                      (current) => ({
                        ...current,
                        businessName: event.target.value,
                      }),
                      true
                    )
                  }
                />
              </label>
              <label>
                Primary Client Phone Number
                <input
                  value={profileDraft.mainBusinessNumber}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      mainBusinessNumber: event.target.value,
                    }))
                  }
                  placeholder="+19172809154"
                />
              </label>
              <label>
                Additional Client Phone Numbers
                <textarea
                  rows={4}
                  value={profileDraft.additionalBusinessNumbers}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      additionalBusinessNumbers: event.target.value,
                    }))
                  }
                  placeholder={'+19175550111\n+19175550112'}
                />
              </label>
              <label>
                Twilio Relay Number
                <input
                  value={profileDraft.callbackNumber}
                  disabled={businessNumberLocked}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      callbackNumber: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="field-span">
                Client Website URL
                <input
                  value={profileDraft.websiteUrl}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      websiteUrl: event.target.value,
                    }))
                  }
                  placeholder="https://clientsite.com"
                />
              </label>
              <label>
                Client Services
                <input
                  value={profileDraft.services}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      services: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Client Timezone
                <input
                  value={profileDraft.timezone}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      timezone: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Automation Tier
                <select
                  value={profileDraft.automationTier}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      automationTier: event.target.value as ProfileDraft['automationTier'],
                    }))
                  }
                >
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="elite">Elite</option>
                </select>
              </label>
              <label>
                Runtime Mode
                <select
                  value={profileDraft.automationMode}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      automationMode: event.target.value as ProfileDraft['automationMode'],
                    }))
                  }
                >
                  <option value="hybrid">Hybrid</option>
                  <option value="local">Local</option>
                  <option value="cloud">Cloud</option>
                </select>
              </label>
              <label>
                Daily Request Cap
                <input
                  type="number"
                  min={1}
                  value={profileDraft.maxRequestsPerDay}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      maxRequestsPerDay: Math.max(1, Number(event.target.value || 1)),
                    }))
                  }
                />
              </label>
              <label className="field-span">
                Starter Missed-Call Opener
                <textarea
                  rows={3}
                  value={profileDraft.missedCallReply}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      missedCallReply: event.target.value,
                    }))
                  }
                />
              </label>
              <div className="signal-card field-span">
                <div className="check-top">
                  <strong>Starter Plumbing Flow</strong>
                  <StatusBadge tone="success">Locked playbook</StatusBadge>
                </div>
                <div className="guide-grid guide-grid-tight">
                  {STARTER_FLOW_STEPS.map(([step, title, detail]) => (
                    <article key={step} className="guide-card">
                      <span className="guide-step">{step}</span>
                      <h3>{title}</h3>
                      <p>{detail}</p>
                    </article>
                  ))}
                </div>
                <p>Starter is fully implemented now. Pro and Elite keep the same runtime contract for upgrades later.</p>
              </div>
            </div>
            <div className="button-row button-row-top-gap">
              <button
                className="action-button"
                type="button"
                disabled={requestState.busy}
                onClick={onAutoFillFromWebsite}
              >
                Auto-Fill From Website
              </button>
            </div>
            {discoveryResult && (
              <div className="signal-card">
                <div className="check-top">
                  <strong>Website scan found {discoveryResult.summary.foundCount} public details</strong>
                  <StatusBadge tone="success">{discoveryResult.summary.scannedCount} page(s)</StatusBadge>
                </div>
                <p>{discoveryResult.summary.notes.join(' ')}</p>
              </div>
            )}
          </article>

          <article className="step-card">
            <span className="step-chip">Client fields</span>
            <h3>Client contact and guardrails</h3>
            <div className="form-grid">
              <label>
                Client Alert Phone
                <input
                  value={profileDraft.ownerAlertDestination}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      ownerAlertDestination: event.target.value,
                    }))
                  }
                  placeholder="+19172809154"
                />
              </label>
              <label>
                Client Contact Email
                <input
                  value={profileDraft.contactEmail}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      contactEmail: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Client City / Area Served
                <input
                  value={profileDraft.serviceArea}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      serviceArea: event.target.value,
                    }))
                  }
                  placeholder="Manhattan, Brooklyn, Queens"
                />
              </label>
              <label className="field-span">
                <span>Fallback On Failure</span>
                <div className="check-top">
                  <input
                    type="checkbox"
                    checked={profileDraft.fallbackOnFailure}
                    onChange={(event) =>
                      setProfileDraft((current) => ({
                        ...current,
                        fallbackOnFailure: event.target.checked,
                      }))
                    }
                  />
                  <p>Use the safe Starter fallback when local or cloud automation fails.</p>
                </div>
              </label>
            </div>
          </article>
        </div>

        <div className="button-row">
          <button className="action-button primary" type="submit" disabled={requestState.busy}>
            Save Business
          </button>
        </div>
      </form>
    </section>
  );
}
