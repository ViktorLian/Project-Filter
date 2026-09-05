'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FileText, GitBranch, MessageSquare, Search, Star, Users, Zap } from 'lucide-react';

type Lead = { id: string; created_at: string; status?: string; customer_name?: string; name?: string };
type Customer = { id: string; name?: string; created_at?: string };

const tools = [
  { href: '/dashboard/inbox', label: 'Innboks', description: 'Se og følg opp nye henvendelser.', icon: MessageSquare },
  { href: '/dashboard/customers', label: 'Kontakter', description: 'Samle kunder og kontaktinformasjon.', icon: Users },
  { href: '/dashboard/pipeline', label: 'Salgsmuligheter', description: 'Følg hver mulighet fra ny til vunnet.', icon: GitBranch },
  { href: '/dashboard/workflows', label: 'Automatiseringer', description: 'Administrer svar, påminnelser og oppfølging.', icon: Zap },
  { href: '/dashboard/review-gatekeeper', label: 'Anmeldelser', description: 'Følg forespørsler og godkjente attester.', icon: Star },
  { href: '/dashboard/auto-seo', label: 'SEO og innhold', description: 'Administrer faktagrunnlag, utkast og publisering.', icon: Search },
  { href: '/dashboard/forms', label: 'Skjemaer', description: 'Lag innganger for nye henvendelser.', icon: FileText },
];

export default function DashboardOverview() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/leads', { cache: 'no-store' }).then(async response => response.ok ? response.json() : Promise.reject()),
      fetch('/api/customers', { cache: 'no-store' }).then(async response => response.ok ? response.json() : Promise.reject()),
    ]).then(([leadData, customerData]) => {
      setLeads(Array.isArray(leadData) ? leadData : leadData.leads || []);
      setCustomers(Array.isArray(customerData) ? customerData : customerData.customers || []);
    }).catch(() => setWarning('Noen nøkkeltall kunne ikke lastes. Prøv å oppdatere siden.')).finally(() => setLoading(false));
  }, []);

  const newThisWeek = useMemo(() => leads.filter(lead => Date.now() - new Date(lead.created_at).getTime() < 7 * 86400000).length, [leads]);
  const won = useMemo(() => leads.filter(lead => ['ACCEPTED', 'WON', 'CUSTOMER'].includes((lead.status || '').toUpperCase())).length, [leads]);
  const conversion = leads.length ? Math.round((won / leads.length) * 100) : 0;

  return <div className="mx-auto max-w-6xl space-y-7 pb-10">
    <header><p className="text-sm font-semibold text-blue-700">Kundevekst</p><h1 className="mt-1 text-3xl font-bold text-slate-950">Oversikt</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Én arbeidsflate for henvendelser, kundeoppfølging, anmeldelser og synlighet. Tallene nedenfor hentes fra bedriftens egne data.</p></header>
    {warning && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{warning}</p>}
    <section className="grid gap-4 sm:grid-cols-3">
      <Metric label="Henvendelser totalt" value={loading ? '–' : String(leads.length)} detail={`${newThisWeek} nye siste 7 dager`} />
      <Metric label="Kontakter" value={loading ? '–' : String(customers.length)} detail="Registrert i kundeoversikten" />
      <Metric label="Vunnet andel" value={loading ? '–' : `${conversion} %`} detail={`${won} registrert som vunnet`} />
    </section>
    <section>
      <div className="mb-4"><h2 className="text-lg font-semibold text-slate-900">Arbeidsverktøy</h2><p className="mt-1 text-sm text-slate-500">Bare funksjonene som støtter kundeanskaffelse og oppfølging vises her.</p></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{tools.map(item => { const Icon = item.icon; return <Link key={item.href} href={item.href} className="group rounded-2xl border bg-white p-5 transition hover:border-blue-200 hover:shadow-sm"><div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50"><Icon className="h-5 w-5 text-blue-700" /></span><ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600" /></div><h3 className="mt-4 font-semibold text-slate-900">{item.label}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p></Link>; })}</div>
    </section>
    <section className="rounded-2xl border bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-semibold text-slate-900">Kom i gang</h2><p className="mt-1 text-sm text-slate-500">Koble først et skjema eller en sikker integrasjon, og test én henvendelse gjennom hele flyten.</p></div><Link href="/dashboard/forms" className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white">Åpne skjemaer</Link></div></section>
  </div>;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-950">{value}</p><p className="mt-2 text-xs text-slate-400">{detail}</p></article>;
}
