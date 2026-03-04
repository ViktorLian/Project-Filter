'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, Users, FileText, DollarSign, AlertCircle,
  ArrowUpRight, Bot, Calendar, Star, Activity, ChevronRight, Zap,
  Wrench, Scale, Home, Scissors, BarChart3, Package, Clock, MessageSquare,
} from 'lucide-react';
import { getNiche, type Niche } from '@/lib/niches';

type Lead = { id: string; created_at: string; status?: string; customer_name?: string; name?: string };
type Invoice = { id: string; amount: number; status: string; due_date?: string; customer?: { name: string } };

// Per-niche quick actions: what matters most for each bransje
const NICHE_QUICK_ACTIONS: Record<string, { label: string; href: string; icon: any; color: string; desc: string }[]> = {
  rorlegger: [
    { label: 'Ny oppdrag', href: '/dashboard/jobs', icon: Wrench, color: 'bg-blue-500', desc: 'Registrer nytt VVS-oppdrag' },
    { label: 'Tilbud', href: '/dashboard/proposals', icon: FileText, color: 'bg-indigo-500', desc: 'Lag kalkyle / tilbud' },
    { label: 'Faktura', href: '/dashboard/invoices', icon: DollarSign, color: 'bg-emerald-500', desc: 'Fakturer fullførte jobber' },
    { label: 'Kalender', href: '/dashboard/calendar', icon: Calendar, color: 'bg-orange-500', desc: 'Planlegg uken' },
  ],
  elektriker: [
    { label: 'Ny oppdrag', href: '/dashboard/jobs', icon: Wrench, color: 'bg-yellow-500', desc: 'Registrer nytt el-oppdrag' },
    { label: 'Tilbud', href: '/dashboard/proposals', icon: FileText, color: 'bg-indigo-500', desc: 'Lag tilbud' },
    { label: 'Faktura', href: '/dashboard/invoices', icon: DollarSign, color: 'bg-emerald-500', desc: 'Fakturer' },
    { label: 'Lager', href: '/dashboard/inventory', icon: Package, color: 'bg-slate-500', desc: 'El-utstyr og materiell' },
  ],
  snekker: [
    { label: 'Ny oppdrag', href: '/dashboard/jobs', icon: Wrench, color: 'bg-amber-600', desc: 'Registrer snekkeroppdrag' },
    { label: 'Kalkyle', href: '/dashboard/proposals', icon: FileText, color: 'bg-indigo-500', desc: 'Bygg kalkyle' },
    { label: 'Faktura', href: '/dashboard/invoices', icon: DollarSign, color: 'bg-emerald-500', desc: 'Fakturer prosjekt' },
    { label: 'Materiell', href: '/dashboard/inventory', icon: Package, color: 'bg-slate-500', desc: 'Oversikt over materiell' },
  ],
  frisor: [
    { label: 'Bestillinger', href: '/dashboard/calendar', icon: Calendar, color: 'bg-pink-500', desc: 'Timebok for i dag' },
    { label: 'Ny kunde', href: '/dashboard/customers', icon: Users, color: 'bg-rose-500', desc: 'Legg til kunde' },
    { label: 'Kampanje', href: '/dashboard/campaigns', icon: MessageSquare, color: 'bg-purple-500', desc: 'Send tilbud til kunder' },
    { label: 'Kasse', href: '/dashboard/invoices', icon: DollarSign, color: 'bg-emerald-500', desc: 'Dagens salg' },
  ],
  hudpleie: [
    { label: 'Timebok', href: '/dashboard/calendar', icon: Calendar, color: 'bg-pink-400', desc: 'Bestillinger i dag' },
    { label: 'Ny kunde', href: '/dashboard/customers', icon: Users, color: 'bg-rose-500', desc: 'Legg til kunde' },
    { label: 'Kampanje', href: '/dashboard/campaigns', icon: MessageSquare, color: 'bg-purple-500', desc: 'Send tilbud' },
    { label: 'Anmeldelser', href: '/dashboard/review-gatekeeper', icon: Star, color: 'bg-yellow-500', desc: 'Be om anmeldelse' },
  ],
  'personlig-trener': [
    { label: 'Timer i dag', href: '/dashboard/calendar', icon: Calendar, color: 'bg-orange-500', desc: 'Treningsøkter' },
    { label: 'Mine klienter', href: '/dashboard/customers', icon: Users, color: 'bg-blue-500', desc: 'Klientliste' },
    { label: 'Faktura', href: '/dashboard/invoices', icon: DollarSign, color: 'bg-emerald-500', desc: 'Fakturer klienter' },
    { label: 'Skjemaer', href: '/dashboard/forms', icon: FileText, color: 'bg-indigo-500', desc: 'Inntakssjema' },
  ],
  advokat: [
    { label: 'Saker', href: '/dashboard/pipeline', icon: Scale, color: 'bg-slate-700', desc: 'Aktive saker' },
    { label: 'Klienter', href: '/dashboard/customers', icon: Users, color: 'bg-blue-600', desc: 'Klientregister' },
    { label: 'Faktura', href: '/dashboard/invoices', icon: DollarSign, color: 'bg-emerald-600', desc: 'Timedebiteringer' },
    { label: 'Dokumenter', href: '/dashboard/client-portal', icon: FileText, color: 'bg-indigo-600', desc: 'Del docs sikkert' },
  ],
  regnskapsforer: [
    { label: 'Klienter', href: '/dashboard/customers', icon: Users, color: 'bg-blue-600', desc: 'Klientliste' },
    { label: 'Faktura', href: '/dashboard/invoices', icon: DollarSign, color: 'bg-emerald-600', desc: 'Fakturer klienter' },
    { label: 'Kontantstrøm', href: '/dashboard/cashflow', icon: TrendingUp, color: 'bg-teal-500', desc: 'Oversikt' },
    { label: 'Klientportal', href: '/dashboard/client-portal', icon: FileText, color: 'bg-indigo-500', desc: 'Del rapporter' },
  ],
  eiendomsmegler: [
    { label: 'Pipeline', href: '/dashboard/pipeline', icon: Home, color: 'bg-orange-500', desc: 'Aktive eiendommer' },
    { label: 'Leads', href: '/dashboard/leads', icon: Users, color: 'bg-blue-500', desc: 'Nye kjøperforespørsler' },
    { label: 'Kampanje', href: '/dashboard/campaigns', icon: MessageSquare, color: 'bg-purple-500', desc: 'Send boligvarsler' },
    { label: 'Analyser', href: '/dashboard/analytics', icon: BarChart3, color: 'bg-emerald-500', desc: 'Markedsdata' },
  ],
  'it-konsulent': [
    { label: 'Prosjekter', href: '/dashboard/pipeline', icon: Activity, color: 'bg-cyan-600', desc: 'Aktive prosjekter' },
    { label: 'Klienter', href: '/dashboard/customers', icon: Users, color: 'bg-blue-600', desc: 'Klientliste' },
    { label: 'Timer', href: '/dashboard/time-tracking', icon: Clock, color: 'bg-indigo-500', desc: 'Timelogg' },
    { label: 'Faktura', href: '/dashboard/invoices', icon: DollarSign, color: 'bg-emerald-600', desc: 'Fakturer timer' },
  ],
  restaurant: [
    { label: 'Reservasjoner', href: '/dashboard/calendar', icon: Calendar, color: 'bg-red-500', desc: 'Bordreservasjoner' },
    { label: 'Anmeldelser', href: '/dashboard/review-gatekeeper', icon: Star, color: 'bg-yellow-500', desc: 'Administrer reviews' },
    { label: 'Kampanje', href: '/dashboard/campaigns', icon: MessageSquare, color: 'bg-purple-500', desc: 'Send tilbud/menyer' },
    { label: 'Økonomi', href: '/dashboard/cashflow', icon: TrendingUp, color: 'bg-emerald-500', desc: 'Daglig omsetning' },
  ],
  tannlege: [
    { label: 'Timebok', href: '/dashboard/calendar', icon: Calendar, color: 'bg-cyan-500', desc: 'Pasientavtaler' },
    { label: 'Pasienter', href: '/dashboard/customers', icon: Users, color: 'bg-blue-500', desc: 'Pasientregister' },
    { label: 'Faktura', href: '/dashboard/invoices', icon: DollarSign, color: 'bg-emerald-500', desc: 'Fakturer behandling' },
    { label: 'Anmeldelser', href: '/dashboard/review-gatekeeper', icon: Star, color: 'bg-yellow-500', desc: 'Be om tilbakemelding' },
  ],
  markedsbyra: [
    { label: 'Prosjekter', href: '/dashboard/pipeline', icon: Activity, color: 'bg-fuchsia-600', desc: 'Aktive kampanjer' },
    { label: 'Klienter', href: '/dashboard/customers', icon: Users, color: 'bg-blue-600', desc: 'Klientoversikt' },
    { label: 'Sosiale medier', href: '/dashboard/social-planner', icon: MessageSquare, color: 'bg-purple-500', desc: 'Planlegg innhold' },
    { label: 'Analyser', href: '/dashboard/analytics', icon: BarChart3, color: 'bg-emerald-500', desc: 'Kampanjeresultater' },
  ],
};

