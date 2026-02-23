import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const companyId = (session.user as any).companyId || (session.user as any).id;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ members: data || [] });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const companyId = (session.user as any).companyId || (session.user as any).id;

  const body = await req.json();
  const { action, email, role, memberId } = body;

  const supabase = createAdminClient();

  if (action === 'invite') {
    if (!email) return NextResponse.json({ error: 'E-post mangler' }, { status: 400 });
    const token = crypto.randomBytes(24).toString('hex');

    // Check if already invited
    const { data: existing } = await supabase
      .from('team_members')
      .select('id')
      .eq('company_id', companyId)
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Denne personen er allerede invitert' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('team_members')
      .insert({
        company_id: companyId,
        email: email.toLowerCase().trim(),
        role: role || 'member',
        invite_token: token,
        status: 'pending',
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ member: data, token });
  }

  if (action === 'remove') {
    await supabase.from('team_members').delete().eq('id', memberId).eq('company_id', companyId);
    return NextResponse.json({ success: true });
  }

  if (action === 'update_role') {
    const { error } = await supabase
      .from('team_members')
      .update({ role })
      .eq('id', memberId)
      .eq('company_id', companyId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Ukjent handling' }, { status: 400 });
}
