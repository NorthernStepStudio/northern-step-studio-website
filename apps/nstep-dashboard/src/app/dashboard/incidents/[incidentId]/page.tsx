import { assertDashboardAccess, readDashboardSessionFromCookies } from "@/lib/auth";
import { loadIncidentDetailViewModel } from "@/lib/dashboard/view-models/incident-detail-view-model";
import { IncidentDetailRoute } from "@/components/dashboard/routes/incident-detail-route";
import { DashboardBackendUnavailable } from "@/components/dashboard/backend-unavailable";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function IncidentDetailPage({
  params,
}: {
  readonly params: Promise<{ readonly incidentId: string }> | { readonly incidentId: string };
}) {
  const { incidentId } = await Promise.resolve(params);
  assertDashboardAccess(await readDashboardSessionFromCookies(), `/dashboard/incidents/${incidentId}`);

  try {
    const view = await loadIncidentDetailViewModel(incidentId);

    if (!view) {
      notFound();
    }

    return <IncidentDetailRoute view={view} />;
  } catch (error) {
    return <DashboardBackendUnavailable area="Incident Detail" error={error} />;
  }
}
