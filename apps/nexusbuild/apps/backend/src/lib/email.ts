type EmailAddress = string | string[];

export interface ResendEmailPayload {
    to: EmailAddress;
    subject: string;
    html: string;
    text: string;
    from?: string;
    replyTo?: string;
}

const normalizeFromAddress = (value: string | undefined) => {
    if (value && value.trim()) {
        return value.trim();
    }

    return 'NexusBuild <noreply@nexusbuild.app>';
};

export async function sendResendEmail(payload: ResendEmailPayload) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.warn('[email] RESEND_API_KEY is not configured. Skipping email send.');
        return { skipped: true };
    }

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: normalizeFromAddress(payload.from || process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM),
            to: payload.to,
            subject: payload.subject,
            html: payload.html,
            text: payload.text,
            reply_to: payload.replyTo || process.env.RESEND_REPLY_TO || undefined,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Resend API error (${response.status}): ${errorText}`);
    }

    return response.json();
}
