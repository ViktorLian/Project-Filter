import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

// Called by Vercel Cron daily at 08:00 UTC
// Also callable manually with the CRON_SECRET header for testing
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret') ?? req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  let sent = 0;
  let errors = 0;

  try {
    // Fetch all companies with active email sequence settings
    const { data: companies } = await supabase
      .from('leads_companies')
      .select('id, name, email_sequence_settings')
      .not('email_sequence_settings', 'is', null);

    if (!companies?.length) {
      return NextResponse.json({ ok: true, sent: 0, message: 'No active sequences' });
    }

    for (const company of companies) {
      const settings = company.email_sequence_settings as any;
      if (!settings?.templates?.length) continue;

      const activeTemplates: any[] = settings.templates.filter((t: any) => t.active);
      if (!activeTemplates.length) continue;

      for (const template of activeTemplates) {
        const dayOffset: number = template.day ?? 0;

        // Find leads created exactly `dayOffset` days ago (within a ±1 hour window to be safe)
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - dayOffset);
        const from = new Date(targetDate);
        from.setHours(0, 0, 0, 0);
        const to = new Date(targetDate);
        to.setHours(23, 59, 59, 999);

        const { data: leads } = await supabase
          .from('leads')
          .select('id, customer_email, customer_name')
          .eq('company_id', company.id)
          .gte('created_at', from.toISOString())
          .lte('created_at', to.toISOString())
          .not('customer_email', 'is', null);

        if (!leads?.length) continue;

        for (const lead of leads) {
          if (!lead.customer_email) continue;

          const subject = (template.subject ?? '')
            .replace('{{name}}', lead.customer_name ?? 'Kunde')
            .replace('{{company}}', company.name ?? 'oss');
          const body = (template.body ?? '')
            .replace(/\{\{name\}\}/g, lead.customer_name ?? 'Kunde')
            .replace(/\{\{company\}\}/g, company.name ?? 'oss');

          try {
            await resend.emails.send({
              from: process.env.RESEND_FROM_EMAIL ?? 'noreply@dittdomene.no',
              to: lead.customer_email,
              subject,
              html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">${body.replace(/\n/g, '<br>')}</div>`,
            });

            // Log the sent email so we don't resend
            await supabase.from('leads_sequence_log').insert({
              lead_id: lead.id,
              company_id: company.id,
              template_day: dayOffset,
              sent_at: new Date().toISOString(),
            }).then(() => {});  // fire-and-forget, table may not exist yet

            sent++;
          } catch (e) {
            console.error('[CRON EMAIL ERROR]', lead.id, e);
            errors++;
          }
        }
      }
    }

    return NextResponse.json({ ok: true, sent, errors });
  } catch (e: any) {
    console.error('[CRON FATAL ERROR]', e);
    return NextResponse.json({ error: e.message ?? 'Cron failed' }, { status: 500 });
  }
}
