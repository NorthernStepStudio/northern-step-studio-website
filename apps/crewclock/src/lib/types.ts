export type UserRole = 'owner' | 'manager' | 'supervisor' | 'worker'
export type ProjectStatus = 'active' | 'paused' | 'completed'
export type TimeEntryStatus =
  | 'open'
  | 'completed'
  | 'missing_clock_out'
  | 'location_missing'
  | 'edited_by_admin'
export type LocationStatus = 'granted' | 'denied' | 'missing'
export type UserStatus = 'active' | 'inactive'
export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked'

export interface Company {
  id: string
  name: string
  owner_user_id: string
  report_email: string
  phone?: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  company_id: string
  full_name: string
  email: string
  role: UserRole
  status: UserStatus
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  company_id: string
  name: string
  address: string
  status: ProjectStatus
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface TimeEntry {
  id: string
  company_id: string
  user_id: string
  project_id: string
  clock_in_time: string
  clock_out_time?: string | null
  clock_in_lat?: number | null
  clock_in_lng?: number | null
  clock_out_lat?: number | null
  clock_out_lng?: number | null
  clock_in_location_status: LocationStatus
  clock_out_location_status?: LocationStatus | null
  total_minutes?: number | null
  status: TimeEntryStatus
  notes?: string | null
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'full_name' | 'email' | 'role'> | null
  projects?: Pick<Project, 'name' | 'address'> | null
}

export interface WeeklyReport {
  id: string
  company_id: string
  week_start: string
  week_end: string
  sent_to_email: string
  sent_at: string
  created_at: string
}

export interface WorkerInvite {
  id: string
  company_id: string
  invited_by_user_id: string
  email: string
  full_name: string
  role: UserRole
  token: string
  status: InviteStatus
  expires_at: string
  accepted_at?: string | null
  created_at: string
}

export interface DashboardStats {
  currently_clocked_in: number
  clocked_out_today: number
  total_hours_today: number
  total_hours_this_week: number
  missing_clock_outs: number
}

export interface WorkerWeekSummary {
  worker_id: string
  worker_name: string
  total_minutes: number
  entries: TimeEntry[]
}

export interface ProjectWeekSummary {
  project_id: string
  project_name: string
  total_minutes: number
  entries: TimeEntry[]
}

export interface WeeklyReportData {
  company: Company
  week_start: string
  week_end: string
  workers: WorkerWeekSummary[]
  projects: ProjectWeekSummary[]
  missing_clock_outs: TimeEntry[]
  edited_entries: TimeEntry[]
}
