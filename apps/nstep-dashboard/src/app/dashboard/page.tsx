import { assertDashboardAccess, readDashboardSessionFromCookies } from "@/lib/auth";
import { getDashboardWorkspaceOverview } from "@/lib/dashboard/api";
import { DashboardOverviewRoute } from "@/components/dashboard/routes/overview-route";

export const dynamic = "force-dynamic";

export default async function DashboardHomePage() {
  const session = assertDashboardAccess(await readDashboardSessionFromCookies(), "/dashboard");
  const overview = await getDashboardWorkspaceOverview();

  return <DashboardOverviewRoute overview={overview} session={session} />;
}
