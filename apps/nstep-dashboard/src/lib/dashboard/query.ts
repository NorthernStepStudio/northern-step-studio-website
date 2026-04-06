import type { ProductKey } from "./contracts";

export type DashboardJobStatus = "pending" | "queued" | "routing" | "planning" | "waiting_approval" | "running" | "verifying" | "failed" | "completed";
export type DashboardApprovalStatus = "not_required" | "pending" | "approved" | "rejected";
export type DashboardExecutionLane = "internal" | "external" | "mixed";
export type DashboardSortBy = "createdAt" | "updatedAt" | "status" | "product" | "priority";
export type DashboardSortDirection = "asc" | "desc";

export interface DashboardFilterQuery {
  readonly product?: ProductKey;
  readonly workflow?: string;
  readonly jobId?: string;
  readonly caseId?: string;
  readonly status?: DashboardJobStatus;
  readonly approvalStatus?: DashboardApprovalStatus;
  readonly page?: number;
  readonly pageSize?: number;
  readonly search?: string;
  readonly sortBy?: DashboardSortBy;
  readonly sortDirection?: DashboardSortDirection;
  readonly from?: string;
  readonly to?: string;
  readonly lane?: DashboardExecutionLane;
  readonly priceSource?: string;
  readonly reportBuildId?: string;
  readonly comparisonBuildId?: string;
}

export interface DashboardSelectOption {
  readonly value: string;
  readonly label: string;
}

export interface DashboardSelectField {
  readonly name: string;
  readonly label: string;
  readonly value?: string;
  readonly options: readonly DashboardSelectOption[];
}

export interface DashboardSearchField {
  readonly name: string;
  readonly label: string;
  readonly placeholder: string;
  readonly value?: string;
}

export type DashboardSearchParamsInput =
  | Record<string, string | string[] | undefined>
  | URLSearchParams
  | Promise<Record<string, string | string[] | undefined>>
  | null
  | undefined;

export const DASHBOARD_PRODUCT_OPTIONS: readonly DashboardSelectOption[] = [
  { value: "", label: "All products" },
  { value: "lead-recovery", label: "Lead Recovery" },
  { value: "nexusbuild", label: "NexusBuild" },
  { value: "provly", label: "ProvLy" },
  { value: "neurormoves", label: "NeuroMoves" },
];

export const DASHBOARD_STATUS_OPTIONS: readonly DashboardSelectOption[] = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "queued", label: "Queued" },
  { value: "routing", label: "Routing" },
  { value: "planning", label: "Planning" },
  { value: "waiting_approval", label: "Waiting approval" },
  { value: "running", label: "Running" },
  { value: "verifying", label: "Verifying" },
  { value: "failed", label: "Failed" },
  { value: "completed", label: "Completed" },
];

