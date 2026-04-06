import { ArrowRight, MessageSquareText, PhoneCall, ShieldCheck } from "lucide-react";
import { Link } from "react-router";
import SEO from "@/react-app/components/SEO";

const highlights = [
  {
    icon: PhoneCall,
    title: "Missed-call response",
    description: "Tracks the current live text-back flow for missed calls and lead follow-up.",
  },
  {
    icon: MessageSquareText,
    title: "Conversation summary",
    description: "Keeps the customer conversation short, readable, and owner-ready.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance guardrails",
    description: "Preserves opt-out handling and safe messaging boundaries for SMS workflows.",
  },
] as const;

export default function LeadRecovery() {
  return (
    <>
      <SEO
        title="Lead Recovery"
        description="Admin overview of the live missed-call text-back and lead recovery workflow."
      />

      <div className="space-y-8">
        <section className="space-y-4">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-accent">Lead recovery</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Missed-call response system</h1>
          <p className="max-w-3xl text-muted-foreground text-sm sm:text-base">
            This area gives the admin team a quick view of the live lead recovery flow behind the public demo.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <article key={item.title} className="rounded-2xl border border-border/60 bg-card-soft p-5">
              <item.icon className="h-5 w-5 text-accent" />
              <h2 className="mt-4 text-base font-black uppercase tracking-[0.16em]">{item.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-6">{item.description}</p>
            </article>
          ))}
        </section>

        <section className="flex flex-wrap items-center gap-3">
          <Link to="/missed-call-text-back" className="btn-pill-primary-compact">
            View offer page
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link to="/missed-call-text-back/demo" className="btn-pill-ghost-compact">
            Open demo
          </Link>
        </section>
      </div>
    </>
  );
}
