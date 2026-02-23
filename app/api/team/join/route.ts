import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Called after registration to link user to a company via invite token
export async function POST(req: NextRequest) {
  try {
    const { token, userId, email } = await req.json();
    if (!token || !userId) return NextResponse.json({ error: 'Mangler token eller brukerId' }, { status: 400 });

    const supabase = createAdminClient();

    // Find the invite
    const { data: invite, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('invite_token', token)
      .eq('status', 'pending')
      .single();

    if (error || !invite) {
      return NextResponse.json({ error: 'Ugyldig eller utløpt invitasjon' }, { status: 404 });
    }

    // Mark as accepted and link user_id
    await supabase
      .from('team_members')
      .update({ status: 'active', user_id: userId, accepted_at: new Date().toISOString() })
      .eq('id', invite.id);

    // Update user's company_id in your users table (so they see the same data)
    await supabase
      .from('users')
      .update({ company_id: invite.company_id })
      .eq('id', userId);

    return NextResponse.json({ success: true, companyId: invite.company_id });
  } catch (err) {
    console.error('Join team error:', err);
    return NextResponse.json({ error: 'Intern feil' }, { status: 500 });
  }
}
