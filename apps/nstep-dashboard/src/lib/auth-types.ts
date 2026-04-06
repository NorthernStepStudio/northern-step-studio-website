export type DashboardRole = "viewer" | "analyst" | "operator" | "admin";

export interface DashboardSession {
  readonly username: string;
  readonly role: DashboardRole;
  readonly tenantId: string;
  readonly displayName: string;
  readonly email?: string;
  readonly issuedAt: string;
  readonly expiresAt: string;
}

export interface DashboardAuthUserConfig {
  readonly username: string;
  readonly password: string;
  readonly role: DashboardRole;
  readonly tenantId: string;
  readonly displayName?: string;
  readonly email?: string;
}
