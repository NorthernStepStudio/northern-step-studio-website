-- Run in Supabase SQL editor for backend-worker billing support.

create table if not exists public.user_entitlements (
  id bigserial primary key,
  user_id bigint not null references public.users(id) on delete cascade,
  tier varchar(120) not null,
  expires_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_entitlements_user_id
  on public.user_entitlements(user_id);

create index if not exists idx_user_entitlements_user_id_tier
  on public.user_entitlements(user_id, tier);

create table if not exists public.user_token_balances (
  id bigserial primary key,
  user_id bigint not null references public.users(id) on delete cascade,
  balance integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists idx_user_token_balances_user_id
  on public.user_token_balances(user_id);
