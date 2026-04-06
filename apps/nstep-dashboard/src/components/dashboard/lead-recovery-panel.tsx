import type { DashboardLeadRecoveryPanelResponse } from "@/lib/dashboard/contracts";
import { formatDateTime } from "@/lib/dashboard/format";
import { DashboardApprovalQueue } from "./approval-queue";
import { DashboardEmptyState } from "./empty-state";
import { DashboardSection } from "./section";
import { DashboardStatusPill } from "./status-pill";

export function DashboardLeadRecoveryPanel({
  panel,
}: {
  readonly panel: DashboardLeadRecoveryPanelResponse;
}) {
  return (
    <div className="nsos-stack">
      <DashboardSection title="Recovery results" subtitle="Latest missed-call recoveries and SMS delivery states">
        <div className="metric-grid">
          <Metric label="Results" value={panel.resultSummary.total} detail="Completed recovery outcomes" />
          <Metric label="Succeeded" value={panel.resultSummary.succeeded} detail="Delivered and verified" />
          <Metric label="Delivered" value={panel.resultSummary.delivered} detail="SMS accepted by Twilio" />
          <Metric label="Waiting approval" value={panel.resultSummary.waitingApproval} detail="Steps paused for review" />
        </div>
      </DashboardSection>

      <DashboardSection title="Latest results" subtitle="Recent lead recovery outcomes">
        {panel.recentResults.length > 0 ? (
          <div className="summary-list">
            {panel.recentResults.map((result) => (
              <article className="summary-item" key={result.jobId}>
                <div className="summary-head">
                  <p className="summary-name">{result.leadName || result.phone}</p>
                  <div className="pill-row">
                    <DashboardStatusPill value={result.resultStatus} />
                    <DashboardStatusPill value={result.sendStatus} />
                    <DashboardStatusPill value={result.verificationStatus} />
                    <DashboardStatusPill
                      value={result.sendProvider || "mock"}
                      label={result.sendProvider === "twilio" ? "Twilio" : "Mock SMS"}
                    />
                  </div>
                </div>
                <p className="summary-detail">{result.summary}</p>
                <p className="summary-detail">
                  {result.scenario} - {result.contactable ? "contactable" : "suppressed"} - updated {formatDateTime(result.updatedAt)}
                </p>
                <p className="summary-detail">
                  {result.phone}
                  {result.sendProvider ? ` - ${result.sendProvider}` : ""}
                  {result.leadStage ? ` - ${result.leadStage}` : ""}
                </p>
                {result.suppressionReason ? <p className="summary-detail">{result.suppressionReason}</p> : null}
                {result.message ? <p className="summary-detail">{result.message}</p> : null}
              </article>
            ))}
          </div>
        ) : (
          <DashboardEmptyState title="No results yet" message="Recovered missed-call outcomes will appear here once Lead Recovery runs." />
        )}
      </DashboardSection>

      <DashboardSection title="Approvals" subtitle="Lead Recovery steps waiting on review">
        {panel.approvalItems.length > 0 ? (
          <DashboardApprovalQueue items={panel.approvalItems} />
        ) : (
          <DashboardEmptyState title="No pending approvals" message="Safe Lead Recovery runs are moving without operator review." />
        )}
      </DashboardSection>

      <div className="grid-two">
        <DashboardSection title="Suppression rules" subtitle="Safety rails that shape follow-up behavior">
          <div className="summary-list">
            {Object.entries(panel.suppressionSummary).map(([key, value]) => (
              <div className="summary-item" key={key}>
                <div className="summary-head">
                  <p className="summary-name">{key}</p>
                  <span className="pill status-info">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </DashboardSection>

        <DashboardSection title="Recent leads" subtitle="Most recent caller records">
          {panel.recentLeads.length > 0 ? (
            <div className="summary-list">
              {panel.recentLeads.slice(0, 6).map((lead) => (
                <div className="summary-item" key={lead.leadId}>
                  <div className="summary-head">
                    <p className="summary-name">{lead.name || lead.phone}</p>
                    <DashboardStatusPill value={lead.doNotContact ? "blocked" : lead.stage} />
                  </div>
                  <p className="summary-detail">
                    {lead.phone}
                    {lead.lastContactedAt ? ` - last contacted ${formatDateTime(lead.lastContactedAt)}` : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <DashboardEmptyState title="No recent leads" message="Caller records will appear here after missed-call intake." />
          )}
        </DashboardSection>
      </div>

      <DashboardSection title="Messages" subtitle="Scenario templates available to operators">
        <div className="summary-list">
          {panel.messageTemplates.length > 0 ? (
            panel.messageTemplates.map((template) => (
              <div className="summary-item" key={template.scenario}>
                <div className="summary-head">
                  <p className="summary-name">{template.title}</p>
                  <DashboardStatusPill value={template.tone} />
                </div>
                <p className="summary-detail">{template.body}</p>
                <p className="summary-detail">Editable: {template.editable ? "yes" : "no"}</p>
              </div>
            ))
          ) : (
            <DashboardEmptyState title="No message templates" message="Template rows will appear when workflow memory is populated." />
          )}
        </div>
      </DashboardSection>
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  readonly label: string;
  readonly value: number | string;
  readonly detail?: string;
}) {
  return (
    <article className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {detail ? <div className="metric-note">{detail}</div> : null}
    </article>
  );
}
