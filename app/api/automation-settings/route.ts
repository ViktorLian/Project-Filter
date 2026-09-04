import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
const allowed = [
  'lead_followup_enabled','lead_followup_hours','proposal_followup_enabled',
  'proposal_followup_days','reactivation_enabled','reactivation_days',
  'service_reminders_enabled','monthly_report_enabled',
] as const;

async function companyId() {
  const session = await getServerSession(authOptions as any) as any;
  return session?.user?.companyId as string | undefined;
}

export async function GET() {
  const id = await companyId();
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = createAdminClient();
  await db.from('automation_settings').upsert({ company_id: id }, { onConflict: 'company_id', ignoreDuplicates: true });
  const [{ data: settings, error }, { data: recent }] = await Promise.all([
    db.from('automation_settings').select('*').eq('company_id', id).single(),
    db.from('automation_delivery_log').select('automation_type,delivery_status,created_at')
      .eq('company_id', id).order('created_at', { ascending: false }).limit(20),
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings, recent: recent || [] });
}

export async function PUT(req: NextRequest) {
  const id = await companyId();
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const input = await req.json();
  const update: Record<string, boolean | number | string> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (typeof input[key] === 'boolean' || typeof input[key] === 'number') update[key] = input[key];
  }
  const db = createAdminClient();
  const { data, error } = await db.from('automation_settings')
    .upsert({ company_id: id, ...update }, { onConflict: 'company_id' }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ settings: data });
}
