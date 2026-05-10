import Link from "next/link";

import type { DashboardSettingsResponse } from "@/lib/dashboard/contracts";
import { DashboardMetricStrip } from "../metric-strip";
import { DashboardOrchestrationHistoryPanel } from "../orchestration-history-panel";
import { DashboardPageHeader } from "../page-header";
import { DashboardSection } from "../section";
import { DashboardSettingsPanel } from "../settings-panel";
import { DashboardStatusPill } from "../status-pill";
import { buildDashboardSettingsMetrics } from "@/lib/dashboard/view-models/settings-view-model";

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

      <DashboardMetricStrip metrics={buildDashboardSettingsMetrics(settings)} />

      <DashboardSection title="Configuration" subtitle="Tenant rules, policies, and memory controls">
        <DashboardSettingsPanel settings={settings} />
      </DashboardSection>

      <DashboardOrchestrationHistoryPanel history={settings.orchestrationHistory} />
    </>
  );
}
