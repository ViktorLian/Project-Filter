import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAuthorizedCron } from '@/lib/cron-auth';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = createAdminClient();
  let sent = 0, failed = 0, skipped = 0;

  const { data: companies, error } = await db.from('leads_companies')
    .select('id,name,email_sequence_settings')
    .in('subscription_status', ['active', 'trialing'])
    .not('email_sequence_settings', 'is', null);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  for (const company of companies || []) {
    const templates = ((company.email_sequence_settings as any)?.templates || [])
      .filter((template: any) => template.active);
    for (const template of templates) {
      const day = Number(template.day || 0);
      const target = new Date(Date.now() - day * 86400000);
      const from = new Date(target); from.setUTCHours(0, 0, 0, 0);
      const to = new Date(target); to.setUTCHours(23, 59, 59, 999);
      const { data: leads } = await db.from('leads')
        .select('id,customer_email,customer_name')
        .eq('company_id', company.id)
        .gte('created_at', from.toISOString()).lte('created_at', to.toISOString())
        .not('customer_email', 'is', null).limit(100);

      for (const lead of leads || []) {
        const { data: logged } = await db.from('leads_sequence_log')
          .select('id').eq('lead_id', lead.id).eq('template_day', day).maybeSingle();
        if (logged) { skipped++; continue; }

        const name = lead.customer_name || 'Kunde';
        const subject = String(template.subject || '').replace(/\{\{name\}\}/g, name).replace(/\{\{company\}\}/g, company.name);
        const body = String(template.body || '').replace(/\{\{name\}\}/g, name).replace(/\{\{company\}\}/g, company.name);
        const result = await sendEmail(lead.customer_email, subject,
          `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">${body.replace(/\n/g, '<br>')}</div>`);
        if (!result.sent) { failed++; continue; }
        const { error: logError } = await db.from('leads_sequence_log').insert({
          lead_id: lead.id, company_id: company.id, template_day: day,
          sent_at: new Date().toISOString(),
        });
        logError ? failed++ : sent++;
      }
    }
  }
  return NextResponse.json({ ok: failed === 0, sent, failed, skipped });
}
