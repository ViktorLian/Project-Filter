'use client';
import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import type { Niche } from '@/lib/niches';
import { ACC, getKPIs, mkData, StockChart } from './shared';

type TxType = 'Inntekt'|'Utgift';
type Tx = { id:number; desc:string; amount:number; type:TxType; date:string; category:string; };

function makeTx(s:number): Tx[] {
  const items: [string,number,TxType,string,string][] = [
    ['Kundebetaling – Kari Nordmann', 18500,'Inntekt','3.3.2026','Salg'],
    ['Kontorleie mars',              -12000,'Utgift', '1.3.2026','Husleie'],
    ['Kundebetaling – Ole Hansen',    9200,'Inntekt','28.2.2026','Salg'],
    ['Forsikring Q1',                -4800,'Utgift', '1.2.2026','Forsikring'],
    ['Kundebetaling – Ingrid Berg',  22000,'Inntekt','25.2.2026','Salg'],
    ['Stromregning februar',         -2100,'Utgift', '15.2.2026','Strom'],
    ['Kundebetaling – Bjorn Larsen',  7500,'Inntekt','20.2.2026','Salg'],
    ['Losersoftware lisens',          -990,'Utgift', '5.2.2026','SaaS'],
  ];
  return items.map(([desc,amt,type,date,cat],i)=>({
    id:i+1, desc:desc as string, amount:Math.abs(Number(amt)) + ((s*(i+1)*3)%3000),
    type:type as TxType, date:date as string, category:cat as string,
  }));
}

export function ModuleCashflow({ nicheId, niche }: { nicheId:string; niche:Niche }) {
  const s = nicheId.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  const [txs, setTxs] = useState<Tx[]>(makeTx(s));
  const [showForm, setShowForm] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newAmt, setNewAmt]   = useState('');
  const [newType, setNewType] = useState<TxType>('Inntekt');
  const [newCat, setNewCat]   = useState('Salg');
  const [filter, setFilter]   = useState<'Alle'|TxType>('Alle');
  const k = getKPIs(nicheId);
  const incomeData  = mkData(nicheId, 3, k.income,  0.35);
  const expenseData = mkData(nicheId, 7, k.expense, 0.3);

  const filtered = filter==='Alle' ? txs : txs.filter(t=>t.type===filter);
  const totalIn  = txs.filter(t=>t.type==='Inntekt').reduce((a,t)=>a+t.amount,0);
  const totalOut = txs.filter(t=>t.type==='Utgift').reduce((a,t)=>a+t.amount,0);

  function add() {
    if (!newDesc.trim()||!newAmt) return;
    setTxs(prev=>[{id:Date.now(),desc:newDesc,amount:Number(newAmt),type:newType,date:'4.3.2026',category:newCat},...prev]);
    setNewDesc(''); setNewAmt(''); setShowForm(false);
  }

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Totale inntekter', val:`${totalIn.toLocaleString('nb-NO')} kr`,  icon:<TrendingUp className="h-4 w-4 text-emerald-500"/>, color:'text-emerald-700' },
          { label:'Totale utgifter',  val:`${totalOut.toLocaleString('nb-NO')} kr`, icon:<TrendingDown className="h-4 w-4 text-red-500"/>,   color:'text-red-700' },
          { label:'Netto resultat',   val:`${(totalIn-totalOut).toLocaleString('nb-NO')} kr`, icon:<TrendingUp className="h-4 w-4 text-indigo-500"/>, color:'text-indigo-700' },
        ].map(c=>(
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-1">{c.icon}<span className="text-xs text-slate-500">{c.label}</span></div>
            <p className={`text-base font-bold ${c.color}`}>{c.val}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <StockChart title="Inntekter per maned" subtitle="Apr 2025 – mars 2026" data={incomeData} suf=" kr"/>
        <StockChart title="Utgifter per maned"  subtitle="Apr 2025 – mars 2026" data={expenseData} suf=" kr"/>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Transaksjoner</h3>
          <div className="flex items-center gap-2">
            {(['Alle','Inntekt','Utgift'] as const).map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${filter===f?'text-white border-transparent':'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                style={filter===f?{backgroundColor:ACC,borderColor:ACC}:{}}>{f}</button>
            ))}
            <button onClick={()=>setShowForm(v=>!v)} className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg" style={{backgroundColor:ACC}}>
              <Plus className="h-3.5 w-3.5"/> Legg til
            </button>
          </div>
        </div>

        {showForm && (
          <div className="p-4 border-b border-slate-100 bg-slate-50 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <input value={newDesc} onChange={e=>setNewDesc(e.target.value)} placeholder="Beskrivelse *" className="sm:col-span-2 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
            <input value={newAmt} onChange={e=>setNewAmt(e.target.value)} placeholder="Belop (kr) *" type="number" className="text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
            <div className="flex gap-2">
              <select value={newType} onChange={e=>setNewType(e.target.value as TxType)} className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-2 outline-none">
                <option>Inntekt</option><option>Utgift</option>
              </select>
              <button onClick={add} className="text-xs font-semibold text-white px-3 py-2 rounded-lg" style={{backgroundColor:ACC}}>OK</button>
            </div>
          </div>
        )}

        <div className="divide-y divide-slate-50">
          {filtered.map(tx=>(
            <div key={tx.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type==='Inntekt'?'bg-emerald-50':'bg-red-50'}`}>
                {tx.type==='Inntekt' ? <TrendingUp className="h-4 w-4 text-emerald-500"/> : <TrendingDown className="h-4 w-4 text-red-500"/>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{tx.desc}</p>
                <p className="text-xs text-slate-400">{tx.category} — {tx.date}</p>
              </div>
              <p className={`text-sm font-bold ${tx.type==='Inntekt'?'text-emerald-600':'text-red-500'}`}>
                {tx.type==='Inntekt'?'+':'-'}{tx.amount.toLocaleString('nb-NO')} kr
              </p>
              <button onClick={()=>setTxs(prev=>prev.filter(t=>t.id!==tx.id))} className="text-slate-300 hover:text-red-400 ml-2">
                <Trash2 className="h-4 w-4"/>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
