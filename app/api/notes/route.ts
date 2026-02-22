export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadId, content } = await req.json();
    const userId = (session.user as any).id;
    const companyId = (session.user as any).companyId;

    const supabase = createAdminClient();

    // Verify lead belongs to company
    const { data: lead } = await supabase
      .from('leads_leads')
      .select('*')
      .eq('id', leadId)
      .eq('company_id', companyId)
      .single();

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Create note (assuming you have a notes table)
    const { data: note, error } = await supabase
      .from('leads_notes')
      .insert({
        lead_id: leadId,
        user_id: userId,
        content,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(note);
  } catch (e) {
    console.error('[CREATE NOTE ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
