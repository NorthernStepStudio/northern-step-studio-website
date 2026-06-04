-- ============================================================
-- SignaTempu — Multi-company SaaS schema
-- ============================================================

-- Enums
create type public.user_role as enum ('owner', 'manager', 'supervisor', 'worker');
create type public.user_status as enum ('active', 'inactive');
create type public.project_status as enum ('active', 'paused', 'completed');
create type public.time_entry_status as enum (
  'open',
  'completed',
  'missing_clock_out',
  'location_missing',
  'edited_by_admin'
);
create type public.location_status as enum ('granted', 'denied', 'missing');
create type public.invite_status as enum ('pending', 'accepted', 'expired', 'revoked');

create schema if not exists private;

-- ============================================================
-- Tables
-- ============================================================

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  report_email text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  full_name text not null,
  email text not null,
  role public.user_role not null default 'worker',
  status public.user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, email)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  address text not null,
  status public.project_status not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.time_entries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete restrict,
  clock_in_time timestamptz not null,
  clock_out_time timestamptz,
  clock_in_lat double precision,
  clock_in_lng double precision,
  clock_out_lat double precision,
  clock_out_lng double precision,
  clock_in_location_status public.location_status not null default 'missing',
  clock_out_location_status public.location_status,
  total_minutes integer check (total_minutes is null or total_minutes >= 0),
  status public.time_entry_status not null default 'open',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clock_out_after_clock_in check (
    clock_out_time is null or clock_out_time >= clock_in_time
  )
);

create table public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  week_start timestamptz not null,
  week_end timestamptz not null,
  sent_to_email text not null,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.worker_invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  invited_by_user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role public.user_role not null default 'worker',
  token text not null unique,
  status public.invite_status not null default 'pending',
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Indexes
-- ============================================================

create index profiles_company_id_idx on public.profiles(company_id);
create index projects_company_id_status_idx on public.projects(company_id, status);
create index time_entries_company_clock_in_idx on public.time_entries(company_id, clock_in_time desc);
create index time_entries_user_status_idx on public.time_entries(user_id, status);
create index time_entries_project_clock_in_idx on public.time_entries(project_id, clock_in_time desc);
create unique index time_entries_one_open_per_user_idx
on public.time_entries(user_id)
where status = 'open';
create index weekly_reports_company_created_idx on public.weekly_reports(company_id, created_at desc);
create index worker_invites_token_idx on public.worker_invites(token);
create index worker_invites_company_id_idx on public.worker_invites(company_id);
create index worker_invites_email_idx on public.worker_invites(email);

-- ============================================================
-- Triggers — auto-update updated_at
-- ============================================================

create or replace function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger companies_updated_at
before update on public.companies
for each row execute function private.set_updated_at();

create trigger profiles_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger projects_updated_at
before update on public.projects
for each row execute function private.set_updated_at();

create trigger time_entries_updated_at
before update on public.time_entries
for each row execute function private.set_updated_at();

-- ============================================================
-- Helper functions for RLS
-- ============================================================

create or replace function private.current_company_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select company_id from public.profiles where id = auth.uid()
$$;

create or replace function private.current_role()
returns public.user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function private.current_status()
returns public.user_status
language sql
security definer
set search_path = public
stable
as $$
  select status from public.profiles where id = auth.uid()
$$;

create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(private.current_role() in ('owner', 'manager', 'supervisor'), false)
$$;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.time_entries enable row level security;
alter table public.weekly_reports enable row level security;
alter table public.worker_invites enable row level security;

-- Companies
create policy "Company members can read their company"
on public.companies for select
to authenticated
using (id = private.current_company_id());

create policy "Owners and managers can update their company"
on public.companies for update
to authenticated
using (id = private.current_company_id() and private.current_role() in ('owner', 'manager'))
with check (id = private.current_company_id());

-- Profiles
create policy "Company members can read profiles"
on public.profiles for select
to authenticated
using (company_id = private.current_company_id());

create policy "Users can update safe profile fields"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and company_id = private.current_company_id()
  and role = private.current_role()
  and status = private.current_status()
);

create policy "Owners and managers can update team profiles"
on public.profiles for update
to authenticated
using (company_id = private.current_company_id() and private.current_role() in ('owner', 'manager'))
with check (company_id = private.current_company_id());

-- Projects
create policy "Company members can read projects"
on public.projects for select
to authenticated
using (company_id = private.current_company_id());

create policy "Admins can create projects"
on public.projects for insert
to authenticated
with check (company_id = private.current_company_id() and private.is_admin());

create policy "Admins can update projects"
on public.projects for update
to authenticated
using (company_id = private.current_company_id() and private.is_admin())
with check (company_id = private.current_company_id());

-- Time Entries — workers see only their own, admins see all company entries
create policy "Users can read relevant time entries"
on public.time_entries for select
to authenticated
using (
  company_id = private.current_company_id()
  and (user_id = auth.uid() or private.is_admin())
);

create policy "Workers can create their own time entries"
on public.time_entries for insert
to authenticated
with check (
  company_id = private.current_company_id()
  and user_id = auth.uid()
  and exists (
    select 1
    from public.projects
    where projects.id = time_entries.project_id
      and projects.company_id = private.current_company_id()
      and projects.status = 'active'
  )
);

create policy "Workers can update their own time entries"
on public.time_entries for update
to authenticated
using (
  company_id = private.current_company_id()
  and user_id = auth.uid()
)
with check (
  company_id = private.current_company_id()
  and user_id = auth.uid()
  and exists (
    select 1
    from public.projects
    where projects.id = time_entries.project_id
      and projects.company_id = private.current_company_id()
  )
);

create policy "Admins can update company time entries"
on public.time_entries for update
to authenticated
using (company_id = private.current_company_id() and private.is_admin())
with check (
  company_id = private.current_company_id()
  and exists (
    select 1
    from public.projects
    where projects.id = time_entries.project_id
      and projects.company_id = private.current_company_id()
  )
);

-- Weekly Reports
create policy "Company members can read weekly reports"
on public.weekly_reports for select
to authenticated
using (company_id = private.current_company_id());

-- Worker Invites
create policy "Admins can read company invites"
on public.worker_invites for select
to authenticated
using (company_id = private.current_company_id() and private.is_admin());

create policy "Owners and managers can create invites"
on public.worker_invites for insert
to authenticated
with check (company_id = private.current_company_id() and private.current_role() in ('owner', 'manager'));

create policy "Owners and managers can update invites"
on public.worker_invites for update
to authenticated
using (company_id = private.current_company_id() and private.current_role() in ('owner', 'manager'))
with check (company_id = private.current_company_id());

-- ============================================================
-- Grants
-- ============================================================

grant usage on schema public to authenticated;
grant usage on schema private to authenticated;
grant execute on all functions in schema private to authenticated;
grant select, insert, update on public.companies to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.projects to authenticated;
grant select, insert, update on public.time_entries to authenticated;
grant select, insert, update on public.weekly_reports to authenticated;
grant select, insert, update on public.worker_invites to authenticated;
