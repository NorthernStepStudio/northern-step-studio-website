import type { DashboardNavGroup } from "./nav";

export type DashboardSidebarOpenState = Record<string, boolean>;

export function dashboardNavGroupKey(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, "-");
}

export function isDashboardNavItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function buildInitialDashboardSidebarOpenState(
  pathname: string,
  groups: readonly DashboardNavGroup[],
): DashboardSidebarOpenState {
  const state: DashboardSidebarOpenState = {};

  for (const group of groups) {
    const key = dashboardNavGroupKey(group.label);
    const containsActiveItem = group.items.some((item) => isDashboardNavItemActive(pathname, item.href));
    state[key] = containsActiveItem || group.label.toLowerCase() === "operations";
  }

  return state;
}

