import { assertDashboardAccess, readDashboardSessionFromCookies } from "@/lib/auth";
import { getDashboardMemory } from "@/lib/dashboard/api";
import { DashboardMemoryRoute } from "@/components/dashboard/routes/memory-route";
import { parseDashboardQuery, type DashboardSearchParamsInput } from "@/lib/dashboard/query";

export const dynamic = "force-dynamic";

export default async function MemoryPage({
  searchParams,
}: {
  readonly searchParams?: DashboardSearchParamsInput;
}) {
  assertDashboardAccess(await readDashboardSessionFromCookies(), "/dashboard/memory");
  const query = await parseDashboardQuery(searchParams);
  const memory = await getDashboardMemory(query);

  return <DashboardMemoryRoute memory={memory} query={query} />;
}
