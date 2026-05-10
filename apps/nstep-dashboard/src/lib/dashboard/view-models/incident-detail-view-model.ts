import { incidentService } from "@/lib/studioos/incident-service";
import { formatDateTime } from "@/lib/dashboard/format";

export interface IncidentDetailViewModel {
  incident: {
    id: string;
    title: string;
    severity: string;
    severityTone: "danger" | "warning";
    status: string;
    statusTone: "ok" | "info";
    affectedApps: string;
    at: string;
    timeline: Array<{
      title: string;
      message: string;
      at: string;
    }>;
    recommendations: string[];
  };
}

function formatTimelineEventTitle(eventType: string): string {
  return eventType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function loadIncidentDetailViewModel(incidentId: string): Promise<IncidentDetailViewModel | null> {
  const incident = await incidentService.getIncidentById(incidentId);
  if (!incident) return null;

  return {
    incident: {
      id: incident.id,
      title: incident.title,
      severity: incident.severity.toUpperCase(),
      severityTone: incident.severity === 'critical' || incident.severity === 'high' ? 'danger' : 'warning',
      status: incident.status,
      statusTone: incident.status === 'RESOLVED' ? 'ok' : 'info',
      affectedApps: incident.affectedApps.join(", "),
      at: formatDateTime(incident.createdAt),
      timeline: incident.timeline.map((ev) => ({
        title: formatTimelineEventTitle(ev.type),
        message: ev.message,
        at: formatDateTime(ev.timestamp)
      })),
      recommendations: incident.recommendedActions
    }
  };
}
