-- Add scoring_criteria to forms table
ALTER TABLE public.forms 
ADD COLUMN IF NOT EXISTS scoring_criteria JSONB DEFAULT '{}'::jsonb;

-- Add score column to leads table if not exists
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;

-- Add score_details column to leads table to store breakdown
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS score_details JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.forms.scoring_criteria IS 'JSON object mapping question IDs to scoring rules';
COMMENT ON COLUMN public.leads.score IS 'Calculated score from 0-100 based on form criteria';
COMMENT ON COLUMN public.leads.score_details IS 'Breakdown of how score was calculated per question';
