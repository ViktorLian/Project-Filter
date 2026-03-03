export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

// GET: return saved sequence settings (active flags + custom bodies) for the company
export async function GET() {
  const session = await getServerSession(authOptions as any) as any;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('leads_companies')
    .select('email_sequence_settings')
    .eq('user_id', userId)
    .single();

  return NextResponse.json({ settings: (data as any)?.email_sequence_settings ?? {} });
}

// PATCH: save updated settings
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions as any) as any;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;
  const body = await req.json(); // { settings: { velkomst: { active: true, steps: [{...}] }, ... } }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('leads_companies')
    .update({ email_sequence_settings: body.settings, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
