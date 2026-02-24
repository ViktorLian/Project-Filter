'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search, Filter, UserCheck, UserX, Clock, TrendingUp, Star,
  ChevronRight, Mail, Phone, Calendar, ArrowUpRight, Plus, RefreshCw, Download
} from 'lucide-react';

type Lead = {
  id: string;
  created_at: string;
  status?: string;
  name?: string;
  email?: string;
  phone?: string;
  score?: number;
  risk_level?: string;
  answers?: Record<string, any>;
  form?: { name: string };
};

const STATUS_CFG = {
  NEW:       { label: 'Ny',        color: 'bg-blue-100 text-blue-700 border-blue-200' },
  ACCEPTED:  { label: 'Akseptert', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  REJECTED:  { label: 'Avvist',    color: 'bg-red-100 text-red-700 border-red-200' },
  PENDING:   { label: 'Venter',    color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  CONTACTED: { label: 'Kontaktet', color: 'bg-purple-100 text-purple-700 border-purple-200' },
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'score' | 'name'>('newest');

  function exportCSV() {
    const rows = [
      ['Navn', 'E-post', 'Telefon', 'Status', 'Score', 'Risiko', 'Skjema', 'Dato'],
      ...leads.map(l => [
        l.name || '',
        l.email || '',
        l.phone || '',
        l.status || '',
        l.score ?? '',
        l.risk_level || '',
        l.form?.name || '',
        l.created_at ? new Date(l.created_at).toLocaleDateString('nb-NO') : '',
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `leads_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  }

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/leads').catch(() => null);
    const json = res ? await res.json() : {};
    setLeads(json.leads || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const filtered = leads
    .filter((l) => {
      const matchSearch =
        (l.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.phone || '').includes(search);
      const matchStatus = filterStatus === 'ALL' || (l.status || 'NEW') === filterStatus;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return (b.score || 0) - (a.score || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const stats = {
    total: leads.length,
    new: leads.filter(l => !l.status || l.status === 'NEW').length,
    accepted: leads.filter(l => l.status === 'ACCEPTED').length,
    avgScore: leads.length > 0 ? Math.round(leads.reduce((s, l) => s + (l.score || 0), 0) / leads.length) : 0,
  };

  const scoreColor = (score?: number) => {
    if (!score) return 'text-slate-400';
    if (score >= 80) return 'text-emerald-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const scoreBg = (score?: number) => {
    if (!score) return 'bg-slate-100';
    if (score >= 80) return 'bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-slate-500 text-sm mt-0.5">Administrer og kvalifiser innkommende leads</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="h-4 w-4" /> Eksporter CSV
          </button>
          <button onClick={load} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm">
            <RefreshCw className="h-4 w-4" /> Oppdater
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Totalt', value: stats.total, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Nye leads', value: stats.new, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Aksepterte', value: stats.accepted, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Gj.snitt score', value: `${stats.avgScore}%`, icon: Star, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-8 w-8 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <span className="text-xs text-slate-500 font-medium">{label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Søk etter navn, e-post eller telefon..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'NEW', 'ACCEPTED', 'PENDING', 'CONTACTED', 'REJECTED'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                filterStatus === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}>
              {s === 'ALL' ? 'Alle' : STATUS_CFG[s as keyof typeof STATUS_CFG]?.label ?? s}
            </button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
          className="py-2 px-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="newest">Nyeste forst</option>
          <option value="score">Høyeste score</option>
          <option value="name">Alfabetisk</option>
        </select>
      </div>

      {/* Leads grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
              <div className="h-3 w-48 bg-slate-50 rounded animate-pulse" />
              <div className="h-8 w-24 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <UserX className="h-12 w-12 text-slate-200 mx-auto mb-3" />
          <p className="font-semibold text-slate-600">Ingen leads funnet</p>
          <p className="text-slate-400 text-sm mt-1">Opprett et skjema for å begynne å fange opp leads</p>
          <Link href="/dashboard/forms" className="mt-4 inline-flex items-center gap-1.5 text-blue-600 text-sm font-medium hover:underline">
            <Plus className="h-4 w-4" /> Opprett skjema
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((lead) => {
            const sc = STATUS_CFG[(lead.status || 'NEW') as keyof typeof STATUS_CFG] || STATUS_CFG.NEW;
            return (
              <div key={lead.id}
                className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md hover:border-slate-300 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {(lead.name || 'L').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{lead.name || `Lead ${lead.id.slice(0, 6)}`}</p>
                      <p className="text-xs text-slate-400">{new Date(lead.created_at).toLocaleDateString('nb-NO')}</p>
                    </div>
                  </div>
                  {lead.score !== undefined && (
                    <div className={`text-xs font-bold px-2 py-1 rounded-lg border ${scoreBg(lead.score)} ${scoreColor(lead.score)}`}>
                      {lead.score}%
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 mb-3">
                  {lead.email && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      <span>{lead.phone}</span>
                    </div>
                  )}
                  {lead.form?.name && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">Via: {lead.form.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <select
                    value={lead.status || 'NEW'}
                    onChange={e => updateStatus(lead.id, e.target.value)}
                    onClick={e => e.stopPropagation()}
                    className={`text-xs px-2 py-1 rounded-lg border font-medium cursor-pointer ${sc.color}`}
                  >
                    {Object.entries(STATUS_CFG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                  <Link href={`/dashboard/leads/${lead.id}`}
                    className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:text-blue-800 transition-colors"
                  >
                    Detaljer <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
