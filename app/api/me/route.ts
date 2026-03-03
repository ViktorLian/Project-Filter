export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions as any) as any;
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const user = session.user as { id?: string; companyId?: string; name?: string; email?: string };
  return NextResponse.json({
    id: user.id,
    companyId: user.companyId,
    name: user.name,
    email: user.email,
  });
}
