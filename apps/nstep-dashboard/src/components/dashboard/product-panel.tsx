import Link from "next/link";

import type {
  DashboardNeuroMovesPanelResponse,
  DashboardNexusBuildPanelResponse,
  DashboardProductPanelResponse,
  DashboardProvLyPanelResponse,
} from "@/lib/dashboard/contracts";
import { formatCurrency, formatDateTime, formatRatio, productTitle } from "@/lib/dashboard/format";
import { DashboardActiveFilterChips } from "./active-filter-chips";
import { DashboardQueryToolbar } from "@/components/dashboard/query-toolbar";
import { DashboardEmptyState } from "./empty-state";
import { DashboardJobTable } from "./job-table";
import { DashboardLeadRecoveryPanel } from "./lead-recovery-panel";
import { DashboardNexusBuildReportPanel } from "./nexusbuild-report";
import { DashboardProvLyReportPanel } from "./provly-report";
import { DashboardProvLyUploadForm } from "./provly-upload-form";
import { DashboardSection } from "./section";
import { DashboardStatusPill } from "./status-pill";
import type { DashboardFilterQuery } from "@/lib/dashboard/query";
import { buildDashboardHref } from "@/lib/dashboard/query";

export function DashboardProductPanel({
  panel,
  query,
}: {
  readonly panel: DashboardProductPanelResponse;
  readonly query?: DashboardFilterQuery;
}) {
  return (
    <div className="nsos-stack">
      <DashboardSection
        title={panel.summary.title}
        subtitle={panel.summary.description}
        actions={
          <>
            <DashboardStatusPill value={panel.product} label={productTitle(panel.product)} />
            <DashboardStatusPill value={panel.kind} />
          </>
        }
      >
        <div className="metric-grid">
          <article className="metric-card">
            <div className="metric-label">{panel.summary.primaryMetric.label}</div>
            <div className="metric-value">{panel.summary.primaryMetric.value}</div>
            {panel.summary.primaryMetric.detail ? <div className="metric-note">{panel.summary.primaryMetric.detail}</div> : null}
          </article>
          {panel.summary.secondaryMetrics.slice(0, 3).map((metric) => (
            <article className="metric-card" key={metric.label}>
              <div className="metric-label">{metric.label}</div>
              <div className="metric-value">{metric.value}</div>
              {metric.detail ? <div className="metric-note">{metric.detail}</div> : null}
            </article>
          ))}
        </div>
      </DashboardSection>

      {renderProductBody(panel, query)}

      <DashboardSection title="Recent jobs" subtitle="Latest runs in this product">
        <DashboardJobTable items={panel.recentJobs.slice(0, 8)} />
      </DashboardSection>

      <DashboardSection title="Recent memory" subtitle="Stored patterns and preferences">
        <div className="summary-list">
          {panel.recentMemory.length > 0 ? (
            panel.recentMemory.slice(0, 8).map((memory) => (
              <article className="summary-item" key={memory.id}>
                <div className="summary-head">
                  <p className="summary-name">{memory.key}</p>
                  <DashboardStatusPill value={memory.category} label={memory.category} />
                </div>
                <p className="summary-detail">{memory.summary}</p>
              </article>
            ))
          ) : (
            <DashboardEmptyState title="No recent memory" message="This product has not written reusable patterns yet." />
          )}
        </div>
      </DashboardSection>
    </div>
  );
}

function renderProductBody(panel: DashboardProductPanelResponse, query?: DashboardFilterQuery) {
  switch (panel.product) {
    case "lead-recovery":
      return <DashboardLeadRecoveryPanel panel={panel} />;
    case "nexusbuild":
      return <NexusBuildPanel panel={panel} query={query} />;
    case "provly":
      return <ProvLyPanel panel={panel} query={query} />;
    case "neurormoves":
      return <NeuroMovesPanel panel={panel} />;
    default:
      return null;
  }
}

