import { randomUUID } from "node:crypto";

export interface EmailMessage {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly html?: string;
  readonly meta?: Record<string, unknown>;
}

export interface EmailDeliveryResult {
  readonly messageId: string;
  readonly status: "queued" | "sent" | "failed";
  readonly detail?: string;
  readonly raw?: unknown;
}

export interface EmailAdapter {
  send(message: EmailMessage): Promise<EmailDeliveryResult>;
}

export interface EmailAdapterConfig {
  readonly provider?: "mock" | "webhook";
  readonly webhookUrl?: string;
  readonly from?: string;
}

export function createEmailAdapter(config: EmailAdapterConfig): EmailAdapter {
  return {
    async send(message) {
      if (config.provider === "webhook" && config.webhookUrl) {
        try {
          const response = await fetch(config.webhookUrl, {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              from: config.from,
              to: message.to,
              subject: message.subject,
              text: message.text,
              html: message.html,
              meta: message.meta,
            }),
          });

          const raw = (await response.json().catch(() => undefined)) as Record<string, unknown> | undefined;
          if (!response.ok) {
            return {
              messageId: `email_${randomUUID()}`,
              status: "failed",
              detail: (raw?.error as string | undefined) || `Email webhook returned ${response.status}.`,
              raw,
            };
          }

          return {
            messageId: String((raw?.messageId as string | undefined) || `email_${randomUUID()}`),
            status: "sent",
            detail: (raw?.detail as string | undefined) || "Email webhook accepted the message.",
            raw,
          };
        } catch (error) {
          return {
            messageId: `email_${randomUUID()}`,
            status: "failed",
            detail: error instanceof Error ? error.message : String(error),
          };
        }
      }

      return {
        messageId: `email_${randomUUID()}`,
        status: "queued",
        detail: `Mock email queued for ${message.to}.`,
      };
    },
  };
}
