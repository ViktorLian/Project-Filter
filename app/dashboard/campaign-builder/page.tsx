'use client';

import { useState } from 'react';
import { Rocket, Sparkles, Target, DollarSign, MapPin, Briefcase, Send, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

const CAMPAIGN_GOALS = [
  { id: 'leads', label: 'Skaff nye leads', icon: Target },
  { id: 'reviews', label: 'Få Google-anmeldelser', icon: Target },
  { id: 'referral', label: 'Vervekampanje', icon: Target },
  { id: 'seasonal', label: 'Sesongkampanje', icon: Target },
  { id: 'reactivate', label: 'Reaktiver tapte kunder', icon: Target },
  { id: 'upsell', label: 'Mersalg til eksisterende', icon: Target },
];

const CHANNELS = [
  { id: 'facebook', label: 'Facebook Ads' },
  { id: 'google', label: 'Google Ads' },
  { id: 'email', label: 'E-postkampanje' },
  { id: 'sms', label: 'SMS-kampanje' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'flyers', label: 'Flyers / offline' },
];

const INDUSTRIES = [
  'Rørlegger', 'Elektriker', 'Maler', 'Tømrer / snekker', 'Flislegger',
  'Rengjøring', 'Hageservice', 'Bilpleie', 'IT-service', 'Annet',
];

type CampaignPlan = {
  summary: string;
  steps: string[];
  adCopy: string;
  emailSubject: string;
  emailBody: string;
  smsText: string;
  budget: string;
  kpis: string[];
};

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); }}
      className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors ml-auto shrink-0">
      {done ? <><Check className="h-3 w-3 text-green-500" />Kopiert</> : <><Copy className="h-3 w-3" />Kopier</>}
    </button>
  );
}

