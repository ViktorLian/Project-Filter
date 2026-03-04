'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Wrench, Zap, Hammer, Paintbrush, Sparkles, Scissors, Heart, Dumbbell,
  BookOpen, Monitor, Home, Building2, Receipt, Truck, Car, Megaphone,
  Smile, Scale, Leaf, Users, TrendingUp, TrendingDown, Activity, CheckCircle,
  ChevronRight, LayoutGrid, Settings, Mail, BarChart3, Package, Clock,
  MessageSquare, UserCheck, RefreshCw, Star, Shield, Calendar, ListChecks,
  FileText, Layers, Target, AlertCircle, ArrowRight, ExternalLink, PieChart,
  DollarSign, Zap as ZapIcon,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getNiche, NICHES, type Niche } from '@/lib/niches';

// ─── Icon map ────────────────────────────────────────────────────────────────
const NICHE_ICONS: Record<string, React.ElementType> = {
  rorlegger: Wrench, elektriker: Zap, snekker: Hammer, maler: Paintbrush,
  rengjoring: Sparkles, frisor: Scissors, hudpleie: Heart,
  'personlig-trener': Dumbbell, regnskapsforer: BookOpen, 'it-konsulent': Monitor,
  eiendomsmegler: Home, vaktmester: Building2, restaurant: Receipt,
  transport: Truck, bilverksted: Car, markedsbyra: Megaphone,
  tannlege: Smile, advokat: Scale, landbruk: Leaf,
};

