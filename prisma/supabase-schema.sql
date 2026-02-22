-- Komplett Supabase schema for FlowPilot

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  business_name VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- USER SETTINGS
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alert_email VARCHAR(255) NOT NULL,
  auto_reply_template VARCHAR(20) DEFAULT 'template_1',
  custom_template TEXT,
  score_threshold INTEGER DEFAULT 80,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- LEAD FORMS
CREATE TABLE IF NOT EXISTS lead_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add score_details and answers columns if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='lead_forms' AND column_name='score_details'
    ) THEN
        ALTER TABLE lead_forms ADD COLUMN score_details JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='lead_forms' AND column_name='answers'
    ) THEN
        ALTER TABLE lead_forms ADD COLUMN answers JSONB;
    END IF;
END $$;

-- LEADS
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID,
  form_id UUID,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  score INTEGER,
  status VARCHAR(50) DEFAULT 'new',
  notes TEXT,
  answers JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- LEAD ANALYTICS
CREATE TABLE IF NOT EXISTS lead_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE,
  total_leads INTEGER DEFAULT 0,
  high_quality_leads INTEGER DEFAULT 0,
  avg_score DECIMAL(5,2),
  conversion_count INTEGER DEFAULT 0,
  source_breakdown JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_forms_user_id ON lead_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_form_id ON leads(form_id);
CREATE INDEX IF NOT EXISTS idx_lead_analytics_user_id ON lead_analytics(user_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
USING (auth.uid() = auth_user_id);

-- RLS Policies for user_settings
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
CREATE POLICY "Users can view own settings"
ON user_settings
FOR SELECT
USING (
  user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1)
);

DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
CREATE POLICY "Users can update own settings"
ON user_settings
FOR UPDATE
USING (
  user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1)
);

DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
CREATE POLICY "Users can insert own settings"
ON user_settings
FOR INSERT
WITH CHECK (
  user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1)
);

-- RLS Policies for lead_forms
DROP POLICY IF EXISTS "Users can view own forms" ON lead_forms;
CREATE POLICY "Users can view own forms"
ON lead_forms
FOR SELECT
USING (
  user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1)
);

DROP POLICY IF EXISTS "Users can insert forms" ON lead_forms;
CREATE POLICY "Users can insert forms"
ON lead_forms
FOR INSERT
WITH CHECK (
  user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1)
);

-- RLS Policies for leads
DROP POLICY IF EXISTS "Users can view own leads" ON leads;
CREATE POLICY "Users can view own leads"
ON leads
FOR SELECT
USING (
  user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1)
);

DROP POLICY IF EXISTS "Users can insert leads" ON leads;
CREATE POLICY "Users can insert leads"
ON leads
FOR INSERT
WITH CHECK (
  user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1)
);

-- RLS Policies for lead_analytics
DROP POLICY IF EXISTS "Users can view own analytics" ON lead_analytics;
CREATE POLICY "Users can view own analytics"
ON lead_analytics
FOR SELECT
USING (
  user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1)
);

-- Scoring criteria (from migrations)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='leads_forms' AND column_name='scoring_criteria'
    ) THEN
        ALTER TABLE leads_forms ADD COLUMN scoring_criteria JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='leads' AND column_name='score'
    ) THEN
        ALTER TABLE leads ADD COLUMN score INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='leads' AND column_name='score_details'
    ) THEN
        ALTER TABLE leads ADD COLUMN score_details JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- CUSTOMERS (Mini-CRM)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  total_spent DECIMAL(10,2) DEFAULT 0,
  job_count INTEGER DEFAULT 0,
  days_since_last_contact INTEGER DEFAULT 0,
  notes TEXT,
  customer_tier VARCHAR(50) DEFAULT 'regular',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_user ON customers(user_id);

-- CUSTOMER INTERACTIONS
CREATE TABLE IF NOT EXISTS customer_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50) NOT NULL,
  notes TEXT,
  interaction_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interactions_customer ON customer_interactions(customer_id);

-- RECURRING BOOKINGS
CREATE TABLE IF NOT EXISTS recurring_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  company_id UUID,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  service_type VARCHAR(255) NOT NULL,
  interval_value INTEGER NOT NULL DEFAULT 1,
  interval_unit VARCHAR(20) NOT NULL DEFAULT 'months',
  next_booking_date DATE,
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recurring_customer ON recurring_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_recurring_company ON recurring_bookings(company_id);

-- End of schema
