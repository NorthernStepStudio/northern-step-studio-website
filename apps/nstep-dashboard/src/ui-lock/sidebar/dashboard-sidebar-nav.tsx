"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { DashboardNavGroup } from "@/lib/dashboard/nav";
import {
  buildInitialDashboardSidebarOpenState,
  dashboardNavGroupKey,
  isDashboardNavItemActive,
  type DashboardSidebarOpenState,
} from "@/lib/dashboard/sidebar-nav";

function mergeOpenState(
  current: DashboardSidebarOpenState,
  defaults: DashboardSidebarOpenState,
  groups: readonly DashboardNavGroup[],
  pathname: string,
): DashboardSidebarOpenState {
  const next: DashboardSidebarOpenState = {};

  for (const group of groups) {
    const key = dashboardNavGroupKey(group.label);
    const hasActiveItem = group.items.some((item) => isDashboardNavItemActive(pathname, item.href));
    const existingValue = current[key];
    const defaultValue = defaults[key] ?? false;
    next[key] = hasActiveItem ? true : existingValue ?? defaultValue;
  }

  return next;
}

export function DashboardSidebarNav({
  pathname,
  groups,
}: {
  readonly pathname: string;
  readonly groups: readonly DashboardNavGroup[];
}) {
  const defaults = useMemo(
    () => buildInitialDashboardSidebarOpenState(pathname, groups),
    [pathname, groups],
  );
  const [openState, setOpenState] = useState<DashboardSidebarOpenState>(defaults);

  useEffect(() => {
    setOpenState((current) => mergeOpenState(current, defaults, groups, pathname));
  }, [defaults, groups, pathname]);

  return (
    <>
      {groups.map((group) => {
        const key = dashboardNavGroupKey(group.label);
        const isOpen = openState[key] ?? false;
        const activeCount = group.items.filter((item) => isDashboardNavItemActive(pathname, item.href)).length;

        return (
          <nav className="nsos-nav-group nsos-nav-group-dropdown" key={key} aria-label={group.label}>
            <button
              type="button"
              className="nsos-nav-group-trigger"
              aria-expanded={isOpen}
              onClick={() =>
                setOpenState((current) => ({
                  ...current,
                  [key]: !isOpen,
                }))
              }
            >
              <span className="nsos-nav-group-title">{group.label}</span>
              <span className="nsos-nav-group-controls">
                <span className={`nsos-nav-group-badge${activeCount > 0 ? " is-active" : ""}`}>
                  {activeCount > 0 ? activeCount : group.items.length}
                </span>
                <span className={`nsos-nav-group-settings${isOpen ? " is-open" : ""}`} aria-hidden>
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M12 3.25 18.5 7v7.5L12 18.75 5.5 14.5V7L12 3.25Z" />
                    <path d="M12 8.1a3.9 3.9 0 1 1 0 7.8 3.9 3.9 0 0 1 0-7.8Z" />
                    <path d="M12 1.5v3M12 19.5v3M2.75 6.5l2.6 1.5M18.65 16l2.6 1.5M2.75 17.5l2.6-1.5M18.65 8l2.6-1.5" />
                  </svg>
                </span>
              </span>
            </button>

            <div className={`nsos-nav-list-wrap${isOpen ? " is-open" : ""}`}>
              <div className="nsos-nav-list">
                {group.items.map((item) => {
                  const active = isDashboardNavItemActive(pathname, item.href);
                  return (
                    <Link
                      key={`${group.label}:${item.href}:${item.label}`}
                      className={`nsos-nav-link${active ? " nsos-nav-link-active" : ""}`}
                      href={item.href}
                    >
                      <span className="nsos-nav-link-title">{item.label}</span>
                      <span className="nsos-nav-link-detail">{item.detail}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        );
      })}
    </>
  );
}
