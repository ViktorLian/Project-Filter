import type { NextRequest } from 'next/server';
import { readEnv } from '@/lib/env';

export function isAuthorizedCron(request: NextRequest): boolean {
  const secret = readEnv('CRON_SECRET');
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}
