import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Filter,
  Inbox,
  Mail,
  MessageSquareText,
  Phone,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  UserCheck,
  XCircle,
} from "lucide-react";
import { usePermissions } from "@/react-app/hooks/usePermissions";

type LeadStatus = "new" | "contacted" | "qualified" | "closed";
type LeadIntent = "setup-review" | "lead-recovery-demo" | "automation-build" | "general-support" | null;

interface LeadItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  destination_email: string;
  email_sent: boolean;
  email_error: string | null;
  email_message_id: string | null;
  source: string;
  intent: LeadIntent;
  requested_tier: string | null;
  industry: string;
  sms_consent: boolean;
  status: LeadStatus;
  admin_notes: string;
  contacted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface LeadSummary {
  total: number;
  setupReviews: number;
  liveDemos: number;
  needsReply: number;
  byStatus: Record<LeadStatus, number>;
}

type FeedbackState = {
  type: "success" | "error";
  text: string;
};

const EMPTY_SUMMARY: LeadSummary = {
  total: 0,
  setupReviews: 0,
  liveDemos: 0,
  needsReply: 0,
  byStatus: {
    new: 0,
    contacted: 0,
    qualified: 0,
    closed: 0,
  },
};

const STATUS_OPTIONS: Array<{ value: LeadStatus | "all"; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "closed", label: "Closed" },
];

const INTENT_OPTIONS: Array<{ value: LeadIntent | "all"; label: string }> = [
  { value: "all", label: "All intents" },
  { value: "setup-review", label: "Setup review" },
  { value: "lead-recovery-demo", label: "Live demo" },
  { value: "automation-build", label: "Automation build" },
  { value: "general-support", label: "General support" },
];

const STATUS_META: Record<LeadStatus, { label: string; className: string }> = {
  new: {
    label: "New",
    className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  },
  contacted: {
    label: "Contacted",
    className: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  },
  qualified: {
    label: "Qualified",
    className: "border-accent/30 bg-accent/10 text-accent",
  },
  closed: {
    label: "Closed",
    className: "border-border bg-background/70 text-muted-foreground",
  },
};

const INTENT_LABELS: Record<Exclude<LeadIntent, null>, string> = {
  "setup-review": "Setup review",
  "lead-recovery-demo": "Live demo",
  "automation-build": "Automation build",
  "general-support": "General support",
};

