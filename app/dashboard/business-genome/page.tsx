'use client';

import { useState } from 'react';
import { Dna, TrendingUp, TrendingDown, AlertTriangle, Zap, DollarSign, Users, Target, BarChart3, ChevronDown, ChevronUp, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

const GENOME_SECTIONS = [
  {
    id: 'revenue',
    label: 'Inntektsmodell',
    icon: DollarSign,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    description: 'Hvordan bedriften tjener penger',
    nodes: [
      { label: 'Primærinntekt', value: 'Tjenester / Prosjekter', status: 'strong' },
      { label: 'Gjentakende inntekt', value: 'Vedlikeholdskontrakter', status: 'weak' },
      { label: 'Mersalg', value: 'Tilleggstjenester', status: 'medium' },
      { label: 'Prissetting', value: 'Timebasert + fastpris', status: 'medium' },
    ],
    insight: 'Du er avhengig av prosjektinntekter. Målet: 30% gjentakende inntekt innen 12 mnd.',
    action: { label: 'Se Jobbpipeline', href: '/dashboard/pipeline' },
  },
  {
    id: 'growth',
    label: 'Vekstdrivere',
    icon: TrendingUp,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    description: 'Hva som faktisk driver ny omsetning',
    nodes: [
      { label: 'Nye leads', value: 'Nettside + anbefalinger', status: 'strong' },
      { label: 'Konvertering', value: 'Tilbudsprosess', status: 'medium' },
      { label: 'Mersalg', value: 'Eksisterende kunder', status: 'weak' },
      { label: 'Markedssyn', value: 'Google Maps + anmeldelser', status: 'medium' },
    ],
    insight: 'Leads fra anbefalinger konverterer 3× bedre enn kaldkontakt. Prioriter kundeoppfølging.',
    action: { label: 'Se Leads', href: '/dashboard/leads' },
  },
  {
    id: 'costs',
    label: 'Kostnadsdrivere',
    icon: TrendingDown,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    description: 'Hvor penger forlater bedriften',
    nodes: [
      { label: 'Arbeidskraft', value: '55-65% av omsetning', status: 'medium' },
      { label: 'Materialer', value: '15-25% av omsetning', status: 'medium' },
      { label: 'Administrasjon', value: '8-12% av omsetning', status: 'weak' },
      { label: 'Markedsføring', value: '3-5% av omsetning', status: 'strong' },
    ],
    insight: 'Adminkosnader over 12% er en rødflagg. Bruk FlowPilot-automatisering for å kutte.',
    action: { label: 'Se Cashflow', href: '/dashboard/cashflow' },
  },
  {
    id: 'risks',
    label: 'Risikoprofil',
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    description: 'Faktorer som kan skade bedriften',
    nodes: [
      { label: 'Kundekonsentrasjon', value: 'Topp 3 kunder > 50%?', status: 'weak' },
      { label: 'Sesongsvingninger', value: 'Sommer/vinter-gap', status: 'medium' },
      { label: 'Nøkkelperson-risiko', value: 'Avhengig av 1-2 ansatte', status: 'weak' },
      { label: 'Kontantstrøm', value: 'Buffer < 3 mnd', status: 'medium' },
    ],
    insight: 'Høy kundekonsentrasjon er din #1 risiko. Jobb aktivt på å spre inntektsgrunnlaget.',
    action: { label: 'Se Risiko-register', href: '/dashboard/risk' },
  },
  {
    id: 'talent',
    label: 'Folk & Kapasitet',
    icon: Users,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    description: 'Teamets styrker og flaskehalser',
    nodes: [
      { label: 'Kapasitetsutnyttelse', value: '70-80% optimal', status: 'medium' },
      { label: 'Kompetansegap', value: 'Salg / Admin', status: 'weak' },
      { label: 'Rekrutteringsberedskap', value: 'Ingen plan', status: 'weak' },
      { label: 'Opplæringsstruktur', value: 'Prosedyrebank', status: 'medium' },
    ],
    insight: 'Salg og admin er typisk de første oppgavene å outsource eller automatisere i SMB.',
    action: { label: 'Se Team', href: '/dashboard/team' },
  },
  {
    id: 'market',
    label: 'Markedsposisjon',
    icon: Target,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    description: 'Konkurranseposisjon og differensiering',
    nodes: [
      { label: 'Prisnivå', value: 'Midt i markedet', status: 'medium' },
      { label: 'Differensiering', value: 'Rekkevidde og kvalitet', status: 'medium' },
      { label: 'Omdømme', value: 'Google-anmeldelser', status: 'strong' },
      { label: 'Merkevare', value: 'Nettside + logo', status: 'medium' },
    ],
    insight: 'Bedrifter med 4.8+ Google-snitt konverterer 40% bedre. Prioriter anmeldelseshåndtering.',
    action: { label: 'Se Reputation', href: '/dashboard/reputation' },
  },
];

const STATUS_CONFIG = {
  strong: { label: 'Sterk', color: 'text-emerald-400', icon: CheckCircle, dot: 'bg-emerald-500' },
  medium: { label: 'OK', color: 'text-amber-400', icon: Zap, dot: 'bg-amber-500' },
  weak: { label: 'Svak', color: 'text-red-400', icon: XCircle, dot: 'bg-red-500' },
};

function GenomeCard({ section }: { section: typeof GENOME_SECTIONS[0] }) {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;
  const weakCount = section.nodes.filter(n => n.status === 'weak').length;
  const strongCount = section.nodes.filter(n => n.status === 'strong').length;

  return (
    <div className={`${section.bg} border ${section.border} rounded-2xl overflow-hidden`}>
      <button className="w-full text-left px-5 py-4 flex items-center gap-4" onClick={() => setOpen(o => !o)}>
        <div className={`flex items-center justify-center h-10 w-10 rounded-xl ${section.bg} border ${section.border} flex-shrink-0`}>
          <Icon className={`h-5 w-5 ${section.color}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white">{section.label}</h3>
            {weakCount > 0 && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-semibold">{weakCount} svak</span>}
            {strongCount > 0 && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">{strongCount} sterk</span>}
          </div>
          <p className="text-slate-400 text-sm">{section.description}</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-white/5">
          <div className="grid grid-cols-2 gap-3 mt-4">
            {section.nodes.map(node => {
              const sc = STATUS_CONFIG[node.status as keyof typeof STATUS_CONFIG];
              const StatusIcon = sc.icon;
              return (
                <div key={node.label} className="bg-slate-800/60 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <StatusIcon className={`h-3.5 w-3.5 ${sc.color}`} />
                    <span className={`text-xs font-bold ${sc.color}`}>{sc.label}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">{node.label}</p>
                  <p className="text-sm text-white font-semibold mt-0.5">{node.value}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 bg-slate-900/60 border border-slate-700/50 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wide">AI-innsikt</p>
            <p className="text-sm text-slate-300">{section.insight}</p>
            <Link href={section.action.href}
              className="flex items-center gap-1 text-xs font-semibold mt-2 text-blue-400 hover:text-blue-300 transition">
              {section.action.label} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BusinessGenomePage() {
  const overallStrong = GENOME_SECTIONS.flatMap(s => s.nodes).filter(n => n.status === 'strong').length;
  const overallWeak = GENOME_SECTIONS.flatMap(s => s.nodes).filter(n => n.status === 'weak').length;
  const overallTotal = GENOME_SECTIONS.flatMap(s => s.nodes).length;
  const healthPct = Math.round(((overallStrong * 2 + (overallTotal - overallStrong - overallWeak)) / (overallTotal * 2)) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Dna className="h-5 w-5 text-blue-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">FlowPilot</span>
              <span className="text-xs font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">Enterprise</span>
            </div>
            <h1 className="text-3xl font-black text-white">Business Genome</h1>
            <p className="text-slate-400 text-sm mt-1">Komplett DNA-kart over bedriften din — styrker, svakheter og vekstpotensial</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-black text-blue-400">{healthPct}%</p>
            <p className="text-slate-400 text-sm">Forretnings-helse</p>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="text-emerald-400 font-bold">{overallStrong} sterke</span>
              <span className="text-amber-400 font-bold">{overallTotal - overallStrong - overallWeak} OK</span>
              <span className="text-red-400 font-bold">{overallWeak} svake</span>
            </div>
          </div>
        </div>

        {/* Health bar */}
        <div className="bg-slate-800 rounded-full h-2 mb-8 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-700"
            style={{ width: `${healthPct}%` }} />
        </div>

        {/* Genome cards */}
        <div className="space-y-3">
          {GENOME_SECTIONS.map(s => <GenomeCard key={s.id} section={s} />)}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-700/30 rounded-2xl p-6">
          <div className="flex items-start gap-4 flex-wrap">
            <BarChart3 className="h-8 w-8 text-blue-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg">Neste steg: Forbedre 3 svake punkter</h3>
              <p className="text-slate-400 text-sm mt-1">
                Fokuser på <span className="text-amber-400 font-semibold">Nøkkelperson-risiko</span>, <span className="text-amber-400 font-semibold">Gjentakende inntekt</span> og <span className="text-amber-400 font-semibold">Kompetansegap</span> for størst forretningseffekt.
              </p>
            </div>
            <Link href="/dashboard/fp-score"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition">
              Se FlowPilot Score™ <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
