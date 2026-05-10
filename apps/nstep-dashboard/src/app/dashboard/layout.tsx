import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/shell";
import { assertDashboardAccess, getDashboardAuthModeLabel, isLocalDevMode, readDashboardSessionFromCookies } from "@/lib/auth";
import { getDashboardWorkspaceOverview } from "@/lib/dashboard/api";
import { loadShellViewModel } from "@/lib/dashboard/view-models/shell-view-model";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = assertDashboardAccess(await readDashboardSessionFromCookies(), "/dashboard");
  
  let overview = null;
  let backendConnected = false;
  if (session) {
    try {
      overview = await getDashboardWorkspaceOverview();
      backendConnected = true;
    } catch {}
  }

  const shellView = await loadShellViewModel(backendConnected);

  return (
    <DashboardShell
      session={session}
      overview={overview}
      runtimeStatus={{
        localDevMode: shellView.localDevMode,
        backendConnected: shellView.backendConnected,
        authMode: shellView.authMode,
        synoxConnected: shellView.synoxConnected,
        matterhorn: shellView.matterhornStatus,
        environment: shellView.environment,
      }}
    >
      {children}
    </DashboardShell>
  );
}