const DEFAULT_QUICK_ACTIONS = [
  { label: 'Leads', href: '/dashboard/leads', icon: Users, color: 'bg-blue-500', desc: 'Se alle leads' },
  { label: 'Faktura', href: '/dashboard/invoices', icon: DollarSign, color: 'bg-emerald-500', desc: 'Fakturer kunder' },
  { label: 'AI Assistent', href: '/dashboard/ai-assistant', icon: Bot, color: 'bg-purple-500', desc: 'AI-hjelp' },
  { label: 'Kalender', href: '/dashboard/calendar', icon: Calendar, color: 'bg-orange-500', desc: 'Planlegg uken' },
];

// Niche-specific tips/insights shown on the dashboard
const NICHE_TIPS: Record<string, { title: string; body: string; cta: string; href: string }> = {
  rorlegger: { title: '💡 Tips for rørlegger', body: 'Send automatisk oppfølging 30 min etter en forespørsel — bedrifter som svarer først vinner 70% av oppdragene.', cta: 'Sett opp auto-svar', href: '/dashboard/workflows' },
  frisor: { title: '💡 Tips for frisørsalong', body: 'Send påminnelse 24 timer før time — reduserer no-show med opptil 60%.', cta: 'Sett opp påminnelse', href: '/dashboard/workflows' },
  advokat: { title: '💡 Tips for advokater', body: 'Bruk klientportalen til å dele dokumenter sikkert. Klienter setter pris på digitale arbeidsflyter.', cta: 'Åpne klientportal', href: '/dashboard/client-portal' },
  eiendomsmegler: { title: '💡 Tips for eiendomsmegler', body: 'Kjøpere som jobber med flere meglere går til den som følger opp best. Sett opp automatisk e-postsekvens.', cta: 'Lag e-postsekvens', href: '/dashboard/email-sequences' },
  regnskapsforer: { title: '💡 Tips for regnskapsfører', body: 'Del månedlige rapporter via klientportalen istedenfor e-post — mer profesjonelt og sporbart.', cta: 'Åpne klientportal', href: '/dashboard/client-portal' },
  restaurant: { title: '💡 Tips for restaurant', body: 'Gjester som legger igjen en anmeldelse kommer tilbake 2x så ofte. Automatiser anmeldelsesforespørsler.', cta: 'Be om anmeldelse', href: '/dashboard/review-gatekeeper' },
};

