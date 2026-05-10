import type { DashboardSession } from "@/lib/auth-types";
import type { DashboardAlert, DashboardApprovalQueueItem, DashboardMetric, DashboardOverviewResponse, ProductKey } from "@/lib/dashboard/contracts";
import { formatStatusLabel } from "@/lib/dashboard/format";
import { ALL_APPS, APP_REGISTRY } from "@/lib/studioos/app-registry";
import { appHealthService, AppHealthState } from "@/lib/studioos/app-health-service";
import { getDashboardWorkspaceOverview } from "@/lib/dashboard/api";
import { governanceService } from "@/lib/studioos/governance-service";
import { timelineService } from "@/lib/studioos/timeline-service";

export type DashboardOverviewHealthState = {
  readonly label: string;
  readonly detail: string;
  readonly tone: "healthy" | "watch" | "critical";
  readonly glyph: string;
};

export type DashboardOverviewKpiCard = {
  readonly label: string;
  readonly value: string;
  readonly tone: "neutral" | "warning" | "danger";
};

export type DashboardOverviewViewModel = {
  readonly health: DashboardOverviewHealthState;
  readonly kpis: readonly DashboardOverviewKpiCard[];
  readonly approvalQueue: readonly DashboardApprovalQueueItem[];
  readonly topSignals: readonly DashboardAlert[];
  readonly highRisks: number;
  readonly completionRatio: number;
  readonly matterhornCallout: string;
  readonly matterhornStats: {
    readonly waitingApproval: number;
    readonly failed: number;
    readonly alerts: number;
    readonly riskLevel: "High" | "Low";
  };
  readonly connectedApps: readonly {
    readonly id: string;
    readonly displayName: string;
    readonly status: string;
    readonly localDev: string;
    readonly type: string;
  }[];
  readonly liveActivity: readonly {
    readonly id: string;
    readonly event: string;
    readonly at: string;
    readonly type: "info" | "warning" | "success" | "error";
  }[];
  readonly governanceMetrics: readonly {
    readonly label: string;
    readonly value: string;
    readonly status: "pass" | "warn" | "fail";
  }[];
  readonly verificationMetrics: readonly {
    readonly label: string;
    readonly value: string;
    readonly status: "pass" | "warn" | "fail";
  }[];
  readonly footer: {
    readonly displayName: string;
    readonly tenantId: string;
  };
  readonly governance: {
    readonly score: number;
    readonly riskCount: number;
    readonly deploymentReady: "READY" | "WARNING" | "BLOCKED";
    readonly protectedFilesIntact: boolean;
  };
  readonly escalations: readonly {
    readonly id: string;
    readonly message: string;
    readonly severity: string;
  }[];
  readonly incidents: readonly {
    readonly id: string;
    readonly title: string;
    readonly status: string;
    readonly severity: string;
  }[];
  readonly timelineEvents: readonly {
    readonly id: string;
    readonly type: string;
    readonly title: string;
    readonly timestamp: string;
    readonly severity?: string;
  }[];
};

type OverviewEscalation = {
  id: string;
  message: string;
  severity: string;
};

type OverviewIncident = {
  id: string;
  title: string;
  status: string;
  severity: string;
};

type OverviewTimelineEvent = {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  severity?: string;
};

export function isHighRiskLevel(value: string): boolean {
  const normalized = value.toLowerCase();
  return normalized.includes("critical") || normalized.includes("high") || normalized === "red";
}

export function formatOverviewSeverity(value: string): string {
  const label = formatStatusLabel(value);
  if (!label) {
    return "MEDIUM";
  }

  return label.toUpperCase();
}

export function getApprovalConfidence(item: DashboardApprovalQueueItem): string {
  const candidate = item.preview.data.confidence;
  if (typeof candidate === "number" && Number.isFinite(candidate)) {
    return candidate.toFixed(2);
  }

  if (typeof candidate === "string" && candidate.trim().length > 0) {
    return candidate;
  }

  return "0.80";
}

export function getSignalTone(alert: DashboardAlert): "danger" | "warning" | "ok" {
  if (alert.level === "critical") {
    return "danger";
  }

  if (alert.level === "warning") {
    return "warning";
  }

  return "ok";
}

function getHealthState(overview: DashboardOverviewResponse): DashboardOverviewHealthState {
  const failedJobs = overview.activity.summary.failed;
  const criticalAlerts = overview.alerts.filter((alert) => alert.level === "critical").length;
  const highRiskApprovals = overview.recentApprovals.filter((item) => isHighRiskLevel(item.riskLevel)).length;

  if (failedJobs > 0 || criticalAlerts > 0 || highRiskApprovals > 0) {
    return {
      label: "Critical",
      detail: "High-impact blockers detected. Manual review and governance checks are required.",
      tone: "critical",
      glyph: "!",
    };
  }

  const warningAlerts = overview.alerts.filter((alert) => alert.level === "warning").length;
  if (warningAlerts > 0 || overview.activity.summary.waitingApproval > 0) {
    return {
      label: "Watch",
      detail: "Systems are stable with pending reviews. Continue verification and queue triage.",
      tone: "watch",
      glyph: "~",
    };
  }

  return {
    label: "Healthy",
    detail: "All major systems are operating within expected governance and validation thresholds.",
    tone: "healthy",
    glyph: "OK",
  };
}

