import { assertDashboardAccess, readDashboardSessionFromCookies } from "@/lib/auth";
import { GovernanceRoute } from "@/components/dashboard/routes/governance-route";
import { DashboardBackendUnavailable } from "@/components/dashboard/backend-unavailable";
import { loadGovernanceViewModel } from "@/lib/dashboard/view-models/governance-view-model";

export const dynamic = "force-dynamic";

export default async function GovernancePage() {
  const session = assertDashboardAccess(await readDashboardSessionFromCookies(), "/dashboard/governance");
  try {
    const view = await loadGovernanceViewModel();
    return <GovernanceRoute view={view} session={session} />;
  } catch (error) {
    return <DashboardBackendUnavailable area="Governance" error={error} />;
  }
}
