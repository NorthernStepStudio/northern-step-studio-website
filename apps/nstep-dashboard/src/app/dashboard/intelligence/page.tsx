import { assertDashboardAccess, readDashboardSessionFromCookies } from "@/lib/auth";
import { DashboardBackendUnavailable } from "@/components/dashboard/backend-unavailable";
import { IntelligenceRoute } from "@/components/dashboard/routes/intelligence-route";
import { loadIntelligenceViewModel } from "@/lib/dashboard/view-models/intelligence-view-model";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Operational Intelligence | StudioOS",
};

export default async function IntelligencePage() {
  assertDashboardAccess(await readDashboardSessionFromCookies(), "/dashboard/intelligence");
  try {
    const view = await loadIntelligenceViewModel();
    return <IntelligenceRoute view={view} />;
  } catch (error) {
    return <DashboardBackendUnavailable area="Intelligence" error={error} />;
  }
}
