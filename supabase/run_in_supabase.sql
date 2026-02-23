-- ============================================================
-- FlowPilot – Komplett manglende tabeller
-- KJør dette i Supabase: Dashboard → SQL Editor → New query → Lim inn → Run
-- Det er trygt å kjøre på nytt – alle CREATE bruker IF NOT EXISTS
-- ============================================================

-- ──────────────────────────────────────────
-- 1. LEADS COMPANIES (abonnementer / prøveperiode)
--    id = samme som user.id (slik at companyId fungerer)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads_companies (
  id                   UUID        PRIMARY KEY,
  user_id              UUID        REFERENCES users(id) ON DELETE CASCADE,
  name                 TEXT,
  subscription_status  TEXT        DEFAULT 'trialing',
  subscription_plan    TEXT        DEFAULT 'starter',
  trial_ends_at        TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  stripe_customer_id   TEXT,
  stripe_subscription_id TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Legg til kolonner som kan mangle (trygt å kjøre selv om de finnes)
ALTER TABLE leads_companies ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE leads_companies ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trialing';
ALTER TABLE leads_companies ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'starter';
ALTER TABLE leads_companies ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days');
ALTER TABLE leads_companies ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE leads_companies ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Backfill: lag leads_companies rad for eksisterende brukere som mangler den
INSERT INTO leads_companies (id, name)
SELECT u.id, u.business_name
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM leads_companies lc WHERE lc.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- Fyll inn user_id for rader der det mangler
UPDATE leads_companies SET user_id = id WHERE user_id IS NULL;

-- ──────────────────────────────────────────
-- 2. FORMS (skjemaer i dashbordet)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forms (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID        NOT NULL,
  name        TEXT        NOT NULL,
  description TEXT,
  slug        TEXT        NOT NULL,
  is_active   BOOLEAN     DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS forms_company_slug_idx ON forms(company_id, slug);

-- ──────────────────────────────────────────
-- 3. QUESTIONS (spørsmål i skjemaer)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id       UUID        NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  question_text TEXT        NOT NULL,
  question_type TEXT        NOT NULL DEFAULT 'text',
  options       JSONB,
  required      BOOLEAN     DEFAULT false,
  order_index   INTEGER     DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 4. CALENDAR EVENTS
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS calendar_events (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID        NOT NULL,
  title         TEXT        NOT NULL,
  date          DATE        NOT NULL,
  time          TEXT,
  type          TEXT        DEFAULT 'job',
  customer_name TEXT,
  phone         TEXT,
  notes         TEXT,
  notify_sms    BOOLEAN     DEFAULT false,
  notify_email  BOOLEAN     DEFAULT false,
  assigned_to   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 5. PROPOSALS (tilbud)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proposals (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID        NOT NULL,
  lead_id     UUID,
  title       TEXT        NOT NULL DEFAULT 'Tilbud',
  customer    TEXT,
  description TEXT,
  line_items  JSONB       DEFAULT '[]',
  total       NUMERIC     DEFAULT 0,
  status      TEXT        DEFAULT 'utkast',
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 6. CUSTOMERS (kundedatabase)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id              UUID        NOT NULL,
  user_id                 UUID,
  name                    TEXT        NOT NULL,
  email                   TEXT,
  phone                   TEXT,
  address                 TEXT,
  notes                   TEXT,
  customer_tier           TEXT        DEFAULT 'regular',
  total_spent             NUMERIC     DEFAULT 0,
  job_count               INTEGER     DEFAULT 0,
  days_since_last_contact INTEGER     DEFAULT 0,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_interactions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID        NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type        TEXT        DEFAULT 'note',
  content     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 7. JOBS (jobber / oppdrag)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID,
  company_id      UUID,
  customer_id     UUID        REFERENCES customers(id) ON DELETE SET NULL,
  job_title       TEXT        NOT NULL,
  job_date        DATE,
  revenue         NUMERIC     DEFAULT 0,
  cost            NUMERIC     DEFAULT 0,
  status          TEXT        DEFAULT 'active',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_expenses (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      UUID        NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  category    TEXT        DEFAULT 'Annet',
  amount      NUMERIC     DEFAULT 0,
  description TEXT,
  receipt_url TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 8. INVOICES (fakturaer)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoice_customers (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID        NOT NULL,
  name        TEXT        NOT NULL,
  email       TEXT,
  address     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   UUID        NOT NULL,
  customer_id  UUID        REFERENCES invoice_customers(id) ON DELETE SET NULL,
  status       TEXT        DEFAULT 'DRAFT',
  amount       NUMERIC     NOT NULL DEFAULT 0,
  due_date     DATE        NOT NULL,
  issued_date  DATE        NOT NULL,
  description  TEXT,
  invoice_number TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 9. FOLLOW-UP TASKS
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follow_up_tasks (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID        NOT NULL,
  lead_id             UUID,
  customer            TEXT,
  email               TEXT,
  phone               TEXT,
  priority            TEXT        DEFAULT 'medium',
  suggested_action    TEXT,
  days_since_contact  INT         DEFAULT 0,
  done                BOOLEAN     DEFAULT false,
  last_sent           TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 10. FEEDBACK SURVEYS (tilbakemeldinger + anmeldelser)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback_surveys (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id              UUID        NOT NULL,
  job_id                  UUID        REFERENCES jobs(id) ON DELETE SET NULL,
  customer_id             UUID        REFERENCES customers(id) ON DELETE SET NULL,
  customer_email          TEXT,
  customer_name           TEXT,
  token                   TEXT        UNIQUE DEFAULT gen_random_uuid()::text,
  question_1_rating       INTEGER,
  question_2_text         TEXT,
  question_3_recommend    BOOLEAN,
  testimonial_display_text TEXT,
  testimonial_approved    BOOLEAN     DEFAULT false,
  completed_at            TIMESTAMPTZ,
  sent_at                 TIMESTAMPTZ DEFAULT NOW(),
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 11. CAMPAIGN TRACKING
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID        NOT NULL,
  name        TEXT        NOT NULL,
  type        TEXT        DEFAULT 'email',
  status      TEXT        DEFAULT 'draft',
  subject     TEXT,
  body        TEXT,
  target_list JSONB       DEFAULT '[]',
  sent_count  INTEGER     DEFAULT 0,
  open_count  INTEGER     DEFAULT 0,
  click_count INTEGER     DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 12. CONTRACT REMINDERS
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contract_reminders (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID        NOT NULL,
  customer_name   TEXT,
  customer_email  TEXT,
  customer_phone  TEXT,
  contract_type   TEXT,
  renewal_date    DATE,
  reminder_days   INTEGER     DEFAULT 30,
  notes           TEXT,
  status          TEXT        DEFAULT 'pending',
  last_sent_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 13. TIME TRACKING (timer for ansatte/oppdrag)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS time_entries (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID        NOT NULL,
  user_id     UUID,
  job_id      UUID        REFERENCES jobs(id) ON DELETE SET NULL,
  employee    TEXT,
  description TEXT,
  date        DATE        NOT NULL DEFAULT CURRENT_DATE,
  hours       NUMERIC     DEFAULT 0,
  hourly_rate NUMERIC     DEFAULT 0,
  billable    BOOLEAN     DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 14. NEWSLETTER SUBSCRIBERS
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT        UNIQUE NOT NULL,
  name        TEXT,
  source      TEXT        DEFAULT 'landing',
  status      TEXT        DEFAULT 'active',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 15. LEAD ANALYSIS (AI analyse-resultater)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lead_analysis (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID,
  company_id  UUID,
  analysis    JSONB,
  category    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 16. TEAM MEMBERS (ansatte som deler bedriften)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID        NOT NULL,
  user_id       UUID,
  email         TEXT        NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'member',
  status        TEXT        NOT NULL DEFAULT 'pending',
  invite_token  TEXT        UNIQUE NOT NULL,
  accepted_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS team_members_company_email_idx ON team_members(company_id, email);

-- ──────────────────────────────────────────
-- RLS: aktiver row-level security
-- (bruker admin-klient fra backend så dette er ok å ha)
-- ──────────────────────────────────────────
ALTER TABLE forms             ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices          ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_tasks   ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_surveys  ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns         ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads_companies   ENABLE ROW LEVEL SECURITY;

-- Backend bruker service_role key som bypasser RLS, så ingen policies trengs
-- for admin-klienten. Men for sikkerhets skyld, legg til deny-all:

-- Ferdig!
-- Verifiser med:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
