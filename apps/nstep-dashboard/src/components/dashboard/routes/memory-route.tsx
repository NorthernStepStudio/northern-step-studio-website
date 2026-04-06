import Link from "next/link";

import type { DashboardMemoryTier, DashboardMemoryViewResponse } from "@/lib/dashboard/contracts";
import { DashboardEmptyState } from "../empty-state";
import { DashboardMemoryGrid } from "../memory-grid";
import { DashboardMetricStrip } from "../metric-strip";
import { DashboardPageHeader } from "../page-header";
import { DashboardPagination } from "../pagination";
import { DashboardQueryToolbar } from "../query-toolbar";
import { DashboardSection } from "../section";
import { DashboardStatusPill } from "../status-pill";
import { formatDateTime, formatStatusLabel } from "@/lib/dashboard/format";
import {
  countAppliedFilters,
  DASHBOARD_PRODUCT_OPTIONS,
  DASHBOARD_SORT_DIRECTION_OPTIONS,
  DASHBOARD_SORT_OPTIONS,
  pageSizeOptions,
  type DashboardFilterQuery,
} from "@/lib/dashboard/query";

const MEMORY_TIER_ORDER: readonly DashboardMemoryTier[] = ["semantic", "procedural", "episodic"];
const MEMORY_TIER_DESCRIPTIONS: Record<DashboardMemoryTier, string> = {
  semantic: "Stable facts, user preferences, and tenant-level context that should carry across sessions.",
  procedural: "Reusable workflows, business rules, and playbooks that guide how the system should act.",
  episodic: "Run-specific lessons, outcomes, and fixes captured from individual jobs and conversations.",
};

export function DashboardMemoryRoute({
  memory,
  query,
}: {
  readonly memory: DashboardMemoryViewResponse;
  readonly query: DashboardFilterQuery;
}) {
  return (
    <>
      <DashboardPageHeader
        eyebrow="NStepOS memory"
        title="Memory and patterns"
        subtitle="Review reusable workflow patterns, editable preferences, and the audit trail behind memory updates."
        actions={
          <div className="form-actions">
            <Link className="button button-secondary" href="/dashboard">
              Back to overview
            </Link>
            <Link className="button button-secondary" href="/dashboard/settings">
              Open settings
            </Link>
          </div>
        }
        meta={
          <>
            <DashboardStatusPill value="filters" label={`${countAppliedFilters(query)} filters`} />
            <DashboardStatusPill value="memory" label={`${memory.summary.total} total`} />
            <DashboardStatusPill value="editable" label={`${memory.summary.editable} editable`} />
            <DashboardStatusPill value="patterns" label={`${memory.summary.patternCount} patterns`} />
          </>
        }
      />

      <DashboardMetricStrip
        metrics={[
          { label: "Total entries", value: memory.summary.total, detail: "All stored memory rows.", tone: "accent" },
          { label: "Editable", value: memory.summary.editable, detail: "Entries operators can change.", tone: "warning" },
          { label: "Patterns", value: memory.summary.patternCount, detail: "Known-good workflow templates.", tone: "success" },
          { label: "Recent updates", value: memory.summary.recentUpdates, detail: "Writes in the current window.", tone: "accent" },
        ]}
      />

      <DashboardSection title="Filters" subtitle="Search and sort memory entries, patterns, and audit updates">
        <DashboardQueryToolbar
          action="/dashboard/memory"
          clearHref="/dashboard/memory"
          note="Memory filters update the visible entry slice and the audit trail below."
          search={{
            name: "search",
            label: "Search",
            placeholder: "Key, summary, source label, or product",
            value: query.search,
          }}
          selects={[
            {
              name: "product",
              label: "Product",
              value: query.product,
              options: DASHBOARD_PRODUCT_OPTIONS,
            },
            {
              name: "sortBy",
              label: "Sort by",
              value: query.sortBy,
              options: DASHBOARD_SORT_OPTIONS,
            },
            {
              name: "sortDirection",
              label: "Sort direction",
              value: query.sortDirection,
              options: DASHBOARD_SORT_DIRECTION_OPTIONS,
            },
            {
              name: "pageSize",
              label: "Page size",
              value: query.pageSize ? String(query.pageSize) : undefined,
              options: pageSizeOptions(),
            },
          ]}
        />
      </DashboardSection>

      <DashboardSection title="Memory view" subtitle="Entries, patterns, and audit trail">
        <DashboardMemoryGrid auditTrail={memory.auditTrail} items={memory.items} patterns={memory.patterns} />
        <DashboardPagination pageInfo={memory.pageInfo} pathname="/dashboard/memory" query={query} />
      </DashboardSection>

      <DashboardSection title="By tier" subtitle="How memory is split between facts, playbooks, and episode notes">
        {Object.values(memory.summary.byTier).some((count) => count > 0) ? (
          <div className="summary-list">
            {MEMORY_TIER_ORDER.filter((tier) => (memory.summary.byTier[tier] || 0) > 0).map((tier) => {
              const count = memory.summary.byTier[tier] || 0;
              return (
                <article className="summary-item" key={tier}>
                  <div className="summary-head">
                    <p className="summary-name">{formatStatusLabel(tier)}</p>
                    <DashboardStatusPill value={tier} />
                  </div>
                  <p className="summary-detail">
                    {count} item{count === 1 ? "" : "s"} - {MEMORY_TIER_DESCRIPTIONS[tier]}
                  </p>
                </article>
              );
            })}
          </div>
        ) : (
          <DashboardEmptyState title="No memory tiers" message="Tiered memory will appear after workflows capture reusable context." />
        )}
      </DashboardSection>

      <div className="grid-two">
        <DashboardSection title="By category" subtitle="Category distribution across memory">
          {Object.entries(memory.summary.byCategory).length > 0 ? (
            <div className="summary-list">
              {Object.entries(memory.summary.byCategory).map(([category, count]) => (
                <div className="summary-item" key={category}>
                  <div className="summary-head">
                    <p className="summary-name">{category}</p>
                    <span className="pill status-info">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <DashboardEmptyState title="No categories" message="Memory categories will appear after workflow runs complete." />
          )}
        </DashboardSection>

        <DashboardSection title="By product" subtitle="Memory coverage by product">
          {Object.entries(memory.summary.byProduct).length > 0 ? (
            <div className="summary-list">
              {Object.entries(memory.summary.byProduct).map(([product, count]) => (
                <div className="summary-item" key={product}>
                  <div className="summary-head">
                    <p className="summary-name">{product}</p>
                    <span className="pill status-info">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <DashboardEmptyState title="No product memory" message="Product-scoped memory will appear once workflows learn patterns." />
          )}
        </DashboardSection>
      </div>

      <DashboardSection title="Recent audit events" subtitle="Last memory updates and writes">
        {memory.auditTrail.length > 0 ? (
          <div className="summary-list">
            {memory.auditTrail.slice(0, 8).map((entry) => (
              <article className="summary-item" key={entry.id}>
                <div className="summary-head">
                  <p className="summary-name">{entry.key}</p>
                  <DashboardStatusPill value={entry.category} />
                </div>
                <p className="summary-detail">
                  {entry.product} - {formatDateTime(entry.at)} - {entry.summary}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <DashboardEmptyState title="No audit events" message="Memory writes will be recorded here once workflows update patterns." />
        )}
      </DashboardSection>
    </>
  );
}
