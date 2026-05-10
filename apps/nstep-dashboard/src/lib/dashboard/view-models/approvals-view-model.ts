import type { DashboardApprovalQueueResponse, DashboardMetric } from "@/lib/dashboard/contracts";

export const DASHBOARD_APPROVAL_WORKFLOW_OPTIONS: readonly { value: string; label: string }[] = [
  { value: "", label: "All workflows" },
  { value: "lead-recovery", label: "Lead recovery" },
  { value: "nexusbuild", label: "NexusBuild" },
  { value: "provly", label: "ProvLy" },
  { value: "neurormoves", label: "NeuroMoves" },
  { value: "synox", label: "Synox Engine" },
  { value: "matterhorn", label: "Matterhorn Assistant" },
  { value: "website", label: "Studio Website" },
  { value: "buildcenter", label: "Build Center" },
  { value: "roguelike", label: "Roguelike / Doomed" },
];

export const DASHBOARD_APPROVAL_STATUS_FILTER_OPTIONS: readonly { value: string; label: string }[] = [
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

export const DASHBOARD_APPROVAL_PAGE_SIZE_OPTIONS: readonly { value: string; label: string }[] = [
  { value: "10", label: "10" },
  { value: "20", label: "20" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
];

export function buildDashboardApprovalsMetrics(approvals: DashboardApprovalQueueResponse): readonly DashboardMetric[] {
  return [
    { label: "Total", value: approvals.summary.total, detail: "Items waiting on review.", tone: "accent" },
    { label: "High risk", value: approvals.summary.highRisk, detail: "Requires operator judgment.", tone: "danger" },
    { label: "Medium risk", value: approvals.summary.mediumRisk, detail: "Needs a quick review.", tone: "warning" },
    { label: "Low risk", value: approvals.summary.lowRisk, detail: "Safe but visible.", tone: "success" },
  ];
}