function buildSummary(items: LeadItem[]): LeadSummary {
  return items.reduce<LeadSummary>(
    (acc, item) => {
      acc.total += 1;
      acc.byStatus[item.status] += 1;
      if (item.intent === "setup-review") {
        acc.setupReviews += 1;
      }
      if (item.intent === "lead-recovery-demo") {
        acc.liveDemos += 1;
      }
      if (item.status === "new") {
        acc.needsReply += 1;
      }
      return acc;
    },
    {
      total: 0,
      setupReviews: 0,
      liveDemos: 0,
      needsReply: 0,
      byStatus: {
        new: 0,
        contacted: 0,
        qualified: 0,
        closed: 0,
      },
    },
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not yet";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatIntent(intent: LeadIntent) {
  return intent ? INTENT_LABELS[intent] : "General support";
}

function formatSource(source: string) {
  return source
    .split(/[_-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function Leads() {
  const { canAccess, isLoading: permissionsLoading } = usePermissions();
  const hasLeadAccess = canAccess("leads");
  const [items, setItems] = useState<LeadItem[]>([]);
  const [summary, setSummary] = useState<LeadSummary>(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [intentFilter, setIntentFilter] = useState<LeadIntent | "all">("all");
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [draftStatus, setDraftStatus] = useState<LeadStatus>("new");
  const [draftNotes, setDraftNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const fetchLeads = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/contact-messages");
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Failed to load leads");
      }

      const nextItems = Array.isArray(data?.items) ? (data.items as LeadItem[]) : [];
      setItems(nextItems);
      setSummary(data?.summary ?? buildSummary(nextItems));
      setSelectedLeadId((current) => current ?? nextItems[0]?.id ?? null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load leads");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasLeadAccess) {
      void fetchLeads();
    }
  }, [hasLeadAccess]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      if (intentFilter !== "all" && item.intent !== intentFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [
        item.name,
        item.email,
        item.phone,
        item.subject,
        item.message,
        item.industry,
        item.source,
        item.requested_tier || "",
      ]
        .join("\n")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [intentFilter, items, searchQuery, statusFilter]);

  useEffect(() => {
    if (filteredItems.length === 0) {
      setSelectedLeadId(null);
      return;
    }

    if (!selectedLeadId || !filteredItems.some((item) => item.id === selectedLeadId)) {
      setSelectedLeadId(filteredItems[0].id);
    }
  }, [filteredItems, selectedLeadId]);

  const selectedLead = useMemo(() => {
    if (!selectedLeadId) {
      return filteredItems[0] ?? null;
    }

    return filteredItems.find((item) => item.id === selectedLeadId) ?? filteredItems[0] ?? null;
  }, [filteredItems, selectedLeadId]);

  useEffect(() => {
    if (!selectedLead) {
      setDraftStatus("new");
      setDraftNotes("");
      return;
    }

    setDraftStatus(selectedLead.status);
    setDraftNotes(selectedLead.admin_notes || "");
    setFeedback(null);
  }, [selectedLead?.id, selectedLead?.status, selectedLead?.admin_notes]);

  const handleSave = async () => {
    if (!selectedLead) {
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/admin/contact-messages/${selectedLead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: draftStatus,
          admin_notes: draftNotes,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Failed to save lead");
      }

      const updatedItem = data?.item as LeadItem | null;
      if (updatedItem) {
        setItems((current) => {
          const nextItems = current.map((item) => (item.id === updatedItem.id ? updatedItem : item));
          setSummary(buildSummary(nextItems));
          return nextItems;
        });
      }

      setFeedback({
        type: "success",
        text: "Lead updated.",
      });
    } catch (nextError) {
      setFeedback({
        type: "error",
        text: nextError instanceof Error ? nextError.message : "Failed to save lead",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (permissionsLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 animate-pulse">
            <Inbox className="h-6 w-6 text-accent" />
          </div>
          <p className="text-muted-foreground">Loading lead inbox...</p>
        </div>
      </div>
    );
  }

  if (!hasLeadAccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-black uppercase mb-2">Lead Inbox Locked</h1>
          <p className="text-muted-foreground mb-6">
            You do not currently have permission to review setup requests or demo leads.
          </p>
          <Link
            to="/admin/permissions"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-black uppercase text-accent-foreground transition-opacity hover:opacity-90"
          >
            Review Permissions
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          {
            label: "Total leads",
            value: summary.total,
            icon: Inbox,
            tone: "from-accent/20 to-accent/5 text-accent",
          },
          {
            label: "Needs reply",
            value: summary.needsReply,
            icon: AlertCircle,
            tone: "from-yellow-500/20 to-yellow-500/5 text-yellow-400",
          },
          {
            label: "Setup reviews",
            value: summary.setupReviews,
            icon: Sparkles,
            tone: "from-blue-500/20 to-blue-500/5 text-blue-400",
          },
          {
            label: "Live demos",
            value: summary.liveDemos,
            icon: MessageSquareText,
            tone: "from-purple-500/20 to-purple-500/5 text-purple-400",
          },
          {
            label: "Qualified",
            value: summary.byStatus.qualified,
            icon: UserCheck,
            tone: "from-emerald-500/20 to-emerald-500/5 text-emerald-400",
          },
        ].map((card) => (
          <div key={card.label} className={`card-dark-wise bg-gradient-to-br ${card.tone}`}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                {card.label}
              </p>
              <div className="rounded-xl bg-background/50 p-2">
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-foreground">{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="card-dark-wise">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-foreground">
              Lead inbox filters
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Search across setup reviews, live demo requests, and inbound contact leads.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchLeads()}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-black uppercase tracking-wider text-muted-foreground transition-colors hover:border-accent/30 hover:text-accent"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <label className="block">
            <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              Search
            </span>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Name, email, subject, industry..."
                className="w-full rounded-2xl border border-border bg-background py-3 pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </label>

          <label className="block">
            <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              Status
            </span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as LeadStatus | "all")}
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              Intent
            </span>
            <select
              value={intentFilter ?? "all"}
              onChange={(event) => setIntentFilter(event.target.value as LeadIntent | "all")}
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              {INTENT_OPTIONS.map((option) => (
                <option key={option.value ?? "null"} value={option.value ?? "all"}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="card-dark-wise">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-foreground">
                Inbox
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {filteredItems.length} visible lead{filteredItems.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              {summary.byStatus.new} new
            </div>
          </div>

          <div className="space-y-3">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isActive = item.id === selectedLead?.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedLeadId(item.id)}
                    className={`w-full rounded-3xl border p-4 text-left transition-colors ${
                      isActive
                        ? "border-accent/40 bg-accent/10"
                        : "border-border bg-background/50 hover:border-accent/20 hover:bg-accent/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black uppercase tracking-wide text-foreground">
                          {item.name || item.email}
                        </p>
                        <p className="mt-1 truncate text-sm text-muted-foreground">{item.subject}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${STATUS_META[item.status].className}`}>
                        {STATUS_META[item.status].label}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                        {formatIntent(item.intent)}
                      </span>
                      {item.requested_tier && (
                        <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                          {item.requested_tier}
                        </span>
                      )}
                      {item.industry && (
                        <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                          {item.industry}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4 text-xs text-muted-foreground">
                      <span>{formatSource(item.source)}</span>
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-3xl border border-border bg-background/50 px-5 py-8 text-center">
                <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-black uppercase tracking-wide text-foreground">
                  No leads match these filters
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Clear the filters or refresh after a new setup review comes in.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="card-dark-wise">
          {selectedLead ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${STATUS_META[selectedLead.status].className}`}>
                      {STATUS_META[selectedLead.status].label}
                    </span>
                    <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                      {formatIntent(selectedLead.intent)}
                    </span>
                    {selectedLead.requested_tier && (
                      <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                        {selectedLead.requested_tier}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-4 text-2xl font-black uppercase tracking-tight text-foreground">
                    {selectedLead.name || selectedLead.email}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">{selectedLead.subject}</p>
                </div>

                <div className="rounded-3xl border border-border bg-background/60 px-4 py-3 text-sm">
                  <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                    Captured
                  </p>
                  <p className="mt-2 font-medium text-foreground">{formatDate(selectedLead.created_at)}</p>
                  <p className="mt-3 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                    Contacted
                  </p>
                  <p className="mt-2 font-medium text-foreground">{formatDate(selectedLead.contacted_at)}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-border bg-background/60 p-5">
                  <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                    Contact details
                  </p>
                  <div className="mt-4 space-y-3 text-sm">
                    <a
                      href={`mailto:${selectedLead.email}`}
                      className="flex items-center gap-3 text-foreground transition-colors hover:text-accent"
                    >
                      <Mail className="h-4 w-4 text-accent" />
                      {selectedLead.email}
                    </a>
                    {selectedLead.phone ? (
                      <a
                        href={`tel:${selectedLead.phone}`}
                        className="flex items-center gap-3 text-foreground transition-colors hover:text-accent"
                      >
                        <Phone className="h-4 w-4 text-accent" />
                        {selectedLead.phone}
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        No phone captured
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Clock3 className="h-4 w-4" />
                      Routed to {selectedLead.destination_email}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-background/60 p-5">
                  <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                    Lead context
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                      Source: {formatSource(selectedLead.source)}
                    </span>
                    {selectedLead.industry && (
                      <span className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                        Industry: {selectedLead.industry}
                      </span>
                    )}
                    <span className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                      SMS consent: {selectedLead.sms_consent ? "Yes" : "No"}
                    </span>
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
                      selectedLead.email_sent
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                    }`}>
                      Email {selectedLead.email_sent ? "sent" : "saved only"}
                    </span>
                  </div>
                  {selectedLead.email_error && (
                    <p className="mt-4 text-sm text-yellow-400">
                      Delivery note: {selectedLead.email_error}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-background/60 p-5">
                <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                  Original message
                </p>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {selectedLead.message}
                </p>
              </div>

              <div className="rounded-3xl border border-accent/20 bg-accent/5 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider text-accent">
                      Workflow
                    </p>
                    <h3 className="mt-2 text-lg font-black uppercase tracking-tight text-foreground">
                      Update lead status and notes
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(["new", "contacted", "qualified", "closed"] as LeadStatus[]).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setDraftStatus(status)}
                        className={`rounded-full border px-3 py-2 text-[11px] font-black uppercase tracking-wider transition-colors ${
                          draftStatus === status
                            ? STATUS_META[status].className
                            : "border-border bg-background text-muted-foreground hover:border-accent/30 hover:text-accent"
                        }`}
                      >
                        {STATUS_META[status].label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-4">
                  <label className="block">
                    <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                      Status
                    </span>
                    <select
                      value={draftStatus}
                      onChange={(event) => setDraftStatus(event.target.value as LeadStatus)}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/50"
                    >
                      {STATUS_OPTIONS.filter((option) => option.value !== "all").map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                      Admin notes
                    </span>
                    <textarea
                      value={draftNotes}
                      onChange={(event) => setDraftNotes(event.target.value)}
                      rows={6}
                      placeholder="Callback outcome, pricing notes, fit, next step..."
                      className="mt-2 w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                  </label>

                  {feedback && (
                    <div
                      className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm ${
                        feedback.type === "success"
                          ? "bg-accent/10 text-accent"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {feedback.type === "success" ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                      )}
                      <span>{feedback.text}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleSave}
                      className="btn-pill-primary disabled:opacity-60"
                    >
                      {isSaving ? "Saving..." : "Save Lead"}
                    </button>
                    <a
                      href={`mailto:${selectedLead.email}`}
                      className="btn-pill-ghost inline-flex items-center gap-2"
                    >
                      Reply by Email
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                    {selectedLead.phone && (
                      <a
                        href={`tel:${selectedLead.phone}`}
                        className="btn-pill-ghost inline-flex items-center gap-2"
                      >
                        Call Lead
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-border bg-background/50 px-6 py-10 text-center">
              <Inbox className="h-10 w-10 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-black uppercase tracking-tight text-foreground">
                No lead selected
              </h2>
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                Choose a lead from the inbox to review the message, update the status, and keep follow-up notes in one place.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
