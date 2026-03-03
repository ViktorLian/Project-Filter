import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions as any) as any;
  const companyId = (session?.user as any)?.companyId;
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('company_id', companyId)
    .order('name', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions as any) as any;
  const companyId = (session?.user as any)?.companyId;
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, sku, category, quantity, unit, reorder_level, cost_price, location, supplier, notes } = body;
  if (!name) return NextResponse.json({ error: 'Navn er påkrevd' }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('inventory_items')
    .insert({
      company_id: companyId,
      name, sku, category,
      quantity: quantity ?? 0,
      unit: unit ?? 'stk',
      reorder_level: reorder_level ?? 5,
      cost_price: cost_price ?? null,
      location: location ?? null,
      supplier: supplier ?? null,
      notes: notes ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}
