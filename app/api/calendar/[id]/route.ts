export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const companyId = (session.user as any).companyId;
    const supabase = createAdminClient();
    await supabase.from('calendar_events').delete().eq('id', params.id).eq('company_id', companyId);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
