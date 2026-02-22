export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';

// GET — list contract reminders
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions as any);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();
  const sessAny = session as any;

  const { searchParams } = new URL(request.url);
  const upcoming = searchParams.get('upcoming') === 'true'; // contracts expiring in next 30 days

  let query = supabase
    .from('contract_reminders')
    .select('*, customer:customers(name, email)')
    .eq('user_id', sessAny?.user?.id)
    .order('end_date', { ascending: true });

  if (upcoming) {
    const in30 = new Date();
    in30.setDate(in30.getDate() + 30);
    query = query.lte('end_date', in30.toISOString().split('T')[0]);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reminders: data || [] });
}

// POST — create contract reminder
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions as any);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();
  const sessAny = session as any;
  const userId = sessAny?.user?.id;

  const body = await request.json();
  const { customerId, contractType, contractName, startDate, endDate } = body;

  if (!contractName || !endDate) {
    return NextResponse.json({ error: 'contractName og endDate er påkrevd' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('contract_reminders')
    .insert({
      user_id: userId,
      customer_id: customerId || null,
      contract_type: contractType || 'Annet',
      contract_name: contractName,
      start_date: startDate || null,
      end_date: endDate,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reminder: data });
}

// PATCH — mark reminder as sent / update
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions as any);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();

  const body = await request.json();
  const { reminderId, sendReminderNow } = body;

  if (sendReminderNow) {
    // Fetch reminder + customer
    const { data: reminder } = await supabase
      .from('contract_reminders')
      .select('*, customer:customers(name, email)')
      .eq('id', reminderId)
      .single();

    if (reminder) {
      const customer = (reminder as any).customer;
      const daysLeft = Math.ceil(
        (new Date(reminder.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (customer?.email) {
        await sendEmail(
          customer.email,
          `Kontrakten din utløper om ${daysLeft} dager – ${reminder.contract_name}`,
          `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
            <h2 style="color:#1e293b">Kontraktpåminnelse</h2>
            <p>Hei ${customer.name},</p>
            <p>Vi vil minne om at kontrakten <strong>${reminder.contract_name}</strong> utløper <strong>${reminder.end_date}</strong> (om ${daysLeft} dager).</p>
            <p>Ta kontakt med oss for å fornye eller diskutere videre samarbeid.</p>
            <p style="color:#94a3b8;font-size:13px">FlowPilot</p>
          </div>`
        );
      }

      await supabase
        .from('contract_reminders')
        .update({ renewal_reminder_sent: true, reminder_sent_date: new Date().toISOString() })
        .eq('id', reminderId);
    }

    return NextResponse.json({ success: true });
  }

  const { error } = await supabase
    .from('contract_reminders')
    .update({ ...body, reminderId: undefined })
    .eq('id', reminderId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions as any);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id påkrevd' }, { status: 400 });

  const { error } = await supabase.from('contract_reminders').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
