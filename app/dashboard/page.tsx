'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, Users, FileText, DollarSign, AlertCircle,
  ArrowUpRight, Calendar, Star, Activity, ChevronRight, Zap,
  Wrench, Scale, Home, Scissors, BarChart3, Package, Clock, MessageSquare,
  Hammer, Paintbrush, Sparkles, BookOpen, Monitor, Truck,
  Car, Megaphone, Smile, Leaf, Building2, Receipt, Target, Shield,
  UserCheck, Bell, RefreshCw, Settings, PieChart, Layers, Heart,
  ListChecks, LayoutGrid, Mail, CheckCircle, Plus, Dumbbell,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import { getNiche, type Niche } from '@/lib/niches';

// ─── Types ───────────────────────────────────────────────────────────────────
type Lead = { id: string; created_at: string; status?: string; customer_name?: string; name?: string };
type Invoice = { id: string; amount: number; status: string; due_date?: string; customer?: { name: string } };

// ─── Niche icon map (no emojis) ──────────────────────────────────────────────
const NICHE_ICONS: Record<string, React.ElementType> = {
  rorlegger:          Wrench,
  elektriker:         Zap,
  snekker:            Hammer,
  maler:              Paintbrush,
  rengjoring:         Sparkles,
  frisor:             Scissors,
  hudpleie:           Heart,
  'personlig-trener': Dumbbell,
  regnskapsforer:     BookOpen,
  'it-konsulent':     Monitor,
  eiendomsmegler:     Home,
  vaktmester:         Building2,
  restaurant:         Receipt,
  transport:          Truck,
  bilverksted:        Car,
  markedsbyra:        Megaphone,
  tannlege:           Smile,
  advokat:            Scale,
  landbruk:           Leaf,
};

const NICHE_COLORS: Record<string, { bg: string; text: string; border: string; light: string }> = {
  rorlegger:          { bg: 'bg-blue-600',    text: 'text-blue-600',    border: 'border-blue-200',    light: 'bg-blue-50' },
  elektriker:         { bg: 'bg-yellow-500',  text: 'text-yellow-600',  border: 'border-yellow-200',  light: 'bg-yellow-50' },
  snekker:            { bg: 'bg-amber-600',   text: 'text-amber-700',   border: 'border-amber-200',   light: 'bg-amber-50' },
  maler:              { bg: 'bg-pink-500',    text: 'text-pink-600',    border: 'border-pink-200',    light: 'bg-pink-50' },
  rengjoring:         { bg: 'bg-cyan-600',    text: 'text-cyan-700',    border: 'border-cyan-200',    light: 'bg-cyan-50' },
  frisor:             { bg: 'bg-rose-500',    text: 'text-rose-600',    border: 'border-rose-200',    light: 'bg-rose-50' },
  hudpleie:           { bg: 'bg-purple-500',  text: 'text-purple-600',  border: 'border-purple-200',  light: 'bg-purple-50' },
  'personlig-trener': { bg: 'bg-green-600',   text: 'text-green-700',   border: 'border-green-200',   light: 'bg-green-50' },
  regnskapsforer:     { bg: 'bg-teal-600',    text: 'text-teal-700',    border: 'border-teal-200',    light: 'bg-teal-50' },
  'it-konsulent':     { bg: 'bg-indigo-600',  text: 'text-indigo-600',  border: 'border-indigo-200',  light: 'bg-indigo-50' },
  eiendomsmegler:     { bg: 'bg-slate-700',   text: 'text-slate-700',   border: 'border-slate-300',   light: 'bg-slate-50' },
  vaktmester:         { bg: 'bg-stone-600',   text: 'text-stone-700',   border: 'border-stone-200',   light: 'bg-stone-50' },
  restaurant:         { bg: 'bg-orange-500',  text: 'text-orange-600',  border: 'border-orange-200',  light: 'bg-orange-50' },
  transport:          { bg: 'bg-sky-600',     text: 'text-sky-700',     border: 'border-sky-200',     light: 'bg-sky-50' },
  bilverksted:        { bg: 'bg-zinc-700',    text: 'text-zinc-700',    border: 'border-zinc-300',    light: 'bg-zinc-50' },
  markedsbyra:        { bg: 'bg-fuchsia-600', text: 'text-fuchsia-700', border: 'border-fuchsia-200', light: 'bg-fuchsia-50' },
  tannlege:           { bg: 'bg-sky-500',     text: 'text-sky-600',     border: 'border-sky-200',     light: 'bg-sky-50' },
  advokat:            { bg: 'bg-slate-800',   text: 'text-slate-800',   border: 'border-slate-300',   light: 'bg-slate-50' },
  landbruk:           { bg: 'bg-lime-600',    text: 'text-lime-700',    border: 'border-lime-300',    light: 'bg-lime-50' },
};

