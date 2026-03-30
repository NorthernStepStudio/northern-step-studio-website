import { Shield } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import GlitchedText from "@/react-app/components/GlitchedText";
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

[support@northernstepstudio.com](mailto:support@northernstepstudio.com)
`;

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
    <div className="min-h-screen pt-24 px-4 sm:px-6 pb-24 bg-background">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-accent/10 border border-accent/20 mb-6 group hover:border-accent/40 transition-colors duration-500">
            <Shield className="w-10 h-10 text-accent group-hover:scale-110 transition-transform duration-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter mb-4 leading-none">
            <GlitchedText text="Terms & Privacy" duration={800} />
          </h1>
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/30 border border-border/50">
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
              Legal Context - Last updated: {updatedAtLabel}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 card-dark-wise">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent mb-4" />
              <p className="text-sm text-muted-foreground animate-pulse uppercase font-black tracking-widest">
                Loading legal content...
              </p>
            </div>
          ) : (
            <div className="card-dark-wise p-8 sm:p-10">
              <div className="prose prose-invert max-w-none prose-sm sm:prose-base">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
