import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ArrowLeft,
  Shield,
  KeyRound
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/react-app/lib/auth";
import NStepBrand from "@/react-app/components/NStepBrand";

type LoginProps = {
  mode?: "user" | "admin";
};

export default function Login({ mode = "admin" }: LoginProps) {
  const { t } = useTranslation();
  const { user, isPending, loginWithPassword } = useAuth();
  const navigate = useNavigate();
  const isAdminMode = true; // Hardcoded to admin/owner mode

  const [credentials, setCredentials] = useState({
    email: "admin@northernstepstudio.com",
    password: "",
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isPending || !user) {
      return;
    }

    navigate(user.role === "user" ? "/profile" : "/admin", { replace: true });
  }, [isPending, navigate, user]);

  const handlePasswordAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsPasswordLoading(true);
    setError("");

    try {
      const authenticatedUser = await loginWithPassword(credentials.email, credentials.password, {
        admin: true,
      });

      navigate(authenticatedUser.role === "user" ? "/profile" : "/admin", { replace: true });
    } catch (err) {
      console.error("Admin login failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in to the Admin Console right now.",
      );
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <NStepBrand className="justify-center mx-auto mb-4" markClassName="h-16 w-16" wordmarkClassName="text-lg" />
          <p className="text-sm text-muted-foreground font-normal">Loading secure access...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="p-4 sm:p-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors font-bold uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("login.back_home", "Back to Home")}
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="mb-6 flex justify-center">
              <NStepBrand markClassName="h-16 w-16" wordmarkClassName="text-lg" />
            </div>
            <div className="space-y-6">
              <div className="space-y-2 text-center pb-2">
                <h1 className="text-3xl font-bold tracking-tight text-white uppercase italic">
                  Admin Console
                </h1>
                <div className="text-muted-foreground text-sm font-medium">
                  Secure access for Northern Step Studio management.
                </div>
              </div>
            </div>
          </div>

          <div className="card-dark-wise space-y-6">
            <div className="rounded-2xl border border-border bg-secondary/30 p-4">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-black uppercase">Studio Identity Verification</h2>
              </div>
            </div>

            <form onSubmit={handlePasswordAuth} autoComplete="off" className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-black uppercase tracking-wide mb-2 opacity-50">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="off"
                  value={credentials.email}
                  disabled
                  className="w-full rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm outline-none transition-colors text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-xs font-black uppercase tracking-wide">
                    Master Password
                  </label>
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={credentials.password}
                  onChange={(event) =>
                    setCredentials((current) => ({ ...current, password: event.target.value }))
                  }
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full btn-pill-primary flex items-center justify-center gap-3 group"
                disabled={isPasswordLoading}
              >
                <KeyRound className="w-4 h-4 transition-transform group-hover:rotate-12" />
                {isPasswordLoading ? "Verifying..." : "Enter Console"}
              </button>
            </form>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-bold text-destructive text-center bg-destructive/10 p-3 rounded-xl border border-destructive/20"
              >
                {error}
              </motion.p>
            )}
          </div>
          
          <p className="mt-8 text-center text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-30">
            Internal Studio System • Unauthorized Access Prohibited
          </p>
        </div>
      </div>
    </div>
  );
}
