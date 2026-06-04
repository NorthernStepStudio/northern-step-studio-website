import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { Company, TimeEntry } from '@/lib/types'

type EntryWithJoins = TimeEntry & {
  profiles?: { full_name?: string | null; email?: string | null } | null
  projects?: { name?: string | null; address?: string | null } | null
}

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

function formatHours(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value))
}

function summarizeByWorker(entries: EntryWithJoins[]) {
  const summary = new Map<string, { name: string; minutes: number }>()

  for (const entry of entries) {
    const key = entry.user_id
    const current = summary.get(key) || {
      name: entry.profiles?.full_name || 'Unknown worker',
      minutes: 0
    }
    current.minutes += entry.total_minutes || 0
    summary.set(key, current)
  }

  return Array.from(summary.values()).sort((a, b) => b.minutes - a.minutes)
}

function summarizeByProject(entries: EntryWithJoins[]) {
  const summary = new Map<string, { name: string; minutes: number }>()

  for (const entry of entries) {
    const key = entry.project_id
    const current = summary.get(key) || {
      name: entry.projects?.name || 'Unknown project',
      minutes: 0
    }
    current.minutes += entry.total_minutes || 0
    summary.set(key, current)
  }

  return Array.from(summary.values()).sort((a, b) => b.minutes - a.minutes)
}

function renderTableRows(entries: EntryWithJoins[]) {
  if (entries.length === 0) {
    return '<tr><td colspan="6" style="padding:12px;color:#64748b;">No completed time entries for this week.</td></tr>'
  }

  return entries
    .map((entry) => {
      const worker = escapeHtml(entry.profiles?.full_name || 'Unknown')
      const project = escapeHtml(entry.projects?.name || 'Unknown')
      const status = escapeHtml(entry.status.replaceAll('_', ' '))
      return `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${worker}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${project}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${formatDateTime(entry.clock_in_time)}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${entry.clock_out_time ? formatDateTime(entry.clock_out_time) : '-'}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">${formatHours(entry.total_minutes || 0)}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${status}</td>
        </tr>
      `
    })
    .join('')
}

function renderReportHtml(company: Company, weekStart: Date, weekEnd: Date, entries: EntryWithJoins[]) {
  const workerSummary = summarizeByWorker(entries)
  const projectSummary = summarizeByProject(entries)
  const totalMinutes = entries.reduce((sum, entry) => sum + (entry.total_minutes || 0), 0)
  const missingClockOuts = entries.filter((entry) => entry.status === 'missing_clock_out')
  const locationWarnings = entries.filter((entry) => entry.status === 'location_missing')

  const workerItems = workerSummary
    .map(
      (worker) =>
        `<li>${escapeHtml(worker.name)}: <strong>${formatHours(worker.minutes)}</strong></li>`
    )
    .join('')

  const projectItems = projectSummary
    .map(
      (project) =>
        `<li>${escapeHtml(project.name)}: <strong>${formatHours(project.minutes)}</strong></li>`
    )
    .join('')

  return `
    <div style="font-family:Inter,Arial,sans-serif;color:#0f172a;line-height:1.5;">
      <h1 style="margin:0 0 4px;">CrewClock Weekly Report</h1>
      <p style="margin:0 0 20px;color:#475569;">${escapeHtml(company.name)} - ${formatDate(weekStart)} to ${formatDate(weekEnd)}</p>

      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px;">
        <div style="padding:14px 16px;background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;">
          <div style="font-size:12px;color:#9a3412;text-transform:uppercase;">Total Hours</div>
          <div style="font-size:24px;font-weight:700;color:#c2410c;">${formatHours(totalMinutes)}</div>
        </div>
        <div style="padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
          <div style="font-size:12px;color:#475569;text-transform:uppercase;">Entries</div>
          <div style="font-size:24px;font-weight:700;">${entries.length}</div>
        </div>
        <div style="padding:14px 16px;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;">
          <div style="font-size:12px;color:#991b1b;text-transform:uppercase;">Needs Review</div>
          <div style="font-size:24px;font-weight:700;color:#b91c1c;">${missingClockOuts.length + locationWarnings.length}</div>
        </div>
      </div>

      <h2>Worker Hours</h2>
      <ul>${workerItems || '<li>No worker hours.</li>'}</ul>

      <h2>Project Hours</h2>
      <ul>${projectItems || '<li>No project hours.</li>'}</ul>

      <h2>Entries</h2>
      <table style="border-collapse:collapse;width:100%;font-size:14px;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:10px;text-align:left;border-bottom:1px solid #cbd5e1;">Worker</th>
            <th style="padding:10px;text-align:left;border-bottom:1px solid #cbd5e1;">Project</th>
            <th style="padding:10px;text-align:left;border-bottom:1px solid #cbd5e1;">Clock In</th>
            <th style="padding:10px;text-align:left;border-bottom:1px solid #cbd5e1;">Clock Out</th>
            <th style="padding:10px;text-align:right;border-bottom:1px solid #cbd5e1;">Total</th>
            <th style="padding:10px;text-align:left;border-bottom:1px solid #cbd5e1;">Status</th>
          </tr>
        </thead>
        <tbody>${renderTableRows(entries)}</tbody>
      </table>
    </div>
  `
}

