-- ===============================================
-- PROJECTFILTER (LEADS) DATABASE - SQL MIGRATION
-- ===============================================
-- Kjør denne i Supabase for ProjectFilter
-- URL: https://supabase.com/dashboard/project/cfzyflspnniwlkjqsmzk/sql

-- Add scoring columns to forms table
ALTER TABLE public.forms 
ADD COLUMN IF NOT EXISTS scoring_criteria JSONB DEFAULT '{}'::jsonb;

-- Add columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS form_id UUID REFERENCES public.forms(id);

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS score_details JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '{}'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN public.forms.scoring_criteria IS 'JSON mapping question IDs to scoring rules';
COMMENT ON COLUMN public.leads.score IS 'Calculated score 0-100 based on form criteria';
COMMENT ON COLUMN public.leads.score_details IS 'Breakdown of score calculation per question';
COMMENT ON COLUMN public.leads.answers IS 'Form submission answers as JSON';
