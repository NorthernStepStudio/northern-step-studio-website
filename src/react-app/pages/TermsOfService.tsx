import { type Components } from "react-markdown";
import { Clock3, Mail, MessageSquare, Shield, Users } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSiteContent } from "@/react-app/hooks/useSiteContent";

const defaultLegalContent = `
## LEGAL FOUNDATION

Welcome to Northern Step Studio (NStep). These Terms & Privacy guidelines govern your access to and use of our services. By accessing or using any of our products, applications, or communication tools, you agree to the following terms.

### 1. Service Description
Northern Step Studio provides mobile applications, games, and automated communication tools, including missed call text-back systems, lead recovery messaging, and workflow automation tools designed for business use.

### 2. Messaging Consent
By providing your phone number and opting in through our forms, applications, or services, you consent to receive SMS messages from Northern Step Studio (NStep) related to:

- Missed call follow-ups
- Appointment coordination
- Service-related communication

Message frequency may vary. Message and data rates may apply. Consent is not a condition of purchase.

### 3. Opt-Out Instructions
You can opt out of SMS communications at any time by replying STOP.  
For assistance, reply HELP.

### 4. Use of Services & Eligibility
You must be at least 18 years old to use our Services. Our services are intended for business and commercial use only. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.

### 5. Acceptable Use Policy
You agree not to use our services for any unlawful, harmful, or abusive purpose. This includes:

- Harassment, fraud, or deceptive practices
- Unauthorized access, interference, or disruption of systems
- Reverse engineering or attempting to extract source code
- Sending spam or unsolicited messages using automation tools
- Misrepresenting your identity or business

### 6. Customer Responsibility for Messaging
If you use our messaging or automation services, you are solely responsible for:

- Obtaining proper consent from recipients before sending messages
- Complying with all applicable laws and regulations (including TCPA and carrier requirements)
- Ensuring all communications are related to a valid business relationship

Northern Step Studio does not assume responsibility for how users implement or operate messaging workflows.

### 7. Availability
We do not guarantee that our services will be uninterrupted, secure, or error-free. Some features may be provided as beta or experimental and may change or be discontinued at any time.

### 8. Limitation of Liability
To the maximum extent permitted by law, Northern Step Studio shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of or inability to use our services.

### 9. Changes to Terms
We may update or modify these terms at any time. Continued use of the Services after changes become effective constitutes your acceptance of the revised Terms.

### 10. Contact
For support, questions, or service-related inquiries:

[hello@northernstepstudio.com](mailto:hello@northernstepstudio.com)
`;

const summaryCards = [
  {
    icon: MessageSquare,
    title: "Messaging consent",
    description: "SMS follow-ups, appointment coordination, and service communication.",
  },
  {
    icon: Users,
    title: "Eligibility",
    description: "18+ and business/commercial use only.",
  },
  {
    icon: Shield,
    title: "Opt-out controls",
    description: "Reply STOP to unsubscribe or HELP for assistance.",
  },
  {
    icon: Mail,
    title: "Support contact",
    description: "hello@northernstepstudio.com",
  },
];

const markdownComponents: Components = {
  h2: ({ children }) => (
    <h2 className="mt-10 text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 text-lg sm:text-xl font-black uppercase tracking-wide text-foreground">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mt-4 text-sm sm:text-[15px] leading-7 text-muted-foreground">
      {children}
    </p>
  ),
  ul: ({ children }) => <ul className="mt-4 space-y-3 pl-0">{children}</ul>,
  ol: ({ children }) => <ol className="mt-4 space-y-3 pl-0">{children}</ol>,
  li: ({ children }) => (
    <li className="flex gap-3 text-sm sm:text-[15px] leading-7 text-muted-foreground">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
      <span>{children}</span>
    </li>
  ),
  a: ({ href, children }) => {
    const shouldOpenNewTab = Boolean(href?.startsWith("http"));
    return (
      <a
        href={href}
        className="font-semibold text-accent hover:underline"
        target={shouldOpenNewTab ? "_blank" : undefined}
        rel={shouldOpenNewTab ? "noreferrer" : undefined}
      >
        {children}
      </a>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="mt-6 rounded-r-2xl border-l-4 border-accent/30 bg-accent/5 px-4 py-3 text-sm text-muted-foreground">
      {children}
    </blockquote>
  ),
};

export default function TermsOfService() {
  const { content: termsContent, loading: termsLoading, updatedAt: termsUpdatedAt } = useSiteContent("terms_content");
  const loading = termsLoading;
  const content = termsContent || defaultLegalContent;
  const updatedAtLabel = termsUpdatedAt
    ? new Date(termsUpdatedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
    <div className="relative min-h-screen overflow-hidden bg-background pt-24 pb-24 px-4 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-accent/10 via-transparent to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-24 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-yellow-500/5 blur-3xl" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-accent">
              <Shield className="h-3.5 w-3.5" />
              Legal Foundation
            </div>

            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-foreground leading-tight">
              Terms & Privacy
            </h1>

            <p className="mt-4 max-w-2xl text-base sm:text-lg leading-8 text-muted-foreground">
              Clear rules for messaging consent, service use, and responsible business communication.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card/80 backdrop-blur px-5 py-4 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">
              Last updated
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">{updatedAtLabel}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <div key={card.title} className="card-dark-wise h-full p-5">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-wide text-foreground">
                    {card.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card/80 py-20 card-dark-wise">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                <p className="text-sm text-muted-foreground animate-pulse uppercase font-black tracking-widest">
                  Loading legal content...
                </p>
              </div>
            ) : (
              <article className="card-dark-wise p-6 sm:p-10">
                <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-wider text-accent">
                      Legal overview
                    </p>
                    <h2 className="mt-2 text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground">
                      Rules and responsibilities
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-2 text-xs font-semibold text-muted-foreground">
                    <Clock3 className="h-4 w-4 text-accent" />
                    Business use
                  </div>
                </div>

                <div className="prose prose-invert max-w-none prose-sm sm:prose-base">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {content}
                  </ReactMarkdown>
                </div>
              </article>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 h-fit">
            <div className="card-dark-wise p-6">
              <p className="text-sm font-black uppercase tracking-wider text-accent">
                At a glance
              </p>
              <h3 className="mt-2 text-xl font-black uppercase tracking-tight text-foreground">
                What this page covers
              </h3>
              <ul className="mt-5 space-y-3">
                {[
                  "SMS consent and opt-out rules",
                  "Business use and eligibility",
                  "Acceptable use and messaging responsibility",
                  "Availability and liability limits",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-accent/20 bg-accent/5 p-6">
              <p className="text-sm font-black uppercase tracking-wider text-accent">
                Need help?
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Questions about these terms or service coordination can go to the support inbox below.
              </p>
                <a
                href="mailto:hello@northernstepstudio.com"
                className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-accent"
              >
                <Mail className="h-4 w-4 text-accent" />
                hello@northernstepstudio.com
              </a>
            </div>

            <div className="card-dark-wise p-6">
              <p className="text-sm font-black uppercase tracking-wider text-accent">
                Compliance note
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                STOP and HELP handling is included here so the SMS guidance is explicit and easy to follow.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
