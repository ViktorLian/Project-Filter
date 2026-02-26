export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendReviewRequest } from '@/lib/notifications';

// Runs daily – finds jobs completed 2 days ago and sends review request to customer
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (
    process.env.CRON_SECRET &&
    secret !== process.env.CRON_SECRET &&
    req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Jobs completed ~2 days ago, review email not yet sent
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, job_title, company_id, customer_id, customer:customers(name, email), completed_at')
    .eq('status', 'completed')
    .eq('review_email_sent', false)
    .gte('completed_at', threeDaysAgo)
    .lte('completed_at', twoDaysAgo);

  if (!jobs || jobs.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No jobs ready for review email' });
  }

  const results: string[] = [];

  for (const job of jobs) {
    const customer = job.customer as any;
    if (!customer?.email) continue;

    // Get company google review URL
    const { data: company } = await supabase
      .from('leads_companies')
      .select('name, google_review_url')
      .eq('id', job.company_id)
      .single();

    try {
      await sendReviewRequest(
        customer.email,
        customer.name || '',
        company?.name || 'bedriften',
        company?.google_review_url || null,
      );
      await supabase.from('jobs').update({ review_email_sent: true }).eq('id', job.id);
      results.push(`Review → ${customer.email} (job: ${job.job_title})`);
    } catch (e) {
      console.error(`[CRON] Review email failed for job ${job.id}:`, e);
    }
  }

  return NextResponse.json({ sent: results.length, results });
}
