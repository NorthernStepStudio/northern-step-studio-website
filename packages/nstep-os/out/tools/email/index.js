import { randomUUID } from "node:crypto";
export function createEmailAdapter(config) {
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
                    const raw = (await response.json().catch(() => undefined));
                    if (!response.ok) {
                        return {
                            messageId: `email_${randomUUID()}`,
                            status: "failed",
                            detail: raw?.error || `Email webhook returned ${response.status}.`,
                            raw,
                        };
                    }
                    return {
                        messageId: String(raw?.messageId || `email_${randomUUID()}`),
                        status: "sent",
                        detail: raw?.detail || "Email webhook accepted the message.",
                        raw,
                    };
                }
                catch (error) {
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
//# sourceMappingURL=index.js.map