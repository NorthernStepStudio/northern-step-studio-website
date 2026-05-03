-- Security hardening for Supabase Security Advisor findings.
-- Enables and forces RLS on public tables that should never be exposed directly.
--
-- Safe to run multiple times.

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'users',
    'user_sessions',
    'responseos_state',
    'knowledge_chunks'
  ]
  loop
    if exists (
      select 1
      from pg_tables
      where schemaname = 'public'
        and tablename = table_name
    ) then
      execute format(
        'alter table public.%I enable row level security',
        table_name
      );
      execute format(
        'alter table public.%I force row level security',
        table_name
      );
    end if;
  end loop;
end
$$;