function computeCompletionRatio(summary: DashboardOverviewResponse["activity"]["summary"]): number {
  const total = summary.completed24h + summary.failed24h;
  return total === 0 ? 1 : summary.completed24h / total;
}

export function buildDashboardOverviewViewModel(
  overview: DashboardOverviewResponse,
  appHealth: AppHealthState[],
  governance: {
    score: number;
    riskCount: number;
    deploymentReady: "READY" | "WARNING" | "BLOCKED";
    protectedFilesIntact: boolean;
    governanceMetrics: { label: string; value: string; status: "pass" | "warn" | "fail" }[];
    verificationMetrics: { label: string; value: string; status: "pass" | "warn" | "fail" }[];
    incidents?: OverviewIncident[];
    escalations?: OverviewEscalation[];
  },
  timelineEvents: OverviewTimelineEvent[],
  session?: DashboardSession | null,
): DashboardOverviewViewModel {
  const highRisksBase = overview.recentApprovals.filter((item) => isHighRiskLevel(item.riskLevel)).length;
  
  // Synthesize actions from app health
  const synthesizedActions: DashboardApprovalQueueItem[] = [];
  appHealth.forEach((health) => {
    const app = APP_REGISTRY[health.appId];
    if (health.status === "offline" && app && app.priority <= 2) {
      synthesizedActions.push({
        jobId: `health-${health.appId}`,
        tenantId: session?.tenantId ?? "studio",
        product: health.appId as ProductKey,
        workflow: "system-health",
        goal: `Restore ${app.displayName}`,
        priority: "high",
        mode: "advisory",
        status: "failed",
        approvalStatus: "waiting",
        riskLevel: "critical",
        lane: "recovery",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stepId: "restore-service",
        stepType: "manual-intervention",
        stepTitle: `Critical: ${app.displayName} is Offline`,
        tool: "health-service",
        reason: `${app.displayName} (${app.id}) is currently unreachable. This blocks production deployment flow.`,
        preview: {
          title: "Service Recovery",
          body: `The service at ${app.localUrl || app.repoPath} is not responding. Manual restart required.`,
          tool: "manual",
          stepId: "restore",
          stepType: "intervention",
          actionLabel: "Mark Resolved",
          data: { confidence: 1.0 }
        },
        auditTrail: [],
        canApprove: true,
        canReject: false,
        canEdit: false,
        retryable: true,
        stepCount: 1,
        completedStepCount: 0,
        waitingApprovalStepCount: 1,
        failedStepCount: 0,
        retryableStepCount: 0,
        tags: ["outage", "system"]
      });
    }
  });

  const mergedQueue = [...synthesizedActions, ...overview.recentApprovals];
  const highRisks = highRisksBase + synthesizedActions.length;
  const completionRatio = computeCompletionRatio(overview.activity.summary);

  const kpis: readonly DashboardOverviewKpiCard[] = [
    { label: "Active Projects", value: String(ALL_APPS.length), tone: "neutral" },
    {
      label: "Failed Builds",
      value: String(overview.activity.summary.failed),
      tone: overview.activity.summary.failed > 0 ? "danger" : "neutral",
    },
    { label: "High Risks", value: String(highRisks), tone: highRisks > 0 ? "warning" : "neutral" },
    { label: "Deployments Today", value: String(overview.activity.summary.completed24h), tone: "neutral" },
    {
      label: "Open TODOs",
      value: String(mergedQueue.length + overview.alerts.length),
      tone: mergedQueue.length + overview.alerts.length > 0 ? "warning" : "neutral",
    },
  ];

  const connectedApps = ALL_APPS.map(app => {
    const health = appHealth.find(h => h.appId === app.id);
    return {
      id: app.id,
      displayName: app.displayName,
      status: health?.status ?? "unknown",
      localDev: health?.localDevStatus ?? "unknown",
      type: app.type,
    };
  });

  const liveActivity = [
    { id: "1", event: "Repo snapshot updated for NexusBuild", at: new Date().toISOString(), type: "info" as const },
    { id: "2", event: "Matterhorn advisory generated for lead recovery", at: new Date().toISOString(), type: "success" as const },
    { id: "3", event: "Build verification completed for NeuroMoves", at: new Date().toISOString(), type: "success" as const },
    { id: "4", event: "Deployment warning detected in Synox Engine", at: new Date().toISOString(), type: "warning" as const },
    { id: "5", event: "Verification failure in website production lane", at: new Date().toISOString(), type: "error" as const },
  ];

  const governanceMetrics = governance.governanceMetrics;
  const verificationMetrics = governance.verificationMetrics;

  return {
    health: getHealthState(overview),
    kpis,
    approvalQueue: mergedQueue.slice(0, 3),
    topSignals: overview.alerts.slice(0, 3),
    highRisks,
    completionRatio,
    matterhornCallout: mergedQueue[0]?.stepTitle ?? "No immediate escalations in the approval queue.",
    matterhornStats: {
      waitingApproval: mergedQueue.length,
      failed: overview.activity.summary.failed,
      alerts: overview.alerts.length,
      riskLevel: highRisks > 0 ? "High" : "Low",
    },
    connectedApps,
    liveActivity,
    governanceMetrics,
    verificationMetrics,
    governance: {
      score: governance.score,
      riskCount: governance.riskCount,
      deploymentReady: governance.deploymentReady,
      protectedFilesIntact: governance.protectedFilesIntact,
    },
    escalations: (governance.escalations || []).map((esc) => ({
      id: esc.id,
      message: esc.message,
      severity: esc.severity,
    })),
    incidents: (governance.incidents || []).map((inc) => ({
      id: inc.id,
      title: inc.title,
      status: inc.status,
      severity: inc.severity,
    })),
    timelineEvents: (timelineEvents || []).map((ev) => ({
      id: ev.id,
      type: ev.type,
      title: ev.title,
      timestamp: ev.timestamp,
      severity: ev.severity,
    })),
    footer: {
      displayName: session?.displayName ?? "admin",
      tenantId: session?.tenantId ?? "studio",
    },
  };
}

