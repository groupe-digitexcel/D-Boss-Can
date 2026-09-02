-- Run this ONLY in the separate DBM Candidate Pilot Supabase project.
-- It does not alter or migrate the operational D-Boss-Motos database.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role text not null default 'reviewer' check (role in ('owner','manager','reviewer')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
create index if not exists admin_users_active_idx on public.admin_users(active);

-- After creating an administrator in Supabase Auth, authorize that UUID:
-- insert into public.admin_users(user_id,email,display_name,role)
-- values ('AUTH-USER-UUID-HERE','admin@example.com','DBM Administrator','owner');
