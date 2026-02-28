'use client';

import { useEffect, useState } from 'react';
import { Plus, ChevronRight, X, DollarSign, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

const STAGES = [
  { key: 'lead',      label: 'Ny lead',          color: 'border-slate-300 bg-slate-50',    dot: 'bg-slate-400' },
  { key: 'contacted', label: 'Kontaktet',         color: 'border-blue-300 bg-blue-50',     dot: 'bg-blue-500' },
  { key: 'proposal',  label: 'Tilbud sendt',      color: 'border-yellow-300 bg-yellow-50', dot: 'bg-yellow-500' },
  { key: 'contract',  label: 'Kontrakt signert',  color: 'border-purple-300 bg-purple-50', dot: 'bg-purple-500' },
  { key: 'delivery',  label: 'Under levering',    color: 'border-orange-300 bg-orange-50', dot: 'bg-orange-500' },
  { key: 'invoice',   label: 'Faktura sendt',     color: 'border-cyan-300 bg-cyan-50',     dot: 'bg-cyan-500' },
  { key: 'won',       label: 'Fullfort',          color: 'border-emerald-300 bg-emerald-50',dot: 'bg-emerald-500' },
  { key: 'lost',      label: 'Tapt',              color: 'border-red-300 bg-red-50',       dot: 'bg-red-400' },
];

type Job = {
  id: string;
  title: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  stage: string;
  value: number;
  notes: string;
  due_date: string;
  assigned_to: string;
  lost_reason: string;
  created_at: string;
};

const EMPTY_JOB = {
  title: '', customer_name: '', customer_email: '', customer_phone: '',
  stage: 'lead', value: 0, notes: '', due_date: '', assigned_to: '', lost_reason: ''
};

export default function PipelinePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [form, setForm] = useState({ ...EMPTY_JOB });
  const [saving, setSaving] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function load() {
    setLoading(true);
    const r = await fetch('/api/pipeline');
    if (r.ok) setJobs(await r.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditJob(null);
    setForm({ ...EMPTY_JOB });
    setShowModal(true);
  }

  function openEdit(j: Job) {
    setEditJob(j);
    setForm({ title: j.title, customer_name: j.customer_name, customer_email: j.customer_email, customer_phone: j.customer_phone, stage: j.stage, value: j.value, notes: j.notes, due_date: j.due_date ?? '', assigned_to: j.assigned_to ?? '', lost_reason: j.lost_reason ?? '' });
    setShowModal(true);
  }

  async function save() {
    setSaving(true);
    const url = editJob ? `/api/pipeline/${editJob.id}` : '/api/pipeline';
    await fetch(url, { method: editJob ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false);
    setShowModal(false);
    load();
  }

  async function moveStage(job: Job, direction: 'forward' | 'back') {
    const idx = STAGES.findIndex(s => s.key === job.stage);
    const next = STAGES[direction === 'forward' ? idx + 1 : idx - 1];
    if (!next) return;
    await fetch(`/api/pipeline/${job.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage: next.key }) });
    load();
  }

  async function deleteJob(id: string) {
    if (!confirm('Slett denne jobben?')) return;
    await fetch(`/api/pipeline/${id}`, { method: 'DELETE' });
    load();
  }

  const totalPipeline = jobs.filter(j => !['won','lost'].includes(j.stage)).reduce((s, j) => s + (j.value ?? 0), 0);
  const wonThisMonth = jobs.filter(j => j.stage === 'won' && j.created_at?.startsWith(new Date().toISOString().substring(0, 7))).reduce((s, j) => s + (j.value ?? 0), 0);
  const convRate = jobs.length > 0 ? Math.round((jobs.filter(j => j.stage === 'won').length / jobs.length) * 100) : 0;

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jobbpipeline</h1>
          <p className="text-slate-500 text-sm mt-0.5">Følg en jobb fra første kontakt til betalt faktura</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
          <Plus className="h-4 w-4" /> Legg til jobb
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-slate-500 font-medium">Aktiv pipeline</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalPipeline.toLocaleString('nb-NO')} kr</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-slate-500 font-medium">Vunnet denne mnd</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{wonThisMonth.toLocaleString('nb-NO')} kr</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-slate-500 font-medium">Konverteringsrate</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{convRate}%</p>
        </div>
      </div>

      {/* Kanban */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-400">Laster pipeline...</div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {STAGES.map(stage => {
              const stageJobs = jobs.filter(j => j.stage === stage.key);
              const stageValue = stageJobs.reduce((s, j) => s + (j.value ?? 0), 0);
              return (
                <div key={stage.key} className={`w-64 rounded-xl border-2 ${stage.color} flex flex-col`}>
                  <div className="px-3 pt-3 pb-2">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${stage.dot}`} />
                      <span className="font-bold text-sm text-slate-800">{stage.label}</span>
                      <span className="ml-auto bg-white rounded-full px-1.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">{stageJobs.length}</span>
                    </div>
                    {stageValue > 0 && (
                      <p className="text-xs text-slate-500 mt-0.5 pl-3.5">{stageValue.toLocaleString('nb-NO')} kr</p>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto max-h-[60vh] px-2 pb-2 space-y-2">
                    {stageJobs.map(job => (
                      <div key={job.id} className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow-md transition cursor-pointer" onClick={() => openEdit(job)}>
                        <p className="font-semibold text-sm text-slate-900 leading-tight">{job.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{job.customer_name}</p>
                        {job.value > 0 && <p className="text-xs font-bold text-blue-600 mt-1">{job.value.toLocaleString('nb-NO')} kr</p>}
                        {job.due_date && <p className="text-xs text-slate-400 mt-1">Frist: {job.due_date}</p>}
                        {job.assigned_to && <p className="text-xs text-slate-400">{job.assigned_to}</p>}
                        <div className="flex gap-1 mt-2" onClick={e => e.stopPropagation()}>
                          {STAGES.findIndex(s => s.key === job.stage) > 0 && (
                            <button onClick={() => moveStage(job, 'back')} className="text-xs bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded transition text-slate-600">← Tilbake</button>
                          )}
                          {STAGES.findIndex(s => s.key === job.stage) < STAGES.length - 1 && (
                            <button onClick={() => moveStage(job, 'forward')} className="text-xs bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded transition text-blue-700 font-medium">Neste →</button>
                          )}
                          <button onClick={() => deleteJob(job.id)} className="text-xs bg-red-50 hover:bg-red-100 px-1.5 py-0.5 rounded transition text-red-500 ml-auto">Slett</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { setForm({ ...EMPTY_JOB, stage: stage.key }); setEditJob(null); setShowModal(true); }}
                    className="m-2 border-2 border-dashed border-slate-300 rounded-lg py-1.5 text-xs text-slate-400 hover:border-blue-400 hover:text-blue-500 transition font-medium">
                    + Legg til her
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{editJob ? 'Rediger jobb' : 'Ny jobb'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Jobbtittel *</label>
                <input value={form.title} onChange={set('title')} placeholder="Rørleggerarbeid - Storgata 12" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kundenavn</label>
                  <input value={form.customer_name} onChange={set('customer_name')} placeholder="Ola Nordmann" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Verdi (kr)</label>
                  <input type="number" value={form.value} onChange={set('value')} placeholder="25000" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">E-post</label>
                  <input type="email" value={form.customer_email} onChange={set('customer_email')} placeholder="ola@bedrift.no" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Telefon</label>
                  <input value={form.customer_phone} onChange={set('customer_phone')} placeholder="+47 900 00 000" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Stadium</label>
                  <select value={form.stage} onChange={set('stage')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Frist</label>
                  <input type="date" value={form.due_date} onChange={set('due_date')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Ansvarlig</label>
                <input value={form.assigned_to} onChange={set('assigned_to')} placeholder="Per Hansen" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notater</label>
                <textarea value={form.notes} onChange={set('notes')} rows={3} placeholder="Tilleggsinformasjon..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              {form.stage === 'lost' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tapte fordi...</label>
                  <input value={form.lost_reason} onChange={set('lost_reason')} placeholder="Pris for høy / Valgte konkurrent / etc." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
            </div>
            <div className="flex gap-3 p-5 pt-0">
              <button onClick={save} disabled={saving || !form.title}
                className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition">
                {saving ? 'Lagrer...' : editJob ? 'Lagre endringer' : 'Opprett jobb'}
              </button>
              <button onClick={() => setShowModal(false)} className="px-5 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition">Avbryt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
