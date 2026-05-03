import { ReactNode } from "react";
import { Navigate } from "react-router";
import { useFeatureToggles } from "@/react-app/hooks/useFeatureToggles";
import { usePermissions } from "@/react-app/hooks/usePermissions";

interface ProtectedRouteProps {
  feature: string;
  children: ReactNode;
}

/**
 * ProtectedRoute - Redirects to home if feature is disabled
 * 
 * Rules:
 * - Owner and Admin can always access routes (toggles don't apply)
 * - Moderators and Users get redirected if feature is disabled
 */
export default function ProtectedRoute({ feature, children }: ProtectedRouteProps) {
  const { isEnabled, loading } = useFeatureToggles();
  const { userRole } = usePermissions();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  // Owner and admin bypass feature toggles
  if (userRole === "owner" || userRole === "admin") {
    return <>{children}</>;
  }

  // For moderators and users, check if feature is enabled
  if (!isEnabled(feature)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
