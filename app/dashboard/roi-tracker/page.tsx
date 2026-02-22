'use client';

import { useState } from 'react';
import { TrendingUp, DollarSign, BarChart2, ArrowUpRight, ArrowDownRight, Calculator } from 'lucide-react';

type Campaign = { id: string; name: string; cost: number; leads: number; sales: number; revenue: number };

const DEMO: Campaign[] = [
  { id: '1', name: 'Google Ads Jan', cost: 3500, leads: 28, sales: 8, revenue: 64000 },
  { id: '2', name: 'Facebook kampanje', cost: 1800, leads: 14, sales: 3, revenue: 22500 },
  { id: '3', name: 'Flyers lokalomrade', cost: 600, leads: 6, sales: 2, revenue: 14000 },
];

export default function RoiTrackerPage() {
  const [items, setItems] = useState<Campaign[]>(DEMO);
  const [newRow, setNewRow] = useState({ name: '', cost: '', leads: '', sales: '', revenue: '' });
  const [showAdd, setShowAdd] = useState(false);

  function addRow() {
    if (!newRow.name) return;
    setItems(prev => [...prev, { id: Date.now().toString(), name: newRow.name, cost: +newRow.cost || 0, leads: +newRow.leads || 0, sales: +newRow.sales || 0, revenue: +newRow.revenue || 0 }]);
    setNewRow({ name: '', cost: '', leads: '', sales: '', revenue: '' });
    setShowAdd(false);
  }

  const totalCost = items.reduce((s, i) => s + i.cost, 0);
  const totalRevenue = items.reduce((s, i) => s + i.revenue, 0);
  const totalLeads = items.reduce((s, i) => s + i.leads, 0);
  const totalSales = items.reduce((s, i) => s + i.sales, 0);
  const overallRoi = totalCost > 0 ? Math.round(((totalRevenue - totalCost) / totalCost) * 100) : 0;

  function roi(c: Campaign) {
    return c.cost > 0 ? Math.round(((c.revenue - c.cost) / c.cost) * 100) : 0;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ROI Tracker</h1>
          <p className="text-slate-500 text-sm mt-0.5">Mål avkastning på markedsføring og salgsinnsats</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
          <Calculator className="h-4 w-4" />Legg til kanal
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total investering', val: `${(totalCost / 1000).toFixed(1)}K kr`, icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Total inntekt', val: `${(totalRevenue / 1000).toFixed(0)}K kr`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Samlet ROI', val: `${overallRoi}%`, icon: BarChart2, color: overallRoi >= 0 ? 'text-blue-600' : 'text-red-600', bg: 'bg-blue-50' },
          { label: 'Kjøpsrate', val: `${totalLeads ? Math.round((totalSales / totalLeads) * 100) : 0}%`, icon: ArrowUpRight, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-xl font-bold text-slate-900">{s.val}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Add row */}
      {showAdd && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
          <h3 className="font-semibold text-blue-900 text-sm">Ny markedsføringkanal</h3>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { key: 'name', label: 'Kanalnavn', placeholder: 'Google Ads' },
              { key: 'cost', label: 'Kostnad (kr)', placeholder: '5000' },
              { key: 'leads', label: 'Leads', placeholder: '30' },
              { key: 'sales', label: 'Salg', placeholder: '8' },
              { key: 'revenue', label: 'Inntekt (kr)', placeholder: '80000' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-blue-700 mb-1">{f.label}</label>
                <input value={(newRow as any)[f.key]} onChange={e => setNewRow(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Avbryt</button>
            <button onClick={addRow} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">Legg til</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <tr>
              {['Kanal', 'Kostnad', 'Leads', 'Salg', 'Inntekt', 'ROI', 'Kostnad/lead', 'Kostnad/salg'].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map(item => {
              const r = roi(item);
              const cpl = item.leads > 0 ? Math.round(item.cost / item.leads) : 0;
              const cps = item.sales > 0 ? Math.round(item.cost / item.sales) : 0;
              return (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800">{item.name}</td>
                  <td className="px-4 py-3 text-slate-600">{item.cost.toLocaleString()} kr</td>
                  <td className="px-4 py-3 text-slate-600">{item.leads}</td>
                  <td className="px-4 py-3 text-slate-600">{item.sales}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">{item.revenue.toLocaleString()} kr</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 font-bold ${r >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {r >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                      {r}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{cpl} kr</td>
                  <td className="px-4 py-3 text-slate-600">{cps} kr</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
