import { useEffect, useState, type FormEvent } from 'react';

import { baseUrl } from '../helpers';
import type {
  ConnectionState,
  DemoLeadQuestionKey,
  DemoLeadResponse,
  DemoLeadSummary,
  RevenueWorkspace,
} from '../types';
import { StatusBadge } from './components';

type TranscriptEntry = {
  id: string;
  role: 'system' | 'customer';
  text: string;
};

interface SalesDemoViewProps {
  connection: ConnectionState;
  workspace: RevenueWorkspace | null;
  profileBusinessName: string;
  automationTier: 'starter' | 'pro' | 'elite';
  onLoadDemo: () => void;
  onOpenSetup: () => void;
}

const CUSTOMER_REPLY_SUGGESTIONS: Record<Exclude<DemoLeadQuestionKey, 'done'>, string[]> = {
  issue_type: ['Leak under the sink', 'Kitchen drain clog', 'Water heater issue', 'Other'],
  other_detail: ['Toilet issue', 'Fixture issue', 'Garbage disposal issue', 'Water pressure issue'],
  severity_detail: ['Constant', 'Only when I use the sink', 'Draining slowly'],
  urgency: ['Yes, a little', 'No'],
  location: ['Kitchen', 'Bathroom', 'Basement'],
  customer_name: ['John', 'Sarah', 'Mike'],
};

const SAMPLE_LEAK_SCENARIO = [
  'Leak under the sink',
  'Constant',
  'Yes, a little',
  'Kitchen',
  'John',
];

