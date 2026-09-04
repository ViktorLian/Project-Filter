import OpenAI from 'openai';
import slugify from 'slugify';
import { createAdminClient } from '@/lib/supabase/admin';
import { readEnv } from '@/lib/env';

export async function generateSeoDraft(companyId: string) {
  const apiKey = readEnv('OPENAI_API_KEY');
  if (!apiKey) return { ok: false as const, status: 503, error: 'OPENAI_API_KEY er ikke konfigurert.' };
  const db = createAdminClient();
  const [{ data: settings }, { data: company }, { data: recent }] = await Promise.all([
    db.from('seo_settings').select('*').eq('company_id', companyId).maybeSingle(),
    db.from('leads_companies').select('name').eq('id', companyId).maybeSingle(),
    db.from('seo_content_items').select('title').eq('company_id', companyId).order('generated_at', { ascending: false }).limit(20),
  ]);
  if (!settings?.site_url || !settings.business_description || !settings.services?.length) {
    return { ok: false as const, status: 400, error: 'Fyll inn nettsted, bedriftsbeskrivelse og minst én tjeneste først.' };
  }
  const result = await new OpenAI({ apiKey }).chat.completions.create({
    model: 'gpt-4o-mini', temperature: 0.35, max_tokens: 2200, response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'Du er en norsk fagredaktør. Skriv nøkternt, presist og nyttig. Ikke finn på priser, sertifiseringer, erfaring, garantier eller geografisk dekning. Ingen søkeordstapping. Returner kun gyldig JSON.' },
      { role: 'user', content: `Lag ett originalt SEO-utkast for ${company?.name || 'bedriften'}.
Nettsted: ${settings.site_url}
Faktagrunnlag: ${settings.business_description}
Tjenester: ${settings.services.join(', ')}
Områder: ${(settings.service_areas || []).join(', ') || 'ikke oppgitt'}
Ønskede temaer: ${(settings.topics || []).join(', ') || 'velg et nyttig kundespørsmål'}
Unngå disse titlene: ${(recent || []).map(x => x.title).join(' | ') || 'ingen'}
Svar med JSON: {"title":"","excerpt":"","contentMarkdown":"800-1200 ord med H2/H3, konkrete råd og FAQ","metaDescription":"maks 155 tegn","keywords":["maks 6"]}.` },
    ],
  });
  let value: any;
  try { value = JSON.parse(result.choices[0]?.message?.content || '{}'); }
  catch { return { ok: false as const, status: 502, error: 'AI returnerte ugyldig innhold.' }; }
  if (!value.title || !value.contentMarkdown || !value.metaDescription) return { ok: false as const, status: 502, error: 'AI-utkastet var ufullstendig.' };
  const base = slugify(String(value.title), { lower: true, strict: true, locale: 'nb' }).slice(0, 90) || `artikkel-${Date.now()}`;
  const { data, error } = await db.from('seo_content_items').insert({
    company_id: companyId, title: String(value.title).slice(0, 180), slug: `${base}-${Date.now().toString(36)}`,
    excerpt: String(value.excerpt || '').slice(0, 500), content_markdown: String(value.contentMarkdown).slice(0, 20000),
    meta_description: String(value.metaDescription).slice(0, 160),
    keywords: Array.isArray(value.keywords) ? value.keywords.map(String).slice(0, 6) : [], status: 'draft',
  }).select('id,title,slug,excerpt,meta_description,keywords,status,generated_at').single();
  return error ? { ok: false as const, status: 500, error: error.message } : { ok: true as const, status: 200, item: data, settings };
}
