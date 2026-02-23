'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MarketingActivity {
  id: string;
  week: number;
  title: string;
  channel: string;
  status: 'planned' | 'active' | 'done' | 'skipped';
  reach: string;
  goal: string;
}

const channels: { id: string; label: string; color: string }[] = [
  { id: 'email', label: 'E-post', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'sms', label: 'SMS', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'google', label: 'Google', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'social', label: 'Sosiale medier', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { id: 'referral', label: 'Vervprogram', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'local', label: 'Lokalt/offline', color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

const initialActivities: MarketingActivity[] = [
  { id: '1', week: 1, title: 'Nyhetsbrev — vintertilbud', channel: 'email', status: 'done', reach: '148 kunder', goal: 'Bestillinger' },
  { id: '2', week: 1, title: 'Google-anmeldelse følgeoppfølging', channel: 'sms', status: 'done', reach: '12 kunder', goal: 'Anmeldelser' },
  { id: '3', week: 2, title: 'Facebook-innlegg — Ferdig jobb (bilder)', channel: 'social', status: 'active', reach: '~800 nå', goal: 'Merkevare' },
  { id: '4', week: 2, title: 'Google Ads — serviceoppdrag', channel: 'google', status: 'active', reach: 'Estimert 340 klikk', goal: 'Nye leads' },
  { id: '5', week: 3, title: 'Vår-kampanje e-post', channel: 'email', status: 'planned', reach: '148 kunder', goal: 'Tidlig booking' },
  { id: '6', week: 3, title: 'Verv-en-venn SMS til topp-kunder', channel: 'referral', status: 'planned', reach: '25 kunder', goal: 'Nye kunder' },
  { id: '7', week: 4, title: 'Flyer-distribusjon — lokalt', channel: 'local', status: 'planned', reach: '~500 husstander', goal: 'Lokal synlighet' },
  { id: '8', week: 4, title: 'Instagram — før/etter bilder', channel: 'social', status: 'planned', reach: '~400 følgere', goal: 'Merkevare' },
];

const statusConfig = {
  planned: { label: 'Planlagt', bg: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  active: { label: 'Aktiv', bg: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  done: { label: 'Ferdig', bg: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  skipped: { label: 'Hoppet over', bg: 'bg-red-100 text-red-600', dot: 'bg-red-400' },
};

export default function MarketingCalendarPage() {
  const [activities, setActivities] = useState(initialActivities);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newChannel, setNewChannel] = useState('email');
  const [newWeek, setNewWeek] = useState(1);
  const [newGoal, setNewGoal] = useState('');
  const [aiPlan, setAiPlan] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  const weeks = [1, 2, 3, 4];

  function toggleStatus(id: string) {
    setActivities(prev => prev.map(a => {
      if (a.id !== id) return a;
      const cycle: MarketingActivity['status'][] = ['planned', 'active', 'done', 'skipped'];
      const next = cycle[(cycle.indexOf(a.status) + 1) % cycle.length];
      return { ...a, status: next };
    }));
  }

  function addActivity() {
    if (!newTitle) return;
    setActivities(prev => [...prev, {
      id: String(Date.now()),
      week: newWeek,
      title: newTitle,
      channel: newChannel,
      status: 'planned',
      reach: 'Ukjent',
      goal: newGoal || 'Ukjent',
    }]);
    setNewTitle(''); setNewGoal(''); setShowAdd(false);
  }

  const filtered = activities.filter(a =>
    (selectedWeek === null || a.week === selectedWeek) &&
    (selectedChannel === null || a.channel === selectedChannel)
  );

  async function generateAIPlan() {
    setLoadingAI(true);
    setAiPlan('');
    const done = activities.filter(a => a.status === 'done').length;
    const active = activities.filter(a => a.status === 'active').length;
    const planned = activities.filter(a => a.status === 'planned').length;
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Jeg er eier av en norsk håndverks/servicebedrift og planlegger månedlig markedsføring.
Nåværende aktiviteter: ${done} fullført, ${active} aktive, ${planned} planlagt.
Kanaler brukt: ${Array.from(new Set(activities.map(a => a.channel))).join(', ')}.

Gi meg 3-4 konkrete markedsføringstips som er realistiske for en liten norsk servicebedrift denne måneden. Fokus på lavkost, høyeffekt tiltak. Eksempler: Google-anmeldelser, lokal Facebook, Facebook leads-annonser, sesongbasert innhold. Max 180 ord. Norsk bokmål.`,
        }),
      });
      const data = await res.json();
      setAiPlan(data.reply || data.message || 'Ingen respons.');
    } catch {
      setAiPlan('Klarte ikke hente plan.');
    }
    setLoadingAI(false);
  }

  const getChannelStyle = (id: string) => channels.find(c => c.id === id)?.color || 'bg-slate-100 text-slate-700 border-slate-200';
  const getChannelLabel = (id: string) => channels.find(c => c.id === id)?.label || id;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Markedskalender</h1>
          <p className="text-slate-500 mt-1">Planlegg og følg opp markedsaktiviteter gjennom måneden</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAdd(!showAdd)}>+ Ny aktivitet</Button>
          <Button onClick={generateAIPlan} disabled={loadingAI} className="bg-blue-600 hover:bg-blue-700">
            {loadingAI ? 'Genererer...' : 'AI-tips'}
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <Card key={key}>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-slate-500">{cfg.label}</p>
              <p className="text-xl font-bold text-slate-900">
                {activities.filter(a => a.status === key as MarketingActivity['status']).length}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Plan */}
      {aiPlan && (
        <Card className="border-blue-200 bg-blue-50/40">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">AI markedsføringstips for denne måneden</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{aiPlan}</p>
          </CardContent>
        </Card>
      )}

      {/* Add new */}
      {showAdd && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-4">
            <div className="grid md:grid-cols-4 gap-3">
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Tittel på aktivitet" className="md:col-span-2" />
              <select className="border rounded-md px-3 py-2 text-sm bg-white" value={newChannel} onChange={e => setNewChannel(e.target.value)}>
                {channels.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <select className="border rounded-md px-3 py-2 text-sm bg-white" value={newWeek} onChange={e => setNewWeek(parseInt(e.target.value))}>
                {weeks.map(w => <option key={w} value={w}>Uke {w}</option>)}
              </select>
            </div>
            <div className="flex gap-2 mt-3">
              <Input value={newGoal} onChange={e => setNewGoal(e.target.value)} placeholder="Mål (f.eks. Nye leads, Anmeldelser...)" className="flex-1" />
              <Button onClick={addActivity} disabled={!newTitle} className="bg-blue-600 hover:bg-blue-700">Legg til</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-sm text-slate-500">Uke:</span>
        <button onClick={() => setSelectedWeek(null)} className={`px-3 py-1 rounded-full text-sm border ${!selectedWeek ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}>Alle</button>
        {weeks.map(w => (
          <button key={w} onClick={() => setSelectedWeek(w === selectedWeek ? null : w)} className={`px-3 py-1 rounded-full text-sm border ${selectedWeek === w ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}>Uke {w}</button>
        ))}
        <span className="text-sm text-slate-500 ml-3">Kanal:</span>
        {channels.map(c => (
          <button key={c.id} onClick={() => setSelectedChannel(c.id === selectedChannel ? null : c.id)} className={`px-3 py-1 rounded-full text-sm border ${selectedChannel === c.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}>{c.label}</button>
        ))}
      </div>

      {/* Weekly grid */}
      <div className="space-y-4">
        {(selectedWeek ? [selectedWeek] : weeks).map(week => {
          const weekActivities = filtered.filter(a => a.week === week);
          if (weekActivities.length === 0 && selectedWeek === null) return null;
          return (
            <div key={week}>
              <h3 className="text-sm font-semibold text-slate-500 mb-2">— Uke {week} —</h3>
              <div className="space-y-2">
                {weekActivities.length === 0 ? (
                  <p className="text-sm text-slate-400 ml-2">Ingen aktiviteter</p>
                ) : weekActivities.map(a => {
                  const sc = statusConfig[a.status];
                  return (
                    <Card key={a.id} className="hover:border-slate-300 transition-colors">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <button
                            onClick={() => toggleStatus(a.id)}
                            className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 ${a.status === 'done' ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}
                            title="Klikk for å endre status"
                          >
                            {a.status === 'done' && (
                              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <span className={`text-sm font-medium ${a.status === 'done' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {a.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getChannelStyle(a.channel)}`}>
                              {getChannelLabel(a.channel)}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${sc.bg}`}>
                              {sc.label}
                            </span>
                            <span className="text-xs text-slate-400">{a.reach}</span>
                            <span className="text-xs text-slate-500">{a.goal}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
