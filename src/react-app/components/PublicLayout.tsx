import { Outlet, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/react-app/lib/auth";
import { LogOut, User, Settings, AlertTriangle, X, Menu, PhoneCall, ArrowRight, LayoutDashboard, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";
import LanguageSelector from "./LanguageSelector";
import { usePermissions } from "@/react-app/hooks/usePermissions";
import { Button } from "@/react-app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/react-app/components/ui/dropdown-menu";
import { BRAND_ASSETS } from "@/react-app/lib/site";

interface MaintenanceSettings {
  scheduled_date: string | null;
  scheduled_time: string | null;
}

export default function PublicLayout() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { isModerator } = usePermissions();
  const [maintenance, setMaintenance] = useState<MaintenanceSettings | null>(null);
  const [showBanner, setShowBanner] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/maintenance")
      .then((res) => res.json())
      .then((data) => {
        if (data.scheduled_date) {
          setMaintenance(data);
        }
      })
      .catch(() => {});
  }, []);

  const currentLocale = i18n.language || "en";
  const hasScheduledMaintenance = Boolean(maintenance?.scheduled_date) && showBanner;
  const accountButtonLabel = isModerator ? t("nav.console") : t("nav.profile");
  const setupReviewHref = "/contact?intent=setup-review";

  const footerLinks = [
    { label: t("footer.updates"), to: "/updates" },
    { label: t("footer.community"), to: "/community" },
    { label: t("footer.contact"), to: "/contact" },
    { label: t("footer.docs"), to: "/docs" },
  ];

  return (
    <div className="min-h-screen">
      {hasScheduledMaintenance && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/90 backdrop-blur-sm border-b border-yellow-600">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <AlertTriangle className="w-5 h-5 text-yellow-900 flex-shrink-0" />
              <p className="text-sm font-bold text-yellow-900">
                {t("maintenance.banner")}{" "}
                {maintenance?.scheduled_date && (() => {
                  const [year, month, day] = maintenance.scheduled_date.split("-").map(Number);
                  const date = new Date(year, month - 1, day);
                  return date.toLocaleDateString(currentLocale, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });
                })()}
                {maintenance?.scheduled_time && ` at ${maintenance.scheduled_time.replace(" --", "")}`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBanner(false)}
              className="text-yellow-900 hover:bg-yellow-600/20 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <header className={`fixed left-0 right-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl ${hasScheduledMaintenance ? "top-[52px]" : "top-0"}`}>
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={BRAND_ASSETS.studioLogo}
              alt="Northern Step Studio"
              className="hidden sm:block h-10 md:h-11 lg:h-12 w-auto dark:invert-0 invert"
            />
            <img
              src={BRAND_ASSETS.studioMark}
              alt="Northern Step Studio"
              className="sm:hidden h-10 w-auto dark:invert-0 invert"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            <Link to="/missed-call-text-back" className="text-sm text-yellow-500 hover:text-yellow-400 transition-colors uppercase font-black">
              Lead Recovery
            </Link>
            <Link to="/apps" className="text-sm text-muted-foreground hover:text-accent transition-colors uppercase font-black">
              {t("nav.apps")}
            </Link>
            <Link to="/workspace-ai" className="text-sm text-muted-foreground hover:text-accent transition-colors uppercase font-black">
              {t("nav.workspace_ai")}
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors uppercase font-black focus:outline-none">
                {t("common.more") || "More"}
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-md">
                <DropdownMenuItem asChild>
                  <Link to="/about" className="uppercase font-black text-xs py-2.5">
                    {t("nav.about")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/contact" className="uppercase font-black text-xs py-2.5">
                    {t("nav.contact")}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSelector />
            <ThemeToggle />
            {user && <NotificationBell />}

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="hidden md:flex items-center gap-3">
              <Link to={setupReviewHref} className="btn-pill-primary-compact">
                Request Setup Review
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="btn-pill-ghost-compact">
                    {accountButtonLabel}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {isModerator && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4" />
                          {t("nav.console")}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {t("nav.my_profile")}
                      </Link>
                    </DropdownMenuItem>
                    {isModerator && <DropdownMenuSeparator />}
                    <DropdownMenuItem asChild>
                      <Link to="/preferences" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        {t("nav.preferences")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="flex items-center gap-2 text-red-500 focus:text-red-500"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("nav.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login" className="btn-pill-ghost-compact">
                  {t("nav.login")}
                </Link>
              )}
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              <Link
                to="/missed-call-text-back"
                className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors uppercase font-black py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Lead Recovery
              </Link>
              <Link
                to="/apps"
                className="text-sm text-muted-foreground hover:text-accent transition-colors uppercase font-black py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.apps")}
              </Link>
              <Link
                to="/workspace-ai"
                className="text-sm text-muted-foreground hover:text-accent transition-colors uppercase font-black py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.workspace_ai")}
              </Link>
              <Link
                to="/about"
                className="text-sm text-muted-foreground hover:text-accent transition-colors uppercase font-black py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.about")}
              </Link>
              <Link
                to="/contact"
                className="text-sm text-muted-foreground hover:text-accent transition-colors uppercase font-black py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.contact")}
              </Link>

              <div className="border-t border-border my-2"></div>

              <Link
                to={setupReviewHref}
                className="btn-pill-primary-compact mt-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Request Setup Review
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {user ? (
                <>
                  {isModerator && (
                    <Link
                      to="/admin"
                      className="text-sm text-muted-foreground hover:text-accent transition-colors uppercase font-black py-2 flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      {t("nav.console")}
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="text-sm text-muted-foreground hover:text-accent transition-colors uppercase font-black py-2 flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    {t("nav.my_profile")}
                  </Link>
                  <Link
                    to="/preferences"
                    className="text-sm text-muted-foreground hover:text-accent transition-colors uppercase font-black py-2 flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    {t("nav.preferences")}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm text-red-500 hover:text-red-600 transition-colors uppercase font-black py-2 flex items-center gap-2 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-sm text-muted-foreground hover:text-accent transition-colors uppercase font-black py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("nav.login")}
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <div data-page-content className={hasScheduledMaintenance ? "pt-[52px]" : ""}>
        <Outlet />
      </div>

      <footer className="border-t border-border py-6 px-4 sm:px-6 bg-card-soft">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 rounded-3xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 via-transparent to-accent/10 px-6 py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-yellow-400">
                  <PhoneCall className="h-3.5 w-3.5" />
                  Live Lead Recovery
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-foreground">
                  Turn missed calls into live conversations.
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  If your business loses jobs when the phone is missed, Northern Step Studio can set up an intake and response flow that keeps the lead engaged until you call back.
                </p>
              </div>
              <Link to={setupReviewHref} className="btn-pill-primary inline-flex items-center justify-center gap-2 whitespace-nowrap">
                Request Setup Review
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <Link to="/" className="inline-block">
                <img
                  src={BRAND_ASSETS.studioMark}
                  alt="Northern Step Studio"
                  className="h-10 w-auto opacity-80 hover:opacity-100 transition-opacity"
                />
              </Link>
              <p className="mt-4 text-sm text-muted-foreground font-normal">
                {t("footer.tagline")}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-black uppercase mb-4">{t("footer.products")}</h4>
              <ul className="space-y-2">
                <li><Link to="/apps" className="text-sm text-muted-foreground hover:text-accent transition-colors font-normal">{t("nav.apps")}</Link></li>
                <li><Link to="/missed-call-text-back" className="text-sm text-muted-foreground hover:text-accent transition-colors font-normal">{t("footer.missed_call")}</Link></li>
                <li><Link to="/docs" className="text-sm text-muted-foreground hover:text-accent transition-colors font-normal">{t("nav.docs")}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-black uppercase mb-4">{t("footer.company")}</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-sm text-muted-foreground hover:text-accent transition-colors font-normal">{t("footer.about")}</Link></li>
                <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-accent transition-colors font-normal">{t("footer.contact")}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-black uppercase mb-4">{t("footer.legal")}</h4>
              <ul className="space-y-2">
                <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-accent transition-colors font-normal">Terms & Privacy</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-6">
              {footerLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-xs sm:text-sm text-muted-foreground hover:text-accent transition-colors uppercase font-black"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/60 font-normal">
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
