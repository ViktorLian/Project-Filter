'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Wrench, Zap, Hammer, Paintbrush, Sparkles, Scissors, Heart,
  Dumbbell, BookOpen, Monitor, Home, Building2, Receipt, Truck,
  Car, Megaphone, Smile, Scale, Leaf, Users, TrendingUp,
  CheckCircle, ChevronRight, Settings, Mail, BarChart3, Package, Clock,
  MessageSquare, UserCheck, RefreshCw, Star, Shield, Calendar, ListChecks,
  FileText, Layers, AlertCircle, ArrowRight, DollarSign,
  LayoutDashboard, Globe, Bot, Cpu,
  Activity, Bell, Search, LogOut, Menu,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { getNiche, NICHES, type Niche } from '@/lib/niches';
import { useState } from 'react';

// ─── Unified accent – same for ALL 19 niches (no niche-specific bright colors)
const ACC   = '#6366f1'; // indigo-500
const ACC_L = '#e0e7ff'; // indigo-100

// ─── Icons ───────────────────────────────────────────────────────────────────
const NICHE_ICONS: Record<string, React.ElementType> = {
  rorlegger: Wrench, elektriker: Zap, snekker: Hammer, maler: Paintbrush,
  rengjoring: Sparkles, frisor: Scissors, hudpleie: Heart,
  'personlig-trener': Dumbbell, regnskapsforer: BookOpen, 'it-konsulent': Monitor,
  eiendomsmegler: Home, vaktmester: Building2, restaurant: Receipt,
  transport: Truck, bilverksted: Car, markedsbyra: Megaphone,
  tannlege: Smile, advokat: Scale, landbruk: Leaf,
};

const MODULE_DEFS: Record<string, { label: string; icon: React.ElementType; group: string; sub: string }> = {
  leads:               { label: 'Leads',            icon: Users,          group: 'SALG',    sub: 'Innkomne henvendelser' },
  invoices:            { label: 'Fakturaer',         icon: Receipt,        group: 'SALG',    sub: 'Fakturering og betaling' },
  proposals:           { label: 'Tilbud',            icon: FileText,       group: 'SALG',    sub: 'Kalkyler og tilbud' },
  pipeline:            { label: 'Pipeline',          icon: Layers,         group: 'SALG',    sub: 'Salgspipeline' },
  customers:           { label: 'Kunder',            icon: UserCheck,      group: 'SALG',    sub: 'Kunderegister' },
  cashflow:            { label: 'Kontantstrom',      icon: TrendingUp,     group: 'OKONOMI', sub: 'Okonomioversikt' },
  inventory:           { label: 'Lager',             icon: Package,        group: 'DRIFT',   sub: 'Produkt og materiell' },
  tasks:               { label: 'Oppgaver',          icon: ListChecks,     group: 'DRIFT',   sub: 'Oppgavebehandling' },
  calendar:            { label: 'Kalender',          icon: Calendar,       group: 'DRIFT',   sub: 'Timebok og avtaler' },
  'time-tracking':     { label: 'Timeregistrering',  icon: Clock,          group: 'DRIFT',   sub: 'Timer og fakturering' },
  jobs:                { label: 'Oppdrag',           icon: Wrench,         group: 'DRIFT',   sub: 'Jobbstyring' },
  forms:               { label: 'Skjemaer',          icon: LayoutDashboard,group: 'VEKST',   sub: 'Kontaktskjemaer' },
  workflows:           { label: 'Automatisering',    icon: RefreshCw,      group: 'VEKST',   sub: 'Automatiske flyter' },
  campaigns:           { label: 'Kampanjer',         icon: Megaphone,      group: 'VEKST',   sub: 'E-post og SMS' },
  'social-planner':    { label: 'Sosiale medier',    icon: MessageSquare,  group: 'VEKST',   sub: 'Innholdsplanlegging' },
  'email-sequences':   { label: 'E-postsekvenser',   icon: Mail,           group: 'VEKST',   sub: 'Automatisk oppfolging' },
  'review-gatekeeper': { label: 'Omdoemme',          icon: Star,           group: 'VEKST',   sub: 'Google-anmeldelser' },
  'google-maps':       { label: 'Google / SEO',      icon: Globe,          group: 'VEKST',   sub: 'Synlighet pa nett' },
  analytics:           { label: 'Analyse',           icon: BarChart3,      group: 'INNSIKT', sub: 'Statistikk og KPIer' },
  'ai-assistant':      { label: 'AI Assistent',      icon: Bot,            group: 'INNSIKT', sub: 'AI-drevet innsikt' },
  'chatbot-widget':    { label: 'Chatbot Widget',    icon: Cpu,            group: 'INNSIKT', sub: 'Automatisk svar' },
  'client-portal':     { label: 'Kundeportal',       icon: Shield,         group: 'SYSTEM',  sub: 'Sikker dokumentdeling' },
  settings:            { label: 'Innstillinger',     icon: Settings,       group: 'SYSTEM',  sub: 'Kontoinnstillinger' },
};

