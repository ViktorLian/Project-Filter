-- FlowPilot growth automation foundation.
-- Applied to Supabase on 2026-09-04 and committed here for reproducibility.

alter table public.leads
  add column if not exists customer_name text,
  add column if not exists customer_email text,
  add column if not exists customer_phone text;
alter table public.leads_forms add column if not exists user_id uuid;
update public.leads_forms lf set user_id=lc.user_id from public.leads_companies lc
where lf.company_id=lc.id and lf.user_id is null;
alter table public.leads_companies
  add column if not exists email_sequence_settings jsonb,
  add column if not exists webhook_url text,
  add column if not exists webhook_secret text,
  add column if not exists webhook_enabled boolean not null default false;
alter table public.leads drop constraint if exists leads_company_id_fkey;
alter table public.leads add constraint leads_company_id_fkey foreign key(company_id)
  references public.leads_companies(id) on delete cascade;
alter table public.leads drop constraint if exists leads_form_id_fkey;
alter table public.leads add constraint leads_form_id_fkey foreign key(form_id)
  references public.leads_forms(id) on delete set null;
alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads add constraint leads_status_check check(
  lower(status) in ('new','contacted','qualified','proposal','won','lost')
);
create index if not exists leads_company_created_idx on public.leads(company_id,created_at desc);
create index if not exists leads_company_status_idx on public.leads(company_id,status);

create table if not exists public.automation_settings(
  company_id uuid primary key references public.leads_companies(id) on delete cascade,
  lead_followup_enabled boolean not null default true,
  lead_followup_hours integer not null default 24 check(lead_followup_hours between 1 and 720),
  proposal_followup_enabled boolean not null default true,
  proposal_followup_days integer not null default 3 check(proposal_followup_days between 1 and 90),
  reactivation_enabled boolean not null default false,
  reactivation_days integer not null default 90 check(reactivation_days between 30 and 730),
  service_reminders_enabled boolean not null default true,
  monthly_report_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.automation_settings enable row level security;

create table if not exists public.automation_delivery_log(
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.leads_companies(id) on delete cascade,
  automation_type text not null,
  entity_id uuid,
  recipient text,
  delivery_status text not null check(delivery_status in('sent','failed','skipped')),
  provider_message_id text,
  error_message text,
  idempotency_key text not null unique,
  created_at timestamptz not null default now()
);
alter table public.automation_delivery_log enable row level security;
create index if not exists automation_log_company_created_idx
  on public.automation_delivery_log(company_id,created_at desc);
alter table public.customers add column if not exists marketing_consent_at timestamptz;
alter table public.customers add column if not exists marketing_unsubscribed_at timestamptz;
alter table public.jobs add column if not exists service_due_at date;
alter table public.jobs add column if not exists service_reminder_sent_at timestamptz;

create table if not exists public.leads_sequence_log(
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  company_id uuid not null references public.leads_companies(id) on delete cascade,
  template_day integer not null,
  sent_at timestamptz not null default now(),
  unique(lead_id,template_day)
);
alter table public.leads_sequence_log enable row level security;
create index if not exists leads_sequence_log_company_idx
  on public.leads_sequence_log(company_id,sent_at desc);
