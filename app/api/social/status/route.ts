export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const session = await getServerSession(authOptions as any) as any;
  if (!session) return NextResponse.json({ connections: {} });
  const userId = session.user?.id;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('leads_companies')
    .select('social_connections')
    .eq('user_id', userId)
    .single();

  const raw = (data as any)?.social_connections || {};
  // Strip access tokens from public response - only return connected status + name
  const safe: Record<string, { connected: boolean; account_name?: string }> = {};
  for (const [k, v] of Object.entries(raw as Record<string, any>)) {
    safe[k] = { connected: v.connected, account_name: v.account_name };
  }
  return NextResponse.json({ connections: safe });
}
