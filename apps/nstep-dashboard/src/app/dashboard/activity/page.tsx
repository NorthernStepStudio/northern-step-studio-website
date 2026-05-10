import { assertDashboardAccess, readDashboardSessionFromCookies } from "@/lib/auth";
import { getDashboardActivity, getDashboardProvLyPanel } from "@/lib/dashboard/api";
import { DashboardActivityRoute } from "@/components/dashboard/routes/activity-route";
import { parseDashboardQuery, type DashboardSearchParamsInput } from "@/lib/dashboard/query";
import { DashboardBackendUnavailable } from "@/components/dashboard/backend-unavailable";
import { enrichActivityWithRegistry } from "@/lib/dashboard/view-models/activity-view-model";

export const dynamic = "force-dynamic";

export default async function ActivityPage({
  searchParams,
}: {
  readonly searchParams?: DashboardSearchParamsInput;
}) {
  assertDashboardAccess(await readDashboardSessionFromCookies(), "/dashboard/activity");
  const query = await parseDashboardQuery(searchParams);
  try {
    const [activity, provlyPanel] = await Promise.all([getDashboardActivity(query), getDashboardProvLyPanel(query)]);
    const enrichedActivity = enrichActivityWithRegistry(activity);
    return <DashboardActivityRoute activity={enrichedActivity} provlyPanel={provlyPanel} query={query} />;
  } catch (error) {
    return <DashboardBackendUnavailable area="Activity" error={error} />;
  }
}
