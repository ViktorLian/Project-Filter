export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  sendTrialDay1,
  sendTrialDay3,
  sendTrialDay7,
  sendTrialDay14,
} from '@/lib/notifications';

// Called by Vercel Cron every day at 09:00 CET
// Also callable manually: GET /api/cron/trial-emails?secret=CRON_SECRET
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

  // Get all companies with their admin user and trial start date
  const { data: companies } = await supabase
    .from('leads_companies')
    .select('id, name, created_at, subscription_status, trial_email_day1, trial_email_day3, trial_email_day7, trial_email_day14')
    .in('subscription_status', ['trial', 'active']);

  if (!companies || companies.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No companies found' });
  }

  const now = new Date();
  const results: string[] = [];

  for (const company of companies) {
    const createdAt = new Date(company.created_at);
    const daysSince = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    // Get admin user email + name
    const { data: admin } = await supabase
      .from('users')
      .select('email, name')
      .eq('company_id', company.id)
      .eq('role', 'admin')
      .single();

    if (!admin?.email) continue;

    try {
      if (daysSince >= 0 && !company.trial_email_day1) {
        await sendTrialDay1(admin.email, admin.name || '');
        await supabase.from('leads_companies').update({ trial_email_day1: true }).eq('id', company.id);
        results.push(`Day1 → ${admin.email}`);
      } else if (daysSince >= 3 && !company.trial_email_day3) {
        await sendTrialDay3(admin.email, admin.name || '');
        await supabase.from('leads_companies').update({ trial_email_day3: true }).eq('id', company.id);
        results.push(`Day3 → ${admin.email}`);
      } else if (daysSince >= 7 && !company.trial_email_day7) {
        await sendTrialDay7(admin.email, admin.name || '');
        await supabase.from('leads_companies').update({ trial_email_day7: true }).eq('id', company.id);
        results.push(`Day7 → ${admin.email}`);
      } else if (daysSince >= 13 && !company.trial_email_day14) {
        await sendTrialDay14(admin.email, admin.name || '');
        await supabase.from('leads_companies').update({ trial_email_day14: true }).eq('id', company.id);
        results.push(`Day14 → ${admin.email}`);
      }
    } catch (e) {
      console.error(`[CRON] Failed for ${admin.email}:`, e);
    }
  }

  return NextResponse.json({ sent: results.length, results });
}
