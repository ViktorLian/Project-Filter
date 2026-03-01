'use client';

import { useState } from 'react';
import { Mail, Clock, Play, Eye, Copy, CheckCircle, Plus, Star, ArrowRight } from 'lucide-react';

type SequenceType = 'velkomst' | 'oppfolging' | 'anmeldelse' | 'reaktivering' | 'sesong';

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
    id: 'velkomst',
    name: 'Ny kunde – velkomst',
    description: 'Sett i gang forholdet på rett måte fra dag én. Bygg tillit og vis verdi umiddelbart.',
    trigger: 'Trigger: ny kunde opprettet / jobb akseptert',
    icon: Star,
    color: 'text-emerald-700',
    bg: 'bg-emerald-100',
    active: true,
    steps: [
      {
        day: 0,
        subject: 'Takk for at du valgte oss – her er hva som skjer nå',
        preview: 'En kort guide til neste steg...',
        body: `Hei [Fornavn],

Tusen takk for at du valgte oss til jobben. Vi setter stor pris på tilliten!

Her er hva som skjer videre:

1. [Beskriv neste steg i din prosess]
2. [Tidspunkt/dato for oppstart]
3. [Hvem de kan kontakte ved spørsmål]

Du kan alltid nå oss på [telefon] eller svare på denne e-posten.

Vi gleder oss til å hjelpe deg!

Med vennlig hilsen,
[Bedriftsnavn]`,
      },
      {
        day: 1,
        subject: 'Forberedelse – dette trenger vi fra deg',
        preview: 'Litt info fra deg gjør jobben raskere...',
        body: `Hei [Fornavn],

For at vi skal kunne gjøre jobben så effektivt som mulig, trenger vi litt informasjon fra deg:

- [Spørsmål 1]
- [Spørsmål 2]
- [Tilgang / nøkler / annet]

Send oss gjerne bilder eller mer informasjon: [E-post eller lenke]

Takk for hjelpen!

Med vennlig hilsen,
[Bedriftsnavn]`,
      },
      {
        day: 3,
        subject: 'Status på oppdraget ditt',
        preview: 'Her er en oppdatering...',
        body: `Hei [Fornavn],

Vi ønsket bare å ta kontakt og gi deg en oppdatering:

[Beskriv status her – f.eks. “Vi er i rute og planlegger å starte opp [dato].”]

Har du spørsmål eller ønsker? Ta gjerne kontakt.

Med vennlig hilsen,
[Bedriftsnavn]
[Telefon]`,
      },
    ],
  },
  {
    id: 'oppfolging',
    name: 'Jobb fullført – oppfølging',
    description: 'Sikre at kunden er fornøyd, åpne for mersalg og be om videre samarbeid.',
    trigger: 'Trigger: jobb markert som fullført',
    icon: CheckCircle,
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    active: false,
    steps: [
      {
        day: 0,
        subject: 'Jobben er ferdig – er du fornøyd?',
        preview: 'Vi vil gjerne høre fra deg...',
        body: `Hei [Fornavn],

Jobben er nå fullført, og vi håper alt er akkurat slik du ønsket det.

Er det noe du ønsket annerledes, eller noe vi kan forbedre til neste gang?

Og er du fornøyd – da setter vi umistelig stor pris på om du gir oss en anmeldelse:
👉 [LENKE TIL GOOGLE / TRUSTPILOT]

Det tar bare 2 minutter, men betyr enormt mye for oss.

Takk for at du valgte oss!

Med vennlig hilsen,
[Bedriftsnavn]`,
      },
      {
        day: 7,
        subject: 'Trenger du hjelp med noe mer?',
        preview: 'Vi er klare for neste oppdrag...',
        body: `Hei [Fornavn],

En uke har gått siden vi fullførte jobben. Håper alt fungerer som det skal!

Har du lagt merke til noe du vil at vi skal se på? Eller har du planer om andre prosjekter?

Vi hjelper gjerne – det er alltid best å ta kontakt tidlig, så kan vi planlegge godt.

Ring oss på [telefon], eller svar på denne e-posten.

Med vennlig hilsen,
[Bedriftsnavn]`,
      },
      {
        day: 30,
        subject: 'Sjekk etter en måned – alt ok?',
        preview: 'En liten sjekk fra oss...',
        body: `Hei [Fornavn],

En måned har gått siden vi gjorde jobben hos deg. Vi tar en liten sjekk:

Alt fungerer som det skal? Ingen problemer eller spørsmål?

Hvis du trenger noe – enten det er service, vedlikehold eller et nytt prosjekt – er vi bare et kall unna.

[Telefon] | [E-post]

Med vennlig hilsen,
[Bedriftsnavn]`,
      },
    ],
  },
  {
    id: 'anmeldelse',
    name: 'Be om anmeldelse',
    description: 'Automatisk forespørsel om Google-anmeldelse til fornøyde kunder.',
    trigger: 'Trigger: 2 dager etter fullført jobb',
    icon: Star,
    color: 'text-yellow-700',
    bg: 'bg-yellow-100',
    active: false,
    steps: [
      {
        day: 2,
        subject: '[Fornavn], kan du hjelpe oss med en anmeldelse?',
        preview: 'Det tar bare 2 minutter...',
        body: `Hei [Fornavn],

Vi håper du er fornøyd med jobben vi gjorde for deg!

Vi er en liten bedrift, og anmeldelser fra fornøyde kunder betyr enormt mye for oss. Vil du ta deg 2 minutter til å skrive en kort anmeldelse?

👉 Klikk her: [LENKE TIL GOOGLE]

Det trenger ikke være langt – selv en stjerne og en linje gjør stor forskjell.

Tusen takk på forhånd!

Med vennlig hilsen,
[Bedriftsnavn]`,
      },
      {
        day: 7,
        subject: 'Husk anmeldelsen – det hjelper oss masse',
        preview: 'Husker du å gi oss en anmeldelse?',
        body: `Hei [Fornavn],

Vi sendte deg en forespørsel for noen dager siden – kanskje den druknet i innboksen?

Hvis du er fornøyd med jobben vi gjorde, setter vi stor pris på om du tar deg tid:

👉 [LENKE TIL GOOGLE]

Takk uansett – og ikke nøl med å kontakte oss ved behov!

Med vennlig hilsen,
[Bedriftsnavn]`,
      },
    ],
  },
  {
    id: 'reaktivering',
    name: 'Inaktiv kunde – reaktivering',
    description: 'Vekk opp kunder du ikke har hørt fra på 60+ dager.',
    trigger: 'Trigger: 60 dager siden siste kontakt',
    icon: ArrowRight,
    color: 'text-purple-700',
    bg: 'bg-purple-100',
    active: false,
    steps: [
      {
        day: 0,
        subject: 'Hei [Fornavn] – det er en stund siden vi snakket',
        preview: 'Vi tenkte på deg...',
        body: `Hei [Fornavn],

Det er en god stund siden vi sist hørtes – og vi ønsket bare å ta kontakt og si hei.

Har du noen prosjekter på gang? Ting du har tenkt å fikse, men ikke fått gjort noe med ennå?

Vi er her når du trenger oss – bare ta kontakt så ser vi på det sammen.

[Telefon] | [E-post]

Med vennlig hilsen,
[Bedriftsnavn]`,
      },
      {
        day: 7,
        subject: 'Sesongsjekk – bør du bestille nå?',
        preview: 'Ikke vent for lenge...',
        body: `Hei [Fornavn],

Mange av kundene våre bestiller [tjenestetype] nå i [sesong/måned] – og vi begynner å bli godt booket.

Bruker du oss igjen i år? Da er det lurt å melde seg opp tidlig så vi kan sette av tid til deg.

Svar på denne e-posten eller ring oss på [telefon].

Med vennlig hilsen,
[Bedriftsnavn]`,
      },
      {
        day: 21,
        subject: 'Et eksklusivt tilbud til deg som eksisterende kunde',
        preview: 'Kun for deg...',
        body: `Hei [Fornavn],

Fordi du er kunde hos oss, ønsker vi å gi deg et eksklusivt tilbud:

[BESKRIV TILBUDET – rabatt, gratis tillegg, prioritert booking, etc.]

Tilbudet gjelder til [DATO].

Ta kontakt for å benytte deg av det:
[Telefon] | [E-post]

Med vennlig hilsen,
[Bedriftsnavn]`,
      },
    ],
  },
  {
    id: 'sesong',
    name: 'Sesongkampanje',
    description: 'Send til hele kundelisten din ved sesongstart, høytider eller kampanjer.',
    trigger: 'Trigger: manuell utsending / dato-basert',
    icon: Mail,
    color: 'text-rose-700',
    bg: 'bg-rose-100',
    active: false,
    steps: [
      {
        day: 0,
        subject: '[Sesong] er her – bestill mens det er ledig!',
        preview: 'Vi har åpnet kalenderen...',
        body: `Hei [Fornavn],

[Sesong/periode] er i gang, og vi har åpnet opp for bestillinger!

[Beskriv hva dere tilbyr i sesongen]

Vi blir fort fullbooket – så ikke vent for lenge.

Book din plass: [LENKE] eller ring oss på [telefon].

Med vennlig hilsen,
[Bedriftsnavn]`,
      },
      {
        day: 5,
        subject: 'Siste ledige plasser for [sesong]',
        preview: 'Knapt med tid igjen...',
        body: `Hei [Fornavn],

Vi har noen få ledige plasser igjen for [sesong/periode].

Vil du sikre deg en tid? Ta kontakt nå:

📞 [Telefon]
📬 Svar på denne e-posten
🌐 [Bestillingslenke]

Med vennlig hilsen,
[Bedriftsnavn]`,
      },
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
        <p className="text-slate-500 text-sm">Ferdige e-postsekvenser du kan tilpasse og sende til kundene dine. Velg en mal, rediger teksten og aktiver automatisk utsending.</p>
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
