import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ plan: 'starter', status: 'trialing' });
    }

    const supabase = createAdminClient();
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!user) return NextResponse.json({ plan: 'starter', status: 'trialing' });

    const { data: company } = await supabase
      .from('leads_companies')
      .select('subscription_plan, subscription_status, trial_ends_at')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      plan: company?.subscription_plan ?? 'starter',
      status: company?.subscription_status ?? 'trialing',
      trialEndsAt: company?.trial_ends_at ?? null,
    });
  } catch {
    return NextResponse.json({ plan: 'starter', status: 'trialing' });
  }
}
