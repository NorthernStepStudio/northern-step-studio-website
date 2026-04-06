import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  Search,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { CATALOG_APPS } from "../../../shared/data/appsCatalog";

type TesterStatus = "pending" | "approved" | "denied";

interface TesterRequest {
  id: number;
  email: string;
  name: string;
  app_slug: string;
  reason: string;
  status: TesterStatus;
  admin_notes: string;
  created_at: string;
}

const APP_NAME_BY_SLUG = new Map(CATALOG_APPS.map((app) => [app.slug, app.name] as const));
const STATUS_OPTIONS: Array<TesterStatus | "all"> = ["all", "pending", "approved", "denied"];

function formatAppName(slug: string) {
  return APP_NAME_BY_SLUG.get(slug) ?? (slug ? slug : "All apps");
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function TesterManager() {
  const [requests, setRequests] = useState<TesterRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]>("all");
  const [appFilter, setAppFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadRequests();
  }, []);

  async function loadRequests() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/testers");
      if (!response.ok) {
        throw new Error("Failed to fetch tester requests.");
      }

      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load tester requests.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateRequest(id: number, status: TesterStatus) {
    const current = requests.find((request) => request.id === id);
    const notes = window.prompt(
      `Optional admin notes for ${current?.email ?? "this tester"}`,
      current?.admin_notes ?? "",
    );

    if (notes === null) {
      return;
    }

    setProcessingId(id);
    setError("");

    try {
      const response = await fetch(`/api/admin/testers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, admin_notes: notes.trim() }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Unable to update the request.");
      }

      setRequests((previous) =>
        previous.map((request) =>
          request.id === id
            ? { ...request, status, admin_notes: notes.trim() }
            : request,
        ),
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update the request.");
    } finally {
      setProcessingId(null);
    }
  }

  async function deleteRequest(id: number) {
    if (!window.confirm("Delete this tester request permanently?")) {
      return;
    }

    setProcessingId(id);
    setError("");

    try {
      const response = await fetch(`/api/admin/testers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Unable to delete the request.");
      }

      setRequests((previous) => previous.filter((request) => request.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete the request.");
    } finally {
      setProcessingId(null);
    }
  }

  const filteredRequests = requests.filter((request) => {
    if (statusFilter !== "all" && request.status !== statusFilter) {
      return false;
    }

    if (appFilter !== "all" && request.app_slug !== appFilter) {
      return false;
    }

    if (!search) {
      return true;
    }

    const query = search.toLowerCase();
    return (
      request.name.toLowerCase().includes(query) ||
      request.email.toLowerCase().includes(query) ||
      request.reason.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((request) => request.status === "pending").length,
    approved: requests.filter((request) => request.status === "approved").length,
    denied: requests.filter((request) => request.status === "denied").length,
  };

  const appCounts = requests.reduce<Record<string, number>>((counts, request) => {
    const key = request.app_slug || "all";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-accent">
            Private Tester Pipeline
          </p>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Tester Requests
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Review incoming tester requests, approve access, and keep the private pipeline
            organized without sending people through public preview links.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Total Requests
                </p>
                <p className="text-2xl font-black text-foreground">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Pending
                </p>
                <p className="text-2xl font-black text-foreground">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Approved
                </p>
                <p className="text-2xl font-black text-foreground">{stats.approved}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Denied
                </p>
                <p className="text-2xl font-black text-foreground">{stats.denied}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-3xl border border-border bg-card p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_220px_220px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search by name, email, or reason"
              className="h-12 w-full rounded-2xl border border-border bg-background/80 pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
              Status
            </span>
            <select
              className="h-12 w-full rounded-2xl border border-border bg-background/80 px-4 text-sm text-foreground outline-none transition-colors focus:border-accent"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as TesterStatus | "all")}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All statuses" : option}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
              App
            </span>
            <select
              className="h-12 w-full rounded-2xl border border-border bg-background/80 px-4 text-sm text-foreground outline-none transition-colors focus:border-accent"
              value={appFilter}
              onChange={(event) => setAppFilter(event.target.value)}
            >
              <option value="all">All apps</option>
              {CATALOG_APPS.map((app) => (
                <option key={app.slug} value={app.slug}>
                  {app.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-[2rem] border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
                By app
              </span>
              <div className="flex flex-wrap gap-2">
                {CATALOG_APPS.map((app) => {
                  const count = appCounts[app.slug] ?? 0;
                  if (count === 0) {
                    return null;
                  }

                  return (
                    <span
                      key={app.slug}
                      className="rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-bold text-foreground"
                    >
                      {app.name}: {count}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {error ? (
            <div className="border-b border-border px-5 py-4">
              <div className="flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          ) : null}

          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading requests...</span>
              </div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex min-h-[260px] items-center justify-center px-6 py-14 text-center">
              <div className="max-w-sm space-y-3">
                <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No tester requests match the current filters.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredRequests.map((request) => {
                const isProcessing = processingId === request.id;

                return (
                  <div key={request.id} className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                            <Mail className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-lg font-black text-foreground">
                              {request.name || "Unnamed tester"}
                            </h3>
                            <p className="text-sm text-muted-foreground">{request.email}</p>
                          </div>
                          <span className="rounded-full border border-border bg-background/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
                            {request.status}
                          </span>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-border bg-background/60 p-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                              App
                            </p>
                            <p className="mt-2 text-sm font-bold text-foreground">
                              {formatAppName(request.app_slug)}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-border bg-background/60 p-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                              Requested
                            </p>
                            <p className="mt-2 text-sm font-bold text-foreground">
                              {formatDate(request.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-background/60 p-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                            Reason
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {request.reason || "No reason provided."}
                          </p>
                        </div>

                        {request.admin_notes ? (
                          <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-accent">
                              Admin notes
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-foreground">
                              {request.admin_notes}
                            </p>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 flex-row flex-wrap gap-2 lg:flex-col">
                        {request.status === "pending" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void updateRequest(request.id, "approved")}
                              disabled={isProcessing}
                              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-black uppercase text-accent-foreground transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => void updateRequest(request.id, "denied")}
                              disabled={isProcessing}
                              className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-black uppercase text-foreground transition-all hover:border-destructive hover:text-destructive disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <XCircle className="h-4 w-4" />
                              Deny
                            </button>
                          </>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => void deleteRequest(request.id)}
                          disabled={isProcessing}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-black uppercase text-muted-foreground transition-all hover:border-destructive hover:text-destructive disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
