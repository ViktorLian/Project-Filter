'use client';
import { useState } from 'react';
import { Plus, AlertTriangle, Package, Minus } from 'lucide-react';
import type { Niche } from '@/lib/niches';
import { ACC } from './shared';

type Item = { id:number; name:string; sku:string; qty:number; low:number; price:number; unit:string; };

function makeItems(s:number): Item[] {
  const base:[string,string,number,number,number,string][] = [
    ['Kontorpapir A4','KP-001',42,10,89,'pk'],
    ['Printerpapir','PP-002',7,15,149,'pk'],
    ['Kulepenn blå','KB-003',63,20,12,'stk'],
    ['Mappe A4','MA-004',18,10,25,'stk'],
    ['Skrivebordsstol','SS-005',3,2,2490,'stk'],
    ['Notisblokk','NB-006',31,15,39,'stk'],
    ['Whiteboard marker','WM-007',4,8,29,'pk'],
    ['HDMI-kabel 2m','HD-008',9,5,149,'stk'],
  ];
  return base.map(([n,sk,q,l,p,u],i)=>({
    id:i+1,name:n as string,sku:sk as string,
    qty:Number(q)+((s*(i+1)*2)%20),
    low:Number(l),price:Number(p)+((s*(i+1))%100),
    unit:u as string,
  }));
}

export function ModuleInventory({ nicheId, niche }: { nicheId:string; niche:Niche }) {
  const s = nicheId.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  const [items, setItems] = useState<Item[]>(makeItems(s));
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]     = useState('');
  const [newName, setNewName]   = useState('');
  const [newSku, setNewSku]     = useState('');
  const [newQty, setNewQty]     = useState('');
  const [newLow, setNewLow]     = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newUnit, setNewUnit]   = useState('stk');

  const filtered = items.filter(i=>i.name.toLowerCase().includes(search.toLowerCase())||i.sku.toLowerCase().includes(search.toLowerCase()));
  const lowStock = items.filter(i=>i.qty<=i.low);
  const totalVal = items.reduce((a,i)=>a+i.qty*i.price,0);

  function adj(id:number, delta:number) {
    setItems(prev=>prev.map(i=>i.id===id?{...i,qty:Math.max(0,i.qty+delta)}:i));
  }
  function add() {
    if (!newName.trim()) return;
    setItems(prev=>[{id:Date.now(),name:newName,sku:newSku||`SKU-${prev.length+1}`,qty:Number(newQty)||0,low:Number(newLow)||5,price:Number(newPrice)||0,unit:newUnit},...prev]);
    setNewName(''); setNewSku(''); setNewQty(''); setNewLow(''); setNewPrice(''); setShowForm(false);
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Totalt lagret',  val:String(items.length)+' varer',                   color:'text-slate-800' },
          { label:'Lav beholdning', val:String(lowStock.length)+' varsler',              color:lowStock.length>0?'text-red-600':'text-emerald-600' },
          { label:'Lagerverdi',     val:`${totalVal.toLocaleString('nb-NO')} kr`,        color:'text-indigo-700' },
        ].map(c=>(
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className={`text-base font-bold ${c.color}`}>{c.val}</p>
          </div>
        ))}
      </div>

      {lowStock.length>0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-xs font-medium">
          <AlertTriangle className="h-4 w-4 flex-shrink-0"/>
          Lav beholdning: {lowStock.map(i=>i.name).join(', ')}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-xs">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Sok i lageret..." className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400"/>
          </div>
          <button onClick={()=>setShowForm(v=>!v)} className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg" style={{backgroundColor:ACC}}>
            <Plus className="h-3.5 w-3.5"/> Ny vare
          </button>
        </div>

        {showForm && (
          <div className="p-4 border-b border-slate-100 bg-slate-50 grid grid-cols-2 sm:grid-cols-3 gap-2">
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Varenavn *" className="text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
            <input value={newSku} onChange={e=>setNewSku(e.target.value)} placeholder="SKU" className="text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
            <input value={newQty} onChange={e=>setNewQty(e.target.value)} placeholder="Antall" type="number" className="text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
            <input value={newLow} onChange={e=>setNewLow(e.target.value)} placeholder="Lavt lager ved" type="number" className="text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
            <input value={newPrice} onChange={e=>setNewPrice(e.target.value)} placeholder="Pris (kr)" type="number" className="text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
            <div className="flex gap-2">
              <input value={newUnit} onChange={e=>setNewUnit(e.target.value)} placeholder="Enhet" className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
              <button onClick={add} className="text-xs font-semibold text-white px-3 py-2 rounded-lg" style={{backgroundColor:ACC}}>Legg til</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100">
              {['Vare','SKU','Pris','Antall','',''].map(h=>(
                <th key={h} className="px-4 py-2.5 text-xs font-semibold text-slate-500 text-left">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(item=>{
                const isLow = item.qty <= item.low;
                return (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-800">{item.name}</p>
                      {isLow && <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5"><AlertTriangle className="h-2.5 w-2.5"/>Lav beholdning</span>}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">{item.sku}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{item.price.toLocaleString('nb-NO')} kr/{item.unit}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${isLow?'text-red-600':'text-slate-800'}`}>{item.qty}</span>
                      <span className="text-xs text-slate-400 ml-1">{item.unit}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={()=>adj(item.id,-1)} className="h-6 w-6 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100"><Minus className="h-3 w-3 text-slate-500"/></button>
                        <button onClick={()=>adj(item.id,+1)} className="h-6 w-6 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100"><Plus className="h-3 w-3 text-slate-500"/></button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{(item.qty*item.price).toLocaleString('nb-NO')} kr</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
