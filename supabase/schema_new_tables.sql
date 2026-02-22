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
