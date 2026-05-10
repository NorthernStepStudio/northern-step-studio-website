import { GovernanceStatus, RiskSeverity } from "./governance-contracts";

export type IncidentStatus = "OPEN" | "INVESTIGATING" | "MITIGATING" | "MONITORING" | "RESOLVED";

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  type: "detection" | "status_change" | "comment" | "action_taken" | "evidence_added";
  message: string;
  user?: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: RiskSeverity;
  affectedApps: string[];
  createdAt: string;
  status: IncidentStatus;
  timeline: IncidentTimelineEvent[];
  relatedRisks: string[];
  relatedAdvisories: string[];
  relatedSnapshots: string[];
  owner?: string;
  recommendedActions: string[];
}

class IncidentService {
  private incidents: Incident[] = [
    {
      id: "inc-001",
      title: "Core Auth Config Drift",
      severity: "high",
      affectedApps: ["Studio Website", "NexusBuild"],
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: "INVESTIGATING",
      timeline: [
        {
          id: "evt-1",
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          type: "detection",
          message: "Protected file 'auth.ts' drift detected in Studio Website repository."
        },
        {
          id: "evt-2",
          timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
          type: "status_change",
          message: "Incident status changed to INVESTIGATING."
        }
      ],
      relatedRisks: ["risk-drift-1"],
      relatedAdvisories: ["adv-auth-integrity"],
      relatedSnapshots: ["snap-20240509-0800"],
      owner: "System Governance",
      recommendedActions: [
        "Review git diff for auth.ts",
        "Verify if change was an approved manual override",
        "Restore from snapshot if unapproved"
      ]
    },
    {
      id: "inc-002",
      title: "NeuroMoves Build Failure Escalation",
      severity: "critical",
      affectedApps: ["NeuroMoves"],
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      status: "OPEN",
      timeline: [
        {
          id: "evt-3",
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
          type: "detection",
          message: "Third consecutive build failure detected for branch 'main'."
        }
      ],
      relatedRisks: ["risk-build-neuromoves"],
      relatedAdvisories: [],
      relatedSnapshots: [],
      recommendedActions: [
        "Check Synox build logs for redaction errors",
        "Verify local bridge connectivity",
        "Roll back last commit to synox-engine"
      ]
    }
  ];

  async getIncidents(): Promise<Incident[]> {
    return [...this.incidents];
  }

  async getIncidentById(id: string): Promise<Incident | undefined> {
    return this.incidents.find(inc => inc.id === id);
  }

  async getActiveIncidentCount(): Promise<number> {
    return this.incidents.filter(inc => inc.status !== "RESOLVED").length;
  }
}

export const incidentService = new IncidentService();
