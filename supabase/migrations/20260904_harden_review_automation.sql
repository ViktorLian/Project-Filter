
alter table public.feedback_surveys
  add column if not exists company_id uuid references public.leads_companies(id) on delete cascade,
  add column if not exists delivery_channel text not null default 'email',
  add column if not exists delivery_status text not null default 'pending',
  add column if not exists delivery_error text,
  add column if not exists google_review_url text;

update public.feedback_surveys fs
set company_id = j.company_id
from public.jobs j
where fs.job_id = j.id and fs.company_id is null;

create unique index if not exists feedback_surveys_job_unique
  on public.feedback_surveys(job_id) where job_id is not null;
create unique index if not exists feedback_surveys_token_unique
  on public.feedback_surveys(survey_token);

create table if not exists public.review_automation_settings (
  company_id uuid primary key references public.leads_companies(id) on delete cascade,
  enabled boolean not null default false,
  email_enabled boolean not null default true,
  sms_enabled boolean not null default false,
  delay_hours integer not null default 48 check (delay_hours between 0 and 720),
  google_review_url text,
  website_widget_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.review_automation_settings enable row level security;

drop policy if exists "review_settings_company_access" on public.review_automation_settings;
create policy "review_settings_company_access"
on public.review_automation_settings
for all
to authenticated
using (
  company_id in (
    select u.company_id from public.users u where u.auth_user_id = auth.uid()
  )
)
with check (
  company_id in (
    select u.company_id from public.users u where u.auth_user_id = auth.uid()
  )
);

create index if not exists feedback_surveys_company_created_idx
  on public.feedback_surveys(company_id, created_at desc);
create index if not exists jobs_review_queue_idx
  on public.jobs(company_id, completed_at)
  where status = 'completed' and review_email_sent = false;
