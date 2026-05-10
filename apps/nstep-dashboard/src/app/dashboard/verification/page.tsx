import { assertDashboardAccess, readDashboardSessionFromCookies } from "@/lib/auth";
import { VerificationRoute } from "@/components/dashboard/routes/verification-route";
import { DashboardBackendUnavailable } from "@/components/dashboard/backend-unavailable";
import { loadVerificationViewModel } from "@/lib/dashboard/view-models/verification-view-model";

export const dynamic = "force-dynamic";

export default async function VerificationPage() {
  const session = assertDashboardAccess(await readDashboardSessionFromCookies(), "/dashboard/verification");
  try {
    const view = await loadVerificationViewModel();
    return <VerificationRoute view={view} session={session} />;
  } catch (error) {
    return <DashboardBackendUnavailable area="Verification" error={error} />;
  }
}
