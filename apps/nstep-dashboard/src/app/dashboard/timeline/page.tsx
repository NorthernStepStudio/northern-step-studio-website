import { assertDashboardAccess, readDashboardSessionFromCookies } from "@/lib/auth";
import { TimelineRoute } from "@/components/dashboard/routes/timeline-route";
import { DashboardBackendUnavailable } from "@/components/dashboard/backend-unavailable";
import { loadTimelineViewModel } from "@/lib/dashboard/view-models/timeline-view-model";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  assertDashboardAccess(await readDashboardSessionFromCookies(), "/dashboard/timeline");
  try {
    const view = await loadTimelineViewModel();
    return <TimelineRoute view={view} />;
  } catch (error) {
    return <DashboardBackendUnavailable area="Timeline" error={error} />;
  }
}