// ─── Data helpers ─────────────────────────────────────────────────────────────
function seed(id: string) {
  return id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
}

const MONTHS = ['Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des', 'Jan', 'Feb', 'Mar'];

function mkData(nicheId: string, key: number, base: number, pct = 0.45) {
  const s = seed(nicheId);
  return MONTHS.map((month, i) => {
    const trend = 1 + (i / 11) * pct;
    const noise = 1 + (((s * (i + 1) * (key + 7)) % 200) - 100) / 1000;
    return { month, value: Math.max(0, Math.round(base * trend * noise)) };
  });
}

function getKPIs(id: string) {
  const s = seed(id);
  const income   = 38000 + (s * 380) % 62000;
  const leads    = 14 + (s % 22);
  const newLeads = 3 + (s % 9);
  const avgScore = 62 + (s % 28);
  const expense  = Math.round(income * (0.30 + (s % 8) * 0.02));
  return { income, expense, result: income - expense, leads, newLeads, avgScore };
}

// ─── Module chart lookup ───────────────────────────────────────────────────────
function moduleChart(key: string, nicheId: string) {
  const k = getKPIs(nicheId);
  const s = seed(nicheId);
  const map: Record<string, { title: string; base: number; g: number; pre?: string; suf?: string; k: number }> = {
    leads:               { title: 'Leads per maned',           base: k.leads,                       g: 0.55,                k: 1 },
    invoices:            { title: 'Fakturert belop (kr)',       base: k.income,                      g: 0.42, suf: ' kr',    k: 2 },
    cashflow:            { title: 'Resultat per maned (kr)',    base: k.result,                      g: 0.50, suf: ' kr',    k: 3 },
    proposals:           { title: 'Tilbud sendt',               base: Math.round(k.leads * 0.7),     g: 0.38,                k: 4 },
    customers:           { title: 'Aktive kunder',              base: 20 + k.leads,                  g: 0.30,                k: 5 },
    pipeline:            { title: 'Pipeline verdi (kr)',        base: Math.round(k.income * 1.4),    g: 0.48, suf: ' kr',    k: 6 },
    campaigns:           { title: 'E-poster sendt',             base: 110 + k.leads * 4,             g: 0.60,                k: 7 },
    'social-planner':    { title: 'Innlegg publisert',          base: 12 + (s % 10),                 g: 0.25,                k: 8 },
    analytics:           { title: 'Besokende pa nettsiden',     base: 320 + k.leads * 12,            g: 0.65,                k: 9 },
    'review-gatekeeper': { title: 'Google-anmeldelser',         base: 3 + (s % 6),                   g: 0.40,                k: 10 },
    'time-tracking':     { title: 'Fakturerbare timer',         base: 80 + (s % 60),                 g: 0.28,                k: 11 },
    tasks:               { title: 'Oppgaver fullfort',          base: 18 + k.leads,                  g: 0.35,                k: 12 },
    inventory:           { title: 'Varekostnad (kr)',           base: Math.round(k.expense * 0.6),   g: 0.30, suf: ' kr',    k: 13 },
    calendar:            { title: 'Avtaler booket',             base: k.leads + 4,                   g: 0.42,                k: 14 },
    jobs:                { title: 'Oppdrag fullfort',           base: Math.round(k.leads * 0.8),     g: 0.45,                k: 15 },
    'ai-assistant':      { title: 'AI-sporrsmaal besvart',      base: 40 + k.leads * 3,              g: 0.80,                k: 16 },
    'google-maps':       { title: 'SEO-synlighet (0-100)',      base: 42 + (s % 20),                 g: 0.40,                k: 17 },
    'email-sequences':   { title: 'E-post apningsrate (%)',     base: 28 + (s % 15),                 g: 0.20, suf: ' %',     k: 18 },
    'client-portal':     { title: 'Aktive kundeportaler',       base: 8 + (s % 12),                  g: 0.35,                k: 19 },
    'chatbot-widget':    { title: 'Chatbot-samtaler',           base: 60 + k.leads * 5,              g: 0.70,                k: 20 },
    workflows:           { title: 'Automatiseringer kjort',     base: 35 + k.leads * 2,              g: 0.65,                k: 21 },
    forms:               { title: 'Skjema-innsendelser',        base: k.leads + 3,                   g: 0.50,                k: 22 },
  };
  const c = map[key] ?? map['leads'];
  return { title: c.title, data: mkData(nicheId, c.k, c.base, c.g), pre: c.pre ?? '', suf: c.suf ?? '' };
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ niche, active, onSelect }: { niche: Niche; active: string; onSelect: (m: string) => void }) {
  const always = ['analytics', 'ai-assistant', 'settings'];
  const keys = [...niche.modules, ...always.filter(k => !niche.modules.includes(k))];

  const grouped: Record<string, string[]> = {};
  for (const key of keys) {
    const def = MODULE_DEFS[key];
    if (!def) continue;
    if (!grouped[def.group]) grouped[def.group] = [];
    grouped[def.group].push(key);
  }

  return (
    <aside className="w-56 flex-shrink-0 bg-slate-900 flex flex-col h-full">
      <div className="h-14 flex items-center px-4 gap-2.5 border-b border-slate-800 flex-shrink-0">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: ACC }}>FP</div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm">FlowPilot</p>
          <p className="text-slate-400 text-[10px] truncate">{niche.name}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <button onClick={() => onSelect('dashboard')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5 ${active === 'dashboard' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
          <LayoutDashboard className="h-4 w-4 flex-shrink-0" /><span className="truncate">Dashboard</span>
        </button>

        {Object.entries(grouped).map(([grp, gkeys]) => (
          <div key={grp} className="pt-4">
            <p className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">{grp}</p>
            {gkeys.map(key => {
              const def = MODULE_DEFS[key];
              if (!def) return null;
              const I = def.icon;
              return (
                <button key={key} onClick={() => onSelect(key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5 ${active === key ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <I className="h-4 w-4 flex-shrink-0" /><span className="truncate">{def.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-3 flex-shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: ACC }}>D</div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-200 text-xs font-medium">Demo-konto</p>
            <p className="text-slate-500 text-[10px] truncate">demo@flowpilot.no</p>
          </div>
          <LogOut className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, icon: Icon, trend = 'neutral' }: {
  label: string; value: string; sub: string; icon: React.ElementType; trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
      <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: ACC_L, color: ACC }}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xl font-bold text-slate-800 mt-0.5 leading-tight truncate">{value}</p>
        <p className={`text-xs mt-0.5 ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}>{sub}</p>
      </div>
    </div>
  );
}

// ─── Stock-style area chart (ONE metric only) ─────────────────────────────────
function StockChart({ title, subtitle, data, pre = '', suf = '' }: {
  title: string; subtitle: string;
  data: { month: string; value: number }[];
  pre?: string; suf?: string;
}) {
  const last  = data[data.length - 1]?.value ?? 0;
  const first = data[0]?.value ?? 1;
  const pct   = Math.round(((last - first) / Math.max(first, 1)) * 100);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${pct >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {pct >= 0 ? '+' : ''}{pct}% siste 12 mnd
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-900 mt-3 mb-4">{pre}{last.toLocaleString('nb-NO')}{suf}</p>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id={`g${title.replace(/\W/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={ACC} stopOpacity={0.18} />
                <stop offset="95%" stopColor={ACC} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => pre + v.toLocaleString('nb-NO')} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0/0.1)' }}
              formatter={((v: number) => [`${pre}${v.toLocaleString('nb-NO')}${suf}`, title]) as any}
            />
            <Area type="monotone" dataKey="value" stroke={ACC} strokeWidth={2}
              fill={`url(#g${title.replace(/\W/g, '')})`}
              dot={false} activeDot={{ r: 4, stroke: ACC, strokeWidth: 2, fill: '#fff' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Module page ──────────────────────────────────────────────────────────────
function ModulePage({ mod, nicheId, niche }: { mod: string; nicheId: string; niche: Niche }) {
  const k = getKPIs(nicheId);
  if (mod === 'settings') return (
    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
      <Settings className="h-10 w-10 text-slate-300 mx-auto mb-3" />
      <p className="text-slate-500 text-sm">Innstillinger er tilgjengelig etter innlogging i live-versjonen.</p>
    </div>
  );

  const chart = moduleChart(mod, nicheId);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Leads denne maned"     value={String(k.leads)}   sub={`+${k.newLeads} denne uken`}                      icon={Users}     trend="up" />
        <KPICard label="Inntekter denne maned" value={`${k.income.toLocaleString('nb-NO')} kr`}  sub="Fakturert"                icon={TrendingUp} trend="up" />
        <KPICard label="Resultat"              value={`${k.result.toLocaleString('nb-NO')} kr`}  sub={`Margin ${Math.round((k.result/k.income)*100)}%`} icon={Activity} trend="up" />
        <KPICard label="Snitt lead-score"      value={`${k.avgScore}/100`}                       sub="Basert pa AI-scoring"     icon={Star}       trend="neutral" />
      </div>
      <StockChart title={chart.title} subtitle="April 2025 – mars 2026" data={chart.data} pre={chart.pre} suf={chart.suf} />
      {niche.nicheFeatures.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Spesialtjenester for {niche.name}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {niche.nicheFeatures.slice(0, 6).map(f => (
              <div key={f.name} className="flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: ACC }} />
                <div>
                  <p className="text-sm font-medium text-slate-700">{f.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Dashboard home ────────────────────────────────────────────────────────────
function DashboardHome({ nicheId, niche, onNav }: { nicheId: string; niche: Niche; onNav: (m: string) => void }) {
  const k = getKPIs(nicheId);
  const leadsData  = mkData(nicheId, 1, k.leads,  0.55);
  const incomeData = mkData(nicheId, 2, k.income, 0.44);

  const mockLeads = [
    { name: 'Kari Nordmann',    score: 87, status: 'Ny' },
    { name: 'Ole Persen',       score: 72, status: 'Kontaktet' },
    { name: 'Ingrid Haugen',    score: 91, status: 'Ny' },
    { name: 'Bjorn Andreassen', score: 65, status: 'Ny' },
  ];
  const mockInv = [
    { cust: 'Stein Olsen',  amt: 18750, due: '14.9.2026', paid: false },
    { cust: 'Tone Larsen',  amt: 9400,  due: '20.9.2026', paid: false },
    { cust: 'Erik Bakke',   amt: 22100, due: '5.9.2026',  paid: true  },
  ];

  return (
    <div className="space-y-4">
      {/* Quick-access tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['leads', 'invoices', 'cashflow', 'calendar'] as const).map(key => {
          const def = MODULE_DEFS[key];
          if (!def) return null;
          const I = def.icon;
          return (
            <button key={key} onClick={() => onNav(key)}
              className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 hover:border-indigo-300 hover:shadow-sm transition-all text-left">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: ACC_L, color: ACC }}>
                <I className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-700 truncate">{def.label}</p>
                <p className="text-xs text-slate-400 truncate">{def.sub}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0" />
            </button>
          );
        })}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Leads denne maned"     value={String(k.leads)}   sub={`+${k.newLeads} denne uken`}                      icon={Users}      trend="up" />
        <KPICard label="Inntekter denne maned" value={`${k.income.toLocaleString('nb-NO')} kr`} sub="Fakturert"                  icon={TrendingUp}  trend="up" />
        <KPICard label="Resultat"              value={`${k.result.toLocaleString('nb-NO')} kr`} sub={`Margin ${Math.round((k.result/k.income)*100)}%`} icon={Activity} trend="up" />
        <KPICard label="Snitt lead-score"      value={`${k.avgScore}/100`} sub="Basert pa AI-scoring"                            icon={Star}        trend="neutral" />
      </div>

      {/* Two separate area charts – one metric each */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StockChart title="Leads per maned"     subtitle="April 2025 – mars 2026" data={leadsData} />
        <StockChart title="Inntekter per maned" subtitle="April 2025 – mars 2026" data={incomeData} suf=" kr" />
      </div>

      {/* Recent leads + unpaid invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Siste leads</h3>
            <button onClick={() => onNav('leads')} className="text-xs font-medium text-indigo-600 hover:underline">Se alle</button>
          </div>
          <div className="space-y-3">
            {mockLeads.map((l, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">{l.name.charAt(0)}</div>
                <p className="text-sm font-medium text-slate-700 flex-1 truncate">{l.name}</p>
                <span className="text-xs text-slate-400 mr-1">{l.status}</span>
                <span className="text-xs font-bold text-slate-600">{l.score}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 text-center mt-3">Demo-data – live data vises etter innlogging</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Ubetalte fakturaer</h3>
            <button onClick={() => onNav('invoices')} className="text-xs font-medium text-indigo-600 hover:underline">Se alle</button>
          </div>
          <div className="space-y-3">
            {mockInv.map((inv, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Receipt className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{inv.cust}</p>
                  <p className="text-xs text-slate-400">Forfall: {inv.due}</p>
                </div>
                <span className={`text-sm font-bold flex-shrink-0 ${inv.paid ? 'text-emerald-600' : 'text-red-500'}`}>
                  {inv.amt.toLocaleString('nb-NO')} kr
                </span>
              </div>
            ))}
          </div>
          <button onClick={() => onNav('invoices')} className="mt-4 w-full text-xs text-indigo-600 font-medium hover:underline">+ Ny faktura</button>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function PreviewPage() {
  const { nicheId } = useParams() as { nicheId: string };
  const niche = getNiche(nicheId);
  const [active, setActive] = useState('dashboard');
  const [mob, setMob] = useState(false);

  if (!niche) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center max-w-xs">
          <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-slate-800 mb-2">Bransje ikke funnet</h1>
          <Link href="/preview" className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90" style={{ backgroundColor: ACC }}>
            Se alle bransjer
          </Link>
        </div>
      </div>
    );
  }

  const defLabel = active === 'dashboard' ? 'Dashboard' : (MODULE_DEFS[active]?.label ?? active);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {mob && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMob(false)} />}

      <div className={`fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto transition-transform duration-200 ${mob ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <Sidebar niche={niche} active={active} onSelect={m => { setActive(m); setMob(false); }} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3 flex-shrink-0">
          <button className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => setMob(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-slate-800 truncate">{defLabel}</h1>
            {active === 'dashboard' && <p className="text-xs text-slate-400">onsdag 4. mars 2026</p>}
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 flex-shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-amber-700">DEMO &mdash; {niche.name}</span>
          </div>
          <div className="flex items-center gap-1 ml-1">
            <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"><Search className="h-4 w-4" /></button>
            <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"><Bell className="h-4 w-4" /></button>
            <div className="h-8 w-8 rounded-full ml-1 flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: ACC }}>D</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-5xl mx-auto">
            {active === 'dashboard'
              ? <DashboardHome nicheId={nicheId} niche={niche} onNav={setActive} />
              : <ModulePage mod={active} nicheId={nicheId} niche={niche} />
            }
          </div>
        </main>

        {/* Footer CTA */}
        <footer className="border-t border-slate-200 bg-white px-4 py-3 flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-600 text-center sm:text-left">
            Demo av FlowPilot for <span className="font-semibold text-slate-800">{niche.name}</span>
            {' '}&mdash; fra <span className="font-semibold text-slate-800">{niche.priceMonthly.toLocaleString('nb-NO')} kr/mnd</span>
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/preview" className="text-sm text-slate-500 hover:text-slate-700 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              Alle bransjer
            </Link>
            <Link href={`/register?niche=${nicheId}`}
              className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: ACC }}>
              Start gratis <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