function buildEntry(role: TranscriptEntry['role'], text: string): TranscriptEntry {
  return {
    id: `${role}-${crypto.randomUUID()}`,
    role,
    text,
  };
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function SalesDemoView({
  connection,
  workspace,
  profileBusinessName,
  automationTier,
  onLoadDemo,
  onOpenSetup,
}: SalesDemoViewProps) {
  const resolvedBusinessName =
    workspace?.profile.businessName.trim() || profileBusinessName.trim() || 'ABC Plumbing';
  const activeWorkspaceLabel = workspace?.profile.businessName.trim() || connection.tenantId.trim() || 'current workspace';
  const demoWorkspaceReady =
    connection.tenantId.trim() === 'demo-plumbing-live-preview' &&
    resolvedBusinessName === 'ABC Plumbing' &&
    Boolean(workspace?.onboarding.channels.sms.live);
  const [businessName, setBusinessName] = useState(resolvedBusinessName);
  const [agentName, setAgentName] = useState('Mike');
  const [sessionId, setSessionId] = useState('');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [questionKey, setQuestionKey] = useState<DemoLeadQuestionKey>('issue_type');
  const [summary, setSummary] = useState<DemoLeadSummary | null>(null);

  useEffect(() => {
    if (!sessionId && transcript.length === 0) {
      setBusinessName(resolvedBusinessName);
    }
  }, [resolvedBusinessName, sessionId, transcript.length]);

  async function requestLead(payload: {
    session_id: string;
    message?: string;
    business_name: string;
    agent_name: string;
  }) {
    const response = await fetch(`${baseUrl(connection.gatewayUrl)}/lead`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const json = (await response.json()) as DemoLeadResponse & { error?: { message?: string } };
    if (!response.ok) {
      throw new Error(json.error?.message || `Demo request failed with status ${response.status}.`);
    }
    return json;
  }

  async function startDemo() {
    setBusy(true);
    setError('');
    setSummary(null);
    setTranscript([]);
    setQuestionKey('issue_type');
    const nextSessionId = crypto.randomUUID();

    try {
      const result = await requestLead({
        session_id: nextSessionId,
        business_name: businessName.trim() || 'ABC Plumbing',
        agent_name: agentName.trim() || 'Mike',
      });
      setSessionId(result.session_id);
      setTranscript([buildEntry('system', result.reply)]);
      setQuestionKey(result.question_key || 'issue_type');
    } catch (requestError) {
      setSessionId('');
      setError(requestError instanceof Error ? requestError.message : 'Could not start the demo.');
    } finally {
      setBusy(false);
    }
  }

  async function sendMessage(nextMessage: string) {
    const trimmed = nextMessage.trim();
    if (!trimmed || !sessionId) {
      return;
    }

    setBusy(true);
    setError('');

    try {
      const result = await requestLead({
        session_id: sessionId,
        message: trimmed,
        business_name: businessName.trim() || 'ABC Plumbing',
        agent_name: agentName.trim() || 'Mike',
      });
      setTranscript((current) => [
        ...current,
        buildEntry('customer', trimmed),
        buildEntry('system', result.reply),
      ]);
      setMessage('');
      setQuestionKey(result.question_key || (result.done ? 'done' : questionKey));
      setSummary(result.summary || null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not send the demo reply.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendMessage(message);
  }

  async function handleRunSampleScenario() {
    setBusy(true);
    setError('');
    setSummary(null);
    setTranscript([]);
    setQuestionKey('issue_type');
    const nextSessionId = crypto.randomUUID();

    try {
      const opening = await requestLead({
        session_id: nextSessionId,
        business_name: businessName.trim() || 'ABC Plumbing',
        agent_name: agentName.trim() || 'Mike',
      });

      setSessionId(opening.session_id);
      setTranscript([buildEntry('system', opening.reply)]);
      setQuestionKey(opening.question_key || 'issue_type');

      let currentQuestion = opening.question_key || 'issue_type';
      for (const customerReply of SAMPLE_LEAK_SCENARIO) {
        await wait(180);
        const result = await requestLead({
          session_id: nextSessionId,
          message: customerReply,
          business_name: businessName.trim() || 'ABC Plumbing',
          agent_name: agentName.trim() || 'Mike',
        });

        setTranscript((current) => [
          ...current,
          buildEntry('customer', customerReply),
          buildEntry('system', result.reply),
        ]);
        currentQuestion = result.question_key || (result.done ? 'done' : currentQuestion);
        setQuestionKey(currentQuestion);
        if (result.summary) {
          setSummary(result.summary);
        }
        if (result.done) {
          break;
        }
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not run the sample scenario.');
    } finally {
      setBusy(false);
    }
  }

  function handleResetDemo() {
    setSessionId('');
    setTranscript([]);
    setMessage('');
    setError('');
    setQuestionKey('issue_type');
    setSummary(null);
  }

  const suggestedReplies =
    questionKey !== 'done' && sessionId ? CUSTOMER_REPLY_SUGGESTIONS[questionKey] || [] : [];
  const demoStatusTone = summary ? 'success' : sessionId ? 'warning' : 'neutral';
  const talkTrack = {
    open:
      automationTier === 'elite'
        ? 'Let me show you what happens when a premium response system takes over the missed call.'
        : automationTier === 'pro'
          ? 'Let me show you what a higher-capacity response system does after a missed call.'
          : 'Let me show you what happens when you miss a call.',
    problem:
      automationTier === 'elite'
        ? 'Elite keeps the lead warm, routes urgency fast, and gives you the summary without making the customer wait.'
        : automationTier === 'pro'
          ? 'Pro gives you faster follow-up, cleaner lead capture, and a stronger handoff to the office.'
          : 'If you miss a call, that customer is usually calling the next plumber. This makes sure you respond instantly, even if you are on a job.',
    value:
      automationTier === 'elite'
        ? 'It captures the lead, checks urgency, syncs the handoff, and keeps the owner in control across channels.'
        : automationTier === 'pro'
          ? 'It captures the lead, qualifies the problem, and gives you the details you need to call back fast.'
          : 'It captures the lead, qualifies the problem, checks urgency, and gives you the details you need to call back fast.',
    close:
      automationTier === 'elite'
        ? 'If this saves just one high-value job per week, it pays for itself.'
        : automationTier === 'pro'
          ? 'If this saves just one missed job per week, it pays for itself.'
          : 'If this saves just one missed job per week, it pays for itself.',
  } as const;

  return (
    <section className="panel panel-wide">
      <div className="panel-header">
        <div>
          <h2>Sales Demo</h2>
          <p>
            Show a plumber exactly what happens after a missed call: instant response, structured
            qualification, urgency routing, and an owner-ready summary.
          </p>
        </div>
        <StatusBadge tone={demoStatusTone}>
          {summary ? 'Summary ready' : sessionId ? 'Live demo in progress' : 'Ready to start'}
        </StatusBadge>
      </div>

      <div className="signal-card">
        <div className="check-top">
          <strong>Demo Workspace</strong>
          <StatusBadge tone={demoWorkspaceReady ? 'success' : 'warning'}>
            {demoWorkspaceReady ? 'ABC Plumbing loaded' : `Current: ${activeWorkspaceLabel}`}
          </StatusBadge>
        </div>
        <p>
          Use the dedicated plumbing demo workspace before the phone test so the live Twilio number,
          summary flow, and sales script all stay aligned.
        </p>
        <div className="button-row">
          <button className="action-button primary" type="button" onClick={onLoadDemo}>
            Load Plumbing Demo
          </button>
          <button className="action-button action-button-quiet" type="button" onClick={onOpenSetup}>
            Open Setup
          </button>
        </div>
      </div>

      <div className="guide-grid">
        <article className="guide-card">
          <span className="guide-step">What It Is</span>
          <h3>24/7 missed-call response</h3>
          <p>
            This is a missed-call response system for plumbing businesses. It answers instantly,
            asks the right questions, and keeps the lead warm until the owner calls back.
          </p>
        </article>
        <article className="guide-card">
          <span className="guide-step">What It Does</span>
          <h3>Captures real plumbing leads</h3>
          <p>
            It qualifies the issue, checks urgency, captures the location and customer name, and
            turns the whole exchange into a clean lead summary, even when the issue does not fit
            the main categories.
          </p>
        </article>
        <article className="guide-card">
          <span className="guide-step">How It Works</span>
          <h3>Controlled plumbing script</h3>
          <p>
            The flow is structured, not random. It follows the Starter plumbing playbook so the
            questions stay short, clear, and useful for same-day callback decisions.
          </p>
        </article>
      </div>

      <div className="ops-grid demo-layout">
        <article className="ops-card demo-chat-shell">
          <div className="check-top">
            <strong>Live Conversation Demo</strong>
            <StatusBadge tone={sessionId ? 'success' : 'neutral'}>
              {sessionId ? 'Session active' : 'Not started'}
            </StatusBadge>
          </div>

          <div className="form-grid demo-config-grid">
            <label>
              Business Name
              <input
                value={businessName}
                disabled={busy}
                onChange={(event) => setBusinessName(event.target.value)}
              />
            </label>
            <label>
              Agent Name
              <input
                value={agentName}
                disabled={busy}
                onChange={(event) => setAgentName(event.target.value)}
              />
            </label>
          </div>

          <div className="button-row">
            <button className="action-button primary" type="button" disabled={busy} onClick={startDemo}>
              Start Live Demo
            </button>
            <button
              className="action-button"
              type="button"
              disabled={busy}
              onClick={handleRunSampleScenario}
            >
              Run Sample Leak Scenario
            </button>
            <button
              className="action-button action-button-quiet"
              type="button"
              disabled={busy}
              onClick={handleResetDemo}
            >
              Reset
            </button>
          </div>

          <div className="demo-transcript">
            {transcript.length > 0 ? (
              transcript.map((entry) => (
                <div
                  key={entry.id}
                  className={`demo-bubble ${entry.role === 'system' ? 'demo-bubble-system' : 'demo-bubble-customer'}`}
                >
                  <span className="demo-bubble-label">
                    {entry.role === 'system' ? 'System' : 'Customer'}
                  </span>
                  <p>{entry.text}</p>
                </div>
              ))
            ) : (
              <div className="empty-state">
                Start the demo to show the opener, then reply as the customer or run the sample leak
                scenario automatically.
              </div>
            )}
          </div>

          {suggestedReplies.length > 0 && (
            <div className="demo-suggestions">
              {suggestedReplies.map((item) => (
                <button
                  key={item}
                  className="demo-suggestion"
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setMessage(item);
                    void sendMessage(item);
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          <form className="demo-form" onSubmit={handleSubmit}>
            <input
              value={message}
              disabled={busy || !sessionId || questionKey === 'done'}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={sessionId ? 'Type the next customer reply' : 'Start the demo first'}
            />
            <button
              className="action-button"
              type="submit"
              disabled={busy || !sessionId || !message.trim() || questionKey === 'done'}
            >
              Send Reply
            </button>
          </form>

          {error && (
            <div className="status-badge status-badge-error demo-inline-error">{error}</div>
          )}
        </article>

        <article className="ops-card">
          <div className="check-top">
            <strong>Owner Summary Reveal</strong>
            <StatusBadge tone={summary ? 'success' : 'warning'}>
              {summary ? 'Ready to show' : 'Finish the intake'}
            </StatusBadge>
          </div>
          {summary ? (
            <pre className="demo-code">{JSON.stringify(summary, null, 2)}</pre>
          ) : (
            <div className="empty-state">
              The payoff is the structured summary the owner receives right after the intake is
              complete.
            </div>
          )}
          <div className="signal-card">
            <div className="check-top">
              <strong>What you say at this moment</strong>
              <StatusBadge tone="success">Close point</StatusBadge>
            </div>
            <p>“This is what you receive instantly instead of losing the job.”</p>
          </div>
        </article>

        <article className="ops-card">
          <div className="check-top">
            <strong>Live Talk Track</strong>
            <StatusBadge tone="success">Use verbatim</StatusBadge>
          </div>
          <div className="stack-list">
            <div className="stack-item">
              <strong>Open</strong>
              <p>“Let me show you what happens when you miss a call.”</p>
            </div>
            <div className="stack-item">
              <strong>Problem</strong>
              <p>
                “If you miss a call, that customer is usually calling the next plumber. This makes
                sure you respond instantly, even if you’re on a job.”
              </p>
            </div>
            <div className="stack-item">
              <strong>Value</strong>
              <p>
                “It captures the lead, qualifies the problem, checks urgency, and gives you the
                details you need to call back fast.”
              </p>
            </div>
            <div className="stack-item">
              <strong>Close</strong>
              <p>“If this saves just one missed job per week, it pays for itself.”</p>
            </div>
            <div className="stack-item">
              <strong>Ask</strong>
              <p>“Want me to set up a demo version for your business?”</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
