import "server-only";

import { cache } from "react";
import { readDashboardSessionFromCookies, getDashboardAuthHeaders } from "../auth";
import { getBackendUrl } from "../backend";
import type {
  DashboardApprovalQueueResponse,
  DashboardJobDetailResponse,
  DashboardJobListResponse,
  DashboardLogFeedResponse,
  DashboardMemoryViewResponse,
  DashboardOverviewResponse,
  DashboardProductPanelResponse,
  DashboardProvLyPanelResponse,
  DashboardSettingsResponse,
  DashboardWorkflowActivityResponse,
  ProductKey,
} from "./contracts";
import type { DashboardFilterQuery } from "./query";

export class DashboardApiError extends Error {
  readonly status: number;
  readonly endpoint: string;
  readonly body: unknown;

  constructor(status: number, endpoint: string, message: string, body: unknown) {
    super(message);
    this.name = "DashboardApiError";
    this.status = status;
    this.endpoint = endpoint;
    this.body = body;
  }
}

type DashboardQueryValue = string | number | boolean | readonly string[] | readonly number[] | undefined;
type DashboardQuery = Record<string, DashboardQueryValue>;
type DashboardQueryInput = DashboardFilterQuery & {
  readonly tenantId?: string;
  readonly caseId?: string;
};

function extractErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const error = body as {
    error?: { message?: string };
    message?: string;
    detail?: string;
  };

  return error.error?.message || error.message || error.detail || null;
}

function buildQueryString(query?: DashboardQueryInput): string {
  const normalized = normalizeQuery(query);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(normalized)) {
    if (value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, String(item));
      }
      continue;
    }
    params.set(key, String(value));
  }

  const rendered = params.toString();
  return rendered ? `?${rendered}` : "";
}

function normalizeQuery(query?: DashboardQueryInput): DashboardQuery {
  const normalized: DashboardQuery = {};

  if (!query) {
    return normalized;
  }

  if (query.tenantId !== undefined) {
    normalized.tenantId = query.tenantId;
  }
  if (query.caseId !== undefined) {
    normalized.caseId = query.caseId;
  }
  if (query.product !== undefined) {
    normalized.product = query.product;
  }
  if (query.workflow !== undefined) {
    normalized.workflow = query.workflow;
  }
  if (query.jobId !== undefined) {
    normalized.jobId = query.jobId;
  }
  if (query.status !== undefined) {
    normalized.status = query.status;
  }
  if (query.approvalStatus !== undefined) {
    normalized.approvalStatus = query.approvalStatus;
  }
  if (query.page !== undefined) {
    normalized.page = query.page;
  }
  if (query.pageSize !== undefined) {
    normalized.pageSize = query.pageSize;
  }
  if (query.search !== undefined) {
    normalized.search = query.search;
  }
  if (query.sortBy !== undefined) {
    normalized.sortBy = query.sortBy;
  }
  if (query.sortDirection !== undefined) {
    normalized.sortDirection = query.sortDirection;
  }
  if (query.from !== undefined) {
    normalized.from = query.from;
  }
  if (query.to !== undefined) {
    normalized.to = query.to;
  }
  if (query.lane !== undefined) {
    normalized.lane = query.lane;
  }
  if (query.priceSource !== undefined) {
    normalized.priceSource = query.priceSource;
  }
  if (query.reportBuildId !== undefined) {
    normalized.reportBuildId = query.reportBuildId;
  }
  if (query.comparisonBuildId !== undefined) {
    normalized.comparisonBuildId = query.comparisonBuildId;
  }

  return normalized;
}

async function fetchDashboard<T>(pathname: string, query?: DashboardQueryInput): Promise<T> {
  const session = await readDashboardSessionFromCookies();
  if (!session) {
    const endpoint = `${pathname}${buildQueryString(query)}`;
    throw new DashboardApiError(401, endpoint, "Dashboard session is required.", null);
  }
  const effectiveQuery = normalizeQuery({
    ...query,
    tenantId: session.tenantId,
  });
  const endpoint = `${pathname}${buildQueryString(effectiveQuery)}`;
  const response = await fetch(getBackendUrl(endpoint), {
    cache: "no-store",
    headers: {
      accept: "application/json",
      ...Object.fromEntries(getDashboardAuthHeaders(session).entries()),
    },
  });

  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    throw new DashboardApiError(
      response.status,
      endpoint,
      extractErrorMessage(body) || `Request to ${endpoint} failed with ${response.status}.`,
      body,
    );
  }

  return body as T;
}

export function buildDashboardQuery(query?: DashboardQueryInput): DashboardQuery {
  return normalizeQuery(query);
}

export async function getDashboardOverview(): Promise<DashboardOverviewResponse> {
  return fetchDashboard<DashboardOverviewResponse>("/v1/dashboard/overview");
}

export const getDashboardWorkspaceOverview = cache(async (): Promise<DashboardOverviewResponse> => {
  return getDashboardOverview();
});

export async function getDashboardJobs(query?: DashboardQueryInput): Promise<DashboardJobListResponse> {
  return fetchDashboard<DashboardJobListResponse>("/v1/dashboard/jobs", query);
}

export async function getDashboardJob(jobId: string): Promise<DashboardJobDetailResponse> {
  return fetchDashboard<DashboardJobDetailResponse>(`/v1/dashboard/jobs/${encodeURIComponent(jobId)}`);
}

export async function getDashboardApprovals(query?: DashboardQueryInput): Promise<DashboardApprovalQueueResponse> {
  return fetchDashboard<DashboardApprovalQueueResponse>("/v1/dashboard/approvals", query);
}

export async function getDashboardLogs(query?: DashboardQueryInput): Promise<DashboardLogFeedResponse> {
  return fetchDashboard<DashboardLogFeedResponse>("/v1/dashboard/logs", query);
}

export async function getDashboardActivity(query?: DashboardQueryInput): Promise<DashboardWorkflowActivityResponse> {
  return fetchDashboard<DashboardWorkflowActivityResponse>("/v1/dashboard/activity", query);
}

export async function getDashboardMemory(query?: DashboardQueryInput): Promise<DashboardMemoryViewResponse> {
  return fetchDashboard<DashboardMemoryViewResponse>("/v1/dashboard/memory", query);
}

export async function getDashboardProductPanel(product: ProductKey, query?: DashboardQueryInput): Promise<DashboardProductPanelResponse> {
  return fetchDashboard<DashboardProductPanelResponse>(`/v1/dashboard/panels/${encodeURIComponent(product)}`, query);
}

export async function getDashboardProvLyPanel(query?: DashboardQueryInput): Promise<DashboardProvLyPanelResponse> {
  return fetchDashboard<DashboardProvLyPanelResponse>("/v1/dashboard/panels/provly", query);
}

export async function getDashboardSettings(query?: DashboardQueryInput): Promise<DashboardSettingsResponse> {
  return fetchDashboard<DashboardSettingsResponse>("/v1/dashboard/settings", query);
}
