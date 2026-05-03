import { getDb, type Env } from "./db";

export type EmailMessage = {
  to: string;
  from?: string;
  reply_to?: string;
  subject: string;
  html_body: string;
  text_body?: string;
};

export type EmailResponse = {
  success: boolean;
  message_id?: string;
  error?: string;
};

export async function sendEmail(_env: Env, message: EmailMessage): Promise<EmailResponse> {
  // Resend or Mailgun implementation would go here.
  // For now, logging to DB/Console.
  console.log(`[Email] To: ${message.to}, Subject: ${message.subject}`);
  
  try {
    const sql = getDb(_env);
    await sql`
      INSERT INTO outbound_emails (recipient, subject, html_content, status, created_at)
      VALUES (${message.to}, ${message.subject}, ${message.html_body}, 'logged', CURRENT_TIMESTAMP)
    `.catch((err: any) => console.error("Logged email failed", err));

    return { success: true, message_id: `msg_${Math.random().toString(36).slice(2)}` };
  } catch (error: any) {
    console.error("Email send failed:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}
