import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const companyId = (session.user as any).companyId;
    const body = await req.json();
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('follow_up_tasks')
      .update(body)
      .eq('id', params.id)
      .eq('company_id', companyId)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const companyId = (session.user as any).companyId;
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('follow_up_tasks')
      .delete()
      .eq('id', params.id)
      .eq('company_id', companyId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
