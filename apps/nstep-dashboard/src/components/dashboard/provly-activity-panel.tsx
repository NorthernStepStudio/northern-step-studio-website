import Link from "next/link";

import type { DashboardProvLyPanelResponse, DashboardWorkflowActivityProductItem } from "@/lib/dashboard/contracts";
import { formatCurrency, formatRatio } from "@/lib/dashboard/format";
import { DashboardProvLyReportPanel } from "./provly-report";
import { DashboardMetricStrip } from "./metric-strip";
import { DashboardSection } from "./section";
import { DashboardStatusPill } from "./status-pill";

export function DashboardProvLyActivityPanel({
  activity,
  panel,
}: {
  readonly activity: DashboardWorkflowActivityProductItem;
  readonly panel: DashboardProvLyPanelResponse;
}) {
  return (
    <div className="nsos-stack">
      <DashboardSection
        title="ProvLy claim readiness"
        subtitle="Inventory activity, documentation completeness, and export readiness in one place."
        actions={
          <>
            <Link className="button button-secondary" href="/dashboard/panels/provly">
              Open ProvLy panel
            </Link>
          </>
        }
        className="nsos-provly-activity-panel"
      >
        <div className="pill-row" style={{ marginBottom: 12 }}>
          <DashboardStatusPill value="provly" label="ProvLy" />
          <DashboardStatusPill value={panel.claimSummary.claimReady ? "completed" : "waiting_approval"} label={panel.claimSummary.claimReady ? "Claim ready" : "Review needed"} />
          <DashboardStatusPill value="activity" label={`${activity.activeJobs} active`} />
          <DashboardStatusPill value={panel.inventorySummary.highValueItemCount > 0 ? "warning" : "success"} label={`${panel.inventorySummary.highValueItemCount} high-value`} />
        </div>

        <DashboardMetricStrip
          metrics={[
            {
              label: "Active jobs",
              value: activity.activeJobs,
              detail: `${activity.waitingApprovalJobs} waiting approval`,
              tone: "accent",
            },
            {
              label: "Completeness",
              value: formatRatio(panel.claimSummary.completenessScore),
              detail: panel.claimSummary.claimReady ? "Claim-ready" : `${panel.claimSummary.missingFieldCount} missing field(s)`,
              tone: panel.claimSummary.claimReady ? "success" : "warning",
            },
            {
              label: "Ready exports",
              value: panel.claimSummary.readyExportCount,
              detail: "Queued for claim packet use",
              tone: panel.claimSummary.readyExportCount > 0 ? "success" : "neutral",
            },
            {
              label: "Estimated value",
              value: panel.inventorySummary.totalEstimatedValue !== undefined ? formatCurrency(panel.inventorySummary.totalEstimatedValue) : "-",
              detail: `${panel.inventorySummary.itemCount} item(s) tracked`,
              tone: "accent",
            },
          ]}
        />
      </DashboardSection>

      <DashboardProvLyReportPanel report={panel.latestReport} />
    </div>
  );
}
