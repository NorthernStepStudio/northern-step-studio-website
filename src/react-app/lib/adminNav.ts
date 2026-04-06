import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Box,
  Briefcase,
  DollarSign,
  FileText,
  Inbox,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Settings,
  Users,
  Wrench,
} from "lucide-react";

export type AdminNavSection = "core" | "internal" | "settings";

export interface AdminNavItem {
  path: string;
  label: string;
  description: string;
  icon: LucideIcon;
  page: string;
  section: AdminNavSection;
}

export const ADMIN_RECENT_STORAGE_KEY = "nss.admin.recentPaths";

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    path: "/admin",
    label: "Dashboard",
    description: "Overview, metrics, recent activity, and quick decisions.",
    icon: LayoutDashboard,
    page: "dashboard",
    section: "core",
  },
  {
    path: "/admin/apps",
    label: "Apps",
    description: "Register, edit, and review the product catalog.",
    icon: Box,
    page: "apps",
    section: "core",
  },
  {
    path: "/admin/analytics",
    label: "Analytics",
    description: "Track traffic, engagement, and activity trends.",
    icon: BarChart3,
    page: "analytics",
    section: "core",
  },
  {
    path: "/admin/revenue",
    label: "Revenue",
    description: "Review payments, balances, and Stripe status.",
    icon: DollarSign,
    page: "revenue",
    section: "core",
  },
  {
    path: "/admin/leads",
    label: "Leads",
    description: "Review setup requests, demos, and inbound contact leads.",
    icon: Inbox,
    page: "leads",
    section: "core",
  },
  {
    path: "/admin/content",
    label: "Content",
    description: "Write, publish, and manage blog content.",
    icon: FileText,
    page: "content",
    section: "core",
  },
  {
    path: "/admin/updates",
    label: "Updates",
    description: "Post product updates and changelog entries.",
    icon: Bell,
    page: "updates",
    section: "core",
  },
  {
    path: "/admin/community",
    label: "Community",
    description: "Moderate threads, pins, and visibility.",
    icon: MessageSquare,
    page: "community",
    section: "core",
  },
  {
    path: "/admin/promos",
    label: "Promos",
    description: "Manage promotional surfaces and campaigns.",
    icon: Megaphone,
    page: "promos",
    section: "core",
  },
  {
    path: "/admin/users",
    label: "Users",
    description: "Invite teammates and manage user roles.",
    icon: Users,
    page: "users",
    section: "core",
  },
  {
    path: "/admin/permissions",
    label: "Permissions",
    description: "Control access levels across admin modules.",
    icon: Settings,
    page: "permissions",
    section: "core",
  },
  {
    path: "/admin/studio",
    label: "Studio",
    description: "Internal notes, operating context, and studio work.",
    icon: Briefcase,
    page: "studio",
    section: "internal",
  },
  {
    path: "/admin/settings",
    label: "Feature Toggles",
    description: "Enable or disable public and internal features.",
    icon: Settings,
    page: "settings",
    section: "settings",
  },
  {
    path: "/admin/maintenance",
    label: "Maintenance Mode",
    description: "Schedule and control public maintenance windows.",
    icon: Wrench,
    page: "settings",
    section: "settings",
  },
  {
    path: "/admin/proposals",
    label: "Proposals",
    description: "Reference our core offerings and client proposals.",
    icon: FileText,
    page: "proposals",
    section: "internal",
  },
];

export const ADMIN_ROUTE_TO_PAGE = Object.fromEntries(
  ADMIN_NAV_ITEMS.map((item) => [item.path, item.page]),
) as Record<string, string>;

export function getAdminNavItem(pathname: string) {
  return ADMIN_NAV_ITEMS.find((item) => item.path === pathname) ?? null;
}
