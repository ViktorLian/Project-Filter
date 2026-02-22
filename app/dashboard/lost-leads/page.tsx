'use client';

import { useState } from 'react';
import { RefreshCw, Mail, Phone, Clock, TrendingUp, ChevronRight, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

type LostLead = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  lostDate: string;
  reason: string;
  score: number;
  revenue: number;
  status: 'not_contacted' | 'in_progress' | 'recovered' | 'dead';
  lastAttempt?: string;
};

const REASONS = ['Valgte konkurrent', 'For dyrt', 'Ikke svart', 'Ingen interesse', 'Feil tidspunkt', 'Annet'];

const DEMO: LostLead[] = [
  { id: '1', name: 'Kari Nordmann', email: 'kari@firma.no', phone: '+47 900 11 222', lostDate: '2026-02-10', reason: 'For dyrt', score: 85, revenue: 45000, status: 'not_contacted' },
  { id: '2', name: 'Erik Bakke AS', email: 'erik@bakke.no', lostDate: '2026-02-08', reason: 'Valgte konkurrent', score: 72, revenue: 28000, status: 'in_progress', lastAttempt: '2026-02-15' },
  { id: '3', name: 'Ingrid Hansen', phone: '+47 930 44 555', lostDate: '2026-01-25', reason: 'Ikke svart', score: 60, revenue: 15000, status: 'not_contacted' },
  { id: '4', name: 'Olav Svensson', email: 'olav@svensson.no', phone: '+47 920 77 888', lostDate: '2026-01-15', reason: 'Feil tidspunkt', score: 78, revenue: 62000, status: 'recovered' },
];

const STATUS_CONFIG = {
  not_contacted: { label: 'Ikke kontaktet', bg: 'bg-slate-100', text: 'text-slate-600', icon: XCircle },
  in_progress: { label: 'Under oppfølging', bg: 'bg-blue-100', text: 'text-blue-700', icon: RefreshCw },
  recovered: { label: 'Gjenvunnet', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2 },
  dead: { label: 'Avsluttet', bg: 'bg-red-100', text: 'text-red-600', icon: XCircle },
};

export default function LostLeadsPage() {
  const [leads, setLeads] = useState<LostLead[]>(DEMO);
  const [selected, setSelected] = useState<LostLead | null>(null);
  const [filter, setFilter] = useState<'all' | LostLead['status']>('all');

  const recovered = leads.filter(l => l.status === 'recovered').length;
  const totalLost = leads.reduce((s, l) => s + l.revenue, 0);
  const recoveredRevenue = leads.filter(l => l.status === 'recovered').reduce((s, l) => s + l.revenue, 0);

  const setStatus = (id: string, status: LostLead['status']) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status, lastAttempt: new Date().toISOString().split('T')[0] } : l));
    setSelected(null);
  };

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter);

  const aiMessage = (lead: LostLead) => {
    const messages: Record<string, string> = {
      'For dyrt': `Hei ${lead.name.split(' ')[0]}, takk for at du vurderte oss. Jeg forstår at prisen kan være en faktor. Vi har nå en mulighet til å tilby deg en skreddersydd løsning innenfor ditt budsjett. Kan vi ta en kort samtale?`,
      'Valgte konkurrent': `Hei ${lead.name.split(' ')[0]}, vi håper løsningen du valgte fungerer godt. Vi forbedrer oss kontinuerlig og har nå lansert nye funksjoner. Gi oss beskjed hvis du noen gang ønsker en ny vurdering.`,
      'Ikke svart': `Hei ${lead.name.split(' ')[0]}, jeg prøvde å nå deg tidligere uten hell. Vi hjelper bedrifter som din med å spare tid og øke inntektene. Er du fremdeles interessert i en kort prat?`,
      'Feil tidspunkt': `Hei ${lead.name.split(' ')[0]}, vi hadde kontakt tidligere. Jeg lurer på om timingen er bedre nå? Vi har hatt stor suksess med lignende bedrifter den siste tiden.`,
    };
    return messages[lead.reason] ?? `Hei ${lead.name.split(' ')[0]}, vi ønsker deg tilbake som kunde. Kan vi ta en kort samtale om hvordan vi kan hjelpe deg bedre?`;
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tapte Leads – Gjenvinning</h1>
        <p className="text-slate-500 text-sm mt-0.5">Identifiser tapte salgsmuligheter og start automatisk gjenvinningsprosess</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl bg-white border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Tapte leads</p>
          <p className="text-3xl font-bold text-slate-900">{leads.length}</p>
        </div>
        <div className="rounded-xl bg-red-50 border border-red-200 p-4">
          <p className="text-xs text-red-600 font-medium uppercase tracking-wide mb-1">Tapt omsetning</p>
          <p className="text-2xl font-bold text-red-700">{(totalLost / 1000).toFixed(0)}k kr</p>
        </div>
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
          <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide mb-1">Gjenvunnet</p>
          <p className="text-3xl font-bold text-emerald-700">{recovered}</p>
        </div>
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Gjenvunnet verdi</p>
          <p className="text-2xl font-bold text-blue-700">{(recoveredRevenue / 1000).toFixed(0)}k kr</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'not_contacted', 'in_progress', 'recovered', 'dead'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}>
            {f === 'all' ? 'Alle' : STATUS_CONFIG[f].label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map(lead => {
          const sc = STATUS_CONFIG[lead.status];
          const Icon = sc.icon;
          return (
            <div key={lead.id} className="rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-200 transition cursor-pointer" onClick={() => setSelected(lead)}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-semibold text-slate-900">{lead.name}</h3>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${sc.bg} ${sc.text}`}>
                      <Icon className="h-3 w-3" /> {sc.label}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Score: {lead.score}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    {lead.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{lead.email}</span>}
                    {lead.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{lead.phone}</span>}
                    <span className="flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{lead.reason}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Tapt: {lead.lostDate}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-slate-900">{lead.revenue.toLocaleString('no')} kr</span>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <p className="text-xs font-semibold text-blue-600 uppercase mb-2">AI-forslag til oppfølgingsmelding</p>
              <p className="text-sm text-slate-700 leading-relaxed">{aiMessage(selected)}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {selected.email && (
                <a href={`mailto:${selected.email}`} className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-100 transition">
                  <Mail className="h-4 w-4" /> Send e-post
                </a>
              )}
              {selected.phone && (
                <a href={`tel:${selected.phone}`} className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition">
                  <Phone className="h-4 w-4" /> Ring nå
                </a>
              )}
            </div>

            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Oppdater status</p>
            <div className="grid grid-cols-2 gap-2">
              {(['not_contacted', 'in_progress', 'recovered', 'dead'] as const).map(s => (
                <button key={s} onClick={() => setStatus(selected.id, s)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition border ${selected.status === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}>
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
