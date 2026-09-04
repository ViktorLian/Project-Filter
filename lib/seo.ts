import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSubscriptionStatus } from '@/lib/subscription';

export async function requireAutoSeo(companyId: string) {
  const subscription = await getSubscriptionStatus(companyId);
  return subscription.hasAccess && subscription.plan === 'enterprise';
}

export function safeHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const privateHost = host === 'localhost' || host === '127.0.0.1' || host === '::1' ||
      host.endsWith('.local') || /^10\./.test(host) || /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host);
    return url.protocol === 'https:' && !privateHost ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function publishSeoItem(companyId: string, itemId: string) {
  const db = createAdminClient();
  const [{ data: settings }, { data: item }] = await Promise.all([
    db.from('seo_settings').select('*').eq('company_id', companyId).maybeSingle(),
    db.from('seo_content_items').select('*').eq('company_id', companyId).eq('id', itemId).maybeSingle(),
  ]);
  if (!settings || !item) return { ok: false, error: 'Oppsett eller innhold ble ikke funnet.' };
  const endpoint = safeHttpsUrl(settings.publishing_webhook_url || '');
  if (settings.publishing_mode !== 'webhook' || !endpoint || !settings.publishing_webhook_secret) {
    return { ok: false, error: 'Publiseringsintegrasjonen er ikke konfigurert.' };
  }

  const payload = JSON.stringify({
    event: 'flowpilot.seo.publish',
    generatedAt: item.generated_at,
    article: {
      title: item.title, slug: item.slug, excerpt: item.excerpt,
      contentMarkdown: item.content_markdown, metaDescription: item.meta_description,
      keywords: item.keywords,
    },
  });
  const signature = crypto.createHmac('sha256', settings.publishing_webhook_secret).update(payload).digest('hex');
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-flowpilot-signature': `sha256=${signature}` },
      body: payload,
      signal: AbortSignal.timeout(12_000),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`Mottaker svarte ${response.status}`);
    await db.from('seo_content_items').update({
      status: 'published', published_at: new Date().toISOString(),
      published_url: typeof body.url === 'string' ? body.url : null,
      provider_response: body,
    }).eq('id', item.id).eq('company_id', companyId);
    return { ok: true, url: body.url || null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Publisering feilet';
    await db.from('seo_content_items').update({ status: 'failed', provider_response: { error: message } })
      .eq('id', item.id).eq('company_id', companyId);
    return { ok: false, error: message };
  }
}
