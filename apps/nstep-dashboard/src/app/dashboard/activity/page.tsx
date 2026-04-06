import { assertDashboardAccess, readDashboardSessionFromCookies } from "@/lib/auth";
import { getDashboardActivity, getDashboardProvLyPanel } from "@/lib/dashboard/api";
import { DashboardActivityRoute } from "@/components/dashboard/routes/activity-route";
import { parseDashboardQuery, type DashboardSearchParamsInput } from "@/lib/dashboard/query";

export const dynamic = "force-dynamic";

export default async function ActivityPage({
  searchParams,
}: {
  readonly searchParams?: DashboardSearchParamsInput;
}) {
  assertDashboardAccess(await readDashboardSessionFromCookies(), "/dashboard/activity");
  const query = await parseDashboardQuery(searchParams);
  const [activity, provlyPanel] = await Promise.all([getDashboardActivity(query), getDashboardProvLyPanel(query)]);

  return <DashboardActivityRoute activity={activity} provlyPanel={provlyPanel} query={query} />;
}
