import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAutoSeo, safeHttpsUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

async function context() {
  const session = await getServerSession(authOptions as any) as any;
  const companyId = session?.user?.companyId as string | undefined;
  if (!companyId) return null;
  return { companyId, allowed: await requireAutoSeo(companyId) };
}

export async function GET() {
  const ctx = await context();
  if (!ctx) return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });
  if (!ctx.allowed) return NextResponse.json({ error: 'AutoSEO krever Pro-abonnement.' }, { status: 403 });
  const db = createAdminClient();
  await db.from('seo_settings').upsert({ company_id: ctx.companyId }, { onConflict: 'company_id', ignoreDuplicates: true });
  const [{ data: settings, error }, { data: content }] = await Promise.all([
    db.from('seo_settings').select('company_id,site_url,business_description,services,service_areas,topics,publishing_mode,publishing_webhook_url,frequency_days,enabled,updated_at').eq('company_id', ctx.companyId).single(),
    db.from('seo_content_items').select('id,title,slug,excerpt,meta_description,keywords,status,published_url,generated_at,published_at').eq('company_id', ctx.companyId).order('generated_at', { ascending: false }).limit(20),
  ]);
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ settings, content: content || [] });
}

export async function PUT(request: NextRequest) {
  const ctx = await context();
  if (!ctx) return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });
  if (!ctx.allowed) return NextResponse.json({ error: 'AutoSEO krever Pro-abonnement.' }, { status: 403 });
  const input = await request.json();
  const siteUrl = input.site_url ? safeHttpsUrl(String(input.site_url)) : null;
  const webhookUrl = input.publishing_webhook_url ? safeHttpsUrl(String(input.publishing_webhook_url)) : null;
  if (input.site_url && !siteUrl) return NextResponse.json({ error: 'Nettstedet må være en offentlig HTTPS-adresse.' }, { status: 400 });
  if (input.publishing_webhook_url && !webhookUrl) return NextResponse.json({ error: 'Webhook må være en offentlig HTTPS-adresse.' }, { status: 400 });
  const list = (value: unknown) => Array.isArray(value) ? value.map(String).map(v => v.trim()).filter(Boolean).slice(0, 30) : [];
  const payload: Record<string, unknown> = {
    company_id: ctx.companyId,
    site_url: siteUrl,
    business_description: String(input.business_description || '').trim().slice(0, 3000),
    services: list(input.services), service_areas: list(input.service_areas), topics: list(input.topics),
    publishing_mode: input.publishing_mode === 'webhook' ? 'webhook' : 'draft',
    publishing_webhook_url: webhookUrl,
    frequency_days: Math.max(1, Math.min(31, Number(input.frequency_days) || 7)),
    enabled: Boolean(input.enabled), updated_at: new Date().toISOString(),
  };
  if (typeof input.publishing_webhook_secret === 'string' && input.publishing_webhook_secret.trim()) {
    payload.publishing_webhook_secret = input.publishing_webhook_secret.trim().slice(0, 500);
  }
  const { data, error } = await createAdminClient().from('seo_settings').upsert(payload).select('company_id,site_url,business_description,services,service_areas,topics,publishing_mode,publishing_webhook_url,frequency_days,enabled,updated_at').single();
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ settings: data });
}
