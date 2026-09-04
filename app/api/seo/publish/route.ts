import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { publishSeoItem, requireAutoSeo } from '@/lib/seo';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions as any) as any;
  const companyId = session?.user?.companyId as string | undefined;
  if (!companyId) return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });
  if (!await requireAutoSeo(companyId)) return NextResponse.json({ error: 'AutoSEO krever Pro-abonnement.' }, { status: 403 });
  const { itemId } = await request.json();
  if (!itemId) return NextResponse.json({ error: 'Mangler innholds-ID.' }, { status: 400 });
  const result = await publishSeoItem(companyId, String(itemId));
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
