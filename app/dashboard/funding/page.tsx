'use client';

import { useState, useMemo } from 'react';
import { Landmark, Calculator, TrendingUp, CheckCircle, AlertTriangle, ExternalLink, ChevronRight, DollarSign, Clock, Percent } from 'lucide-react';

const FUNDING_OPTIONS = [
  {
    id: 'bank_loan',
    category: 'Banklån',
    name: 'Kassakreditt',
    provider: 'DNB / Sparebank',
    amount: '200 000 – 1 500 000 kr',
    rate: '6–9% p.a.',
    time: '1–3 uker',
    pros: ['Lav rente', 'Fleksibel trekkrett', 'Bygger kredittverdighet'],
    cons: ['Kredittvurdering', 'Sikkerhet kreves over 500k'],
    fit: 'Daglig drift og likviditetsbuffer',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    score: 85,
  },
  {
    id: 'factoring',
    category: 'Factoring',
    name: 'Faktura-factoring',
    provider: 'Aprila / Ikano',
    amount: 'Basert på fakturamasse',
    rate: '0.5–1.5% per faktura',
    time: '24 timer',
    pros: ['Ingen kredittsjekk', 'Penger på konto neste dag', 'Skalerer med vekst'],
    cons: ['Høyere kostnad enn banklån', 'Kunden informeres om factoring'],
    fit: 'Bedrifter med lange betalingsbetingelser',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    score: 91,
  },
  {
    id: 'innovation_norway',
    category: 'Offentlig',
    name: 'Innovasjon Norge Tilskudd',
    provider: 'Innovasjon Norge',
    amount: '100 000 – 2 000 000 kr',
    rate: 'Tilskudd — rentefritt',
    time: '2–6 måneder',
    pros: ['Ikke tilbakebetaling', 'Lavt risiko', 'Kan kombineres'],
    cons: ['Lang søknadsprosess', 'Strenge krav til nyskaping'],
    fit: 'Vekstbedrifter og produktutvikling',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    score: 60,
  },
  {
    id: 'equipment',
    category: 'Leasing',
    name: 'Utstyrslease / -finansiering',
    provider: 'Nordea / Santander',
    amount: 'Verdien av utstyr',
    rate: '4–7% p.a.',
    time: '3–5 dager',
    pros: ['Bevarer kontanter', 'Skattefordeler', 'Rask godkjenning'],
    cons: ['Binder kapasitet til utstyr', 'Ikke for alle bransjer'],
    fit: 'Maskiner, biler, verktøy',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    score: 77,
  },
  {
    id: 'microfinance',
    category: 'Hurtiglån',
    name: 'SMB-hurtiglån',
    provider: 'Aprila Bank / Fivaldi',
    amount: '50 000 – 500 000 kr',
    rate: '10–18% p.a.',
    time: '1–2 dager',
    pros: ['Rask utbetaling', 'Minimal dokumentasjon', 'Ingen sikkerhet'],
    cons: ['Høy kostnad', 'Korte løpetider'],
    fit: 'Akutt likviditetsbehov',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    score: 52,
  },
];

function RunwayCalc() {
  const [cash, setCash] = useState(200000);
  const [burn, setBurn] = useState(80000);
  const months = burn > 0 ? Math.floor(cash / burn) : 99;
  const color = months >= 6 ? 'text-emerald-400' : months >= 3 ? 'text-amber-400' : 'text-red-400';
  const status = months >= 6 ? 'God buffer' : months >= 3 ? 'Akseptabelt — men bygg reserve' : 'Kritisk — søk finansiering nå';

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
        <Calculator className="h-4 w-4 text-blue-400" /> Kontantstrøm-runway
      </h3>
      <div className="space-y-4 mb-4">
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-xs text-slate-400 font-semibold">Tilgjengelig kontant</label>
            <span className="text-sm font-bold text-white">{cash.toLocaleString('nb-NO')} kr</span>
          </div>
          <input type="range" min={0} max={2000000} step={10000} value={cash} onChange={e => setCash(+e.target.value)}
            className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500" />
        </div>
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-xs text-slate-400 font-semibold">Månedlig forbruk</label>
            <span className="text-sm font-bold text-white">{burn.toLocaleString('nb-NO')} kr</span>
          </div>
          <input type="range" min={10000} max={500000} step={5000} value={burn} onChange={e => setBurn(+e.target.value)}
            className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-red-500" />
        </div>
      </div>
      <div className="border-t border-slate-700 pt-4 text-center">
        <p className={`text-5xl font-black ${color}`}>{months >= 99 ? '∞' : months}</p>
        <p className={`font-bold ${color}`}>{months >= 99 ? 'måneder' : `måneder runway`}</p>
        <p className="text-slate-400 text-sm mt-1">{status}</p>
      </div>
    </div>
  );
}

