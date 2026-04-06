export interface TesterEmailContext {
    email: string;
    name: string;
    appSlug: string | null;
    appLabel: string;
    reason: string;
    siteUrl: string;
    adminNotes?: string;
}

export interface TesterRecordLike {
    email: string;
    name: string;
    appSlug: string | null;
    appLabel: string;
    reason: string;
    status: string;
    adminNotes?: string;
}

const escapeHtml = (value: string) =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const buildEmailShell = (content: string) => `
    <div style="margin:0;padding:0;background:#08111f;color:#f8fafc;font-family:Inter,Arial,sans-serif">
        <div style="max-width:640px;margin:0 auto;padding:32px 20px">
            <div style="margin-bottom:24px;padding:20px 24px;border-radius:24px;background:linear-gradient(135deg,#0a0e27,#15254d 55%,#20376b);border:1px solid rgba(255,255,255,0.12)">
                <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#7dd3fc;font-weight:700">NexusBuild</div>
                <div style="margin-top:6px;font-size:28px;font-weight:800;line-height:1.1">Tester pipeline update</div>
            </div>
            ${content}
            <div style="margin-top:28px;font-size:12px;line-height:1.6;color:rgba(226,232,240,0.72)">
                If you were not expecting this email, you can ignore it.
            </div>
        </div>
    </div>
`;

const buildButton = (href: string, label: string) => `
    <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:linear-gradient(135deg,#4a9eff,#00d4ff);color:#06111f;font-weight:800;text-decoration:none">
        ${escapeHtml(label)}
    </a>
`;

export const testerRequestNotificationEmail = (context: TesterEmailContext) => {
    const dashboardUrl = new URL('admin/testers', context.siteUrl).toString();
    const reason = context.reason.trim() || 'No reason provided.';

    const html = buildEmailShell(`
        <div style="padding:28px;border-radius:24px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1)">
            <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;background:rgba(34,197,94,0.14);color:#4ade80;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em">New request</div>
            <h2 style="margin:18px 0 8px;font-size:24px;line-height:1.2">A tester request just landed.</h2>
            <p style="margin:0 0 20px;color:rgba(226,232,240,0.82);line-height:1.6">Review the request in the admin queue and approve or deny it from the tester manager.</p>

            <table style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.6">
                <tr><td style="padding:8px 0;color:rgba(226,232,240,0.65);width:120px">Name</td><td style="padding:8px 0">${escapeHtml(context.name)}</td></tr>
                <tr><td style="padding:8px 0;color:rgba(226,232,240,0.65)">Email</td><td style="padding:8px 0">${escapeHtml(context.email)}</td></tr>
                <tr><td style="padding:8px 0;color:rgba(226,232,240,0.65)">App</td><td style="padding:8px 0">${escapeHtml(context.appLabel)}</td></tr>
                <tr><td style="padding:8px 0;color:rgba(226,232,240,0.65)">Reason</td><td style="padding:8px 0">${escapeHtml(reason)}</td></tr>
            </table>

            <div style="margin-top:24px">${buildButton(dashboardUrl, 'Open tester queue')}</div>
        </div>
    `);

    const text = [
        'New tester request received.',
        `Name: ${context.name}`,
        `Email: ${context.email}`,
        `App: ${context.appLabel}`,
        `Reason: ${reason}`,
        `Admin queue: ${dashboardUrl}`,
    ].join('\n');

    return {
        subject: `Tester request: ${context.name} for ${context.appLabel}`,
        html,
        text,
    };
};

export const testerApprovalEmail = (record: TesterRecordLike & { siteUrl: string }) => {
    const appLabel = record.appLabel;
    const demoUrl = new URL(`demo/${record.appSlug || 'nexusbuild'}`, record.siteUrl).toString();
    const accessUrl = new URL(
        `testers?app=${encodeURIComponent(record.appSlug || 'nexusbuild')}`,
        record.siteUrl
    ).toString();
    const note = record.adminNotes?.trim();

    const html = buildEmailShell(`
        <div style="padding:28px;border-radius:24px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1)">
            <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;background:rgba(34,197,94,0.14);color:#4ade80;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em">Approved</div>
            <h2 style="margin:18px 0 8px;font-size:24px;line-height:1.2">Your tester access is approved.</h2>
            <p style="margin:0 0 20px;color:rgba(226,232,240,0.82);line-height:1.6">
                You can open the safe public demo now. If the build still requires a private preview invite, we will handle the remaining access step manually.
            </p>

            <div style="display:grid;gap:12px;margin:22px 0">
                <div style="padding:14px 16px;border-radius:16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08)"><strong style="display:block;margin-bottom:4px">App</strong>${escapeHtml(appLabel)}</div>
                <div style="padding:14px 16px;border-radius:16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08)"><strong style="display:block;margin-bottom:4px">Request</strong>${escapeHtml(record.email)}</div>
                <div style="padding:14px 16px;border-radius:16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08)"><strong style="display:block;margin-bottom:4px">Next step</strong>Open the demo and wait for the private access confirmation if applicable.</div>
            </div>

            ${
                note
                    ? `<div style="margin:0 0 20px;padding:14px 16px;border-radius:16px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);color:#fde68a"><strong style="display:block;margin-bottom:4px">Admin note</strong>${escapeHtml(note)}</div>`
                    : ''
            }

            <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:24px">
                ${buildButton(demoUrl, 'Open safe demo')}
                ${buildButton(accessUrl, 'Request another app')}
            </div>
        </div>
    `);

    const text = [
        'Your tester access is approved.',
        `App: ${appLabel}`,
        `Open safe demo: ${demoUrl}`,
        `Request access page: ${accessUrl}`,
        note ? `Admin note: ${note}` : null,
    ]
        .filter(Boolean)
        .join('\n');

    return {
        subject: `Approved: ${appLabel} tester access`,
        html,
        text,
    };
};
