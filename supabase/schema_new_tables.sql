-- ==============================================================
-- FlowPilot – New tables required for Calendar, Proposals, Follow-up
-- Run this in Supabase:  Dashboard → SQL Editor → New query → paste → Run
-- ==============================================================

-- ──────────────────────────────────────────
-- 1. CALENDAR EVENTS
-- ──────────────────────────────────────────
create table if not exists calendar_events (
  id            uuid        default gen_random_uuid() primary key,
  company_id    uuid        references leads_companies(id) on delete cascade not null,
  title         text        not null,
  date          date        not null,
  time          text,
  type          text        default 'jobb',   -- 'jobb' | 'møte' | 'befaring' | 'privat'
  customer_name text,
  customer_phone text,
  assigned_to   text,
  notes         text,
  notify_sms    boolean     default false,
  notify_email  boolean     default false,
  created_at    timestamptz default now()
);

alter table calendar_events enable row level security;

drop policy if exists "Company members can manage their calendar events" on calendar_events;
create policy "Company members can manage their calendar events"
  on calendar_events for all
  using (
    company_id in (
      select company_id from users where id = auth.uid()
    )
  );

-- ──────────────────────────────────────────
-- 2. PROPOSALS
-- ──────────────────────────────────────────
create table if not exists proposals (
  id          uuid        default gen_random_uuid() primary key,
  company_id  uuid        references leads_companies(id) on delete cascade not null,
  lead_id     uuid        references leads(id) on delete set null,
  title       text        not null,
  customer    text,
  description text,
  line_items  jsonb       default '[]',
  total       numeric     default 0,
  status      text        default 'utkast',  -- 'utkast' | 'sendt' | 'akseptert' | 'avslått'
  sent_at     timestamptz,
  created_at  timestamptz default now()
);

alter table proposals enable row level security;

drop policy if exists "Company members can manage their proposals" on proposals;
create policy "Company members can manage their proposals"
  on proposals for all
  using (
    company_id in (
      select company_id from users where id = auth.uid()
    )
  );

-- ──────────────────────────────────────────
-- 3. FOLLOW-UP TASKS
-- ──────────────────────────────────────────
create table if not exists follow_up_tasks (
  id                 uuid        default gen_random_uuid() primary key,
  company_id         uuid        references leads_companies(id) on delete cascade not null,
  lead_id            uuid        references leads(id) on delete set null,
  customer           text,
  email              text,
  phone              text,
  priority           text        default 'medium',  -- 'low' | 'medium' | 'high'
  suggested_action   text,
  days_since_contact int         default 0,
  done               boolean     default false,
  last_sent          timestamptz,
  created_at         timestamptz default now()
);

alter table follow_up_tasks enable row level security;

drop policy if exists "Company members can manage their follow-up tasks" on follow_up_tasks;
create policy "Company members can manage their follow-up tasks"
  on follow_up_tasks for all
  using (
    company_id in (
      select company_id from users where id = auth.uid()
    )
  );

-- ──────────────────────────────────────────
-- Done! You can verify with:
-- select * from calendar_events limit 1;
-- select * from proposals limit 1;
-- select * from follow_up_tasks limit 1;
-- ──────────────────────────────────────────

-- ==============================================================
-- FlowPilot – Module tables: Tasks, Inventory, Compliance
-- Run this block separately (or together) in Supabase SQL Editor
-- ==============================================================

