export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAuthorizedCron } from '@/lib/cron-auth';
import { sendEmail } from '@/lib/email';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://flowpilot.no';
const esc = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = createAdminClient();
  const { data: companies, error } = await db
    .from('leads_companies')
    .select('id,name,subscription_status,automation_settings(*)')
    .in('subscription_status', ['active', 'trialing']);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const totals = { sent: 0, failed: 0, skipped: 0 };

  async function deliver(input: {
    companyId: string; type: string; entityId?: string; recipient: string;
    subject: string; html: string; key: string;
  }) {
    const { data: existing } = await db.from('automation_delivery_log')
      .select('id').eq('idempotency_key', input.key).maybeSingle();
    if (existing) { totals.skipped++; return; }
    const result = await sendEmail(input.recipient, input.subject, input.html);
    await db.from('automation_delivery_log').insert({
      company_id: input.companyId,
      automation_type: input.type,
      entity_id: input.entityId || null,
      recipient: input.recipient,
      delivery_status: result.sent ? 'sent' : 'failed',
      provider_message_id: result.sent ? result.id || null : null,
      error_message: result.sent ? null : result.reason,
      idempotency_key: input.key,
    });
    result.sent ? totals.sent++ : totals.failed++;
  }

  for (const company of companies || []) {
    const settings = Array.isArray(company.automation_settings)
      ? company.automation_settings[0]
      : company.automation_settings;
    const cfg = settings || {
      lead_followup_enabled: true, lead_followup_hours: 24,
      proposal_followup_enabled: true, proposal_followup_days: 3,
      reactivation_enabled: false, reactivation_days: 90,
      service_reminders_enabled: true, monthly_report_enabled: true,
    };

    if (cfg.lead_followup_enabled) {
      const cutoff = new Date(Date.now() - cfg.lead_followup_hours * 3600000).toISOString();
      const { data: leads } = await db.from('leads')
        .select('id,customer_name,customer_email,created_at,status')
        .eq('company_id', company.id).ilike('status', 'new')
        .lte('created_at', cutoff).not('customer_email', 'is', null).limit(50);
      for (const lead of leads || []) {
        await deliver({
          companyId: company.id, type: 'lead_followup', entityId: lead.id,
          recipient: lead.customer_email,
          subject: `Oppfølging fra ${company.name}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><h2>Vi følger opp henvendelsen din</h2><p>Hei ${esc(lead.customer_name || 'der')},</p><p>Vi ville bare bekrefte at henvendelsen din er registrert. Svar gjerne på denne e-posten dersom du vil legge til informasjon.</p><p>Med vennlig hilsen<br>${esc(company.name)}</p></div>`,
          key: `lead_followup:${lead.id}:${cfg.lead_followup_hours}`,
        });
      }
    }

    if (cfg.proposal_followup_enabled) {
      const cutoff = new Date(Date.now() - cfg.proposal_followup_days * 86400000).toISOString();
      const { data: proposals } = await db.from('proposals')
        .select('id,title,customer,sent_at,lead:leads(customer_name,customer_email)')
        .eq('company_id', company.id).ilike('status', 'sendt')
        .lte('sent_at', cutoff).limit(50);
      for (const proposal of proposals || []) {
        const lead = proposal.lead as any;
        if (!lead?.customer_email) continue;
        await deliver({
          companyId: company.id, type: 'proposal_followup', entityId: proposal.id,
          recipient: lead.customer_email,
          subject: `Oppfølging på tilbud fra ${company.name}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><h2>Har du spørsmål til tilbudet?</h2><p>Hei ${esc(lead.customer_name || proposal.customer || 'der')},</p><p>Vi følger opp tilbudet «${esc(proposal.title)}». Svar gjerne på denne e-posten dersom noe er uklart eller du ønsker en justering.</p><p>Med vennlig hilsen<br>${esc(company.name)}</p></div>`,
          key: `proposal_followup:${proposal.id}:${cfg.proposal_followup_days}`,
        });
      }
    }

    if (cfg.reactivation_enabled) {
      const cutoff = new Date(Date.now() - cfg.reactivation_days * 86400000).toISOString();
      const { data: customers } = await db.from('customers')
        .select('id,name,email,updated_at,marketing_consent_at,marketing_unsubscribed_at')
        .eq('company_id', company.id).not('marketing_consent_at', 'is', null)
        .is('marketing_unsubscribed_at', null).lte('updated_at', cutoff)
        .not('email', 'is', null).limit(50);
      for (const customer of customers || []) {
        await deliver({
          companyId: company.id, type: 'customer_reactivation', entityId: customer.id,
          recipient: customer.email,
          subject: `Kan ${company.name} hjelpe deg igjen?`,
          html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><p>Hei ${esc(customer.name || 'der')},</p><p>Det er en stund siden sist. Ta gjerne kontakt dersom det er noe vi kan hjelpe deg med.</p><p>Med vennlig hilsen<br>${esc(company.name)}</p></div>`,
          key: `reactivation:${customer.id}:${new Date().getUTCFullYear()}-${new Date().getUTCMonth() + 1}`,
        });
      }
    }

    if (cfg.service_reminders_enabled) {
      const today = new Date().toISOString().slice(0, 10);
      const inThirtyDays = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
      const { data: jobs } = await db.from('jobs')
        .select('id,job_title,service_due_at,customer:customers(name,email)')
        .eq('company_id', company.id).is('service_reminder_sent_at', null)
        .gte('service_due_at', today).lte('service_due_at', inThirtyDays).limit(50);
      for (const job of jobs || []) {
        const customer = job.customer as any;
        if (!customer?.email) continue;
        const resultBefore = totals.sent;
        await deliver({
          companyId: company.id, type: 'service_reminder', entityId: job.id,
          recipient: customer.email,
          subject: `Påminnelse om service fra ${company.name}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><p>Hei ${esc(customer.name || 'der')},</p><p>Det nærmer seg anbefalt service for ${esc(job.job_title || 'arbeidet')} (${esc(job.service_due_at)}). Svar på denne e-posten dersom du ønsker å avtale tid.</p><p>Med vennlig hilsen<br>${esc(company.name)}</p></div>`,
          key: `service_reminder:${job.id}:${job.service_due_at}`,
        });
        if (totals.sent > resultBefore) await db.from('jobs')
          .update({ service_reminder_sent_at: new Date().toISOString() }).eq('id', job.id);
      }
    }

    if (cfg.monthly_report_enabled && new Date().getUTCDate() <= 3) {
      const month = new Date().toISOString().slice(0, 7);
      const start = `${month}-01T00:00:00.000Z`;
      const [ownerResult, leadsResult, jobsResult, reviewsResult] = await Promise.all([
        db.from('users').select('email,name').eq('company_id', company.id).in('role', ['admin','ADMIN','owner','OWNER']).limit(1).maybeSingle(),
        db.from('leads').select('id', { count: 'exact', head: true }).eq('company_id', company.id).gte('created_at', start),
        db.from('jobs').select('id', { count: 'exact', head: true }).eq('company_id', company.id).eq('status', 'completed').gte('completed_at', start),
        db.from('feedback_surveys').select('id', { count: 'exact', head: true }).eq('company_id', company.id).gte('created_at', start),
      ]);
      const owner = ownerResult.data;
      if (owner?.email) await deliver({
        companyId: company.id, type: 'monthly_report', recipient: owner.email,
        subject: `Månedsrapport for ${company.name}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><h2>Resultater denne måneden</h2><p>Nye henvendelser: <strong>${leadsResult.count || 0}</strong><br>Fullførte jobber: <strong>${jobsResult.count || 0}</strong><br>Sendte tilbakemeldingsforespørsler: <strong>${reviewsResult.count || 0}</strong></p><p><a href="${appUrl}/dashboard/analytics">Se hele rapporten i FlowPilot</a></p></div>`,
        key: `monthly_report:${company.id}:${month}`,
      });
    }
  }

  return NextResponse.json({ ok: true, ...totals });
}
