import { useAuth } from "@/react-app/lib/auth";
import { OWNER_EMAIL, isAdminDomainEmail } from "@/shared/auth";

interface Permission {
  role: string;
  page: string;
  can_access: number;
}

const MODERATOR_PAGES = new Set(["dashboard", "content", "users"]);
const ADMIN_PAGES = new Set([
  "dashboard",
  "apps",
  "analytics",
  "content",
  "promos",
  "users",
  "permissions",
  "studio",
  "revenue",
  "leads",
  "updates",
  "community",
  "site-editor",
  "settings",
]);

function inferRole(email?: string | null, role?: string | null) {
  if (role) {
    return role;
  }

  const normalizedEmail = (email ?? "").trim().toLowerCase();
  if (normalizedEmail === OWNER_EMAIL) {
    return "owner";
  }
  if (isAdminDomainEmail(normalizedEmail)) {
    return "admin";
  }
  return "user";
}

export function usePermissions() {
  const { user, isPending } = useAuth();
  const userRole = inferRole(user?.email, user?.role);
  const permissions: Permission[] = [];
  const isLoading = isPending;

  const canAccess = (page: string): boolean => {
    if (userRole === "owner" || userRole === "admin") {
      return ADMIN_PAGES.has(page) || page === "dashboard";
    }

    if (userRole === "moderator") {
      return MODERATOR_PAGES.has(page);
    }

    return false;
  };

  const isOwner = userRole === "owner";
  const isAdmin = userRole === "admin" || userRole === "owner";
  const isModerator = userRole === "moderator" || userRole === "admin" || userRole === "owner";

  return {
    userRole,
    permissions,
    isLoading,
    canAccess,
    isOwner,
    isAdmin,
    isModerator,
  };
}
