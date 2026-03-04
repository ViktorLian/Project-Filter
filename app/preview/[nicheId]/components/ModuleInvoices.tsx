'use client';
import { useState } from 'react';
import { Plus, Send, Check, Clock, AlertCircle, Download } from 'lucide-react';
import type { Niche } from '@/lib/niches';
import { ACC, getKPIs, mkData, KPIRow, StockChart } from './shared';

type InvStatus = 'Ubetalt'|'Betalt'|'Forfalt'|'Utkast';
const STATUS_COLORS: Record<InvStatus,string> = {
  Ubetalt:'bg-yellow-100 text-yellow-700',
  Betalt:'bg-emerald-100 text-emerald-700',
  Forfalt:'bg-red-100 text-red-700',
  Utkast:'bg-slate-100 text-slate-600',
};

type Invoice = { id:number; nr:string; customer:string; amount:number; due:string; issued:string; status:InvStatus; };

function makeInvoices(s:number): Invoice[] {
  const names=['Kari Nordmann','Ole Hansen','Ingrid Berg','Bjorn Larsen','Tone Johansen','Erik Dahl','Mari Olsen'];
  const statuses:InvStatus[]=['Ubetalt','Betalt','Forfalt','Betalt','Ubetalt','Betalt','Utkast'];
  return names.map((n,i)=>({
    id:i+1, nr:`FP-${1000+i}`, customer:n,
    amount: 4500 + ((s*(i+3)*11)%28000),
    due:`${14+i}.${3+(i%3)}.2026`,
    issued:`${1+i}.3.2026`,
    status: statuses[i],
  }));
}

export function ModuleInvoices({ nicheId, niche }: { nicheId:string; niche:Niche }) {
  const s = nicheId.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  const [invoices, setInvoices] = useState<Invoice[]>(makeInvoices(s));
  const [showForm, setShowForm] = useState(false);
  const [newCust, setNewCust] = useState('');
  const [newAmt, setNewAmt] = useState('');
  const [newDue, setNewDue] = useState('');
  const [filterStatus, setFilterStatus] = useState<InvStatus|'Alle'>('Alle');
  const k = getKPIs(nicheId);
  const chartData = mkData(nicheId, 2, k.income, 0.42);

  const filtered = filterStatus==='Alle' ? invoices : invoices.filter(i=>i.status===filterStatus);
  const totalUnpaid = invoices.filter(i=>i.status==='Ubetalt'||i.status==='Forfalt').reduce((a,i)=>a+i.amount,0);

  function addInvoice() {
    if (!newCust.trim() || !newAmt) return;
    const nr = `FP-${1100 + invoices.length}`;
    setInvoices(prev=>[{id:Date.now(),nr,customer:newCust,amount:Number(newAmt),due:newDue||'28.3.2026',issued:'4.3.2026',status:'Utkast'},...prev]);
    setNewCust(''); setNewAmt(''); setNewDue(''); setShowForm(false);
  }
  function markPaid(id:number) {
    setInvoices(prev=>prev.map(i=>i.id===id?{...i,status:'Betalt' as InvStatus}:i));
  }
  function sendInvoice(id:number) {
    setInvoices(prev=>prev.map(i=>i.id===id?{...i,status:'Ubetalt' as InvStatus}:i));
  }

  return (
    <div className="space-y-4">
      <KPIRow nicheId={nicheId}/>
      <StockChart title="Fakturert belop per maned" subtitle="April 2025 – mars 2026" data={chartData} suf=" kr"/>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Ubetalt totalt',   val:`${totalUnpaid.toLocaleString('nb-NO')} kr`, color:'text-red-600'    },
          { label:'Fakturaer i dag',  val:String(invoices.length),                     color:'text-slate-800'  },
          { label:'Betalt denne mnd', val:`${invoices.filter(i=>i.status==='Betalt').length} stk`, color:'text-emerald-600'},
        ].map(c=>(
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className={`text-lg font-bold ${c.color}`}>{c.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Fakturaer ({filtered.length})</h3>
          <div className="flex items-center gap-2">
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value as any)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none">
              {(['Alle','Ubetalt','Betalt','Forfalt','Utkast'] as const).map(s=><option key={s}>{s}</option>)}
            </select>
            <button onClick={()=>setShowForm(v=>!v)} className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg" style={{backgroundColor:ACC}}>
              <Plus className="h-3.5 w-3.5"/> Ny faktura
            </button>
          </div>
        </div>

        {showForm && (
          <div className="p-4 border-b border-slate-100 bg-slate-50 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <input value={newCust} onChange={e=>setNewCust(e.target.value)} placeholder="Kunde *" className="text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
            <input value={newAmt} onChange={e=>setNewAmt(e.target.value)} placeholder="Belop (kr) *" type="number" className="text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
            <input value={newDue} onChange={e=>setNewDue(e.target.value)} placeholder="Forfall (dd.mm.åå)" className="text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
            <div className="flex gap-2">
              <button onClick={addInvoice} className="flex-1 text-xs font-semibold text-white py-2 rounded-lg" style={{backgroundColor:ACC}}>Opprett</button>
              <button onClick={()=>setShowForm(false)} className="text-xs text-slate-500 px-3 py-2 rounded-lg border border-slate-200 bg-white">Avbryt</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100">
              {['Nr','Kunde','Belop','Utstedt','Forfall','Status',''].map(h=>(
                <th key={h} className="px-4 py-2.5 text-xs font-semibold text-slate-500 text-left">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(inv=>(
                <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 text-xs font-mono text-slate-500">{inv.nr}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{inv.customer}</td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-800">{inv.amount.toLocaleString('nb-NO')} kr</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{inv.issued}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{inv.due}</td>
                  <td className="px-4 py-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[inv.status]}`}>{inv.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {inv.status==='Utkast' && <button onClick={()=>sendInvoice(inv.id)} className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1"><Send className="h-3 w-3"/>Send</button>}
                      {(inv.status==='Ubetalt'||inv.status==='Forfalt') && <button onClick={()=>markPaid(inv.id)} className="text-xs text-emerald-600 font-medium hover:underline flex items-center gap-1"><Check className="h-3 w-3"/>Marker betalt</button>}
                      <button className="text-xs text-slate-400 hover:underline flex items-center gap-1"><Download className="h-3 w-3"/>PDF</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
