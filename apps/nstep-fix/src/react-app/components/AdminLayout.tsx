import { Outlet, Link, useLocation, Navigate } from "react-router";
import { LayoutDashboard, LogOut, Menu, X, Settings, User, Search, Clock3 } from "lucide-react";
import NotificationBell from "./NotificationBell";
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
            className="h-10 w-auto mx-auto mb-4 opacity-50 animate-pulse"
          />
          <p className="text-muted-foreground font-normal text-xs uppercase tracking-widest">Loading...</p>
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

  const sidebarProps: SidebarContentProps = {
    navItems,
    studioItems: filteredStudioItems,
    settingsItems: filteredSettingsItems,
    recentItems,
    currentItem,
    location,
    mobileMenuOpen,
    setMobileMenuOpen,
    logout,
    userRole,
    navQuery,
    setNavQuery,
  };

  if (!hasAccessToCurrentPage) {
    return (
      <div className="min-h-screen flex bg-background">
        <AccountSidebar logout={logout} />
        
        <main className="flex-1 lg:ml-52 lg:mr-56 p-4 sm:p-5 lg:p-6 pt-20 lg:pt-6">
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-3xl bg-destructive/10 flex items-center justify-center mx-auto mb-5">
                <Settings className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-xl font-black uppercase mb-2">Access Denied</h1>
              <p className="text-sm text-muted-foreground mb-6">
                You don't have permission to view this page. Contact an administrator if you believe this is an error.
              </p>
              <Link 
                to="/admin" 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-accent-foreground font-black uppercase text-xs hover:opacity-90 transition-opacity"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </main>

        <SidebarContent {...sidebarProps} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AccountSidebar logout={logout} />

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-52 lg:mr-56 p-4 sm:p-5 lg:p-6 pt-20 lg:pt-6">
        {currentItem && (
          <div className="mb-5 rounded-2xl border border-border bg-card-soft px-4 py-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <currentItem.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">
                    Admin Console
                  </p>
                  <h1 className="text-base font-black uppercase tracking-tight text-foreground -mt-0.5">
                    {currentItem.label}
                  </h1>
                </div>
              </div>

              {recentItems.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 focus-within:z-10">
                  {recentItems.slice(0, 3).map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground transition-all hover:border-accent/40 hover:text-accent hover:bg-accent/5 active:scale-95"
                    >
                      <Clock3 className="h-3 w-3" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        <div className="max-w-6xl mx-auto lg:mx-0">
          <Outlet />
        </div>
      </main>

      <SidebarContent {...sidebarProps} />
    </div>
  );
}

function AccountSidebar({ logout }: { logout: () => void }) {
  return (
    <aside className="hidden lg:flex flex-col w-52 border-r border-border bg-card-soft p-5 fixed h-full z-40">
      <div className="mb-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img 
            src={BRAND_ASSETS.studioLogo} 
            alt="Northern Step Studio" 
            className="h-7 w-auto"
          />
          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Studio</span>
        </Link>
      </div>

      <div className="flex-1 space-y-4">
        <div className="px-1">
          <p className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-[0.15em] mb-3">System</p>
          <div className="space-y-1.5">
            <Link
              to="/profile"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-transparent hover:border-border hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all font-black uppercase text-[11px]"
            >
              <User className="w-3.5 h-3.5" />
              My Profile
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-transparent hover:border-border hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all font-black uppercase text-[11px]"
            >
              <LogOut className="w-3.5 h-3.5 rotate-180" />
              Exit Admin
            </Link>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-destructive-foreground transition-all font-black uppercase text-[10px]"
        >
          <LogOut className="w-3.5 h-3.5" />
          Secure Logout
        </button>
      </div>
    </aside>
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
  location,
  mobileMenuOpen,
  setMobileMenuOpen,
  userRole,
  navQuery,
  setNavQuery,
}: SidebarContentProps) {
  const hasVisibleItems = navItems.length > 0 || studioItems.length > 0 || settingsItems.length > 0;

  return (
    <>
      {/* Mobile Header (unchanged positioning, just scale) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card-soft border-b border-border px-4 py-2 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src={BRAND_ASSETS.studioMark} 
            alt="Northern Step Studio" 
            className="h-7 w-auto"
          />
          <div>
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-wider">Admin</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Navigation Sidebar (Right Side) */}
      <aside className={`w-56 border-l border-border bg-card-soft p-5 fixed right-0 h-full z-40 transition-transform lg:translate-x-0 flex flex-col ${
        mobileMenuOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      }`}>
        <div className="hidden lg:flex items-center justify-between mb-6 flex-shrink-0">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Navigation</h2>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </div>

        {/* Role Badge */}
        <div className="mb-4">
          <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            userRole === "owner"
              ? "bg-yellow-500/20 text-yellow-400"
              : userRole === "admin" 
              ? "bg-accent/20 text-accent" 
              : userRole === "moderator"
                ? "bg-purple-500/20 text-purple-400"
                : "bg-secondary text-muted-foreground"
          }`}>
            <span className="w-1 h-1 rounded-full bg-current" />
            {getRoleDisplayLabel(userRole)}
          </span>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
            <input
              value={navQuery}
              onChange={(event) => setNavQuery(event.target.value)}
              placeholder="Search..."
              className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-xs transition-all focus:outline-none focus:ring-1 focus:ring-accent/40"
            />
          </div>
        </div>

        <nav className="space-y-1 mt-2 lg:mt-0 flex-1 overflow-y-auto pr-1 theme-scrollbar">
          {!navQuery.trim() && recentItems.length > 0 && (
            <div className="pb-3 mb-3 border-b border-border">
              <p className="text-[9px] text-muted-foreground/40 uppercase tracking-widest mb-2 px-3">Recent</p>
              {recentItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all font-bold text-[11px] uppercase ${
                      isActive
                        ? "bg-accent/10 text-accent border border-accent/20"
                        : "text-muted-foreground/70 hover:bg-secondary hover:text-foreground border border-transparent"
                    }`}
                  >
                    <Clock3 className="w-4 h-4" />
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
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all font-black text-[11px] uppercase ${
                  isActive
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "text-muted-foreground/70 hover:bg-secondary hover:text-foreground border border-transparent"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          
          {studioItems.length > 0 && (
            <div className="pt-3 mt-3 border-t border-border">
              <p className="text-[9px] text-muted-foreground/40 uppercase tracking-widest mb-2 px-3">Internal</p>
              {studioItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all font-bold text-[11px] uppercase ${
                      isActive
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        : "text-muted-foreground/70 hover:bg-secondary hover:text-foreground border border-transparent"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}

          {settingsItems.length > 0 && (
            <div className="pt-3 mt-3 border-t border-border">
              <p className="text-[9px] text-muted-foreground/40 uppercase tracking-widest mb-2 px-3">Settings</p>
              {settingsItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all font-bold text-[11px] uppercase ${
                      isActive
                        ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        : "text-muted-foreground/70 hover:bg-secondary hover:text-foreground border border-transparent"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}

          {!hasVisibleItems && (
            <div className="px-3 py-4 text-[11px] text-muted-foreground">
              No results found.
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}

// Extracted sidebar component for reuse
interface SidebarContentProps {
  navItems: AdminNavItem[];
  studioItems: AdminNavItem[];
  settingsItems: AdminNavItem[];
  recentItems: AdminNavItem[];
  location: { pathname: string };
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  userRole: string;
  navQuery: string;
  setNavQuery: (query: string) => void;
}
