import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { BarChart3, FileText, MessageSquare, Star, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  const companyId = (session?.user as any)?.companyId;
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  let leads: any[] = [], customers: any[] = [], surveys: any[] = [], seoItems: any[] = [];

  if (companyId) {
    const db = createAdminClient();
    const [leadRes, customerRes, surveyRes, seoRes] = await Promise.all([
      db.from('leads').select('id,status,created_at').eq('company_id', companyId).gte('created_at', since),
      db.from('customers').select('id,created_at').eq('company_id', companyId).gte('created_at', since),
      db.from('feedback_surveys').select('id,sent_at,completed_at,question_1_rating,testimonial_approved,created_at').eq('company_id', companyId).gte('created_at', since),
      db.from('seo_content_items').select('id,status,generated_at,published_at').eq('company_id', companyId).gte('generated_at', since),
    ]);
    leads = leadRes.data ?? [];
    customers = customerRes.data ?? [];
    surveys = surveyRes.data ?? [];
    seoItems = seoRes.data ?? [];
  }

  const won = leads.filter(item => ['ACCEPTED', 'WON', 'CUSTOMER'].includes(String(item.status).toUpperCase())).length;
  const answers = surveys.filter(item => item.completed_at);
  const average = answers.length ? (answers.reduce((sum, item) => sum + Number(item.question_1_rating || 0), 0) / answers.length).toFixed(1) : '–';
  const published = seoItems.filter(item => item.published_at || String(item.status).toLowerCase() === 'published').length;
  const cards = [
    { label: 'Nye henvendelser', value: leads.length, detail: `${won} vunnet eller akseptert`, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Nye kontakter', value: customers.length, detail: 'Registrert siste 30 dager', icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Anmeldelsesforespørsler', value: surveys.filter(item => item.sent_at).length, detail: `${answers.length} svar · snitt ${average}/10`, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Publisert SEO-innhold', value: published, detail: `${seoItems.length} generert siste 30 dager`, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return <div className="mx-auto max-w-5xl space-y-6">
    <header><p className="text-sm font-semibold text-blue-600">Siste 30 dager</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Resultatrapport</h1><p className="mt-1 text-sm text-slate-600">Ekte aktivitet fra bedriftens henvendelser, kundeoppfølging, anmeldelser og SEO.</p></header>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(card => <article key={card.label} className="rounded-xl border border-slate-200 bg-white p-5"><div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}><card.icon className={`h-5 w-5 ${card.color}`} /></div><p className="text-3xl font-bold text-slate-900">{card.value}</p><p className="mt-1 text-sm font-semibold text-slate-800">{card.label}</p><p className="mt-1 text-xs text-slate-500">{card.detail}</p></article>)}</section>
    <section className="rounded-xl border border-slate-200 bg-white p-6"><div className="flex items-center gap-3"><BarChart3 className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900">Slik brukes rapporten</h2></div><div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3"><p className="rounded-lg bg-slate-50 p-4"><strong className="block text-slate-900">Dokumenter arbeidet</strong>Vis hva FlowPilot faktisk har samlet inn, sendt og publisert.</p><p className="rounded-lg bg-slate-50 p-4"><strong className="block text-slate-900">Følg utviklingen</strong>Sammenlign hver måned og prioriter tiltakene som gir flere kunder.</p><p className="rounded-lg bg-slate-50 p-4"><strong className="block text-slate-900">Automatisk oppsummering</strong>Når månedsrapport er aktivert, sendes en kort e-post med lenke til denne oversikten.</p></div></section>
  </div>;
}
