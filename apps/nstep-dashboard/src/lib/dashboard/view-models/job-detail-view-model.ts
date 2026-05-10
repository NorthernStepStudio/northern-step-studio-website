import type { DashboardJobDetailResponse, DashboardMetric } from "@/lib/dashboard/contracts";

export function buildDashboardJobDetailTimelineMetrics(job: DashboardJobDetailResponse): readonly DashboardMetric[] {
  return [
    { label: "Steps", value: job.job.stepCount, detail: "Total plan steps.", tone: "accent" },
    { label: "Completed", value: job.job.completedStepCount, detail: "Steps already finished.", tone: "success" },
    { label: "Waiting", value: job.job.waitingApprovalStepCount, detail: "Steps paused for review.", tone: "warning" },
    { label: "Failed", value: job.job.failedStepCount, detail: "Steps that failed.", tone: "danger" },
    { label: "Retries", value: job.job.retryableStepCount, detail: "Retryable steps.", tone: "accent" },
  ];
}

