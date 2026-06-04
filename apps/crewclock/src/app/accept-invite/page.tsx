'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type InviteInfo = {
  company_name: string
  role: string
  full_name: string
  email: string
}

function AcceptInviteForm() {
  const [status, setStatus] = useState<'loading' | 'invalid' | 'valid' | 'submitting' | 'success'>('loading')
  const [invite, setInvite] = useState<InviteInfo | null>(null)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitError, setSubmitError] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const token = searchParams.get('token') || ''

  useEffect(() => {
    if (!token) {
      setError('No invite token provided.')
      setStatus('invalid')
      return
    }

    async function validate() {
      try {
        const res = await fetch(`/api/accept-invite?token=${encodeURIComponent(token)}`)
        const data = await res.json()

        if (data.valid) {
          setInvite({
            company_name: data.company_name,
            role: data.role,
            full_name: data.full_name,
            email: data.email
          })
          setStatus('valid')
        } else {
          setError(data.error || 'Invalid invite.')
          setStatus('invalid')
        }
      } catch {
        setError('Failed to validate invite. Please try again.')
        setStatus('invalid')
      }
    }

    validate()
  }, [token])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitError('')

    if (password.length < 6) {
      setSubmitError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match.')
      return
    }

    setStatus('submitting')

    try {
      const res = await fetch('/api/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setSubmitError(data.error || 'Failed to create account.')
        setStatus('valid')
        return
      }

      setStatus('success')

      // Sign in with the new credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password
      })

      if (signInError) {
        // Account was created but auto sign-in failed — redirect to login
        router.replace('/login')
        return
      }

      router.replace(data.role === 'worker' ? '/clock' : '/dashboard')
      router.refresh()
    } catch {
      setSubmitError('Something went wrong. Please try again.')
      setStatus('valid')
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-6 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-800/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10 animate-slide-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-2xl shadow-lg shadow-brand-900/50 mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-navy-50">SignaTempu</h1>
          <p className="text-navy-400 mt-1 text-sm">Field worker time tracking</p>
        </div>

        {/* Loading state */}
        {status === 'loading' && (
          <div className="card text-center py-12">
            <svg className="animate-spin w-8 h-8 mx-auto mb-4 text-brand-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-navy-400 text-sm">Validating your invite...</p>
          </div>
        )}

        {/* Invalid state */}
        {status === 'invalid' && (
          <div className="card text-center py-10">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-900/30 rounded-xl mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-navy-50 mb-2">Invite Invalid</h2>
            <p className="text-navy-400 text-sm mb-6">{error}</p>
            <a href="/login" className="btn-primary inline-block">
              Go to Sign In
            </a>
          </div>
        )}

        {/* Success state */}
        {status === 'success' && (
          <div className="card text-center py-10">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-900/30 rounded-xl mb-4">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-navy-50 mb-2">Account Created!</h2>
            <p className="text-navy-400 text-sm">Signing you in and redirecting...</p>
          </div>
        )}

        {/* Valid invite — show form */}
        {(status === 'valid' || status === 'submitting') && invite && (
          <div className="card">
            <h2 className="text-lg font-semibold text-navy-50 mb-1">
              You&apos;re invited!
            </h2>
            <p className="text-navy-400 text-sm mb-6">
              Join <span className="text-navy-50 font-medium">{invite.company_name}</span> as a{' '}
              <span className="text-brand-500 font-medium">{invite.role}</span>
            </p>

            <div className="bg-navy-800/50 rounded-xl p-4 mb-6 space-y-3">
              <div>
                <p className="text-navy-400 text-xs uppercase tracking-wide mb-0.5">Name</p>
                <p className="text-navy-50 text-sm font-medium">{invite.full_name}</p>
              </div>
              <div>
                <p className="text-navy-400 text-xs uppercase tracking-wide mb-0.5">Email</p>
                <p className="text-navy-50 text-sm font-medium">{invite.email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="label">
                  Create password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="input"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="label">
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="input"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>

              {submitError && (
                <div className="bg-red-900/30 border border-red-800/50 rounded-xl p-3 flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-red-400 mt-0.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p className="text-red-400 text-sm">{submitError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="btn-primary w-full mt-2 touch-manipulation"
              >
                {status === 'submitting' ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating account...
                  </>
                ) : (
                  'Accept Invite & Create Account'
                )}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-xs text-navy-700 mt-8">
          Already have an account?{' '}
          <a href="/login" className="text-brand-500 hover:text-brand-400">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-6 py-12">
          <div className="text-center animate-pulse-slow">
            <svg className="animate-spin w-8 h-8 text-brand-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-navy-400 text-sm">Loading invitation...</p>
          </div>
        </div>
      }
    >
      <AcceptInviteForm />
    </Suspense>
  )
}
