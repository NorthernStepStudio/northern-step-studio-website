'use client'

import { useCallback, useEffect, useState } from 'react'
import { endOfDay, format, startOfDay, subDays } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import type { TimeEntry, TimeEntryStatus } from '@/lib/types'

const STATUS_BADGE: Record<TimeEntryStatus, string> = {
  open: 'badge-green',
  completed: 'badge-slate',
  missing_clock_out: 'badge-red',
  location_missing: 'badge-yellow',
  edited_by_admin: 'badge-orange'
}

const STATUS_LABEL: Record<TimeEntryStatus, string> = {
  open: 'Clocked In',
  completed: 'Completed',
  missing_clock_out: 'Missing Out',
  location_missing: 'No Location',
  edited_by_admin: 'Edited'
}

function formatHours(minutes: number | null | undefined) {
  if (minutes == null) return '-'
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

function formatCoords(lat?: number | null, lng?: number | null) {
  if (lat == null || lng == null) return '-'
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}

export default function TimeEntriesPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [workers, setWorkers] = useState<{ id: string; name: string }[]>([])
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])
  const [filters, setFilters] = useState({
    dateRange: '7d',
    worker: 'all',
    project: 'all',
    status: 'all'
  })
  const [expanded, setExpanded] = useState<string | null>(null)
  const supabase = createClient()

  const loadEntries = useCallback(async () => {
    setLoading(true)

    let startDate: Date
    const now = new Date()
    switch (filters.dateRange) {
      case 'today':
        startDate = startOfDay(now)
        break
      case '30d':
        startDate = subDays(now, 30)
        break
      case '90d':
        startDate = subDays(now, 90)
        break
      case '7d':
      default:
        startDate = subDays(now, 7)
        break
    }

    let query = supabase
      .from('time_entries')
      .select('*, profiles(full_name, email), projects(name, address)')
      .gte('clock_in_time', startDate.toISOString())
      .lte('clock_in_time', endOfDay(now).toISOString())
      .order('clock_in_time', { ascending: false })

    if (filters.worker !== 'all') query = query.eq('user_id', filters.worker)
    if (filters.project !== 'all') query = query.eq('project_id', filters.project)
    if (filters.status !== 'all') query = query.eq('status', filters.status)

    const { data } = await query
    setEntries((data || []) as TimeEntry[])
    setLoading(false)
  }, [supabase, filters])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  useEffect(() => {
    async function loadFilters() {
      const [{ data: workerRows }, { data: projectRows }] = await Promise.all([
        supabase.from('profiles').select('id, full_name').eq('status', 'active').order('full_name'),
        supabase.from('projects').select('id, name').order('name')
      ])

      setWorkers((workerRows || []).map((worker) => ({ id: worker.id, name: worker.full_name })))
      setProjects((projectRows || []).map((project) => ({ id: project.id, name: project.name })))
    }

    loadFilters()
  }, [supabase])

  async function markMissingClockOut(id: string) {
    await supabase.from('time_entries').update({ status: 'missing_clock_out' }).eq('id', id)
    loadEntries()
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-header">Time Entries</h1>
        <p className="page-sub">{entries.length} entries</p>
      </div>

      <div className="card">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="label text-xs">Date Range</label>
            <select
              className="input py-2 text-sm"
              value={filters.dateRange}
              onChange={(event) => setFilters((current) => ({ ...current, dateRange: event.target.value }))}
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <div>
            <label className="label text-xs">Worker</label>
            <select
              className="input py-2 text-sm"
              value={filters.worker}
              onChange={(event) => setFilters((current) => ({ ...current, worker: event.target.value }))}
            >
              <option value="all">All workers</option>
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-xs">Project</label>
            <select
              className="input py-2 text-sm"
              value={filters.project}
              onChange={(event) => setFilters((current) => ({ ...current, project: event.target.value }))}
            >
              <option value="all">All projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-xs">Status</label>
            <select
              className="input py-2 text-sm"
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="all">All statuses</option>
              {Object.entries(STATUS_LABEL).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <svg className="animate-spin w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      ) : entries.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400">No time entries found for the selected filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div key={entry.id} className="card">
              <div
                className="flex items-start justify-between gap-3 cursor-pointer touch-manipulation"
                onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-slate-100 text-sm">
                      {entry.profiles?.full_name ?? '-'}
                    </span>
                    <span className={STATUS_BADGE[entry.status]}>{STATUS_LABEL[entry.status]}</span>
                  </div>
                  <p className="text-slate-400 text-sm">{entry.projects?.name ?? '-'}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    {format(new Date(entry.clock_in_time), 'MMM d, yyyy - h:mm a')}
                    {entry.clock_out_time && ` to ${format(new Date(entry.clock_out_time), 'h:mm a')}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-brand-400 font-mono text-sm font-medium">
                    {formatHours(entry.total_minutes)}
                  </p>
                  <svg
                    className={`w-4 h-4 text-slate-500 mt-1 ml-auto transition-transform ${
                      expanded === entry.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {expanded === entry.id && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Clock In</p>
                      <p className="text-slate-300">
                        {format(new Date(entry.clock_in_time), 'MMM d h:mm a')}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatCoords(entry.clock_in_lat, entry.clock_in_lng)}
                      </p>
                      <p className="text-xs mt-0.5">
                        {entry.clock_in_location_status === 'granted' ? (
                          <span className="text-green-400">Location captured</span>
                        ) : (
                          <span className="text-yellow-400">No location</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Clock Out</p>
                      {entry.clock_out_time ? (
                        <>
                          <p className="text-slate-300">
                            {format(new Date(entry.clock_out_time), 'MMM d h:mm a')}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formatCoords(entry.clock_out_lat, entry.clock_out_lng)}
                          </p>
                          <p className="text-xs mt-0.5">
                            {entry.clock_out_location_status === 'granted' ? (
                              <span className="text-green-400">Location captured</span>
                            ) : (
                              <span className="text-yellow-400">No location</span>
                            )}
                          </p>
                        </>
                      ) : (
                        <p className="text-slate-500">Not clocked out</p>
                      )}
                    </div>
                  </div>

                  {entry.notes && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                      <p className="text-slate-300 text-sm">{entry.notes}</p>
                    </div>
                  )}

                  {entry.status === 'open' && (
                    <button
                      onClick={() => markMissingClockOut(entry.id)}
                      className="text-xs text-yellow-400 hover:text-yellow-300 underline touch-manipulation"
                    >
                      Mark as missing clock-out
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
