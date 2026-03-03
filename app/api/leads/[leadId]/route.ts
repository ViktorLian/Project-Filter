export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = { params: { leadId: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions as any) as any;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const companyId = (session.user as any).companyId;
  const supabase = createAdminClient();
  const { data: lead, error } = await supabase
    .from('leads')
    .select('*, form:leads_forms(id, name)')
    .eq('id', params.leadId)
    .eq('company_id', companyId)
    .single();
  if (error || !lead) return NextResponse.json({ error: 'Lead ikke funnet' }, { status: 404 });
  const { data: notes } = await supabase
    .from('leads_notes')
    .select('*')
    .eq('lead_id', params.leadId)
    .order('created_at', { ascending: false });
  return NextResponse.json({ lead: { ...lead, notes: notes || [] } });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions as any) as any;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const companyId = (session.user as any).companyId;
  const body = await req.json();
  const ALLOWED = ['status', 'customer_name', 'customer_email', 'customer_phone', 'score', 'salesman_id'];
  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  for (const key of ALLOWED) { if (body[key] !== undefined) updates[key] = body[key]; }
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', params.leadId)
    .eq('company_id', companyId)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lead: data });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions as any) as any;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const companyId = (session.user as any).companyId;
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', params.leadId)
    .eq('company_id', companyId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