-- ──────────────────────────────────────────
-- 4. TASKS (Operations Hub)
-- ──────────────────────────────────────────
create table if not exists tasks (
  id           uuid        default gen_random_uuid() primary key,
  company_id   uuid        references leads_companies(id) on delete cascade not null,
  title        text        not null,
  description  text,
  priority     text        default 'medium',  -- 'low' | 'medium' | 'high'
  status       text        default 'todo',    -- 'todo' | 'in_progress' | 'done'
  due_date     date,
  assigned_to  text,
  lead_id      uuid        references leads(id) on delete set null,
  job_id       uuid,
  created_by   text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table tasks enable row level security;

drop policy if exists "Company members can manage their tasks" on tasks;
create policy "Company members can manage their tasks"
  on tasks for all
  using (
    company_id in (
      select company_id from users where id = auth.uid()
    )
  );

-- ──────────────────────────────────────────
-- 5. INVENTORY ITEMS
-- ──────────────────────────────────────────
create table if not exists inventory_items (
  id            uuid        default gen_random_uuid() primary key,
  company_id    uuid        references leads_companies(id) on delete cascade not null,
  name          text        not null,
  sku           text,
  category      text,
  quantity      numeric     default 0,
  unit          text        default 'stk',
  reorder_level numeric     default 5,
  cost_price    numeric,
  location      text,
  supplier      text,
  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table inventory_items enable row level security;

drop policy if exists "Company members can manage their inventory" on inventory_items;
create policy "Company members can manage their inventory"
  on inventory_items for all
  using (
    company_id in (
      select company_id from users where id = auth.uid()
    )
  );

-- ──────────────────────────────────────────
-- 6. COMPLIANCE DOCUMENTS
-- ──────────────────────────────────────────
create table if not exists compliance_documents (
  id          uuid        default gen_random_uuid() primary key,
  company_id  uuid        references leads_companies(id) on delete cascade not null,
  title       text        not null,
  category    text,
  status      text        default 'active',  -- 'active' | 'expiring' | 'expired'
  expiry_date date,
  file_url    text,
  notes       text,
  created_at  timestamptz default now()
);

alter table compliance_documents enable row level security;

drop policy if exists "Company members can manage their compliance docs" on compliance_documents;
create policy "Company members can manage their compliance docs"
  on compliance_documents for all
  using (
    company_id in (
      select company_id from users where id = auth.uid()
    )
  );

-- ──────────────────────────────────────────
-- 7. COMPLIANCE DEVIATIONS (avvikslogg)
-- ──────────────────────────────────────────
create table if not exists compliance_deviations (
  id           uuid        default gen_random_uuid() primary key,
  company_id   uuid        references leads_companies(id) on delete cascade not null,
  title        text        not null,
  description  text,
  severity     text        default 'medium',  -- 'low' | 'medium' | 'high' | 'critical'
  status       text        default 'open',    -- 'open' | 'in_progress' | 'closed'
  reported_by  text,
  created_at   timestamptz default now()
);

alter table compliance_deviations enable row level security;

drop policy if exists "Company members can manage their deviations" on compliance_deviations;
create policy "Company members can manage their deviations"
  on compliance_deviations for all
  using (
    company_id in (
      select company_id from users where id = auth.uid()
    )
  );

-- ──────────────────────────────────────────
-- Existing form/scoring columns (add if missing)
-- ──────────────────────────────────────────
alter table forms add column if not exists score_threshold integer default 80;
alter table questions add column if not exists points integer default 0;
alter table questions add column if not exists option_points jsonb;

-- Trial email tracking columns
alter table leads_companies add column if not exists trial_email_day1  boolean default false;
alter table leads_companies add column if not exists trial_email_day3  boolean default false;
alter table leads_companies add column if not exists trial_email_day7  boolean default false;
alter table leads_companies add column if not exists trial_email_day14 boolean default false;
alter table leads_companies add column if not exists google_review_url text;
alter table leads_companies add column if not exists sms_phone         text;

-- Auth user link
alter table users add column if not exists auth_user_id uuid;

-- ──────────────────────────────────────────
-- 8. PIPELINE JOBS (Jobbpipeline – full workflow)
-- ──────────────────────────────────────────
create table if not exists pipeline_jobs (
  id              uuid        default gen_random_uuid() primary key,
  company_id      uuid        references leads_companies(id) on delete cascade not null,
  lead_id         uuid        references leads(id) on delete set null,
  title           text        not null,
  customer_name   text        default '',
  customer_email  text        default '',
  customer_phone  text        default '',
  stage           text        default 'lead',  -- lead/contacted/proposal/contract/delivery/invoice/won/lost
  value           numeric     default 0,
  notes           text,
  due_date        date,
  assigned_to     text,
  lost_reason     text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table pipeline_jobs enable row level security;

drop policy if exists "Company members can manage their pipeline" on pipeline_jobs;
create policy "Company members can manage their pipeline"
  on pipeline_jobs for all
  using (
    company_id in (
      select company_id from users where id = auth.uid()
    )
  );

-- ──────────────────────────────────────────
-- 9. PROCEDURES (Prosedyre-bank)
-- ──────────────────────────────────────────
create table if not exists procedures (
  id          uuid        default gen_random_uuid() primary key,
  company_id  uuid        references leads_companies(id) on delete cascade not null,
  title       text        not null,
  category    text        default 'Generelt',
  content     text,
  tags        text[]      default '{}',
  responsible text,
  version     integer     default 1,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table procedures enable row level security;

drop policy if exists "Company members can manage their procedures" on procedures;
create policy "Company members can manage their procedures"
  on procedures for all
  using (
    company_id in (
      select company_id from users where id = auth.uid()
    )
  );

-- ──────────────────────────────────────────
-- 10. RISKS (Risiko-register)
-- ──────────────────────────────────────────
create table if not exists risks (
  id          uuid        default gen_random_uuid() primary key,
  company_id  uuid        references leads_companies(id) on delete cascade not null,
  title       text        not null,
  description text,
  category    text        default 'Operasjonell',
  probability integer     default 3,   -- 1–5
  impact      integer     default 3,   -- 1–5
  owner       text,
  status      text        default 'open',  -- open/mitigated/accepted/closed
  mitigation  text,
  created_at  timestamptz default now()
);

alter table risks enable row level security;

drop policy if exists "Company members can manage their risks" on risks;
create policy "Company members can manage their risks"
  on risks for all
  using (
    company_id in (
      select company_id from users where id = auth.uid()
    )
  );

-- ──────────────────────────────────────────
-- Verify all tables:
-- select * from tasks limit 1;
-- select * from inventory_items limit 1;
-- select * from compliance_documents limit 1;
-- select * from compliance_deviations limit 1;
-- select * from pipeline_jobs limit 1;
-- select * from procedures limit 1;
-- select * from risks limit 1;
-- ──────────────────────────────────────────

