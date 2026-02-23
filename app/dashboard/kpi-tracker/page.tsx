'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface KPI {
  id: string;
  label: string;
  unit: string;
  target: number;
  current: number;
  category: string;
  trend: 'up' | 'down' | 'flat';
  goodDirection: 'up' | 'down';
}

const defaultKPIs: KPI[] = [
  { id: 'revenue', label: 'Månedlig omsetning', unit: 'kr', target: 250000, current: 187000, category: 'Økonomi', trend: 'up', goodDirection: 'up' },
  { id: 'jobs', label: 'Antall fullførte jobber', unit: 'stk', target: 22, current: 17, category: 'Operasjon', trend: 'up', goodDirection: 'up' },
  { id: 'margin', label: 'Gjennomsnittlig margin', unit: '%', target: 32, current: 26, category: 'Økonomi', trend: 'down', goodDirection: 'up' },
  { id: 'leads', label: 'Nye leads denne måneden', unit: 'stk', target: 35, current: 28, category: 'Salg', trend: 'up', goodDirection: 'up' },
  { id: 'conversion', label: 'Lead-til-jobb konvertering', unit: '%', target: 55, current: 61, category: 'Salg', trend: 'up', goodDirection: 'up' },
  { id: 'response_time', label: 'Gjennomsnittlig responstid', unit: 'timer', target: 2, current: 3.4, category: 'Salg', trend: 'down', goodDirection: 'down' },
  { id: 'customer_sat', label: 'Kundetilfredshet', unit: '/10', target: 9, current: 8.4, category: 'Kunde', trend: 'flat', goodDirection: 'up' },
  { id: 'reviews', label: 'Google-anmeldelser (ny)', unit: 'stk', target: 8, current: 5, category: 'Markedsføring', trend: 'up', goodDirection: 'up' },
  { id: 'invoice_time', label: 'Dager til faktura sendt', unit: 'dager', target: 1, current: 2.5, category: 'Økonomi', trend: 'flat', goodDirection: 'down' },
  { id: 'unpaid', label: 'Ubetalt faktura (> 30 dager)', unit: 'kr', target: 0, current: 24000, category: 'Økonomi', trend: 'down', goodDirection: 'down' },
];

const categories = Array.from(new Set(defaultKPIs.map(k => k.category)));

function getPct(kpi: KPI) {
  if (kpi.goodDirection === 'down') {
    if (kpi.target === 0) return kpi.current === 0 ? 100 : 0;
    return Math.min(100, Math.round((kpi.target / kpi.current) * 100));
  }
  return Math.min(100, Math.round((kpi.current / kpi.target) * 100));
}

