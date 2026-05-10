"use client";

import Link from "next/link";

import type { DashboardSession } from "@/lib/auth-types";

export function DashboardTopbar({
  title,
  detail,
  runtimeStatus,
  session,
  activeJobs,
  approvals,
}: {
  readonly title: string;
  readonly detail: string;
  readonly runtimeStatus: {
    readonly localDevMode: boolean;
    readonly backendConnected: boolean;
    readonly authMode: string;
    readonly synoxConnected: boolean;
  };
  readonly session?: DashboardSession | null;
  readonly activeJobs: number;
  readonly approvals: number;
}) {
  const backendLabel = runtimeStatus.backendConnected ? "Backend Connected" : "Backend Offline";
  const authLabel = runtimeStatus.authMode === "Local Dev" ? "Auth Mode: Local Dev" : "Auth Mode: Production";
  const synoxLabel = runtimeStatus.synoxConnected ? "Synox Bridge: Connected" : "Synox Bridge: Offline";

  return (
    <header className="nsos-topbar">
      <div className="nsos-topbar-copy">
        <span className="nsos-topbar-kicker">Studio intelligence</span>
        <strong className="nsos-topbar-title">{title}</strong>
        <span className="nsos-topbar-detail">{detail}</span>
      </div>
      <div className="nsos-topbar-right">
        <div className="pill-row nsos-topbar-telemetry">
          <span className={`pill ${runtimeStatus.localDevMode ? "status-warn" : "status-info"}`}>
            Local Dev Mode: {runtimeStatus.localDevMode ? "On" : "Off"}
          </span>
          <span className={`pill ${runtimeStatus.backendConnected ? "status-ok" : "status-danger"}`}>{backendLabel}</span>
          <span className={`pill ${runtimeStatus.synoxConnected ? "status-ok" : "status-danger"}`}>{synoxLabel}</span>
          <span className={`pill ${runtimeStatus.authMode === "Local Dev" ? "status-warn" : "status-info"}`}>{authLabel}</span>
          <span className="pill">{activeJobs} active</span>
          <span className="pill">{approvals} approvals</span>
        </div>
        <div className="pill-row nsos-topbar-session">
          {session ? <span className="pill status-ok">{session.role.toUpperCase()}</span> : null}
          {session ? <span className="pill">{session.tenantId.toUpperCase()}</span> : null}
          {session ? <span className="pill">{session.username.toUpperCase()}</span> : null}
          {session ? (
            <Link className="button button-secondary nsos-topbar-signout" href="/api/auth/logout">
              Sign out
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
