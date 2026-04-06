import { assertDashboardAccess, readDashboardSessionFromCookies } from "@/lib/auth";
import { getDashboardSettings } from "@/lib/dashboard/api";
import { DashboardSettingsRoute } from "@/components/dashboard/routes/settings-route";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  assertDashboardAccess(await readDashboardSessionFromCookies(), "/dashboard/settings");
  const settings = await getDashboardSettings();

  return <DashboardSettingsRoute settings={settings} />;
}
