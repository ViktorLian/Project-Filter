-- LEADS DATABASE SCHEMA (med prefixes for å unngå konflikt med byggsjekk)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Leads companies table
CREATE TABLE IF NOT EXISTS public.leads_companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads users table
CREATE TABLE IF NOT EXISTS public.leads_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'OWNER', 'ADMIN')),
  company_id UUID REFERENCES public.leads_companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.leads_companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  project_type TEXT,
  budget TEXT,
  timeline TEXT,
  status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST')),
  risk_level TEXT,
  score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS public.leads_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.leads_users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forms table
CREATE TABLE IF NOT EXISTS public.leads_forms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.leads_companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, slug)
);

-- Questions table
CREATE TABLE IF NOT EXISTS public.leads_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  form_id UUID REFERENCES public.leads_forms(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('text', 'textarea', 'number', 'select', 'radio', 'checkbox')),
  options JSONB,
  required BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Form submissions
CREATE TABLE IF NOT EXISTS public.leads_form_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  form_id UUID REFERENCES public.leads_forms(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_users_email ON public.leads_users(email);
CREATE INDEX IF NOT EXISTS idx_leads_users_company ON public.leads_users(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_company ON public.leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_notes_lead ON public.leads_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_forms_company ON public.leads_forms(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_questions_form ON public.leads_questions(form_id);

-- Enable RLS
ALTER TABLE public.leads_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads_form_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (NO RECURSION, using auth.uid() directly)
DROP POLICY IF EXISTS "Leads users can view own profile" ON public.leads_users;
CREATE POLICY "Leads users can view own profile" ON public.leads_users 
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Leads users can view company" ON public.leads_companies;
CREATE POLICY "Leads users can view company" ON public.leads_companies 
  FOR SELECT USING (id IN (SELECT company_id FROM public.leads_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Leads users can view leads" ON public.leads;
CREATE POLICY "Leads users can view leads" ON public.leads 
  FOR SELECT USING (company_id IN (SELECT company_id FROM public.leads_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Leads users can create leads" ON public.leads;
CREATE POLICY "Leads users can create leads" ON public.leads 
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM public.leads_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Leads users can update leads" ON public.leads;
CREATE POLICY "Leads users can update leads" ON public.leads 
  FOR UPDATE USING (company_id IN (SELECT company_id FROM public.leads_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Leads users can create notes" ON public.leads_notes;
CREATE POLICY "Leads users can create notes" ON public.leads_notes 
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Leads users can view notes" ON public.leads_notes;
CREATE POLICY "Leads users can view notes" ON public.leads_notes 
  FOR SELECT USING (lead_id IN (SELECT id FROM public.leads WHERE company_id IN (SELECT company_id FROM public.leads_users WHERE id = auth.uid())));

DROP POLICY IF EXISTS "Leads users can view forms" ON public.leads_forms;
CREATE POLICY "Leads users can view forms" ON public.leads_forms 
  FOR SELECT USING (company_id IN (SELECT company_id FROM public.leads_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Leads users can create forms" ON public.leads_forms;
CREATE POLICY "Leads users can create forms" ON public.leads_forms 
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM public.leads_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Public can view active forms" ON public.leads_forms;
CREATE POLICY "Public can view active forms" ON public.leads_forms 
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view questions" ON public.leads_questions;
CREATE POLICY "Public can view questions" ON public.leads_questions 
  FOR SELECT USING (form_id IN (SELECT id FROM public.leads_forms WHERE is_active = true));

DROP POLICY IF EXISTS "Leads users can manage questions" ON public.leads_questions;
CREATE POLICY "Leads users can manage questions" ON public.leads_questions 
  FOR ALL USING (form_id IN (SELECT id FROM public.leads_forms WHERE company_id IN (SELECT company_id FROM public.leads_users WHERE id = auth.uid())));

DROP POLICY IF EXISTS "Public can submit forms" ON public.leads_form_submissions;
CREATE POLICY "Public can submit forms" ON public.leads_form_submissions 
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Leads users can view submissions" ON public.leads_form_submissions;
CREATE POLICY "Leads users can view submissions" ON public.leads_form_submissions 
  FOR SELECT USING (form_id IN (SELECT id FROM public.leads_forms WHERE company_id IN (SELECT company_id FROM public.leads_users WHERE id = auth.uid())));
