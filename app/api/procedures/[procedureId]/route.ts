import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(req: Request, { params }: { params: { procedureId: string } }) {
  const session = await getServerSession(authOptions);
  const companyId = (session?.user as any)?.companyId;
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const body = await req.json();

  const { error } = await supabase
    .from('procedures')
    .update({ ...body, updated_at: new Date().toISOString(), version: (body.version ?? 1) + 1 })
    .eq('id', params.procedureId)
    .eq('company_id', companyId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: { procedureId: string } }) {
  const session = await getServerSession(authOptions);
  const companyId = (session?.user as any)?.companyId;
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('procedures')
    .delete()
    .eq('id', params.procedureId)
    .eq('company_id', companyId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
