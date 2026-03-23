export const ADMIN_EMAIL_DOMAIN = "northernstepstudio.com";
export const ADMIN_EMAIL_SUFFIX = `@${ADMIN_EMAIL_DOMAIN}`;
export const OWNER_EMAIL = `admin@${ADMIN_EMAIL_DOMAIN}`;

export function isAdminDomainEmail(email: string) {
  return email.trim().toLowerCase().endsWith(ADMIN_EMAIL_SUFFIX);
}

export function isElevatedRole(role: string | null | undefined) {
  return role === "moderator" || role === "admin" || role === "owner";
}

export function getRoleDisplayLabel(role: string | null | undefined, options?: { compact?: boolean }) {
  switch (role) {
    case "owner":
      return options?.compact ? "CEO" : "Founder & CEO";
    case "admin":
      return "Admin";
    case "moderator":
      return "Moderator";
    default:
      return "User";
  }
}
