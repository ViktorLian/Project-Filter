'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCircle2, Clock, FileCheck, RefreshCw, Star, Wrench } from 'lucide-react';

type Settings = {
  lead_followup_enabled: boolean;
  lead_followup_hours: number;
  proposal_followup_enabled: boolean;
  proposal_followup_days: number;
  reactivation_enabled: boolean;
  reactivation_days: number;
  service_reminders_enabled: boolean;
  monthly_report_enabled: boolean;
};

const items = [
  { key: 'lead_followup_enabled', title: 'Oppfølging av nye henvendelser', description: 'Følger automatisk opp henvendelser som fortsatt står ubesvart.', icon: Bell, timing: 'lead_followup_hours', unit: 'timer' },
  { key: 'proposal_followup_enabled', title: 'Oppfølging av tilbud', description: 'Sender en kort og profesjonell oppfølging på sendte tilbud.', icon: FileCheck, timing: 'proposal_followup_days', unit: 'dager' },
  { key: 'reactivation_enabled', title: 'Gjenaktivering av kunder', description: 'Kontakter bare kunder som har gitt markedsføringssamtykke og ikke har meldt seg av.', icon: RefreshCw, timing: 'reactivation_days', unit: 'dager' },
  { key: 'service_reminders_enabled', title: 'Servicepåminnelser', description: 'Varsler kunden når registrert servicedato nærmer seg.', icon: Wrench },
  { key: 'monthly_report_enabled', title: 'Månedlig resultatrapport', description: 'Sender eieren en oppsummering av henvendelser, jobber og tilbakemeldinger.', icon: Star },
] as const;

export default function WorkflowsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/automation-settings').then(r => r.json()).then(data => {
      setSettings(data.settings || null);
      setRecent(data.recent || []);
    });
  }, []);

  async function save(next: Settings) {
    setSettings(next); setSaving(true); setMessage('');
    const response = await fetch('/api/automation-settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next),
    });
    const data = await response.json();
    setSaving(false);
    setMessage(response.ok ? 'Endringene er lagret.' : data.error || 'Kunne ikke lagre.');
  }

  if (!settings) return <div className="p-8 text-sm text-slate-500">Laster automatiseringer...</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Automatiseringer</h1>
        <p className="mt-2 text-sm text-slate-600">En enkel oversikt over oppfølgingen FlowPilot utfører for bedriften.</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {items.map((item, index) => {
          const Icon = item.icon;
          const enabled = Boolean(settings[item.key]);
          return (
            <div key={item.key} className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center ${index ? 'border-t border-slate-100' : ''}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><h2 className="font-semibold text-slate-900">{item.title}</h2><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{enabled ? 'Aktiv' : 'Av'}</span></div>
                <p className="mt-1 text-sm text-slate-500">{item.description}</p>
              </div>
              {'timing' in item && item.timing && (
                <label className="flex items-center gap-2 text-sm text-slate-600"><Clock className="h-4 w-4" />
                  <input type="number" min={1} value={Number(settings[item.timing])}
                    onChange={e => save({ ...settings, [item.timing]: Number(e.target.value) })}
                    className="w-20 rounded-lg border border-slate-200 px-2 py-1.5" /> {item.unit}
                </label>
              )}
              <button onClick={() => save({ ...settings, [item.key]: !enabled })}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${enabled ? 'border border-slate-200 bg-white text-slate-700' : 'bg-blue-600 text-white'}`}>
                {enabled ? 'Slå av' : 'Aktiver'}
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex min-h-6 items-center gap-2 text-sm text-slate-500">
        {saving ? 'Lagrer...' : message && <><CheckCircle2 className="h-4 w-4 text-emerald-600" />{message}</>}
      </div>
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Siste kjøringer</h2>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          {recent.length === 0 ? <p className="text-sm text-slate-500">Ingen automatiske utsendelser er registrert ennå.</p> :
            <div className="space-y-3">{recent.map((run, i) => <div key={i} className="flex justify-between border-b border-slate-100 pb-3 text-sm last:border-0 last:pb-0"><span className="text-slate-700">{String(run.automation_type).replace(/_/g, ' ')}</span><span className={run.delivery_status === 'sent' ? 'text-emerald-700' : 'text-red-700'}>{run.delivery_status === 'sent' ? 'Sendt' : 'Feilet'}</span></div>)}</div>}
        </div>
      </div>
    </div>
  );
}
