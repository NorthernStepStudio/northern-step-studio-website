import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/types'

const assignableRoles: UserRole[] = ['manager', 'supervisor', 'worker']

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status })
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function renderInviteEmail(companyName: string, fullName: string, role: string, acceptUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="margin:0;padding:0;background:#0a0e1a;font-family:Inter,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e1a;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#111827;border-radius:16px;overflow:hidden;">
              <tr>
                <td style="background:#f97316;padding:24px 32px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">SignaTempu</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;">
                  <h2 style="margin:0 0 8px;color:#f1f5f9;font-size:20px;font-weight:600;">You're invited!</h2>
                  <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
                    <strong style="color:#f1f5f9;">${escapeHtml(companyName)}</strong> has invited you to join their team on SignaTempu as a <strong style="color:#f97316;">${escapeHtml(role)}</strong>.
                  </p>
                  <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;width:100%;background:#1e293b;border-radius:12px;">
                    <tr>
                      <td style="padding:16px;">
                        <p style="margin:0 0 4px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Name</p>
                        <p style="margin:0;color:#f1f5f9;font-size:15px;">${escapeHtml(fullName)}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 16px 16px;">
                        <p style="margin:0 0 4px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Role</p>
                        <p style="margin:0;color:#f97316;font-size:15px;font-weight:600;">${escapeHtml(role.charAt(0).toUpperCase() + role.slice(1))}</p>
                      </td>
                    </tr>
                  </table>
                  <table cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center">
                        <a href="${acceptUrl}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:600;">
                          Accept Invite &amp; Create Account
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.5;text-align:center;">
                    This invite expires in 7 days. If you didn't expect this email, you can safely ignore it.
                  </p>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0;color:#475569;font-size:12px;text-align:center;">
              Powered by SignaTempu
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

export async function POST(request: Request) {
  let body: Record<string, unknown>

  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return jsonError('Invalid JSON body.', 400)
  }

  const email = String(body.email || '').trim().toLowerCase()
  const fullName = String(body.full_name || '').trim()
  const role = String(body.role || 'worker') as UserRole

  if (!email || !fullName) {
    return jsonError('Email and full name are required.', 400)
  }

  if (!assignableRoles.includes(role)) {
    return jsonError('That role cannot be assigned here.', 400)
  }

  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return jsonError('Unauthorized.', 401)
  }

  const { data: actorProfile } = await supabase
    .from('profiles')
    .select('company_id, role')
    .eq('id', user.id)
    .single()

  if (!actorProfile || !['owner', 'manager'].includes(actorProfile.role)) {
    return jsonError('Only owners and managers can invite team members.', 403)
  }

  let admin
  try {
    admin = createServiceClient()
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Missing Supabase admin key.', 500)
  }

  // Check for existing pending invite
  const { data: existingInvite } = await admin
    .from('worker_invites')
    .select('id')
    .eq('company_id', actorProfile.company_id)
    .eq('email', email)
    .eq('status', 'pending')
    .maybeSingle()

  if (existingInvite) {
    return jsonError('A pending invite already exists for this email.', 409)
  }

  // Get company name
  const { data: company } = await admin
    .from('companies')
    .select('name')
    .eq('id', actorProfile.company_id)
    .single()

  if (!company) {
    return jsonError('Company not found.', 500)
  }

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error: insertError } = await admin.from('worker_invites').insert({
    company_id: actorProfile.company_id,
    invited_by_user_id: user.id,
    email,
    full_name: fullName,
    role,
    token,
    status: 'pending',
    expires_at: expiresAt
  })

  if (insertError) {
    return jsonError(insertError.message || 'Failed to create invite.', 500)
  }

  // Send invite email
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return jsonError('RESEND_API_KEY is not configured.', 500)
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (() => {
      try {
        const referer = request.headers.get('referer')
        return referer ? new URL(referer).origin : 'https://localhost:3000'
      } catch {
        return 'https://localhost:3000'
      }
    })()

  const acceptUrl = `${appUrl}/accept-invite?token=${token}`
  const from = process.env.REPORTS_FROM_EMAIL || 'SignaTempu <noreply@example.com>'
  const resend = new Resend(apiKey)

  const { error: sendError } = await resend.emails.send({
    from,
    to: email,
    subject: `You're invited to join ${company.name} on SignaTempu`,
    html: renderInviteEmail(company.name, fullName, role, acceptUrl)
  })

  if (sendError) {
    // Invite was created but email failed — log but still return success
    console.error('Failed to send invite email:', sendError.message)
  }

  return NextResponse.json({ success: true })
}
