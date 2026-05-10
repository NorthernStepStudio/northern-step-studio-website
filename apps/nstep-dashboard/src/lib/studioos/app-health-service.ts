import { ALL_APPS, StudioApp } from "./app-registry";

export type AppHealthStatus = "online" | "offline" | "degraded" | "unknown";
export type BuildStatus = "success" | "failed" | "running" | "stale" | "unknown";
export type DeploymentStatus = "deployed" | "pending" | "failed" | "unknown";

export interface AppHealthState {
  appId: string;
  status: AppHealthStatus;
  localDevStatus: "running" | "stopped" | "unknown";
  lastBuild: {
    status: BuildStatus;
    at?: string;
  };
  deployment: {
    status: DeploymentStatus;
    at?: string;
    target: string;
  };
  repoStatus: "synced" | "out-of-date" | "dirty" | "unknown";
  warnings: string[];
  criticalIssues: string[];
}

async function probeUrl(url: string, timeoutMs = 1200): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
    return response.ok;
  } catch {
    return false;
  }
}

function buildHealthProbeUrl(app: StudioApp): string | null {
  if (app.healthCheckUrl) {
    return app.healthCheckUrl;
  }
  if (!app.localUrl) {
    return null;
  }

  try {
    return new URL("/health", app.localUrl).toString();
  } catch {
    return null;
  }
}

export class AppHealthService {
  async getAppHealth(app: StudioApp): Promise<AppHealthState> {
    let status: AppHealthStatus = "unknown";
    let localDevStatus: "running" | "stopped" | "unknown" = "unknown";
    const warnings: string[] = [];
    const criticalIssues: string[] = [];

    const healthUrl = buildHealthProbeUrl(app);
    if (healthUrl) {
      const reachable = await probeUrl(healthUrl);
      if (reachable) {
        status = "online";
        localDevStatus = "running";
      } else {
        status = "offline";
        localDevStatus = "stopped";
        warnings.push("Health probe did not respond.");
        if (app.priority <= 2) {
          criticalIssues.push("Critical app is offline.");
        }
      }
    } else if (app.localUrl || app.productionUrl) {
      warnings.push("No health check endpoint configured.");
    }

    return {
      appId: app.id,
      status,
      localDevStatus,
      lastBuild: {
        status: "unknown",
      },
      deployment: {
        status: "unknown",
        target: app.deployTarget,
      },
      repoStatus: "unknown",
      warnings,
      criticalIssues,
    };
  }

  async getAllAppHealth(): Promise<AppHealthState[]> {
    return Promise.all(ALL_APPS.map(app => this.getAppHealth(app)));
  }

  async getSystemHealth() {
    const synoxHealthUrl = process.env.NSTEP_DASHBOARD_SYNOX_HEALTH_URL?.trim() || "http://127.0.0.1:4000/health";
    const matterhornHealthUrl =
      process.env.NSTEP_DASHBOARD_MATTERHORN_HEALTH_URL?.trim() || "http://127.0.0.1:3010/health";
    const [synoxConnected, matterhornOnline] = await Promise.all([
      probeUrl(synoxHealthUrl),
      probeUrl(matterhornHealthUrl),
    ]);

    return {
      dashboardBackend: { online: false, status: "unknown" as const },
      synoxBridge: { connected: synoxConnected, status: synoxConnected ? ("online" as const) : ("offline" as const) },
      matterhorn: { online: matterhornOnline, provider: matterhornOnline ? "Connected" : "Offline", model: matterhornOnline ? "Bridge detected" : "Not yet connected" },
      environment: process.env.NODE_ENV || "development",
      authMode: "existing-admin-session",
    };
  }
}

export const appHealthService = new AppHealthService();
