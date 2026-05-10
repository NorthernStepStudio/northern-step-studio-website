import { assertDashboardAccess, readDashboardSessionFromCookies } from "@/lib/auth";
import { SnapshotsRoute } from "@/components/dashboard/routes/snapshots-route";
import { DashboardBackendUnavailable } from "@/components/dashboard/backend-unavailable";
import { loadSnapshotsViewModel } from "@/lib/dashboard/view-models/snapshots-view-model";

export const dynamic = "force-dynamic";

export default async function SnapshotsPage() {
  const session = assertDashboardAccess(await readDashboardSessionFromCookies(), "/dashboard/snapshots");
  try {
    const snapshots = await loadSnapshotsViewModel();
    return <SnapshotsRoute snapshots={snapshots} session={session} />;
  } catch (error) {
    return <DashboardBackendUnavailable area="Snapshots" error={error} />;
  }
}
