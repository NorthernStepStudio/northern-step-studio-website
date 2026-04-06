import Link from "next/link";

import type { DashboardSettingsResponse } from "@/lib/dashboard/contracts";
import { DashboardMetricStrip } from "../metric-strip";
import { DashboardOrchestrationHistoryPanel } from "../orchestration-history-panel";
import { DashboardPageHeader } from "../page-header";
import { DashboardSection } from "../section";
import { DashboardSettingsPanel } from "../settings-panel";
import { DashboardStatusPill } from "../status-pill";

export function DashboardSettingsRoute({
  settings,
}: {
  readonly settings: DashboardSettingsResponse;
}) {
  return (
    <>
      <DashboardPageHeader
        eyebrow="NStepOS settings"
        title="Runtime and policy"
        subtitle="Review execution mode, approval boundaries, tenant rules, templates, and memory governance."
        actions={
          <Link className="button button-secondary" href="/dashboard">
            Back to overview
          </Link>
        }
        meta={
          <>
            <DashboardStatusPill value={settings.runtime.executionMode} />
            <DashboardStatusPill value={settings.approvalPolicy.approvalThreshold} />
            <DashboardStatusPill value={settings.runtime.smsProvider} />
          </>
        }
      />

      <DashboardMetricStrip
        metrics={[
          {
            label: "Tenant rules",
            value: settings.summary.tenantRuleCount,
            detail: "Scoped rule sets per product.",
            tone: "accent",
          },
          {
            label: "Templates",
            value: settings.summary.communicationTemplateCount,
            detail: "Reusable communication copy.",
            tone: "success",
          },
          {
            label: "Suppression rules",
            value: settings.summary.suppressionRuleCount,
            detail: "Safety boundaries and timing rules.",
            tone: "warning",
          },
          {
            label: "Editable memory",
            value: settings.summary.editableMemoryCount,
            detail: "Memory entries operators can update.",
            tone: "accent",
          },
          {
            label: "Audit entries",
            value: settings.summary.recentAuditEntries,
            detail: "Recent memory changes and notes.",
            tone: "danger",
          },
        ]}
      />

      <DashboardSection title="Configuration" subtitle="Tenant rules, policies, and memory controls">
        <DashboardSettingsPanel settings={settings} />
      </DashboardSection>

      <DashboardOrchestrationHistoryPanel history={settings.orchestrationHistory} />
    </>
  );
}
