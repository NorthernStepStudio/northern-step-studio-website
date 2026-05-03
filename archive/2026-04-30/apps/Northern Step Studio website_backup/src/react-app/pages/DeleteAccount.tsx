import { Mail, ShieldAlert, Trash2 } from "lucide-react";
import SEO from "@/react-app/components/SEO";
import { EXTERNAL_LINKS, resolveSiteUrl } from "@/react-app/lib/site";

const deletionChecklist = [
  "Your NexusBuild account email address",
  'The exact request: "Delete my NexusBuild account"',
  "Whether you signed in with email/password or Google",
];

export default function DeleteAccount() {
  const supportEmail = EXTERNAL_LINKS.supportEmail;
  const deletionUrl = resolveSiteUrl("/delete-account");

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 pb-24 pt-24 sm:px-6">
      <SEO
        title="Delete Account"
        description="Request deletion of your NexusBuild account and associated data."
        canonicalUrl="/delete-account"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "NexusBuild Account Deletion Request",
          url: deletionUrl,
          description: "Instructions for requesting deletion of a NexusBuild account and associated data.",
        }}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-accent/12 via-transparent to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-20 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-red-500/5 blur-3xl" />

      <div className="container relative z-10 mx-auto max-w-5xl">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-accent">
            <ShieldAlert className="h-3.5 w-3.5" />
            Account Controls
          </div>

          <h1 className="mt-5 text-4xl font-black uppercase tracking-tight text-foreground sm:text-5xl">
            NexusBuild Account Deletion Request
          </h1>

          <p className="mt-4 text-base leading-8 text-muted-foreground sm:text-lg">
            To request deletion of your NexusBuild account and associated data, contact support using the email address
            below.
          </p>

          <div className="mt-8 rounded-3xl border border-border bg-card/85 p-6 shadow-sm backdrop-blur sm:p-8">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <Mail className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                  Support email
                </p>
                <a
                  href={`${supportEmail}?subject=NexusBuild%20Account%20Deletion%20Request`}
                  className="mt-2 inline-flex text-lg font-semibold text-accent hover:underline sm:text-xl"
                >
                  support@northernstepstudio.com
                </a>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Requests are reviewed and processed within 7 to 30 days, subject to billing reconciliation, fraud
                  prevention, and any legal retention requirements.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
            <section className="card-dark-wise p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <Trash2 className="h-5 w-5 text-accent" />
                <h2 className="text-xl font-black uppercase tracking-wide text-foreground">
                  Include these details
                </h2>
              </div>

              <ul className="mt-5 space-y-3">
                {deletionChecklist.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-7 text-muted-foreground sm:text-[15px]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <aside className="rounded-3xl border border-accent/20 bg-accent/5 p-6">
              <p className="text-sm font-black uppercase tracking-wider text-accent">
                Direct request template
              </p>
              <div className="mt-4 rounded-2xl border border-border bg-background/70 p-4 text-sm leading-7 text-muted-foreground">
                <p>Subject: NexusBuild Account Deletion Request</p>
                <p className="mt-3">Account email: your@email.com</p>
                <p className="mt-3">Request: Delete my NexusBuild account</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
