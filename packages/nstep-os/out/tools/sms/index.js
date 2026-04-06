import { randomUUID } from "node:crypto";
function buildBasicAuth(username, password) {
    return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}
function createMockDelivery(message) {
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
export function createSmsAdapter(config) {
    const sentMessages = new Map();
    return {
        async send(message) {
            const provider = config.provider || "mock";
            const fromNumber = message.from || config.fromNumber || "";
            if (!fromNumber) {
                const failed = {
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
                    const failed = {
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
                    const url = new URL(`/2010-04-01/Accounts/${config.accountSid}/Messages.json`, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
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
                    const raw = (await response.json().catch(() => undefined));
                    if (!response.ok) {
                        const failed = {
                            messageId: `sms_${randomUUID()}`,
                            provider,
                            status: "failed",
                            detail: raw?.message || `Twilio returned ${response.status}.`,
                            raw,
                        };
                        sentMessages.set(failed.messageId, failed);
                        return failed;
                    }
                    const delivered = {
                        messageId: String(raw?.sid || `sms_${randomUUID()}`),
                        provider,
                        status: raw?.status === "failed" ? "failed" : "queued",
                        detail: raw?.status || "Twilio accepted the message.",
                        raw,
                    };
                    sentMessages.set(delivered.messageId, delivered);
                    return delivered;
                }
                catch (error) {
                    const failed = {
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
            const status = record.status === "failed"
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
//# sourceMappingURL=index.js.map