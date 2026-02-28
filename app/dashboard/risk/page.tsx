'use client';

import { useEffect, useState } from 'react';
import { Plus, X, AlertTriangle, Shield, TrendingUp, Trash2, Edit3 } from 'lucide-react';

const CATEGORIES = ['Økonomi', 'HMS/Sikkerhet', 'Kunde', 'Leverandor', 'Personal', 'IT/Data', 'Juridisk', 'Operasjonell'];
const STATUSES = ['open', 'mitigated', 'accepted', 'closed'];
const STATUS_LABELS: Record<string, string> = { open: 'Åpen', mitigated: 'Tiltak iverksatt', accepted: 'Akseptert', closed: 'Lukket' };
const STATUS_COLORS: Record<string, string> = { open: 'bg-red-100 text-red-700', mitigated: 'bg-yellow-100 text-yellow-700', accepted: 'bg-blue-100 text-blue-700', closed: 'bg-emerald-100 text-emerald-700' };

type Risk = {
  id: string;
  title: string;
  description: string;
  category: string;
  probability: number;
  impact: number;
  owner: string;
  status: string;
  mitigation: string;
  created_at: string;
};

const EMPTY = { title: '', description: '', category: 'Operasjonell', probability: 3, impact: 3, owner: '', status: 'open', mitigation: '' };

function riskLevel(p: number, i: number) {
  const score = p * i;
  if (score >= 15) return { label: 'Kritisk', color: 'bg-red-500', text: 'text-red-700 bg-red-100' };
  if (score >= 9) return { label: 'Hoy', color: 'bg-orange-500', text: 'text-orange-700 bg-orange-100' };
  if (score >= 4) return { label: 'Middels', color: 'bg-yellow-500', text: 'text-yellow-700 bg-yellow-100' };
  return { label: 'Lav', color: 'bg-emerald-500', text: 'text-emerald-700 bg-emerald-100' };
}

