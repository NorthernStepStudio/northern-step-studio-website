'use client'

import { useCallback, useEffect, useState } from 'react'
import { endOfWeek, format, startOfDay, startOfWeek } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import type { TimeEntry } from '@/lib/types'

function StatCard({
  label,
  value,
  sub,
  color = 'slate'
}: {
  label: string
  value: string | number
  sub?: string
  color?: string
}) {
  const colors: Record<string, string> = {
    slate: 'text-slate-100',
    green: 'text-green-400',
    orange: 'text-brand-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400'
  }

  return (
    <div className="card">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${colors[color] ?? colors.slate}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}

function formatHours(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [clockedIn, setClockedIn] = useState<TimeEntry[]>([])
  const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([])
  const [weekEntries, setWeekEntries] = useState<TimeEntry[]>([])
  const supabase = createClient()

  const loadDashboard = useCallback(async () => {
    const today = startOfDay(new Date()).toISOString()
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString()
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 }).toISOString()

    const [clockedInRes, todayRes, weekRes] = await Promise.all([
      supabase
        .from('time_entries')
        .select('*, profiles(full_name, email), projects(name)')
        .eq('status', 'open')
        .order('clock_in_time', { ascending: false }),
      supabase
        .from('time_entries')
        .select('*, profiles(full_name), projects(name)')
        .gte('clock_in_time', today)
        .neq('status', 'open')
        .order('clock_in_time', { ascending: false }),
      supabase
        .from('time_entries')
        .select('*, profiles(full_name), projects(name)')
        .gte('clock_in_time', weekStart)
        .lte('clock_in_time', weekEnd)
        .not('total_minutes', 'is', null)
    ])

    setClockedIn((clockedInRes.data || []) as TimeEntry[])
    setTodayEntries((todayRes.data || []) as TimeEntry[])
    setWeekEntries((weekRes.data || []) as TimeEntry[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadDashboard()
    const interval = window.setInterval(loadDashboard, 60000)
    return () => window.clearInterval(interval)
  }, [loadDashboard])

  const totalHoursToday = todayEntries.reduce((sum, entry) => sum + (entry.total_minutes || 0), 0)
  const totalHoursWeek = weekEntries.reduce((sum, entry) => sum + (entry.total_minutes || 0), 0)

  const workerHours = weekEntries.reduce<Record<string, { name: string; minutes: number }>>(
    (acc, entry) => {
      const id = entry.user_id
      const name = entry.profiles?.full_name ?? 'Unknown'
      if (!acc[id]) acc[id] = { name, minutes: 0 }
      acc[id].minutes += entry.total_minutes || 0
      return acc
    },
    {}
  )

  const projectHours = weekEntries.reduce<Record<string, { name: string; minutes: number }>>(
    (acc, entry) => {
      const id = entry.project_id
      const name = entry.projects?.name ?? 'Unknown'
      if (!acc[id]) acc[id] = { name, minutes: 0 }
      acc[id].minutes += entry.total_minutes || 0
      return acc
    },
    {}
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24">
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
      <div>
        <h1 className="page-header">Dashboard</h1>
        <p className="page-sub">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Clocked In Now" value={clockedIn.length} color="green" />
        <StatCard label="Finished Today" value={todayEntries.length} />
        <StatCard label="Hours Today" value={formatHours(totalHoursToday)} color="orange" />
        <StatCard label="Hours This Week" value={formatHours(totalHoursWeek)} color="orange" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-slow" />
            Currently Clocked In
          </h3>
          <span className="badge-green">{clockedIn.length} active</span>
        </div>

        {clockedIn.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">
            No workers currently clocked in
          </p>
        ) : (
          <div className="space-y-2">
            {clockedIn.map((entry) => {
              const diff = Date.now() - new Date(entry.clock_in_time).getTime()
              const hours = Math.floor(diff / 3600000)
              const minutes = Math.floor((diff % 3600000) / 60000)
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between bg-slate-800/50 rounded-xl px-3.5 py-3"
                >
                  <div>
                    <p className="text-slate-100 font-medium text-sm">
                      {entry.profiles?.full_name ?? 'Unknown'}
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {entry.projects?.name ?? 'No project'} - since{' '}
                      {format(new Date(entry.clock_in_time), 'h:mm a')}
                    </p>
                  </div>
                  <span className="text-green-400 text-sm font-mono">
                    {hours}h {minutes}m
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-slate-100 mb-4">Hours by Worker - This Week</h3>
          {Object.keys(workerHours).length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">
              No completed entries this week
            </p>
          ) : (
            <div className="space-y-2">
              {Object.values(workerHours)
                .sort((a, b) => b.minutes - a.minutes)
                .map((worker) => (
                  <div key={worker.name} className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">{worker.name}</span>
                    <span className="text-brand-400 font-mono text-sm font-medium">
                      {formatHours(worker.minutes)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-100 mb-4">Hours by Project - This Week</h3>
          {Object.keys(projectHours).length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">
              No completed entries this week
            </p>
          ) : (
            <div className="space-y-2">
              {Object.values(projectHours)
                .sort((a, b) => b.minutes - a.minutes)
                .map((project) => (
                  <div key={project.name} className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">{project.name}</span>
                    <span className="text-brand-400 font-mono text-sm font-medium">
                      {formatHours(project.minutes)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-100 mb-4">Recent Activity</h3>
        {todayEntries.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">No completed entries today</p>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-xs text-slate-500 uppercase tracking-wide pb-2 font-medium">
                    Worker
                  </th>
                  <th className="text-left text-xs text-slate-500 uppercase tracking-wide pb-2 font-medium">
                    Project
                  </th>
                  <th className="text-left text-xs text-slate-500 uppercase tracking-wide pb-2 font-medium">
                    In
                  </th>
                  <th className="text-left text-xs text-slate-500 uppercase tracking-wide pb-2 font-medium">
                    Out
                  </th>
                  <th className="text-right text-xs text-slate-500 uppercase tracking-wide pb-2 font-medium">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {todayEntries.slice(0, 10).map((entry) => (
                  <tr key={entry.id}>
                    <td className="py-2.5 text-slate-200">{entry.profiles?.full_name ?? '-'}</td>
                    <td className="py-2.5 text-slate-400">{entry.projects?.name ?? '-'}</td>
                    <td className="py-2.5 text-slate-400">
                      {format(new Date(entry.clock_in_time), 'h:mm a')}
                    </td>
                    <td className="py-2.5 text-slate-400">
                      {entry.clock_out_time ? format(new Date(entry.clock_out_time), 'h:mm a') : '-'}
                    </td>
                    <td className="py-2.5 text-right text-brand-400 font-mono">
                      {entry.total_minutes ? formatHours(entry.total_minutes) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
