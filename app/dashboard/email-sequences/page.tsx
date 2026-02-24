'use client';

import { useState } from 'react';
import { Mail, Clock, Play, Eye, Copy, CheckCircle, Plus, Zap, BarChart3, Users, TrendingDown, ArrowRight, Star } from 'lucide-react';

type SequenceType = 'trial' | 'welcome' | 'churn' | 'upsell' | 'winback';

interface EmailStep {
  day: number;
  subject: string;
  preview: string;
  body: string;
}

interface Sequence {
  id: SequenceType;
  name: string;
  description: string;
  trigger: string;
  steps: EmailStep[];
  icon: React.ElementType;
  color: string;
  bg: string;
  active: boolean;
}

const SEQUENCES: Sequence[] = [
  {
    id: 'trial',
    name: 'Trial til betalt',
    description: 'Følger opp nye bruker gjennom 14-dager prøveperioden og konverterer til betalt plan.',
    trigger: 'Trigger: ny registrering',
    icon: Zap,
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    active: true,
    steps: [
      { day: 1, subject: 'Din forste gevinst i FlowPilot', preview: 'Slik far du mest ut av uke 1...', body: `Hei [Fornavn],

Velkommen til FlowPilot. Du har tatt et smart valg.

Her er det viktigste du bor gjore i dag:

1. Opprett ditt forste lead-skjema (tar 3 minutter)
2. Send det til en eksisterende kunde og se hva som skjer
3. Se lead-scoren automatisk beregnes

Har du spørsmål? Svar pa denne e-posten — vi leser alt.

Med venlig hilsen,
FlowPilot-teamet` },
      { day: 3, subject: 'Tips som oker salget ditt med 34%', preview: 'Ett enkelt grep de fleste glemmer...', body: `Hei [Fornavn],

Visste du at bedrifter som aktiverer automatisk oppfølging far 34% flere bookinger?

Det tar deg 5 minutter a sette opp:

Gå til Dashboard → Salg → Smart Oppfølging

Systemet sender da automatisk SMS og e-post til leads som ikke har svart — uten at du need a gjore noe.

Probis det i dag mens du har tid.

FlowPilot-teamet` },
      { day: 7, subject: 'Uke 1 fullført — hva har du tjent?', preview: 'Se dine resultater hittil...', body: `Hei [Fornavn],

En uke er gatt. Tid for en liten evaluering.

Ga inn pa Analyse-siden din og se:
- Hvor mange leads du har fatt
- Hva gjennomsnittlig lead-score er
- Estimert inntektspotensial

Hvis du ikke er fornyd — send oss en e-post. Vi hjelper deg a fa ut mer av systemet.

Med venlig hilsen,
FlowPilot-teamet` },
      { day: 12, subject: 'Kun 2 dager igjen av prøveperioden', preview: 'Slik fortsetter du etter trial...', body: `Hei [Fornavn],

Prøveperioden din utloper om 2 dager.

For a beholde tilgangen og ikke miste dataene dine, oppgrader til en betalt plan:

Starter – 1 290 kr/mnd (passer for deg alene)
Pro – 2 590 kr/mnd (mest populert, ubegrenset fakturaer + kampanjer)

Om du vil snakke med noen forst — ring oss pa [telefon] eller svar pa denne e-posten.

Sett opp betaling her: [LENKE]

FlowPilot-teamet` },
      { day: 14, subject: 'Prøveperioden er over — slik beholder du alt', preview: 'Siste sjanse...', body: `Hei [Fornavn],

Prøveperioden din utloper i dag.

For a beholde:
- Alle leadene dine
- Fakturahistorikk
- Skjemaer og innstillinger

Aktiver ditt abonnement na: [LENKE]

Har det vaert noe som ikke fungerte? Vi vil gjerne hore det — svar pa denne e-posten om du velger a ikke fortsette.

FlowPilot-teamet` },
    ],
  },
  {
    id: 'churn',
    name: 'Churn-redning',
    description: 'Oppdager inaktive brukere og prover a redde dem for kansellering.',
    trigger: 'Trigger: 7+ dager uten innlogging',
    icon: TrendingDown,
    color: 'text-red-700',
    bg: 'bg-red-100',
    active: false,
    steps: [
      { day: 0, subject: 'Vi har ikke sett deg pa en stund', preview: 'Alt ok?', body: `Hei [Fornavn],

Vi har lagt merke til at du ikke har vaert inne pa FlowPilot pa noen dager.

Er det noe vi kan hjelpe med? Kanskje:
- Det er noe som ikke funker som det skal?
- Du er usikker pa hvordan du bruker en funksjon?
- Du trenger hjelp a komme i gang?

Svar pa denne e-posten — sa fikser vi det.

FlowPilot-teamet` },
      { day: 7, subject: 'Gratis gjennomgang av kontoen din', preview: 'Vi hjelper deg a komme i gang pa nytt', body: `Hei [Fornavn],

Vi tilbyr alle inaktive kunder en gratis 15-minutters gjennomgang.

Vi viser deg:
- De 3 tingene som gir deg mest igjen for tida
- Hvordan du setter opp automatisk oppfølging
- Hva andre i din bransje gjor

Book en tid her: [LENKE]

FlowPilot-teamet` },
      { day: 14, subject: 'Siste tilbud til deg som abonnent', preview: 'Eksklusivt tilbud', body: `Hei [Fornavn],

Fordi du er abonnent og vi onsker deg suksess, tilbyr vi deg en maned gratis hvis du booker en gjennomgang med oss innen fredag.

Svar pa denne e-posten for a losse inn tilbudet.

FlowPilot-teamet` },
    ],
  },
  {
    id: 'welcome',
    name: 'Ny kunde — velkommen',
    description: 'Onboarding-serie for nye betalende kunder. Maks verdihenting fra dag 1.',
    trigger: 'Trigger: forste betaling registrert',
    icon: Star,
    color: 'text-emerald-700',
    bg: 'bg-emerald-100',
    active: false,
    steps: [
      { day: 0, subject: 'Velkommen som kunde — her er det du trenger', preview: 'Alt pa ett sted', body: `Hei [Fornavn],

Du er na offisielt FlowPilot-kunde. Takk for tilliten.

Her er en rask oversikt over det viktigste:

Dashboardet: Din oversikt over alt
Leads: Alle henvendelser samlet
Fakturaer: Send og spor betalinger
AI-assistent: Hjelp med tekster og strategi

Har du behov for opplaring? Vi tilbyr gratis onboarding-samtale. Book her: [LENKE]

FlowPilot-teamet` },
      { day: 3, subject: 'Den funksjonen de fleste glemmer', preview: 'Sett opp dette i dag', body: `Hei [Fornavn],

Den funksjonen som gir mest igjen — og som de fleste glemmer a sette opp — er Smart Oppfølging.

Den sender automatisk SMS og e-post til leads som ikke svarer.

Sett det opp under Salg → Smart Oppfølging. Det tar 5 minutter.

FlowPilot-teamet` },
    ],
  },
  {
    id: 'upsell',
    name: 'Upsell til Pro',
    description: 'Guider Starter-kunder til a oppgradere til Pro nar de nærmer seg grenser.',
    trigger: 'Trigger: 80% av lead-grense brukt',
    icon: BarChart3,
    color: 'text-purple-700',
    bg: 'bg-purple-100',
    active: false,
    steps: [
      { day: 0, subject: 'Du nærmer deg grensen din', preview: 'Hva skjer nar du nar maks?', body: `Hei [Fornavn],

Du har na brukt over 80% av lead-kvoten din denne maneden.

Nar du nar 100 leads, slutter nye leads a komme inn — og du mister potensielle kunder.

For a unnga dette, oppgrader til Pro — det gir deg 500 leads/mnd, ubegrenset fakturaer og automatiske kampanjer.

Se Pro-planen: [LENKE]

FlowPilot-teamet` },
      { day: 3, subject: 'Slik tjener Pro-kunder 40% mer', preview: 'Reelle tall fra kunder', body: `Hei [Fornavn],

Pro-kunder bruker i gjennomsnitt 3 funksjoner Starter ikke har:
- Automatiske kampanjer til eksisterende kunder
- Lead ROI-sporing (vet hva som loner seg)
- Ubegrenset fakturaer og prosjekter

Oppgrader neste betaling: [LENKE]

FlowPilot-teamet` },
    ],
  },
  {
    id: 'winback',
    name: 'Gjenvin tidligere kunder',
    description: 'Kontakter kunder som kansellerte for 30+ dager siden med nytt tilbud.',
    trigger: 'Trigger: 30 dager etter kansellering',
    icon: Users,
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    active: false,
    steps: [
      { day: 0, subject: 'Vi savner deg — og vi har forbedret oss', preview: 'Hva er nytt i FlowPilot', body: `Hei [Fornavn],

Siden du forlot oss har vi lagt til [OPPDATERINGER].

Mange av de tingene du kanskje manglet da er na laget.

Vil du prove igjen — vi tilbyr deg 1 maned til halv pris: [KODE]

FlowPilot-teamet` },
    ],
  },
];

