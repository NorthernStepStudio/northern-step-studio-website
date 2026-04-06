import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/shell";
import { readDashboardSessionFromCookies } from "@/lib/auth";
import { getDashboardWorkspaceOverview } from "@/lib/dashboard/api";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await readDashboardSessionFromCookies();
  const overview = session ? await getDashboardWorkspaceOverview() : null;
  return (
    <DashboardShell session={session} overview={overview}>
      {children}
    </DashboardShell>
  );
}
