export const dynamic = 'force-dynamic';
import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://flowpilot.no';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions as any) as any;
  if (!session?.user) return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });
  const companyId = session.user.companyId;
  const supabase = createAdminClient();
  const { jobId } = await request.json();
  if (!jobId) return NextResponse.json({ error: 'jobId er påkrevd' }, { status: 400 });

  const { data: job } = await supabase.from('jobs')
    .select('id, job_title, customer_id, company_id, customer:customers(name,email)')
    .eq('id', jobId).eq('company_id', companyId).maybeSingle();
  if (!job) return NextResponse.json({ error: 'Jobb ikke funnet' }, { status: 404 });
  const customer = job.customer as any;
  if (!customer?.email) return NextResponse.json({ error: 'Kunden har ingen e-postadresse' }, { status: 400 });

  const { data: company } = await supabase.from('leads_companies')
    .select('name,google_review_url').eq('id', companyId).maybeSingle();
  const token = randomUUID();
  const { data: survey, error } = await supabase.from('feedback_surveys').upsert({
    job_id: job.id, customer_id: job.customer_id, company_id: companyId,
    survey_token: token, delivery_channel: 'email', delivery_status: 'pending',
    google_review_url: company?.google_review_url || null,
  }, { onConflict: 'job_id' }).select('id,survey_token').single();
  if (error || !survey) return NextResponse.json({ error: error?.message || 'Kunne ikke opprette forespørsel' }, { status: 500 });

  const result = await sendEmail(customer.email, `Hvordan var opplevelsen med ${company?.name || 'oss'}?`,
    `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1e293b"><h2>Vi ønsker din ærlige tilbakemelding</h2><p>Hei ${customer.name || 'der'}. Vurderingen tar under ett minutt og hjelper oss å forbedre tjenesten.</p><p><a href="${appUrl}/survey/${survey.survey_token}" style="display:inline-block;background:#1e40af;color:white;padding:13px 22px;border-radius:8px;text-decoration:none;font-weight:700">Gi tilbakemelding</a></p><p style="font-size:12px;color:#64748b">Sendt via FlowPilot.</p></div>`);
  await supabase.from('feedback_surveys').update({
    sent_at: result.sent ? new Date().toISOString() : null,
    delivery_status: result.sent ? 'sent' : 'configuration_required',
    delivery_error: result.sent ? null : result.reason,
  }).eq('id', survey.id).eq('company_id', companyId);
  return NextResponse.json({ surveyId: survey.id, sent: result.sent, configurationRequired: !result.sent });
}

export async function GET() {
  const session = await getServerSession(authOptions as any) as any;
  if (!session?.user) return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });
  const companyId = session.user.companyId;
  const { data, error } = await createAdminClient().from('feedback_surveys')
    .select('id,survey_token,sent_at,completed_at,question_1_rating,question_2_text,question_3_text,testimonial_display_text,testimonial_approved,delivery_channel,delivery_status,customer:customers(name,email),job:jobs(job_title)')
    .eq('company_id', companyId).order('created_at', { ascending: false }).limit(100);
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ surveys: data || [] });
}