export default function EmailSequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>(SEQUENCES);
  const [selected, setSelected] = useState<Sequence>(SEQUENCES[0]);
  const [previewStep, setPreviewStep] = useState<EmailStep | null>(null);
  const [copied, setCopied] = useState('');

  const toggleActive = (id: SequenceType) => {
    setSequences(p => p.map(s => s.id === id ? { ...s, active: !s.active } : s));
    setSelected(prev => prev.id === id ? { ...prev, active: !prev.active } : prev);
  };

  const copyBody = (body: string, key: string) => {
    navigator.clipboard.writeText(body).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Mail className="h-5 w-5 text-blue-500" />
          <h1 className="text-2xl font-bold text-slate-900">E-postsekvenser</h1>
        </div>
        <p className="text-slate-500 text-sm">Automatiske e-postrekker som følger opp, selger og redder churn — uten at du trenger a lofte en finger.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sequence list */}
        <div className="space-y-2">
          {sequences.map(s => {
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={() => setSelected(s)}
                className={`w-full rounded-xl border p-4 text-left transition ${selected.id === s.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-200'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`h-8 w-8 flex-shrink-0 rounded-lg flex items-center justify-center ${s.bg}`}>
                    <Icon className={`h-4 w-4 ${s.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.steps.length} e-poster</p>
                  </div>
                  <div className={`h-2 w-2 rounded-full flex-shrink-0 ${s.active ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                </div>
                <p className="text-xs text-slate-400 truncate">{s.trigger}</p>
              </button>
            );
          })}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">{selected.name}</h2>
                <p className="text-sm text-slate-500 mt-1">{selected.description}</p>
                <p className="text-xs text-slate-400 mt-2">{selected.trigger}</p>
              </div>
              <button onClick={() => toggleActive(selected.id)}
                className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${selected.active ? 'bg-emerald-100 text-emerald-700 hover:bg-red-100 hover:text-red-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                {selected.active ? 'Aktiv' : 'Aktiver'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {selected.steps.map((step, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    D{step.day}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{step.subject}</p>
                    <p className="text-xs text-slate-500">{step.preview}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setPreviewStep(previewStep?.day === step.day ? null : step)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition flex items-center gap-1">
                      <Eye className="h-3 w-3" /> Vis
                    </button>
                    <button onClick={() => copyBody(step.body, `${selected.id}-${step.day}`)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition flex items-center gap-1 ${copied === `${selected.id}-${step.day}` ? 'bg-emerald-100 text-emerald-700' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      {copied === `${selected.id}-${step.day}` ? <><CheckCircle className="h-3 w-3" /> Kopiert</> : <><Copy className="h-3 w-3" /> Kopier</>}
                    </button>
                  </div>
                </div>
                {previewStep?.day === step.day && (
                  <div className="border-t border-slate-100 px-4 pb-4">
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans mt-3 bg-slate-50 rounded-lg p-4">{step.body}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
