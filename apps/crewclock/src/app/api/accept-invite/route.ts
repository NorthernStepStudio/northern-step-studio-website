import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')?.trim()

  if (!token) {
    return NextResponse.json({ valid: false, error: 'Token is required.' })
  }

  let admin
  try {
    admin = createServiceClient()
  } catch {
    return NextResponse.json({ valid: false, error: 'Server configuration error.' })
  }

  const { data: invite } = await admin
    .from('worker_invites')
    .select('id, email, full_name, role, status, expires_at, company_id')
    .eq('token', token)
    .maybeSingle()

  if (!invite) {
    return NextResponse.json({ valid: false, error: 'Invite not found.' })
  }

  if (invite.status !== 'pending') {
    return NextResponse.json({ valid: false, error: 'This invite has already been used or revoked.' })
  }

  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: 'This invite has expired.' })
  }

  const { data: company } = await admin
    .from('companies')
    .select('name')
    .eq('id', invite.company_id)
    .single()

  return NextResponse.json({
    valid: true,
    company_name: company?.name || 'Unknown Company',
    role: invite.role,
    full_name: invite.full_name,
    email: invite.email
  })
}

export async function POST(request: Request) {
  let body: Record<string, unknown>

  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return jsonError('Invalid JSON body.', 400)
  }

  const token = String(body.token || '').trim()
  const password = String(body.password || '')

  if (!token || !password) {
    return jsonError('Token and password are required.', 400)
  }

  if (password.length < 6) {
    return jsonError('Password must be at least 6 characters.', 400)
  }

  let admin
  try {
    admin = createServiceClient()
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Missing Supabase admin key.', 500)
  }

  const { data: invite } = await admin
    .from('worker_invites')
    .select('id, email, full_name, role, status, expires_at, company_id')
    .eq('token', token)
    .maybeSingle()

  if (!invite) {
    return jsonError('Invite not found.', 404)
  }

  if (invite.status !== 'pending') {
    return jsonError('This invite has already been used or revoked.', 400)
  }

  if (new Date(invite.expires_at) < new Date()) {
    return jsonError('This invite has expired.', 400)
  }

  // Create auth user
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: invite.email,
    password,
    email_confirm: true,
    user_metadata: { full_name: invite.full_name }
  })

  if (createError || !created.user) {
    return jsonError(createError?.message || 'Failed to create user account.', 400)
  }

  // Create profile
  const { error: profileError } = await admin.from('profiles').insert({
    id: created.user.id,
    company_id: invite.company_id,
    full_name: invite.full_name,
    email: invite.email,
    role: invite.role,
    status: 'active'
  })

  if (profileError) {
    // Rollback: delete the auth user
    await admin.auth.admin.deleteUser(created.user.id)
    return jsonError(profileError.message || 'Failed to create profile.', 500)
  }

  // Mark invite as accepted
  await admin
    .from('worker_invites')
    .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('id', invite.id)

  return NextResponse.json({
    success: true,
    email: invite.email,
    role: invite.role
  })
}
