import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

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

  const inviteId = String(body.invite_id || '').trim()

  if (!inviteId) {
    return jsonError('Invite ID is required.', 400)
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
    return jsonError('Only owners and managers can revoke invites.', 403)
  }

  let admin
  try {
    admin = createServiceClient()
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Missing Supabase admin key.', 500)
  }

  const { data: updated, error: updateError } = await admin
    .from('worker_invites')
    .update({ status: 'revoked' })
    .eq('id', inviteId)
    .eq('company_id', actorProfile.company_id)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle()

  if (updateError) {
    return jsonError(updateError.message || 'Failed to revoke invite.', 500)
  }

  if (!updated) {
    return jsonError('Invite not found or already processed.', 404)
  }

  return NextResponse.json({ success: true })
}