function RiskMatrix({ risks }: { risks: Risk[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="font-bold text-sm text-slate-800 mb-3">Risikomatrise</h3>
      <div className="relative">
        <div className="grid grid-cols-5 gap-1">
          {[5,4,3,2,1].map(prob => (
            [1,2,3,4,5].map(imp => {
              const score = prob * imp;
              const cellRisks = risks.filter(r => r.probability === prob && r.impact === imp && r.status !== 'closed');
              const bg = score >= 15 ? 'bg-red-200' : score >= 9 ? 'bg-orange-200' : score >= 4 ? 'bg-yellow-100' : 'bg-emerald-100';
              return (
                <div key={`${prob}-${imp}`} className={`${bg} rounded p-1.5 min-h-[40px] flex flex-col items-center justify-center`}>
                  {cellRisks.length > 0 && (
                    <span className="text-xs font-bold text-slate-700 bg-white rounded px-1">{cellRisks.length}</span>
                  )}
                </div>
              );
            })
          ))}
        </div>
        <div className="flex justify-between mt-1 px-0.5">
          {[1,2,3,4,5].map(n => <span key={n} className="text-xs text-slate-400 flex-1 text-center">{n}</span>)}
        </div>
        <p className="text-xs text-slate-400 text-center mt-0.5">→ Konsekvens</p>
        <p className="text-xs text-slate-400 text-center">↑ Sannsynlighet</p>
      </div>
    </div>
  );
}

export default function RiskPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editRisk, setEditRisk] = useState<Risk | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: k === 'probability' || k === 'impact' ? Number(e.target.value) : e.target.value }));

  async function load() {
    setLoading(true);
    const r = await fetch('/api/risk');
    if (r.ok) setRisks(await r.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openEdit(r: Risk) {
    setEditRisk(r);
    setForm({ title: r.title, description: r.description ?? '', category: r.category ?? 'Operasjonell', probability: r.probability ?? 3, impact: r.impact ?? 3, owner: r.owner ?? '', status: r.status ?? 'open', mitigation: r.mitigation ?? '' });
    setShowModal(true);
  }

  async function save() {
    setSaving(true);
    const url = editRisk ? `/api/risk/${editRisk.id}` : '/api/risk';
    await fetch(url, { method: editRisk ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false);
    setShowModal(false);
    load();
  }

  async function del(id: string) {
    if (!confirm('Slett risiko?')) return;
    await fetch(`/api/risk/${id}`, { method: 'DELETE' });
    load();
  }

  const filtered = statusFilter === 'all' ? risks : risks.filter(r => r.status === statusFilter);
  const openCount = risks.filter(r => r.status === 'open').length;
  const criticalCount = risks.filter(r => (r.probability * r.impact) >= 15 && r.status !== 'closed').length;

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Risiko-register</h1>
          <p className="text-slate-500 text-sm mt-0.5">Kartlegg, vurder og handter bedriftens risikoer</p>
        </div>
        <button onClick={() => { setEditRisk(null); setForm({ ...EMPTY }); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
          <Plus className="h-4 w-4" /> Registrer risiko
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-red-500" /><span className="text-xs text-slate-500">Åpne risikoer</span></div>
          <p className="text-2xl font-bold text-slate-900">{openCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-red-600" /><span className="text-xs text-slate-500">Kritiske</span></div>
          <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1"><Shield className="h-4 w-4 text-emerald-500" /><span className="text-xs text-slate-500">Lukkede</span></div>
          <p className="text-2xl font-bold text-slate-900">{risks.filter(r => r.status === 'closed').length}</p>
        </div>
        <RiskMatrix risks={risks} />
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {[['all','Alle'], ...STATUSES.map(s => [s, STATUS_LABELS[s]])].map(([val, label]) => (
          <button key={val} onClick={() => setStatusFilter(val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${statusFilter === val ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">Laster risikoer...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
          <Shield className="h-10 w-10 mb-3 opacity-30" />
          <p className="font-medium">Ingen risikoer registrert</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.sort((a, b) => (b.probability * b.impact) - (a.probability * a.impact)).map(r => {
            const level = riskLevel(r.probability, r.impact);
            return (
              <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-900">{r.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${level.text}`}>{level.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] ?? 'bg-slate-100 text-slate-600'}`}>{STATUS_LABELS[r.status] ?? r.status}</span>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{r.category}</span>
                    </div>
                    {r.description && <p className="text-xs text-slate-500 mt-1">{r.description}</p>}
                    <div className="flex gap-4 mt-2">
                      <span className="text-xs text-slate-500">Sannsynlighet: <strong>{r.probability}/5</strong></span>
                      <span className="text-xs text-slate-500">Konsekvens: <strong>{r.impact}/5</strong></span>
                      <span className="text-xs text-slate-500">Score: <strong>{r.probability * r.impact}/25</strong></span>
                      {r.owner && <span className="text-xs text-slate-500">Eier: <strong>{r.owner}</strong></span>}
                    </div>
                    {r.mitigation && <p className="text-xs text-slate-600 mt-1 bg-slate-50 rounded px-2 py-1">Tiltak: {r.mitigation}</p>}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit3 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => del(r.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{editRisk ? 'Rediger risiko' : 'Registrer ny risiko'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Risiko-tittel *</label>
                <input value={form.title} onChange={set('title')} placeholder="F.eks. Nøkkelperson slutter" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Beskrivelse</label>
                <textarea value={form.description} onChange={set('description')} rows={2} placeholder="Hva kan skje og hvorfor?" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori</label>
                  <select value={form.category} onChange={set('category')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Eier</label>
                  <input value={form.owner} onChange={set('owner')} placeholder="Navn / stilling" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Sannsynlighet (1–5)</label>
                  <input type="range" min={1} max={5} value={form.probability} onChange={set('probability')} className="w-full" />
                  <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                    <span>Lav</span><span className="font-bold text-slate-700">{form.probability}</span><span>Hoy</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Konsekvens (1–5)</label>
                  <input type="range" min={1} max={5} value={form.impact} onChange={set('impact')} className="w-full" />
                  <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                    <span>Lav</span><span className="font-bold text-slate-700">{form.impact}</span><span>Hoy</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-2 text-center">
                <span className="text-xs text-slate-500">Risikoscore: </span>
                <span className={`text-sm font-bold ${riskLevel(form.probability, form.impact).text} px-2 py-0.5 rounded`}>
                  {form.probability * form.impact}/25 — {riskLevel(form.probability, form.impact).label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select value={form.status} onChange={set('status')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tiltak</label>
                <textarea value={form.mitigation} onChange={set('mitigation')} rows={2} placeholder="Hva gjores for å redusere risikoen?" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 p-5 pt-0">
              <button onClick={save} disabled={saving || !form.title}
                className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition">
                {saving ? 'Lagrer...' : editRisk ? 'Lagre endringer' : 'Registrer risiko'}
              </button>
              <button onClick={() => setShowModal(false)} className="px-5 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition">Avbryt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
