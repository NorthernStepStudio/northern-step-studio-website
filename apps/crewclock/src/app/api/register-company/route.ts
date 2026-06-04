import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

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

  const companyName = String(body.company_name || '').trim()
  const fullName = String(body.full_name || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  const phone = body.phone ? String(body.phone).trim() : null
  const reportEmail = String(body.report_email || '').trim().toLowerCase()

  if (!companyName || !fullName || !email || !password || !reportEmail) {
    return jsonError('Company name, full name, email, password, and report email are required.', 400)
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return jsonError('Please enter a valid email address.', 400)
  }
  if (!emailRegex.test(reportEmail)) {
    return jsonError('Please enter a valid report email address.', 400)
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

  // Step 1: Create auth user
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  })

  if (createError || !created.user) {
    return jsonError(createError?.message || 'Failed to create user.', 400)
  }

  const newUserId = created.user.id

  // Step 2: Insert company
  const { data: newCompany, error: companyError } = await admin
    .from('companies')
    .insert({
      name: companyName,
      owner_user_id: newUserId,
      report_email: reportEmail,
      phone
    })
    .select('id')
    .single()

  if (companyError || !newCompany) {
    // Rollback: delete auth user
    await admin.auth.admin.deleteUser(newUserId)
    return jsonError(companyError?.message || 'Failed to create company.', 500)
  }

  // Step 3: Insert owner profile
  const { error: profileError } = await admin.from('profiles').insert({
    id: newUserId,
    company_id: newCompany.id,
    full_name: fullName,
    email,
    role: 'owner',
    status: 'active'
  })

  if (profileError) {
    // Rollback: delete company and auth user
    await admin.from('companies').delete().eq('id', newCompany.id)
    await admin.auth.admin.deleteUser(newUserId)
    return jsonError(profileError.message || 'Failed to create profile.', 500)
  }

  return NextResponse.json({ success: true, user_id: newUserId })
}
