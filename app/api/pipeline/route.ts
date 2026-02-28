import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  const companyId = (session?.user as any)?.companyId;
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('pipeline_jobs')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const companyId = (session?.user as any)?.companyId;
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const body = await req.json();
  const { title, customer_name, customer_email, customer_phone, stage, value, notes, due_date, assigned_to, lost_reason } = body;

  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });

  const { data, error } = await supabase
    .from('pipeline_jobs')
    .insert({
      company_id: companyId,
      title,
      customer_name: customer_name ?? '',
      customer_email: customer_email ?? '',
      customer_phone: customer_phone ?? '',
      stage: stage ?? 'lead',
      value: Number(value) || 0,
      notes: notes ?? '',
      due_date: due_date || null,
      assigned_to: assigned_to ?? '',
      lost_reason: lost_reason ?? '',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
