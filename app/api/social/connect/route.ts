export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Redirect user to social platform OAuth flow
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions as any);
  if (!session) return NextResponse.redirect(new URL('/login', req.url));

  const { searchParams } = new URL(req.url);
  const platform = searchParams.get('platform');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const callbackUrl = `${baseUrl}/api/social/callback?platform=${platform}`;

  if (platform === 'facebook' || platform === 'instagram') {
    const appId = process.env.META_APP_ID;
    if (!appId) {
      return NextResponse.redirect(new URL('/dashboard/social-planner?error=missing_meta_app_id', req.url));
    }
    const scope = platform === 'instagram'
      ? 'instagram_basic,instagram_content_publish,pages_read_engagement'
      : 'pages_manage_posts,pages_read_engagement,publish_to_groups';
    const oauthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=${scope}&response_type=code`;
    return NextResponse.redirect(oauthUrl);
  }

  if (platform === 'google') {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.redirect(new URL('/dashboard/social-planner?error=missing_google_client_id', req.url));
    }
    const scope = 'https://www.googleapis.com/auth/business.manage';
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=${encodeURIComponent(scope)}&response_type=code&access_type=offline&prompt=consent`;
    return NextResponse.redirect(oauthUrl);
  }

  return NextResponse.redirect(new URL('/dashboard/social-planner?error=unknown_platform', req.url));
}
