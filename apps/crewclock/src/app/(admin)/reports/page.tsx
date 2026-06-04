'use client'

import { useCallback, useEffect, useState } from 'react'
import { endOfWeek, format, startOfWeek, subWeeks } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import type { WeeklyReport } from '@/lib/types'

export default function ReportsPage() {
  const [reports, setReports] = useState<WeeklyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const supabase = createClient()

  const loadReports = useCallback(async () => {
    const { data } = await supabase
      .from('weekly_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    setReports((data || []) as WeeklyReport[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  async function handleSendReport(weekOffset = 0) {
    setSending(true)
    setMessage(null)

    const weekStart = startOfWeek(subWeeks(new Date(), weekOffset), { weekStartsOn: 1 })
    const weekEnd = endOfWeek(subWeeks(new Date(), weekOffset), { weekStartsOn: 1 })

    const response = await fetch('/api/send-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        week_start: weekStart.toISOString(),
        week_end: weekEnd.toISOString()
      })
    })

    const result = await response.json()
    if (response.ok) {
      setMessage({ type: 'success', text: `Weekly report sent to ${result.email}` })
      loadReports()
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to send report.' })
    }

    setSending(false)
  }

  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const thisWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
  const lastWeekStart = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 })
  const lastWeekEnd = endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Reports</h1>
        <p className="page-sub">Weekly email reports for your team</p>
      </div>

      {message && (
        <div
          className={`rounded-xl p-3.5 text-sm ${
            message.type === 'success'
              ? 'bg-green-900/30 border border-green-800/50 text-green-400'
              : 'bg-red-900/30 border border-red-800/50 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card border-brand-800/50">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">This Week</p>
              <p className="text-slate-100 font-semibold">
                {format(thisWeekStart, 'MMM d')} - {format(thisWeekEnd, 'MMM d, yyyy')}
              </p>
            </div>
            <span className="badge-orange">Current</span>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Send the current week&apos;s time tracking report with worker hours and project details.
          </p>
          <button
            onClick={() => handleSendReport(0)}
            disabled={sending}
            className="btn-primary btn-sm w-full"
          >
            {sending ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Send Weekly Report
              </>
            )}
          </button>
        </div>

        <div className="card">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Last Week</p>
              <p className="text-slate-100 font-semibold">
                {format(lastWeekStart, 'MMM d')} - {format(lastWeekEnd, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Resend or send the previous week&apos;s report.
          </p>
          <button
            onClick={() => handleSendReport(1)}
            disabled={sending}
            className="btn-secondary btn-sm w-full"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Send Last Week&apos;s Report
          </button>
        </div>
      </div>

      <div className="card border-dashed border-slate-700">
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-slate-200 text-sm">Automatic Friday Reports</p>
            <p className="text-slate-400 text-sm mt-1">
              A weekly report can be scheduled for Friday at 6:00 PM and sent to the email
              address configured in company settings.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-slate-100 mb-3">Report History</h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        ) : reports.length === 0 ? (
          <div className="card text-center py-10">
            <svg className="w-8 h-8 text-slate-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-slate-400 text-sm">No reports sent yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {reports.map((report) => (
              <div key={report.id} className="card flex items-center justify-between">
                <div>
                  <p className="text-slate-100 text-sm font-medium">
                    {format(new Date(report.week_start), 'MMM d')} -{' '}
                    {format(new Date(report.week_end), 'MMM d, yyyy')}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Sent to {report.sent_to_email} - {format(new Date(report.sent_at), 'MMM d, h:mm a')}
                  </p>
                </div>
                <span className="badge-slate">Sent</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
