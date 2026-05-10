import type { DashboardMetric, DashboardWorkflowActivityResponse, DashboardWorkflowActivityProductItem, ProductKey } from "@/lib/dashboard/contracts";
import { ALL_APPS } from "@/lib/studioos/app-registry";

export function buildDashboardActivityMetrics(activity: DashboardWorkflowActivityResponse): readonly DashboardMetric[] {
  return [
    { label: "Active jobs", value: activity.summary.totalActiveJobs, detail: "Currently in flight.", tone: "accent" },
    { label: "Waiting approval", value: activity.summary.waitingApproval, detail: "Paused for review.", tone: "warning" },
    { label: "Failed", value: activity.summary.failed, detail: "Needs operator attention.", tone: "danger" },
    { label: "Completed 24h", value: activity.summary.completed24h, detail: "Successful runs in the last day.", tone: "success" },
    { label: "Failed 24h", value: activity.summary.failed24h, detail: "Failures in the last day.", tone: "danger" },
  ];
}

export function enrichActivityWithRegistry(activity: DashboardWorkflowActivityResponse): DashboardWorkflowActivityResponse {
  const products: DashboardWorkflowActivityProductItem[] = [...activity.products];
  
  ALL_APPS.forEach((app) => {
    if (!products.some((p) => p.product === app.id)) {
      products.push({
        product: app.id as ProductKey,
        title: app.displayName,
        activeJobs: 0,
        runningJobs: 0,
        waitingApprovalJobs: 0,
        failedJobs: 0,
        completedJobs24h: 0,
        failedJobs24h: 0,
        laneBreakdown: {},
        recentJobs: [],
        recentCompletedRuns: [],
        recentFailedRuns: [],
        recurringJobs: [],
        alerts: [],
        lastActivityAt: undefined
      });
    }
  });

  return {
    ...activity,
    products: products.sort((a, b) => {
      const appA = ALL_APPS.find((app) => app.id === a.product);
      const appB = ALL_APPS.find((app) => app.id === b.product);
      return (appA?.priority ?? 99) - (appB?.priority ?? 99);
    })
  };
}
