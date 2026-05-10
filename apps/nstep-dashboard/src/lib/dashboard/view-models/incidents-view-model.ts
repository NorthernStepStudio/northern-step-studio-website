import { Incident, incidentService } from "@/lib/studioos/incident-service";
import { formatDateTime } from "@/lib/dashboard/format";
import { StudioSeverity } from "@/lib/studioos/platform-contracts";

export interface IncidentViewModel {
  id: string;
  title: string;
  severity: StudioSeverity;
  status: string;
  affectedApps: string;
  detectedAt: string;
  isHighRisk: boolean;
}

export function buildIncidentsViewModel(incidents: Incident[]): IncidentViewModel[] {
  return incidents.map(inc => ({
    id: inc.id,
    title: inc.title,
    severity: inc.severity as StudioSeverity,
    status: inc.status.toUpperCase(),
    affectedApps: inc.affectedApps.join(", "),
    detectedAt: formatDateTime(inc.createdAt),
    isHighRisk: inc.severity === "critical" || inc.severity === "high"
  }));
}

export async function loadIncidentsViewModel(): Promise<IncidentViewModel[]> {
  const incidents = await incidentService.getIncidents();
  return buildIncidentsViewModel(incidents);
}
