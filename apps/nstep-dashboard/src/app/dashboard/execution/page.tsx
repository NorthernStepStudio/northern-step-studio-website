import { assertDashboardAccess, readDashboardSessionFromCookies } from "@/lib/auth";
import { ExecutionRoute } from "@/components/dashboard/routes/execution-route";
import { DashboardBackendUnavailable } from "@/components/dashboard/backend-unavailable";
import { loadExecutionViewModel } from "@/lib/dashboard/view-models/execution-view-model";

export const dynamic = "force-dynamic";

export default async function ExecutionPage() {
  assertDashboardAccess(await readDashboardSessionFromCookies(), "/dashboard/execution");
  try {
    const view = await loadExecutionViewModel();
    return <ExecutionRoute view={view} />;
  } catch (error) {
    return <DashboardBackendUnavailable area="Execution" error={error} />;
  }
}
