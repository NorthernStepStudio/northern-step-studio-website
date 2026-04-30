import { useState, type FormEvent } from "react";
import { useLocation } from "react-router";
import { Check, ShieldCheck, Mail, User, Info, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { CATALOG_APPS } from "../../shared/data/appsCatalog";

type FormState = {
  name: string;
  email: string;
  app_slug: string;
  reason: string;
};

export default function TesterSignup() {
  const location = useLocation();
  const initialApp = new URLSearchParams(location.search).get("app") || "";

  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    app_slug: initialApp,
    reason: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const visibleApps = CATALOG_APPS.filter((app) => app.visibility !== "hidden");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/testers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || "Something went wrong. Please try again.");
      }

      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to connect to the server.");
    }
  };

  if (status === "success") {
    const selectedApp = visibleApps.find((app) => app.slug === formData.app_slug)?.name ?? "the selected app";

    return (
      <div className="min-h-[70vh] px-4 py-16 sm:py-20">
        <div className="mx-auto flex max-w-xl items-center justify-center">
          <div className="card-dark-wise w-full text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <Check className="h-10 w-10 text-success" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">
              Request received
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Thanks for your interest in testing <strong>{selectedApp}</strong>. Access will be
              granted shortly, and we will email <strong>{formData.email}</strong> once the request
              is reviewed.
            </p>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
              className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-black uppercase text-accent-foreground transition-all hover:shadow-lg"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pb-16 pt-16 sm:pt-20">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <span className="text-label mb-3 block text-xs font-black uppercase tracking-[0.32em] text-accent">
            Private Tester Pipeline
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl lg:text-5xl">
            Request Early Access
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Ask for access to a product before it is shared more broadly. You will get a
            confirmation when the request is reviewed.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <div className="card-dark-wise">
              <ShieldCheck className="mb-4 h-8 w-8 text-accent" />
              <h2 className="text-lg font-black uppercase tracking-tight">Priority access</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Get early access to finished builds, preview releases, and the services that are ready
                for tester feedback.
              </p>
            </div>
            <div className="card-dark-wise">
              <Sparkles className="mb-4 h-8 w-8 text-accent" />
              <h2 className="text-lg font-black uppercase tracking-tight">Direct influence</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Your feedback helps decide what gets tightened, expanded, or pushed live next.
              </p>
            </div>
            <div className="card-dark-wise">
              <Mail className="mb-4 h-8 w-8 text-accent" />
              <h2 className="text-lg font-black uppercase tracking-tight">Approval updates</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                You will be notified when your request is approved, denied, or needs more detail.
              </p>
            </div>
          </div>

          <div className="card-dark-wise">
            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-muted-foreground">
                    <User className="h-4 w-4" />
                    Full name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/30"
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    Email address
                  </label>
                  <input
                    type="email"
                    autoComplete="off"
                    required
                    placeholder="john@example.com"
                    className="w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/30"
                    value={formData.email}
                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-muted-foreground">
                  <Info className="h-4 w-4" />
                  Which app do you want to test?
                </label>
                <select
                  required
                  aria-label="Which app do you want to test?"
                  className="w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-foreground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/30"
                  value={formData.app_slug}
                  onChange={(event) => setFormData({ ...formData, app_slug: event.target.value })}
                >
                  <option value="" disabled>
                    Select an app
                  </option>
                  {visibleApps.map((app) => (
                    <option key={app.slug} value={app.slug}>
                      {app.name} - {app.tagline}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black uppercase tracking-wide text-muted-foreground">
                  Why are you interested in this project?
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tell us why you'd be a strong tester..."
                  className="w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/30"
                  value={formData.reason}
                  onChange={(event) => setFormData({ ...formData, reason: event.target.value })}
                />
              </div>

              {status === "error" && (
                <div className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-4 text-sm font-black uppercase text-accent-foreground transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  "Submit request"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
