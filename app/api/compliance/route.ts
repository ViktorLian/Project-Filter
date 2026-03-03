import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// GET all documents + deviations for the company
export async function GET() {
  const session = await getServerSession(authOptions as any) as any;
  const companyId = (session?.user as any)?.companyId;
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();

  const [docsResult, devsResult] = await Promise.all([
    supabase
      .from('compliance_documents')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false }),
    supabase
      .from('compliance_deviations')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false }),
  ]);

  return NextResponse.json({
    documents: docsResult.data ?? [],
    deviations: devsResult.data ?? [],
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions as any) as any;
  const companyId = (session?.user as any)?.companyId;
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { type } = body;
  const supabase = createAdminClient();

  if (type === 'document') {
    const { title, category, status, expiry_date, file_url, notes } = body;
    if (!title) return NextResponse.json({ error: 'Tittel er påkrevd' }, { status: 400 });
    const { data, error } = await supabase
      .from('compliance_documents')
      .insert({ company_id: companyId, title, category, status: status ?? 'active', expiry_date: expiry_date || null, file_url: file_url || null, notes: notes || null })
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ document: data });
  }

  if (type === 'deviation') {
    const { title, description, severity, reported_by } = body;
    if (!title) return NextResponse.json({ error: 'Tittel er påkrevd' }, { status: 400 });
    const { data, error } = await supabase
      .from('compliance_deviations')
      .insert({ company_id: companyId, title, description, severity: severity ?? 'medium', status: 'open', reported_by: reported_by || null })
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ deviation: data });
  }

  return NextResponse.json({ error: 'Ugyldig type' }, { status: 400 });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions as any) as any;
  const companyId = (session?.user as any)?.companyId;
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { type, id, ...updates } = body;
  const supabase = createAdminClient();

  const table = type === 'document' ? 'compliance_documents' : 'compliance_deviations';
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq('id', id)
    .eq('company_id', companyId)
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}
