export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { customerId, serviceType, interval, intervalUnit, nextBookingDate, notes } = await req.json();
    if (!customerId || !serviceType || !nextBookingDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: recurring, error } = await supabase
      .from('recurring_bookings')
      .insert({
        customer_id: customerId,
        service_type: serviceType,
        interval_value: interval || 1,
        interval_unit: intervalUnit || 'months',
        next_booking_date: nextBookingDate,
        notes: notes || null,
        active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Create first booking
    await supabase.from('bookings').insert({
      customer_id: customerId,
      booking_date: nextBookingDate,
      service_type: serviceType,
      recurring_booking_id: recurring.id,
      status: 'scheduled',
      notes: notes || null,
    });

    // Send confirmation email
    const { data: customer } = await supabase
      .from('customers')
      .select('email, name')
      .eq('id', customerId)
      .single();

    if (customer?.email) {
      await sendEmail(
        customer.email,
        'Gjentagende tjeneste bekreftet',
        `<div style="font-family:sans-serif;max-width:500px">
          <h2>Gjentagende tjeneste er satt opp</h2>
          <p>Hei ${customer.name},</p>
          <p>Din gjentagende <strong>${serviceType}</strong>-tjeneste er bekreftet.</p>
          <p><strong>Intervall:</strong> Hver ${interval} ${intervalUnit === 'days' ? 'dag' : intervalUnit === 'weeks' ? 'uke' : 'måned'}</p>
          <p><strong>Første avtale:</strong> ${new Date(nextBookingDate).toLocaleDateString('nb-NO')}</p>
          <p>Du vil motta en påminnelse før hver avtale.</p>
        </div>`
      ).catch(e => console.error('[RECURRING EMAIL ERROR]', e));
    }

    return NextResponse.json({ recurringBookingId: recurring.id }, { status: 201 });
  } catch (e) {
    console.error('[CREATE RECURRING BOOKING ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');

    const supabase = createAdminClient();
    let query = supabase.from('recurring_bookings').select('*').eq('active', true);
    if (customerId) query = query.eq('customer_id', customerId);

    const { data, error } = await query.order('next_booking_date', { ascending: true });
    if (error) throw error;
    return NextResponse.json({ recurringBookings: data });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
