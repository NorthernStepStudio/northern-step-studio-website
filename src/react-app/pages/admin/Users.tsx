import { useState, useEffect } from "react";
import { Users as UsersIcon, UserPlus, Mail, Shield, ShieldCheck, Trash2, Search } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { useAuth } from "@/react-app/lib/auth";
import { usePermissions } from "@/react-app/hooks/usePermissions";
import { getRoleDisplayLabel, OWNER_EMAIL } from "@/shared/auth";

interface User {
  id: number;
  email: string;
  display_name: string | null;
  role: string;
  created_at: string;
}

export default function Users() {
  const { user } = useAuth();
  const { isAdmin, isOwner, isLoading: permissionsLoading } = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"owner" | "admin" | "moderator" | "user">("user");
  const [inviteSending, setInviteSending] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (inviteRole === "owner" && (!isOwner || inviteEmail.trim().toLowerCase() !== OWNER_EMAIL)) {
      setInviteRole("user");
    }
  }, [inviteEmail, inviteRole, isOwner]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    setInviteSending(true);
    try {
      const res = await fetch("/api/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        await fetchUsers();
        setInviteEmail("");
        setInviteRole("user");
        setShowInviteForm(false);
        if (result.email_sent) {
          alert(`Invitation sent to ${inviteEmail}`);
        } else {
          alert(
            `User created for ${inviteEmail}, but the invite email did not send yet. Login URL: ${result.invite_url}${
              result.email_error ? `\nReason: ${result.email_error}` : ""
            }`,
          );
        }
      } else {
        const error = await res.json();
        alert(error.error || "Failed to send invitation");
      }
    } catch (error) {
      console.error("Failed to invite user:", error);
      alert("Failed to send invitation");
    } finally {
      setInviteSending(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (!confirm(`Change this user's role to ${getRoleDisplayLabel(newRole)}?`)) return;

    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        await fetchUsers();
      } else {
        const error = await res.json().catch(() => null);
        alert(error?.error || "Failed to update role");
      }
    } catch (error) {
      console.error("Failed to update role:", error);
      alert("Failed to update role");
    }
  };

  const handleDeleteUser = async (userId: number, email: string) => {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchUsers();
      } else {
        const error = await res.json().catch(() => null);
        alert(error?.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner": return ShieldCheck;
      case "admin": return ShieldCheck;
      case "moderator": return Shield;
      default: return UsersIcon;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner": return "text-yellow-400";
      case "admin": return "text-accent";
      case "moderator": return "text-blue-400";
      default: return "text-muted-foreground";
    }
  };

  if (permissionsLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <UsersIcon className="w-6 h-6 text-accent" />
          </div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-black uppercase mb-2">Admin Only</h1>
          <p className="text-muted-foreground">
            Only administrators can manage users.
          </p>
        </div>
      </div>
    );
  }

  const normalizedInviteEmail = inviteEmail.trim().toLowerCase();
  const inviteRoleOptions = [
    { value: "user", label: "User", icon: UsersIcon, desc: "Standard user" },
    { value: "moderator", label: "Moderator", icon: Shield, desc: "Content moderation" },
    { value: "admin", label: "Admin", icon: ShieldCheck, desc: "Full access" },
    ...(isOwner && normalizedInviteEmail === OWNER_EMAIL
      ? [{ value: "owner", label: getRoleDisplayLabel("owner"), icon: ShieldCheck, desc: "Reserved main studio account" }]
      : []),
  ] as const;

  const getAssignableRoles = (email: string) => {
    if (email === OWNER_EMAIL) {
      return [{ value: "owner", label: getRoleDisplayLabel("owner") }];
    }

    return [
      { value: "user", label: "User" },
      { value: "moderator", label: "Moderator" },
      { value: "admin", label: "Admin" },
    ];
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.display_name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">User Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage users and send invitations
          </p>
        </div>
        <Button onClick={() => setShowInviteForm(!showInviteForm)} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Invite User
        </Button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4">Send Invitation</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={inviteSending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {inviteRoleOptions.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => setInviteRole(role.value as "owner" | "admin" | "moderator" | "user")}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      inviteRole === role.value
                        ? "border-accent bg-accent/5"
                        : "border-border bg-card hover:border-accent/50"
                    }`}
                    disabled={inviteSending}
                  >
                    <role.icon className={`w-5 h-5 mb-2 ${inviteRole === role.value ? "text-accent" : "text-muted-foreground"}`} />
                    <p className="font-bold text-sm">{role.label}</p>
                    <p className="text-xs text-muted-foreground">{role.desc}</p>
                  </button>
                ))}
              </div>
              {isOwner && normalizedInviteEmail && normalizedInviteEmail !== OWNER_EMAIL && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Founder & CEO access is only available for <strong>{OWNER_EMAIL}</strong>.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={handleInvite} disabled={!inviteEmail.trim() || inviteSending}>
                <Mail className="w-4 h-4 mr-2" />
                {inviteSending ? "Sending..." : "Send Invitation"}
              </Button>
              <Button variant="outline" onClick={() => setShowInviteForm(false)} disabled={inviteSending}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users by email or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users List */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-secondary/30">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">All Users ({filteredUsers.length})</h2>
          </div>
        </div>

        <div className="divide-y divide-border">
          {filteredUsers.map((account) => {
            const RoleIcon = getRoleIcon(account.role);
            const roleColor = getRoleColor(account.role);
            const assignableRoles = getAssignableRoles(account.email);
            const roleSelectDisabled = account.email === OWNER_EMAIL;
            const deleteDisabled = account.email === OWNER_EMAIL || account.email === user?.email;

            return (
              <div key={account.id} className="p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg bg-accent/10`}>
                      <RoleIcon className={`w-5 h-5 ${roleColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{account.display_name || account.email}</p>
                      {account.display_name && (
                        <p className="text-xs text-muted-foreground truncate">{account.email}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Joined {new Date(account.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={account.role}
                      onChange={(e) => handleRoleChange(account.id, e.target.value)}
                      disabled={roleSelectDisabled}
                      className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-sm font-medium"
                    >
                      {assignableRoles.map((roleOption) => (
                        <option key={roleOption.value} value={roleOption.value}>
                          {roleOption.label}
                        </option>
                      ))}
                    </select>

                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={deleteDisabled}
                      onClick={() => handleDeleteUser(account.id, account.email)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? "No users match your search" : "No users yet"}
          </div>
        )}
      </div>
    </div>
  );
}
