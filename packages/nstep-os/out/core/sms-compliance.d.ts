export declare const SMS_MAX_CHARACTERS = 160;
export declare const SMS_REPEAT_PREFIX_CHARACTERS = 50;
export declare const SMS_MAX_CONVERSATION_TURNS = 5;
export declare const SMS_OPT_OUT_FOOTER = "Reply STOP to opt out.";
export declare function normalizeSmsBody(body: string): string;
export declare function containsSmsOptOutKeyword(text: string): boolean;
export declare function buildSmsCompliantBody(body: string, maxCharacters?: number): string;
export declare function smsPrefix(body: string, length?: number): string;
export declare function hasRepeatedSmsPrefix(previousBody: string | undefined, body: string, length?: number): boolean;
