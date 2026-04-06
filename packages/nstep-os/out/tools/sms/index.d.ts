import type { DeliveryVerification, SmsMessage } from "../../core/types.js";
export interface SmsSendRequest extends SmsMessage {
    readonly statusCallbackUrl?: string;
}
export interface SmsAdapter {
    send(message: SmsSendRequest): Promise<DeliveryVerification & {
        readonly messageId: string;
        readonly provider: string;
        readonly raw?: unknown;
    }>;
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
export declare function createSmsAdapter(config: SmsAdapterConfig): SmsAdapter;
