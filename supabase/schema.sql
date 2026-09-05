-- DBM CANDIDATE PILOT v2 — independent database
create extension if not exists pgcrypto;

create table if not exists public.candidate_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_id text not null unique,
  verification_token text not null unique,
  name text not null,
  phone text not null,
  dob date not null,
  address text not null,
  source text not null default 'Direct',
  campaign text,
  utm_medium text,
  experience_months integer not null default 0,
  licence text not null,
  activity text not null,
  activity_duration text not null,
  residence_duration text not null,
  professional text not null,
  daily_revenue numeric(12,2) not null default 0,
  daily_fuel numeric(12,2) not null default 0,
  daily_obligations numeric(12,2) not null default 0,
  daily_other_cost numeric(12,2) not null default 0,
  selected_plan text not null,
  target_amount integer not null,
  target_daily integer not null,
  net_daily_capacity numeric(12,2) not null,
  capacity_ratio numeric(8,3) not null,
  preliminary_score integer not null,
  pre_screening_status text not null,
  consent_at timestamptz not null,
  review_status text not null default 'NEW',
  identity_status text not null default 'PENDING',
  phone_status text not null default 'PENDING',
  address_status text not null default 'PENDING',
  licence_status text not null default 'PENDING',
  guarantor_status text not null default 'PENDING',
  reference_status text not null default 'PENDING',
  interview_status text not null default 'PENDING',
  field_verification_status text not null default 'PENDING',
  final_decision text not null default 'PENDING',
  final_score integer,
  verification_notes text,
  reviewer_note text,
  contacted_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  normalized_name text,
  normalized_phone text,
  plan_months integer,
  payment_days integer,
  investment_cost integer not null default 700000,
  contract_fees numeric(12,2) not null default 0,
  amount_collected numeric(12,2) not null default 0,
  maintenance_cost numeric(12,2) not null default 0,
  other_operating_cost numeric(12,2) not null default 0,
  estimated_net_result numeric(12,2),
  profitability_status text not null default 'PENDING',
  recommended_plan text
);

create table if not exists public.candidate_verification_documents (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidate_applications(id) on delete cascade,
  document_type text not null,
  file_name text not null,
  storage_path text not null,
  status text not null default 'PENDING',
  reviewer_note text,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.candidate_guarantors (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidate_applications(id) on delete cascade,
  name text not null,
  phone text not null,
  relationship text not null,
  address text not null,
  consent_confirmed boolean not null default false,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.candidate_references (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidate_applications(id) on delete cascade,
  name text not null,
  phone text not null,
  relationship text not null,
  notes text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.candidate_audit_log (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidate_applications(id) on delete cascade,
  actor text not null,
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists candidate_applications_created_idx on public.candidate_applications(created_at desc);
create index if not exists candidate_applications_status_idx on public.candidate_applications(pre_screening_status, review_status, final_decision);
create index if not exists candidate_documents_candidate_idx on public.candidate_verification_documents(candidate_id);
create index if not exists candidate_identity_lookup_idx on public.candidate_applications(normalized_name, normalized_phone);

alter table public.candidate_applications enable row level security;
alter table public.candidate_verification_documents enable row level security;
alter table public.candidate_guarantors enable row level security;
alter table public.candidate_references enable row level security;
alter table public.candidate_audit_log enable row level security;

-- Create a PRIVATE Storage bucket named candidate-documents in Supabase Storage.
-- Do not add public read policies. Server routes use the service-role key.
insert into storage.buckets (id, name, public) values ('candidate-documents','candidate-documents',false)
on conflict (id) do update set public=false;

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists candidate_updated_at on public.candidate_applications;
create trigger candidate_updated_at before update on public.candidate_applications for each row execute function public.set_updated_at();


create table if not exists public.dbm_financial_config (
  id integer primary key default 1 check (id=1),
  motorcycle_cost integer not null default 600000,
  gps_cost integer not null default 40000,
  registration_cost integer not null default 20000,
  insurance_cost integer not null default 20000,
  accessories_cost integer not null default 20000,
  updated_at timestamptz not null default now()
);
insert into public.dbm_financial_config(id) values(1) on conflict (id) do nothing;
alter table public.dbm_financial_config enable row level security;