export default function FundingPage() {
  const [filter, setFilter] = useState('all');
  const categories = ['all', ...Array.from(new Set(FUNDING_OPTIONS.map(o => o.category)))];
  const filtered = FUNDING_OPTIONS.filter(o => filter === 'all' || o.category === filter)
    .sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        <div>
          <div className="flex items-center gap-2 mb-1">
            <Landmark className="h-5 w-5 text-emerald-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Finansiering</span>
            <span className="text-xs font-bold bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">Pro</span>
          </div>
          <h1 className="text-3xl font-black text-white">Finansierings-hub</h1>
          <p className="text-slate-400 text-sm mt-1">Finn riktig kapital for bedriften din — lån, factoring, tilskudd og leasing</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <RunwayCalc />
          <div className="bg-gradient-to-br from-emerald-900/30 to-blue-900/30 border border-emerald-700/30 rounded-2xl p-5">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" /> Finansieringsstrategi
            </h3>
            <div className="space-y-3 text-sm">
              {[
                { icon: CheckCircle, color: 'text-emerald-400', text: 'Ha alltid 3 måneders driftskapital på bok' },
                { icon: CheckCircle, color: 'text-emerald-400', text: 'Bruk factoring for fakturaer over 30 dagers forfall' },
                { icon: CheckCircle, color: 'text-emerald-400', text: 'Kombiner kassakreditt + factoring for maksimal fleksibilitet' },
                { icon: AlertTriangle, color: 'text-amber-400', text: 'Unngå hurtiglån til daglig drift — kun akutt bruk' },
                { icon: AlertTriangle, color: 'text-amber-400', text: 'Søk Innovasjon Norge 6 mnd. før du trenger pengene' },
              ].map((tip, i) => {
                const Icon = tip.icon;
                return (
                  <div key={i} className="flex items-start gap-2">
                    <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${tip.color}`} />
                    <p className="text-slate-300">{tip.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${filter === c ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>
              {c === 'all' ? 'Alle' : c}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {filtered.map(opt => (
            <div key={opt.id} className={`${opt.bg} border ${opt.border} rounded-2xl p-5`}>
              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-bold uppercase tracking-wide ${opt.color}`}>{opt.category}</span>
                    <span className="text-xs text-slate-500">{opt.provider}</span>
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">Fit: {opt.score}%</span>
                  </div>
                  <h3 className="font-bold text-white text-lg">{opt.name}</h3>
                  <p className="text-slate-400 text-sm">{opt.fit}</p>
                  <div className="flex gap-4 mt-3 flex-wrap">
                    <div className="flex items-center gap-1.5 text-sm">
                      <DollarSign className={`h-3.5 w-3.5 ${opt.color}`} />
                      <span className="text-slate-300">{opt.amount}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Percent className={`h-3.5 w-3.5 ${opt.color}`} />
                      <span className="text-slate-300">{opt.rate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Clock className={`h-3.5 w-3.5 ${opt.color}`} />
                      <span className="text-slate-300">{opt.time}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-3 flex-wrap">
                    <div>
                      <p className="text-xs text-emerald-400 font-semibold mb-1">Fordeler</p>
                      {opt.pros.map(p => <p key={p} className="text-xs text-slate-400">✓ {p}</p>)}
                    </div>
                    <div>
                      <p className="text-xs text-red-400 font-semibold mb-1">Ulemper</p>
                      {opt.cons.map(c => <p key={c} className="text-xs text-slate-400">✗ {c}</p>)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                    <span className={`text-lg font-black ${opt.color}`}>{opt.score}</span>
                  </div>
                  <span className="text-xs text-slate-500">match-score</span>
                  <button className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-xl transition mt-2">
                    Les mer <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