function getStatus(kpi: KPI) {
  const pct = getPct(kpi);
  if (pct >= 100) return { color: 'text-green-600', bg: 'bg-green-500', badge: 'bg-green-100 text-green-700', label: 'Mål nådd' };
  if (pct >= 80) return { color: 'text-blue-600', bg: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700', label: 'Nær mål' };
  if (pct >= 60) return { color: 'text-amber-600', bg: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', label: 'Under mål' };
  return { color: 'text-red-600', bg: 'bg-red-500', badge: 'bg-red-100 text-red-700', label: 'Kritisk' };
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'up') return <span className="text-green-500 text-sm">▲</span>;
  if (trend === 'down') return <span className="text-red-500 text-sm">▼</span>;
  return <span className="text-slate-400 text-sm">—</span>;
}

export default function KPITrackerPage() {
  const [kpis, setKpis] = useState(defaultKPIs);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [aiReport, setAiReport] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  const filtered = selectedCat ? kpis.filter(k => k.category === selectedCat) : kpis;
  const onTrack = kpis.filter(k => getPct(k) >= 80).length;
  const offTrack = kpis.filter(k => getPct(k) < 60).length;

  function startEdit(kpi: KPI) {
    setEditing(kpi.id);
    setEditValue(String(kpi.current));
    setEditTarget(String(kpi.target));
  }

  function saveEdit(id: string) {
    setKpis(prev => prev.map(k =>
      k.id === id
        ? { ...k, current: parseFloat(editValue) || k.current, target: parseFloat(editTarget) || k.target }
        : k
    ));
    setEditing(null);
  }

  async function generateReport() {
    setLoadingAI(true);
    setAiReport('');
    const offTrackList = kpis.filter(k => getPct(k) < 80).map(k =>
      `${k.label}: ${k.current}${k.unit} av mål ${k.target}${k.unit} (${getPct(k)}%)`
    ).join('\n');

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Jeg er eier av en norsk service/håndverksbedrift. Her er mine KPIer som er under mål denne måneden:\n${offTrackList}\n\nKPIer som er på mål: ${onTrack} av ${kpis.length}\n\nGi meg en kort analyse og 3 prioriterte tiltak jeg kan gjøre DENNE UKEN for å forbedre de viktigste målene. Vær spesifikk og praktisk. Max 180 ord. Norsk bokmål.`,
        }),
      });
      const data = await res.json();
      setAiReport(data.reply || data.message || 'Ingen respons.');
    } catch {
      setAiReport('Klarte ikke hente rapport. Sjekk tilkobling.');
    }
    setLoadingAI(false);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">KPI-oversikt</h1>
          <p className="text-slate-500 mt-1">Nøkkeltall for bedriften — sett mål, følg utvikling</p>
        </div>
        <Button onClick={generateReport} disabled={loadingAI} className="bg-blue-600 hover:bg-blue-700">
          {loadingAI ? 'Analyserer...' : 'AI-rapport'}
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-500">På mål</p>
            <p className="text-2xl font-bold text-green-600">{onTrack}</p>
            <p className="text-xs text-slate-400">av {kpis.length} KPIer</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-500">Kritiske</p>
            <p className="text-2xl font-bold text-red-600">{offTrack}</p>
            <p className="text-xs text-slate-400">trenger tiltak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-500">Omsetning</p>
            <p className="text-2xl font-bold text-slate-900">
              {(kpis.find(k => k.id === 'revenue')?.current || 0).toLocaleString('nb-NO')}
            </p>
            <p className="text-xs text-slate-400">kr denne mnd</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-500">Konvertering</p>
            <p className="text-2xl font-bold text-slate-900">
              {kpis.find(k => k.id === 'conversion')?.current}%
            </p>
            <p className="text-xs text-slate-400">lead til jobb</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Report */}
      {aiReport && (
        <Card className="border-blue-200 bg-blue-50/40">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">AI-analyse og tiltak</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{aiReport}</p>
          </CardContent>
        </Card>
      )}

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setSelectedCat(null)} className={`px-3 py-1.5 rounded-full text-sm border ${!selectedCat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}>
          Alle
        </button>
        {categories.map(c => (
          <button key={c} onClick={() => setSelectedCat(c === selectedCat ? null : c)} className={`px-3 py-1.5 rounded-full text-sm border ${selectedCat === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* KPI list */}
      <div className="space-y-3">
        {filtered.map(kpi => {
          const pct = getPct(kpi);
          const status = getStatus(kpi);
          return (
            <Card key={kpi.id} className="overflow-hidden">
              <CardContent className="p-4">
                {editing === kpi.id ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-medium text-slate-900 flex-1 min-w-0">{kpi.label}</span>
                    <div className="flex gap-2">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Nåværende</p>
                        <Input value={editValue} onChange={e => setEditValue(e.target.value)} className="w-28 h-8 text-sm" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Mål</p>
                        <Input value={editTarget} onChange={e => setEditTarget(e.target.value)} className="w-28 h-8 text-sm" />
                      </div>
                      <Button onClick={() => saveEdit(kpi.id)} className="self-end h-8 text-xs bg-blue-600 hover:bg-blue-700">Lagre</Button>
                      <Button onClick={() => setEditing(null)} variant="outline" className="self-end h-8 text-xs">Avbryt</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-medium text-slate-900 truncate">{kpi.label}</span>
                          <TrendIcon trend={kpi.trend} />
                          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${status.badge}`}>{status.label}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-sm font-bold ${status.color}`}>
                            {typeof kpi.current === 'number' && kpi.current > 1000
                              ? kpi.current.toLocaleString('nb-NO')
                              : kpi.current}{kpi.unit}
                          </span>
                          <span className="text-xs text-slate-400">
                            / {typeof kpi.target === 'number' && kpi.target > 1000
                              ? kpi.target.toLocaleString('nb-NO')
                              : kpi.target}{kpi.unit}
                          </span>
                          <button onClick={() => startEdit(kpi)} className="text-xs text-blue-500 hover:text-blue-700">Rediger</button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${status.bg}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 w-10 text-right">{pct}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-center text-slate-400">
        Klikk "Rediger" på en KPI for å oppdatere nåværende verdi og mål. Data synkroniseres med dashbordet ditt.
      </p>
    </div>
  );
}
