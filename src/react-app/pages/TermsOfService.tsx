import { FileText, Mail } from "lucide-react";
import GlitchedText from "@/react-app/components/GlitchedText";
import StudioHomeLink from "@/react-app/components/StudioHomeLink";

export default function TermsOfService() {
  const lastUpdated = "March 8, 2026";

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 pb-12">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 flex justify-center sm:justify-start">
          <StudioHomeLink />
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/30 mb-4">
            <FileText className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter mb-4">
            <GlitchedText text="Terms of Service" duration={600} />
          </h1>
          <p className="text-muted-foreground text-sm">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="card-dark-wise space-y-8">
          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Northern Step Studio. These Terms of Service ("Terms") govern your access to and use of our
              mobile applications, games, websites, and services (collectively, the "Services") operated by Northern
              Step Studio ("we," "our," or "us").
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these
              Terms, please do not use our Services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">Pilot and Early Access Services</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Some Services, including Lead Recovery systems, may be offered as guided installs, pilots, beta programs, or limited
              early-access releases. Availability, features, pricing, and support scope may change as the product
              matures.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We may accept, defer, pause, or decline pilot requests based on fit, readiness, operational capacity, or
              compliance requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">Use of Services</h2>

            <h3 className="text-lg font-bold mb-2">Eligibility</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You must be at least 13 years old to use our Services. By using our Services, you represent and warrant
              that you meet this age requirement.
            </p>

            <h3 className="text-lg font-bold mb-2">Account Registration</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Some features of our Services may require you to create an account. You are responsible for maintaining
              the confidentiality of your account credentials and for all activities that occur under your account.
            </p>

            <h3 className="text-lg font-bold mb-2">Acceptable Use</h3>
            <p className="text-muted-foreground leading-relaxed mb-2">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Use the Services for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Services</li>
              <li>Reverse engineer, decompile, or disassemble our software</li>
              <li>Use automated systems or bots without our permission</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">Messaging, Calls, and Compliance</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you use our service automation or any related communication workflow, you are responsible for using it lawfully and
              only in connection with valid customer relationships, requested service, or other permitted operational
              communication.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Obtain any consent required by applicable law before sending messages</li>
              <li>Use accurate business identity, routing, and contact information</li>
              <li>Honor opt-out requests and customer communication preferences</li>
              <li>Do not use our Services for spam, deceptive messaging, or unlawful solicitation</li>
              <li>Maintain any required third-party accounts, numbers, approvals, or provider compliance checks</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              If you provide a mobile number and explicitly agree to SMS follow-up on our website, you agree that
              Northern Step Studio may send conversational text messages related to your inquiry, setup review,
              onboarding, support, or service automation request. Message frequency varies. Message and data rates may
              apply. Reply STOP to opt out and HELP for help. Consent is not a condition of purchase. Carriers are not
              liable for delayed or undelivered messages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All content, features, and functionality of our Services, including but not limited to text, graphics,
              logos, icons, images, audio clips, software, and code, are owned by Northern Step Studio or our licensors
              and are protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You are granted a limited, non-exclusive, non-transferable license to access and use our Services for
              personal, non-commercial purposes. This license does not include any right to modify, reproduce,
              distribute, or create derivative works from our content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">In-App Purchases and Payments</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Some of our Services may offer in-app purchases or premium features. All purchases are processed through
              the respective app store and are subject to the app store's terms and conditions.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>All sales are final unless otherwise required by law</li>
              <li>Prices are subject to change without notice</li>
              <li>You are responsible for all charges incurred under your account</li>
              <li>Refund requests should be directed to the respective app store</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">User Content</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If our Services allow you to submit, post, or share content, you retain ownership of your content but
              grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your
              content in connection with operating and improving our Services.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You are solely responsible for your content and must ensure it does not violate any laws or infringe on
              any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">Disclaimers</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our Services are provided "as is" and "as available" without warranties of any kind, either express or
              implied. We do not warrant that the Services will be uninterrupted, error-free, or free of viruses or
              other harmful components.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by law, we disclaim all warranties, including implied warranties of
              merchantability, fitness for a particular purpose, and non-infringement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, Northern Step Studio shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, including but not limited to loss of profits,
              data, or use, arising out of or related to your use of our Services, even if we have been advised of the
              possibility of such damages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify, defend, and hold harmless Northern Step Studio and its officers, directors,
              employees, and agents from and against any claims, liabilities, damages, losses, and expenses arising out
              of or related to your use of the Services or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate your access to our Services at any time, with or without
              cause, and with or without notice. Upon termination, your right to use the Services will immediately
              cease.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We may also suspend or disable communication workflows that create delivery risk, compliance risk, abuse
              risk, or provider account violations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms from time to time. We will notify you of any material changes by posting the new
              Terms on this page and updating the last-updated date. Your continued use of the Services after changes
              become effective constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with applicable laws, without regard to
              conflict of law principles. Any disputes arising from these Terms or your use of the Services shall be
              resolved through good-faith negotiation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">Severability</h2>
            <p className="text-muted-foreground leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or
              eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and
              effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-4 text-accent">Contact the Studio</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have any questions about these Terms, please contact us:
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
