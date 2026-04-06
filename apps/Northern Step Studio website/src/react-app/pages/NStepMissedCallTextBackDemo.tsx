import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  Check,
  ClipboardList,
  FileText,
  MessageSquareText,
  PhoneCall,
  Sparkles,
  Wrench,
} from "lucide-react";
import SEO from "@/react-app/components/SEO";
import StudioHomeLink from "@/react-app/components/StudioHomeLink";

type DemoRole = "system" | "customer";
type DemoStage =
  | "idle"
  | "issue_type"
  | "other_detail"
  | "severity_detail"
  | "urgency"
  | "location"
  | "customer_name"
  | "done";

type IssueType = "leak" | "clog" | "water_heater" | "other" | null;

type TranscriptEntry = {
  id: string;
  role: DemoRole;
  text: string;
};

type LeadSummary = {
  type: "lead_summary";
  name: string;
  issue: string;
  severity: "High" | "Medium" | "Low";
  urgency: "Same-day recommended" | "Normal callback";
  location: string;
  notes: string;
  recommended_action: "Call immediately" | "Call soon" | "Schedule callback";
};

type DemoState = {
  stage: DemoStage;
  issueType: IssueType;
  issueText: string;
  otherDetail: string;
  severityDetail: string;
  urgencyAnswer: string;
  location: string;
  customerName: string;
  summary: LeadSummary | null;
};

const DEMO_VERTICALS = [
  "Plumbing",
  "HVAC",
  "Electrical",
  "Garage Door",
  "Cleaning",
  "Towing",
  "Locksmith",
];

const PROOF_SUMMARY_ROWS = [
  { label: "Type", value: "Lead Summary" },
  { label: "Customer", value: "John" },
  { label: "Issue", value: "Leak under sink" },
  { label: "Severity", value: "High" },
  { label: "Urgency", value: "Same-day recommended" },
  { label: "Location", value: "Kitchen" },
  { label: "Notes", value: "Constant leak, minor flooding" },
  { label: "Action", value: "Call immediately" },
];

const FIT_NEXT_VERTICALS = [
  {
    name: "HVAC",
    prompt: "No cooling, no heat, airflow issue, or something else?",
    focus: "No-heat and no-cooling urgency, unit location, and service timing.",
  },
  {
    name: "Electrical",
    prompt: "Power outage, breaker issue, outlet issue, or something else?",
    focus: "Safety risk, affected area, outage scope, and urgent callback routing.",
  },
  {
    name: "Garage Door",
    prompt: "Door stuck, opener issue, broken spring, or something else?",
    focus: "Access impact, door status, and same-day dispatch priority.",
  },
  {
    name: "Cleaning",
    prompt: "Move-out clean, recurring clean, deep clean, or something else?",
    focus: "Job type, timeline, property size, and quote-ready notes.",
  },
  {
    name: "Towing",
    prompt: "Breakdown, lockout, accident, or something else?",
    focus: "Vehicle status, safety urgency, exact location, and dispatch summary.",
  },
  {
    name: "Locksmith",
    prompt: "Lockout, rekey, broken lock, or something else?",
    focus: "Access issue, property type, urgency, and callback priority.",
  },
];

const INITIAL_STATE: DemoState = {
  stage: "idle",
  issueType: null,
  issueText: "",
  otherDetail: "",
  severityDetail: "",
  urgencyAnswer: "",
  location: "",
  customerName: "",
  summary: null,
};

const QUICK_REPLIES: Record<Exclude<DemoStage, "idle" | "done">, string[]> = {
  issue_type: ["Leak under the sink", "Kitchen drain clog", "Water heater issue", "Other"],
  other_detail: ["Toilet issue", "Fixture issue", "Disposal issue", "Water pressure issue"],
  severity_detail: ["Constant", "Only when I use the sink", "Fully blocked", "Draining slowly"],
  urgency: ["Yes, a little", "No"],
  location: ["Kitchen", "Bathroom", "Basement", "Utility room"],
  customer_name: ["John", "Sarah", "Mike"],
};

