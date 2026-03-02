export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions as any) as any;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user?.id;
  const companyId = session.user?.companyId || userId;
  const body = await req.json();
  const { leadId, message, channel, customerName, customerEmail } = body;

  if (!message?.trim()) return NextResponse.json({ error: 'Melding mangler' }, { status: 400 });

  const supabase = createAdminClient();

  // Get company info for the email
  const { data: company } = await supabase
    .from('leads_companies')
    .select('name, email')
    .eq('user_id', userId)
    .single();

  const companyName = (company as any)?.name || 'FlowPilot';
  const fromEmail = (company as any)?.email || 'noreply@flowpilot.no';

  // Save reply as a note in the DB
  if (leadId) {
    await supabase.from('leads_notes').insert({
      lead_id: leadId,
      user_id: userId,
      content: `[Svar sendt via ${channel ?? 'email'}]: ${message}`,
      created_at: new Date().toISOString(),
    });
  }

  // If email channel and we have the customer's email, send via Resend
  if ((channel === 'email' || !channel) && customerEmail) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${companyName} <onboarding@resend.dev>`,
          to: [customerEmail],
          subject: `Svar fra ${companyName}`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <p>Hei ${customerName ?? ''},</p>
            <div style="background:#f8f9fa;border-left:4px solid #2563eb;padding:16px;border-radius:4px;margin:16px 0">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <p style="color:#6b7280;font-size:14px">Sendt av ${companyName} via FlowPilot</p>
          </div>`,
        }),
      });
    } catch (e) {
      console.error('[INBOX REPLY EMAIL ERROR]', e);
      // Don't fail the request if email sending fails – the note is saved
    }
  }

  return NextResponse.json({ ok: true, savedNote: !!leadId, sentEmail: !!(channel === 'email' && customerEmail) });
}
