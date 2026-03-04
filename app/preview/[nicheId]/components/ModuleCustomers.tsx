'use client';
import { useState } from 'react';
import { Plus, Search, Phone, Mail, ChevronDown, ChevronUp, StickyNote } from 'lucide-react';
import type { Niche } from '@/lib/niches';
import { ACC } from './shared';

type Customer = { id:number; name:string; email:string; phone:string; spent:number; since:string; note:string; expanded:boolean; };

function makeCustomers(s:number): Customer[] {
  const data=[
    ['Kari Nordmann','kari@example.com','908 12 345',89000,'Jan 2024','God kunde, betalingsdyktig'],
    ['Ole Hansen','ole@example.com','917 23 456',43000,'Mar 2024','Trenger tett oppfolging'],
    ['Ingrid Berg','ingrid@example.com','922 34 567',124000,'Nov 2023','Premium-kunde, fornyet avtale'],
    ['Bjorn Larsen','bjorn@example.com','934 45 678',28000,'Apr 2025','Ny kunde – i proveperiode'],
    ['Tone Johansen','tone@example.com','941 56 789',67000,'Jun 2024','Aktiv pa sosiale medier'],
    ['Erik Dahl','erik@example.com','955 67 890',51000,'Feb 2024','Interessert i utvidelse'],
  ];
  return data.map(([n,e,p,sp,si,no],i)=>({
    id:i+1, name:n as string, email:e as string, phone:p as string,
    spent: Number(sp) + ((s*(i+2)*7)%15000),
    since: si as string, note: no as string, expanded:false,
  }));
}

export function ModuleCustomers({ nicheId, niche }: { nicheId:string; niche:Niche }) {
  const s = nicheId.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  const [customers, setCustomers] = useState<Customer[]>(makeCustomers(s));
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newNote, setNewNote] = useState('');

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  function toggle(id:number) {
    setCustomers(prev=>prev.map(c=>c.id===id?{...c,expanded:!c.expanded}:c));
  }
  function updateNote(id:number,note:string) {
    setCustomers(prev=>prev.map(c=>c.id===id?{...c,note}:c));
  }
  function add() {
    if (!newName.trim()) return;
    setCustomers(prev=>[{id:Date.now(),name:newName,email:newEmail,phone:newPhone,spent:0,since:'Mars 2026',note:newNote,expanded:false},...prev]);
    setNewName(''); setNewEmail(''); setNewPhone(''); setNewNote(''); setShowForm(false);
  }

  const totalSpent = customers.reduce((a,c)=>a+c.spent,0);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Totalt kunder',    val:String(customers.length)                },
          { label:'Total omsetning',  val:`${totalSpent.toLocaleString('nb-NO')} kr` },
          { label:'Snitt per kunde',  val:`${Math.round(totalSpent/customers.length).toLocaleString('nb-NO')} kr` },
        ].map(c=>(
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className="text-sm font-bold text-slate-800">{c.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Sok kunde..." className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400"/>
          </div>
          <button onClick={()=>setShowForm(v=>!v)} className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg" style={{backgroundColor:ACC}}>
            <Plus className="h-3.5 w-3.5"/> Ny kunde
          </button>
        </div>

        {showForm && (
          <div className="p-4 border-b border-slate-100 bg-slate-50 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Navn *" className="text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
            <input value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="E-post" className="text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
            <input value={newPhone} onChange={e=>setNewPhone(e.target.value)} placeholder="Telefon" className="text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
            <div className="flex gap-2">
              <button onClick={add} className="flex-1 text-xs font-semibold text-white py-2 rounded-lg" style={{backgroundColor:ACC}}>Legg til</button>
              <button onClick={()=>setShowForm(false)} className="text-xs text-slate-500 px-3 py-2 rounded-lg border border-slate-200 bg-white">Avbryt</button>
            </div>
          </div>
        )}

        <div className="divide-y divide-slate-50">
          {filtered.map(c=>(
            <div key={c.id}>
              <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer" onClick={()=>toggle(c.id)}>
                <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{backgroundColor:ACC}}>
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-400 truncate">{c.email}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-700">{c.spent.toLocaleString('nb-NO')} kr</p>
                  <p className="text-[10px] text-slate-400">siden {c.since}</p>
                </div>
                {c.expanded ? <ChevronUp className="h-4 w-4 text-slate-400"/> : <ChevronDown className="h-4 w-4 text-slate-400"/>}
              </div>
              {c.expanded && (
                <div className="px-4 pb-4 bg-slate-50 border-t border-slate-100">
                  <div className="flex flex-wrap gap-4 py-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-indigo-400"/>{c.phone}</span>
                    <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-indigo-400"/>{c.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <StickyNote className="h-3.5 w-3.5 text-slate-400 mt-1.5 flex-shrink-0"/>
                    <textarea
                      value={c.note}
                      onChange={e=>updateNote(c.id,e.target.value)}
                      rows={2}
                      className="flex-1 text-xs border border-slate-200 rounded-lg p-2 outline-none focus:ring-1 focus:ring-indigo-400 bg-white resize-none"
                      placeholder="Notater om kunden..."
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtered.length===0 && <div className="p-8 text-center text-sm text-slate-400">Ingen kunder funnet</div>}
        </div>
      </div>
    </div>
  );
}
