export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const companyId = (session.user as any).companyId;
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all';

    const supabase = createAdminClient();
    let query = supabase
      .from('customers')
      .select('*')
      .eq('company_id', companyId)
      .order('total_spent', { ascending: false });

    if (filter === 'vip') query = query.gt('total_spent', 10000);
    else if (filter === 'active') query = query.lte('days_since_last_contact', 30);
    else if (filter === 'inactive') query = query.gt('days_since_last_contact', 90);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ customers: data });
  } catch (e) {
    console.error('[GET CUSTOMERS ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const companyId = (session.user as any).companyId;
    const userId = (session.user as any).id;
    const body = await req.json();
    const { name, email, phone, notes } = body;

    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('customers')
      .insert({
        company_id: companyId,
        user_id: userId,
        name,
        email: email || null,
        phone: phone || null,
        notes: notes || null,
        customer_tier: 'regular',
        total_spent: 0,
        job_count: 0,
        days_since_last_contact: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ customer: data }, { status: 201 });
  } catch (e) {
    console.error('[CREATE CUSTOMER ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