export const DASHBOARD_APPROVAL_STATUS_OPTIONS: readonly DashboardSelectOption[] = [
  { value: "", label: "All approvals" },
  { value: "not_required", label: "Not required" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export const DASHBOARD_LANE_OPTIONS: readonly DashboardSelectOption[] = [
  { value: "", label: "All lanes" },
  { value: "internal", label: "Internal" },
  { value: "external", label: "External" },
  { value: "mixed", label: "Mixed" },
];

export const DASHBOARD_SORT_OPTIONS: readonly DashboardSelectOption[] = [
  { value: "updatedAt", label: "Updated" },
  { value: "createdAt", label: "Created" },
  { value: "status", label: "Status" },
  { value: "product", label: "Product" },
  { value: "priority", label: "Priority" },
];

export const DASHBOARD_SORT_DIRECTION_OPTIONS: readonly DashboardSelectOption[] = [
  { value: "desc", label: "Newest first" },
  { value: "asc", label: "Oldest first" },
];

const PAGE_SIZE_OPTIONS: readonly DashboardSelectOption[] = [
  { value: "10", label: "10" },
  { value: "20", label: "20" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
];

export function pageSizeOptions(): readonly DashboardSelectOption[] {
  return PAGE_SIZE_OPTIONS;
}

export async function resolveDashboardSearchParams(
  input: DashboardSearchParamsInput,
): Promise<Record<string, string | string[] | undefined>> {
  if (input instanceof URLSearchParams) {
    return Object.fromEntries(input.entries());
  }
  return Promise.resolve(input ?? {});
}

export async function parseDashboardQuery(input: DashboardSearchParamsInput): Promise<DashboardFilterQuery> {
  const params = await resolveDashboardSearchParams(input);

  return {
    product: readProductKey(params.product),
    workflow: readString(params.workflow),
    jobId: readString(params.jobId),
    caseId: readString(params.caseId),
    status: readOption(params.status, DASHBOARD_STATUS_OPTIONS),
    approvalStatus: readOption(params.approvalStatus, DASHBOARD_APPROVAL_STATUS_OPTIONS),
    page: readPage(params.page),
    pageSize: readPageSize(params.pageSize),
    search: readString(params.search),
    sortBy: readOption(params.sortBy, DASHBOARD_SORT_OPTIONS) as DashboardSortBy | undefined,
    sortDirection: readOption(params.sortDirection, DASHBOARD_SORT_DIRECTION_OPTIONS) as DashboardSortDirection | undefined,
    from: readString(params.from),
    to: readString(params.to),
    lane: readOption(params.lane, DASHBOARD_LANE_OPTIONS) as DashboardExecutionLane | undefined,
    priceSource: readString(params.priceSource),
    reportBuildId: readString(params.reportBuildId),
    comparisonBuildId: readString(params.comparisonBuildId),
  };
}

export function buildDashboardHref(pathname: string, query: DashboardFilterQuery): string {
  const params = new URLSearchParams();

  if (query.product) {
    params.set("product", query.product);
  }
  if (query.workflow) {
    params.set("workflow", query.workflow);
  }
  if (query.jobId) {
    params.set("jobId", query.jobId);
  }
  if (query.caseId) {
    params.set("caseId", query.caseId);
  }
  if (query.status) {
    params.set("status", query.status);
  }
  if (query.approvalStatus) {
    params.set("approvalStatus", query.approvalStatus);
  }
  if (query.page !== undefined) {
    params.set("page", String(query.page));
  }
  if (query.pageSize !== undefined) {
    params.set("pageSize", String(query.pageSize));
  }
  if (query.search) {
    params.set("search", query.search);
  }
  if (query.sortBy) {
    params.set("sortBy", query.sortBy);
  }
  if (query.sortDirection) {
    params.set("sortDirection", query.sortDirection);
  }
  if (query.from) {
    params.set("from", query.from);
  }
  if (query.to) {
    params.set("to", query.to);
  }
  if (query.lane) {
    params.set("lane", query.lane);
  }
  if (query.priceSource) {
    params.set("priceSource", query.priceSource);
  }
  if (query.reportBuildId) {
    params.set("reportBuildId", query.reportBuildId);
  }
  if (query.comparisonBuildId) {
    params.set("comparisonBuildId", query.comparisonBuildId);
  }

  const rendered = params.toString();
  return rendered ? `${pathname}?${rendered}` : pathname;
}

export function countAppliedFilters(query: DashboardFilterQuery): number {
  return [
    query.product,
    query.workflow,
    query.caseId,
    query.status,
    query.approvalStatus,
    query.search,
    query.sortBy,
    query.sortDirection,
    query.from,
    query.to,
    query.lane,
    query.priceSource,
    query.reportBuildId,
    query.comparisonBuildId,
  ].filter(Boolean).length;
}

function readString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0]?.trim() || undefined;
  }
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readPage(value: string | string[] | undefined): number | undefined {
  const parsed = Number.parseInt(readString(value) || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function readPageSize(value: string | string[] | undefined): number | undefined {
  const parsed = Number.parseInt(readString(value) || "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }
  return Math.min(Math.max(1, parsed), 100);
}

function readProductKey(value: string | string[] | undefined): ProductKey | undefined {
  const product = readString(value);
  if (!product) {
    return undefined;
  }
  return (["lead-recovery", "nexusbuild", "provly", "neurormoves"] as const).includes(product as ProductKey) ? (product as ProductKey) : undefined;
}

function readOption<T extends string>(value: string | string[] | undefined, options: readonly DashboardSelectOption[]): T | undefined {
  const candidate = readString(value);
  if (!candidate) {
    return undefined;
  }
  return options.some((option) => option.value === candidate) ? (candidate as T) : undefined;
}
