'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Company, Profile } from '@/lib/types'

export default function SettingsPage() {
  const [company, setCompany] = useState<Company | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
    target?: string
  } | null>(null)
  const [companyForm, setCompanyForm] = useState({ name: '', report_email: '', phone: '' })
  const [profileForm, setProfileForm] = useState({ full_name: '' })
  const supabase = createClient()

  const loadData = useCallback(async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(prof as Profile | null)
    setProfileForm({ full_name: prof?.full_name ?? '' })

    if (prof?.company_id) {
      const { data: comp } = await supabase
        .from('companies')
        .select('*')
        .eq('id', prof.company_id)
        .single()

      setCompany(comp as Company | null)
      setCompanyForm({
        name: comp?.name ?? '',
        report_email: comp?.report_email ?? '',
        phone: comp?.phone ?? ''
      })
    }

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleSaveCompany() {
    if (!company || !companyForm.name || !companyForm.report_email) {
      setMessage({
        type: 'error',
        text: 'Company name and report email are required.',
        target: 'company'
      })
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('companies')
      .update({
        name: companyForm.name,
        report_email: companyForm.report_email,
        phone: companyForm.phone || null
      })
      .eq('id', company.id)

    setMessage(
      error
        ? { type: 'error', text: 'Failed to save company settings.', target: 'company' }
        : { type: 'success', text: 'Company settings saved.', target: 'company' }
    )
    setSaving(false)
  }

  async function handleSaveProfile() {
    if (!profileForm.full_name.trim()) {
      setMessage({ type: 'error', text: 'Name is required.', target: 'profile' })
      return
    }

    setSavingProfile(true)
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage({ type: 'error', text: 'You must be signed in.', target: 'profile' })
      setSavingProfile(false)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: profileForm.full_name })
      .eq('id', user.id)

    setMessage(
      error
        ? { type: 'error', text: 'Failed to save profile.', target: 'profile' }
        : { type: 'success', text: 'Profile saved.', target: 'profile' }
    )
    setSavingProfile(false)
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
    <div className="space-y-6 animate-fade-in max-w-xl">
      <div>
        <h1 className="page-header">Settings</h1>
        <p className="page-sub">Manage your account and company</p>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold text-navy-50">Your Profile</h2>
        <div>
          <label className="label">Full Name</label>
          <input
            className="input"
            value={profileForm.full_name}
            onChange={(event) => setProfileForm({ full_name: event.target.value })}
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input opacity-60 cursor-not-allowed" value={profile?.email ?? ''} disabled />
          <p className="text-xs text-navy-500 mt-1">Email cannot be changed here</p>
        </div>
        <div>
          <label className="label">Role</label>
          <input className="input opacity-60 cursor-not-allowed capitalize" value={profile?.role ?? ''} disabled />
        </div>
        {message?.target === 'profile' && (
          <p className={`text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {message.text}
          </p>
        )}
        <button onClick={handleSaveProfile} disabled={savingProfile} className="btn-primary btn-sm">
          {savingProfile ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {company && (profile?.role === 'owner' || profile?.role === 'manager') && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-navy-50">Company Settings</h2>
          <div>
            <label className="label">Company Name *</label>
            <input
              className="input"
              placeholder="Acme Construction LLC"
              value={companyForm.name}
              onChange={(event) => setCompanyForm((current) => ({ ...current, name: event.target.value }))}
            />
          </div>
          <div>
            <label className="label">Weekly Report Email *</label>
            <input
              className="input"
              type="email"
              placeholder="owner@company.com"
              value={companyForm.report_email}
              onChange={(event) =>
                setCompanyForm((current) => ({ ...current, report_email: event.target.value }))
              }
            />
            <p className="text-xs text-navy-500 mt-1">
              Weekly reports are sent to this address when report delivery is configured.
            </p>
          </div>
          <div>
            <label className="label">Phone (optional)</label>
            <input
              className="input"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={companyForm.phone}
              onChange={(event) => setCompanyForm((current) => ({ ...current, phone: event.target.value }))}
            />
          </div>
          {message?.target === 'company' && (
            <p className={`text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {message.text}
            </p>
          )}
          <button onClick={handleSaveCompany} disabled={saving} className="btn-primary btn-sm">
            {saving ? 'Saving...' : 'Save Company Settings'}
          </button>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold text-navy-50 mb-3">Install on Mobile</h2>
        <p className="text-navy-400 text-sm mb-3">
          Add SignaTempu to your home screen for the best experience. It works like a native app.
        </p>
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm text-navy-400">
            <span className="shrink-0 font-semibold text-navy-300">iOS</span>
            <span>
              <strong className="text-navy-300">iPhone:</strong> Tap the Share button in
              Safari, then choose Add to Home Screen.
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm text-navy-400">
            <span className="shrink-0 font-semibold text-navy-300">Android</span>
            <span>
              <strong className="text-navy-300">Android:</strong> Open the Chrome menu, then
              choose Add to Home Screen.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
