export interface OperationalPattern {
  id: string;
  type: "recurring_failure" | "stability_trend" | "bottleneck" | "risk_cluster";
  title: string;
  description: string;
  confidence: number;
  severity: "low" | "medium" | "high";
  affectedApps: string[];
  historicalCount: number;
  lastDetected: string;
}

class PatternAnalysisService {
  private patterns: OperationalPattern[] = [];

  constructor() {
    this.initializeMockPatterns();
  }

  private initializeMockPatterns() {
    this.patterns = [
      {
        id: "pat-001",
        type: "recurring_failure",
        title: "Bridge Timeout Chain",
        description: "Synox Bridge timeout frequently causes cascaded failures in NexusBuild and NeuroMoves.",
        confidence: 0.85,
        severity: "high",
        affectedApps: ["synox", "nexusbuild", "neurormoves"],
        historicalCount: 12,
        lastDetected: new Date().toISOString()
      },
      {
        id: "pat-002",
        type: "stability_trend",
        title: "Post-Snapshot Stability",
        description: "Systems show 40% higher stability in the 24h following a full repository snapshot.",
        confidence: 0.92,
        severity: "low",
        affectedApps: ["ALL"],
        historicalCount: 8,
        lastDetected: new Date().toISOString()
      },
      {
        id: "pat-003",
        type: "bottleneck",
        title: "Manual Approval Latency",
        description: "Deployment workflows for 'website' are delayed on average by 4.2 hours due to manual approval wait times.",
        confidence: 0.78,
        severity: "medium",
        affectedApps: ["website"],
        historicalCount: 15,
        lastDetected: new Date().toISOString()
      }
    ];
  }

  public getActivePatterns(): OperationalPattern[] {
    return this.patterns;
  }

  public getPatternsForApp(appId: string): OperationalPattern[] {
    return this.patterns.filter(p => p.affectedApps.includes(appId) || p.affectedApps.includes("ALL"));
  }

  public getStabilityForecast(): { appId: string; score: number; trend: "up" | "down" | "stable" }[] {
    // Mock forecasting logic
    return [
      { appId: "nexusbuild", score: 85, trend: "up" },
      { appId: "neurormoves", score: 62, trend: "down" },
      { appId: "synox", score: 95, trend: "stable" }
    ];
  }
}

export const patternAnalysisService = new PatternAnalysisService();