function buildEntry(role: DemoRole, text: string): TranscriptEntry {
  return {
    id: `${role}-${crypto.randomUUID()}`,
    role,
    text,
  };
}

function buildOpeningMessage() {
  return "Hey, this is Mike from ABC Plumbing. Sorry we missed your call. What's going on: leak, clog, water heater, or something else?";
}

function normalizeIssueType(value: string): IssueType {
  const lower = value.trim().toLowerCase();
  if (lower.includes("leak")) {
    return "leak";
  }
  if (lower.includes("clog") || lower.includes("drain")) {
    return "clog";
  }
  if (lower.includes("water heater") || lower.includes("heater") || lower.includes("hot water")) {
    return "water_heater";
  }
  if (lower.length > 0) {
    return "other";
  }
  return null;
}

function buildSeverity(issueType: IssueType, severityDetail: string, urgencyAnswer: string) {
  const severityLower = severityDetail.toLowerCase();
  const urgencyLower = urgencyAnswer.toLowerCase();
  const urgentNow = urgencyLower.startsWith("y");

  if (urgentNow || (issueType === "leak" && severityLower.includes("constant"))) {
    return {
      severity: "High" as const,
      urgency: "Same-day recommended" as const,
      recommended_action: "Call immediately" as const,
    };
  }

  if (issueType === "clog" && severityLower.includes("slow")) {
    return {
      severity: "Low" as const,
      urgency: "Normal callback" as const,
      recommended_action: "Schedule callback" as const,
    };
  }

  return {
    severity: "Medium" as const,
    urgency: "Normal callback" as const,
    recommended_action: "Call soon" as const,
  };
}

function buildNotes(state: DemoState) {
  const notes: string[] = [];

  if (state.issueType === "leak" && state.severityDetail) {
    notes.push(`${state.severityDetail} leak`);
  }

  if (state.issueType === "clog" && state.severityDetail) {
    notes.push(state.severityDetail);
  }

  if (state.issueType === "water_heater") {
    notes.push("Water heater concern");
  }

  if (state.issueType === "other" && state.otherDetail) {
    notes.push(state.otherDetail);
  }

  if (state.urgencyAnswer.toLowerCase().startsWith("y")) {
    notes.push("Urgent damage reported");
  }

  return notes.join(", ") || "Lead captured through missed-call demo";
}

function buildSummary(state: DemoState): LeadSummary {
  const issueLabel = state.issueType === "other" ? state.otherDetail : state.issueText;
  const routing = buildSeverity(state.issueType, state.severityDetail, state.urgencyAnswer);

  return {
    type: "lead_summary",
    name: state.customerName,
    issue: issueLabel || "Service issue",
    severity: routing.severity,
    urgency: routing.urgency,
    location: state.location,
    notes: buildNotes(state),
    recommended_action: routing.recommended_action,
  };
}

