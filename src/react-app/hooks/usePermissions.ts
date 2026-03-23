import { useState, useEffect } from "react";
import { useAuth } from "@/react-app/lib/auth";

interface Permission {
  role: string;
  page: string;
  can_access: number;
}

interface UserRole {
  role: string;
}

export function usePermissions() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>(user?.role ?? "user");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserRole("user");
      setPermissions([]);
      setIsLoading(false);
      return;
    }

    setUserRole(user.role ?? "user");
    setIsLoading(true);

    const fetchPermissions = async () => {
      try {
        // Fetch user's role from our database
        const roleRes = await fetch("/api/user/role");
        if (roleRes.ok) {
          const roleData: UserRole = await roleRes.json();
          setUserRole(roleData.role);

          // Fetch permissions for this role
          const permRes = await fetch(`/api/permissions/${roleData.role}`);
          if (permRes.ok) {
            const permData: Permission[] = await permRes.json();
            setPermissions(permData);
          }
        }
      } catch (err) {
        console.error("Failed to fetch permissions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [user?.email, user?.role]);

  const canAccess = (page: string): boolean => {
    // Owner and admins always have access
    if (userRole === "owner" || userRole === "admin") return true;

    // Check permissions table
    const perm = permissions.find((p) => p.page === page);
    return perm ? perm.can_access === 1 : false;
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
