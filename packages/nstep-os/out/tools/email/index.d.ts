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
export declare function createEmailAdapter(config: EmailAdapterConfig): EmailAdapter;
