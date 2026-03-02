export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions as any) as any;
  if (!session) return NextResponse.redirect(new URL('/login', req.url));

  const { searchParams } = new URL(req.url);
  const platform = searchParams.get('platform');
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL(`/dashboard/social-planner?error=oauth_denied`, req.url));
  }

  const userId = session.user?.id;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const callbackUrl = `${baseUrl}/api/social/callback?platform=${platform}`;

  try {
    let accessToken = '';
    let accountName = '';

    if (platform === 'facebook' || platform === 'instagram') {
      const appId = process.env.META_APP_ID!;
      const appSecret = process.env.META_APP_SECRET!;
      const tokenRes = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(callbackUrl)}&client_secret=${appSecret}&code=${code}`
      );
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) throw new Error('No access token received');
      accessToken = tokenData.access_token;

      // Get page/account name
      const meRes = await fetch(`https://graph.facebook.com/me?fields=name&access_token=${accessToken}`);
      const meData = await meRes.json();
      accountName = meData.name || '';
    }

    if (platform === 'google') {
      const clientId = process.env.GOOGLE_CLIENT_ID!;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: callbackUrl, grant_type: 'authorization_code' }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) throw new Error('No access token received');
      accessToken = tokenData.access_token;

      // Get account name
      const infoRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const infoData = await infoRes.json();
      accountName = infoData.accounts?.[0]?.accountName || 'Google Business';
    }

    // Save token to DB
    const supabase = createAdminClient();
    const { data: existing } = await supabase
      .from('leads_companies')
      .select('social_connections')
      .eq('user_id', userId)
      .single();

    const currentConns = (existing as any)?.social_connections || {};
    const updatedConns = {
      ...currentConns,
      [platform!]: { connected: true, access_token: accessToken, account_name: accountName, connected_at: new Date().toISOString() },
    };

    await supabase
      .from('leads_companies')
      .update({ social_connections: updatedConns, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    return NextResponse.redirect(new URL(`/dashboard/social-planner?connected=${platform}`, req.url));
  } catch (e) {
    console.error('[SOCIAL CALLBACK ERROR]', e);
    return NextResponse.redirect(new URL(`/dashboard/social-planner?error=token_exchange_failed`, req.url));
  }
}
