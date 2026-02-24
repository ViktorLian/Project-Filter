'use client';
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Plus, DollarSign, Briefcase, Target, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface Job {
  id: string;
  job_title: string;
  job_date: string;
  revenue: number;
  totalExpenses: number;
  profit: number;
  marginPct: number;
  status: string;
  customer?: { name: string };
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newJob, setNewJob] = useState({ jobTitle: '', revenue: '', jobDate: '', notes: '' });

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/jobs');
      const json = await res.json();
      setJobs(json.jobs || []);
    } catch (e) {
      console.error('fetchJobs error', e);
    } finally {
      setLoading(false);
    }
  };

  const createJob = async () => {
    if (!newJob.jobTitle.trim()) return;
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: newJob.jobTitle,
          revenue: parseFloat(newJob.revenue) || 0,
          jobDate: newJob.jobDate || new Date().toISOString().split('T')[0],
          notes: newJob.notes,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setSaveError(json.error || `Feil (${res.status}) – prøv igjen`);
        setSaving(false);
        return;
      }
      // Success – add returned job to top of list immediately, then also refetch
      if (json.job) {
        const saved = json.job;
        setJobs(prev => [{
          ...saved,
          totalExpenses: 0,
          profit: saved.revenue || 0,
          marginPct: 100,
        }, ...prev]);
      }
      setNewJob({ jobTitle: '', revenue: '', jobDate: '', notes: '' });
      setShowNew(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      fetchJobs(); // background refresh for fresh server data
    } catch (e: any) {
      setSaveError('Nettverksfeil – sjekk tilkobling');
    } finally {
      setSaving(false);
    }
  };

  const totalRevenue = jobs.reduce((s, j) => s + (j.revenue || 0), 0);
  const totalProfit = jobs.reduce((s, j) => s + (j.profit || 0), 0);
  const avgMargin = jobs.length > 0
    ? (jobs.reduce((s, j) => s + (j.marginPct || 0), 0) / jobs.length).toFixed(1)
    : '0';

  const marginColor = (pct: number) =>
    pct > 50 ? 'bg-green-100 text-green-700' : pct > 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jobbfortjeneste</h1>
          <p className="text-slate-500 text-sm mt-1">Se inntekt, kostnader og margin per jobb</p>
        </div>
        <button onClick={() => { setShowNew(true); setSaveError(''); }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition">
          <Plus className="h-4 w-4" /> Ny jobb
        </button>
      </div>

      {/* Success toast */}
      {saveSuccess && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          Jobb lagret!
        </div>
      )}

      {/* Statistikk */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        {[
          { label: 'Totale jobber', value: jobs.length, icon: Briefcase, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total inntekt', value: `${totalRevenue.toLocaleString('nb-NO')} kr`, icon: DollarSign, color: 'text-green-600 bg-green-50' },
          { label: 'Total fortjeneste', value: `${totalProfit.toLocaleString('nb-NO')} kr`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Gjennomsnittlig margin', value: `${avgMargin} %`, icon: Target, color: 'text-purple-600 bg-purple-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${color} mb-3`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Ny jobb-skjema */}
      {showNew && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 mb-4">
          <h3 className="font-semibold text-slate-900 mb-3">Legg til ny jobb</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={newJob.jobTitle} onChange={e => setNewJob({ ...newJob, jobTitle: e.target.value })}
              placeholder="Jobbtittel *" className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" />
            <input value={newJob.revenue} onChange={e => setNewJob({ ...newJob, revenue: e.target.value })}
              placeholder="Inntekt (kr)" type="number" min="0" className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" />
            <input value={newJob.jobDate} onChange={e => setNewJob({ ...newJob, jobDate: e.target.value })}
              type="date" className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" />
            <input value={newJob.notes} onChange={e => setNewJob({ ...newJob, notes: e.target.value })}
              placeholder="Notater" className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" />
          </div>
          {saveError && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span><strong>Lagring feilet:</strong> {saveError}</span>
            </div>
          )}
          <div className="flex gap-2 mt-3">
            <button onClick={createJob} disabled={saving || !newJob.jobTitle.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-1">
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              {saving ? 'Lagrer...' : 'Lagre jobb'}
            </button>
            <button onClick={() => { setShowNew(false); setSaveError(''); }}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
              Avbryt
            </button>
          </div>
        </div>
      )}

      {/* Tabell */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Laster jobber...</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Ingen jobber registrert ennå</p>
            <button onClick={() => setShowNew(true)} className="mt-3 text-blue-600 text-sm font-semibold hover:underline">Legg til første jobb</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Jobb</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 hidden sm:table-cell">Dato</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">Inntekt</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600 hidden md:table-cell">Kostnader</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">Fortjeneste</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-600">Margin</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{job.job_title}</p>
                    {job.customer && <p className="text-xs text-slate-400">{job.customer.name}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                    {job.job_date ? new Date(job.job_date).toLocaleDateString('nb-NO') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    {(job.revenue || 0).toLocaleString('nb-NO')} kr
                  </td>
                  <td className="px-4 py-3 text-right text-red-500 hidden md:table-cell">
                    {(job.totalExpenses || 0).toLocaleString('nb-NO')} kr
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">
                    {(job.profit || 0).toLocaleString('nb-NO')} kr
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${marginColor(job.marginPct)}`}>
                      {job.marginPct > 30 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {job.marginPct} %
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
