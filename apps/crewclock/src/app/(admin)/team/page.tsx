'use client'

import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import type { Profile, UserRole, UserStatus, WorkerInvite } from '@/lib/types'

const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'Owner',
  manager: 'Manager',
  supervisor: 'Supervisor',
  worker: 'Worker'
}

const ROLE_BADGE: Record<UserRole, string> = {
  owner: 'badge-orange',
  manager: 'badge-yellow',
  supervisor: 'badge-green',
  worker: 'badge-slate'
}

function Modal({
  title,
  onClose,
  children
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-navy-900 border border-navy-700 rounded-2xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-navy-700">
          <h3 className="font-semibold text-navy-50">{title}</h3>
          <button onClick={onClose} className="text-navy-400 hover:text-navy-200 p-1 touch-manipulation">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export default function TeamPage() {
  const [members, setMembers] = useState<Profile[]>([])
  const [invites, setInvites] = useState<WorkerInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [editing, setEditing] = useState<Profile | null>(null)
  const [saving, setSaving] = useState(false)
  const [myRole, setMyRole] = useState<UserRole>('worker')
  const [form, setForm] = useState({ role: 'worker' as UserRole, status: 'active' as UserStatus })
  const [inviteForm, setInviteForm] = useState({
    email: '',
    full_name: '',
    role: 'worker' as UserRole
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const supabase = createClient()

  const loadTeam = useCallback(async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const [{ data: profile }, { data: team }, { data: invitesList }] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', user.id).single(),
      supabase.from('profiles').select('*').order('full_name'),
      supabase
        .from('worker_invites')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
    ])

    setMyRole(profile?.role ?? 'worker')
    setMembers((team || []) as Profile[])
    setInvites((invitesList || []) as WorkerInvite[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadTeam()
  }, [loadTeam])

  function openEdit(member: Profile) {
    setEditing(member)
    setForm({ role: member.role, status: member.status })
    setMessage(null)
    setShowModal(true)
  }

  async function handleUpdate() {
    if (!editing) return

    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ role: form.role, status: form.status })
      .eq('id', editing.id)

    if (error) {
      setMessage({ type: 'error', text: 'Failed to update member.' })
    } else {
      setMessage({ type: 'success', text: 'Member updated.' })
      setShowModal(false)
      loadTeam()
    }

    setSaving(false)
  }

  async function handleInvite() {
    if (!inviteForm.email || !inviteForm.full_name) {
      setMessage({ type: 'error', text: 'All fields are required.' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/invite-worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteForm.email.trim().toLowerCase(),
          full_name: inviteForm.full_name.trim(),
          role: inviteForm.role
        })
      })

      const result = await response.json()
      if (!response.ok) {
        setMessage({ type: 'error', text: result.error || 'Failed to send invite.' })
      } else {
        setMessage({ type: 'success', text: 'Invite sent successfully.' })
        setShowInviteModal(false)
        setInviteForm({ email: '', full_name: '', role: 'worker' })
        loadTeam()
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to send invite. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleRevoke(inviteId: string) {
    if (!confirm('Are you sure you want to revoke this invite?')) return

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/revoke-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_id: inviteId })
      })

      const result = await response.json()
      if (!response.ok) {
        setMessage({ type: 'error', text: result.error || 'Failed to revoke invite.' })
      } else {
        setMessage({ type: 'success', text: 'Invite revoked successfully.' })
        loadTeam()
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to revoke invite. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-header">Team</h1>
          <p className="page-sub">{members.length} members</p>
        </div>
        {(myRole === 'owner' || myRole === 'manager') && (
          <button
            onClick={() => {
              setMessage(null)
              setShowInviteModal(true)
            }}
            className="btn-primary btn-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Invite Member
          </button>
        )}
      </div>

      {message && !showModal && !showInviteModal && (
        <div
          className={`rounded-xl p-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-900/30 border border-green-800/50 text-green-400'
              : 'bg-red-900/30 border border-red-800/50 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Active Team Members */}
      <div className="space-y-2">
        {members.map((member) => (
          <div key={member.id} className="card flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 bg-navy-800 rounded-full flex items-center justify-center shrink-0 text-navy-300 font-semibold text-sm">
                {member.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-navy-50 text-sm">{member.full_name}</p>
                  <span className={ROLE_BADGE[member.role]}>{ROLE_LABELS[member.role]}</span>
                  {member.status === 'inactive' && <span className="badge-red">Inactive</span>}
                </div>
                <p className="text-navy-400 text-xs mt-0.5 truncate">{member.email}</p>
                <p className="text-navy-600 text-xs">
                  Joined {format(new Date(member.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            {(myRole === 'owner' || myRole === 'manager') && (
              <button
                onClick={() => openEdit(member)}
                className="text-navy-500 hover:text-navy-300 touch-manipulation p-1 shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Pending Invites */}
      {(myRole === 'owner' || myRole === 'manager') && invites.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-navy-800">
          <h2 className="text-lg font-semibold text-navy-50">Pending Invites</h2>
          <div className="space-y-2">
            {invites.map((invite) => (
              <div key={invite.id} className="card flex items-center justify-between gap-3 border-dashed border-navy-700 bg-navy-900/40">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-navy-800 rounded-full flex items-center justify-center shrink-0 text-navy-400 font-semibold text-sm">
                    {invite.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-navy-50 text-sm">{invite.full_name}</p>
                      <span className={ROLE_BADGE[invite.role]}>{ROLE_LABELS[invite.role]}</span>
                      <span className="badge bg-yellow-900/30 text-yellow-400 border border-yellow-800/30">Invited</span>
                    </div>
                    <p className="text-navy-400 text-xs mt-0.5 truncate">{invite.email}</p>
                    <p className="text-navy-600 text-xs">
                      Expires {format(new Date(invite.expires_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRevoke(invite.id)}
                  disabled={saving}
                  className="text-red-500 hover:text-red-400 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors shrink-0 touch-manipulation disabled:opacity-50"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && editing && (
        <Modal title={`Edit ${editing.full_name}`} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="label">Role</label>
              <select
                className="input"
                value={form.role}
                onChange={(event) =>
                  setForm((current) => ({ ...current, role: event.target.value as UserRole }))
                }
              >
                <option value="worker">Worker</option>
                <option value="supervisor">Supervisor</option>
                <option value="manager">Manager</option>
                {myRole === 'owner' && <option value="owner">Owner</option>}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({ ...current, status: event.target.value as UserStatus }))
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            {message && (
              <p className={`text-sm ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                {message.text}
              </p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={handleUpdate} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showInviteModal && (
        <Modal title="Invite Team Member" onClose={() => setShowInviteModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="label">Full Name *</label>
              <input
                className="input"
                placeholder="John Smith"
                value={inviteForm.full_name}
                onChange={(event) =>
                  setInviteForm((current) => ({ ...current, full_name: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="label">Email *</label>
              <input
                className="input"
                type="email"
                placeholder="john@example.com"
                value={inviteForm.email}
                onChange={(event) =>
                  setInviteForm((current) => ({ ...current, email: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="label">Role</label>
              <select
                className="input"
                value={inviteForm.role}
                onChange={(event) =>
                  setInviteForm((current) => ({ ...current, role: event.target.value as UserRole }))
                }
              >
                <option value="worker">Worker</option>
                <option value="supervisor">Supervisor</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            {message && (
              <p className={`text-sm ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                {message.text}
              </p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowInviteModal(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={handleInvite} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
