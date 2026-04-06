import type { DashboardSnapshot, JobRecord, MemoryEntry } from "./types";

export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function statusTone(value: string): string {
  const normalized = value.toLowerCase();
  if (["completed", "approved", "accepted", "succeeded", "delivered", "ok", "healthy"].includes(normalized)) {
    return "status-ok";
  }
  if (["failed", "rejected", "error", "critical"].includes(normalized)) {
    return "status-danger";
  }
  if (["waiting_approval", "pending", "running", "routing", "planning", "verifying", "queued"].includes(normalized)) {
    return "status-warn";
  }
  return "status-info";
}

export function sortJobs(jobs: readonly JobRecord[]): JobRecord[] {
  return [...jobs].sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
}

export function sortMemory(entries: readonly MemoryEntry[]): MemoryEntry[] {
  return [...entries].sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
}

export function topWorkflowCounts(
  workflows: readonly { key: string; title: string; description: string }[],
  dashboard: DashboardSnapshot | null,
): Array<{ key: string; title: string; description: string; count: number }> {
  return workflows
    .map((workflow) => ({
      ...workflow,
      count: dashboard?.jobs.byWorkflow[workflow.key] || 0,
    }))
    .sort((left, right) => right.count - left.count);
}

export function extractErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") {
    return null;
  }
  const error = body as { error?: { message?: string } };
  return error.error?.message || null;
}

export function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  return fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  }).then(async (response) => {
    const text = await response.text();
    let body: T;
    try {
      body = text ? (JSON.parse(text) as T) : ({} as T);
    } catch {
      body = {} as T;
    }
    if (!response.ok) {
      const errorMessage = extractErrorMessage(body) || `Request to ${url} failed with ${response.status}.`;
      throw new Error(errorMessage);
    }
    return body;
  });
}
