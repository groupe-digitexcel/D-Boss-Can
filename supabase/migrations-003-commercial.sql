-- DBM Candidate Pilot: commercial policy + finance + duplicate normalization
alter table public.candidate_applications add column if not exists normalized_name text;
alter table public.candidate_applications add column if not exists normalized_phone text;
alter table public.candidate_applications add column if not exists plan_months integer;
alter table public.candidate_applications add column if not exists payment_days integer;
alter table public.candidate_applications add column if not exists investment_cost integer default 700000;
alter table public.candidate_applications add column if not exists contract_fees numeric(12,2) default 0;
alter table public.candidate_applications add column if not exists amount_collected numeric(12,2) default 0;
alter table public.candidate_applications add column if not exists maintenance_cost numeric(12,2) default 0;
alter table public.candidate_applications add column if not exists other_operating_cost numeric(12,2) default 0;
alter table public.candidate_applications add column if not exists estimated_net_result numeric(12,2);
alter table public.candidate_applications add column if not exists profitability_status text default 'PENDING';
alter table public.candidate_applications add column if not exists recommended_plan text;

update public.candidate_applications set normalized_name=lower(regexp_replace(trim(name),'\\s+',' ','g')) where normalized_name is null;
update public.candidate_applications set normalized_phone=regexp_replace(phone,'\\D','','g') where normalized_phone is null;
update public.candidate_applications set investment_cost=700000 where investment_cost is null;

create index if not exists candidate_identity_lookup_idx on public.candidate_applications(normalized_name, normalized_phone);

-- Keep duplicate prevention application-level so no existing data is deleted or made invalid by a UNIQUE constraint.
-- Financial reference configuration: one motorcycle = 600,000 + 40,000 GPS + 20,000 registration + 20,000 insurance + 20,000 accessories = 700,000 FCFA.
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

-- Strong duplicate lookup helper: works from raw name/phone formatting as well.
create or replace function public.find_candidate_duplicate(p_name text, p_phone text)
returns table(id uuid, applicant_id text, verification_token text, name text, phone text, pre_screening_status text, final_decision text)
language sql security definer set search_path = public as $$
  select id, applicant_id, verification_token, name, phone, pre_screening_status, final_decision
  from public.candidate_applications
  where lower(regexp_replace(trim(name),'\\s+',' ','g')) = lower(regexp_replace(trim(p_name),'\\s+',' ','g'))
    and regexp_replace(phone,'\\D','','g') = regexp_replace(p_phone,'\\D','','g')
  order by created_at desc
  limit 1;
$$;
