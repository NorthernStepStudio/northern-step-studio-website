import { useState, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  LayoutDashboard,
  AppWindow,
  BarChart3,
  FileText,
  Inbox,
  Megaphone,
  Users,
  Settings,
  Briefcase,
  DollarSign,
  Save,
  ShieldAlert,
  MessageSquare,
  Bell,
} from "lucide-react";
import { usePermissions } from "@/react-app/hooks/usePermissions";
import { Link } from "react-router";

interface Permission {
  id: number;
  role: string;
  page: string;
  can_access: number;
}

const ROLES = [
  { value: "admin", label: "Admin", icon: ShieldCheck, description: "Full access to all features", color: "text-accent" },
  { value: "moderator", label: "Moderator", icon: Shield, description: "Limited access for content moderation", color: "text-blue-400" },
];

const PAGES = [
  { value: "dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Main admin overview" },
  { value: "apps", label: "App Manager", icon: AppWindow, description: "Manage apps and games" },
  { value: "analytics", label: "Analytics", icon: BarChart3, description: "View traffic and events" },
  { value: "leads", label: "Lead Inbox", icon: Inbox, description: "Review setup requests and contact leads" },
  { value: "content", label: "Content Manager", icon: FileText, description: "Blog posts and content" },
  { value: "community", label: "Community", icon: MessageSquare, description: "Moderate threads and discussions" },
  { value: "updates", label: "Updates", icon: Bell, description: "Publish portfolio updates" },
  { value: "promos", label: "Promotions", icon: Megaphone, description: "Campaigns and promotions" },
  { value: "users", label: "User Manager", icon: Users, description: "Manage user accounts" },
  { value: "permissions", label: "Permissions", icon: Settings, description: "Role-based access control" },
  { value: "studio", label: "Studio Dashboard", icon: Briefcase, description: "Internal workspace" },
  { value: "revenue", label: "Revenue", icon: DollarSign, description: "Stripe payments and revenue" },
];

export default function Permissions() {
  const { isAdmin, isLoading: permissionsLoading } = usePermissions();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState("moderator");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [localPermissions, setLocalPermissions] = useState<Record<string, boolean>>({});

  const fetchPermissions = async () => {
    try {
      const res = await fetch("/api/permissions");
      if (res.ok) {
        const data = await res.json();
        setPermissions(data);
      }
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      void fetchPermissions();
    }
  }, [isAdmin]);

  useEffect(() => {
    const rolePerms: Record<string, boolean> = {};
    permissions
      .filter((permission) => permission.role === selectedRole)
      .forEach((permission) => {
        rolePerms[permission.page] = permission.can_access === 1;
      });
    setLocalPermissions(rolePerms);
    setHasChanges(false);
  }, [selectedRole, permissions]);

  if (permissionsLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Shield className="w-6 h-6 text-accent" />
          </div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-black uppercase mb-2">Admin Only</h1>
          <p className="text-muted-foreground mb-6">
            Only administrators can view and modify permissions. Contact an admin if you need access changes.
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
    );
  }

  const togglePermission = (page: string) => {
    if (selectedRole === "admin") return;

    setLocalPermissions((prev) => ({
      ...prev,
      [page]: !prev[page],
    }));
    setHasChanges(true);
  };

  const savePermissions = async () => {
    setIsSaving(true);
    try {
      for (const page of PAGES.map((item) => item.value)) {
        await fetch("/api/permissions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: selectedRole,
            page,
            can_access: localPermissions[page] ?? false,
          }),
        });
      }
      await fetchPermissions();
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save permissions:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedRoleInfo = ROLES.find((role) => role.value === selectedRole) || ROLES[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Permissions</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure what each role can access</p>
        </div>
        {hasChanges && (
          <button onClick={savePermissions} disabled={isSaving} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>

      <div className="flex gap-3">
        {ROLES.map((role) => (
          <button
            key={role.value}
            onClick={() => setSelectedRole(role.value)}
            className={`flex-1 sm:flex-none px-6 py-4 rounded-xl border-2 transition-all ${
              selectedRole === role.value ? "border-accent bg-accent/5" : "border-border bg-card hover:border-accent/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <role.icon className={`w-6 h-6 ${role.color}`} />
              <div className="text-left">
                <p className="font-bold">{role.label}</p>
                <p className="text-xs text-muted-foreground">{role.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedRole === "admin" && (
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 flex items-center gap-3">
          <Lock className="w-5 h-5 text-accent flex-shrink-0" />
          <p className="text-sm">
            <span className="font-semibold">Admin permissions are locked.</span> Admins always have full access to all
            features for security reasons.
          </p>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            <selectedRoleInfo.icon className={`w-5 h-5 ${selectedRoleInfo.color}`} />
            <h2 className="font-bold">{selectedRoleInfo.label} Access</h2>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading permissions...</div>
        ) : (
          <div className="divide-y divide-border">
            {PAGES.map((page) => {
              const hasAccess = localPermissions[page.value] ?? false;
              const isAdminRole = selectedRole === "admin";

              return (
                <div
                  key={page.value}
                  onClick={() => togglePermission(page.value)}
                  className={`flex items-center justify-between p-4 transition-colors ${
                    isAdminRole ? "cursor-not-allowed" : "cursor-pointer hover:bg-secondary/30"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${hasAccess || isAdminRole ? "bg-accent/10" : "bg-secondary"}`}>
                      <page.icon className={`w-5 h-5 ${hasAccess || isAdminRole ? "text-accent" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="font-medium">{page.label}</p>
                      <p className="text-xs text-muted-foreground">{page.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isAdminRole ? (
                      <div className="flex items-center gap-2 text-accent">
                        <Lock className="w-4 h-4" />
                        <span className="text-sm font-medium">Always On</span>
                      </div>
                    ) : (
                      <button
                        className={`relative w-12 h-7 rounded-full transition-colors ${
                          hasAccess ? "bg-accent" : "bg-secondary"
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                            hasAccess ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-secondary/50 rounded-xl p-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Unlock className="w-4 h-4" />
          How Permissions Work
        </h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>- <strong>Admin:</strong> Full access to everything. Cannot be restricted.</li>
          <li>- <strong>Moderator:</strong> Customizable access. Toggle pages on or off as needed.</li>
          <li>- <strong>User:</strong> Public users. No admin panel access.</li>
        </ul>
      </div>
    </div>
  );
}
