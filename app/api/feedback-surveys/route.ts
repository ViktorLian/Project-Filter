export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';

function makeToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// POST /api/feedback-surveys  — send survey for a job
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions as any) as any;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();

  const body = await request.json();
  const { jobId } = body;
  if (!jobId) return NextResponse.json({ error: 'jobId er påkrevd' }, { status: 400 });

  const { data: job, error: jobErr } = await supabase
    .from('jobs')
    .select('*, customer:customers(name, email)')
    .eq('id', jobId)
    .single();

  if (jobErr || !job) return NextResponse.json({ error: 'Jobb ikke funnet' }, { status: 404 });

  const customer = (job as any).customer;
  if (!customer?.email) return NextResponse.json({ error: 'Kunden har ingen e-post' }, { status: 400 });

  const token = makeToken();

  const { data: survey, error: surveyErr } = await supabase
    .from('feedback_surveys')
    .insert({
      job_id: jobId,
      customer_id: job.customer_id,
      survey_token: token,
      sent_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (surveyErr) return NextResponse.json({ error: surveyErr.message }, { status: 500 });

  const surveyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/survey/${token}`;

  await sendEmail(
    customer.email,
    `Hvordan gikk det? Gi oss din tilbakemelding \u2B50`,
    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
      <h2 style="color:#1e293b">Takk for at du valgte oss, ${customer.name}!</h2>
      <p style="color:#475569">Vi h\u00e5per du er forn\u00f8yd med jobben vi utf\u00f8rte: <strong>${job.job_title}</strong>.</p>
      <p style="color:#475569">Din tilbakemelding hjelper oss \u00e5 bli enda bedre. Det tar bare 2 minutter:</p>
      <div style="text-align:center;margin:30px 0">
        <a href="${surveyUrl}" style="background:#2563eb;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block">
          Svar p\u00e5 5 raske sp\u00f8rsm\u00e5l \u2192
        </a>
      </div>
      <p style="color:#94a3b8;font-size:13px">FlowPilot \u2014 automatiser og voks</p>
    </div>`
  );

  return NextResponse.json({ surveyId: (survey as any).id, emailSent: true });
}

// GET /api/feedback-surveys — list surveys for user
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions as any) as any;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();
  const sessAny = session as any;
  const userId = sessAny?.user?.id;

  const { data, error } = await supabase
    .from('feedback_surveys')
    .select('*, job:jobs(job_title, user_id), customer:customers(name, email)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const filtered = (data || []).filter((s: any) => s.job?.user_id === userId);
  return NextResponse.json({ surveys: filtered });
}
