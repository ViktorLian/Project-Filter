'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface JobProfit {
  jobName: string;
  revenue: number;
  materialsCost: number;
  laborHours: number;
  laborRate: number;
  overhead: number;
  grossProfit: number;
  margin: number;
}

const mockJobs: JobProfit[] = [
  { jobName: 'Baderomsrenovering — Frogner', revenue: 85000, materialsCost: 28000, laborHours: 48, laborRate: 650, overhead: 3200, grossProfit: 85000 - 28000 - 48 * 650 - 3200, margin: 0 },
  { jobName: 'Rørskifte — Majorstua', revenue: 32000, materialsCost: 8500, laborHours: 18, laborRate: 650, overhead: 1200, grossProfit: 32000 - 8500 - 18 * 650 - 1200, margin: 0 },
  { jobName: 'Varmeanlegg — Bærum', revenue: 145000, materialsCost: 62000, laborHours: 72, laborRate: 650, overhead: 5800, grossProfit: 145000 - 62000 - 72 * 650 - 5800, margin: 0 },
  { jobName: 'Avløpsrens — Grunerløkka', revenue: 12000, materialsCost: 1800, laborHours: 6, laborRate: 650, overhead: 600, grossProfit: 12000 - 1800 - 6 * 650 - 600, margin: 0 },
  { jobName: 'Kjellerinstallasjon — Asker', revenue: 68000, materialsCost: 24500, laborHours: 36, laborRate: 650, overhead: 2800, grossProfit: 68000 - 24500 - 36 * 650 - 2800, margin: 0 },
].map(j => ({ ...j, margin: Math.round((j.grossProfit / j.revenue) * 100) }));

const totalRevenue = mockJobs.reduce((s, j) => s + j.revenue, 0);
const totalProfit = mockJobs.reduce((s, j) => s + j.grossProfit, 0);
const avgMargin = Math.round((totalProfit / totalRevenue) * 100);

export default function ProfitTrackerPage() {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [insight, setInsight] = useState('');

  async function getAIInsight() {
    setLoadingInsight(true);
    setInsight('');
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analyser disse lønnsomhetstallene for en norsk håndverksbedrift:
Totalt omsetning: ${totalRevenue.toLocaleString('nb-NO')} kr
Total fortjeneste: ${totalProfit.toLocaleString('nb-NO')} kr
Gjennomsnittsmargin: ${avgMargin}%
Prosjekter med lavest margin: ${mockJobs.sort((a,b) => a.margin - b.margin).slice(0,2).map(j => `${j.jobName} (${j.margin}%)`).join(', ')}
Prosjekter med høyest margin: ${mockJobs.sort((a,b) => b.margin - a.margin).slice(0,2).map(j => `${j.jobName} (${j.margin}%)`).join(', ')}

Gi 3 konkrete tiltak for å øke marginene. Vær spesifikk og praktisk. Max 200 ord.`,
        }),
      });
      const data = await res.json();
      setInsight(data.message || data.response || 'Ingen respons fra AI.');
    } catch {
      setInsight('Klarte ikke hente AI-analyse. Sjekk tilkobling.');
    }
    setLoadingInsight(false);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fortjenestesporing</h1>
          <p className="text-slate-500 mt-1">Reell lønnsomhet per jobb — ikke bare omsetning</p>
        </div>
        <div className="flex gap-2">
          {(['month', 'quarter', 'year'] as const).map(p => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p === 'month' ? 'Denne måneden' : p === 'quarter' ? 'Kvartal' : 'År'}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">Total omsetning</p>
            <p className="text-2xl font-bold text-slate-900">{totalRevenue.toLocaleString('nb-NO')} kr</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">Reell fortjeneste</p>
            <p className="text-2xl font-bold text-green-600">{totalProfit.toLocaleString('nb-NO')} kr</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">Gj.snitt margin</p>
            <p className={`text-2xl font-bold ${avgMargin >= 30 ? 'text-green-600' : avgMargin >= 20 ? 'text-amber-600' : 'text-red-600'}`}>
              {avgMargin}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">Jobber analysert</p>
            <p className="text-2xl font-bold text-slate-900">{mockJobs.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Job breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lønnsomhet per jobb</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...mockJobs].sort((a, b) => b.margin - a.margin).map((job, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-900 truncate">{job.jobName}</span>
                    <div className="flex gap-4 text-sm shrink-0 ml-2">
                      <span className="text-slate-500">{job.revenue.toLocaleString('nb-NO')} kr</span>
                      <span className={job.grossProfit > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {job.grossProfit > 0 ? '+' : ''}{job.grossProfit.toLocaleString('nb-NO')} kr
                      </span>
                      <span className={`font-semibold w-12 text-right ${job.margin >= 30 ? 'text-green-600' : job.margin >= 20 ? 'text-amber-600' : 'text-red-600'}`}>
                        {job.margin}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${job.margin >= 30 ? 'bg-green-500' : job.margin >= 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(job.margin, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500 inline-block" /> Over 30% — utmerket</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500 inline-block" /> 20–30% — ok</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500 inline-block" /> Under 20% — vurder prisøkning</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost breakdown */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kostnadsfordeling</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Materialkostnader', value: mockJobs.reduce((s, j) => s + j.materialsCost, 0), color: 'bg-blue-500' },
              { label: 'Arbeidstid (lønn)', value: mockJobs.reduce((s, j) => s + j.laborHours * j.laborRate, 0), color: 'bg-purple-500' },
              { label: 'Overhead', value: mockJobs.reduce((s, j) => s + j.overhead, 0), color: 'bg-orange-500' },
              { label: 'Fortjeneste', value: totalProfit, color: 'bg-green-500' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-medium">{item.value.toLocaleString('nb-NO')} kr ({Math.round(item.value / totalRevenue * 100)}%)</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${Math.round(item.value / totalRevenue * 100)}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-base text-blue-900">AI-lønnsomhetsanalyse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insight ? (
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{insight}</p>
            ) : (
              <p className="text-sm text-blue-700">
                La AI analysere dine marginer og gi konkrete tips for å øke lønnsomheten per jobb.
              </p>
            )}
            <Button
              onClick={getAIInsight}
              disabled={loadingInsight}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loadingInsight ? 'Analyserer...' : insight ? 'Oppdater analyse' : 'Analyser lønnsomhet'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Benchmark */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-4">
          <p className="text-sm font-medium text-amber-900 mb-1">Bransjestandard for Norge (haandverk)</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><span className="text-amber-700">Lavt: </span><span className="font-semibold">10–18%</span></div>
            <div><span className="text-amber-700">Normalt: </span><span className="font-semibold">22–28%</span></div>
            <div><span className="text-amber-700">Utmerket: </span><span className="font-semibold">30–40%+</span></div>
          </div>
          <p className="text-xs text-amber-700 mt-2">Din gjennomsnittsmargin: <strong>{avgMargin}%</strong> — {avgMargin >= 30 ? 'Fantastisk! Du er over snittet.' : avgMargin >= 22 ? 'Bra — innenfor normalen.' : 'Under norsk snitt — se AI-analysen for tiltak.'}</p>
        </CardContent>
      </Card>
    </div>
  );
}
