export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const ALLOWED_FIELDS = [
  'google_review_url',
  'sms_phone',
  'bank_account',
  'kid_prefix',
  'invoice_email',
  'address',
  'org_number',
];

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const companyId = (session.user as any).companyId;

  const body = await req.json();
  const updates: Record<string, any> = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Ingen felter å oppdatere' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('leads_companies').update(updates).eq('id', companyId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
