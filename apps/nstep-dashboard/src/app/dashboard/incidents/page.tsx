import { assertDashboardAccess, readDashboardSessionFromCookies } from "@/lib/auth";
import { IncidentsRoute } from "@/components/dashboard/routes/incidents-route";
import { DashboardBackendUnavailable } from "@/components/dashboard/backend-unavailable";
import { loadIncidentsViewModel } from "@/lib/dashboard/view-models/incidents-view-model";

export const dynamic = "force-dynamic";

export default async function IncidentsPage() {
  assertDashboardAccess(await readDashboardSessionFromCookies(), "/dashboard/incidents");
  try {
    const view = await loadIncidentsViewModel();
    return <IncidentsRoute view={view} />;
  } catch (error) {
    return <DashboardBackendUnavailable area="Incidents" error={error} />;
  }
}
