import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/react-app/lib/auth";
import { apiFetch } from "@/react-app/lib/api";
import { OWNER_EMAIL, isAdminDomainEmail } from "@/shared/auth";

interface Permission {
  role: string;
  page: string;
  can_access: number | boolean;
}

const MODERATOR_FALLBACK_PAGES = new Set(["dashboard", "content", "users"]);
const ADMIN_FALLBACK_PAGES = new Set([
  "dashboard",
  "apps",
  "analytics",
  "content",
  "promos",
  "users",
  "permissions",
  "studio",
  "revenue",
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
  const [userRole, setUserRole] = useState<string>(() => inferRole(user?.email, user?.role));
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (!user) {
      setUserRole("user");
      setPermissions([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadRoleAndPermissions = async () => {
      setIsLoading(true);

      try {
        const res = await apiFetch("/api/user/role");
        if (!res.ok) {
          throw new Error("Failed to load user role");
        }

        const payload = await res.json().catch(() => null) as
          | { role?: string; permissions?: Permission[] }
          | null;

        if (cancelled) {
          return;
        }

        setUserRole(inferRole(user.email, payload?.role || user.role));
        setPermissions(Array.isArray(payload?.permissions) ? payload.permissions : []);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Failed to load permissions:", error);
        setUserRole(inferRole(user.email, user.role));
        setPermissions([]);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadRoleAndPermissions();

    return () => {
      cancelled = true;
    };
  }, [isPending, user]);

  const permissionMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const permission of permissions) {
      map.set(permission.page, permission.can_access === true || permission.can_access === 1);
    }
    return map;
  }, [permissions]);

  const canAccess = (page: string): boolean => {
    if (userRole === "owner") {
      return true;
    }

    if (userRole === "admin") {
      if (permissionMap.has(page)) {
        return Boolean(permissionMap.get(page));
      }
      return ADMIN_FALLBACK_PAGES.has(page) || page === "dashboard";
    }

    if (userRole === "moderator") {
      if (permissionMap.has(page)) {
        return Boolean(permissionMap.get(page));
      }
      return MODERATOR_FALLBACK_PAGES.has(page);
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
