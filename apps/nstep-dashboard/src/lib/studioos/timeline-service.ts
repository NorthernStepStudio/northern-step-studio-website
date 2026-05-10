export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: "deployment" | "verification" | "advisory" | "failure" | "snapshot" | "drift" | "violation" | "approval" | "incident_update" | "execution";
  title: string;
  message: string;
  appId?: string;
  severity?: "low" | "medium" | "high" | "critical";
  link?: string;
  relatedEventIds?: string[];
  correlationType?: "causal" | "temporal" | "structural";
}

class TimelineService {
  private events: TimelineEvent[] = [
    {
      id: "ev-004",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      type: "execution",
      appId: "synox",
      title: "Snapshot Created",
      message: "Approved snapshot workflow 'wf-001' completed successfully.",
      severity: "low"
    },
    {
      id: "ev-1",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      type: "verification",
      title: "Routine Verification Pass",
      message: "Governance and AI safety verification completed successfully.",
      severity: "low"
    },
    {
      id: "ev-2",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      type: "drift",
      title: "Protected File Drift",
      message: "Drift detected in wrangler.toml for Synox Engine.",
      appId: "synox",
      severity: "medium",
      link: "/dashboard/governance"
    },
    {
      id: "ev-3",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: "deployment",
      title: "NexusBuild Production Deployment",
      message: "Successfully deployed version 1.4.2 to Cloudflare.",
      appId: "nexusbuild",
      severity: "low"
    },
    {
      id: "ev-4",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      type: "failure",
      title: "NeuroMoves Build Error",
      message: "Build #4052 failed during signing phase.",
      appId: "neurormoves",
      severity: "high",
      relatedEventIds: ["ev-2"],
      correlationType: "causal"
    }
  ];

  async getTimeline(limit = 20): Promise<TimelineEvent[]> {
    return this.events.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit);
  }

  async getAppTimeline(appId: string): Promise<TimelineEvent[]> {
    return this.events.filter(e => e.appId === appId).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }
}

export const timelineService = new TimelineService();