const DEFAULT_COLOR = { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' };

// ─── Module definitions ───────────────────────────────────────────────────────
const MODULE_DEFS: Record<string, { label: string; href: string; icon: React.ElementType; desc: string }> = {
  leads:                { label: 'Leads',            href: '/dashboard/leads',            icon: Users,         desc: 'Innkomne henvendelser' },
  invoices:             { label: 'Fakturaer',         href: '/dashboard/invoices',         icon: Receipt,       desc: 'Fakturering og betaling' },
  proposals:            { label: 'Tilbud',            href: '/dashboard/proposals',        icon: FileText,      desc: 'Kalkyler og tilbud' },
  inventory:            { label: 'Lager',             href: '/dashboard/inventory',        icon: Package,       desc: 'Produkt og materiell' },
  customers:            { label: 'Kunder',            href: '/dashboard/customers',        icon: UserCheck,     desc: 'Kunderegister og historikk' },
  tasks:                { label: 'Oppgaver',          href: '/dashboard/tasks',            icon: ListChecks,    desc: 'Gjorelisteoppgaver' },
  forms:                { label: 'Skjemaer',          href: '/dashboard/forms',            icon: LayoutGrid,    desc: 'Kontaktskjemaer' },
  cashflow:             { label: 'Kontantstrom',      href: '/dashboard/cashflow',         icon: TrendingUp,    desc: 'Okonomioversikt' },
  calendar:             { label: 'Kalender',          href: '/dashboard/calendar',         icon: Calendar,      desc: 'Timebok og avtaler' },
  pipeline:             { label: 'Pipeline',          href: '/dashboard/pipeline',         icon: Layers,        desc: 'Salgspipeline' },
  workflows:            { label: 'Automatisering',    href: '/dashboard/workflows',        icon: RefreshCw,     desc: 'Automatiske flyter' },
  'client-portal':      { label: 'Klientportal',      href: '/dashboard/client-portal',    icon: Shield,        desc: 'Sikker dokumentdeling' },
  campaigns:            { label: 'Kampanjer',         href: '/dashboard/campaigns',        icon: Megaphone,     desc: 'E-post og SMS-kampanjer' },
  'review-gatekeeper':  { label: 'Anmeldelser',       href: '/dashboard/review-gatekeeper',icon: Star,          desc: 'Google-anmeldelser' },
  'social-planner':     { label: 'Sosiale medier',    href: '/dashboard/social-planner',   icon: MessageSquare, desc: 'Innholdsplanlegging' },
  analytics:            { label: 'Analyser',          href: '/dashboard/analytics',        icon: BarChart3,     desc: 'Statistikk og KPIer' },
  'time-tracking':      { label: 'Timeregistrering',  href: '/dashboard/time-tracking',    icon: Clock,         desc: 'Timer og fakturering' },
  settings:             { label: 'Innstillinger',     href: '/dashboard/settings',         icon: Settings,      desc: 'Kontoinnstillinger' },
  'email-sequences':    { label: 'E-postsekvenser',   href: '/dashboard/email-sequences',  icon: Mail,          desc: 'Automatisk oppfolging' },
  jobs:                 { label: 'Oppdrag',           href: '/dashboard/jobs',             icon: Wrench,        desc: 'Jobbstyring' },
};

// ─── Per-niche highlighted quick actions ─────────────────────────────────────
const NICHE_QUICK: Record<string, string[]> = {
  rorlegger:          ['leads', 'proposals', 'invoices', 'calendar'],
  elektriker:         ['leads', 'proposals', 'invoices', 'inventory'],
  snekker:            ['leads', 'proposals', 'invoices', 'tasks'],
  maler:              ['leads', 'proposals', 'invoices', 'campaigns'],
  rengjoring:         ['calendar', 'customers', 'invoices', 'workflows'],
  frisor:             ['calendar', 'customers', 'campaigns', 'invoices'],
  hudpleie:           ['calendar', 'customers', 'campaigns', 'inventory'],
  'personlig-trener': ['calendar', 'customers', 'invoices', 'workflows'],
  regnskapsforer:     ['customers', 'invoices', 'cashflow', 'client-portal'],
  'it-konsulent':     ['pipeline', 'customers', 'time-tracking', 'invoices'],
  eiendomsmegler:     ['pipeline', 'leads', 'campaigns', 'analytics'],
  vaktmester:         ['customers', 'tasks', 'invoices', 'calendar'],
  restaurant:         ['calendar', 'campaigns', 'review-gatekeeper', 'cashflow'],
  transport:          ['leads', 'invoices', 'customers', 'calendar'],
  bilverksted:        ['leads', 'jobs', 'invoices', 'inventory'],
  markedsbyra:        ['pipeline', 'customers', 'social-planner', 'analytics'],
  tannlege:           ['calendar', 'customers', 'invoices', 'review-gatekeeper'],
  advokat:            ['pipeline', 'customers', 'invoices', 'client-portal'],
  landbruk:           ['leads', 'customers', 'invoices', 'calendar'],
};

// ─── Per-niche contextual tip ─────────────────────────────────────────────────
const NICHE_TIPS: Record<string, { title: string; body: string; cta: string; href: string }> = {
  rorlegger:          { title: 'Svar forst, vinn jobben', body: 'Bedrifter som svarer innen 5 minutter vinner 70% av oppdragene. Sett opp auto-svar pa nye leads og la FlowPilot ta seg av oppfolgingen.', cta: 'Sett opp auto-svar', href: '/dashboard/workflows' },
  elektriker:         { title: 'Automatiser tilbudet', body: 'Send kalkyle innen 10 minutter etter en forsporsel. AI-assistenten lager forste utkast basert pa oppdragsbeskrivelsen.', cta: 'Lag tilbud na', href: '/dashboard/proposals' },
  snekker:            { title: 'Del-fakturering gir bedre kontantflyt', body: 'Fakturér 30% pa oppstart, 40% under og 30% ved ferdigstillelse. Unnga ventende betaling ved slutt av stort prosjekt.', cta: 'Konfigurer fakturering', href: '/dashboard/invoices' },
  maler:              { title: 'Reaktiver sesonkunder', body: 'Send varkampanje til alle eksisterende kunder automatisk. Kunder som har brukt deg for bestiller igjen nar de far riktig tilbud til rett tid.', cta: 'Lag kampanje', href: '/dashboard/campaigns' },
  rengjoring:         { title: 'Automatiser gjentakende fakturaer', body: 'Kunder med fast vask trenger ikke manuell fakturering. Sett opp automatisk faktura pa avtalens dato – sporr aldri igjen.', cta: 'Sett opp avtale', href: '/dashboard/workflows' },
  frisor:             { title: 'Reduser no-show med 60%', body: 'Automatisk papminnelse 24 timer og 2 timer for time reduserer uteblivelse drastisk. Sett det opp en gang – kjorer for alltid.', cta: 'Aktiver paminnelse', href: '/dashboard/workflows' },
  hudpleie:           { title: 'Anbefal neste behandling', body: 'Kunder som far en personlig anbefaling etter behandling booker dobbelt sa hyppig. Automatiser oppfolging basert pa siste behandling.', cta: 'Sett opp oppfolging', href: '/dashboard/email-sequences' },
  'personlig-trener': { title: 'Stopp frafall tidlig', body: 'Klienter som ikke har vaert innom pa 2 uker faller gjerne ut. FlowPilot varsler deg automatisk sa du kan ta kontakt for det er for sent.', cta: 'Aktiver frafall-varsel', href: '/dashboard/workflows' },
  regnskapsforer:     { title: 'Profesjonell klientportal', body: 'Del rapporter og dokumenter via klientportalen istedenfor e-post. Mer sporbart, mer profesjonelt – klientene elsker det.', cta: 'Apne klientportal', href: '/dashboard/client-portal' },
  'it-konsulent':     { title: 'Dokumenter scope for fakturering', body: 'Scope creep er den vanligste arsaken til tapte penger. Fa klienten til a signere scope digitalt – endringsordrer faktureres rettferdig.', cta: 'Se pipeline', href: '/dashboard/pipeline' },
  eiendomsmegler:     { title: 'Automatisk matching av kjoper og objekt', body: 'Nytt objekt? FlowPilot varsler automatisk alle kjopere med matchende sokeprofil. Ingen manuell gjennomgang – aldri.', cta: 'Se kjoperprofiler', href: '/dashboard/customers' },
  vaktmester:         { title: 'Serviceintervall pa autopilot', body: 'Ventilasjon, brannvern og heis har faste serviceintervall. FlowPilot varsler deg og sender papminnelse til eiendomseier automatisk.', cta: 'Sett serviceintervall', href: '/dashboard/calendar' },
  restaurant:         { title: 'Anmeldelser gir fulle bord', body: 'Gjester som legger igjen anmeldelse kommer tilbake dobbelt sa hyppig. Automatiser Google-anmeldelsesforesporselen etter hvert besok.', cta: 'Aktiver anmeldelse', href: '/dashboard/review-gatekeeper' },
  transport:          { title: 'Fakturé noyaktig pa kilometer', body: 'GPS-basert kilometerlogg kobles direkte til fakturaen. Ingen diskusjon med kunden om faktisk kjoring – alt er dokumentert.', cta: 'Se fakturaer', href: '/dashboard/invoices' },
  bilverksted:        { title: 'Ferdig-SMS oker tilfredshet', body: 'Kunden far automatisk melding nar bilen er klar. Enkelt, profesjonelt og eliminerer alle innringinger i lopet av dagen.', cta: 'Se kundeliste', href: '/dashboard/customers' },
  markedsbyra:        { title: 'Automatiser maandsrapporten', body: 'Klienten forventer resultater – lag profesjonell rapport pa ett minutt. Spar 2-3 timer per klient per maned.', cta: 'Se analyser', href: '/dashboard/analytics' },
  tannlege:           { title: 'Halvarsinnkalling pa autopilot', body: 'Pasienter uten innkalling hopper over kontrollen. Automatisk SMS halvaret etter siste time fyller timeboka uten noe manuelt arbeid.', cta: 'Aktiver innkalling', href: '/dashboard/workflows' },
  advokat:            { title: 'Timefakturering uten tap', body: 'Manuell timeregistrering gir gjennomsnittlig 15% tapte fakturerbare timer. Logg direkte i sakspipelinen og fakturer alt.', cta: 'Se pipeline', href: '/dashboard/pipeline' },
  landbruk:           { title: 'Reaktiver sesonkunder automatisk', body: 'Kunder med klippeavtale i fjor kontaktes automatisk na. Sett opp sesongreaktivering en gang – den kjorer hvert ar.', cta: 'Sett opp kampanje', href: '/dashboard/campaigns' },
};

const DEFAULT_TIP = {
  title: 'Kom i gang med AI-assistenten',
  body: 'FlowPilot AI kan skrive tilbud, svare pa leads og analysere kontantstrommen – alt automatisk. Spar timer hver uke.',
  cta: 'Apne AI-assistent',
  href: '/dashboard/ai-assistant',
};

// ─── Dashboard component ──────────────────────────────────────────────────────
export default function DashboardOverview() {
  const [health, setHealth]     = useState<'GREEN' | 'YELLOW' | 'RED'>('GREEN');
  const [leads, setLeads]       = useState<Lead[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [income, setIncome]     = useState(0);
  const [expense, setExpense]   = useState(0);
  const [loading, setLoading]   = useState(true);
  const [nicheId, setNicheId]   = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/leads').then(r => r.json()).catch(() => ({ leads: [] })),
      fetch('/api/cashflow/health').then(r => r.json()).catch(() => ({ health: 'GREEN', income: 0, expense: 0 })),
      fetch('/api/invoices').then(r => r.json()).catch(() => ({ invoices: [] })),
      fetch('/api/onboarding/niche').then(r => r.json()).catch(() => ({ nicheId: null })),
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

  const niche: Niche | undefined    = nicheId ? getNiche(nicheId) : undefined;
  const nc                           = (nicheId && NICHE_COLORS[nicheId]) ? NICHE_COLORS[nicheId] : DEFAULT_COLOR;
  const NicheIcon: React.ElementType = (nicheId && NICHE_ICONS[nicheId]) ? NICHE_ICONS[nicheId] : Target;
  const tip                          = (nicheId && NICHE_TIPS[nicheId]) ? NICHE_TIPS[nicheId] : DEFAULT_TIP;

  const quickKeys   = niche ? (NICHE_QUICK[nicheId!] || niche.modules.filter(m => m !== 'dashboard' && m !== 'settings').slice(0, 4)) : ['leads', 'invoices', 'cashflow', 'calendar'];
  const quickActions = quickKeys.map(k => MODULE_DEFS[k]).filter(Boolean);
  const allModules   = niche ? niche.modules.filter(m => m !== 'dashboard').map(k => MODULE_DEFS[k]).filter(Boolean) : [];

  const outstanding  = invoices.filter(i => i.status !== 'PAID');
  const outstandingAmt = outstanding.reduce((s, i) => s + (i.amount || 0), 0);
  const netProfit    = income - expense;
  const newThisWeek  = leads.filter(l => (Date.now() - new Date(l.created_at).getTime()) < 7 * 86400000);

  // compute leads per week (last 4 weeks) for bar chart
  const weeklyLeads = Array.from({ length: 4 }, (_, wi) => {
    const end   = Date.now() - wi * 7 * 86400000;
    const start = end - 7 * 86400000;
    const count = leads.filter(l => {
      const t = new Date(l.created_at).getTime();
      return t >= start && t < end;
    }).length;
    const label = wi === 0 ? 'Denne uka' : wi === 1 ? 'Forrige' : `${wi + 1} uker siden`;
    return { label, count };
  }).reverse();

  // income vs expense chart
  const financeData = [
    { label: 'Inntekter', value: income },
    { label: 'Utgifter', value: expense },
    { label: 'Resultat', value: Math.max(0, netProfit) },
  ];

  const healthCfg = {
    GREEN:  { label: 'God okonomi',     color: 'text-emerald-600 bg-emerald-50 border-emerald-200', Icon: TrendingUp },
    YELLOW: { label: 'Sjekk okonomi',   color: 'text-yellow-600 bg-yellow-50 border-yellow-200',   Icon: AlertCircle },
    RED:    { label: 'Kritisk okonomi', color: 'text-red-600 bg-red-50 border-red-200',             Icon: TrendingDown },
  };
  const hc = healthCfg[health];
  const HealthIcon = hc.Icon;

  const dateStr = new Date().toLocaleDateString('nb-NO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6 pb-8">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl ${nc.bg} flex items-center justify-center shadow-sm flex-shrink-0`}>
            <NicheIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{niche ? niche.name : 'Oversikt'}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{niche ? niche.tagline : dateStr}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {niche && (
            <span className={`text-xs px-3 py-1.5 rounded-full ${nc.light} ${nc.border} border ${nc.text} font-semibold`}>
              {niche.priceMonthly.toLocaleString('nb-NO')} kr / mnd
            </span>
          )}
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${hc.color}`}>
            <HealthIcon className="h-4 w-4" />
            {hc.label}
          </span>
          <Link href="/dashboard/settings"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Innstillinger
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map(({ label, href, icon: Icon, desc }) => (
          <Link key={href} href={href}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className={`h-9 w-9 rounded-lg ${nc.bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-slate-800 block leading-tight">{label}</span>
              <span className="text-xs text-slate-400 block truncate mt-0.5">{desc}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0" />
          </Link>
        ))}
      </div>

      {/* KPI Cards + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* KPI: Leads */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Leads denne m&aring;neden</p>
              {loading ? (
                <div className="h-8 w-24 bg-slate-100 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-3xl font-bold text-slate-900 mt-1">{leads.length}</p>
              )}
              <p className="text-xs text-slate-400 mt-1">
                <span className={newThisWeek.length > 0 ? 'text-emerald-600 font-medium' : ''}>
                  +{newThisWeek.length} denne uken
                </span>
              </p>
            </div>
            <Link href="/dashboard/leads" className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors">
              <Users className="h-4 w-4 text-blue-600" />
            </Link>
          </div>
          <div className="h-28">
            {loading ? (
              <div className="h-full w-full bg-slate-50 rounded-lg animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyLeads} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} width={20} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="count" name="Leads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* KPI: Okonomi */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Inntekter denne m&aring;neden</p>
              {loading ? (
                <div className="h-8 w-32 bg-slate-100 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-3xl font-bold text-slate-900 mt-1">{income.toLocaleString('nb-NO')} kr</p>
              )}
              <p className="text-xs mt-1">
                <span className={netProfit >= 0 ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>
                  {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString('nb-NO')} kr netto
                </span>
                {outstanding.length > 0 && (
                  <span className="text-slate-400 ml-2">· {outstanding.length} fakturaer ubetalt</span>
                )}
              </p>
            </div>
            <Link href="/dashboard/cashflow" className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 transition-colors">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </Link>
          </div>
          <div className="h-28">
            {loading ? (
              <div className="h-full w-full bg-slate-50 rounded-lg animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financeData} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40}
                    tickFormatter={(v: number) => v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                    formatter={((v: number, name: string) => [`${v.toLocaleString('nb-NO')} kr`, name]) as any}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="value" name="Beløp" radius={[4, 4, 0, 0]}
                    fill="#10b981"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* All niche modules grid */}
      {niche && allModules.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="font-semibold text-slate-800">Dine moduler</h2>
              <p className="text-xs text-slate-500 mt-0.5">{allModules.length} aktive moduler inkludert i din plan</p>
            </div>
            <div className={`h-7 w-7 rounded-lg ${nc.bg} flex items-center justify-center`}>
              <LayoutGrid className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-slate-100">
            {allModules.map(({ label, href, icon: Icon, desc }) => (
              <Link key={href} href={href}
                className="group bg-white p-4 hover:bg-slate-50 transition-colors flex flex-col gap-2"
              >
                <div className={`h-8 w-8 rounded-lg ${nc.light} ${nc.border} border flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${nc.text}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 leading-tight">{label}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Niche features — no emojis, checkmark icons */}
      {niche && niche.nicheFeatures.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="font-semibold text-slate-800">Spesialverktoy for {niche.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">Inkludert i planen – konfigurert for din bransje</p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${nc.light} ${nc.text} ${nc.border} border`}>
              {niche.nicheFeatures.length} verktoy
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x divide-slate-100">
            {niche.nicheFeatures.slice(0, 4).map((f, i) => (
              <div key={i} className="p-5 hover:bg-slate-50 transition-colors border-b border-slate-100 lg:border-b-0">
                <div className={`inline-flex h-7 w-7 rounded-md ${nc.light} ${nc.border} border items-center justify-center mb-3`}>
                  <CheckCircle className={`h-3.5 w-3.5 ${nc.text}`} />
                </div>
                <p className="text-sm font-semibold text-slate-800 leading-tight">{f.name}</p>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          {niche.nicheFeatures.length > 4 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x divide-slate-100 border-t border-slate-100">
              {niche.nicheFeatures.slice(4).map((f, i) => (
                <div key={i} className="p-5 hover:bg-slate-50 transition-colors">
                  <div className={`inline-flex h-7 w-7 rounded-md ${nc.light} ${nc.border} border items-center justify-center mb-3`}>
                    <CheckCircle className={`h-3.5 w-3.5 ${nc.text}`} />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 leading-tight">{f.name}</p>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Leads + Invoices split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent leads */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-slate-800">Siste leads</h2>
            </div>
            <Link href="/dashboard/leads" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
              Se alle <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-50 last:border-0">
                <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                  <div className="h-2.5 w-20 bg-slate-50 rounded animate-pulse" />
                </div>
              </div>
            ))
          ) : leads.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Users className="h-8 w-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Ingen leads enna</p>
              <Link href="/dashboard/forms" className="text-xs text-blue-600 hover:underline mt-1 inline-block">Sett opp kontaktskjema</Link>
            </div>
          ) : (
            leads.slice(0, 5).map(lead => {
              const name = lead.customer_name || lead.name || `Lead #${lead.id.slice(0, 6)}`;
              const STATUS_MAP: Record<string, { label: string; color: string }> = {
                ACCEPTED:  { label: 'Akseptert', color: 'bg-emerald-100 text-emerald-700' },
                REJECTED:  { label: 'Avvist',    color: 'bg-red-100 text-red-700' },
                CONTACTED: { label: 'Kontaktet', color: 'bg-purple-100 text-purple-700' },
                PENDING:   { label: 'Venter',    color: 'bg-yellow-100 text-yellow-700' },
              };
              const s = STATUS_MAP[lead.status || ''] || { label: 'Ny', color: 'bg-blue-100 text-blue-700' };
              return (
                <Link key={lead.id} href={`/dashboard/leads/${lead.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <div className={`h-8 w-8 rounded-full ${nc.light} ${nc.border} border flex items-center justify-center flex-shrink-0`}>
                    <span className={`text-xs font-bold ${nc.text}`}>{name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{name}</p>
                    <p className="text-xs text-slate-400">{new Date(lead.created_at).toLocaleDateString('nb-NO')}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${s.color}`}>{s.label}</span>
                </Link>
              );
            })
          )}
          <div className="px-5 py-3 border-t border-slate-50">
            <Link href="/dashboard/leads" className={`text-xs font-medium ${nc.text} hover:underline flex items-center gap-1`}>
              <Plus className="h-3 w-3" /> Se alle leads
            </Link>
          </div>
        </div>

        {/* Unpaid invoices */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-orange-500" />
              <h2 className="text-sm font-semibold text-slate-800">Ubetalte fakturaer</h2>
            </div>
            <Link href="/dashboard/invoices" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
              Se alle <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50 last:border-0">
                <div className="h-3 w-28 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
              </div>
            ))
          ) : outstanding.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Alle fakturaer er betalt</p>
              <p className="text-xs text-slate-400 mt-0.5">Godt jobbet</p>
            </div>
          ) : (
            outstanding.slice(0, 5).map(inv => (
              <Link key={inv.id} href={`/dashboard/invoices/${inv.id}`}
                className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{inv.customer?.name || 'Ukjent kunde'}</p>
                  <p className="text-xs text-slate-400">Forfall: {inv.due_date ? new Date(inv.due_date).toLocaleDateString('nb-NO') : '—'}</p>
                </div>
                <span className="text-sm font-semibold text-orange-600">{(inv.amount || 0).toLocaleString('nb-NO')} kr</span>
              </Link>
            ))
          )}
          <div className="px-5 py-3 border-t border-slate-50">
            <Link href="/dashboard/invoices" className={`text-xs font-medium ${nc.text} hover:underline flex items-center gap-1`}>
              <Plus className="h-3 w-3" /> Ny faktura
            </Link>
          </div>
        </div>
      </div>

      {/* Contextual tip banner — niche color, no emojis */}
      <div className={`rounded-xl ${nc.bg} p-5 text-white flex items-center justify-between gap-4 flex-wrap`}>
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-base">{tip.title}</p>
            <p className="text-sm mt-0.5 text-white/80 max-w-lg">{tip.body}</p>
          </div>
        </div>
        <Link href={tip.href}
          className="flex-shrink-0 bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
        >
          {tip.cta}
        </Link>
      </div>

      {/* Secondary tools row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'AI Assistent',    href: '/dashboard/ai-assistant',    Icon: Zap,         desc: 'Skriv tilbud og svar leads' },
          { label: 'E-postsekvenser', href: '/dashboard/email-sequences', Icon: Mail,         desc: 'Automatisk oppfolging' },
          { label: 'Analyser',        href: '/dashboard/analytics',       Icon: BarChart3,    desc: 'KPIer og statistikk' },
          { label: 'Vekstplanlegger', href: '/dashboard/growth-planner',  Icon: TrendingUp,   desc: 'Strategisk vekstplan' },
        ].map(({ label, href, Icon, desc }) => (
          <Link key={href} href={href}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Icon className="h-4 w-4 text-slate-600 group-hover:text-slate-800" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-slate-700 block leading-tight">{label}</span>
              <span className="text-xs text-slate-400 block truncate">{desc}</span>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
