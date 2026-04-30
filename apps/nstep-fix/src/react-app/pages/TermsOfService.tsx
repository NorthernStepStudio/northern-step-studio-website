import { useState, useEffect } from "react";
import { FileText, Mail, Shield, MessageSquare, Bell, Lock, AlertCircle, RefreshCw, HelpCircle, ChevronRight, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import GlitchedText from "@/react-app/components/GlitchedText";
import { useSiteContent } from "@/react-app/hooks/useSiteContent";

export default function TermsOfService() {
  const { content: termsContent, loading: termsLoading, updatedAt: termsUpdatedAt } = useSiteContent("terms_content");
  const { content: privacyContent, loading: privacyLoading, updatedAt: privacyUpdatedAt } = useSiteContent("privacy_content");
  const [lastUpdated, setLastUpdated] = useState("March 24, 2026");

  const loading = termsLoading || privacyLoading;
  const latestUpdatedAt = (termsUpdatedAt && privacyUpdatedAt) 
    ? (new Date(termsUpdatedAt) > new Date(privacyUpdatedAt) ? termsUpdatedAt : privacyUpdatedAt)
    : (termsUpdatedAt || privacyUpdatedAt);

  useEffect(() => {
    if (latestUpdatedAt) {
      setLastUpdated(new Date(latestUpdatedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    }
  }, [latestUpdatedAt]);

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
              Legal Context • Last updated: {lastUpdated}
            </p>
          </div>
        </div>

        <div className="space-y-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 card-dark-wise">
              <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
              <p className="text-sm text-muted-foreground animate-pulse uppercase font-black tracking-widest">
                Retrieving legal infrastructure...
              </p>
            </div>
          ) : (termsContent || privacyContent) ? (
            <div className="space-y-8">
              {termsContent && (
                <div className="card-dark-wise p-8 sm:p-10">
                  <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
                    <FileText className="w-5 h-5 text-accent" />
                    <h2 className="text-xl font-black uppercase tracking-tight">Terms of Service</h2>
                  </div>
                  <div className="prose prose-invert max-w-none prose-sm sm:prose-base">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {termsContent}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
              
              {privacyContent && (
                <div className="card-dark-wise p-8 sm:p-10 border-t-2 border-accent/20">
                  <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
                    <Lock className="w-5 h-5 text-accent" />
                    <h2 className="text-xl font-black uppercase tracking-tight">Privacy Policy</h2>
                  </div>
                  <div className="prose prose-invert max-w-none prose-sm sm:prose-base">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {privacyContent}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card-dark-wise p-8 sm:p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Legal Foundation</h2>
              </div>
              <p className="text-lg text-foreground font-medium leading-relaxed mb-10">
                Welcome to Northern Step Studio. These Terms & Privacy guidelines govern your access to and use of our
                services. By using our Studio's products, you agree to the following terms.
              </p>

              <div className="space-y-12">
                <section className="group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center group-hover:bg-accent/10 group-hover:border-accent/30 transition-all duration-300">
                      <Shield className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-foreground">1. Service Description</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed pl-14">
                    Northern Step Studio provides mobile applications, games, and automated communication tools, including missed call text-back and lead recovery messaging services for businesses.
                  </p>
                </section>

                <section className="group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center group-hover:bg-accent/10 group-hover:border-accent/30 transition-all duration-300">
                      <Bell className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-foreground">2. Messaging Consent</h2>
                  </div>
                  <div className="pl-14 space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      By submitting your phone number through our forms or interacting with our services, you consent to receive SMS messages related to:
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {["Missed call follow-ups", "Appointment coordination", "Service-related communication"].map((item) => (
                        <li key={item} className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/20 border border-border/40 text-sm text-foreground font-bold italic uppercase">
                          <MessageSquare className="w-4 h-4 text-accent" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                      If you use our service automation or any related communication workflow, you are responsible for using it lawfully and only in connection with valid customer relationships.
                    </p>
                    <p className="text-xs text-muted-foreground italic font-medium pt-2">
                      Message frequency may vary. Message and data rates may apply.
                    </p>
                  </div>
                </section>

                <section className="group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center group-hover:bg-accent/10 group-hover:border-accent/30 transition-all duration-300">
                      <HelpCircle className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-foreground">3. Opt-Out Instructions</h2>
                  </div>
                  <div className="pl-14">
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      You can opt out at any time by replying:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20">
                        <p className="text-xs font-black uppercase text-destructive mb-1">Unsubscribe</p>
                        <p className="text-2xl font-black text-foreground">STOP</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20 border-dashed">
                        <p className="text-xs font-black uppercase text-accent mb-1">Assistance</p>
                        <p className="text-2xl font-black text-foreground">HELP</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center group-hover:bg-accent/10 group-hover:border-accent/30 transition-all duration-300">
                      <AlertCircle className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-foreground">4. Use of Services & Eligibility</h2>
                  </div>
                  <div className="pl-14 space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      You must be at least 13 years old to use our Services. Some features may require account registration. You are responsible for all activities that occur under your account.
                    </p>
                    <h3 className="text-sm font-black uppercase text-accent mt-4">Acceptable Use Policy</h3>
                    <ul className="space-y-2">
                      {[
                        "No unlawful purpose or harassment",
                        "No reverse engineering or decompiling software",
                        "No unauthorized access or disruption to systems",
                        "No automated bots or deceptive messaging"
                      ].map((rule) => (
                        <li key={rule} className="flex items-center gap-3 text-sm text-muted-foreground">
                          <ChevronRight className="w-3 h-3 text-accent" />
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <section className="group card-dark-wise p-6 bg-secondary/10 border-none">
                    <h2 className="text-sm font-black uppercase tracking-widest text-accent mb-4">6. Availability</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We do not guarantee uninterrupted or error-free service. Services may be offered as preview programs with varying support scope.
                    </p>
                  </section>

                  <section className="group card-dark-wise p-6 bg-secondary/10 border-none">
                    <h2 className="text-sm font-black uppercase tracking-widest text-accent mb-4">7. Liability</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Northern Step Studio is not liable for any damages resulting from the use or inability to use our services, to the maximum extent permitted by law.
                    </p>
                  </section>
                </div>

                <section className="group pt-6 border-t border-border/50">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center group-hover:bg-accent/10 group-hover:border-accent/30 transition-all duration-300">
                      <RefreshCw className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-foreground">8. Changes to Terms</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed pl-14">
                    We may update these terms at any time. Continued use of the Services after changes become effective constitutes your acceptance of the revised Terms.
                  </p>
                </section>

                <section className="group pt-8">
                  <div className="p-8 rounded-[2rem] bg-gradient-to-br from-accent/10 via-background to-background border border-accent/20">
                    <h2 className="text-xl font-black uppercase tracking-tight text-foreground mb-4">9. Contact the Studio</h2>
                    <p className="text-muted-foreground mb-8">For support, questions about these terms, or service coordination:</p>
                    <a 
                      href="mailto:support@northernstepstudio.com" 
                      className="inline-flex items-center gap-4 p-4 pr-8 rounded-2xl bg-background border border-border/50 hover:border-accent group/btn transition-colors duration-300"
                    >
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover/btn:bg-accent group-hover/btn:text-accent-foreground transition-colors">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Email Support</p>
                        <p className="text-sm font-bold text-foreground">support@northernstepstudio.com</p>
                      </div>
                    </a>
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
