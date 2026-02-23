'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, AlertCircle, CheckCircle, Zap, DollarSign, ArrowUpRight, Users, Globe } from 'lucide-react';

interface Insight {
  id: string;
  category: 'sesong' | 'bransje' | 'region' | 'marked';
  title: string;
  description: string;
  action: string;
  urgency: 'hoy' | 'middels' | 'lav';
  potential: string;
}

const INSIGHTS: Insight[] = [
  {
    id: '1',
    category: 'sesong',
    title: 'Vaar er nest beste periode for haandverk',
    description: 'Historisk data viser at mars-mai er nest-hoyest volum for haandverkstjenester. Mange kunder planlegger vaarpussen. Start kampanje naa for a fange opp de som er i planleggingsfasen.',
    action: 'Lag en vaarkampanje til eksisterende kunder. Send e-post med "Bestill vaarens jobb naa" og tilby 10% tidligrabatt for bestillinger innen 1. april.',
    urgency: 'hoy',
    potential: '30-50 000 kr ekstra omsetning',
  },
  {
    id: '2',
    category: 'region',
    title: 'Ostlandet har hoyest betalingsvilje',
    description: 'Bedrifter pa Ostlandet (saerlig Oslo, Akershus, Vestfold) aksepterer 15-25% hoyere priser for de samme tjenestene. Hvis du opererer der, kan du justere prisene.',
    action: 'Analyser om du presser riktig pris i Oslo-omraadet. Prisene dine bor ligge 15% over landsgjennomsnitt her.',
    urgency: 'middels',
    potential: 'Opptil +40 000 kr/aar',
  },
  {
    id: '3',
    category: 'bransje',
    title: 'Servicekontrakter vokser 22% i Norge',
    description: 'Markedet for arskontrakter og serviceavtaler vokser raskt i SMB-segmentet. Kunder som vil ha forutsigbar pris og prioritert behandling er villige til aa betale 20-30% over timepris.',
    action: 'Lag ett standardprodukt: "Arskontrakt – prioritert service og 2 inspeksjonsbesok" til en fast aarspris. Mal: 5 kunder = ekstra 120 000 kr stabil ARR.',
    urgency: 'hoy',
    potential: '100-200 000 kr ARR',
  },
  {
    id: '4',
    category: 'marked',
    title: 'Offentlige anbud: Kommunale kontrakter er aapne',
    description: 'Mange kommuner og borettslag leter aktivt etter lokale leverandorer for vedlikeholdskontrakter. Prosessen er enklere enn de fleste tror og treaarige kontrakter er vanlig.',
    action: 'Sjekk Doffin.no (doffin.no) for anbud i ditt omraade. Kontakt din naermeste kommune og spur om leverantorlisten.',
    urgency: 'middels',
    potential: 'Flerarige kontrakter 200k-1M kr',
  },
  {
    id: '5',
    category: 'sesong',
    title: 'Sommer-nedgang: Planlegg aktivt naa',
    description: 'Juni-august er tradisjonelt lav sesong for bedrifter som ikke har planlagt utenomhus/ferie-tjenester. Reduser cashflow-sjokket ved aa fylle opp augustkalender i mai.',
    action: 'Start "tidligbestilling august"-kampanje i mai. Gi 5% rabatt for bestillinger gjort 2+ maaneder frem i tid.',
    urgency: 'lav',
    potential: 'Unngaer -30% cashflow-knekk',
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  sesong: 'Sesong',
  bransje: 'Bransje',
  region: 'Region',
  marked: 'Marked',
};

const CATEGORY_COLORS: Record<string, string> = {
  sesong: 'bg-orange-100 text-orange-700',
  bransje: 'bg-blue-100 text-blue-700',
  region: 'bg-emerald-100 text-emerald-700',
  marked: 'bg-purple-100 text-purple-700',
};

const URGENCY_COLORS: Record<string, string> = {
  hoy: 'bg-red-100 text-red-700',
  middels: 'bg-amber-100 text-amber-700',
  lav: 'bg-slate-100 text-slate-600',
};

export default function NorskBIPage() {
  const [filter, setFilter] = useState<string>('alle');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = filter === 'alle' ? INSIGHTS : INSIGHTS.filter(i => i.category === filter);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Globe className="h-5 w-5 text-blue-500" />
          <h1 className="text-2xl font-bold text-slate-900">Norsk Markedsintelligens</h1>
        </div>
        <p className="text-slate-500 text-sm">Innsikt basert pa norske markedsdata, sesonger og bransjetrender. Tilpasset SMB-er.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Aktive innsikter', value: INSIGHTS.length, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Hoy prioritet', value: INSIGHTS.filter(i => i.urgency === 'hoy').length, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Totalt potensial', value: '+370k+', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className={`mb-2 h-8 w-8 rounded-lg flex items-center justify-center ${s.bg}`}>
                <Icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['alle', 'sesong', 'bransje', 'region', 'marked'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {f === 'alle' ? 'Alle' : CATEGORY_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Insights */}
      <div className="space-y-3">
        {filtered.map(insight => (
          <div key={insight.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <button className="w-full text-left p-5" onClick={() => setExpanded(expanded === insight.id ? null : insight.id)}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${CATEGORY_COLORS[insight.category]}`}>{CATEGORY_LABELS[insight.category]}</span>
                    <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${URGENCY_COLORS[insight.urgency]}`}>{insight.urgency === 'hoy' ? 'Hoy prioritet' : insight.urgency === 'middels' ? 'Middels' : 'Lav prioritet'}</span>
                    <span className="ml-auto text-xs text-emerald-700 font-semibold">{insight.potential}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{insight.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{insight.description}</p>
                </div>
                <ArrowUpRight className={`h-4 w-4 text-slate-400 flex-shrink-0 transition ${expanded === insight.id ? 'rotate-90' : ''}`} />
              </div>
            </button>
            {expanded === insight.id && (
              <div className="border-t border-slate-100 px-5 pb-5">
                <p className="text-sm text-slate-700 leading-relaxed mt-3 mb-3">{insight.description}</p>
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Hva du bor gjore</p>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{insight.action}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
