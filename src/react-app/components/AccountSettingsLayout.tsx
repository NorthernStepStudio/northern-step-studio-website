import { Link, Outlet, useLocation } from "react-router";
import {
  ChevronRight,
  CircleUserRound,
  LayoutDashboard,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/react-app/lib/auth";
import { usePermissions } from "@/react-app/hooks/usePermissions";
import { BRAND_ASSETS } from "@/react-app/lib/site";
import { getRoleDisplayLabel } from "@/shared/auth";

type AccountNavItem = {
  to: string;
  label: string;
  description: string;
};

const ACCOUNT_NAV_ITEMS: AccountNavItem[] = [
  {
    to: "/profile/edit",
    label: "Profile Details",
    description: "Name, avatar, and public bio",
  },
  {
    to: "/preferences",
    label: "Preferences",
    description: "Password login and email alerts",
  },
];

export default function AccountSettingsLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isModerator, userRole } = usePermissions();

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(circle_at_top_left,rgba(193,242,91,0.08),transparent_38%),radial-gradient(circle_at_top_right,rgba(90,130,255,0.08),transparent_28%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[16rem] bg-[radial-gradient(circle_at_bottom,rgba(193,242,91,0.05),transparent_44%)]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Link to="/" className="inline-flex items-center gap-3">
              <img
                src={BRAND_ASSETS.studioMark}
                alt="Northern Step Studio"
                className="h-11 w-11 rounded-2xl border border-border bg-card p-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-accent">Account Center</p>
                <p className="truncate text-sm font-semibold text-muted-foreground">Northern Step Studio</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/profile" className="account-button-secondary px-4 py-3 text-xs sm:text-sm">
              View Profile
            </Link>
            {isModerator && (
              <Link to="/admin" className="account-button-secondary px-4 py-3 text-xs sm:text-sm">
                Admin
              </Link>
            )}
            {user ? (
              <button onClick={logout} className="account-button-primary px-4 py-3 text-xs sm:text-sm">
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            ) : (
              <Link to="/login" className="account-button-primary px-4 py-3 text-xs sm:text-sm">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        <div className="mb-8 grid gap-5 xl:grid-cols-[minmax(0,1fr),300px]">
          <section className="account-surface p-6 sm:p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              Studio Identity
            </div>
            <h1 className="max-w-3xl text-3xl font-black uppercase tracking-tight sm:text-[2.3rem]">
              Manage your profile like a real product surface.
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-muted-foreground sm:text-base">
              Keep your public presence clean, your sign-in methods ready, and your account settings in one focused workspace.
            </p>
          </section>

          <section className="account-surface flex flex-col justify-between gap-5 p-6">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-accent">Current Account</p>
              <h2 className="mt-3 text-xl font-black uppercase">
                {user?.display_name?.trim() || "Studio Member"}
              </h2>
              <p className="mt-1 break-all text-sm font-medium text-muted-foreground">
                {user?.email || "Sign in to manage this account"}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="account-surface-subtle px-4 py-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Role</p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {getRoleDisplayLabel(userRole)}
                </p>
              </div>
              <div className="account-surface-subtle px-4 py-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Workspace</p>
                <p className="mt-2 text-base font-semibold text-foreground">Account Settings</p>
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px,minmax(0,1fr)]">
          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <nav className="account-surface p-3">
              <div className="mb-3 px-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Sections</p>
              </div>
              <div className="space-y-2">
                {ACCOUNT_NAV_ITEMS.map((item) => {
                  const isActive = location.pathname === item.to;

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-start justify-between gap-3 rounded-[1.5rem] border px-4 py-4 transition-all ${
                        isActive
                          ? "border-border bg-secondary/28 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
                          : "border-transparent bg-secondary/22 hover:border-border hover:bg-secondary/45"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                            isActive ? "bg-accent" : "border border-border bg-transparent"
                          }`}
                        />
                        <div>
                          <p className={`text-sm font-black uppercase tracking-wide ${isActive ? "text-accent" : "text-foreground"}`}>
                            {item.label}
                          </p>
                          <p className="mt-1 text-xs font-medium leading-5 text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <ChevronRight className={`mt-0.5 h-4 w-4 flex-shrink-0 ${isActive ? "text-accent" : "text-muted-foreground"}`} />
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="account-surface p-6">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/12 text-accent">
                <CircleUserRound className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black uppercase">Keep it tight</h3>
              <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                Treat this page like product UI, not a CMS form. Short labels, clear hierarchy, and zero clutter.
              </p>
              {isModerator && (
                <Link to="/admin" className="mt-5 inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-accent hover:text-primary">
                  <LayoutDashboard className="h-4 w-4" />
                  Open Admin Console
                </Link>
              )}
            </div>
          </aside>

          <section className="min-w-0">
            <Outlet />
          </section>
        </div>
      </main>
    </div>
  );
}
