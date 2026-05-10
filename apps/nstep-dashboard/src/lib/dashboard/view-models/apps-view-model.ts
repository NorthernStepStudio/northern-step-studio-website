import { AppHealthState, appHealthService } from "@/lib/studioos/app-health-service";
import { TimelineEvent, timelineService } from "@/lib/studioos/timeline-service";
import { Incident, incidentService } from "@/lib/studioos/incident-service";
import { OperationalPattern, patternAnalysisService } from "@/lib/studioos/pattern-analysis-service";
import { architectureMapService } from "@/lib/studioos/architecture-map-service";
import { ALL_APPS, APP_REGISTRY, StudioApp } from "@/lib/studioos/app-registry";
import { formatDateTime } from "@/lib/dashboard/format";

export interface AppIndexViewModelEntry {
  id: string;
  displayName: string;
}

export interface SingleAppViewModel {
  app: {
    id: string;
    displayName: string;
    status: string;
    statusTone: "ok" | "warning" | "danger" | "offline";
    healthDetails: string;
    localUrl?: string;
  };
  metrics: {
    latency: string;
    uptime: string;
    errors: number;
  };
  dependencies: Array<{
    id: string;
    displayName: string;
    type: string;
    isCritical: boolean;
  }>;
  timeline: Array<{
    id: string;
    title: string;
    at: string;
    type: string;
    severityTone: string;
  }>;
  intelligence: {
    riskScore: number;
    riskMessage: string;
    patterns: Array<{
      title: string;
      confidence: string;
    }>;
  };
}

type SharedRiskIndicator = {
  appId: string;
  risk: string;
};

type StabilityForecast = {
  appId: string;
  score: number;
  trend: "up" | "down" | "stable";
};

export function buildSingleAppViewModel(
  app: StudioApp,
  health: AppHealthState | undefined,
  timeline: TimelineEvent[],
  incidents: Incident[],
  impact: string[],
  patterns: OperationalPattern[],
  sharedRisks: SharedRiskIndicator[],
  forecasts: StabilityForecast[],
): SingleAppViewModel {
  const status = health?.status || "unknown";
  const appRisk = sharedRisks.find((risk) => risk.appId === app.id);
  const appForecast = forecasts.find((forecast) => forecast.appId === app.id);
  const riskScore = Math.min(
    100,
    incidents.length * 20 + (status === "offline" ? 40 : status === "degraded" ? 20 : status === "unknown" ? 15 : 0),
  );

  return {
    app: {
      id: app.id,
      displayName: app.displayName,
      status: status.toUpperCase(),
      statusTone:
        status === "online"
          ? "ok"
          : status === "degraded"
            ? "warning"
            : status === "offline"
              ? "offline"
              : "warning",
      healthDetails: health?.lastBuild?.status || "Not yet connected",
      localUrl: app.localUrl,
    },
    metrics: {
      latency: status === "online" ? "Pending verification" : "Offline",
      uptime: appForecast ? `${appForecast.score}% (inferred)` : "Pending verification",
      errors: incidents.length,
    },
    dependencies: impact.map(id => ({
      id,
      displayName: APP_REGISTRY[id as keyof typeof APP_REGISTRY]?.displayName || id.toUpperCase(),
      type: "Service",
      isCritical: true
    })),
    timeline: timeline.map(ev => ({
      id: ev.id,
      title: ev.title,
      at: formatDateTime(ev.timestamp),
      type: ev.type,
      severityTone: ev.severity === "critical" ? "danger" : "accent"
    })),
    intelligence: {
      riskScore,
      riskMessage:
        appRisk?.risk ||
        (incidents.length > 0
          ? "Active incidents impacting stability"
          : "No active incidents observed. Pending verification for stability confidence."),
      patterns: patterns.map(p => ({
        title: p.title,
        confidence: `${Math.round(p.confidence * 100)}%`
      }))
    }
  };
}

export async function loadAppsIndexViewModel(): Promise<AppIndexViewModelEntry[]> {
  return ALL_APPS.map((app) => ({
    id: app.id,
    displayName: app.displayName,
  }));
}

export async function loadSingleAppViewModel(appId: string): Promise<SingleAppViewModel | null> {
  const app = APP_REGISTRY[appId as keyof typeof APP_REGISTRY];
  if (!app) return null;

  const [health, timeline, incidents, impact, patterns, sharedRisks, forecasts] = await Promise.all([
    appHealthService.getAppHealth(app),
    timelineService.getAppTimeline(appId),
    incidentService.getIncidents(),
    architectureMapService.getAppDependencies(appId),
    patternAnalysisService.getPatternsForApp(appId),
    Promise.resolve(architectureMapService.getSharedRiskIndicators()),
    Promise.resolve(patternAnalysisService.getStabilityForecast()),
  ]);

  const appIncidents = incidents.filter(inc => 
    inc.affectedApps.includes(app.displayName) || inc.affectedApps.includes(app.id)
  );

  return buildSingleAppViewModel(app, health, timeline, appIncidents, impact, patterns, sharedRisks, forecasts);
}