export default function NStepMissedCallTextBackDemo() {
  const [demo, setDemo] = useState<DemoState>(INITIAL_STATE);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [message, setMessage] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("Plumbing");
  const [callbackPhone, setCallbackPhone] = useState("");

  const quickReplies =
    demo.stage === "severity_detail"
      ? demo.issueType === "leak"
        ? ["Constant", "Only when I use the sink"]
        : demo.issueType === "clog"
          ? ["Fully blocked", "Draining slowly"]
          : []
      : demo.stage !== "idle" && demo.stage !== "done"
        ? QUICK_REPLIES[demo.stage] ?? []
        : [];

  function startDemo() {
    setDemo({
      ...INITIAL_STATE,
      stage: "issue_type",
    });
    setTranscript([buildEntry("system", buildOpeningMessage())]);
    setMessage("");
  }

  function resetDemo() {
    setDemo(INITIAL_STATE);
    setTranscript([]);
    setMessage("");
  }

  const setupReviewHref = `/contact?${new URLSearchParams({
    intent: "setup-review",
    tier: "starter",
    industry: selectedIndustry,
    phone: callbackPhone,
    source: "public_demo",
  }).toString()}`;

  function advanceDemo(rawValue: string) {
    const value = rawValue.trim();
    if (!value || demo.stage === "done") {
      return;
    }

    const sessionDemo =
      demo.stage === "idle"
        ? {
            ...INITIAL_STATE,
            stage: "issue_type" as const,
          }
        : demo;

    const sessionTranscript =
      demo.stage === "idle" ? [buildEntry("system", buildOpeningMessage())] : transcript;

    const nextTranscript: TranscriptEntry[] = [...sessionTranscript, buildEntry("customer", value)];

    if (sessionDemo.stage === "issue_type") {
      const issueType = normalizeIssueType(value);
      if (!issueType) {
        return;
      }

      if (issueType === "other") {
        if (value.toLowerCase() !== "other") {
          setDemo({
            ...sessionDemo,
            stage: "urgency",
            issueType,
            issueText: "Other",
            otherDetail: value,
          });
          setTranscript([
            ...nextTranscript,
            buildEntry("system", "Is this causing flooding or urgent damage right now?"),
          ]);
          setMessage("");
          return;
        }

        const nextState = {
          ...sessionDemo,
          stage: "other_detail" as const,
          issueType,
          issueText: "Other",
        };
        setDemo(nextState);
        setTranscript([
          ...nextTranscript,
          buildEntry(
            "system",
            "What kind of issue is it? Toilet, fixture, disposal, sewer, water pressure, or a short description.",
          ),
        ]);
        setMessage("");
        return;
      }

      if (issueType === "water_heater") {
        const nextState = {
          ...sessionDemo,
          stage: "urgency" as const,
          issueType,
          issueText: value,
        };
        setDemo(nextState);
        setTranscript([
          ...nextTranscript,
          buildEntry("system", "Is this causing flooding or urgent damage right now?"),
        ]);
        setMessage("");
        return;
      }

      const followUp =
        issueType === "leak"
          ? "Got it. Is the leak constant or only when you use the sink?"
          : "Got it. Is it fully blocked or draining slowly?";

      setDemo({
        ...sessionDemo,
        stage: "severity_detail",
        issueType,
        issueText: value,
      });
      setTranscript([...nextTranscript, buildEntry("system", followUp)]);
      setMessage("");
      return;
    }

    if (sessionDemo.stage === "other_detail") {
      setDemo({
        ...sessionDemo,
        stage: "urgency",
        otherDetail: value,
      });
      setTranscript([
        ...nextTranscript,
        buildEntry("system", "Is this causing flooding or urgent damage right now?"),
      ]);
      setMessage("");
      return;
    }

    if (sessionDemo.stage === "severity_detail") {
      setDemo({
        ...sessionDemo,
        stage: "urgency",
        severityDetail: value,
      });
      setTranscript([
        ...nextTranscript,
        buildEntry("system", "Is this causing flooding or urgent damage right now?"),
      ]);
      setMessage("");
      return;
    }

    if (sessionDemo.stage === "urgency") {
      setDemo({
        ...sessionDemo,
        stage: "location",
        urgencyAnswer: value,
      });
      setTranscript([
        ...nextTranscript,
        buildEntry("system", "Where is the issue located? Kitchen, bathroom, basement, or somewhere else?"),
      ]);
      setMessage("");
      return;
    }

    if (sessionDemo.stage === "location") {
      setDemo({
        ...sessionDemo,
        stage: "customer_name",
        location: value,
      });
      setTranscript([
        ...nextTranscript,
        buildEntry("system", "Can I get your name so the technician can reach you?"),
      ]);
      setMessage("");
      return;
    }

    if (sessionDemo.stage === "customer_name") {
      const completedState = {
        ...sessionDemo,
        stage: "done" as const,
        customerName: value,
      };
      const summary = buildSummary(completedState);
      setDemo({
        ...completedState,
        summary,
      });
      setTranscript([
        ...nextTranscript,
        buildEntry("system", `Thanks, ${value}. We've got your request. A technician will reach out shortly to schedule.`),
      ]);
      setMessage("");
    }
  }

  return (
    <div>
      <SEO
        title="Lead Recovery Demo"
        description="Try the public missed-call recovery demo from Northern Step Studio and see how the customer conversation turns into an owner-ready summary."
        keywords="lead recovery demo, missed call text back demo, plumbing demo, service automation demo"
        canonicalUrl="/missed-call-text-back/demo"
      />

      <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6">
        <div className="absolute left-1/4 top-20 h-[360px] w-[360px] rounded-full bg-accent/[0.03] blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 h-[460px] w-[460px] rounded-full bg-yellow-500/[0.03] blur-3xl pointer-events-none" />

        <div className="container relative z-10 mx-auto max-w-5xl">
          <div className="mb-8 flex justify-center">
            <StudioHomeLink />
          </div>

          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2">
              <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="text-xs font-black uppercase tracking-wider text-yellow-400">
                  Public demo
                </span>
            </div>

            <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground sm:text-5xl lg:text-6xl">
              Try the missed-call demo right here
            </h1>
              <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground">
                This page shows the customer-side conversation and the owner summary that comes out of it. Plumbing is the current example because it keeps the flow focused and easy to adapt to other service businesses.
              </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-yellow-400">
                Current starter: plumbing
              </span>
              <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                Customer conversation
              </span>
              <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                Owner summary
              </span>
              <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                No phone setup required
              </span>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button type="button" className="btn-pill-primary" onClick={startDemo}>
                Start Demo
              </button>
              <Link to="/contact?intent=setup-review&source=public_demo" className="btn-pill-ghost inline-flex items-center gap-2">
                Request Setup Review
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

        <section className="border-t border-border bg-gradient-to-b from-accent/[0.01] to-transparent px-4 py-12 sm:px-6 lg:py-14">
          <div className="container mx-auto grid max-w-6xl gap-3 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="card-dark-wise !p-2.5 sm:!p-3">
              <div className="mb-2.5 flex items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-accent">
                    <MessageSquareText className="h-3.5 w-3.5" />
                    Customer conversation
                  </div>
                  <h2 className="mt-2.5 text-lg font-black uppercase tracking-tight text-foreground sm:text-xl">
                    What the caller experiences
                  </h2>
                </div>
                <button type="button" className="btn-pill-ghost-compact h-8 px-3.5 text-[0.58rem]" onClick={resetDemo}>
                  Reset
                </button>
              </div>

              <p className="mb-2.5 text-[11px] leading-5 text-muted-foreground sm:text-xs">
                Start the demo, click the quick replies, or type your own response. If the issue does not fit the main options, choose <strong>Other</strong> and keep going.
              </p>

              <div className="min-h-[140px] rounded-3xl border border-border bg-background/60 p-2 sm:p-2.5">
                {transcript.length > 0 ? (
                  <div className="space-y-2.5">
                    {transcript.map((entry) => (
                      <div
                        key={entry.id}
                        className={`max-w-[78%] rounded-2xl border px-2.5 py-2 ${
                          entry.role === "system"
                            ? "border-accent/20 bg-accent/10"
                            : "ml-auto border-border bg-background/80"
                        } ${entry.role === "customer" ? "text-right" : ""}`}
                      >
                        <p
                          className={`text-[9px] font-black uppercase tracking-[0.14em] ${
                            entry.role === "system" ? "text-accent" : "text-muted-foreground"
                          }`}
                        >
                          {entry.role === "system" ? "System" : "Customer"}
                        </p>
                        <p className="mt-1.5 text-[11px] leading-5 text-foreground sm:text-xs">{entry.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full min-h-[120px] flex-col items-center justify-center px-3 text-center">
                    <PhoneCall className="h-7 w-7 text-yellow-400" />
                    <h3 className="mt-2 text-sm font-black uppercase tracking-tight text-foreground sm:text-[0.95rem]">
                      Start the demo to see the first text-back
                    </h3>
                    <p className="mt-1.5 max-w-xs text-[10px] leading-4 text-muted-foreground sm:text-[11px]">
                      This shows the public-facing part of the flow: instant reply, short qualification, urgency check, and final owner summary.
                    </p>
                  </div>
                )}
              </div>

              {quickReplies.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      className="rounded-full border border-border bg-background/80 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
                      onClick={() => advanceDemo(reply)}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-2.5 max-w-[14rem] sm:max-w-[16rem]">
                <div className="grid gap-1.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <input
                    value={message}
                    disabled={demo.stage === "done"}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        advanceDemo(message);
                      }
                    }}
                    placeholder={demo.stage === "done" ? "Demo complete" : demo.stage === "idle" ? "Type the first reply to start the demo" : "Type the next customer reply"}
                    className="h-7 w-full rounded-full border border-border bg-background px-3 text-[9px] transition-all focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-60 sm:text-[10px]"
                  />
                  <button
                    type="button"
                    className="inline-flex h-7 items-center justify-center whitespace-nowrap rounded-full bg-accent px-3 text-[0.52rem] font-black uppercase tracking-[0.14em] text-accent-foreground transition-all hover:opacity-90 active:scale-95"
                    disabled={demo.stage === "done" || !message.trim()}
                    onClick={() => {
                      advanceDemo(message);
                    }}
                  >
                    Send
                  </button>
                </div>
                <p className="mt-1 max-w-[12rem] text-[8px] leading-4 text-muted-foreground">
                  Press Send to start the demo or advance the conversation.
                </p>
              </div>
            </article>

            <div className="space-y-3">
              <article className="card-dark-wise !p-2.5 sm:!p-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-blue-400">
                  <FileText className="h-3.5 w-3.5" />
                  Owner summary
                </div>
                <h2 className="mt-2.5 text-lg font-black uppercase tracking-tight text-foreground sm:text-xl">
                  What the business receives
                </h2>

                {demo.summary ? (
                  <div className="mt-2.5 space-y-2 rounded-3xl border border-border bg-background/70 p-3">
                    {Object.entries(demo.summary).map(([key, value]) => (
                      <div key={key} className="flex items-start justify-between gap-3 border-b border-border/60 pb-2 last:border-b-0 last:pb-0">
                        <span className="text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-right text-[11px] font-medium text-foreground">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2.5 rounded-3xl border border-border bg-background/60 p-3">
                    <p className="text-[11px] leading-5 text-muted-foreground">
                      Finish the conversation and the owner summary will appear here. This is the part that turns the system from interesting into useful.
                    </p>
                  </div>
                )}
              </article>

              <article className="card-dark-wise border-yellow-500/30 !p-2.5 sm:!p-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-yellow-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  Proof preview
                </div>
                <h2 className="mt-2.5 text-lg font-black uppercase tracking-tight text-foreground sm:text-xl">
                  The owner-ready output should look like this
                </h2>
                <p className="mt-2 text-[11px] leading-5 text-muted-foreground sm:text-xs">
                  This is the proof block a buyer should understand immediately: the caller is identified, the issue is classified, the urgency is visible, and the next action is obvious.
                </p>

                <div className="mt-2.5 rounded-[22px] border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-background/90 to-background/70 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.22em] text-yellow-400">
                        New Lead
                      </p>
                      <h3 className="mt-1.5 text-[0.95rem] font-black uppercase tracking-tight text-foreground">
                        ABC Plumbing
                      </h3>
                    </div>
                    <div className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-yellow-400">
                      Same-day
                    </div>
                  </div>

                  <div className="mt-2.5 grid gap-2">
                    {PROOF_SUMMARY_ROWS.map((row) => (
                      <div key={row.label} className="flex items-start justify-between gap-3 rounded-2xl border border-border/70 bg-background/70 px-3 py-2">
                        <span className="text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                          {row.label}
                        </span>
                        <span className="text-right text-[11px] font-semibold text-foreground">
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <article className="card-dark-wise !p-2.5 sm:!p-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-yellow-400">
                  <ClipboardList className="h-3.5 w-3.5" />
                  What this page proves
                </div>
                <div className="mt-2.5 space-y-2">
                  {[
                    "The business responds instantly after a missed call.",
                    "The lead gets qualified with a short script instead of voicemail guessing.",
                    "The owner gets a clean summary instead of unstructured back-and-forth.",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-accent" />
                      <p className="text-[11px] leading-5 text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="card-dark-wise border-yellow-500/30 !p-2.5 sm:!p-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-yellow-400">
                  <Wrench className="h-3.5 w-3.5" />
                  Same system, different vertical
                </div>
                <p className="mt-2.5 text-[11px] leading-5 text-muted-foreground">
                  Plumbing is the current example because it shows the flow clearly. The same first-response framework can be adapted to other service businesses once the intake questions change.
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {DEMO_VERTICALS.map((vertical) => (
                    <span
                      key={vertical}
                      className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${
                        vertical === "Plumbing"
                          ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                          : "border-border bg-background/70 text-muted-foreground"
                      }`}
                    >
                      {vertical}
                    </span>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </section>

      <section className="border-t border-border bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent px-4 py-20 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 grid gap-6 text-center lg:grid-cols-[0.95fr_1.05fr] lg:items-end lg:text-left">
            <div className="mx-auto max-w-2xl lg:mx-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-accent">
                <Wrench className="h-3.5 w-3.5" />
                Fits next
              </div>
              <h2 className="mt-4 text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-tight">
                Same system, different service vertical
              </h2>
            </div>
              <p className="mx-auto max-w-2xl text-muted-foreground lg:mx-0 lg:justify-self-end lg:text-base lg:leading-8">
                Plumbing is the current example because it provides a clear starting point for the walkthrough. The system itself is a response framework that can be retuned for other local service businesses by changing the intake prompts and summary logic.
              </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {FIT_NEXT_VERTICALS.map((vertical) => (
              <article key={vertical.name} className="card-dark-wise">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">
                    {vertical.name}
                  </h3>
                  <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                    Easy next
                  </span>
                </div>

                <div className="rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-wider text-accent">
                    First customer question
                  </p>
                  <p className="mt-2 text-sm text-foreground">{vertical.prompt}</p>
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-background/70 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                    Summary focus
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{vertical.focus}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-gradient-to-b from-yellow-500/[0.02] via-transparent to-transparent px-4 py-20 sm:px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="card-dark-wise border-yellow-500/30">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-yellow-400">
                  <PhoneCall className="h-3.5 w-3.5" />
                  Use this for your business
                </div>
                <h2 className="mt-4 text-3xl font-black uppercase tracking-tighter text-foreground">
                  Carry your details into the setup review
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Pick the service industry, add the best callback number, and jump straight into the setup review form with the context prefilled. That makes the next step feel like an actual handoff, not a dead-end CTA.
                </p>
                <div className="mt-5 space-y-3">
                  {[
                    "Industry gets carried into the request.",
                    "Callback number is prefilled for follow-up.",
                    "Starter tier stays selected as the recommended first rollout.",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                      <p className="text-sm text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-background/70 p-5">
                <div className="grid gap-4">
                  <label className="text-sm font-medium text-foreground">
                    Service industry
                    <select
                      value={selectedIndustry}
                      onChange={(event) => setSelectedIndustry(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/50"
                    >
                      {DEMO_VERTICALS.map((vertical) => (
                        <option key={vertical} value={vertical}>
                          {vertical}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm font-medium text-foreground">
                    Best callback number
                    <input
                      value={callbackPhone}
                      onChange={(event) => setCallbackPhone(event.target.value)}
                      placeholder="(555) 555-5555"
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                  </label>

                  <Link to={setupReviewHref} className="btn-pill-primary mt-2 inline-flex items-center justify-center gap-2">
                    Use This For My Business
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <p className="text-xs text-muted-foreground">
                    This opens the setup review form with <strong>{selectedIndustry}</strong> selected and your callback number carried over.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent px-4 py-20 sm:px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="card-dark-wise">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground sm:text-4xl">
              Want this adapted for your business?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Start with the narrow version, prove the workflow, and expand later. The current starter demo is plumbing, but the offer is not limited to plumbers.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/contact?intent=setup-review&tier=starter&source=public_demo" className="btn-pill-primary inline-flex items-center gap-2">
                Request Setup Review
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/missed-call-text-back" className="btn-pill-ghost inline-flex items-center gap-2">
                Back to Offer Page
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
