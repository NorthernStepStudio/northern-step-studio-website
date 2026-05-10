import { assertDashboardAccess, readDashboardSessionFromCookies } from "@/lib/auth";
import { DashboardBackendUnavailable } from "@/components/dashboard/backend-unavailable";
import { MemoryRoute } from "@/components/dashboard/routes/memory-route";
import { loadMemoryViewModel } from "@/lib/dashboard/view-models/memory-view-model";

export const dynamic = "force-dynamic";

export default async function MemoryPage() {
  assertDashboardAccess(await readDashboardSessionFromCookies(), "/dashboard/memory");
  try {
    const view = await loadMemoryViewModel();
    return <MemoryRoute memories={view.entries} />;
  } catch (error) {
    return <DashboardBackendUnavailable area="Memory" error={error} />;
  }
}
