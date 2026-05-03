import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, ExternalLink, Loader2, RefreshCcw, TriangleAlert } from "lucide-react";
import { apiFetch } from "@/react-app/lib/api";

type MgboardIntegrationResponse = {
  url?: string;
  source?: string;
};

function resolveFallbackUrl() {
  return "https://nstep-mgboard.pages.dev";
}

function sanitizeLaunchUrl(candidate: string | null | undefined): { url: string; unsafe: boolean } {
  const raw = candidate?.trim();
  if (!raw) {
    return { url: resolveFallbackUrl(), unsafe: false };
  }

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { url: resolveFallbackUrl(), unsafe: true };
    }

    return { url: parsed.toString(), unsafe: false };
  } catch {
    return { url: resolveFallbackUrl(), unsafe: true };
  }
}

export default function AdminMGBoard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [launchUrl, setLaunchUrl] = useState<string>(resolveFallbackUrl());
  const [urlSource, setUrlSource] = useState<string>("fallback");
  const [frameKey, setFrameKey] = useState(0);

  const loadIntegration = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch("/api/integrations/mgboard");
      const payload = (await response.json().catch(() => null)) as MgboardIntegrationResponse | null;

      if (!response.ok) {
        throw new Error("Failed to load MGBoard integration settings.");
      }

      const sanitized = sanitizeLaunchUrl(payload?.url);
      setLaunchUrl(sanitized.url);
      setUrlSource(payload?.source || "fallback");
      if (sanitized.unsafe) {
        setError("Integration returned an invalid MGBoard URL. Safe HTTPS fallback is active.");
      }
      setFrameKey((current) => current + 1);
    } catch (integrationError) {
      console.error("MGBoard integration lookup failed:", integrationError);
      setLaunchUrl(resolveFallbackUrl());
      setUrlSource("fallback");
      setError("Unable to load integration config. Fallback URL is active.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadIntegration();
  }, [loadIntegration]);

  const openNewTab = useCallback(() => {
    if (typeof window === "undefined") return;
    const sanitized = sanitizeLaunchUrl(launchUrl);
    window.open(sanitized.url, "_blank", "noopener,noreferrer");
  }, [launchUrl]);

  const refreshFrame = useCallback(() => {
    setFrameKey((current) => current + 1);
  }, []);

  const sourceLabel = useMemo(() => {
    if (urlSource === "env") return "env";
    if (urlSource === "localhost-default") return "localhost";
    if (urlSource === "operator-local-default") return "local";
    return "fallback";
  }, [urlSource]);

  const isHttpUrl = launchUrl.toLowerCase().startsWith("http://");
  const isHttpsPage = typeof window !== "undefined" && window.location.protocol === "https:";
  const canEmbed = !(isHttpsPage && isHttpUrl);

  return (
    <div className="relative h-screen w-screen bg-background overflow-hidden">
      {canEmbed ? (
        <iframe
          key={frameKey}
          src={launchUrl}
          title="MGBoard"
          className="h-full w-full border-0"
          loading="eager"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center p-8 text-center">
          <div className="max-w-xl space-y-3">
            <p className="text-lg font-black uppercase text-foreground">MGBoard Cannot Embed Here</p>
            <p className="text-sm text-muted-foreground">
              Current URL is mixed-content (`{launchUrl}`) on HTTPS. Open in a new tab or use an HTTPS MGBoard URL.
            </p>
            <button
              type="button"
              onClick={openNewTab}
              className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-accent transition-all hover:bg-accent hover:text-accent-foreground"
            >
              <ExternalLink className="h-4 w-4" />
              Open MGBoard
            </button>
          </div>
        </div>
      )}

      <div className="absolute left-4 top-4 z-40 flex items-center gap-2 rounded-full border border-border bg-background/82 px-2 py-1.5 backdrop-blur-md">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-foreground transition-all hover:border-accent/40 hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
        <button
          type="button"
          onClick={loadIntegration}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-muted-foreground transition-all hover:border-accent/40 hover:text-accent"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
          Reload
        </button>
        <button
          type="button"
          onClick={refreshFrame}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-muted-foreground transition-all hover:border-accent/40 hover:text-accent"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Refresh
        </button>
        <button
          type="button"
          onClick={openNewTab}
          className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-accent transition-all hover:bg-accent hover:text-accent-foreground"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open
        </button>
      </div>

      <div className="absolute right-4 top-4 z-40 rounded-full border border-border bg-background/82 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground backdrop-blur-md">
        Source: {sourceLabel}
      </div>

      {error ? (
        <div className="absolute bottom-4 left-4 z-40 inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          <TriangleAlert className="h-3.5 w-3.5" />
          {error}
        </div>
      ) : null}
    </div>
  );
}
