'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Project, TimeEntry } from '@/lib/types'

type ClockState = 'loading' | 'idle' | 'clocked_in' | 'error'

function formatDuration(clockInTime: string) {
  const diff = Date.now() - new Date(clockInTime).getTime()
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  return `${hours}h ${minutes}m`
}

function getTimeOfDay() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

function formatCoords(lat?: number | null, lng?: number | null) {
  if (lat == null || lng == null) return null
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}

export default function ClockPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [openEntry, setOpenEntry] = useState<TimeEntry | null>(null)
  const [selectedProject, setSelectedProject] = useState('')
  const [state, setState] = useState<ClockState>('loading')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'warn'
    text: string
  } | null>(null)
  const [elapsed, setElapsed] = useState('')
  const actionInFlightRef = useRef(false)
  const supabase = createClient()

  const loadData = useCallback(async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      setState('error')
      return
    }

    const [{ data: prof }, { data: projs }, { data: entry }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('projects').select('*').eq('status', 'active').order('name'),
      supabase
        .from('time_entries')
        .select('*, projects(name, address)')
        .eq('user_id', user.id)
        .eq('status', 'open')
        .order('clock_in_time', { ascending: false })
        .limit(1)
        .maybeSingle()
    ])

    if (!prof) {
      setState('error')
      setMessage({ type: 'error', text: 'Your worker profile could not be loaded.' })
      return
    }

    setProfile(prof)
    setProjects((projs || []) as Project[])
    setOpenEntry((entry as TimeEntry | null) || null)
    setState(entry ? 'clocked_in' : 'idle')
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!openEntry) return undefined

    const interval = window.setInterval(() => {
      setElapsed(formatDuration(openEntry.clock_in_time))
    }, 30000)

    setElapsed(formatDuration(openEntry.clock_in_time))
    return () => window.clearInterval(interval)
  }, [openEntry])

  async function getLocation(): Promise<{
    lat: number
    lng: number
    status: 'granted' | 'denied'
  }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ lat: 0, lng: 0, status: 'denied' })
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            status: 'granted'
          }),
        () => resolve({ lat: 0, lng: 0, status: 'denied' }),
        { timeout: 10000, maximumAge: 0, enableHighAccuracy: true }
      )
    })
  }

  async function handleClockIn() {
    if (actionInFlightRef.current) return

    if (!selectedProject) {
      setMessage({ type: 'error', text: 'Please select a project first.' })
      return
    }

    const projectId = selectedProject
    actionInFlightRef.current = true
    setLoading(true)
    setMessage(null)

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user || !profile) {
        setMessage({ type: 'error', text: 'Your session or worker profile could not be loaded.' })
        return
      }

      const location = await getLocation()

      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          company_id: profile.company_id,
          user_id: user.id,
          project_id: projectId,
          clock_in_time: new Date().toISOString(),
          clock_in_lat: location.status === 'granted' ? location.lat : null,
          clock_in_lng: location.status === 'granted' ? location.lng : null,
          clock_in_location_status: location.status,
          status: 'open'
        })
        .select('*, projects(name, address)')
        .single()

      if (error) {
        if (error.code === '23505') {
          setMessage({ type: 'warn', text: 'You are already clocked in. Reloading your current shift.' })
          await loadData()
        } else {
          setMessage({ type: 'error', text: 'Failed to clock in. Please try again.' })
        }
      } else {
        setOpenEntry(data as TimeEntry)
        setState('clocked_in')
        setMessage({
          type: location.status === 'granted' ? 'success' : 'warn',
          text:
            location.status === 'granted'
              ? `Clocked in at ${format(new Date(), 'h:mm a')}. Location captured.`
              : `Clocked in at ${format(new Date(), 'h:mm a')}. Location was not captured.`
        })
        setSelectedProject('')
      }
    } finally {
      actionInFlightRef.current = false
      setLoading(false)
    }
  }

  async function handleClockOut() {
    if (actionInFlightRef.current) return
    if (!openEntry) return

    const entryId = openEntry.id
    actionInFlightRef.current = true
    setLoading(true)
    setMessage(null)

    try {
      const location = await getLocation()
      const now = new Date()
      const totalMinutes = Math.round(
        (now.getTime() - new Date(openEntry.clock_in_time).getTime()) / 60000
      )

      const { data, error } = await supabase
        .from('time_entries')
        .update({
          clock_out_time: now.toISOString(),
          clock_out_lat: location.status === 'granted' ? location.lat : null,
          clock_out_lng: location.status === 'granted' ? location.lng : null,
          clock_out_location_status: location.status,
          total_minutes: totalMinutes,
          status: location.status === 'denied' ? 'location_missing' : 'completed'
        })
        .eq('id', entryId)
        .eq('status', 'open')
        .select('id')
        .maybeSingle()

      if (error) {
        setMessage({ type: 'error', text: 'Failed to clock out. Please try again.' })
      } else if (!data) {
        setMessage({ type: 'warn', text: 'This shift is no longer open. Reloading your latest status.' })
        await loadData()
      } else {
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        setOpenEntry(null)
        setState('idle')
        setMessage({
          type: location.status === 'granted' ? 'success' : 'warn',
          text:
            location.status === 'granted'
              ? `Clocked out. Total: ${hours}h ${minutes}m. Location captured.`
              : `Clocked out. Total: ${hours}h ${minutes}m. Location was not captured.`
        })
      }
    } finally {
      actionInFlightRef.current = false
      setLoading(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 text-brand-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-navy-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <div className="bg-navy-900 border-b border-navy-700 px-4 py-3 flex items-center justify-between safe-top">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-bold text-navy-50">SignaTempu</span>
        </div>
        <button
          onClick={handleSignOut}
          className="text-navy-400 hover:text-navy-200 text-sm flex items-center gap-1.5 touch-manipulation"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Sign out
        </button>
      </div>

      <div className="flex-1 px-4 py-6 flex flex-col gap-5 max-w-md mx-auto w-full">
        <div className="animate-fade-in">
          <p className="text-navy-400 text-sm">Good {getTimeOfDay()}</p>
          <h2 className="text-2xl font-bold text-navy-50">
            {profile?.full_name?.split(' ')[0] ?? 'Worker'}
          </h2>
          <p className="text-navy-500 text-sm mt-0.5">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>

        {message && (
          <div
            className={`rounded-xl p-3.5 flex items-start gap-2.5 animate-slide-up ${
              message.type === 'success'
                ? 'bg-green-900/30 border border-green-800/50'
                : message.type === 'warn'
                  ? 'bg-yellow-900/30 border border-yellow-800/50'
                  : 'bg-red-900/30 border border-red-800/50'
            }`}
          >
            <span
              className={`mt-0.5 h-2.5 w-2.5 rounded-full ${
                message.type === 'success'
                  ? 'bg-green-400'
                  : message.type === 'warn'
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
              }`}
            />
            <p
              className={`text-sm ${
                message.type === 'success'
                  ? 'text-green-400'
                  : message.type === 'warn'
                    ? 'text-yellow-400'
                    : 'text-red-400'
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        {state === 'clocked_in' && openEntry ? (
          <div className="animate-slide-up">
            <div className="bg-green-900/20 border border-green-800/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse-slow" />
                <span className="text-green-400 font-semibold text-sm uppercase tracking-wide">
                  Currently clocked in
                </span>
              </div>

              <div className="space-y-3 mb-5">
                <div>
                  <p className="text-xs text-navy-500 uppercase tracking-wide mb-1">Project</p>
                  <p className="text-navy-50 font-semibold text-lg">
                    {openEntry.projects?.name ?? 'Unknown project'}
                  </p>
                  {openEntry.projects?.address && (
                    <p className="text-navy-400 text-sm mt-0.5">{openEntry.projects.address}</p>
                  )}
                </div>

                <div className="flex gap-4">
                  <div>
                    <p className="text-xs text-navy-500 uppercase tracking-wide mb-1">Clocked in</p>
                    <p className="text-navy-50 font-semibold">
                      {format(new Date(openEntry.clock_in_time), 'h:mm a')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-navy-500 uppercase tracking-wide mb-1">Duration</p>
                    <p className="text-navy-50 font-semibold">{elapsed}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-navy-500 uppercase tracking-wide mb-1">Location</p>
                  <p className="text-sm">
                    {openEntry.clock_in_location_status === 'granted' ? (
                      <span className="text-green-400">
                        Location captured
                        {formatCoords(openEntry.clock_in_lat, openEntry.clock_in_lng) && (
                          <span className="block text-xs text-green-300/80 mt-0.5 font-mono">
                            {formatCoords(openEntry.clock_in_lat, openEntry.clock_in_lng)}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-yellow-400">Location not captured</span>
                    )}
                  </p>
                </div>
              </div>

              <button onClick={handleClockOut} disabled={loading} className="btn-danger w-full">
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Clocking out...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                    Clock Out
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-slide-up space-y-4">
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 bg-navy-500 rounded-full" />
                <span className="text-navy-400 font-medium text-sm uppercase tracking-wide">
                  Not clocked in
                </span>
              </div>

              <div className="mb-4">
                <label className="label">Select Project</label>
                {projects.length === 0 ? (
                  <div className="bg-navy-800 rounded-xl p-4 text-center">
                    <p className="text-navy-400 text-sm">No active projects available.</p>
                    <p className="text-navy-500 text-xs mt-1">Contact your manager.</p>
                  </div>
                ) : (
                  <select
                    className="input"
                    value={selectedProject}
                    onChange={(event) => setSelectedProject(event.target.value)}
                  >
                    <option value="">Choose a project...</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <button
                onClick={handleClockIn}
                disabled={loading || !selectedProject}
                className="btn-primary w-full"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Clocking in...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Clock In
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-navy-600">
              Your location will be captured when you clock in and out
            </p>
          </div>
        )}
      </div>

      <div className="safe-bottom" />
    </div>
  )
}
