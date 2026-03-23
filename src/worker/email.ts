export type EmailMessage = {
  to: string;
  subject: string;
  html_body?: string;
  text_body?: string;
  reply_to?: string;
  customer_id?: string;
  broadcast?: boolean;
};

export async function sendEmail(env: Env, message: EmailMessage) {
  // If Cloudflare Email Service is available, use it
  if (env.EMAILS && typeof env.EMAILS.send === "function") {
    return env.EMAILS.send(message);
  }

  // Fallback for Vercel/Local: Log to console or use an environment-configured service
  console.log("--- EMAIL MOCK ---");
  console.log(`To: ${message.to}`);
  console.log(`Subject: ${message.subject}`);
  console.log(`Body: ${message.html_body || message.text_body}`);
  console.log("------------------");

  return { success: true, message_id: "mock-id-" + Date.now() };
}