function renderReportText(company: Company, weekStart: Date, weekEnd: Date, entries: EntryWithJoins[]) {
  const totalMinutes = entries.reduce((sum, entry) => sum + (entry.total_minutes || 0), 0)
  const workerSummary = summarizeByWorker(entries)
  const projectSummary = summarizeByProject(entries)

  return [
    `CrewClock Weekly Report`,
    `${company.name} - ${formatDate(weekStart)} to ${formatDate(weekEnd)}`,
    ``,
    `Total hours: ${formatHours(totalMinutes)}`,
    `Entries: ${entries.length}`,
    ``,
    `Worker Hours`,
    ...workerSummary.map((worker) => `${worker.name}: ${formatHours(worker.minutes)}`),
    ``,
    `Project Hours`,
    ...projectSummary.map((project) => `${project.name}: ${formatHours(project.minutes)}`)
  ].join('\n')
}

export async function POST(request: Request) {
  let body: Record<string, unknown>

  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return jsonError('Invalid JSON body.', 400)
  }

  const weekStart = new Date(String(body.week_start || ''))
  const weekEnd = new Date(String(body.week_end || ''))

  if (Number.isNaN(weekStart.getTime()) || Number.isNaN(weekEnd.getTime())) {
    return jsonError('Valid week_start and week_end dates are required.', 400)
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

  if (!actorProfile || actorProfile.role === 'worker') {
    return jsonError('Only admins can send reports.', 403)
  }

  let admin
  try {
    admin = createServiceClient()
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Missing Supabase admin key.', 500)
  }

  const { data: company, error: companyError } = await admin
    .from('companies')
    .select('*')
    .eq('id', actorProfile.company_id)
    .single()

  if (companyError || !company) {
    return jsonError('Company settings could not be loaded.', 500)
  }

  if (!company.report_email) {
    return jsonError('Company report email is not configured.', 400)
  }

  const { data: entries, error: entriesError } = await admin
    .from('time_entries')
    .select('*, profiles(full_name, email), projects(name, address)')
    .eq('company_id', actorProfile.company_id)
    .gte('clock_in_time', weekStart.toISOString())
    .lte('clock_in_time', weekEnd.toISOString())
    .not('total_minutes', 'is', null)
    .order('clock_in_time', { ascending: true })

  if (entriesError) {
    return jsonError('Report data could not be loaded.', 500)
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return jsonError('RESEND_API_KEY is not configured.', 500)
  }

  const from = process.env.REPORTS_FROM_EMAIL || 'CrewClock <reports@example.com>'
  const resend = new Resend(apiKey)
  const typedCompany = company as Company
  const typedEntries = (entries || []) as EntryWithJoins[]

  const { error: sendError } = await resend.emails.send({
    from,
    to: typedCompany.report_email,
    subject: `CrewClock Weekly Report - ${formatDate(weekStart)} to ${formatDate(weekEnd)}`,
    html: renderReportHtml(typedCompany, weekStart, weekEnd, typedEntries),
    text: renderReportText(typedCompany, weekStart, weekEnd, typedEntries)
  })

  if (sendError) {
    return jsonError(sendError.message || 'Failed to send report.', 500)
  }

  await admin.from('weekly_reports').insert({
    company_id: actorProfile.company_id,
    week_start: weekStart.toISOString(),
    week_end: weekEnd.toISOString(),
    sent_to_email: typedCompany.report_email,
    sent_at: new Date().toISOString()
  })

  return NextResponse.json({ email: typedCompany.report_email })
}
