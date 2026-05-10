import { assertDashboardAccess, readDashboardSessionFromCookies } from "@/lib/auth";
import { RiskRegisterRoute } from "@/components/dashboard/routes/risk-register-route";
import { DashboardBackendUnavailable } from "@/components/dashboard/backend-unavailable";
import { loadRiskRegisterViewModel } from "@/lib/dashboard/view-models/risk-register-view-model";

export const dynamic = "force-dynamic";

export default async function RiskRegisterPage() {
  const session = assertDashboardAccess(await readDashboardSessionFromCookies(), "/dashboard/risk-register");
  try {
    const view = await loadRiskRegisterViewModel();
    return <RiskRegisterRoute view={view} session={session} />;
  } catch (error) {
    return <DashboardBackendUnavailable area="Risk Register" error={error} />;
  }
}
