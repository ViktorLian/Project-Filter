'use client';

import { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, X, Bell, User, Phone, Clock, Briefcase, Calendar
} from 'lucide-react';

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'job' | 'meeting' | 'follow-up' | 'reminder';
  customer_name?: string;
  phone?: string;
  notes?: string;
  notify_sms?: boolean;
  notify_email?: boolean;
  assigned_to?: string;
};

const TYPE_CFG = {
  job:       { label: 'Jobb',        color: 'bg-blue-500',    light: 'bg-blue-50 border-blue-200 text-blue-700' },
  meeting:   { label: 'Møte',        color: 'bg-purple-500',  light: 'bg-purple-50 border-purple-200 text-purple-700' },
  'follow-up': { label: 'Oppfølging', color: 'bg-yellow-500', light: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  reminder:  { label: 'Påminnelse',  color: 'bg-red-500',     light: 'bg-red-50 border-red-200 text-red-700' },
};

const DAYS = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lor', 'Son'];
const MONTHS = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];

const EMPTY_EVENT: Omit<CalendarEvent, 'id'> = {
  title: '', date: new Date().toISOString().slice(0, 10), time: '08:00',
  type: 'job', customer_name: '', phone: '', notes: '', notify_sms: true, notify_email: true, assigned_to: '',
};

