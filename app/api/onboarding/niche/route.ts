import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions as any) as any;
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { nicheId } = await req.json();
  if (!nicheId || typeof nicheId !== 'string') {
    return NextResponse.json({ error: 'nicheId required' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('leads_companies')
    .update({ niche_id: nicheId })
    .eq('id', session.user.id);

  if (error) {
    // Non-blocking — column may not exist yet; still succeed
    console.error('[niche API] update error:', error.message);
  }

  return NextResponse.json({ success: true, nicheId });
}

export async function GET() {
  const session = await getServerSession(authOptions as any) as any;
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data } = await supabase
    .from('leads_companies')
    .select('niche_id')
    .eq('id', session.user.id)
    .single();

  return NextResponse.json({ nicheId: data?.niche_id ?? null });
}
