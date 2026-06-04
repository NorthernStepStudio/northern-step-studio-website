import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/types'

const assignableRoles: UserRole[] = ['manager', 'supervisor', 'worker']

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status })
}

export async function POST(request: Request) {
  let body: Record<string, unknown>

  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return jsonError('Invalid JSON body.', 400)
  }

  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  const fullName = String(body.full_name || '').trim()
  const role = String(body.role || 'worker') as UserRole
  const companyId = String(body.company_id || '')

  if (!email || !password || !fullName || !companyId) {
    return jsonError('Email, password, full name, and company are required.', 400)
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
    return jsonError('Only owners and managers can add team members.', 403)
  }

  if (actorProfile.company_id !== companyId) {
    return jsonError('Cannot add members outside your company.', 403)
  }

  let admin
  try {
    admin = createServiceClient()
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Missing Supabase admin key.', 500)
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  })

  if (createError || !created.user) {
    return jsonError(createError?.message || 'Failed to create user.', 400)
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: created.user.id,
    company_id: companyId,
    full_name: fullName,
    email,
    role,
    status: 'active'
  })

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id)
    return jsonError(profileError.message || 'Failed to create profile.', 500)
  }

  return NextResponse.json({ id: created.user.id })
}
