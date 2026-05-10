import Link from "next/link";
import { assertDashboardAccess, readDashboardSessionFromCookies } from "@/lib/auth";
import { DashboardBackendUnavailable } from "@/components/dashboard/backend-unavailable";
import { loadAppsIndexViewModel } from "@/lib/dashboard/view-models/apps-view-model";

export const dynamic = "force-dynamic";

export default async function AppsIndexPage() {
  assertDashboardAccess(await readDashboardSessionFromCookies(), "/dashboard/apps");
  try {
    const apps = await loadAppsIndexViewModel();
    return (
      <div>
        <h1>Apps</h1>
        <ul>
          {apps.map((a) => (
            <li key={a.id}>
              <Link href={`/dashboard/apps/${a.id}`}>{a.displayName}</Link>
            </li>
          ))}
        </ul>
      </div>
    );
  } catch (error) {
    return <DashboardBackendUnavailable area="Apps" error={error} />;
  }
}
