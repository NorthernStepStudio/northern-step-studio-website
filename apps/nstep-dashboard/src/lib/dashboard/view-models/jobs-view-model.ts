import type { DashboardJobListResponse, DashboardMetric } from "@/lib/dashboard/contracts";

export function buildDashboardJobsMetrics(jobs: DashboardJobListResponse): readonly DashboardMetric[] {
  return [
    { label: "Total", value: jobs.summary.total, detail: "All visible job runs.", tone: "accent" },
    { label: "Running", value: jobs.summary.running, detail: "Jobs currently in progress.", tone: "warning" },
    { label: "Waiting approval", value: jobs.summary.waitingApproval, detail: "Jobs paused for review.", tone: "warning" },
    { label: "Completed", value: jobs.summary.completed, detail: "Finished successfully.", tone: "success" },
    { label: "Failed", value: jobs.summary.failed, detail: "Jobs needing attention.", tone: "danger" },
  ];
}

