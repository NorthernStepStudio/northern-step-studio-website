import type { DashboardApprovalQueueItem } from "./contracts";

export interface DashboardApprovalMutationRequest {
  readonly item: DashboardApprovalQueueItem;
  readonly reason?: string;
}

interface DashboardMutationResponse {
  readonly job?: {
    readonly jobId?: string;
    readonly status?: string;
  };
  readonly error?: {
    readonly message?: string;
  };
}

async function invokeApprovalMutation(pathname: string, request: DashboardApprovalMutationRequest): Promise<void> {
  const response = await fetch(`/api/nstep${pathname}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      stepId: request.item.stepId,
      tenantId: request.item.tenantId,
      reason: request.reason,
    }),
  });

  let body: DashboardMutationResponse | undefined;
  try {
    body = (await response.json()) as DashboardMutationResponse;
  } catch {
    body = undefined;
  }

  if (!response.ok) {
    throw new Error(body?.error?.message || `Request failed with status ${response.status}.`);
  }
}

export function approveDashboardApprovalItem(request: DashboardApprovalMutationRequest): Promise<void> {
  return invokeApprovalMutation(`/v1/jobs/${encodeURIComponent(request.item.jobId)}/approve`, request);
}

export function rejectDashboardApprovalItem(request: DashboardApprovalMutationRequest): Promise<void> {
  return invokeApprovalMutation(`/v1/jobs/${encodeURIComponent(request.item.jobId)}/reject`, request);
}