export default function CalendarPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newEvent, setNewEvent] = useState(EMPTY_EVENT);
  const [saving, setSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await fetch('/api/calendar');
      const json = await res.json();
      setEvents(json.events || []);
    } catch { setEvents([]); }
  };

  const saveEvent = async () => {
    if (!newEvent.title || !newEvent.date) return;
    setSaving(true);
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });
      if (res.ok) {
        setShowNew(false);
        setNewEvent(EMPTY_EVENT);
        loadEvents();
      }
    } finally { setSaving(false); }
  };

  const deleteEvent = async (id: string) => {
    await fetch(`/api/calendar/${id}`, { method: 'DELETE' });
    loadEvents();
  };

  // Calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Mon=0
  const daysInMonth = lastDay.getDate();

  const calDays: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (calDays.length % 7 !== 0) calDays.push(null);

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kalender</h1>
          <p className="text-slate-500 text-sm mt-0.5">Planlegg jobber, møter og oppfølginger</p>
        </div>
        <button onClick={() => { setShowNew(true); setNewEvent(EMPTY_EVENT); }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm">
          <Plus className="h-4 w-4" /> Ny hendelse
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <button onClick={() => {
              if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
              else setCurrentMonth(m => m - 1);
            }} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </button>
            <h2 className="text-lg font-bold text-slate-900">
              {MONTHS[currentMonth]} {currentYear}
            </h2>
            <button onClick={() => {
              if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
              else setCurrentMonth(m => m + 1);
            }} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
              <ChevronRight className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {DAYS.map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {calDays.map((day, i) => {
              if (!day) return <div key={i} className="min-h-[80px] border-r border-b border-slate-50" />;
              const dayEvents = getEventsForDay(day);
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
              const isSelected = day === selectedDay;
              return (
                <div key={i} onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={`min-h-[80px] border-r border-b border-slate-100 p-1.5 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                  }`}>
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold mb-1 ${
                    isToday ? 'bg-blue-600 text-white' : isSelected ? 'bg-blue-100 text-blue-700' : 'text-slate-700'
                  }`}>
                    {day}
                  </div>
                  {dayEvents.slice(0, 2).map(ev => (
                    <div key={ev.id} className={`text-xs px-1 py-0.5 rounded mb-0.5 truncate font-medium ${
                      TYPE_CFG[ev.type]?.light || ''
                    }`}>
                      {ev.time && <span className="mr-1 opacity-70">{ev.time}</span>}
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-slate-400 pl-1">+{dayEvents.length - 2} til</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Legend */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Hendelsestyper</h3>
            <div className="space-y-2">
              {Object.entries(TYPE_CFG).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${v.color}`} />
                  <span className="text-sm text-slate-600">{v.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected day events */}
          {selectedDay && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                {selectedDay}. {MONTHS[currentMonth]}
              </h3>
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-slate-400">Ingen hendelser denne dagen</p>
              ) : (
                <div className="space-y-3">
                  {selectedEvents.map(ev => (
                    <div key={ev.id} className={`rounded-lg border p-3 ${TYPE_CFG[ev.type]?.light}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm">{ev.title}</p>
                          {ev.time && <p className="text-xs mt-0.5 opacity-75">{ev.time}</p>}
                          {ev.customer_name && (
                            <p className="text-xs mt-1 flex items-center gap-1 opacity-75">
                              <User className="h-3 w-3" />{ev.customer_name}
                            </p>
                          )}
                          {ev.phone && (
                            <p className="text-xs mt-0.5 flex items-center gap-1 opacity-75">
                              <Phone className="h-3 w-3" />{ev.phone}
                            </p>
                          )}
                        </div>
                        <button onClick={() => deleteEvent(ev.id)} className="text-slate-400 hover:text-red-500">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      {ev.notify_sms || ev.notify_email ? (
                        <div className="flex gap-1 mt-2">
                          {ev.notify_sms && <span className="text-xs bg-white/60 px-1.5 py-0.5 rounded border">SMS</span>}
                          {ev.notify_email && <span className="text-xs bg-white/60 px-1.5 py-0.5 rounded border">E-post</span>}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => { setShowNew(true); setNewEvent(e => ({ ...e, date: `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}` })); }}
                className="mt-3 w-full text-xs text-blue-600 font-medium border border-blue-200 rounded-lg py-1.5 hover:bg-blue-50 transition">
                + Legg til hendelse
              </button>
            </div>
          )}

          {/* Upcoming */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Kommende</h3>
            {events
              .filter(e => e.date >= new Date().toISOString().slice(0, 10))
              .sort((a, b) => a.date.localeCompare(b.date))
              .slice(0, 5)
              .map(ev => (
                <div key={ev.id} className="flex items-start gap-2 py-2 border-b border-slate-50 last:border-0">
                  <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${TYPE_CFG[ev.type]?.color || 'bg-slate-400'}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{ev.title}</p>
                    <p className="text-xs text-slate-400">{new Date(ev.date).toLocaleDateString('nb-NO')}{ev.time ? ` kl. ${ev.time}` : ''}</p>
                  </div>
                </div>
              ))}
            {events.filter(e => e.date >= new Date().toISOString().slice(0, 10)).length === 0 && (
              <p className="text-sm text-slate-400">Ingen kommende hendelser</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Ny hendelse</h2>
              <button onClick={() => setShowNew(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1">Tittel *</label>
                <input value={newEvent.title} onChange={e => setNewEvent(n => ({ ...n, title: e.target.value }))}
                  placeholder="f.eks. Rorlegger Ola - Baderom Aker Brygge"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1">Dato *</label>
                  <input type="date" value={newEvent.date} onChange={e => setNewEvent(n => ({ ...n, date: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1">Tidspunkt</label>
                  <input type="time" value={newEvent.time} onChange={e => setNewEvent(n => ({ ...n, time: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1">Type</label>
                <select value={newEvent.type} onChange={e => setNewEvent(n => ({ ...n, type: e.target.value as any }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {Object.entries(TYPE_CFG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1">Kundenavn</label>
                  <input value={newEvent.customer_name} onChange={e => setNewEvent(n => ({ ...n, customer_name: e.target.value }))}
                    placeholder="Ola Nordmann"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1">Tlf-nummer</label>
                  <input value={newEvent.phone} onChange={e => setNewEvent(n => ({ ...n, phone: e.target.value }))}
                    placeholder="+47 900 00 000"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1">Ansvarlig person</label>
                <input value={newEvent.assigned_to} onChange={e => setNewEvent(n => ({ ...n, assigned_to: e.target.value }))}
                  placeholder="f.eks. Per Hansen"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1">Notater</label>
                <textarea value={newEvent.notes} onChange={e => setNewEvent(n => ({ ...n, notes: e.target.value }))}
                  rows={2} placeholder="Ekstra informasjon om hendelsen..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newEvent.notify_email} onChange={e => setNewEvent(n => ({ ...n, notify_email: e.target.checked }))}
                    className="rounded" />
                  <span className="text-sm text-slate-600">E-postvarsel</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newEvent.notify_sms} onChange={e => setNewEvent(n => ({ ...n, notify_sms: e.target.checked }))}
                    className="rounded" />
                  <span className="text-sm text-slate-600">SMS-varsel</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-100">
              <button onClick={() => setShowNew(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">
                Avbryt
              </button>
              <button onClick={saveEvent} disabled={saving || !newEvent.title || !newEvent.date}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
                {saving ? 'Lagrer...' : 'Lagre hendelse'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
