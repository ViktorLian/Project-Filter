export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';

// GET /api/lost-leads — find dormant leads (no activity in X days)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions as any) as any;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();
  const sessAny = session as any;
  const userId = sessAny?.user?.id;
  const companyId = sessAny?.user?.companyId || userId;

  const { searchParams } = new URL(request.url);
  const dormantDays = parseInt(searchParams.get('days') || '30');

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - dormantDays);

  const { data, error } = await supabase
    .from('leads')
    .select('id, customer_name, customer_email, customer_phone, status, score, created_at, updated_at')
    .eq('company_id', companyId)
    .in('status', ['new', 'contacted', 'qualified'])
    .lt('updated_at', cutoff.toISOString())
    .order('score', { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const lostLeads = (data || []).map((lead: any) => ({
    ...lead,
    daysDormant: Math.floor(
      (Date.now() - new Date(lead.updated_at).getTime()) / (1000 * 60 * 60 * 24)
    ),
  }));

  return NextResponse.json({ lostLeads, total: lostLeads.length });
}

// POST /api/lost-leads — trigger re-engagement campaign for selected leads
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions as any) as any;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();
  const sessAny = session as any;
  const userId = sessAny?.user?.id;
  const companyId = sessAny?.user?.companyId || userId;

  const body = await request.json();
  const { leadIds, message, subject } = body as {
    leadIds: string[];
    message?: string;
    subject?: string;
  };

  if (!leadIds || leadIds.length === 0) {
    return NextResponse.json({ error: 'Ingen leads valgt' }, { status: 400 });
  }

  // Fetch lead data
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, customer_name, customer_email, status')
    .in('id', leadIds)
    .eq('company_id', companyId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  let failed = 0;

  for (const lead of leads || []) {
    if (!lead.customer_email) { failed++; continue; }

    const emailSubject = subject || `Vi tenkte på deg, ${lead.customer_name} – fortsatt interessert?`;
    const emailHtml = message
      ? `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
           <p>Hei ${lead.customer_name},</p>
           <p>${message}</p>
           <p style="color:#94a3b8;font-size:13px">FlowPilot</p>
         </div>`
      : `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
           <h2 style="color:#1e293b">Hei ${lead.customer_name} 👋</h2>
           <p style="color:#475569">Vi la merke til at vi ikke har hørt fra deg på en stund.</p>
           <p style="color:#475569">Er du fortsatt interessert? Vi har kanskje noe som passer deg perfekt akkurat nå.</p>
           <p style="color:#475569">Ta kontakt – vi hjelper deg gjerne videre.</p>
           <p style="color:#94a3b8;font-size:13px">FlowPilot — automatiser og voks</p>
         </div>`;

    try {
      await sendEmail(lead.customer_email, emailSubject, emailHtml);
      // Update lead status + timestamp
      await supabase
        .from('leads')
        .update({ status: 'reengaged', updated_at: new Date().toISOString() })
        .eq('id', lead.id);
      sent++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ sent, failed, total: (leads || []).length });
}
