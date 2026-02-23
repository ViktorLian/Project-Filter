export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const companyId = (session.user as any).companyId || (session.user as any).id;
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('company_id', companyId)
      .order('date', { ascending: true });
    return NextResponse.json({ events: data || [] });
  } catch (e) {
    return NextResponse.json({ events: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const companyId = (session.user as any).companyId || (session.user as any).id;
    const body = await req.json();
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        company_id: companyId,
        title: body.title,
        date: body.date,
        time: body.time || null,
        type: body.type || 'job',
        customer_name: body.customer_name || null,
        phone: body.phone || null,
        notes: body.notes || null,
        notify_sms: body.notify_sms || false,
        notify_email: body.notify_email || false,
        assigned_to: body.assigned_to || null,
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, event: data });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
