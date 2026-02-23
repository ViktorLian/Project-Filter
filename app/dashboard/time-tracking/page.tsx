'use client';

import { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, DollarSign, Users, Calendar, TrendingUp, Sparkles } from 'lucide-react';

type TimeEntry = {
  id: string;
  employee: string;
  description: string;
  date: string;
  hours: number;
  hourly_rate: number;
  billable: boolean;
};

const EMPLOYEES = ['Meg selv', 'Ansatt 1', 'Ansatt 2', 'Ansatt 3'];

const EMPTY: Omit<TimeEntry, 'id'> = {
  employee: 'Meg selv',
  description: '',
  date: new Date().toISOString().slice(0, 10),
  hours: 0,
  hourly_rate: 850,
  billable: true,
};

export default function TimeTrackingPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filterEmployee, setFilterEmployee] = useState('');
  const [weekMode, setWeekMode] = useState(true);
  const [aiReport, setAiReport] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/time-entries');
      const json = await res.json();
      setEntries(json.entries || []);
    } catch { setEntries([]); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.hours || form.hours <= 0) return;
    setSaving(true);
    try {
      const res = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) { setShowAdd(false); setForm(EMPTY); load(); }
    } finally { setSaving(false); }
  }

  async function remove(id: string) {
    await fetch(`/api/time-entries?id=${id}`, { method: 'DELETE' });
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  // Filter entries
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  const weekStartStr = weekStart.toISOString().slice(0, 10);

  const filtered = entries
    .filter(e => !filterEmployee || e.employee === filterEmployee)
    .filter(e => !weekMode || e.date >= weekStartStr);

  // Stats
  const totalHours = filtered.reduce((s, e) => s + (e.hours || 0), 0);
  const billableHours = filtered.filter(e => e.billable).reduce((s, e) => s + (e.hours || 0), 0);
  const totalValue = filtered.filter(e => e.billable).reduce((s, e) => s + (e.hours * e.hourly_rate), 0);
  const employees = Array.from(new Set(entries.map(e => e.employee)));

  // Group by employee for this period
  const byEmployee = employees.reduce((acc, emp) => {
    const empEntries = filtered.filter(e => e.employee === emp);
    acc[emp] = {
      hours: empEntries.reduce((s, e) => s + e.hours, 0),
      value: empEntries.filter(e => e.billable).reduce((s, e) => s + e.hours * e.hourly_rate, 0),
    };
    return acc;
  }, {} as Record<string, { hours: number; value: number }>);

  async function getAiReport() {
    setAiLoading(true);
    setAiReport('');
    try {
      const summary = Object.entries(byEmployee).map(([emp, d]) =>
        `${emp}: ${d.hours.toFixed(1)} timer, ${d.value.toLocaleString('nb-NO')} kr fakturerbart`
      ).join('; ');
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analyser denne timelisten for en norsk servicebedrift:
${summary}
Totalt: ${totalHours.toFixed(1)} timer, ${billableHours.toFixed(1)} fakturerbare timer, ${totalValue.toLocaleString('nb-NO')} kr

Gi 3-4 konkrete tips: Effektivitet, faktureringsrate, og om noe bør optimaliseres. Maks 150 ord. Norsk bokmål.`,
          history: [],
        }),
      });
      const data = await res.json();
      setAiReport(data.reply || 'Ingen analyse.');
    } finally { setAiLoading(false); }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Timeregistrering</h1>
          <p className="text-slate-500 mt-1">Logg arbeidstimer per ansatt og oppdrag</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setWeekMode(!weekMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${weekMode ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}>
            {weekMode ? 'Denne uken' : 'Alle'}
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" /> Logg timer
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Totale timer', value: `${totalHours.toFixed(1)}t`, icon: Clock, color: 'text-blue-600 bg-blue-50' },
          { label: 'Fakturerbare timer', value: `${billableHours.toFixed(1)}t`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Fakturerbar verdi', value: `${totalValue.toLocaleString('nb-NO')} kr`, icon: DollarSign, color: 'text-amber-600 bg-amber-50' },
          { label: 'Ansatte', value: employees.length.toString(), icon: Users, color: 'text-purple-600 bg-purple-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`h-8 w-8 rounded-lg ${color} flex items-center justify-center mb-2`}>
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-blue-200 p-5 space-y-4">
          <h3 className="font-semibold text-slate-800">Logg ny timeregistrering</h3>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Ansatt</label>
              <select value={form.employee} onChange={e => setForm(f => ({ ...f, employee: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
                {EMPLOYEES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Dato</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Timer</label>
              <input type="number" step="0.5" min="0" max="24" value={form.hours || ''}
                onChange={e => setForm(f => ({ ...f, hours: parseFloat(e.target.value) || 0 }))}
                placeholder="Eks: 7.5"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Timepris (kr)</label>
              <input type="number" value={form.hourly_rate || ''}
                onChange={e => setForm(f => ({ ...f, hourly_rate: Number(e.target.value) }))}
                placeholder="850"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-slate-600 block mb-1">Beskrivelse / oppdrag</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Eks: Baderomrenovering Hansen - dag 2"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" checked={form.billable}
                onChange={e => setForm(f => ({ ...f, billable: e.target.checked }))}
                className="rounded" />
              Fakturerbar
            </label>
            <div className="flex gap-2">
              <button onClick={() => { setShowAdd(false); setForm(EMPTY); }}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                Avbryt
              </button>
              <button onClick={save} disabled={saving || !form.hours}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Lagrer...' : 'Lagre'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee breakdown */}
      {Object.keys(byEmployee).length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Oversikt per ansatt</h2>
            <button onClick={getAiReport} disabled={aiLoading}
              className="flex items-center gap-1.5 text-xs text-purple-600 font-medium hover:text-purple-800 transition-colors">
              <Sparkles className="h-3.5 w-3.5" />
              {aiLoading ? 'Analyserer...' : 'AI-rapport'}
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {Object.entries(byEmployee).map(([emp, d]) => (
              <div key={emp} className="flex items-center gap-4 px-5 py-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-700">{emp[0]}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{emp}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{d.hours.toFixed(1)}t</p>
                  <p className="text-xs text-slate-400">{d.value.toLocaleString('nb-NO')} kr</p>
                </div>
              </div>
            ))}
          </div>
          {aiReport && (
            <div className="border-t border-slate-100 bg-purple-50 px-5 py-4">
              <p className="text-xs font-semibold text-purple-700 mb-1">AI-analyse</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{aiReport}</p>
            </div>
          )}
        </div>
      )}

      {/* Filter + entries table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-wrap gap-3">
          <h2 className="font-semibold text-slate-800">
            Timer ({weekMode ? 'denne uken' : 'alle'})
          </h2>
          <select value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white">
            <option value="">Alle ansatte</option>
            {employees.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="px-5 py-8 text-center text-slate-400 text-sm">Laster...</div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Clock className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Ingen timer registrert</p>
            <p className="text-slate-400 text-sm mt-1">Klikk "Logg timer" for å komme i gang</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(e => (
              <div key={e.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="w-20 shrink-0">
                  <p className="text-xs text-slate-400">{e.date}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{e.description || '—'}</p>
                  <p className="text-xs text-slate-400">{e.employee}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-slate-900">{e.hours}t</p>
                  {e.billable && <p className="text-xs text-emerald-600">{(e.hours * e.hourly_rate).toLocaleString('nb-NO')} kr</p>}
                  {!e.billable && <p className="text-xs text-slate-400">Ikke fakt.</p>}
                </div>
                <button onClick={() => remove(e.id)} className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
            <span className="text-xs text-slate-500">Total</span>
            <div className="text-right">
              <span className="text-sm font-bold text-slate-900 mr-4">{totalHours.toFixed(1)} timer totalt</span>
              <span className="text-sm font-bold text-emerald-700">{totalValue.toLocaleString('nb-NO')} kr fakturerbart</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