// ─── Color map ───────────────────────────────────────────────────────────────
const NICHE_COLORS: Record<string, { bg: string; text: string; border: string; light: string; chart: string }> = {
  rorlegger:          { bg: 'bg-blue-600',    text: 'text-blue-600',    border: 'border-blue-200',    light: 'bg-blue-50',    chart: '#3b82f6' },
  elektriker:         { bg: 'bg-yellow-500',  text: 'text-yellow-600',  border: 'border-yellow-200',  light: 'bg-yellow-50',  chart: '#eab308' },
  snekker:            { bg: 'bg-amber-600',   text: 'text-amber-700',   border: 'border-amber-200',   light: 'bg-amber-50',   chart: '#d97706' },
  maler:              { bg: 'bg-pink-500',    text: 'text-pink-600',    border: 'border-pink-200',    light: 'bg-pink-50',    chart: '#ec4899' },
  rengjoring:         { bg: 'bg-cyan-600',    text: 'text-cyan-700',    border: 'border-cyan-200',    light: 'bg-cyan-50',    chart: '#0891b2' },
  frisor:             { bg: 'bg-rose-500',    text: 'text-rose-600',    border: 'border-rose-200',    light: 'bg-rose-50',    chart: '#f43f5e' },
  hudpleie:           { bg: 'bg-purple-500',  text: 'text-purple-600',  border: 'border-purple-200',  light: 'bg-purple-50',  chart: '#a855f7' },
  'personlig-trener': { bg: 'bg-green-600',   text: 'text-green-700',   border: 'border-green-200',   light: 'bg-green-50',   chart: '#16a34a' },
  regnskapsforer:     { bg: 'bg-teal-600',    text: 'text-teal-700',    border: 'border-teal-200',    light: 'bg-teal-50',    chart: '#0d9488' },
  'it-konsulent':     { bg: 'bg-indigo-600',  text: 'text-indigo-700',  border: 'border-indigo-200',  light: 'bg-indigo-50',  chart: '#4f46e5' },
  eiendomsmegler:     { bg: 'bg-slate-700',   text: 'text-slate-700',   border: 'border-slate-300',   light: 'bg-slate-100',  chart: '#475569' },
  vaktmester:         { bg: 'bg-stone-600',   text: 'text-stone-700',   border: 'border-stone-200',   light: 'bg-stone-50',   chart: '#78716c' },
  restaurant:         { bg: 'bg-orange-500',  text: 'text-orange-600',  border: 'border-orange-200',  light: 'bg-orange-50',  chart: '#f97316' },
  transport:          { bg: 'bg-sky-600',     text: 'text-sky-700',     border: 'border-sky-200',     light: 'bg-sky-50',     chart: '#0284c7' },
  bilverksted:        { bg: 'bg-zinc-700',    text: 'text-zinc-700',    border: 'border-zinc-300',    light: 'bg-zinc-100',   chart: '#52525b' },
  markedsbyra:        { bg: 'bg-fuchsia-600', text: 'text-fuchsia-700', border: 'border-fuchsia-200', light: 'bg-fuchsia-50', chart: '#c026d3' },
  tannlege:           { bg: 'bg-sky-500',     text: 'text-sky-600',     border: 'border-sky-200',     light: 'bg-sky-50',     chart: '#0ea5e9' },
  advokat:            { bg: 'bg-slate-800',   text: 'text-slate-800',   border: 'border-slate-300',   light: 'bg-slate-50',   chart: '#1e293b' },
  landbruk:           { bg: 'bg-lime-600',    text: 'text-lime-700',    border: 'border-lime-300',    light: 'bg-lime-50',    chart: '#65a30d' },
};
const DEFAULT_COLOR = { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50', chart: '#3b82f6' };

// ─── Module definitions ───────────────────────────────────────────────────────
const MODULE_DEFS: Record<string, { label: string; href: string; icon: React.ElementType; desc: string }> = {
  leads:               { label: 'Leads',           href: '/dashboard/leads',            icon: Users,        desc: 'Innkomne henvendelser' },
  invoices:            { label: 'Fakturaer',        href: '/dashboard/invoices',         icon: Receipt,      desc: 'Fakturering og betaling' },
  proposals:           { label: 'Tilbud',           href: '/dashboard/proposals',        icon: FileText,     desc: 'Kalkyler og tilbud' },
  inventory:           { label: 'Lager',            href: '/dashboard/inventory',        icon: Package,      desc: 'Produkt og materiell' },
  customers:           { label: 'Kunder',           href: '/dashboard/customers',        icon: UserCheck,    desc: 'Kunderegister og historikk' },
  tasks:               { label: 'Oppgaver',         href: '/dashboard/tasks',            icon: ListChecks,   desc: 'Oppgavebehandling' },
  forms:               { label: 'Skjemaer',         href: '/dashboard/forms',            icon: LayoutGrid,   desc: 'Kontaktskjemaer' },
  cashflow:            { label: 'Okonomi',          href: '/dashboard/cashflow',         icon: TrendingUp,   desc: 'Kontantstromsoversikt' },
  calendar:            { label: 'Kalender',         href: '/dashboard/calendar',         icon: Calendar,     desc: 'Timebok og avtaler' },
  pipeline:            { label: 'Pipeline',         href: '/dashboard/pipeline',         icon: Layers,       desc: 'Salgspipeline' },
  workflows:           { label: 'Automatisering',   href: '/dashboard/workflows',        icon: RefreshCw,    desc: 'Automatiske flyter' },
  'client-portal':     { label: 'Klientportal',     href: '/dashboard/client-portal',    icon: Shield,       desc: 'Sikker dokumentdeling' },
  campaigns:           { label: 'Kampanjer',        href: '/dashboard/campaigns',        icon: Megaphone,    desc: 'E-post og SMS-kampanjer' },
  'review-gatekeeper': { label: 'Anmeldelser',      href: '/dashboard/review-gatekeeper',icon: Star,         desc: 'Google-anmeldelser' },
  'social-planner':    { label: 'Sosiale medier',   href: '/dashboard/social-planner',   icon: MessageSquare,desc: 'Innholdsplanlegging' },
  analytics:           { label: 'Analyser',         href: '/dashboard/analytics',        icon: BarChart3,    desc: 'Statistikk og KPIer' },
  'time-tracking':     { label: 'Timeregistrering', href: '/dashboard/time-tracking',    icon: Clock,        desc: 'Timer og fakturering' },
  settings:            { label: 'Innstillinger',    href: '/dashboard/settings',         icon: Settings,     desc: 'Kontoinnstillinger' },
  'email-sequences':   { label: 'E-postsekvenser',  href: '/dashboard/email-sequences',  icon: Mail,         desc: 'Automatisk oppfolging' },
  jobs:                { label: 'Oppdrag',          href: '/dashboard/jobs',             icon: Wrench,       desc: 'Jobbstyring og oppdrag' },
};

// ─── Per-niche mock stats (seeded from niche ID) ─────────────────────────────
function seed(nicheId: string): number {
  return nicheId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
}

function getMockData(nicheId: string) {
  const s = seed(nicheId);
  const leads = 11 + (s % 19);
  const newLeads = 2 + (s % 8);
  const income = 28000 + (s * 400);
  const expense = Math.round(income * (0.28 + (s % 10) * 0.01));
  const weeklyLeads = [
    { label: '4 uker', count: 2 + (s % 4) },
    { label: '3 uker', count: 3 + (s % 5) },
    { label: '2 uker', count: 4 + (s % 6) },
    { label: 'Forrige', count: 3 + (s % 7) },
    { label: 'Denne', count: newLeads },
  ];
  const financeData = [
    { label: 'Inntekter', value: income },
    { label: 'Utgifter',  value: expense },
    { label: 'Resultat',  value: income - expense },
  ];
  return { leads, newLeads, income, expense, weeklyLeads, financeData };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function NichePreviewPage() {
  const { nicheId } = useParams() as { nicheId: string };
  const niche = getNiche(nicheId);

  if (!niche) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Nisje ikke funnet</h1>
          <p className="text-slate-500 mb-6">Ugyldig nisje-ID: {nicheId}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-xl mx-auto">
            {NICHES.map(n => {
              const I = NICHE_ICONS[n.id] || Target;
              return (
                <Link key={n.id} href={`/preview/${n.id}`}
                  className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm text-slate-700 font-medium transition-colors">
                  <I className="h-4 w-4 text-slate-500 shrink-0" />
                  {n.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const nc = NICHE_COLORS[nicheId] ?? DEFAULT_COLOR;
  const NicheIcon = NICHE_ICONS[nicheId] ?? Target;
  const data = getMockData(nicheId);
  const allModules = niche.modules.filter(m => m !== 'dashboard').map(k => MODULE_DEFS[k]).filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-black text-slate-900 tracking-tight">FlowPilot</Link>
          <span className="hidden sm:inline text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full">
            Demo — {niche.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-xs text-slate-500">Alle data er demonstrasjon</span>
          <Link href={`/register?niche=${niche.id}`}
            className={`${nc.bg} text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-1.5`}>
            Start gratis <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Niche header */}
        <div className={`rounded-2xl ${nc.bg} p-6 text-white`}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <NicheIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-0.5">{niche.category}</p>
                <h1 className="text-2xl font-black text-white">{niche.name}</h1>
                <p className="text-white/80 text-sm mt-0.5">{niche.tagline}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="bg-white/20 border border-white/20 rounded-xl px-4 py-2.5">
                <p className="text-xs text-white/70">Pris per mnd</p>
                <p className="text-lg font-black text-white">fra {niche.priceMonthly.toLocaleString('nb-NO')} kr</p>
              </div>
              <div className="bg-white/20 border border-white/20 rounded-xl px-4 py-2.5">
                <p className="text-xs text-white/70">Inkluderte moduler</p>
                <p className="text-lg font-black text-white">{allModules.length} moduler</p>
              </div>
              <div className="bg-white/20 border border-white/20 rounded-xl px-4 py-2.5">
                <p className="text-xs text-white/70">Spesialverktoy</p>
                <p className="text-lg font-black text-white">{niche.nicheFeatures.length} verktoy</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2 KPICards with charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Leads KPI */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Leads siste 5 uker</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{data.leads}</p>
                <p className="text-xs text-emerald-600 font-medium mt-1">+{data.newLeads} denne uken</p>
              </div>
              <div className={`h-10 w-10 rounded-xl ${nc.light} ${nc.border} border flex items-center justify-center`}>
                <Users className={`h-5 w-5 ${nc.text}`} />
              </div>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weeklyLeads} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} width={18} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="count" name="Leads" fill={nc.chart} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue KPI */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inntekter denne maneden</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{data.income.toLocaleString('nb-NO')} kr</p>
                <p className="text-xs text-emerald-600 font-medium mt-1">
                  +{(data.income - data.expense).toLocaleString('nb-NO')} kr netto
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.financeData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40}
                    tickFormatter={(v: number) => v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    formatter={((v: number, n: string) => [`${v.toLocaleString('nb-NO')} kr`, n]) as any}
                    cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" name="Belop" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Module grid */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-900">Inkluderte moduler for {niche.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{allModules.length} aktive moduler tilpasset din bransje</p>
            </div>
            <div className={`h-8 w-8 rounded-lg ${nc.bg} flex items-center justify-center`}>
              <LayoutGrid className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-slate-100">
            {allModules.map(({ label, href, icon: Icon, desc }) => (
              <div key={href}
                className="bg-white p-4 hover:bg-slate-50 transition-colors flex flex-col gap-2">
                <div className={`h-9 w-9 rounded-lg ${nc.light} ${nc.border} border flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${nc.text}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 leading-tight">{label}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Niche-specific tools */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-900">Spesialverktoy for {niche.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">Kun tilgjengelig i denne nisjen — bygget for dine utfordringer</p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${nc.light} ${nc.text} ${nc.border} border`}>
              {niche.nicheFeatures.length} verktoy
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x divide-y divide-slate-100">
            {niche.nicheFeatures.map((f, i) => (
              <div key={i} className="p-5 hover:bg-slate-50 transition-colors">
                <div className={`inline-flex h-7 w-7 rounded-md ${nc.light} ${nc.border} border items-center justify-center mb-3`}>
                  <CheckCircle className={`h-3.5 w-3.5 ${nc.text}`} />
                </div>
                <p className="text-sm font-bold text-slate-800 leading-tight">{f.name}</p>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pain points */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Problemene FlowPilot loser for {niche.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Basert pa fellestrekk vi har identifisert i bransjen</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-100">
            {niche.pains.map((p, i) => (
              <div key={i} className="bg-white p-4 flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle className="h-3 w-3 text-red-500" />
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Base features */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Grunnmoduler inkludert i alle planer</h2>
            <p className="text-xs text-slate-500 mt-0.5">Disse er inkludert uansett nisje</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100">
            {niche.baseFeatures.map((f, i) => (
              <div key={i} className="bg-white p-4 flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{f.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Other niches */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-bold text-slate-900 mb-4">Se andre nisjer</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {NICHES.filter(n => n.id !== nicheId).map(n => {
              const I = NICHE_ICONS[n.id] || Target;
              const nc2 = NICHE_COLORS[n.id] ?? DEFAULT_COLOR;
              return (
                <Link key={n.id} href={`/preview/${n.id}`}
                  className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-sm text-slate-700 font-medium transition-colors group">
                  <div className={`h-7 w-7 rounded-lg ${nc2.light} ${nc2.border} border flex items-center justify-center flex-shrink-0`}>
                    <I className={`h-3.5 w-3.5 ${nc2.text}`} />
                  </div>
                  <span className="truncate text-xs">{n.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className={`rounded-2xl ${nc.bg} p-8 text-white text-center`}>
          <div className={`inline-flex h-14 w-14 rounded-2xl bg-white/20 items-center justify-center mb-4`}>
            <NicheIcon className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Klar til a prove FlowPilot for {niche.name}?</h2>
          <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
            14 dager gratis. Ingen kredittkort. Alt konfigurert for {niche.name.toLowerCase()} fra dag 1.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/register?niche=${niche.id}`}
              className="bg-white text-slate-900 font-bold px-8 py-3 rounded-xl hover:bg-slate-100 transition text-sm">
              Start gratis — {niche.priceMonthly.toLocaleString('nb-NO')} kr/mnd
            </Link>
            <Link href="/bli-kunde"
              className="bg-white/20 border border-white/30 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/30 transition text-sm">
              Snakk med oss
            </Link>
          </div>
          <p className="text-white/60 text-xs mt-4">Ingen binding. Avslutt naar som helst.</p>
        </div>

      </div>
    </div>
  );
}
