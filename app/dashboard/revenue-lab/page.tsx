'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp, Users, DollarSign, ArrowUpRight, Mail,
  Phone, RefreshCw, Loader2, BarChart3, Target, Sparkles
} from 'lucide-react';

interface Metrics {
  totalRevenue90d: number;
  avgDeal: number;
  uniqueCustomerCount: number;
  newLeads30d: number;
  highQualityLeads: number;
  monthlyRevenue: Record<string, number>;
  reactivationList: Array<{
    id: string;
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    score?: number;
    created_at: string;
  }>;
}

function fmt(n: number) {
  return n.toLocaleString('nb-NO') + ' kr';
}

function monthName(ym: string) {
  const [y, m] = ym.split('-');
  return new Date(Number(y), Number(m) - 1).toLocaleString('nb-NO', { month: 'short', year: 'numeric' });
}

export default function RevenueLab() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiTip, setAiTip] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetch('/api/revenue-metrics')
      .then((r) => r.json())
      .then((d) => setMetrics(d))
      .finally(() => setLoading(false));
  }, []);

  async function getAiTip() {
    if (!metrics) return;
    setAiLoading(true);
    setAiTip('');
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Jeg driver en norsk SMB. Her er salgstall:
- Inntekt siste 90 dager: ${fmt(metrics.totalRevenue90d)}
- Snittavtale: ${fmt(metrics.avgDeal)}
- Betalende kunder: ${metrics.uniqueCustomerCount}
- Nye leads siste 30 dager: ${metrics.newLeads30d} (${metrics.highQualityLeads} høy-kvalitet)
- Inaktive leads som kan reaktiveres: ${metrics.reactivationList.length}

Gi meg 3 konkrete tiltak for å øke inntektene denne måneden. Maks 150 ord. Norsk bokmål.`,
          history: [],
        }),
      });
      const d = await res.json();
      setAiTip(d.reply || '');
    } finally {
      setAiLoading(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>;
  if (!metrics) return <div className="py-10 text-center text-slate-400">Kunne ikke laste data</div>;

  const months = Object.keys(metrics.monthlyRevenue).sort();
  const maxRev = Math.max(...Object.values(metrics.monthlyRevenue), 1);

  return (
    <div className="pb-10 pt-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inntekt & Vekst</h1>
          <p className="text-slate-500 text-sm mt-0.5">Oversikt over inntekter, kunder og vekstmuligheter</p>
        </div>
        <button
          onClick={getAiTip}
          disabled={aiLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white transition shadow disabled:opacity-50"
        >
          {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          AI-veksttips
        </button>
      </div>

      {/* AI Tip */}
      {aiTip && (
        <div className="mb-6 rounded-xl bg-purple-50 border border-purple-200 p-4">
          <p className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> AI-veksttips</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{aiTip}</p>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: DollarSign, label: 'Inntekt (90 dager)', value: fmt(metrics.totalRevenue90d), color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { icon: BarChart3, label: 'Snitt per avtale', value: metrics.avgDeal > 0 ? fmt(Math.round(metrics.avgDeal)) : '—', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
          { icon: Users, label: 'Betalende kunder', value: metrics.uniqueCustomerCount.toString(), color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
          { icon: Target, label: 'Nye leads (30 dager)', value: metrics.newLeads30d.toString(), color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
        ].map((kpi) => (
          <div key={kpi.label} className={`rounded-xl border ${kpi.border} ${kpi.bg} p-4`}>
            <div className="flex items-center gap-2 mb-1">
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide truncate">{kpi.label}</span>
            </div>
            <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly revenue chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" /> Månedlig inntekt
          </h2>
          {months.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Ingen fakturadata ennå</p>
          ) : (
            <div className="space-y-2">
              {months.map((m) => {
                const v = metrics.monthlyRevenue[m];
                const pct = (v / maxRev) * 100;
                return (
                  <div key={m} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-20 shrink-0">{monthName(m)}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-24 text-right">{fmt(v)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* High quality leads today */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4 text-blue-500" /> Høy-kvalitet leads (30 dager)
          </h2>
          <p className="text-xs text-slate-400 mb-4">Leads med score ≥ 70 — de med høyest kjøpssannsynlighet</p>
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-blue-600">{metrics.highQualityLeads}</p>
              <p className="text-sm text-slate-500 mt-1">av {metrics.newLeads30d} totale leads</p>
              {metrics.newLeads30d > 0 && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {Math.round((metrics.highQualityLeads / metrics.newLeads30d) * 100)}% konverteringsrate
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reactivation list */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-orange-500" /> Reaktiveringslist
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Leads uten kontakt på 60+ dager — kontakt dem igjen</p>
          </div>
          <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-2.5 py-1">
            {metrics.reactivationList.length} stk
          </span>
        </div>

        {metrics.reactivationList.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Alle leads er fulgt opp nylig 🎉</p>
        ) : (
          <div className="space-y-2">
            {metrics.reactivationList.map((lead) => (
              <div key={lead.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600 shrink-0 uppercase">
                  {(lead.customer_name ?? '?').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-800 truncate">{lead.customer_name}</p>
                  <p className="text-xs text-slate-400">
                    Sist kontakt: {new Date(lead.created_at).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {lead.score !== undefined && ` · Score ${lead.score}`}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {lead.customer_email && (
                    <a href={`mailto:${lead.customer_email}`} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition" title="Send e-post">
                      <Mail className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {lead.customer_phone && (
                    <a href={`tel:${lead.customer_phone}`} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition" title="Ring">
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
