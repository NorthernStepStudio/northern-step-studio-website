import { randomUUID } from "node:crypto";
import type { DeliveryVerification, SmsMessage } from "../../core/types.js";

export interface SmsSendRequest extends SmsMessage {
  readonly statusCallbackUrl?: string;
}

export interface SmsAdapter {
  send(message: SmsSendRequest): Promise<DeliveryVerification & { readonly messageId: string; readonly provider: string; readonly raw?: unknown }>;
  verify(messageId: string): Promise<DeliveryVerification>;
}

export interface SmsAdapterConfig {
  readonly provider?: "mock" | "twilio";
  readonly accountSid?: string;
  readonly authToken?: string;
  readonly fromNumber?: string;
  readonly baseUrl?: string;
  readonly statusCallbackUrl?: string;
}

type StoredDelivery = DeliveryVerification & { readonly messageId: string; readonly provider: string; readonly raw?: unknown };

function buildBasicAuth(username: string, password: string): string {
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

function createMockDelivery(message: SmsSendRequest): StoredDelivery {
  const messageId = `sms_${randomUUID()}`;
  return {
    messageId,
    provider: "mock",
    status: "delivered",
    deliveredAt: new Date().toISOString(),
    detail: `Mock SMS recorded for ${message.to}.`,
    raw: {
      to: message.to,
      from: message.from,
      body: message.body,
    },
  };
}

export function createSmsAdapter(config: SmsAdapterConfig): SmsAdapter {
  const sentMessages = new Map<string, StoredDelivery>();

  return {
    async send(message) {
      const provider = config.provider || "mock";
      const fromNumber = message.from || config.fromNumber || "";

      if (!fromNumber) {
        const failed: StoredDelivery = {
          messageId: `sms_${randomUUID()}`,
          provider,
          status: "failed",
          detail: "No SMS from number is configured.",
        };
        sentMessages.set(failed.messageId, failed);
        return failed;
      }

      if (provider === "twilio") {
        if (!config.accountSid || !config.authToken) {
          const failed: StoredDelivery = {
            messageId: `sms_${randomUUID()}`,
            provider,
            status: "failed",
            detail: "Twilio credentials are not configured.",
          };
          sentMessages.set(failed.messageId, failed);
          return failed;
        }

        try {
          const baseUrl = config.baseUrl || "https://api.twilio.com";
          const url = new URL(
            `/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
            baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`,
          );
          const body = new URLSearchParams({
            To: message.to,
            From: fromNumber,
            Body: message.body,
          });
          const callbackUrl = message.statusCallbackUrl || config.statusCallbackUrl;
          if (callbackUrl) {
            body.set("StatusCallback", callbackUrl);
            body.set("StatusCallbackMethod", "POST");
          }

          const response = await fetch(url, {
            method: "POST",
            headers: {
              authorization: buildBasicAuth(config.accountSid, config.authToken),
              "content-type": "application/x-www-form-urlencoded",
            },
            body,
          });

          const raw = (await response.json().catch(() => undefined)) as Record<string, unknown> | undefined;
          if (!response.ok) {
            const failed: StoredDelivery = {
              messageId: `sms_${randomUUID()}`,
              provider,
              status: "failed",
              detail: (raw?.message as string | undefined) || `Twilio returned ${response.status}.`,
              raw,
            };
            sentMessages.set(failed.messageId, failed);
            return failed;
          }

          const delivered: StoredDelivery = {
            messageId: String((raw?.sid as string | undefined) || `sms_${randomUUID()}`),
            provider,
            status: (raw?.status as string | undefined) === "failed" ? "failed" : "queued",
            detail: (raw?.status as string | undefined) || "Twilio accepted the message.",
            raw,
          };
          sentMessages.set(delivered.messageId, delivered);
          return delivered;
        } catch (error) {
          const failed: StoredDelivery = {
            messageId: `sms_${randomUUID()}`,
            provider,
            status: "failed",
            detail: error instanceof Error ? error.message : String(error),
          };
          sentMessages.set(failed.messageId, failed);
          return failed;
        }
      }

      const delivery = createMockDelivery(message);
      sentMessages.set(delivery.messageId, delivery);
      return delivery;
    },
    async verify(messageId) {
      const record = sentMessages.get(messageId);
      if (!record) {
        return {
          status: "unknown",
          messageId,
          detail: "No local delivery record was found.",
        };
      }
      const status: NonNullable<DeliveryVerification["status"]> =
        record.status === "failed"
          ? "failed"
          : record.status === "queued"
            ? "queued"
            : "delivered";
      return {
        status,
        messageId,
        detail: record.detail,
        deliveredAt: status === "delivered" ? record.deliveredAt || new Date().toISOString() : undefined,
      };
    },
  };
}
