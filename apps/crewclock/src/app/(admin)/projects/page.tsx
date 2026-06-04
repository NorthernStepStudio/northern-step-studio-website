'use client'

import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import type { Project, ProjectStatus } from '@/lib/types'

const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed'
}

const STATUS_BADGES: Record<ProjectStatus, string> = {
  active: 'badge-green',
  paused: 'badge-yellow',
  completed: 'badge-slate'
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h3 className="font-semibold text-slate-100">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 touch-manipulation">
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | ProjectStatus>('all')
  const [form, setForm] = useState({
    name: '',
    address: '',
    status: 'active' as ProjectStatus,
    notes: ''
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const supabase = createClient()

  const loadProjects = useCallback(async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    setProjects((data || []) as Project[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  function openCreate() {
    setEditing(null)
    setForm({ name: '', address: '', status: 'active', notes: '' })
    setMessage(null)
    setShowModal(true)
  }

  function openEdit(project: Project) {
    setEditing(project)
    setForm({
      name: project.name,
      address: project.address,
      status: project.status,
      notes: project.notes || ''
    })
    setMessage(null)
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.address.trim()) {
      setMessage({ type: 'error', text: 'Name and address are required.' })
      return
    }

    setSaving(true)
    setMessage(null)

    if (editing) {
      const { error } = await supabase
        .from('projects')
        .update({
          name: form.name,
          address: form.address,
          status: form.status,
          notes: form.notes || null
        })
        .eq('id', editing.id)

      if (error) {
        setMessage({ type: 'error', text: 'Failed to update project.' })
      } else {
        setMessage({ type: 'success', text: 'Project updated.' })
        setShowModal(false)
        loadProjects()
      }
    } else {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        setMessage({ type: 'error', text: 'You must be signed in to create a project.' })
        setSaving(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single()

      if (!profile) {
        setMessage({ type: 'error', text: 'Your company profile could not be loaded.' })
        setSaving(false)
        return
      }

      const { error } = await supabase.from('projects').insert({
        company_id: profile.company_id,
        name: form.name,
        address: form.address,
        status: form.status,
        notes: form.notes || null
      })

      if (error) {
        setMessage({ type: 'error', text: 'Failed to create project.' })
      } else {
        setMessage({ type: 'success', text: 'Project created.' })
        setShowModal(false)
        loadProjects()
      }
    }

    setSaving(false)
  }

  const filtered =
    filterStatus === 'all' ? projects : projects.filter((project) => project.status === filterStatus)

  const statusOptions: Array<'all' | ProjectStatus> = ['all', 'active', 'paused', 'completed']

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-header">Projects</h1>
          <p className="page-sub">{projects.length} total</p>
        </div>
        <button onClick={openCreate} className="btn-primary btn-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      {message && !showModal && (
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

      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-colors touch-manipulation ${
              filterStatus === status
                ? 'bg-brand-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {status === 'all' ? 'All' : STATUS_LABELS[status]}
            <span className="ml-1.5 text-xs opacity-70">
              {status === 'all' ? projects.length : projects.filter((project) => project.status === status).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <svg className="animate-spin w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-10 h-10 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"
            />
          </svg>
          <p className="text-slate-400">No projects found</p>
          <button onClick={openCreate} className="btn-primary btn-sm mt-4 mx-auto">
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((project) => (
            <div key={project.id} className="card hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <span className={STATUS_BADGES[project.status]}>{STATUS_LABELS[project.status]}</span>
                <button
                  onClick={() => openEdit(project)}
                  className="text-slate-500 hover:text-slate-300 touch-manipulation p-1"
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
              </div>
              <h3 className="font-semibold text-slate-100 mb-1">{project.name}</h3>
              <p className="text-slate-400 text-sm flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {project.address}
              </p>
              {project.notes && <p className="text-slate-500 text-xs mt-2 line-clamp-2">{project.notes}</p>}
              <p className="text-slate-600 text-xs mt-3">
                Created {format(new Date(project.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Project' : 'New Project'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="label">Project Name *</label>
              <input
                className="input"
                placeholder="Main Street Renovation"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <div>
              <label className="label">Address *</label>
              <input
                className="input"
                placeholder="123 Main St, City, State"
                value={form.address}
                onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({ ...current, status: event.target.value as ProjectStatus }))
                }
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Optional notes..."
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              />
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
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
