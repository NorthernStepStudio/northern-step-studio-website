import { ReactNode } from "react";
import { useFeatureToggles } from "@/react-app/hooks/useFeatureToggles";
import { usePermissions } from "@/react-app/hooks/usePermissions";

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * FeatureGate - Controls visibility of features based on toggles
 * 
 * Rules:
 * - Owner and Admin can always see features (toggles don't apply)
 * - Moderators and Users can only see enabled features
 */
export default function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  const { isEnabled, loading } = useFeatureToggles();
  const { userRole } = usePermissions();

  if (loading) {
    return null; // Don't show anything while loading
  }

  // Owner and admin bypass feature toggles
  if (userRole === "owner" || userRole === "admin") {
    return <>{children}</>;
  }

  // For moderators and users, check if feature is enabled
  if (!isEnabled(feature)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
