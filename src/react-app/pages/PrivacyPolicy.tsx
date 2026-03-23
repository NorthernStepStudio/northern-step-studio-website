import { Shield, Mail } from "lucide-react";
import GlitchedText from "@/react-app/components/GlitchedText";
import StudioHomeLink from "@/react-app/components/StudioHomeLink";

export default function PrivacyPolicy() {
  const lastUpdated = "March 8, 2026";

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 pb-12">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 flex justify-center sm:justify-start">
          <StudioHomeLink />
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/30 mb-4">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter mb-4">
            <GlitchedText text="Privacy Policy" duration={600} />
          </h1>
          <p className="text-muted-foreground text-sm">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="card-dark-wise space-y-8">
          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Northern Step Studio ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you use our mobile applications,
              games, websites, and services (collectively, the "Services").
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Please read this privacy policy carefully. By using our Services, you agree to the collection and use of
              information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">Information We Collect</h2>

            <h3 className="text-lg font-bold mb-2">Information You Provide</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Account information when you create an account</li>
              <li>Contact information when you reach out for support, access, or pilot review</li>
              <li>Mobile phone numbers and SMS consent selections when you request text follow-up</li>
              <li>Feedback, suggestions, and communications you send to us</li>
              <li>Information you provide when participating in beta or pilot programs</li>
            </ul>

            <h3 className="text-lg font-bold mb-2">Information Collected Automatically</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Device information such as device type, operating system, and browser details</li>
              <li>Usage data such as app interactions, features used, and time spent</li>
              <li>Log data such as IP address, access times, and error records</li>
              <li>Analytics data used to improve our Services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">Service Automation and Business Messaging Data</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you contact us about Lead Recovery services, request a pilot install, or use a service automation workflow, we may collect
              business contact information, website details, phone routing details, service information, scheduling
              context, and other workflow configuration details needed to set up and operate the service.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Where these systems are installed for a client business, we may process call metadata, customer phone numbers,
              message content, timestamps, appointment details, and related operational records on that business's behalf
              in order to deliver missed-call follow-up, lead response, booking, support, and task routing workflows.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>To provide, maintain, and improve our Services</li>
              <li>To personalize your experience</li>
              <li>To communicate with you about updates, features, and support</li>
              <li>To configure and operate business workflows and missed-call response systems</li>
              <li>To analyze usage patterns and optimize performance</li>
              <li>To detect and prevent fraud or abuse</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Service Providers:</strong> Third-party vendors who help us operate our Services</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you give us permission to share your information</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We do not sell or share phone numbers, SMS consent records, or SMS opt-in data with third parties or
              affiliates for their own marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">SMS, Calls, and Opt-Outs</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Service automation systems may be used to support missed-call follow-up, booking messages, customer support, and other
              service-related communications. Message frequency varies by workflow, and message or data rates may apply.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Where SMS workflows are active, end users can reply STOP to opt out and HELP for help. Consent to receive
              messages is not a condition of purchase.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Opt-in methods may include website forms, contact requests, setup review requests, or other inbound
              communications where a user provides a mobile number and clearly agrees to receive text follow-up. We may
              retain the phone number, request details, consent timestamp, and related message logs needed to document
              consent, operate the workflow, and resolve support or compliance questions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our Services may use third-party services that collect or process information. These may include:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Analytics providers</li>
              <li>Cloud hosting providers</li>
              <li>Payment processors where applicable</li>
              <li>Telephony and messaging providers used to deliver service automation workflows</li>
              <li>Email delivery and scheduling providers used for service operations</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              These third parties have their own privacy policies governing their use of your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against
              unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the
              Internet or electronic storage is 100 percent secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain personal information only for as long as necessary to fulfill the purposes outlined in this
              Privacy Policy, unless a longer retention period is required by law. When information is no longer needed,
              we will securely delete or anonymize it where appropriate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your data</li>
              <li><strong>Portability:</strong> Request transfer of your data</li>
              <li><strong>Opt-out:</strong> Opt out of marketing communications</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise these rights, please contact us using the information below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Services are not intended for children under 13 years of age. We do not knowingly collect personal
              information from children under 13. If we discover that we have collected personal information from a child
              under 13, we will take steps to delete that information promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the last-updated date. You are advised to review this page
              periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">Contact the Studio</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-2xl border border-accent/20">
              <Mail className="w-5 h-5 text-accent" />
              <a href="mailto:hello@northernstepstudio.com" className="text-accent hover:underline">
                hello@northernstepstudio.com
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
