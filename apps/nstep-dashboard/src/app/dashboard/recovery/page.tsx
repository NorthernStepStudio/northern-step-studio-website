import { assertDashboardAccess, readDashboardSessionFromCookies } from "@/lib/auth";
import { RecoveryRoute } from "@/components/dashboard/routes/recovery-route";
import { DashboardBackendUnavailable } from "@/components/dashboard/backend-unavailable";
import { loadRecoveryViewModel } from "@/lib/dashboard/view-models/recovery-view-model";

export const dynamic = "force-dynamic";

export default async function RecoveryPage() {
  assertDashboardAccess(await readDashboardSessionFromCookies(), "/dashboard/recovery");
  try {
    const view = await loadRecoveryViewModel("studio");
    return <RecoveryRoute view={view} />;
  } catch (error) {
    return <DashboardBackendUnavailable area="Recovery" error={error} />;
  }
}