export function buildDashboardOverviewActivityMetrics(overview: DashboardOverviewResponse): readonly DashboardMetric[] {
  return [
    {
      label: "Completed 24h",
      value: overview.activity.summary.completed24h,
      detail: "Successful runs in the last day.",
      tone: "success",
    },
    {
      label: "Failed 24h",
      value: overview.activity.summary.failed24h,
      detail: "Failures in the last day.",
      tone: "danger",
    },
    {
      label: "Active jobs",
      value: overview.activity.summary.totalActiveJobs,
      detail: "Jobs currently in flight.",
      tone: "accent",
    },
  ];
}

export async function loadDashboardOverviewViewModel(session?: DashboardSession | null): Promise<DashboardOverviewViewModel> {
  const [overview, appHealth, governance, timeline] = await Promise.all([
    getDashboardWorkspaceOverview(),
    appHealthService.getAllAppHealth(),
    governanceService.getOverviewSummary(),
    timelineService.getTimeline(10),
  ]);

  return buildDashboardOverviewViewModel(overview, appHealth, governance, timeline, session);
}

export function buildOfflineDashboardOverviewViewModel(session?: DashboardSession | null): DashboardOverviewViewModel {
  const now = new Date().toISOString();

  return {
    health: {
      label: "Watch",
      detail: "Backend is offline. Displaying local-only executive shell with safe offline status.",
      tone: "watch",
      glyph: "~",
    },
    kpis: [
      { label: "Active Projects", value: String(ALL_APPS.length), tone: "neutral" },
      { label: "Failed Builds", value: "0", tone: "neutral" },
      { label: "High Risks", value: "0", tone: "neutral" },
      { label: "Deployments Today", value: "0", tone: "neutral" },
      { label: "Open TODOs", value: "0", tone: "neutral" },
    ],
    approvalQueue: [],
    topSignals: [
      {
        id: "backend-offline",
        level: "warning",
        title: "Backend offline",
        message: "StudioOS backend is not yet connected.",
        createdAt: now,
        metadata: {},
      },
    ],
    highRisks: 0,
    completionRatio: 0,
    matterhornCallout: "No immediate escalations in the approval queue.",
    matterhornStats: {
      waitingApproval: 0,
      failed: 0,
      alerts: 1,
      riskLevel: "Low",
    },
    connectedApps: ALL_APPS.map((app) => ({
      id: app.id,
      displayName: app.displayName,
      status: "unknown",
      localDev: "unknown",
      type: app.type,
    })),
    liveActivity: [
      {
        id: "offline-1",
        event: "Backend not yet connected",
        at: now,
        type: "warning",
      },
    ],
    governanceMetrics: [
      { label: "Snapshot Integrity", value: "Unknown", status: "warn" },
      { label: "Verification Status", value: "Pending verification", status: "warn" },
      { label: "Eval Quality", value: "Not yet connected", status: "warn" },
      { label: "Safety Compliance", value: "Pending verification", status: "warn" },
    ],
    verificationMetrics: [
      { label: "Repo Integrity", value: "Offline", status: "warn" },
      { label: "Runtime", value: "Offline", status: "warn" },
      { label: "Auth", value: "Pending verification", status: "warn" },
      { label: "Deployment", value: "Pending verification", status: "warn" },
    ],
    footer: {
      displayName: session?.displayName ?? "admin",
      tenantId: session?.tenantId ?? "default",
    },
    governance: {
      score: 0,
      riskCount: 0,
      deploymentReady: "WARNING",
      protectedFilesIntact: true,
    },
    escalations: [],
    incidents: [],
    timelineEvents: [],
  };
}
