export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedCron } from '@/lib/cron-auth';

const jobs = [
  '/api/cron/trial-emails',
  '/api/cron/review-emails',
  '/api/cron/send-sequences',
  '/api/cron/business-automations',
  '/api/cron/seo',
];

export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || req.nextUrl.origin;
  const authorization = req.headers.get('authorization') || '';
  const results = [];
  for (const path of jobs) {
    try {
      const response = await fetch(new URL(path, origin), {
        headers: { authorization },
        cache: 'no-store',
      });
      const body = await response.json().catch(() => null);
      results.push({ path, ok: response.ok, status: response.status, body });
    } catch (error) {
      results.push({ path, ok: false, status: 0, error: error instanceof Error ? error.message : 'Ukjent feil' });
    }
  }
  const ok = results.every(result => result.ok);
  return NextResponse.json({ ok, results }, { status: ok ? 200 : 207 });
}
