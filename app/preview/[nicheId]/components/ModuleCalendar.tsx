'use client';
import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';
import type { Niche } from '@/lib/niches';
import { ACC } from './shared';

type Booking = { id:number; title:string; customer:string; time:string; duration:number; day:number; type:string; };

const HOURS = [8,9,10,11,12,13,14,15,16,17];
const DAYS = ['Man','Tir','Ons','Tor','Fre'];
const TYPES = ['Konsultasjon','Mote','Oppfolging','Demo','Service'];

const SAMPLE: Booking[] = [
  { id:1, title:'Konsultasjon', customer:'Kari Nordmann', time:'09:00', duration:60, day:0, type:'Konsultasjon' },
  { id:2, title:'Mote', customer:'Ole Hansen', time:'11:00', duration:30, day:1, type:'Mote' },
  { id:3, title:'Demo', customer:'Ingrid Berg', time:'14:00', duration:60, day:2, type:'Demo' },
  { id:4, title:'Oppfolging', customer:'Bjorn Larsen', time:'10:00', duration:30, day:3, type:'Oppfolging' },
  { id:5, title:'Service', customer:'Tone Johansen', time:'13:00', duration:90, day:4, type:'Service' },
  { id:6, title:'Konsultasjon', customer:'Erik Dahl', time:'16:00', duration:60, day:1, type:'Konsultasjon' },
];

export function ModuleCalendar({ nicheId, niche }: { nicheId:string; niche:Niche }) {
  const [bookings, setBookings] = useState<Booking[]>(SAMPLE);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Booking|null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newCust, setNewCust] = useState('');
  const [newDay, setNewDay] = useState(0);
  const [newHour, setNewHour] = useState(9);
  const [newType, setNewType] = useState(TYPES[0]);
  const [newDur, setNewDur] = useState(60);
  const [weekOffset, setWeekOffset] = useState(0);

  function add() {
    if (!newTitle.trim() || !newCust.trim()) return;
    setBookings(prev=>[...prev,{id:Date.now(),title:newType,customer:newCust,time:`${String(newHour).padStart(2,'0')}:00`,duration:newDur,day:newDay,type:newType}]);
    setNewTitle(''); setNewCust(''); setShowForm(false);
  }
  function remove(id:number) {
    setBookings(prev=>prev.filter(b=>b.id!==id));
    setSelected(null);
  }

  function timeToRow(time:string) {
    const [h] = time.split(':').map(Number);
    return h - 8;
  }

  const weekDates = DAYS.map((_,i) => {
    const d = new Date(2025,2,3 + weekOffset*7 + i);
    return d.getDate();
  });

  return (
    <div className="space-y-4">
      {/* Topbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={()=>setWeekOffset(v=>v-1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"><ChevronLeft className="h-4 w-4 text-slate-600"/></button>
          <span className="text-sm font-semibold text-slate-700">Uke {10+weekOffset}</span>
          <button onClick={()=>setWeekOffset(v=>v+1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"><ChevronRight className="h-4 w-4 text-slate-600"/></button>
        </div>
        <button onClick={()=>setShowForm(v=>!v)} className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg" style={{backgroundColor:ACC}}>
          <Plus className="h-3.5 w-3.5"/> Ny booking
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          <input value={newCust} onChange={e=>setNewCust(e.target.value)} placeholder="Kunde *" className="text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
          <select value={newType} onChange={e=>setNewType(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-2 outline-none">
            {TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
          <select value={newDay} onChange={e=>setNewDay(Number(e.target.value))} className="text-xs border border-slate-200 rounded-lg px-2 py-2 outline-none">
            {DAYS.map((d,i)=><option key={d} value={i}>{d}</option>)}
          </select>
          <select value={newHour} onChange={e=>setNewHour(Number(e.target.value))} className="text-xs border border-slate-200 rounded-lg px-2 py-2 outline-none">
            {HOURS.map(h=><option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>)}
          </select>
          <select value={newDur} onChange={e=>setNewDur(Number(e.target.value))} className="text-xs border border-slate-200 rounded-lg px-2 py-2 outline-none">
            {[30,60,90,120].map(d=><option key={d} value={d}>{d} min</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={add} className="flex-1 text-xs font-semibold text-white py-2 rounded-lg" style={{backgroundColor:ACC}}>Legg til</button>
            <button onClick={()=>setShowForm(false)} className="text-xs text-slate-500 px-3 py-2 rounded-lg border border-slate-200 bg-white">Avbryt</button>
          </div>
        </div>
      )}

      {/* Calendar grid */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header */}
          <div className="grid grid-cols-6 border-b border-slate-100">
            <div className="p-3"/>
            {DAYS.map((d,i)=>(
              <div key={d} className="p-3 text-center border-l border-slate-100">
                <p className="text-xs font-bold text-slate-700">{d}</p>
                <p className="text-xs text-slate-400">{weekDates[i]}</p>
              </div>
            ))}
          </div>
          {/* Time rows */}
          {HOURS.map((h,row)=>(
            <div key={h} className="grid grid-cols-6 border-b border-slate-50 min-h-[52px]">
              <div className="px-3 py-2 text-[10px] text-slate-400 font-mono">{String(h).padStart(2,'0')}:00</div>
              {DAYS.map((_,di)=>{
                const b = bookings.find(bk=>bk.day===di && timeToRow(bk.time)===row);
                return (
                  <div key={di} className="border-l border-slate-50 p-0.5 relative">
                    {b && (
                      <button onClick={()=>setSelected(selected?.id===b.id?null:b)}
                        className="w-full text-left px-2 py-1 rounded-lg text-[11px] font-semibold text-indigo-800"
                        style={{backgroundColor:'#e0e7ff'}}>
                        <span>{b.time}</span><br/>
                        <span className="text-indigo-600 truncate block">{b.customer}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selected booking detail */}
      {selected && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800">{selected.customer}</p>
            <p className="text-xs text-slate-500">{selected.type} — {selected.time}, {selected.duration} min — {DAYS[selected.day]}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-600 font-semibold px-3 py-1 bg-indigo-50 rounded-full flex items-center gap-1"><Clock className="h-3 w-3"/>{selected.duration} min</span>
            <button onClick={()=>remove(selected.id)} className="text-xs text-red-500 hover:underline flex items-center gap-1"><X className="h-3 w-3"/>Slett</button>
          </div>
        </div>
      )}
    </div>
  );
}
