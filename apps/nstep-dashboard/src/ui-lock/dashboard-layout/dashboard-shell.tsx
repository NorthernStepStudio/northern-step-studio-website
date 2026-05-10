"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";

import type { DashboardSession } from "@/lib/auth-types";
import type { DashboardOverviewResponse } from "@/lib/dashboard/contracts";
import { dashboardNavGroups, getDashboardRouteMeta } from "@/lib/dashboard/nav";
import { usePathname } from "next/navigation";
import { StudioShellFrame } from "@/ui-lock/studio-shell/frame";
import { DashboardSidebarNav } from "@/ui-lock/sidebar/dashboard-sidebar-nav";
import { DashboardWorkspaceSummary } from "@/ui-lock/sidebar/workspace-summary";
import { DashboardTopbar } from "@/ui-lock/topbar/dashboard-topbar";

export function LockedDashboardShell({
  children,
  overview,
  runtimeStatus,
  session,
}: {
  readonly children: ReactNode;
  readonly overview?: DashboardOverviewResponse | null;
  readonly runtimeStatus: {
    readonly localDevMode: boolean;
    readonly backendConnected: boolean;
    readonly authMode: string;
    readonly synoxConnected: boolean;
    readonly matterhorn: {
      readonly online: boolean;
      readonly provider: string;
      readonly model: string;
    };
    readonly environment: string;
  };
  readonly session?: DashboardSession | null;
}) {
  const pathname = usePathname();
  const sidebarScrollRef = useRef<HTMLDivElement | null>(null);
  const mainScrollRef = useRef<HTMLDivElement | null>(null);
  const routeMeta = getDashboardRouteMeta(pathname);
  const activeJobs = overview?.activity.summary.totalActiveJobs ?? 0;
  const approvals = overview?.recentApprovals.length ?? 0;

  useLayoutEffect(() => {
    if (pathname !== "/dashboard") {
      return;
    }

    window.history.scrollRestoration = "manual";

    const reset = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (sidebarScrollRef.current) {
        sidebarScrollRef.current.scrollTop = 0;
      }
      if (mainScrollRef.current) {
        mainScrollRef.current.scrollTop = 0;
      }
    };

    // Multiple passes to beat browser/container restoration and dev HMR timing.
    reset();
    requestAnimationFrame(reset);
    const t1 = window.setTimeout(reset, 40);
    const t2 = window.setTimeout(reset, 140);
    const t3 = window.setTimeout(reset, 500);
    const t4 = window.setTimeout(reset, 1000);
    window.addEventListener("load", reset);
    window.addEventListener("pageshow", reset);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
      window.removeEventListener("load", reset);
      window.removeEventListener("pageshow", reset);
    };
  }, [pathname]);

  return (
    <StudioShellFrame
      key={pathname}
      mainRef={mainScrollRef}
      sidebar={
        <>
          <Link className="nsos-brand" href="/dashboard">
            <span className="nsos-brand-kicker">NStepOS</span>
            <span className="nsos-brand-title">StudioOS executive layer</span>
            <span className="nsos-brand-copy">Governance-first operational command environment.</span>
          </Link>

          <div className="nsos-sidebar-scroll-area" ref={sidebarScrollRef}>
            <section className="nsos-matterhorn-card" aria-label="Matterhorn advisory summary">
              <span className="nsos-matterhorn-kicker">Matterhorn</span>
              <h3 className="nsos-matterhorn-title">Executive advisory intelligence</h3>
              <p className="nsos-matterhorn-copy">
                Advisory-first execution insight with governance routing and manual approval control.
              </p>
              <div className="nsos-matterhorn-pills">
                <span className="pill status-warn">Advisory only</span>
                <span className="pill status-ok">Human approval required</span>
              </div>
              <div className="nsos-matterhorn-actions">
                <Link className="button button-secondary" href="/dashboard/activity">
                  Open advisory workspace
                </Link>
              </div>
            </section>

            <DashboardSidebarNav groups={dashboardNavGroups} pathname={pathname} />
            {overview ? <DashboardWorkspaceSummary overview={overview} /> : null}
          </div>
        </>
      }
      topbar={
        <DashboardTopbar
          title={routeMeta.title}
          detail={routeMeta.detail}
          runtimeStatus={runtimeStatus}
          session={session}
          activeJobs={activeJobs}
          approvals={approvals}
        />
      }
    >
      {children}
    </StudioShellFrame>
  );
}
