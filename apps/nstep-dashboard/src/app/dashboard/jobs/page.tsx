import { assertDashboardAccess, readDashboardSessionFromCookies } from "@/lib/auth";
import { getDashboardJobs } from "@/lib/dashboard/api";
import { DashboardJobsRoute } from "@/components/dashboard/routes/jobs-route";
import { parseDashboardQuery, type DashboardSearchParamsInput } from "@/lib/dashboard/query";

export const dynamic = "force-dynamic";

export default async function JobsPage({
  searchParams,
}: {
  readonly searchParams?: DashboardSearchParamsInput;
}) {
  assertDashboardAccess(await readDashboardSessionFromCookies(), "/dashboard/jobs");
  const query = await parseDashboardQuery(searchParams);
  const jobs = await getDashboardJobs(query);

  return <DashboardJobsRoute jobs={jobs} query={query} />;
}
