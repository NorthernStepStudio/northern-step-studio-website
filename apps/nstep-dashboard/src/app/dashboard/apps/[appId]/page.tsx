import { assertDashboardAccess, readDashboardSessionFromCookies } from "@/lib/auth";
import { loadSingleAppViewModel } from "@/lib/dashboard/view-models/apps-view-model";
import { AppDetailsRoute } from "@/components/dashboard/routes/app-details-route";
import { DashboardBackendUnavailable } from "@/components/dashboard/backend-unavailable";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AppDetailPage({
  params,
}: {
  readonly params: Promise<{ readonly appId: string }> | { readonly appId: string };
}) {
  const { appId } = await Promise.resolve(params);
  assertDashboardAccess(await readDashboardSessionFromCookies(), `/dashboard/apps/${appId}`);

  try {
    const view = await loadSingleAppViewModel(appId);
    if (!view) {
      notFound();
    }
    return <AppDetailsRoute view={view} />;
  } catch (error) {
    return <DashboardBackendUnavailable area={`App ${appId}`} error={error} />;
  }
}
