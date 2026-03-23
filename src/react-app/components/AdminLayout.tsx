import { Outlet, Link, useLocation, Navigate } from "react-router";
import { LayoutDashboard, LogOut, Menu, X, Settings, User, Search, Clock3 } from "lucide-react";
import NotificationBell from "./NotificationBell";
import AdminCommandBar from "./AdminCommandBar";
import { useAuth } from "@/react-app/lib/auth";
import { useState, useMemo, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import { usePermissions } from "@/react-app/hooks/usePermissions";
import { BRAND_ASSETS } from "@/react-app/lib/site";
import { getRoleDisplayLabel } from "@/shared/auth";
import {
  ADMIN_NAV_ITEMS,
  ADMIN_RECENT_STORAGE_KEY,
  ADMIN_ROUTE_TO_PAGE,
  getAdminNavItem,
  type AdminNavItem,
} from "@/react-app/lib/adminNav";

export default function AdminLayout() {
  const location = useLocation();
  const { user, isPending, logout } = useAuth();
  const { canAccess, isLoading: permissionsLoading, userRole, isModerator } = usePermissions();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navQuery, setNavQuery] = useState("");
  const [recentPaths, setRecentPaths] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(ADMIN_RECENT_STORAGE_KEY);
      if (!stored) {
        return;
      }
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setRecentPaths(parsed.filter((value): value is string => typeof value === "string"));
      }
    } catch {
      // ignore storage issues
    }
  }, []);

  useEffect(() => {
    const item = getAdminNavItem(location.pathname);
    if (!item) {
      return;
    }

    setRecentPaths((current) => {
      const next = [item.path, ...current.filter((path) => path !== item.path)].slice(0, 5);
      try {
        window.localStorage.setItem(ADMIN_RECENT_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage issues
      }
      return next;
    });
  }, [location.pathname]);

  const availableItems = useMemo(() => {
    return ADMIN_NAV_ITEMS.filter((item) => {
      if (item.section === "settings") {
        return (userRole === "owner" || userRole === "admin") && canAccess(item.page);
      }
      return canAccess(item.page);
    });
  }, [canAccess, userRole]);

  const matchesQuery = (item: AdminNavItem) => {
    const query = navQuery.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return (
      item.label.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.page.toLowerCase().includes(query)
    );
  };

  const navItems = useMemo(() => {
    return availableItems.filter((item) => item.section === "core" && matchesQuery(item));
  }, [availableItems, navQuery]);

  const filteredStudioItems = useMemo(() => {
    return availableItems.filter((item) => item.section === "internal" && matchesQuery(item));
  }, [availableItems, navQuery]);

  const filteredSettingsItems = useMemo(() => {
    return availableItems.filter((item) => item.section === "settings" && matchesQuery(item));
  }, [availableItems, navQuery]);

  const recentItems = useMemo(() => {
    return recentPaths
      .map((path) => availableItems.find((item) => item.path === path))
      .filter((item): item is AdminNavItem => Boolean(item))
      .filter((item) => item.path !== location.pathname)
      .slice(0, 4);
  }, [availableItems, recentPaths, location.pathname]);

  // Check if current route is allowed
  const currentPage = ADMIN_ROUTE_TO_PAGE[location.pathname];
  const hasAccessToCurrentPage = currentPage ? canAccess(currentPage) : true;
  const currentItem = getAdminNavItem(location.pathname);

  if (isPending || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <img 
            src={BRAND_ASSETS.studioMark} 
            alt="Northern Step Studio" 
            className="h-14 w-auto mx-auto mb-4 opacity-50 animate-pulse"
          />
          <p className="text-muted-foreground font-normal">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isModerator) {
    return <Navigate to="/profile" replace />;
  }

  // If user doesn't have access to current page, show access denied
  if (!hasAccessToCurrentPage) {
    return (
      <div className="min-h-screen flex">
        {/* Sidebar still shows for navigation */}
        <SidebarContent 
          navItems={navItems}
          studioItems={filteredStudioItems}
          settingsItems={filteredSettingsItems}
          recentItems={recentItems}
          currentItem={currentItem}
          location={location}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          logout={logout}
          userRole={userRole}
          navQuery={navQuery}
          setNavQuery={setNavQuery}
        />
        
        {/* Access Denied Content */}
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <Settings className="w-10 h-10 text-destructive" />
              </div>
              <h1 className="text-2xl font-black uppercase mb-2">Access Denied</h1>
              <p className="text-muted-foreground mb-6">
                You don't have permission to view this page. Contact an administrator if you believe this is an error.
              </p>
              <Link 
                to="/admin" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-accent-foreground font-black uppercase text-sm hover:opacity-90 transition-opacity"
              >
                <LayoutDashboard className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <SidebarContent 
        navItems={navItems}
        studioItems={filteredStudioItems}
        settingsItems={filteredSettingsItems}
        recentItems={recentItems}
        currentItem={currentItem}
        location={location}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        logout={logout}
        userRole={userRole}
        navQuery={navQuery}
        setNavQuery={setNavQuery}
      />

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
        {currentItem && (
          <div className="mb-6 rounded-3xl border border-border bg-card-soft px-5 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <currentItem.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                    Admin Console
                  </p>
                  <h1 className="text-xl font-black uppercase tracking-tight text-foreground">
                    {currentItem.label}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {currentItem.description}
                  </p>
                </div>
              </div>

              {recentItems.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <AdminCommandBar
                    items={availableItems}
                    recentItems={recentItems}
                    triggerClassName="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-black uppercase tracking-wider text-muted-foreground transition-colors hover:border-accent/30 hover:text-accent"
                  />
                  {recentItems.slice(0, 3).map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-black uppercase tracking-wider text-muted-foreground transition-colors hover:border-accent/30 hover:text-accent"
                    >
                      <Clock3 className="h-3.5 w-3.5" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
              {recentItems.length === 0 && (
                <AdminCommandBar
                  items={availableItems}
                  recentItems={recentItems}
                  triggerClassName="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-black uppercase tracking-wider text-muted-foreground transition-colors hover:border-accent/30 hover:text-accent"
                />
              )}
            </div>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}

// Extracted sidebar component for reuse
interface SidebarContentProps {
  navItems: AdminNavItem[];
  studioItems: AdminNavItem[];
  settingsItems: AdminNavItem[];
  recentItems: AdminNavItem[];
  currentItem: AdminNavItem | null;
  location: { pathname: string };
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  logout: () => void;
  userRole: string;
  navQuery: string;
  setNavQuery: (query: string) => void;
}

function SidebarContent({
  navItems,
  studioItems,
  settingsItems,
  recentItems,
  currentItem,
  location,
  mobileMenuOpen,
  setMobileMenuOpen,
  logout,
  userRole,
  navQuery,
  setNavQuery,
}: SidebarContentProps) {
  const hasVisibleItems = navItems.length > 0 || studioItems.length > 0 || settingsItems.length > 0;

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card-soft border-b border-border px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src={BRAND_ASSETS.studioMark} 
            alt="Northern Step Studio" 
            className="h-9 w-auto"
          />
          <div>
            <p className="text-[10px] text-muted-foreground font-normal uppercase tracking-wider">Admin</p>
            {currentItem && (
              <p className="text-xs font-black uppercase tracking-wide text-foreground">
                {currentItem.label}
              </p>
            )}
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`w-64 border-r border-border bg-card-soft p-6 fixed h-full z-40 transition-transform lg:translate-x-0 flex flex-col ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="hidden lg:flex items-center justify-between mb-8 flex-shrink-0">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={BRAND_ASSETS.studioLogo} 
              alt="Northern Step Studio" 
              className="h-10 w-auto"
            />
            <div>
              <p className="text-xs text-muted-foreground font-normal uppercase tracking-wider">Admin</p>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </div>

        {/* Role Badge */}
        <div className="mb-4 px-4">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
            userRole === "owner"
              ? "bg-yellow-500/20 text-yellow-400"
              : userRole === "admin" 
              ? "bg-accent/20 text-accent" 
              : userRole === "moderator"
                ? "bg-purple-500/20 text-purple-400"
                : "bg-secondary text-muted-foreground"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {getRoleDisplayLabel(userRole)}
          </span>
        </div>

        {currentItem && (
          <div className="mb-4 px-4">
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <currentItem.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                    Current section
                  </p>
                  <h2 className="mt-1 text-sm font-black uppercase tracking-wide text-foreground">
                    {currentItem.label}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {currentItem.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4 px-4">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Search admin
          </label>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={navQuery}
              onChange={(event) => setNavQuery(event.target.value)}
              placeholder="Apps, revenue, users..."
              className="w-full rounded-2xl border border-border bg-background py-3 pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </div>

        <nav className="space-y-2 mt-2 lg:mt-0 flex-1 overflow-y-auto">
          {!navQuery.trim() && recentItems.length > 0 && (
            <div className="pb-4 mb-4 border-b border-border">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-2 px-4">Recent</p>
              {recentItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-black text-xs sm:text-sm uppercase ${
                      isActive
                        ? "bg-accent/10 text-accent border border-accent/30"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Clock3 className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}

          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-black text-xs sm:text-sm uppercase ${
                  isActive
                    ? "bg-accent/10 text-accent border border-accent/30"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
          
          {/* Studio Section Divider - only show if user has access to studio items */}
          {studioItems.length > 0 && (
            <div className="pt-4 mt-4 border-t border-border">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-2 px-4">Internal</p>
              {studioItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-black text-xs sm:text-sm uppercase ${
                      isActive
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Settings Section - only for owner/admin */}
          {settingsItems.length > 0 && (
            <div className="pt-4 mt-4 border-t border-border">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-2 px-4">Settings</p>
              {settingsItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-black text-xs sm:text-sm uppercase ${
                      isActive
                        ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}

          {!hasVisibleItems && (
            <div className="px-4 py-6 text-sm text-muted-foreground">
              No admin sections match this search.
            </div>
          )}
        </nav>

        <div className="flex-shrink-0 pt-4 mt-4 border-t border-border space-y-2">
          <Link
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-secondary border border-border hover:bg-accent/10 hover:border-accent transition-all font-black uppercase text-xs sm:text-sm"
          >
            <User className="w-4 h-4" />
            My Profile
          </Link>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-secondary border border-border hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-all font-black uppercase text-xs sm:text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
          <Link
            to="/"
            className="block w-full text-center py-3 rounded-full bg-secondary border border-border hover:bg-accent/10 hover:border-accent transition-all font-black uppercase text-xs sm:text-sm"
          >
            Exit Admin
          </Link>
        </div>
      </aside>
    </>
  );
}
