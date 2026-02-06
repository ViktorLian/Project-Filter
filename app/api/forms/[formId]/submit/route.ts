import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { scoreForm } from '@/lib/scoring';

export async function POST(
  req: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const body = await req.json();
    const { answers } = body;

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Answers required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get form and company info
    const { data: form } = await supabase
      .from('forms')
      .select('*, questions(*), leads_companies(id, subscription_plan)')
      .eq('id', params.formId)
      .eq('is_active', true)
      .single();

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Check lead limit
    const { checkLimit } = await import('@/lib/subscription');
    const limitCheck = await checkLimit(form.leads_companies.id, 'leads');
    
    if (!limitCheck.canCreate) {
      return NextResponse.json(
        { error: 'Lead limit reached. Please contact the form owner.' },
        { status: 403 }
      );
    }

    // Extract contact info and project details from answers
    const answerValues = Object.values(answers);
    const name = answerValues.find((v: any) => 
      typeof v === 'string' && v.length > 2 && v.length < 100 && !v.includes('@')
    ) as string || 'Unknown';
    
    const email = answerValues.find((v: any) => 
      typeof v === 'string' && v.includes('@')
    ) as string || null;
    
    const phone = answerValues.find((v: any) => 
      typeof v === 'string' && /\d{8,}/.test(v)
    ) as string || null;

    // Calculate score using scoring criteria
    const scoreResult = await scoreForm(params.formId, answers);

    // Create lead with calculated score
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        form_id: form.id,
        company_id: form.company_id,
        name,
        email,
        phone,
        status: 'NEW',
        score: scoreResult.score,
        score_details: scoreResult.details,
        answers,
      })
      .select()
      .single();

    if (leadError || !lead) {
      console.error('[LEAD CREATE ERROR]', leadError);
      throw new Error('Failed to create lead');
    }

    // Store form submission
    const { error: submissionError } = await supabase
      .from('form_submissions')
      .insert({
        form_id: form.id,
        lead_id: lead.id,
        answers,
      });

    if (submissionError) {
      console.error('[SUBMISSION ERROR]', submissionError);
      // Don't fail the request if submission storage fails
    }

    // Send email notification (async, don't block response)
    const { sendLeadNotification } = await import('@/lib/email');
    const { data: users } = await supabase
      .from('leads_users')
      .select('email')
      .eq('company_id', form.company_id)
      .limit(1);
    
    if (users?.[0]?.email) {
      sendLeadNotification({
        name,
        email: email || 'No email provided',
        formName: form.name,
        companyOwnerEmail: users[0].email
      }).catch(err => console.error('Email send failed:', err));
    }

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (e: any) {
    console.error('[FORM SUBMIT ERROR]', e);
    return NextResponse.json(
      { error: e.message || 'Server error' },
      { status: 500 }
    );
  }
}
