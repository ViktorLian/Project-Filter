export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAuthorizedCron } from '@/lib/cron-auth';
import { generateSeoDraft } from '@/lib/seo-generation';
import { publishSeoItem, requireAutoSeo } from '@/lib/seo';

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = createAdminClient();
  const { data: settings, error } = await db.from('seo_settings').select('company_id,frequency_days,publishing_mode,enabled').eq('enabled', true);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const results = [];
  for (const config of settings || []) {
    if (!await requireAutoSeo(config.company_id)) {
      results.push({ companyId: config.company_id, skipped: 'subscription' });
      continue;
    }
    const cutoff = new Date(Date.now() - config.frequency_days * 86_400_000).toISOString();
    const { count } = await db.from('seo_content_items').select('id', { count: 'exact', head: true }).eq('company_id', config.company_id).gte('generated_at', cutoff);
    if ((count || 0) > 0) { results.push({ companyId: config.company_id, skipped: 'frequency' }); continue; }
    const generated = await generateSeoDraft(config.company_id);
    if (!generated.ok) { results.push({ companyId: config.company_id, error: generated.error }); continue; }
    const published = config.publishing_mode === 'webhook' && generated.item?.id
      ? await publishSeoItem(config.company_id, generated.item.id) : null;
    results.push({ companyId: config.company_id, generated: true, published });
  }
  return NextResponse.json({ ok: results.every(r => !('error' in r)), results });
}
