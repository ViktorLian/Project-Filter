export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest, { params }: { params: { customerId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('customers')
      .select('*, customer_interactions(*)')
      .eq('id', params.customerId)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ customer: data });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { customerId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('customers')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', params.customerId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ customer: data });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { customerId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createAdminClient();
    await supabase.from('customers').delete().eq('id', params.customerId);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
