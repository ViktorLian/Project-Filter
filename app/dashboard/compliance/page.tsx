'use client';

import { useState, useEffect } from 'react';
import {
  Shield, FileText, AlertTriangle, CheckCircle2, Plus,
  Clock, X, Loader2, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';

type DocStatus = 'active' | 'expiring' | 'expired';
type DevStatus = 'open' | 'in_progress' | 'closed';
type Severity = 'low' | 'medium' | 'high' | 'critical';

interface ComplianceDoc {
  id: string;
  title: string;
  category?: string;
  status: DocStatus;
  expiry_date?: string;
  file_url?: string;
  notes?: string;
  created_at: string;
}

interface Deviation {
  id: string;
  title: string;
  description?: string;
  severity: Severity;
  status: DevStatus;
  reported_by?: string;
  created_at: string;
}

const SEV_CONFIG: Record<Severity, { label: string; color: string; bg: string; border: string }> = {
  low: { label: 'Lav', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
  medium: { label: 'Medium', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  high: { label: 'Høy', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  critical: { label: 'Kritisk', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
};

const DOC_STATUS_CONFIG: Record<DocStatus, { label: string; icon: React.ElementType; color: string }> = {
  active: { label: 'Gyldig', icon: CheckCircle2, color: 'text-emerald-600' },
  expiring: { label: 'Utløper snart', icon: Clock, color: 'text-amber-500' },
  expired: { label: 'Utløpt', icon: AlertTriangle, color: 'text-red-500' },
};

const CHECKLIST = [
  { id: 'hms', label: 'HMS-håndbok er oppdatert', link: '#docs' },
  { id: 'forsikring', label: 'Ansvarsforsikring er aktiv', link: '#docs' },
  { id: 'personvern', label: 'Personvernerklæring er publisert', link: '#docs' },
  { id: 'kontrakt', label: 'Kundekontrakter er signert', link: '#docs' },
  { id: 'regnskap', label: 'Regnskapet er à jour', link: '#docs' },
  { id: 'avvikslukket', label: 'Åpne avvik er lukket', link: '#deviations' },
];

export default function CompliancePage() {
  const [docs, setDocs] = useState<ComplianceDoc[]>([]);
  const [devs, setDevs] = useState<Deviation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'docs' | 'deviations' | 'checklist'>('docs');
  const [showDocForm, setShowDocForm] = useState(false);
  const [showDevForm, setShowDevForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiTip, setAiTip] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [docForm, setDocForm] = useState({ title: '', category: '', expiry_date: '', file_url: '', notes: '' });
  const [devForm, setDevForm] = useState({ title: '', description: '', severity: 'medium' as Severity, reported_by: '' });
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/compliance').then(r => r.json()).then(d => {
      setDocs(d.documents ?? []);
      setDevs(d.deviations ?? []);
    }).finally(() => setLoading(false));
    try {
      const saved = JSON.parse(localStorage.getItem('compliance-checklist') || '{}');
      setChecklist(saved);
    } catch { /* ignore */ }
  }, []);

  function toggleCheck(id: string) {
    setChecklist(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('compliance-checklist', JSON.stringify(next));
      return next;
    });
  }

  async function saveDoc(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/compliance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'document', ...docForm }),
    });
    if (res.ok) { const d = await res.json(); setDocs(prev => [d.document, ...prev]); setShowDocForm(false); setDocForm({ title: '', category: '', expiry_date: '', file_url: '', notes: '' }); }
    setSaving(false);
  }

  async function saveDev(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/compliance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'deviation', ...devForm }),
    });
    if (res.ok) { const d = await res.json(); setDevs(prev => [d.deviation, ...prev]); setShowDevForm(false); setDevForm({ title: '', description: '', severity: 'medium', reported_by: '' }); }
    setSaving(false);
  }

  async function updateDevStatus(id: string, status: DevStatus) {
    setDevs(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    await fetch('/api/compliance', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'deviation', id, status }) });
  }

  async function getAiRisk() {
    setAiLoading(true);
    setAiTip('');
    try {
      const expired = docs.filter(d => d.status === 'expired').length;
      const expiring = docs.filter(d => d.status === 'expiring').length;
      const openDevs = devs.filter(d => d.status !== 'closed');
      const criticalDevs = openDevs.filter(d => d.severity === 'critical' || d.severity === 'high');
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Jeg driver en norsk SMB og trenger en risikovurdering:
- Utgåtte dokumenter: ${expired}
- Dokumenter som utløper snart: ${expiring}
- Åpne avvik: ${openDevs.length} (${criticalDevs.length} høy/kritisk alvorlighetsgrad)
- Sjekkliste fullføring: ${Object.values(checklist).filter(Boolean).length}/${CHECKLIST.length}

Gi meg top 3 risikoer og hva jeg bør gjøre nå. Maks 160 ord. Norsk bokmål.`,
          history: [],
        }),
      });
      const d = await res.json();
      setAiTip(d.reply || '');
    } finally { setAiLoading(false); }
  }

  const openDevCount = devs.filter(d => d.status !== 'closed').length;
  const expiredDocs = docs.filter(d => d.status === 'expired').length;
  const expiringDocs = docs.filter(d => d.status === 'expiring').length;

  return (
    <div className="pb-10 pt-1">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compliance & Sikkerhet</h1>
          <p className="text-slate-500 text-sm mt-0.5">Dokumenter, avvik og regeloverholdelse på ett sted</p>
        </div>
        <button onClick={getAiRisk} disabled={aiLoading} className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50">
          {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          AI-risikovurdering
        </button>
      </div>

      {/* AI tip */}
      {aiTip && (
        <div className="mb-4 rounded-xl border border-purple-200 bg-purple-50 p-4">
          <p className="text-xs font-semibold text-purple-700 mb-1.5 flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" /> AI-risikovurdering</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{aiTip}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: FileText, label: 'Dokumenter', value: docs.length, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
          { icon: AlertTriangle, label: 'Utløpt', value: expiredDocs, color: expiredDocs > 0 ? 'text-red-600' : 'text-slate-400', bg: expiredDocs > 0 ? 'bg-red-50' : 'bg-slate-50', border: expiredDocs > 0 ? 'border-red-200' : 'border-slate-200' },
          { icon: Clock, label: 'Utløper snart', value: expiringDocs, color: expiringDocs > 0 ? 'text-amber-600' : 'text-slate-400', bg: expiringDocs > 0 ? 'bg-amber-50' : 'bg-slate-50', border: expiringDocs > 0 ? 'border-amber-200' : 'border-slate-200' },
          { icon: AlertTriangle, label: 'Åpne avvik', value: openDevCount, color: openDevCount > 0 ? 'text-orange-600' : 'text-slate-400', bg: openDevCount > 0 ? 'bg-orange-50' : 'bg-slate-50', border: openDevCount > 0 ? 'border-orange-200' : 'border-slate-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} p-4`}>
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{s.label}</span>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 mb-5 w-fit">
        {[
          { id: 'docs', label: 'Dokumenter', count: docs.length },
          { id: 'deviations', label: 'Avvikslogg', count: openDevCount },
          { id: 'checklist', label: 'Sjekkliste', count: null },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition flex items-center gap-2 ${tab === t.id ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {t.label}
            {t.count !== null && t.count > 0 && (
              <span className="text-xs rounded-full bg-red-100 text-red-600 px-1.5 py-0.5 font-bold">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
      ) : tab === 'docs' ? (
        <>
          <div className="flex justify-end mb-3">
            <button onClick={() => setShowDocForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition">
              <Plus className="h-4 w-4" /> Legg til dokument
            </button>
          </div>
          {docs.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center text-slate-400">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Ingen dokumenter ennå</p>
              <p className="text-sm mt-1">Legg til HMS, forsikringer, kontrakter og andre nødvendige dokumenter</p>
            </div>
          ) : (
            <div className="space-y-2">
              {docs.map(doc => {
                const sc = DOC_STATUS_CONFIG[doc.status];
                return (
                  <div key={doc.id} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-4">
                    <sc.icon className={`h-5 w-5 shrink-0 ${sc.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800">{doc.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {doc.category && `${doc.category} · `}
                        {doc.expiry_date ? `Utløper: ${new Date(doc.expiry_date).toLocaleDateString('nb-NO')}` : 'Ingen utløpsdato'}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold ${sc.color}`}>{sc.label}</span>
                    {doc.file_url && (
                      <a href={doc.file_url} target="_blank" className="text-xs text-blue-600 hover:underline shrink-0">Åpne</a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : tab === 'deviations' ? (
        <>
          <div className="flex justify-end mb-3">
            <button onClick={() => setShowDevForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition">
              <Plus className="h-4 w-4" /> Registrer avvik
            </button>
          </div>
          {devs.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center text-slate-400">
              <Shield className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Ingen avvik registrert</p>
              <p className="text-sm mt-1">Logg feil, hendelser og forbedringsmuligheter her</p>
            </div>
          ) : (
            <div className="space-y-2">
              {devs.map(dev => {
                const sev = SEV_CONFIG[dev.severity];
                return (
                  <div key={dev.id} className={`rounded-xl border ${sev.border} ${sev.bg} p-4`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${sev.border} ${sev.color} bg-white`}>{sev.label}</span>
                          {dev.status === 'closed' && <span className="text-xs font-semibold text-emerald-600">Lukket</span>}
                          {dev.status === 'in_progress' && <span className="text-xs font-semibold text-blue-600">Pågår</span>}
                          {dev.status === 'open' && <span className="text-xs font-semibold text-orange-600">Åpen</span>}
                        </div>
                        <p className="font-medium text-slate-800">{dev.title}</p>
                        {dev.description && <p className="text-xs text-slate-600 mt-0.5">{dev.description}</p>}
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(dev.created_at).toLocaleDateString('nb-NO')}
                          {dev.reported_by && ` · ${dev.reported_by}`}
                        </p>
                      </div>
                      {dev.status !== 'closed' && (
                        <div className="flex gap-1 shrink-0">
                          {dev.status === 'open' && (
                            <button onClick={() => updateDevStatus(dev.id, 'in_progress')} className="text-xs px-2 py-1 rounded-lg bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 transition">→ Pågår</button>
                          )}
                          <button onClick={() => updateDevStatus(dev.id, 'closed')} className="text-xs px-2 py-1 rounded-lg bg-white border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition">✓ Lukk</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-500" /> Compliance-sjekkliste
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            {Object.values(checklist).filter(Boolean).length} av {CHECKLIST.length} punkter er fullført
          </p>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-5">
            <div
              className="h-2 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${(Object.values(checklist).filter(Boolean).length / CHECKLIST.length) * 100}%` }}
            />
          </div>
          <div className="space-y-2">
            {CHECKLIST.map(item => (
              <label key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={!!checklist[item.id]}
                  onChange={() => toggleCheck(item.id)}
                  className="h-4 w-4 rounded accent-emerald-500"
                />
                <span className={`text-sm ${checklist[item.id] ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {item.label}
                </span>
                {checklist[item.id] && <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Doc form modal */}
      {showDocForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowDocForm(false)}>
          <form onClick={e => e.stopPropagation()} onSubmit={saveDoc} className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-slate-900">Legg til dokument</h2>
              <button type="button" onClick={() => setShowDocForm(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Dokumentnavn *</label>
              <input required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={docForm.title} onChange={e => setDocForm(f => ({ ...f, title: e.target.value }))} placeholder="f.eks. HMS-håndbok 2026" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Kategori</label>
                <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={docForm.category} onChange={e => setDocForm(f => ({ ...f, category: e.target.value }))} placeholder="HMS, Forsikring..." />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Utløpsdato</label>
                <input type="date" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={docForm.expiry_date} onChange={e => setDocForm(f => ({ ...f, expiry_date: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Lenke til dokument</label>
              <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={docForm.file_url} onChange={e => setDocForm(f => ({ ...f, file_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setShowDocForm(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Avbryt</button>
              <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Lagre
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Deviation modal */}
      {showDevForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowDevForm(false)}>
          <form onClick={e => e.stopPropagation()} onSubmit={saveDev} className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-slate-900">Registrer avvik</h2>
              <button type="button" onClick={() => setShowDevForm(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Avvikstittel *</label>
              <input required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={devForm.title} onChange={e => setDevForm(f => ({ ...f, title: e.target.value }))} placeholder="Kort beskrivelse av avviket" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Detaljer</label>
              <textarea rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none" value={devForm.description} onChange={e => setDevForm(f => ({ ...f, description: e.target.value }))} placeholder="Hva skjedde? Årsak? Konsekvens?" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Alvorlighetsgrad</label>
                <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={devForm.severity} onChange={e => setDevForm(f => ({ ...f, severity: e.target.value as Severity }))}>
                  <option value="low">Lav</option>
                  <option value="medium">Medium</option>
                  <option value="high">Høy</option>
                  <option value="critical">Kritisk</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Rapportert av</label>
                <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={devForm.reported_by} onChange={e => setDevForm(f => ({ ...f, reported_by: e.target.value }))} placeholder="Navn" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setShowDevForm(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Avbryt</button>
              <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Registrer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
