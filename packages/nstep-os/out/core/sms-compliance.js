export const SMS_MAX_CHARACTERS = 160;
export const SMS_REPEAT_PREFIX_CHARACTERS = 50;
export const SMS_MAX_CONVERSATION_TURNS = 5;
export const SMS_OPT_OUT_FOOTER = "Reply STOP to opt out.";
const SMS_OPT_OUT_PATTERN = /(^|\b)(stop|quit|cancel|unsubscribe|opt[- ]?out|do not contact|dnc|end)(\b|$)/i;
export function normalizeSmsBody(body) {
    return String(body || "")
        .replace(/\s+/g, " ")
        .trim();
}
export function containsSmsOptOutKeyword(text) {
    return SMS_OPT_OUT_PATTERN.test(normalizeSmsBody(text));
}
export function buildSmsCompliantBody(body, maxCharacters = SMS_MAX_CHARACTERS) {
    const normalized = normalizeSmsBody(body).replace(/\s*Reply STOP to opt out\.$/i, "").trim();
    if (maxCharacters <= SMS_OPT_OUT_FOOTER.length) {
        return SMS_OPT_OUT_FOOTER.slice(0, maxCharacters).trim();
    }
    const separator = normalized ? " " : "";
    const budget = maxCharacters - SMS_OPT_OUT_FOOTER.length - separator.length;
    const clipped = normalized.slice(0, Math.max(0, budget)).trimEnd();
    return clipped ? `${clipped}${separator}${SMS_OPT_OUT_FOOTER}`.slice(0, maxCharacters).trim() : SMS_OPT_OUT_FOOTER;
}
export function smsPrefix(body, length = SMS_REPEAT_PREFIX_CHARACTERS) {
    return normalizeSmsBody(body).slice(0, length).toLowerCase();
}
export function hasRepeatedSmsPrefix(previousBody, body, length = SMS_REPEAT_PREFIX_CHARACTERS) {
    if (!previousBody) {
        return false;
    }
    return smsPrefix(previousBody, length) === smsPrefix(body, length);
}
//# sourceMappingURL=sms-compliance.js.map