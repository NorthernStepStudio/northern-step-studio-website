import { assertDashboardAccess, readDashboardSessionFromCookies } from "@/lib/auth";
import { getDashboardSettings } from "@/lib/dashboard/api";
import { DashboardSettingsRoute } from "@/components/dashboard/routes/settings-route";
import { DashboardBackendUnavailable } from "@/components/dashboard/backend-unavailable";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  assertDashboardAccess(await readDashboardSessionFromCookies(), "/dashboard/settings");
  try {
    const settings = await getDashboardSettings();
    return <DashboardSettingsRoute settings={settings} />;
  } catch (error) {
    return <DashboardBackendUnavailable area="Settings" error={error} />;
  }
}
