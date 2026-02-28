'use client';

import { useState } from 'react';
import { Cpu, CheckCircle, Clock, Zap, Mail, MessageSquare, FileText, Bell, BarChart3, Users, Play, AlertTriangle } from 'lucide-react';

type AutoRule = {
  id: string;
  category: string;
  title: string;
  description: string;
  trigger: string;
  action: string;
  icon: React.ElementType;
  timeSaved: number; // min per month
  enabled: boolean;
  lastRun?: string;
  runCount: number;
};

const INITIAL_RULES: AutoRule[] = [
  {
    id: 'lead_email', category: 'Leads', title: 'Auto leadsvar', icon: Mail,
    description: 'Send automatisk e-post når nytt lead kommer inn via skjema',
    trigger: 'Nytt lead inn', action: 'Send velkomst-e-post', timeSaved: 45, enabled: true,
    lastRun: '2 min siden', runCount: 127,
  },
  {
    id: 'lead_score', category: 'Leads', title: 'Lead-scoring', icon: Zap,
    description: 'Automatisk scoring av leads basert på svar og atferd',
    trigger: 'Lead opprettes', action: 'Kalkuler score 0–100', timeSaved: 30, enabled: true,
    lastRun: '2 min siden', runCount: 127,
  },
  {
    id: 'followup', category: 'Salg', title: 'Oppfølgingspåminnelse', icon: Bell,
    description: 'Varsle om leads som ikke har fått respons på 48 timer',
    trigger: 'Lead ubesvart 48t', action: 'Push + e-postvarsling', timeSaved: 60, enabled: true,
    lastRun: '4 timer siden', runCount: 43,
  },
  {
    id: 'proposal_followup', category: 'Salg', title: 'Tilbudsoppfølging', icon: FileText,
    description: 'Send automatisk oppfølging på utsendte tilbud etter 5 dager uten svar',
    trigger: 'Tilbud ubesvart 5 dager', action: 'Send oppfølgings-e-post', timeSaved: 40, enabled: false,
    lastRun: 'Aldri', runCount: 0,
  },
  {
    id: 'invoice_reminder', category: 'Økonomi', title: 'Fakturavarsel', icon: AlertTriangle,
    description: 'Automatisk purring 3 dager før betalingsfrist',
    trigger: 'Faktura forfaller om 3 dager', action: 'Send vennlig purre-SMS', timeSaved: 35, enabled: true,
    lastRun: 'I går', runCount: 18,
  },
  {
    id: 'review_req', category: 'Omdømme', title: 'Anmeldelsesforespørsel', icon: MessageSquare,
    description: 'Be om Google-anmeldelse 7 dager etter fullført jobb',
    trigger: 'Jobb markert fullført', action: 'Send SMS-forespørsel', timeSaved: 25, enabled: false,
    runCount: 0,
  },
  {
    id: 'monthly_report', category: 'Rapporter', title: 'Månedlig rapport', icon: BarChart3,
    description: 'Automatisk sammendrag av leads, omsetning og KPI-er sendes til eier',
    trigger: '1. dag i mnd kl. 08:00', action: 'Send e-postrapport', timeSaved: 60, enabled: true,
    lastRun: '1. feb.', runCount: 6,
  },
  {
    id: 'birthday', category: 'Relasjoner', title: 'Kundeanniversary', icon: Users,
    description: 'Send personlig melding på ettårsdagen for et prosjekt',
    trigger: '12 mnd etter siste jobb', action: 'Send e-post med tilbud', timeSaved: 20, enabled: false,
    runCount: 0,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Leads: 'text-blue-400',
  Salg: 'text-emerald-400',
  Økonomi: 'text-amber-400',
  Omdømme: 'text-pink-400',
  Rapporter: 'text-purple-400',
  Relasjoner: 'text-teal-400',
};

export default function AutoBackofficePage() {
  const [rules, setRules] = useState(INITIAL_RULES);
  const [runningId, setRunningId] = useState<string | null>(null);

  const toggle = (id: string) => setRules(rs => rs.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));

  const testRun = (id: string) => {
    setRunningId(id);
    setTimeout(() => {
      setRules(rs => rs.map(r => r.id === id ? { ...r, lastRun: 'Akkurat nå', runCount: r.runCount + 1 } : r));
      setRunningId(null);
    }, 1500);
  };

  const enabledRules = rules.filter(r => r.enabled);
  const totalTimeSaved = enabledRules.reduce((a, r) => a + r.timeSaved, 0);
  const totalRuns = rules.reduce((a, r) => a + r.runCount, 0);
  const categories = Array.from(new Set(rules.map(r => r.category)));

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="h-5 w-5 text-purple-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Automatisering</span>
            <span className="text-xs font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">Enterprise</span>
          </div>
          <h1 className="text-3xl font-black text-white">Autonom Backoffice</h1>
          <p className="text-slate-400 text-sm mt-1">Aktiver automatiseringer som driver bedriften din mens du jobber</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-purple-400">{enabledRules.length}</p>
            <p className="text-xs text-slate-400 mt-1">Aktive regler</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-emerald-400">{Math.round(totalTimeSaved / 60)}t</p>
            <p className="text-xs text-slate-400 mt-1">Spart tid/mnd</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-blue-400">{totalRuns}</p>
            <p className="text-xs text-slate-400 mt-1">Kjøringer totalt</p>
          </div>
        </div>

        {/* Rules by category */}
        {categories.map(cat => (
          <div key={cat}>
            <h3 className={`text-sm font-bold uppercase tracking-wide mb-3 ${CATEGORY_COLORS[cat] ?? 'text-slate-400'}`}>{cat}</h3>
            <div className="space-y-2">
              {rules.filter(r => r.category === cat).map(rule => {
                const Icon = rule.icon;
                const isRunning = runningId === rule.id;
                return (
                  <div key={rule.id} className={`border rounded-2xl p-4 transition ${rule.enabled ? 'bg-slate-800/60 border-slate-700/50' : 'bg-slate-900/40 border-slate-800/50 opacity-70'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`flex items-center justify-center h-9 w-9 rounded-xl flex-shrink-0 ${rule.enabled ? 'bg-purple-500/20' : 'bg-slate-700'}`}>
                        <Icon className={`h-4 w-4 ${rule.enabled ? 'text-purple-400' : 'text-slate-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white">{rule.title}</span>
                          {rule.enabled && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                        </div>
                        <p className="text-slate-400 text-sm">{rule.description}</p>
                        <div className="flex gap-3 mt-2 flex-wrap">
                          <span className="text-xs text-slate-500">
                            <span className="text-slate-400">Trigger:</span> {rule.trigger}
                          </span>
                          <span className="text-xs text-slate-500">
                            <span className="text-slate-400">Handling:</span> {rule.action}
                          </span>
                        </div>
                        <div className="flex gap-4 mt-2">
                          <span className="text-xs text-emerald-400">Sparer {rule.timeSaved} min/mnd</span>
                          {rule.lastRun && <span className="text-xs text-slate-500">Sist: {rule.lastRun}</span>}
                          {rule.runCount > 0 && <span className="text-xs text-slate-500">{rule.runCount} kjøringer</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => testRun(rule.id)} disabled={isRunning}
                          className="flex items-center gap-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1.5 rounded-lg transition">
                          {isRunning ? (
                            <><Clock className="h-3 w-3 animate-spin" /> Kjører…</>
                          ) : (
                            <><Play className="h-3 w-3" /> Test</>
                          )}
                        </button>
                        <button onClick={() => toggle(rule.id)}
                          className={`relative h-6 w-11 rounded-full transition-colors ${rule.enabled ? 'bg-purple-600' : 'bg-slate-700'}`}>
                          <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${rule.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Summary */}
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/30 rounded-2xl p-6">
          <div className="flex items-start gap-4 flex-wrap">
            <CheckCircle className="h-8 w-8 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-white text-lg">Automatisering-effekt</h3>
              <p className="text-slate-400 text-sm mt-1">
                Med {enabledRules.length} aktive regler sparer du <span className="text-purple-400 font-bold">{totalTimeSaved} minutter</span> ({Math.round(totalTimeSaved / 60)} timer) per måned — tid som kan brukes på verdiskapende arbeid i stedet for administrasjon.
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Aktivér <span className="text-white font-semibold">Anmeldelsesforespørsel</span> og <span className="text-white font-semibold">Tilbudsoppfølging</span> for ytterligere 65 min/mnd sparing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
