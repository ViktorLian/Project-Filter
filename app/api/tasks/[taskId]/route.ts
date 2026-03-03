import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { taskId: string } }) {
  const session = await getServerSession(authOptions as any) as any;
  const companyId = (session?.user as any)?.companyId;
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('tasks')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', params.taskId)
    .eq('company_id', companyId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task: data });
}

export async function DELETE(req: NextRequest, { params }: { params: { taskId: string } }) {
  const session = await getServerSession(authOptions as any) as any;
  const companyId = (session?.user as any)?.companyId;
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', params.taskId)
    .eq('company_id', companyId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
