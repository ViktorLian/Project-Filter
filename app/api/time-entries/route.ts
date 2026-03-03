export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any) as any;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const companyId = (session.user as any).companyId || (session.user as any).id;
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('time_entries')
      .select('*')
      .eq('company_id', companyId)
      .order('date', { ascending: false })
      .limit(200);
    return NextResponse.json({ entries: data || [] });
  } catch (e) {
    return NextResponse.json({ entries: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const companyId = (session.user as any).companyId || (session.user as any).id;
    const body = await req.json();
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        company_id: companyId,
        employee: body.employee || 'Ukjent',
        description: body.description || null,
        date: body.date || new Date().toISOString().slice(0, 10),
        hours: body.hours || 0,
        hourly_rate: body.hourly_rate || 0,
        billable: body.billable !== false,
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ entry: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const supabase = createAdminClient();
    await supabase.from('time_entries').delete().eq('id', id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
