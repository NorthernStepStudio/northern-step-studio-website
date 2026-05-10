import { telemetryService } from "./telemetry-service";
import { verificationEngine } from "./verification-engine";
import { patternAnalysisService } from "./pattern-analysis-service";

export interface ObservabilityAlert {
  id: string;
  system: string;
  issue: string;
  severity: "low" | "medium" | "high" | "critical";
  detectedAt: string;
}

class ObservabilityService {
  private activeAlerts: ObservabilityAlert[] = [];

  async runSystemSelfAudit() {
    console.log("👁️ [Observability] Scanning platform integrity...");
    const alerts: ObservabilityAlert[] = [];

    // Check Intelligence Freshness
    const patterns = patternAnalysisService.getActivePatterns();
    const oldestPattern = patterns.sort((a, b) => a.lastDetected.localeCompare(b.lastDetected))[0];
    if (oldestPattern && (Date.now() - new Date(oldestPattern.lastDetected).getTime() > 86400000)) {
      alerts.push({
        id: "obs-1",
        system: "Intelligence",
        issue: "Stale Pattern Data: Last scan > 24h ago",
        severity: "medium",
        detectedAt: new Date().toISOString()
      });
    }

    // Check Telemetry Congestion
    const metrics = telemetryService.getMetrics();
    if (metrics.length > 900) {
      alerts.push({
        id: "obs-2",
        system: "Telemetry",
        issue: "Metric Buffer Near Capacity",
        severity: "low",
        detectedAt: new Date().toISOString()
      });
    }

    // Check Verification Loop
    const health = telemetryService.getHealthSummary();
    const degraded = health.filter(h => h.status === "degraded");
    if (degraded.length > 0) {
      alerts.push({
        id: "obs-3",
        system: "Services",
        issue: `${degraded.length} services showing high latency`,
        severity: "high",
        detectedAt: new Date().toISOString()
      });
    }

    this.activeAlerts = alerts;
    return alerts;
  }

  getActiveAlerts() {
    return this.activeAlerts;
  }
}

export const observabilityService = new ObservabilityService();