const DEFAULT_TIP = { title: '⚡ Kom i gang med AI', body: 'FlowPilot AI kan skrive tilbud, svare på leads og analysere kontantstrøm — alt automatisk.', cta: 'Prøv AI-assistent', href: '/dashboard/ai-assistant' };

export default function DashboardOverview() {
  const [health, setHealth] = useState<'GREEN' | 'YELLOW' | 'RED'>('GREEN');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [nicheId, setNicheId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/leads').then((r) => r.json()).catch(() => ({ leads: [] })),
      fetch('/api/cashflow/health').then((r) => r.json()).catch(() => ({ health: 'GREEN', income: 0, expense: 0 })),
      fetch('/api/invoices').then((r) => r.json()).catch(() => ({ invoices: [] })),
      fetch('/api/onboarding/niche').then((r) => r.json()).catch(() => ({ nicheId: null })),
    ]).then(([l, c, i, n]) => {
      setLeads(l.leads || []);
      setInvoices(i.invoices || []);
      setHealth(c.health || 'GREEN');
      setIncome(c.income || 0);
      setExpense(c.expense || 0);
      setNicheId(n.nicheId || null);
      setLoading(false);
    });
  }, []);

  const niche: Niche | undefined = nicheId ? getNiche(nicheId) : undefined;
  const quickActions = (nicheId && NICHE_QUICK_ACTIONS[nicheId]) ? NICHE_QUICK_ACTIONS[nicheId] : DEFAULT_QUICK_ACTIONS;
  const tip = (nicheId && NICHE_TIPS[nicheId]) ? NICHE_TIPS[nicheId] : DEFAULT_TIP;

  const outstanding = invoices.filter((i) => i.status !== 'PAID');
  const outstandingAmount = outstanding.reduce((s, i) => s + (i.amount || 0), 0);
  const netProfit = income - expense;
  const newLeads = leads.filter((l) => {
    const d = new Date(l.created_at);
    return (new Date().getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
  });

  const healthConfig = {
    GREEN: { label: 'God økonomi', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: TrendingUp },
    YELLOW: { label: 'Sjekk økonomi', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: AlertCircle },
    RED: { label: 'Kritisk økonomi', color: 'text-red-600 bg-red-50 border-red-200', icon: TrendingDown },
  };
  const hc = healthConfig[health];
  const HealthIcon = hc.icon;

  const stats = [
    { label: 'Leads (30d)', value: leads.length, sub: `+${newLeads.length} denne uken`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', href: '/dashboard/leads' },
    { label: 'Inntekter', value: `${income.toLocaleString('nb-NO')} kr`, sub: 'Denne måneden', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/dashboard/cashflow' },
    { label: 'Netto resultat', value: `${netProfit.toLocaleString('nb-NO')} kr`, sub: 'Inntekt minus utgifter', icon: Activity, color: netProfit >= 0 ? 'text-emerald-600' : 'text-red-600', bg: netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50', href: '/dashboard/cashflow' },
    { label: 'Ubetalte fakturaer', value: `${outstandingAmount.toLocaleString('nb-NO')} kr`, sub: `${outstanding.length} fakturaer venter`, icon: DollarSign, color: outstanding.length > 0 ? 'text-orange-600' : 'text-slate-600', bg: outstanding.length > 0 ? 'bg-orange-50' : 'bg-slate-50', href: '/dashboard/invoices' },
  ];

  return (
    <div className="space-y-6">
      {/* Header — niche-aware */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          {niche ? (
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">{niche.emoji}</span>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{niche.name} — Oversikt</h1>
                <p className="text-slate-500 text-sm">{niche.tagline}</p>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900">Oversikt</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                {new Date().toLocaleDateString('nb-NO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {niche && (
            <span className="text-xs px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-medium">
              {niche.priceMonthly.toLocaleString('nb-NO')} kr/mnd
            </span>
          )}
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${hc.color}`}>
            <HealthIcon className="h-4 w-4" />
            {hc.label}
          </span>
        </div>
      </div>

      {/* Quick actions — niche-specific */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map(({ label, href, icon: Icon, color, desc }) => (
          <Link key={href} href={href}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:shadow-md hover:border-slate-300 transition-all group"
          >
            <div className={`h-9 w-9 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 block">{label}</span>
              <span className="text-xs text-slate-400 truncate block">{desc}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 ml-auto group-hover:text-slate-600 flex-shrink-0" />
          </Link>
        ))}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href}
            className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-lg hover:border-slate-300 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
            {loading ? (
              <div className="h-8 w-24 bg-slate-100 rounded animate-pulse mb-1" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">{value}</p>
            )}
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            <p className="text-xs text-slate-400 mt-1">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Niche features showcase (only shown when niche is set) */}
      {niche && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{niche.emoji}</span>
            <h2 className="font-semibold text-slate-800">Dine spesialverktøy for {niche.name}</h2>
            <span className="ml-auto text-xs text-slate-400">{niche.nicheFeatures.length} moduler</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {niche.nicheFeatures.map((f) => (
              <div key={f.name} className="rounded-lg bg-slate-50 border border-slate-100 p-3 hover:bg-blue-50 hover:border-blue-200 transition-colors">
                <div className="text-lg mb-1">{f.icon}</div>
                <p className="text-xs font-semibold text-slate-700">{f.name}</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two columns: Recent Leads + Outstanding Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent leads */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <h2 className="font-semibold text-slate-800">Siste leads</h2>
            </div>
            <Link href="/dashboard/leads" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Se alle <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                    <div className="h-2 w-20 bg-slate-50 rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : leads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">Ingen leads ennå</div>
            ) : (
              leads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-blue-600">
                      {(lead.customer_name || lead.name || 'L').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{lead.customer_name || lead.name || `Lead #${lead.id.slice(0, 6)}`}</p>
                    <p className="text-xs text-slate-400">{new Date(lead.created_at).toLocaleDateString('nb-NO')}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    lead.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' :
                    lead.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {lead.status === 'ACCEPTED' ? 'Akseptert' : lead.status === 'REJECTED' ? 'Avvist' : 'Ny'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Unpaid invoices */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-500" />
              <h2 className="font-semibold text-slate-800">Ubetalte fakturaer</h2>
            </div>
            <Link href="/dashboard/invoices" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Se alle <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <div className="h-6 w-24 bg-slate-100 rounded animate-pulse" />
                  <div className="h-6 w-16 bg-slate-50 rounded animate-pulse ml-auto" />
                </div>
              ))
            ) : outstanding.length === 0 ? (
              <div className="p-8 text-center">
                <Star className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Alle fakturaer er betalt</p>
              </div>
            ) : (
              outstanding.slice(0, 5).map((inv) => (
                <div key={inv.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{inv.customer?.name || 'Ukjent kunde'}</p>
                    <p className="text-xs text-slate-400">
                      Forfall: {inv.due_date ? new Date(inv.due_date).toLocaleDateString('nb-NO') : '—'}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-orange-600">
                    {(inv.amount || 0).toLocaleString('nb-NO')} kr
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Niche tip banner */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold">{tip.title}</p>
            <p className="text-sm text-blue-100 max-w-xl">{tip.body}</p>
          </div>
        </div>
        <Link href={tip.href}
          className="flex-shrink-0 bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
        >
          {tip.cta}
        </Link>
      </div>
    </div>
  );
}


const quickLinks = [
  { label: 'Ny Lead', href: '/dashboard/leads', icon: FileText, color: 'bg-blue-500' },
  { label: 'Ny Faktura', href: '/dashboard/invoices', icon: DollarSign, color: 'bg-emerald-500' },
  { label: 'AI Assistent', href: '/dashboard/ai-assistant', icon: Bot, color: 'bg-purple-500' },
  { label: 'Kalender', href: '/dashboard/calendar', icon: Bell, color: 'bg-orange-500' },
];

export default function DashboardOverview() {
  const [health, setHealth] = useState<'GREEN' | 'YELLOW' | 'RED'>('GREEN');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/leads').then((r) => r.json()).catch(() => ({ leads: [] })),
      fetch('/api/cashflow/health').then((r) => r.json()).catch(() => ({ health: 'GREEN', income: 0, expense: 0 })),
      fetch('/api/invoices').then((r) => r.json()).catch(() => ({ invoices: [] })),
    ]).then(([l, c, i]) => {
      setLeads(l.leads || []);
      setInvoices(i.invoices || []);
      setHealth(c.health || 'GREEN');
      setIncome(c.income || 0);
      setExpense(c.expense || 0);
      setLoading(false);
    });
  }, []);

  const outstanding = invoices.filter((i) => i.status !== 'PAID');
  const outstandingAmount = outstanding.reduce((s, i) => s + (i.amount || 0), 0);
  const netProfit = income - expense;
  const newLeads = leads.filter((l) => {
    const d = new Date(l.created_at);
    const now = new Date();
    return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
  });

  const healthConfig = {
    GREEN: { label: 'God økonomi', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: TrendingUp },
    YELLOW: { label: 'Sjekk økonomi', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: AlertCircle },
    RED: { label: 'Kritisk økonomi', color: 'text-red-600 bg-red-50 border-red-200', icon: TrendingDown },
  };
  const hc = healthConfig[health];
  const HealthIcon = hc.icon;

  const stats = [
    {
      label: 'Leads (30d)', value: leads.length, sub: `+${newLeads.length} denne uken`,
      icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', trend: newLeads.length > 0,
      href: '/dashboard/leads',
    },
    {
      label: 'Inntekter', value: `${income.toLocaleString('nb-NO')} kr`, sub: 'Denne måneden',
      icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: income > expense,
      href: '/dashboard/cashflow',
    },
    {
      label: 'Netto resultat', value: `${netProfit.toLocaleString('nb-NO')} kr`, sub: 'Inntekt minus utgifter',
      icon: Activity, color: netProfit >= 0 ? 'text-emerald-600' : 'text-red-600',
      bg: netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50', trend: netProfit >= 0,
      href: '/dashboard/cashflow',
    },
    {
      label: 'Ubetalte fakturaer', value: `${outstandingAmount.toLocaleString('nb-NO')} kr`,
      sub: `${outstanding.length} fakturaer venter`,
      icon: DollarSign, color: outstanding.length > 0 ? 'text-orange-600' : 'text-slate-600',
      bg: outstanding.length > 0 ? 'bg-orange-50' : 'bg-slate-50', trend: outstanding.length === 0,
      href: '/dashboard/invoices',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Oversikt</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('nb-NO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${hc.color}`}>
          <HealthIcon className="h-4 w-4" />
          {hc.label}
        </span>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickLinks.map(({ label, href, icon: Icon, color }) => (
          <Link key={href} href={href}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:shadow-md hover:border-slate-300 transition-all group"
          >
            <div className={`h-9 w-9 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{label}</span>
            <ChevronRight className="h-4 w-4 text-slate-400 ml-auto group-hover:text-slate-600" />
          </Link>
        ))}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href}
            className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-lg hover:border-slate-300 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
            {loading ? (
              <div className="h-8 w-24 bg-slate-100 rounded animate-pulse mb-1" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">{value}</p>
            )}
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            <p className="text-xs text-slate-400 mt-1">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Two columns: Recent Leads + Outstanding Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent leads */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <h2 className="font-semibold text-slate-800">Siste leads</h2>
            </div>
            <Link href="/dashboard/leads" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Se alle <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                    <div className="h-2 w-20 bg-slate-50 rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : leads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">Ingen leads ennå</div>
            ) : (
              leads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-blue-600">
                      {(lead.customer_name || lead.name || 'L').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{lead.customer_name || lead.name || `Lead #${lead.id.slice(0, 6)}`}</p>
                    <p className="text-xs text-slate-400">{new Date(lead.created_at).toLocaleDateString('nb-NO')}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    lead.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' :
                    lead.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {lead.status === 'ACCEPTED' ? 'Akseptert' : lead.status === 'REJECTED' ? 'Avvist' : 'Ny'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Unpaid invoices */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-500" />
              <h2 className="font-semibold text-slate-800">Ubetalte fakturaer</h2>
            </div>
            <Link href="/dashboard/invoices" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Se alle <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <div className="h-6 w-24 bg-slate-100 rounded animate-pulse" />
                  <div className="h-6 w-16 bg-slate-50 rounded animate-pulse ml-auto" />
                </div>
              ))
            ) : outstanding.length === 0 ? (
              <div className="p-8 text-center">
                <Star className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Alle fakturaer er betalt</p>
              </div>
            ) : (
              outstanding.slice(0, 5).map((inv) => (
                <div key={inv.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{inv.customer?.name || 'Ukjent kunde'}</p>
                    <p className="text-xs text-slate-400">
                      Forfall: {inv.due_date ? new Date(inv.due_date).toLocaleDateString('nb-NO') : '—'}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-orange-600">
                    {(inv.amount || 0).toLocaleString('nb-NO')} kr
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* AI tip banner */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold">AI Salgsassistent klar</p>
            <p className="text-sm text-blue-100">Spar 1-2 timer daglig med automatisk CRM-oppdatering og oppfølging</p>
          </div>
        </div>
        <Link href="/dashboard/ai-assistant"
          className="flex-shrink-0 bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
        >
          Kom i gang
        </Link>
      </div>
    </div>
  );
}