function NexusBuildPanel({
  panel,
  query,
}: {
  readonly panel: DashboardNexusBuildPanelResponse;
  readonly query?: DashboardFilterQuery;
}) {
  const reportOptions = buildReportBuildOptions(panel);
  const priceSourceOptions = buildPriceSourceOptions(panel);
  const comparisonOptions = buildComparisonBuildOptions(panel);
  const toolbarQuery: DashboardFilterQuery = query ?? {};

  return (
    <div className="nsos-stack">
      <DashboardSection title="Filters" subtitle="Scope pricing sources, report history, and comparison focus">
        <DashboardActiveFilterChips
          chips={buildNexusBuildActiveFilters(panel, toolbarQuery)}
          clearAllHref="/dashboard/panels/nexusbuild"
        />
        <DashboardQueryToolbar
          action="/dashboard/panels/nexusbuild"
          clearHref="/dashboard/panels/nexusbuild"
          note="Choose one build to scope the report view, narrow live pricing by source, or focus the comparison matrix on a winner or build ID."
          selects={[
            {
              name: "reportBuildId",
              label: "Latest report",
              value: toolbarQuery.reportBuildId,
              options: reportOptions,
            },
            {
              name: "priceSource",
              label: "Price source",
              value: toolbarQuery.priceSource,
              options: priceSourceOptions,
            },
            {
              name: "comparisonBuildId",
              label: "Comparison focus",
              value: toolbarQuery.comparisonBuildId,
              options: comparisonOptions,
            },
          ]}
        />
      </DashboardSection>

      <DashboardSection title="Build analysis" subtitle="Compatibility, pricing, and recommendation output">
        <div className="metric-grid">
          <Metric label="Saved builds" value={panel.buildSummary.savedBuilds} />
          <Metric label="Compatibility checks" value={panel.buildSummary.compatibilityChecks} />
          <Metric label="Pricing snapshots" value={panel.buildSummary.pricingSnapshots} />
          <Metric label="Recommendation runs" value={panel.buildSummary.recommendationRuns} />
        </div>
      </DashboardSection>

      <div className="grid-two">
        <DashboardSection title="Compatibility" subtitle="Pass, warn, and fail distribution">
          <div className="summary-list">
            <SummaryRow label="Pass" value={panel.compatibilitySummary.pass} />
            <SummaryRow label="Warn" value={panel.compatibilitySummary.warn} />
            <SummaryRow label="Fail" value={panel.compatibilitySummary.fail} />
            {panel.compatibilitySummary.latestScore !== undefined ? (
              <SummaryRow label="Latest score" value={formatRatio(panel.compatibilitySummary.latestScore)} />
            ) : null}
          </div>
        </DashboardSection>

        <DashboardSection title="Pricing" subtitle="Live and semi-live price tracking">
          <div className="summary-list">
            <SummaryRow label="Live pricing" value={panel.pricingSummary.livePricingEnabled ? "enabled" : "disabled"} />
            <SummaryRow label="Snapshots" value={panel.pricingSummary.snapshotCount} />
            <SummaryRow label="Watched items" value={panel.pricingSummary.watchedItems} />
            {panel.pricingSummary.latestAveragePrice !== undefined ? (
              <SummaryRow label="Average price" value={formatCurrency(panel.pricingSummary.latestAveragePrice)} />
            ) : null}
          </div>
        </DashboardSection>
      </div>

      <DashboardSection title="Latest reports" subtitle="Recent analysis reports by build">
        {panel.latestReports.length > 0 ? (
          <div className="summary-list">
            {panel.latestReports.map((report) => {
              const reportHref = buildDashboardHref("/dashboard/panels/nexusbuild", {
                ...toolbarQuery,
                reportBuildId: report.buildId,
              });
              const selected = toolbarQuery.reportBuildId === report.buildId;

              return (
                <article className="summary-item" key={report.reportId}>
                  <div className="summary-head">
                    <div>
                      <p className="summary-name">{report.title}</p>
                      <p className="summary-detail">
                        {report.buildId} - updated {formatDateTime(report.updatedAt)}
                      </p>
                    </div>
                    <div className="pill-row">
                      <DashboardStatusPill value="info" label={formatRatio(report.compatibilityScore)} />
                      <DashboardStatusPill value="info" label={formatRatio(report.performanceScore)} />
                      <DashboardStatusPill value="info" label={formatRatio(report.valueScore)} />
                      <DashboardStatusPill value={selected ? "completed" : "info"} label={selected ? "Selected" : "Open"} />
                    </div>
                  </div>
                  <p className="summary-detail">{report.summary}</p>
                  <Link className="button button-secondary" href={reportHref}>
                    View this build
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <DashboardEmptyState title="No latest reports" message="Run a NexusBuild analysis to populate the latest report list." />
        )}
      </DashboardSection>

      <DashboardNexusBuildReportPanel report={panel.latestReport} />

      <DashboardSection title="Saved builds" subtitle="Stored configurations and quick comparisons">
        {panel.savedBuilds.length > 0 ? (
          <div className="summary-list">
            {panel.savedBuilds.map((build) => (
              <div className="summary-item" key={build.buildId}>
                <div className="summary-head">
                  <p className="summary-name">{build.name}</p>
                  <DashboardStatusPill value={build.preferred ? "preferred" : "saved"} />
                </div>
                <p className="summary-detail">
                  {build.useCase} - {build.partCount} parts
                  {build.budget ? ` - ${formatCurrency(build.budget, build.currency)}` : ""}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <DashboardEmptyState title="No saved builds" message="Saved build rows will appear after intake or import." />
        )}
      </DashboardSection>
    </div>
  );
}

function ProvLyPanel({
  panel,
  query,
}: {
  readonly panel: DashboardProvLyPanelResponse;
  readonly query?: DashboardFilterQuery;
}) {
  return (
    <div className="nsos-stack">
      <DashboardSection title="Upload inventory" subtitle="Add photos, receipts, and scans directly from the dashboard">
        <DashboardProvLyUploadForm tenantId={panel.tenantId} defaultCaseId={query?.caseId} />
      </DashboardSection>

      <DashboardSection title="Inventory summary" subtitle="Coverage, receipts, and high-value items">
        <div className="metric-grid">
          <Metric label="Items" value={panel.inventorySummary.itemCount} />
          <Metric label="Rooms" value={panel.inventorySummary.roomCount} />
          <Metric label="Categories" value={panel.inventorySummary.categoryCount} />
          <Metric label="Receipts" value={panel.inventorySummary.receiptCount} />
        </div>
      </DashboardSection>

      <DashboardSection title="Claim readiness" subtitle="Completeness and export state">
        <div className="summary-list">
          <SummaryRow label="Completeness" value={formatRatio(panel.claimSummary.completenessScore)} />
          <SummaryRow label="Claim ready" value={panel.claimSummary.claimReady ? "yes" : "no"} />
          <SummaryRow label="Exports" value={panel.claimSummary.exportCount} />
          <SummaryRow label="Reminders" value={panel.claimSummary.reminderCount} />
        </div>
      </DashboardSection>

      <DashboardProvLyReportPanel report={panel.latestReport} />
    </div>
  );
}

function NeuroMovesPanel({ panel }: { readonly panel: DashboardNeuroMovesPanelResponse }) {
  return (
    <div className="nsos-stack">
      <DashboardSection title="Routine coverage" subtitle="Recurring support and progress tracking">
        <div className="metric-grid">
          <Metric label="Active jobs" value={panel.routineSummary.activeJobs} />
          <Metric label="Completed" value={panel.routineSummary.completedJobs} />
          <Metric label="Check-ins" value={panel.routineSummary.scheduledCheckIns} />
          <Metric label="Summaries" value={panel.routineSummary.sentSummaries} />
        </div>
      </DashboardSection>

      <div className="grid-two">
        <DashboardSection title="Pattern memory" subtitle="Reusable routine templates">
          {panel.routinePatterns.length > 0 ? (
            <div className="summary-list">
              {panel.routinePatterns.map((pattern) => (
                <div className="summary-item" key={pattern.memoryId}>
                <div className="summary-head">
                  <p className="summary-name">{pattern.key}</p>
                  <DashboardStatusPill value={pattern.editable ? "editable" : "locked"} />
                </div>
                <p className="summary-detail">
                  confidence {formatRatio(pattern.confidence)} - updated {formatDateTime(pattern.updatedAt)}
                </p>
              </div>
            ))}
            </div>
          ) : (
            <DashboardEmptyState title="No routine patterns" message="Patterns will appear as recurring jobs are learned." />
          )}
        </DashboardSection>

        <DashboardSection title="Check-ins" subtitle="Scheduled recurring job history">
          {panel.recentCheckIns.length > 0 ? (
            <div className="summary-list">
              {panel.recentCheckIns.slice(0, 6).map((checkIn) => (
                <div className="summary-item" key={checkIn.jobId}>
                <div className="summary-head">
                  <p className="summary-name">{checkIn.title}</p>
                  <DashboardStatusPill value={checkIn.status} />
                </div>
                <p className="summary-detail">
                  {checkIn.workflow} - {checkIn.source} - {formatDateTime(checkIn.runAt)}
                </p>
              </div>
            ))}
            </div>
          ) : (
            <DashboardEmptyState title="No check-ins" message="Recurring check-in jobs will appear here once scheduled." />
          )}
        </DashboardSection>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  readonly label: string;
  readonly value: number | string;
}) {
  return (
    <article className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
    </article>
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

function buildReportBuildOptions(panel: DashboardNexusBuildPanelResponse) {
  const seen = new Map<string, string>();
  const options: { value: string; label: string }[] = [];
  for (const build of panel.savedBuilds) {
    if (seen.has(build.buildId)) {
      continue;
    }
    seen.set(build.buildId, build.name);
    options.push({ value: build.buildId, label: `${build.name} (${build.buildId})` });
  }
  for (const report of panel.latestReports) {
    if (seen.has(report.buildId)) {
      continue;
    }
    seen.set(report.buildId, report.title);
    options.push({ value: report.buildId, label: `${report.title} (${report.buildId})` });
  }

  return [{ value: "", label: "All reports" }, ...options];
}

function buildPriceSourceOptions(panel: DashboardNexusBuildPanelResponse) {
  const report = panel.latestReport;
  const seen = new Set<string>();
  const options: { value: string; label: string }[] = [];
  for (const snapshot of report?.pricing.snapshots || []) {
    if (seen.has(snapshot.source)) {
      continue;
    }
    seen.add(snapshot.source);
    options.push({ value: snapshot.source, label: snapshot.label ? `${snapshot.label} (${snapshot.source})` : snapshot.source });
  }

  return [{ value: "", label: "All price sources" }, ...options];
}

function buildComparisonBuildOptions(panel: DashboardNexusBuildPanelResponse) {
  const report = panel.latestReport;
  const seen = new Set<string>();
  const options: { value: string; label: string }[] = [];
  for (const row of report?.comparison?.matrix || []) {
    if (seen.has(row.buildId)) {
      continue;
    }
    seen.add(row.buildId);
    options.push({ value: row.buildId, label: row.buildId });
  }

  return [
    { value: "", label: "All comparison rows" },
    { value: "winner", label: "Winner only" },
    ...options,
  ];
}

function buildNexusBuildActiveFilters(panel: DashboardNexusBuildPanelResponse, query: DashboardFilterQuery) {
  const chips: { label: string; value: string; href: string }[] = [];

  if (query.reportBuildId) {
    chips.push({
      label: "Latest report",
      value: resolveNexusBuildLabel(query.reportBuildId, panel),
      href: buildDashboardHref("/dashboard/panels/nexusbuild", {
        ...query,
        reportBuildId: undefined,
      }),
    });
  }

  if (query.priceSource) {
    chips.push({
      label: "Price source",
      value: resolvePriceSourceLabel(query.priceSource, panel),
      href: buildDashboardHref("/dashboard/panels/nexusbuild", {
        ...query,
        priceSource: undefined,
      }),
    });
  }

  if (query.comparisonBuildId) {
    chips.push({
      label: "Comparison focus",
      value: resolveComparisonLabel(query.comparisonBuildId, panel),
      href: buildDashboardHref("/dashboard/panels/nexusbuild", {
        ...query,
        comparisonBuildId: undefined,
      }),
    });
  }

  return chips;
}

function resolveNexusBuildLabel(buildId: string, panel: DashboardNexusBuildPanelResponse): string {
  const report = panel.latestReports.find((item) => item.buildId === buildId);
  if (report) {
    return report.title;
  }

  const build = panel.savedBuilds.find((item) => item.buildId === buildId);
  if (build) {
    return build.name;
  }

  return buildId;
}

function resolvePriceSourceLabel(priceSource: string, panel: DashboardNexusBuildPanelResponse): string {
  const report = panel.latestReport;
  const snapshot = report?.pricing.snapshots.find((item) => item.source === priceSource);
  if (snapshot?.label) {
    return snapshot.label;
  }

  return snapshot?.source || priceSource;
}

function resolveComparisonLabel(comparisonBuildId: string, panel: DashboardNexusBuildPanelResponse): string {
  if (comparisonBuildId === "winner") {
    return "Winner only";
  }

  const report = panel.latestReports.find((item) => item.buildId === comparisonBuildId);
  if (report) {
    return report.title;
  }

  return comparisonBuildId;
}
