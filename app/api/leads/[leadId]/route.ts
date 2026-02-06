import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  req: NextRequest,
  { params }: { params: { leadId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;
    const { leadId } = params;
    const supabase = createAdminClient();

    const { data: lead } = await supabase
      .from('leads')
      .select('*, notes(*)')
      .eq('id', leadId)
      .eq('company_id', companyId)
      .single();

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (e) {
    console.error('[GET LEAD ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { leadId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;
    const { leadId } = params;
    const body = await req.json();
    const supabase = createAdminClient();

    const { data: lead } = await supabase
      .from('leads')
      .select('id')
      .eq('id', leadId)
      .eq('company_id', companyId)
      .single();

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const { data: updated, error } = await supabase
      .from('leads')
      .update(body)
      .eq('id', leadId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(updated);
  } catch (e) {
    console.error('[UPDATE LEAD ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
