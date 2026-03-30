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

export default function Login({ mode = "user" }: LoginProps) {
  const { t } = useTranslation();
  const { user, isPending, redirectToLogin, loginWithPassword, registerWithPassword } = useAuth();
  const navigate = useNavigate();
  const isAdminMode = mode === "admin";
  const [authMode, setAuthMode] = useState<"sign_in" | "sign_up">("sign_in");
  const isSignupMode = !isAdminMode && authMode === "sign_up";

  const [credentials, setCredentials] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isGoogleRedirecting, setIsGoogleRedirecting] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isPending || !user) {
      return;
    }

    navigate(user.role === "user" ? "/profile" : "/admin", { replace: true });
  }, [isPending, navigate, user]);

  const handleGoogleLogin = async () => {
    setIsGoogleRedirecting(true);
    setError("");

    try {
      await redirectToLogin();
    } catch (err) {
      console.error("Login redirect failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : t("login.error", "Unable to start Google sign in right now."),
      );
      setIsGoogleRedirecting(false);
    }
  };

  const handlePasswordAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsPasswordLoading(true);
    setError("");

    if (isSignupMode && !credentials.displayName.trim()) {
      setError("Enter a display name to create your account.");
      setIsPasswordLoading(false);
      return;
    }

    if (isSignupMode && credentials.password !== credentials.confirmPassword) {
      setError("Password and confirmation do not match.");
      setIsPasswordLoading(false);
      return;
    }

    try {
      const authenticatedUser = isSignupMode
        ? await registerWithPassword(credentials.email, credentials.password, {
            displayName: credentials.displayName,
          })
        : await loginWithPassword(credentials.email, credentials.password, {
            admin: isAdminMode,
          });

      navigate(authenticatedUser.role === "user" ? "/profile" : "/admin", { replace: true });
    } catch (err) {
      console.error(isSignupMode ? "Password sign up failed:" : "Password login failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : isSignupMode
            ? "Unable to create your account right now."
            : "Unable to sign in with email and password right now.",
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
          <p className="text-sm text-muted-foreground font-normal">Loading account access...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  const title = isAdminMode ? t("auth.admin_title", "Admin Console") : t("auth.title", "Welcome Back");
  const subtitle = isAdminMode
    ? t("auth.admin_subtitle", "Secure access for Northern Step Studio administrators.")
    : isSignupMode
      ? t("auth.register_subtitle", "Create your account to get started.")
      : t("auth.login_subtitle", "Enter your credentials to access your dashboard.");

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
            <AnimatePresence mode="wait">
                  <motion.div
                    key={isAdminMode ? "admin" : "user"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2 text-center pb-2">
                      <h1 className="text-3xl font-bold tracking-tight text-white">
                        {title}
                      </h1>
                      <div className="text-muted-foreground">
                        {subtitle}
                      </div>
                    </div>
                  </motion.div>
            </AnimatePresence>
          </div>

          <div className="card-dark-wise space-y-6">
            {!isAdminMode ? (
              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-secondary/20 p-2">
                <button
                  type="button"
                  className={`rounded-2xl px-4 py-3 text-sm font-black uppercase transition-colors ${
                    !isSignupMode ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => {
                    setAuthMode("sign_in");
                    setError("");
                  }}
                >
                  {t("login.sign_in", "Sign In")}
                </button>
                <button
                  type="button"
                  className={`rounded-2xl px-4 py-3 text-sm font-black uppercase transition-colors ${
                    isSignupMode ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => {
                    setAuthMode("sign_up");
                    setError("");
                  }}
                >
                  {t("login.sign_up", "Sign up")}
                </button>
              </div>
            ) : null}

            <div className="rounded-2xl border border-border bg-secondary/30 p-4">
              <div className="flex items-center gap-3">
                {isAdminMode ? (
                  <Shield className="w-4 h-4 text-accent" />
                ) : (
                  <Mail className="w-4 h-4 text-accent" />
                )}
                <h2 className="text-sm font-black uppercase">
                  {isAdminMode
                    ? "Studio Admin Login"
                    : isSignupMode
                      ? "Create Account"
                      : "Email and Password"}
                </h2>
              </div>
            </div>

            <form onSubmit={handlePasswordAuth} className="space-y-4">
              {isSignupMode ? (
                <div>
                  <label htmlFor="displayName" className="block text-xs font-black uppercase tracking-wide mb-2">
                    Display Name
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    autoComplete="nickname"
                    value={credentials.displayName}
                    onChange={(event) =>
                      setCredentials((current) => ({ ...current, displayName: event.target.value }))
                    }
                    placeholder="Your name"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                    required={isSignupMode}
                  />
                </div>
              ) : null}

              <div>
                <label htmlFor="email" className="block text-xs font-black uppercase tracking-wide mb-2">
                  {isAdminMode ? "Studio Email" : "Email"}
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={credentials.email}
                  onChange={(event) =>
                    setCredentials((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder={isAdminMode ? `name@northernstepstudio.com` : "you@example.com"}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-black uppercase tracking-wide mb-2">
                  {t("login.password_label", "Password")}
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={credentials.password}
                  onChange={(event) =>
                    setCredentials((current) => ({ ...current, password: event.target.value }))
                  }
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                  required
                />
              </div>

              {isSignupMode ? (
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-black uppercase tracking-wide mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={credentials.confirmPassword}
                    onChange={(event) =>
                      setCredentials((current) => ({ ...current, confirmPassword: event.target.value }))
                    }
                    placeholder="Confirm your password"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                    required={isSignupMode}
                  />
                </div>
              ) : null}

              <button
                type="submit"
                className="w-full btn-pill-primary flex items-center justify-center gap-3"
                disabled={isPasswordLoading || isGoogleRedirecting}
              >
                <KeyRound className="w-4 h-4" />
                {isPasswordLoading
                  ? isSignupMode
                    ? "Creating account..."
                    : "Signing in..."
                  : isSignupMode
                    ? "Create Account"
                  : isAdminMode
                    ? "Enter Admin Console"
                    : "Sign in with Email"}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card-soft px-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Or continue with Google
                </span>
              </div>
            </div>

            <button
              className="w-full btn-pill-ghost flex items-center justify-center gap-3"
              onClick={handleGoogleLogin}
              disabled={isGoogleRedirecting || isPasswordLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {isGoogleRedirecting
                ? t("login.signing_in", "Redirecting...")
                : t("login.google", "Continue with Google")}
            </button>


            {!isAdminMode ? (
              <div className="text-center text-sm text-muted-foreground">
                {isSignupMode ? "Already have an account?" : t("login.no_account", "Don't have an account?")}{" "}
                <button
                  type="button"
                  className="font-bold text-accent hover:underline"
                  onClick={() => {
                    setAuthMode(isSignupMode ? "sign_in" : "sign_up");
                    setError("");
                  }}
                >
                  {isSignupMode ? t("login.sign_in", "Sign In") : t("login.sign_up", "Sign up")}
                </button>
              </div>
            ) : null}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
