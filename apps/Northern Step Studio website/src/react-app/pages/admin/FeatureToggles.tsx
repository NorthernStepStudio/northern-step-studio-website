import { useState, useEffect } from "react";
import { apiFetch } from "@/react-app/lib/api";
import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  CreditCard,
  Database,
  HardDrive,
  KeyRound,
  Link2,
  Server,
  Shield,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { getRoleDisplayLabel } from "@/shared/auth";

interface FeatureToggle {
  id: number;
  feature_key: string;
  feature_name: string;
  is_enabled: boolean;
  description: string;
}

interface IntegrationStatus {
  cloudflare: {
    d1Configured: boolean;
    d1Connected: boolean;
    r2Configured: boolean;
    assetsConfigured: boolean;
    emailServiceConfigured: boolean;
  };
  supabase: {
    urlConfigured: boolean;
    anonKeyConfigured: boolean;
    serviceRoleKeyConfigured: boolean;
    projectRefConfigured: boolean;
    host: string | null;
    connectionStatus: "not_configured" | "ready" | "failed";
    connectionError: string | null;
  };
  auth: {
    googleConfigured: boolean;
    localPasswordEnabled: boolean;
  };
  billing: {
    stripeConfigured: boolean;
  };
}

export default function FeatureToggles() {
  const [features, setFeatures] = useState<FeatureToggle[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus | null>(null);
  const [integrationError, setIntegrationError] = useState<string | null>(null);
  const stripePublishableKeyConfigured = Boolean(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim());

  useEffect(() => {
    void loadFeatures();
    void loadIntegrationStatus();
  }, []);

  const loadFeatures = async () => {
    try {
      const res = await apiFetch("/api/feature-toggles");
      if (!res.ok) {
        throw new Error("Failed to fetch feature toggles");
      }

      const data = await res.json();
      setFeatures(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load features:", err);
      setFeatures([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = async (feature: FeatureToggle) => {
    setUpdating(feature.id);

    try {
      const res = await apiFetch(`/api/feature-toggles/${feature.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_enabled: !feature.is_enabled }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.error || "Failed to update feature");
      }

      await loadFeatures();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update feature");
    } finally {
      setUpdating(null);
    }
  };

  const loadIntegrationStatus = async () => {
    try {
      const res = await apiFetch("/api/integrations/status");
      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.error || "Failed to load infrastructure status");
      }

      const data = await res.json();
      setIntegrationStatus(data as IntegrationStatus);
      setIntegrationError(null);
    } catch (err) {
      setIntegrationStatus(null);
      setIntegrationError(err instanceof Error ? err.message : "Failed to load infrastructure status");
    }
  };

  const renderStatusPill = (isReady: boolean, label: string) => (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
        isReady ? "bg-green-500/15 text-green-400" : "bg-amber-500/15 text-amber-400"
      }`}
    >
      {isReady ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
      {label}
    </span>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Shield className="w-6 h-6 text-accent" />
        <div>
          <h1 className="text-2xl font-bold">
            Feature Toggles <span className="text-sm text-muted-foreground">({features.length} features)</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Control which features and pages are visible to users and moderators
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {features.map((feature) => (
          <div
            key={feature.id}
            className={`border rounded-xl p-6 transition-all ${
              feature.is_enabled
                ? "bg-green-500/5 border-green-500/20 hover:border-green-500/40"
                : "bg-red-500/5 border-red-500/20 hover:border-red-500/40"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg">{feature.feature_name}</h3>
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                    {feature.feature_key}
                  </span>
                </div>
                {feature.description && <p className="text-sm text-muted-foreground">{feature.description}</p>}
              </div>

              <button
                onClick={() => toggleFeature(feature)}
                disabled={updating === feature.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  feature.is_enabled
                    ? "bg-accent/20 text-accent hover:bg-accent/30"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                } ${updating === feature.id ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {feature.is_enabled ? (
                  <>
                    <ToggleRight className="w-5 h-5" />
                    Enabled
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-5 h-5" />
                    Disabled
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Link2 className="w-6 h-6 text-accent" />
          <div>
            <h2 className="text-xl font-bold">Infrastructure Status</h2>
            <p className="text-sm text-muted-foreground">
              Cloudflare remains the live frontend/backend host. Supabase is wired as an optional backend target and will show as ready once secrets are configured.
            </p>
          </div>
        </div>

        {integrationError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {integrationError}
          </div>
        ) : integrationStatus ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card-soft p-5">
              <div className="mb-4 flex items-center gap-3">
                <Cloud className="w-5 h-5 text-accent" />
                <div>
                  <h3 className="font-bold">Cloudflare</h3>
                  <p className="text-xs text-muted-foreground">Current production host and asset/runtime layer</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-accent" />
                    <span>D1 database binding</span>
                  </div>
                  {renderStatusPill(integrationStatus.cloudflare.d1Configured, integrationStatus.cloudflare.d1Configured ? "Bound" : "Missing")}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-accent" />
                    <span>D1 connectivity</span>
                  </div>
                  {renderStatusPill(integrationStatus.cloudflare.d1Connected, integrationStatus.cloudflare.d1Connected ? "Ready" : "Failed")}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-accent" />
                    <span>R2 media bucket</span>
                  </div>
                  {renderStatusPill(integrationStatus.cloudflare.r2Configured, integrationStatus.cloudflare.r2Configured ? "Bound" : "Missing")}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-accent" />
                    <span>Static asset binding</span>
                  </div>
                  {renderStatusPill(integrationStatus.cloudflare.assetsConfigured, integrationStatus.cloudflare.assetsConfigured ? "Bound" : "Missing")}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-accent" />
                    <span>Email service binding</span>
                  </div>
                  {renderStatusPill(
                    integrationStatus.cloudflare.emailServiceConfigured,
                    integrationStatus.cloudflare.emailServiceConfigured ? "Bound" : "Missing",
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card-soft p-5">
              <div className="mb-4 flex items-center gap-3">
                <Database className="w-5 h-5 text-accent" />
                <div>
                  <h3 className="font-bold">Supabase</h3>
                  <p className="text-xs text-muted-foreground">Optional backend connection for future data migration or hybrid services</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-accent" />
                    <span>Project URL</span>
                  </div>
                  {renderStatusPill(integrationStatus.supabase.urlConfigured, integrationStatus.supabase.urlConfigured ? "Configured" : "Missing")}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-accent" />
                    <span>Anon key</span>
                  </div>
                  {renderStatusPill(integrationStatus.supabase.anonKeyConfigured, integrationStatus.supabase.anonKeyConfigured ? "Configured" : "Missing")}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-accent" />
                    <span>Service role key</span>
                  </div>
                  {renderStatusPill(
                    integrationStatus.supabase.serviceRoleKeyConfigured,
                    integrationStatus.supabase.serviceRoleKeyConfigured ? "Configured" : "Missing",
                  )}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-accent" />
                    <span>Project ref</span>
                  </div>
                  {renderStatusPill(
                    integrationStatus.supabase.projectRefConfigured,
                    integrationStatus.supabase.projectRefConfigured ? "Configured" : "Missing",
                  )}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-accent" />
                    <span>Connection check</span>
                  </div>
                  {renderStatusPill(
                    integrationStatus.supabase.connectionStatus === "ready",
                    integrationStatus.supabase.connectionStatus === "ready"
                      ? "Ready"
                      : integrationStatus.supabase.connectionStatus === "failed"
                        ? "Failed"
                        : "Waiting",
                  )}
                </div>
                {integrationStatus.supabase.host && (
                  <p className="text-xs text-muted-foreground">Host: {integrationStatus.supabase.host}</p>
                )}
                {integrationStatus.supabase.connectionError && (
                  <p className="text-xs text-destructive">{integrationStatus.supabase.connectionError}</p>
                )}
                <div className="rounded-xl border border-border bg-background/40 px-3 py-3 text-xs text-muted-foreground">
                  Add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_PROJECT_REF` to local secrets or Worker env to turn on the connection check.
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card-soft p-5">
              <div className="mb-4 flex items-center gap-3">
                <Shield className="w-5 h-5 text-accent" />
                <div>
                  <h3 className="font-bold">Auth & Billing</h3>
                  <p className="text-xs text-muted-foreground">Login providers and payment analytics dependencies</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-accent" />
                    <span>Google OAuth</span>
                  </div>
                  {renderStatusPill(
                    integrationStatus.auth.googleConfigured,
                    integrationStatus.auth.googleConfigured ? "Configured" : "Missing",
                  )}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-accent" />
                    <span>Stripe publishable key</span>
                  </div>
                  {renderStatusPill(
                    stripePublishableKeyConfigured,
                    stripePublishableKeyConfigured ? "Configured" : "Missing",
                  )}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-accent" />
                    <span>Local password auth</span>
                  </div>
                  {renderStatusPill(
                    integrationStatus.auth.localPasswordEnabled,
                    integrationStatus.auth.localPasswordEnabled ? "Enabled" : "Disabled",
                  )}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-accent" />
                    <span>Stripe revenue analytics</span>
                  </div>
                  {renderStatusPill(
                    integrationStatus.billing.stripeConfigured,
                    integrationStatus.billing.stripeConfigured ? "Configured" : "Missing",
                  )}
                </div>
                <div className="rounded-xl border border-border bg-background/40 px-3 py-3 text-xs text-muted-foreground">
                  Google OAuth needs `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Public Stripe UI needs `VITE_STRIPE_PUBLISHABLE_KEY`, and revenue cards need `STRIPE_SECRET_KEY`.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card-soft p-6 text-sm text-muted-foreground">
            Infrastructure status is unavailable.
          </div>
        )}
      </div>

      <div className="bg-muted/50 border border-border rounded-xl p-6">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-accent" />
          Permission Levels
        </h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>
            - <strong className="text-yellow-500">{getRoleDisplayLabel("owner")}</strong> and{" "}
            <strong className="text-primary">Admin</strong>: Can see and access all features
          </li>
          <li>
            - <strong className="text-accent">Moderator</strong>: Can only access enabled features
          </li>
          <li>
            - <strong className="text-foreground">User</strong>: Can only access enabled features
          </li>
        </ul>
      </div>
    </div>
  );
}


