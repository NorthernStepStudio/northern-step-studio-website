function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const emailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 40px 20px; background-color: #f4f4f5; font-family: Arial, Helvetica, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px;">
    ${content}
  </div>
</body>
</html>
`;

export const emailHeader = (title: string) => `
<div style="padding: 32px 40px 24px 40px; border-bottom: 1px solid #e4e4e7;">
  <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #18181b;">${escapeHtml(title)}</h1>
</div>
`;

export const emailBody = (content: string) => `
<div style="padding: 32px 40px;">
  ${content}
</div>
`;

export const emailButton = (text: string, url: string) => `
<a href="${escapeHtml(url)}" style="display: inline-block; margin: 24px 0; padding: 12px 24px; background-color: #18181b; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500; border-radius: 6px;">${escapeHtml(text)}</a>
`;

export const emailFooter = (text: string) => `
<div style="padding: 24px 40px; border-top: 1px solid #e4e4e7;">
  <p style="margin: 0; font-size: 12px; color: #71717a; text-align: center;">${escapeHtml(text)}</p>
</div>
`;

export function studioInvitationEmail(params: {
  inviteeEmail: string;
  inviterName: string;
  roleLabel: string;
  loginUrl: string;
  isAdminInvite: boolean;
}) {
  const { inviteeEmail, inviterName, roleLabel, loginUrl, isAdminInvite } = params;

  return emailTemplate(`
    ${emailHeader("Your Studio Access Is Ready")}
    ${emailBody(`
      <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
        Hi ${escapeHtml(inviteeEmail)},
      </p>
      <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
        ${escapeHtml(inviterName)} added you to Northern Step Studio with the role <strong>${escapeHtml(roleLabel)}</strong>.
      </p>
      <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
        Use the ${isAdminInvite ? "admin" : "standard"} sign-in page below to access your account. If your account is linked to Google, continue with Google. If the team also enabled password access for you, you can sign in with email and password there too.
      </p>
      ${emailButton(isAdminInvite ? "Open Admin Login" : "Open Sign In", loginUrl)}
      <p style="margin: 0; font-size: 14px; color: #71717a;">
        If you were not expecting this invite, you can ignore this email.
      </p>
    `)}
    ${emailFooter("Copyright 2026 Northern Step Studio. All rights reserved.")}
  `);
}

export function threadReplyNotification(params: {
  recipientName: string;
  threadTitle: string;
  threadUrl: string;
  replyAuthor: string;
  replyPreview: string;
}) {
  const { recipientName, threadTitle, threadUrl, replyAuthor, replyPreview } = params;

  return emailTemplate(`
    ${emailHeader("New Reply to Your Thread")}
    ${emailBody(`
      <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
        Hi ${escapeHtml(recipientName)},
      </p>
      <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
        <strong>${escapeHtml(replyAuthor)}</strong> replied to your thread <strong>"${escapeHtml(threadTitle)}"</strong>:
      </p>
      <div style="margin: 24px 0; padding: 16px; background-color: #f4f4f5; border-left: 3px solid #18181b; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; line-height: 20px; color: #52525b; font-style: italic;">
          ${escapeHtml(replyPreview.length > 150 ? replyPreview.substring(0, 150) + "..." : replyPreview)}
        </p>
      </div>
      ${emailButton("View Reply", threadUrl)}
      <p style="margin: 0; font-size: 14px; color: #71717a;">
        You're receiving this because you created this thread. You can manage your notification preferences in your account settings.
      </p>
    `)}
    ${emailFooter("Copyright 2026 Northern Step Studio. All rights reserved.")}
  `);
}

export function mentionNotificationEmail(params: {
  recipientName: string;
  senderName: string;
  referenceLabel: string;
  referenceTitle?: string | null;
  notificationUrl: string;
  preview: string;
}) {
  const { recipientName, senderName, referenceLabel, referenceTitle, notificationUrl, preview } = params;
  const safePreview = preview.length > 180 ? `${preview.slice(0, 180)}...` : preview;

  return emailTemplate(`
    ${emailHeader("You Were Mentioned")}
    ${emailBody(`
      <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
        Hi ${escapeHtml(recipientName)},
      </p>
      <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
        <strong>${escapeHtml(senderName)}</strong> mentioned you in ${escapeHtml(referenceLabel)}${referenceTitle ? ` <strong>"${escapeHtml(referenceTitle)}"</strong>` : ""}.
      </p>
      <div style="margin: 24px 0; padding: 16px; background-color: #f4f4f5; border-left: 3px solid #18181b; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; line-height: 20px; color: #52525b; font-style: italic;">
          ${escapeHtml(safePreview || "Open the app to view the mention.")}
        </p>
      </div>
      ${emailButton("Open Mention", notificationUrl)}
      <p style="margin: 0; font-size: 14px; color: #71717a;">
        You can manage mention emails in your account preferences.
      </p>
    `)}
    ${emailFooter("Copyright 2026 Northern Step Studio. All rights reserved.")}
  `);
}

export function contactSubmissionNotificationEmail(params: {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  smsConsent?: boolean;
}) {
  const { name, email, phone, subject, message, smsConsent } = params;

  return emailTemplate(`
    ${emailHeader("New Contact Submission")}
    ${emailBody(`
      <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
        A new message was submitted through the Northern Step Studio contact page.
      </p>
      <div style="margin: 0 0 24px 0; padding: 16px; background-color: #f4f4f5; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #18181b;"><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #18181b;"><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #18181b;"><strong>Mobile Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #18181b;"><strong>SMS Consent:</strong> ${smsConsent ? "Yes - website checkbox" : "No"}</p>
        <p style="margin: 0; font-size: 14px; color: #18181b;"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      </div>
      <div style="padding: 16px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px;">
        <p style="margin: 0; font-size: 14px; line-height: 22px; color: #3f3f46; white-space: pre-wrap;">${escapeHtml(message)}</p>
      </div>
    `)}
    ${emailFooter("Copyright 2026 Northern Step Studio. All rights reserved.")}
  `);
}

export function betaInterestNotificationEmail(params: {
  email: string;
  interest?: string | null;
}) {
  const { email, interest } = params;

  return emailTemplate(`
    ${emailHeader("New Early Access Interest")}
    ${emailBody(`
      <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
        A visitor joined the Northern Step Studio early access list.
      </p>
      <div style="margin: 0 0 24px 0; padding: 16px; background-color: #f4f4f5; border-radius: 8px;">
        <p style="margin: 0; font-size: 14px; color: #18181b;"><strong>Email:</strong> ${escapeHtml(email)}</p>
      </div>
      ${
        interest
          ? `
      <div style="padding: 16px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #18181b;"><strong>Interested In:</strong></p>
        <p style="margin: 0; font-size: 14px; line-height: 22px; color: #3f3f46; white-space: pre-wrap;">${escapeHtml(interest)}</p>
      </div>
      `
          : `
      <p style="margin: 0; font-size: 14px; color: #71717a;">
        No additional note was included with this signup.
      </p>
      `
      }
    `)}
    ${emailFooter("Copyright 2026 Northern Step Studio. All rights reserved.")}
  `);
}

export function testerRequestNotificationEmail(params: {
  name: string;
  email: string;
  appSlug: string;
  reason?: string | null;
}) {
  const { name, email, appSlug, reason } = params;

  return emailTemplate(`
    ${emailHeader("New Tester Request")}
    ${emailBody(`
      <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
        A new tester has requested access to <strong>${escapeHtml(appSlug)}</strong>.
      </p>
      <div style="margin: 0 0 24px 0; padding: 16px; background-color: #f4f4f5; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #18181b;"><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #18181b;"><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p style="margin: 0; font-size: 14px; color: #18181b;"><strong>App:</strong> ${escapeHtml(appSlug)}</p>
      </div>
      <div style="padding: 16px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #18181b;"><strong>Reason for Interest:</strong></p>
        <p style="margin: 0; font-size: 14px; line-height: 22px; color: #3f3f46; white-space: pre-wrap;">${escapeHtml(reason || "No reason provided.")}</p>
      </div>
      ${emailButton("Review Request", "https://northernstepstudio.com/admin/testers")}
    `)}
    ${emailFooter("Copyright 2026 Northern Step Studio. All rights reserved.")}
  `);
}

export function testerApprovalEmail(params: {
  name: string;
  appSlug: string;
  adminNotes?: string | null;
}) {
  const { name, appSlug, adminNotes } = params;

  return emailTemplate(`
    ${emailHeader("You're Approved for Testing!")}
    ${emailBody(`
      <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
        Hi ${escapeHtml(name)},
      </p>
      <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
        Great news! You have been approved as a tester for <strong>${escapeHtml(appSlug)}</strong>.
      </p>
      ${
        adminNotes
          ? `
      <div style="margin: 24px 0; padding: 16px; background-color: #f4f4f5; border-left: 3px solid #18181b; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #18181b;"><strong>Note from the developer:</strong></p>
        <p style="margin: 0; font-size: 14px; line-height: 20px; color: #52525b;">
          ${escapeHtml(adminNotes)}
        </p>
      </div>
      `
          : ""
      }
      <p style="margin: 24px 0 16px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
        You can now access the app preview. If this is a Vercel preview, you may need to "Request Access" on the deployment screen using the same email address you signed up with.
      </p>
      ${emailButton("Open App Preview", `https://${appSlug}.vercel.app`)}
      <p style="margin: 24px 0 0 0; font-size: 14px; color: #71717a;">
        Happy testing! Feel free to reach out if you find any bugs.
      </p>
    `)}
    ${emailFooter("Copyright 2026 Northern Step Studio. All rights reserved.")}
  `);
}
