-- Create users table (skip if already exists)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  business_name VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create user_settings table (skip if already exists)
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

-- Create form_submissions table (skip if already exists)
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  score INTEGER,
  form_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create stripe_customers table (skip if already exists)
CREATE TABLE IF NOT EXISTS stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create subscriptions table (skip if already exists)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  trial_end_date TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Lead Source Tracking (skip if already exists)
CREATE TABLE IF NOT EXISTS lead_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced Leads Table (skip if already exists)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID,
  form_id UUID,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  score INTEGER,
  source_id UUID REFERENCES lead_sources(id),
  status VARCHAR(50) DEFAULT 'new',
  notes TEXT,
  answers JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Analytics Table (skip if already exists)
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_user_id ON form_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

-- Ensure existing tables have user_id column (safe to run multiple times)
ALTER TABLE IF EXISTS user_settings ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE IF EXISTS form_submissions ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE IF EXISTS stripe_customers ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE IF EXISTS subscriptions ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE IF EXISTS lead_sources ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE IF EXISTS leads ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE IF EXISTS lead_analytics ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE IF EXISTS lead_analysis ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE IF EXISTS lead_groups ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE IF EXISTS followup_campaigns ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE IF EXISTS followup_templates ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE IF EXISTS lead_surveys ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE IF EXISTS subscription_activity ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE IF EXISTS email_campaigns ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE IF EXISTS companies ADD COLUMN IF NOT EXISTS user_id UUID;


-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;
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

-- RLS Policies for form_submissions
DROP POLICY IF EXISTS "Users can view own submissions" ON form_submissions;
CREATE POLICY "Users can view own submissions"
ON form_submissions
FOR SELECT
USING (
  user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1)
);

DROP POLICY IF EXISTS "Users can insert submissions" ON form_submissions;
CREATE POLICY "Users can insert submissions"
ON form_submissions
FOR INSERT
WITH CHECK (
  user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1)
);

-- RLS Policies for lead_sources
DROP POLICY IF EXISTS "Users can view own lead sources" ON lead_sources;
CREATE POLICY "Users can view own lead sources"
ON lead_sources
FOR SELECT
USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1));

DROP POLICY IF EXISTS "Users can manage own lead sources" ON lead_sources;
CREATE POLICY "Users can manage own lead sources"
ON lead_sources
FOR INSERT
WITH CHECK (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1));

-- RLS Policies for leads
DROP POLICY IF EXISTS "Users can view own leads" ON leads;
CREATE POLICY "Users can view own leads"
ON leads
FOR SELECT
USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1));

DROP POLICY IF EXISTS "Users can insert leads" ON leads;
CREATE POLICY "Users can insert leads"
ON leads
FOR INSERT
WITH CHECK (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1));

DROP POLICY IF EXISTS "Users can update own leads" ON leads;
CREATE POLICY "Users can update own leads"
ON leads
FOR UPDATE
USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1));

-- RLS Policies for lead_analytics
DROP POLICY IF EXISTS "Users can view own analytics" ON lead_analytics;
CREATE POLICY "Users can view own analytics"
ON lead_analytics
FOR SELECT
USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1));

-- Additional Tier-3 tables: AI analysis, followups, surveys, churn tracking, campaigns
-- Lead analysis (AI summaries)
CREATE TABLE IF NOT EXISTS lead_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  ai_summary TEXT,
  ai_category VARCHAR(50),
  ai_sentiment VARCHAR(20),
  action_items TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lead groups for auto-grouping
CREATE TABLE IF NOT EXISTS lead_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  group_name VARCHAR(255),
  category VARCHAR(50),
  lead_ids UUID[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Followup campaigns and templates
CREATE TABLE IF NOT EXISTS followup_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  campaign_name VARCHAR(255),
  step INTEGER DEFAULT 1,
  next_send_date TIMESTAMP,
  sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS followup_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  step_number INTEGER,
  days_after_lead INTEGER,
  subject VARCHAR(255),
  body TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lead surveys
CREATE TABLE IF NOT EXISTS lead_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  survey_token VARCHAR(100) UNIQUE,
  sent_date TIMESTAMP,
  response JSONB,
  survey_type VARCHAR(50) DEFAULT 'why_rejected',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscription activity for churn detection
CREATE TABLE IF NOT EXISTS subscription_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  last_login TIMESTAMP,
  last_lead_received TIMESTAMP,
  lead_count_this_month INTEGER DEFAULT 0,
  is_churning_notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Email campaigns for lead groups
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES lead_groups(id) ON DELETE CASCADE,
  campaign_name VARCHAR(255),
  subject VARCHAR(255),
  body TEXT,
  scheduled_date TIMESTAMP,
  sent BOOLEAN DEFAULT FALSE,
  open_rate DECIMAL(5,2),
  click_rate DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_lead_analysis_user_id ON lead_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_groups_user_id ON lead_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_followup_campaigns_user_id ON followup_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_followup_templates_user_id ON followup_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_surveys_token ON lead_surveys(survey_token);
CREATE INDEX IF NOT EXISTS idx_subscription_activity_user_id ON subscription_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_user_id ON email_campaigns(user_id);

-- Enable RLS on new tables
ALTER TABLE lead_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE followup_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE followup_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS policies: restrict by owner (users -> auth_user_id mapping)
DROP POLICY IF EXISTS "Users can manage lead_analysis" ON lead_analysis;
CREATE POLICY "Users can manage lead_analysis" ON lead_analysis FOR ALL USING (
  user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1)
);

DROP POLICY IF EXISTS "Users can manage lead_groups" ON lead_groups;
CREATE POLICY "Users can manage lead_groups" ON lead_groups FOR ALL USING (
  user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1)
);

DROP POLICY IF EXISTS "Users can manage followup_campaigns" ON followup_campaigns;
CREATE POLICY "Users can manage followup_campaigns" ON followup_campaigns FOR ALL USING (
  user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1)
);

DROP POLICY IF EXISTS "Users can manage followup_templates" ON followup_templates;
CREATE POLICY "Users can manage followup_templates" ON followup_templates FOR ALL USING (
  user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1)
);

DROP POLICY IF EXISTS "Users can manage lead_surveys" ON lead_surveys;
CREATE POLICY "Users can manage lead_surveys" ON lead_surveys FOR ALL USING (
  user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1)
);

DROP POLICY IF EXISTS "Users can manage subscription_activity" ON subscription_activity;
CREATE POLICY "Users can manage subscription_activity" ON subscription_activity FOR ALL USING (
  user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1)
);

DROP POLICY IF EXISTS "Users can manage email_campaigns" ON email_campaigns;
CREATE POLICY "Users can manage email_campaigns" ON email_campaigns FOR ALL USING (
  user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1)
);

-- Companies table for white-label chatbot feature
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  website VARCHAR(255),
  phone VARCHAR(20),
  opening_hours TEXT,
  services TEXT,
  primary_color VARCHAR(7) DEFAULT '#3b82f6',
  chatbot_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage companies" ON companies;
CREATE POLICY "Users can manage companies" ON companies FOR ALL USING (
  user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1)
);
