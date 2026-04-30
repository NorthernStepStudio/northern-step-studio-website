import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { AlertCircle, BookOpen, CheckCircle, Mail, MessageCircle, PhoneCall, Send, Sparkles } from "lucide-react";
import GlitchedText from "@/react-app/components/GlitchedText";
import SEO from "@/react-app/components/SEO";
import { EXTERNAL_LINKS } from "@/react-app/lib/site";

type FeedbackState = {
  type: "success" | "error";
  text: string;
};

async function parseResponse(response: Response) {
  return response.json().catch(() => null);
}

export default function Contact() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const intent = searchParams.get("intent");
  const tier = searchParams.get("tier");
  const industry = searchParams.get("industry");
  const phone = searchParams.get("phone");
  const source = searchParams.get("source") || "contact_page";
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    smsConsent: false,
  });
  const [earlyAccessEmail, setEarlyAccessEmail] = useState("");
  const [earlyAccessInterest, setEarlyAccessInterest] = useState("");
  const [sending, setSending] = useState(false);
  const [earlyAccessSending, setEarlyAccessSending] = useState(false);
  const [formFeedback, setFormFeedback] = useState<FeedbackState | null>(null);
  const [earlyAccessFeedback, setEarlyAccessFeedback] = useState<FeedbackState | null>(null);

  const requestPresets = [
    {
      key: "start-project",
      label: "Start Project",
      subject: "Start a new project",
      message:
        "Project name:\nIndustry:\nMain goal:\nCurrent tools:\nTarget launch window:\n",
    },
    {
      key: "automation-build",
      label: "Automation Build",
      subject: "Request service automation build",
      message:
        "Business name:\nIndustry:\nMain workflow to automate:\nCurrent tools used:\nTop problem to solve first:\n",
    },
    {
      key: "general-support",
      label: "General",
      subject: "General inquiry",
      message: "",
    },
  ];

  const formatTierLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

  const fillTemplateLine = (template: string, label: string, value: string | null | undefined) => {
    if (!value) {
      return template;
    }

    const safeValue = value.trim();
    if (!safeValue) {
      return template;
    }

    const pattern = new RegExp(`^${label}:.*$`, "m");
    if (pattern.test(template)) {
      return template.replace(pattern, `${label}: ${safeValue}`);
    }

    return `${label}: ${safeValue}\n${template}`;
  };

  const applyPreset = (
    presetKey: string,
    tierKey?: string | null,
    industryKey?: string | null,
    phoneKey?: string | null,
  ) => {
    const preset = requestPresets.find((item) => item.key === presetKey);
    if (!preset) {
      return;
    }

    const normalizedTier = tierKey ? formatTierLabel(tierKey) : null;
    const normalizedIndustry = industryKey?.trim() || null;
    let subject = normalizedTier ? `${preset.subject} - ${normalizedTier}` : preset.subject;
    if (normalizedIndustry) {
      subject = `${subject} (${normalizedIndustry})`;
    }

    let message = preset.message;
    message = fillTemplateLine(message, "Industry", normalizedIndustry);
    message = fillTemplateLine(message, "Mobile Phone", phoneKey);
    message = fillTemplateLine(message, "Requested tier", normalizedTier);

    setFormState((current) => ({
      ...current,
      subject,
      phone: current.phone || phoneKey || "",
      message: current.message.trim().length > 0 && current.message !== preset.message && current.message !== message ? current.message : message,
    }));
  };

  useEffect(() => {
    if (!intent) {
      return;
    }

    applyPreset(intent, tier, industry, phone);
  }, [intent, tier, industry, phone]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSending(true);
    setFormFeedback(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formState,
          source,
          intent,
          requestedTier: tier,
          industry,
        }),
      });

      const data = await parseResponse(response);
      if (!response.ok) {
        throw new Error(data?.error || t("contact.error"));
      }

      setFormFeedback({
        type: "success",
        text: data?.delivery_status === "saved_only" ? t("contact.saved_only") : t("contact.success"),
      });
      setFormState({ name: "", email: "", phone: "", subject: "", message: "", smsConsent: false });
    } catch (error) {
      setFormFeedback({
        type: "error",
        text: error instanceof Error ? error.message : t("contact.error"),
      });
    } finally {
      setSending(false);
    }
  };

  const handleEarlyAccessSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setEarlyAccessSending(true);
    setEarlyAccessFeedback(null);

    try {
      const response = await fetch("/api/contact/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: earlyAccessEmail,
          interest: earlyAccessInterest,
          source: "contact_page",
        }),
      });

      const data = await parseResponse(response);
      if (!response.ok) {
        throw new Error(data?.error || t("contact.error"));
      }

      let text: string = t("contact.early_access.success");
      if (data?.already_exists) {
        text = t("contact.early_access.updated");
      } else if (data?.delivery_status === "saved_only") {
        text = t("contact.early_access.saved_only");
      }

      setEarlyAccessFeedback({ type: "success", text });
      setEarlyAccessEmail("");
      setEarlyAccessInterest("");
    } catch (error) {
      setEarlyAccessFeedback({
        type: "error",
        text: error instanceof Error ? error.message : t("contact.error"),
      });
    } finally {
      setEarlyAccessSending(false);
    }
  };

  return (
    <div className="min-h-screen px-4 pb-12 pt-24 sm:px-6">
      <SEO
        title={t("contact.title")}
        description={t("seo.contact_description")}
        keywords="contact northern step studio, app support, partnership inquiries, customer service"
        canonicalUrl="/contact"
      />
      <div className="container mx-auto max-w-5xl">

        <div className="mb-12 text-center">
          <span className="mb-2 block text-xs text-accent text-label sm:text-sm">{t("contact.label")}</span>
          <h1 className="mb-4 text-3xl font-black uppercase tracking-tight sm:text-4xl lg:text-5xl leading-tight">
            <GlitchedText text={t("contact.title")} duration={600} />
          </h1>
          <p className="mx-auto max-w-2xl text-sm font-normal text-muted-foreground sm:text-base">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className="mb-6 rounded-3xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 via-transparent to-transparent p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-yellow-400">
                <PhoneCall className="h-3.5 w-3.5" />
                Best use of this form
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
                Share project goals, not a vague quote request.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                If you need support, have a partnership idea, or want to discuss a custom build, use the form below. We respond to all inquiries within 24-48 business hours.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {requestPresets.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => applyPreset(preset.key, tier, industry, phone)}
                  className="rounded-full border border-border bg-background/80 px-4 py-2 text-xs font-black uppercase tracking-wider text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="card-dark-wise">


              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-medium">{t("contact.form.name")}</label>
                    <input
                      id="name"
                      title={t("contact.form.name")}
                      placeholder={t("contact.form.name") || "Your Name"}
                      type="text"
                      required
                      value={formState.name}
                      onChange={(event) => setFormState({ ...formState, name: event.target.value })}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 transition-all focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium">{t("contact.form.email")}</label>
                    <input
                      id="email"
                      title={t("contact.form.email")}
                      placeholder={t("contact.form.email") || "your@email.com"}
                      type="email"
                      required
                      value={formState.email}
                      onChange={(event) => setFormState({ ...formState, email: event.target.value })}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 transition-all focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="phone" className="mb-2 block text-sm font-medium">{t("contact.form.phone")}</label>
                    <input
                      id="phone"
                      title={t("contact.form.phone")}
                      placeholder={t("contact.form.phone_placeholder")}
                      type="tel"
                      autoComplete="tel"
                      required={formState.smsConsent}
                      value={formState.phone}
                      onChange={(event) => setFormState({ ...formState, phone: event.target.value })}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 transition-all focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t("contact.form.phone_note")}
                    </p>
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="mb-2 block text-sm font-medium">{t("contact.form.subject")}</label>
                  <input
                    id="subject"
                    title={t("contact.form.subject")}
                    placeholder={t("contact.form.subject") || "How can we help?"}
                    type="text"
                    required
                    value={formState.subject}
                    onChange={(event) => setFormState({ ...formState, subject: event.target.value })}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 transition-all focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-medium">{t("contact.form.message")}</label>
                  <textarea
                    id="message"
                    title={t("contact.form.message")}
                    placeholder={t("contact.form.message") || "Your message..."}
                    required
                    rows={5}
                    value={formState.message}
                    onChange={(event) => setFormState({ ...formState, message: event.target.value })}
                    className="theme-scrollbar w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 transition-all focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <label className="flex items-start gap-3 rounded-2xl border border-border bg-background/60 px-4 py-4 text-sm">
                  <input
                    type="checkbox"
                    checked={formState.smsConsent}
                    onChange={(event) => setFormState({ ...formState, smsConsent: event.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-border bg-background text-accent focus:ring-accent/50"
                  />
                  <span className="text-muted-foreground">
                    {t("contact.form.sms_opt_in_label")}{" "}
                    <Link to="/terms" className="text-accent hover:underline">
                      Terms & Privacy
                    </Link>
                    .
                  </span>
                </label>
                <p className="text-xs text-muted-foreground">
                  {t("contact.form.sms_opt_in_note")}
                </p>

                {formFeedback && (
                  <div
                    className={`flex items-start gap-2 rounded-2xl px-4 py-3 text-sm ${
                      formFeedback.type === "success" ? "bg-accent/10 text-accent" : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {formFeedback.type === "success" ? (
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                    )}
                    <span>{formFeedback.text}</span>
                  </div>
                )}

                <button type="submit" disabled={sending} className="btn-pill-primary w-full sm:w-auto disabled:opacity-50">
                  {sending ? t("contact.form.sending") : t("contact.form.send")}
                  <Send className="ml-2 inline-block h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-4">


            <div className="card-dark-wise">
              <h3 className="mb-4 text-lg font-black uppercase">{t("contact.info.title")}</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
                    <Mail className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("contact.general_label")}</p>
                    <a href={EXTERNAL_LINKS.contactEmail} className="text-sm font-medium transition-colors hover:text-accent">
                      hello@northernstepstudio.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
                    <Mail className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("contact.support_label")}</p>
                    <a href={EXTERNAL_LINKS.supportEmail} className="text-sm font-medium transition-colors hover:text-accent">
                      support@northernstepstudio.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
                    <MessageCircle className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("contact.updates_label")}</p>
                    <Link to="/updates" className="text-sm font-medium transition-colors hover:text-accent">
                      {t("contact.read_updates")}
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
                    <BookOpen className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("contact.docs_label")}</p>
                    <Link to="/docs" className="text-sm font-medium transition-colors hover:text-accent">
                      {t("contact.open_docs")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-dark-wise border-accent/30">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
                  <Sparkles className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-lg font-black uppercase">{t("contact.early_access.title")}</h3>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">{t("contact.early_access.desc")}</p>
              <form onSubmit={handleEarlyAccessSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder={t("contact.early_access.placeholder")}
                  value={earlyAccessEmail}
                  onChange={(event) => setEarlyAccessEmail(event.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wide text-muted-foreground">
                    {t("contact.early_access.interest_label")}
                  </label>
                  <textarea
                    rows={3}
                    value={earlyAccessInterest}
                    onChange={(event) => setEarlyAccessInterest(event.target.value)}
                    placeholder={t("contact.early_access.interest_placeholder")}
                    className="theme-scrollbar w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <button type="submit" disabled={earlyAccessSending} className="btn-pill-primary w-full text-sm disabled:opacity-50">
                  {earlyAccessSending ? t("contact.early_access.joining") : t("contact.early_access.join")}
                </button>
                {earlyAccessFeedback && (
                  <div
                    className={`flex items-start gap-2 rounded-2xl px-4 py-3 text-sm ${
                      earlyAccessFeedback.type === "success" ? "bg-accent/10 text-accent" : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {earlyAccessFeedback.type === "success" ? (
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    )}
                    <span>{earlyAccessFeedback.text}</span>
                  </div>
                )}
              </form>
              <p className="mt-4 text-xs text-muted-foreground">
                {t("contact.legal_note")}{" "}
                <Link to="/terms" className="text-accent hover:underline">
                  Terms & Privacy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
