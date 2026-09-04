import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireAutoSeo } from '@/lib/seo';
import { generateSeoDraft } from '@/lib/seo-generation';

export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await getServerSession(authOptions as any) as any;
  const companyId = session?.user?.companyId as string | undefined;
  if (!companyId) return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });
  if (!await requireAutoSeo(companyId)) return NextResponse.json({ error: 'AutoSEO krever Pro-abonnement.' }, { status: 403 });
  const result = await generateSeoDraft(companyId);
  return result.ok ? NextResponse.json({ item: result.item }) : NextResponse.json({ error: result.error }, { status: result.status });
}
