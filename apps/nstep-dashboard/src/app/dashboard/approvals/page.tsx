import { assertDashboardAccess, readDashboardSessionFromCookies } from "@/lib/auth";
import { getDashboardApprovals } from "@/lib/dashboard/api";
import { DashboardApprovalsRoute } from "@/components/dashboard/routes/approvals-route";
import { parseDashboardQuery, type DashboardSearchParamsInput } from "@/lib/dashboard/query";
import { DashboardBackendUnavailable } from "@/components/dashboard/backend-unavailable";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage({
  searchParams,
}: {
  readonly searchParams?: DashboardSearchParamsInput;
}) {
  assertDashboardAccess(await readDashboardSessionFromCookies(), "/dashboard/approvals");
  const query = await parseDashboardQuery(searchParams);
  try {
    const approvals = await getDashboardApprovals(query);
    return <DashboardApprovalsRoute approvals={approvals} query={query} />;
  } catch (error) {
    return <DashboardBackendUnavailable area="Approvals" error={error} />;
  }
}