export default function CampaignBuilderPage() {
  const [goal, setGoal] = useState('');
  const [channels, setChannels] = useState<string[]>(['facebook']);
  const [industry, setIndustry] = useState('');
  const [area, setArea] = useState('');
  const [budget, setBudget] = useState('');
  const [extra, setExtra] = useState('');
  const [plan, setPlan] = useState<CampaignPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>('adcopy');

  function toggleChannel(id: string) {
    setChannels(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }

  async function build() {
    if (!goal || !industry) return;
    setLoading(true);
    setPlan(null);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Du er en markedsføringsstrateg for norske SMB-bedrifter. Lag en komplett kampanjeplan:

Bransje: ${industry}
Mål: ${goal}
Kanaler: ${channels.join(', ')}
Område: ${area || 'Norge'}
Budsjett: ${budget || 'ikke oppgitt'}
Ekstra info: ${extra || 'ingen'}

Svar NØYAKTIG med dette formatet:
SAMMENDRAG: [2 setninger om kampanjen]
STEG:
1. [steg 1]
2. [steg 2]
3. [steg 3]
4. [steg 4]
ANNONSEKOPI: [Ferdig annonsekopi for Facebook/Instagram, maks 5 setninger, inkl. CTA]
E-POST EMNE: [En kort e-post emnelinje]
E-POST TEKST: [Ferdig e-posttekst, 4-6 setninger, personlig og engasjerende]
SMS: [Ferdig SMS-tekst, maks 160 tegn, med CTA]
BUDSJETT-TIPS: [Konkret anbefaling for budsjettet]
KPI:
- [KPI 1]
- [KPI 2]
- [KPI 3]

Norsk bokmål. Vær konkret og realistisk for en liten norsk bedrift.`,
          history: [],
        }),
      });
      const data = await res.json();
      const text: string = data.reply || '';

      const steps = (text.match(/\d\.\s+.+/g) || []).filter(s => !s.match(/KPI/i));
      const kpis = (text.match(/^-\s+.+/gm) || []);

      setPlan({
        summary: text.match(/SAMMENDRAG:\s*(.+)/i)?.[1]?.trim() ?? '',
        steps: steps.slice(0, 5),
        adCopy: text.match(/ANNONSEKOPI:\s*([\s\S]+?)(?=E-POST EMNE:|$)/i)?.[1]?.trim() ?? '',
        emailSubject: text.match(/E-POST EMNE:\s*(.+)/i)?.[1]?.trim() ?? '',
        emailBody: text.match(/E-POST TEKST:\s*([\s\S]+?)(?=SMS:|$)/i)?.[1]?.trim() ?? '',
        smsText: text.match(/SMS:\s*([\s\S]+?)(?=BUDSJETT|$)/i)?.[1]?.trim() ?? '',
        budget: text.match(/BUDSJETT-TIPS:\s*([\s\S]+?)(?=KPI:|$)/i)?.[1]?.trim() ?? '',
        kpis: kpis.slice(0, 4).map(k => k.replace(/^-\s+/, '')),
      });
    } finally { setLoading(false); }
  }

  const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="rounded-xl border border-slate-200">
      <button onClick={() => setOpenSection(openSection === id ? null : id)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
        <span className="font-semibold text-slate-800 text-sm">{title}</span>
        {openSection === id ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>
      {openSection === id && <div className="border-t border-slate-100 px-4 py-4">{children}</div>}
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kampanjebygger</h1>
        <p className="text-slate-500 mt-1">AI lager en komplett markedsføringskampanje – ferdig annonsekopi, e-post og SMS</p>
      </div>

      {/* Config */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Bransje *</label>
            <select value={industry} onChange={e => setIndustry(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Velg bransje...</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Område</label>
            <input value={area} onChange={e => setArea(e.target.value)}
              placeholder="Eks: Oslo, Lillestrøm, Viken..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Kampanjemål *</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {CAMPAIGN_GOALS.map(g => (
              <button key={g.id} onClick={() => setGoal(g.id)}
                className={`rounded-lg border p-3 text-left text-sm transition-all ${goal === g.id ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}>
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Kanaler</label>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map(c => (
              <button key={c.id} onClick={() => toggleChannel(c.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${channels.includes(c.id) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Månedlig budsjett</label>
            <input value={budget} onChange={e => setBudget(e.target.value)}
              placeholder="Eks: 2000 kr/mnd, lavest mulig..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Ekstra info (valgfri)</label>
            <input value={extra} onChange={e => setExtra(e.target.value)}
              placeholder="Eks: Fokus på prisfølsomme kunder, konkurrent X..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        <button onClick={build} disabled={loading || !goal || !industry}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
          <Sparkles className="h-4 w-4" />
          {loading ? 'Bygger kampanje...' : 'Bygg kampanje med AI'}
        </button>
      </div>

      {/* Result */}
      {plan && (
        <div className="space-y-3">
          {plan.summary && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-blue-900 mb-1">Kampanjeplan</p>
              <p className="text-sm text-slate-700">{plan.summary}</p>
            </div>
          )}

          {plan.steps.length > 0 && (
            <Section id="steps" title="📋 Steg-for-steg plan">
              <ol className="space-y-2">
                {plan.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-sm text-slate-700">{s.replace(/^\d+\.\s*/, '')}</p>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {plan.adCopy && (
            <Section id="adcopy" title="📣 Annonsekopi (Facebook / Instagram)">
              <div className="flex items-start gap-2">
                <p className="text-sm text-slate-700 flex-1 whitespace-pre-wrap">{plan.adCopy}</p>
                <CopyBtn text={plan.adCopy} />
              </div>
            </Section>
          )}

          {(plan.emailSubject || plan.emailBody) && (
            <Section id="email" title="📧 E-postkampanje">
              <div className="space-y-3">
                {plan.emailSubject && (
                  <div>
                    <div className="flex items-center mb-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Emnelinje</p>
                      <CopyBtn text={plan.emailSubject} />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">"{plan.emailSubject}"</p>
                  </div>
                )}
                {plan.emailBody && (
                  <div>
                    <div className="flex items-center mb-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">E-posttekst</p>
                      <CopyBtn text={plan.emailBody} />
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{plan.emailBody}</p>
                  </div>
                )}
              </div>
            </Section>
          )}

          {plan.smsText && (
            <Section id="sms" title="💬 SMS-kampanje">
              <div className="flex items-start gap-2">
                <p className="text-sm text-slate-700 flex-1">{plan.smsText}</p>
                <CopyBtn text={plan.smsText} />
              </div>
              <p className="text-xs text-slate-400 mt-2">{plan.smsText.length}/160 tegn</p>
            </Section>
          )}

          {(plan.budget || plan.kpis.length > 0) && (
            <Section id="roi" title="💰 Budsjett og KPI-er">
              <div className="space-y-3">
                {plan.budget && <p className="text-sm text-slate-700">{plan.budget}</p>}
                {plan.kpis.length > 0 && (
                  <ul className="space-y-1">
                    {plan.kpis.map((k, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        {k}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}
