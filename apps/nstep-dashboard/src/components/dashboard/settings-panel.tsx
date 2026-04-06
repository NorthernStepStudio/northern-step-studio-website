import type { DashboardSettingsResponse } from "@/lib/dashboard/contracts";
import { DashboardEmptyState } from "./empty-state";
import { DashboardSection } from "./section";
import { DashboardStatusPill } from "./status-pill";
import { formatDateTime, formatRatio, productTitle } from "@/lib/dashboard/format";

export function DashboardSettingsPanel({
  settings,
}: {
  readonly settings: DashboardSettingsResponse;
}) {
  return (
    <div className="nsos-stack">
      <div className="grid-two">
        <DashboardSection title="Runtime snapshot" subtitle="Deployment and adapter configuration">
          <div className="summary-list">
            <SummaryRow label="Service" value={settings.runtime.serviceName} />
            <SummaryRow label="Provider mode" value={settings.runtime.providerMode} />
            <SummaryRow label="Execution mode" value={settings.runtime.executionMode} />
            <SummaryRow label="Port" value={settings.runtime.port} />
            <SummaryRow label="Data dir" value={settings.runtime.dataDir} />
            <SummaryRow label="Database" value={settings.runtime.databaseProvider} />
            <SummaryRow label="Browser" value={settings.runtime.browserProvider} />
            <SummaryRow label="SMS" value={settings.runtime.smsProvider} />
            <SummaryRow label="Email" value={settings.runtime.emailProvider} />
            <SummaryRow label="OCR" value={settings.runtime.ocrProvider} />
            <SummaryRow label="Redis enabled" value={settings.runtime.redisEnabled ? "yes" : "no"} />
            <SummaryRow label="Max retries" value={settings.runtime.maxRetries} />
          </div>
        </DashboardSection>

        <DashboardSection title="Approval policy" subtitle="Global gating and fallback behavior">
          <div className="summary-list">
            <SummaryRow label="Minimum role" value={settings.approvalPolicy.minimumRole} />
            <SummaryRow label="Threshold" value={settings.approvalPolicy.approvalThreshold} />
            <SummaryRow
              label="External actions"
              value={settings.approvalPolicy.externalActionsRequireApproval ? "approval required" : "auto allowed"}
            />
            <SummaryRow
              label="System bypass"
              value={settings.approvalPolicy.systemBypassAllowed ? "enabled" : "disabled"}
            />
          </div>
        </DashboardSection>
      </div>

      <DashboardSection title="Tenant rules" subtitle="Product-specific execution rules">
        {settings.tenantRules.length > 0 ? (
          <div className="table-wrap">
            <table className="table nsos-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Approval mode</th>
                  <th>Do not contact</th>
                  <th>Tone</th>
                  <th>Templates</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {settings.tenantRules.map((rule) => (
                  <tr key={`${rule.tenantId}:${rule.product}`}>
                    <td>{productTitle(rule.product)}</td>
                    <td>{rule.approvalMode}</td>
                    <td>{rule.doNotContactWindowHours}h</td>
                    <td>{rule.defaultTone}</td>
                    <td>{Object.keys(rule.messageTemplates).length}</td>
                    <td>{formatDateTime(rule.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <DashboardEmptyState title="No tenant rules" message="Tenant-specific rules will appear once workflows write settings." />
        )}
      </DashboardSection>

      <div className="grid-two">
        <DashboardSection title="Communication templates" subtitle="Editable outbound copy">
          {settings.communicationTemplates.length > 0 ? (
            <div className="summary-list">
              {settings.communicationTemplates.map((template) => (
                <article className="summary-item" key={template.key}>
                  <div className="summary-head">
                    <p className="summary-name">{template.title}</p>
                    <DashboardStatusPill value={template.tone} />
                  </div>
                  <p className="summary-detail">
                    {productTitle(template.product)} - {template.source} - {template.editable ? "editable" : "locked"}
                  </p>
                  <p className="summary-detail">{template.body}</p>
                </article>
              ))}
            </div>
          ) : (
            <DashboardEmptyState title="No communication templates" message="Templates will appear once memory or defaults are loaded." />
          )}
        </DashboardSection>

        <DashboardSection title="Suppression rules" subtitle="Timing and opt-out boundaries">
          {settings.suppressionRules.length > 0 ? (
            <div className="summary-list">
              {settings.suppressionRules.map((rule) => (
                <article className="summary-item" key={rule.key}>
                  <div className="summary-head">
                    <p className="summary-name">{rule.title}</p>
                    <DashboardStatusPill value={rule.enabled ? "enabled" : "disabled"} />
                  </div>
                  <p className="summary-detail">
                    {productTitle(rule.product)} - {rule.source}
                    {rule.windowHours !== undefined ? ` - ${rule.windowHours}h window` : ""}
                  </p>
                  <p className="summary-detail">{rule.description}</p>
                </article>
              ))}
            </div>
          ) : (
            <DashboardEmptyState title="No suppression rules" message="Suppression rules will appear when policy memory is present." />
          )}
        </DashboardSection>
      </div>

      <div className="grid-two">
        <DashboardSection title="Memory patterns" subtitle="Learned workflow templates and preferences">
          {settings.memoryPatterns.length > 0 ? (
            <div className="summary-list">
              {settings.memoryPatterns.slice(0, 8).map((pattern) => (
                <article className="summary-item" key={pattern.id}>
                  <div className="summary-head">
                    <p className="summary-name">{pattern.key}</p>
                    <DashboardStatusPill value={pattern.editable ? "editable" : "locked"} />
                  </div>
                  <p className="summary-detail">
                    {productTitle(pattern.product)} - {pattern.category} - confidence {formatRatio(pattern.confidence)}
                  </p>
                  <p className="summary-detail">{pattern.summary}</p>
                </article>
              ))}
            </div>
          ) : (
            <DashboardEmptyState title="No memory patterns" message="Reusable memory entries will show up here." />
          )}
        </DashboardSection>

        <DashboardSection title="Audit trail" subtitle="Recent memory edits and writes">
          {settings.auditTrail.length > 0 ? (
            <div className="table-wrap">
              <table className="table nsos-table">
                <thead>
                  <tr>
                    <th>At</th>
                    <th>Product</th>
                    <th>Action</th>
                    <th>Actor</th>
                    <th>Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.auditTrail.slice(0, 8).map((entry) => (
                    <tr key={entry.id}>
                      <td>{formatDateTime(entry.at)}</td>
                      <td>{productTitle(entry.product)}</td>
                      <td>{entry.action || "update"}</td>
                      <td>{entry.actorRole || "system"}</td>
                      <td>{entry.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <DashboardEmptyState title="No audit trail" message="Memory changes will be recorded here." />
          )}
        </DashboardSection>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: number | string;
}) {
  return (
    <div className="summary-item">
      <div className="summary-head">
        <p className="summary-name">{label}</p>
        <span className="pill status-info">{value}</span>
      </div>
    </div>
  );
}
