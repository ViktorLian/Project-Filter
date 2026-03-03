import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(req: Request, { params }: { params: { riskId: string } }) {
  const session = await getServerSession(authOptions as any) as any;
  const companyId = (session?.user as any)?.companyId;
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const body = await req.json();

  const { error } = await supabase
    .from('risks')
    .update(body)
    .eq('id', params.riskId)
    .eq('company_id', companyId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: { riskId: string } }) {
  const session = await getServerSession(authOptions as any) as any;
  const companyId = (session?.user as any)?.companyId;
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('risks')
    .delete()
    .eq('id', params.riskId)
    .eq('company_id', companyId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
