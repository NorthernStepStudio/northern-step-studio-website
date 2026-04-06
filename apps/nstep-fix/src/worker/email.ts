export type EmailMessage = {
  to: string;
  subject: string;
  html_body?: string;
  text_body?: string;
  reply_to?: string;
  customer_id?: string;
  broadcast?: boolean;
};

export async function sendEmail(_env: Env, message: EmailMessage) {
  // Cloudflare Email Service is no longer available in the Vercel architecture.
  // Fallback for Vercel/Local: Log to console or integrate with a future service (SendGrid/Postmark).

  // Fallback for Vercel/Local: Log to console or use an environment-configured service
  console.log("--- EMAIL MOCK ---");
  console.log(`To: ${message.to}`);
  console.log(`Subject: ${message.subject}`);
  console.log(`Body: ${message.html_body || message.text_body}`);
  console.log("------------------");

  return { success: true, message_id: "mock-id-" + Date.now(), error: undefined as string | undefined };
}
