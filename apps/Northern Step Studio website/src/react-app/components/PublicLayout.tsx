import { Outlet, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/react-app/lib/auth";
import { brandifyText } from "@/react-app/lib/brand";
import { LogOut, User, Settings, AlertTriangle, X, Menu, ArrowRight, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";
import LanguageSelector from "./LanguageSelector";
import { usePermissions } from "@/react-app/hooks/usePermissions";
import { Button } from "@/react-app/components/ui/button";
import NStepBrand from "./NStepBrand";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/react-app/components/ui/dropdown-menu";

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
    { label: t("nav.workspace_ai"), to: "/workspace-ai" },
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
            <NStepBrand className="hidden sm:inline-flex" markClassName="h-10 w-10" wordmarkClassName="text-sm" />
            <NStepBrand className="sm:hidden" markClassName="h-10 w-10" showWordmark={false} />
          </Link>

          <nav className="hidden md:flex items-center gap-5 xl:gap-7 min-w-0">
            <Link to="/games" className="text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground hover:text-accent transition-colors uppercase font-black whitespace-nowrap">
              {t("nav.games", "GAMES")}
            </Link>
            <Link to="/apps" className="text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground hover:text-accent transition-colors uppercase font-black whitespace-nowrap">
              {t("nav.apps")}
            </Link>
            <Link to="/services" className="text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground hover:text-accent transition-colors uppercase font-black whitespace-nowrap">
              {t("nav.services")}
            </Link>
            <Link to="/contact" className="text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground hover:text-accent transition-colors uppercase font-black whitespace-nowrap">
              {t("nav.contact")}
            </Link>
            <Link to="/about" className="text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground hover:text-accent transition-colors uppercase font-black whitespace-nowrap">
              {t("nav.about")}
            </Link>
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
                {t("common.setup_review_short")}
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
                to="/games"
                className="text-sm text-muted-foreground hover:text-accent transition-colors uppercase font-black py-2 whitespace-nowrap"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.games", "GAMES")}
              </Link>
              <Link
                to="/apps"
                className="text-sm text-muted-foreground hover:text-accent transition-colors uppercase font-black py-2 whitespace-nowrap"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.apps")}
              </Link>
              <Link
                to="/services"
                className="text-sm text-muted-foreground hover:text-accent transition-colors uppercase font-black py-2 whitespace-nowrap"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.services")}
              </Link>
              <Link
                to="/about"
                className="text-sm text-muted-foreground hover:text-accent transition-colors uppercase font-black py-2 whitespace-nowrap"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.about")}
              </Link>
              <Link
                to="/contact"
                className="text-sm text-muted-foreground hover:text-accent transition-colors uppercase font-black py-2 whitespace-nowrap"
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
                {t("common.setup_review_short")}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <Link to="/" className="inline-block">
                <NStepBrand markClassName="h-10 w-10" wordmarkClassName="text-sm" />
              </Link>
              <p className="mt-3 text-xs font-black uppercase tracking-[0.24em] text-foreground">
                {brandifyText("Northern Step Studio")}
              </p>
              <p className="mt-4 text-sm text-muted-foreground font-normal">
                {t("footer.tagline")}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-black uppercase mb-4">{t("footer.products")}</h4>
              <ul className="space-y-2">
                <li><Link to="/games" className="text-sm text-muted-foreground hover:text-accent transition-colors font-normal">{t("nav.games", "Games")}</Link></li>
                <li><Link to="/apps" className="text-sm text-muted-foreground hover:text-accent transition-colors font-normal">{t("nav.apps")}</Link></li>
                <li><Link to="/services" className="text-sm text-muted-foreground hover:text-accent transition-colors font-normal">{t("nav.services")}</Link></li>
                <li><Link to="/docs" className="text-sm text-muted-foreground hover:text-accent transition-colors font-normal">{t("nav.docs")}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-black uppercase mb-4">{t("footer.company")}</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-sm text-muted-foreground hover:text-accent transition-colors font-normal">{t("footer.about")}</Link></li>
                <li><Link to="/workspace-ai" className="text-sm text-muted-foreground hover:text-accent transition-colors font-normal">{t("nav.workspace_ai")}</Link></li>
                <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-accent transition-colors font-normal">{t("footer.contact")}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-black uppercase mb-4">{t("footer.legal")}</h4>
              <ul className="space-y-2">
                <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-accent transition-colors font-normal">{t("footer.terms")} & {t("footer.privacy")}</Link></li>
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
