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
    .from('risks')
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
  const { title, description, category, probability, impact, owner, status, mitigation } = body;

  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });

  const { data, error } = await supabase
    .from('risks')
    .insert({
      company_id: companyId,
      title,
      description: description ?? '',
      category: category ?? 'Operasjonell',
      probability: Number(probability) || 3,
      impact: Number(impact) || 3,
      owner: owner ?? '',
      status: status ?? 'open',
      mitigation: mitigation ?? '',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
