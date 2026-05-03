import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/react-app/lib/auth";
import { isElevatedRole } from "@/shared/auth";

export default function AuthCallback() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { exchangeCodeForSessionToken } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const authenticatedUser = await exchangeCodeForSessionToken();
        const destination = isElevatedRole(authenticatedUser?.role) ? "/admin" : "/profile";

        window.location.replace(destination);
      } catch (error) {
        console.error("Auth failed:", error);
        navigate("/login");
      }
    };

    handleCallback();
  }, [exchangeCodeForSessionToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Sparkles className="w-8 h-8 text-accent-foreground" />
        </div>
        <p className="text-muted-foreground font-normal">{t("auth_callback.completing")}</p>
      </div>
    </div>
  );
}
