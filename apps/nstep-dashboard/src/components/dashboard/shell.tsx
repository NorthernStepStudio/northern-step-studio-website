"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import type { DashboardSession } from "@/lib/auth-types";
import type { DashboardOverviewResponse } from "@/lib/dashboard/contracts";
import { dashboardNavGroups, getDashboardRouteMeta } from "@/lib/dashboard/nav";
import { DashboardWorkspaceSummary } from "./workspace-summary";

function isActiveLink(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardShell({
  children,
  overview,
  session,
}: {
  readonly children: ReactNode;
  readonly overview?: DashboardOverviewResponse | null;
  readonly session?: DashboardSession | null;
}) {
  const pathname = usePathname();
  const routeMeta = getDashboardRouteMeta(pathname);

  return (
    <div className="nsos-shell">
      <aside className="nsos-sidebar">
        <Link className="nsos-brand" href="/dashboard">
          <span className="nsos-brand-kicker">NStepOS</span>
          <span className="nsos-brand-title">Control surface</span>
          <span className="nsos-brand-copy">Visible orchestration for controlled business automation.</span>
        </Link>

        {dashboardNavGroups.map((group) => (
          <nav className="nsos-nav-group" key={group.label} aria-label={group.label}>
            <p className="nsos-nav-group-title">{group.label}</p>
            <div className="nsos-nav-list">
              {group.items.map((item) => {
                const active = isActiveLink(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    className={`nsos-nav-link${active ? " nsos-nav-link-active" : ""}`}
                    href={item.href}
                  >
                    <span className="nsos-nav-link-title">{item.label}</span>
                    <span className="nsos-nav-link-detail">{item.detail}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        ))}

        {overview ? <DashboardWorkspaceSummary overview={overview} /> : null}
      </aside>

      <div className="nsos-main">
        <header className="nsos-topbar">
          <div className="nsos-topbar-copy">
            <span className="nsos-topbar-kicker">Operational workspace</span>
            <strong className="nsos-topbar-title">{routeMeta.title}</strong>
            <span className="nsos-topbar-detail">{routeMeta.detail}</span>
          </div>
          <div className="pill-row">
            <span className="pill status-info">NStepOS</span>
            <span className="pill">NSCore</span>
            <span className="pill">Dashboard</span>
            {overview ? <span className="pill status-success">{overview.activity.summary.totalActiveJobs} active</span> : null}
            {overview ? <span className="pill status-warn">{overview.recentApprovals.length} approvals</span> : null}
            {session ? <span className="pill status-success">{session.role}</span> : null}
            {session ? <span className="pill">{session.tenantId}</span> : null}
            {session ? <span className="pill">{session.displayName}</span> : null}
            {session ? (
              <Link className="button button-secondary" href="/api/auth/logout">
                Sign out
              </Link>
            ) : null}
          </div>
        </header>

        <main className="nsos-content">{children}</main>
      </div>
    </div>
  );
}
