'use client';

import { useState } from 'react';
import { MessageSquare, Sparkles, ChevronRight, AlertTriangle, CheckCircle, Copy, RefreshCw } from 'lucide-react';

interface CoachResponse {
  opening: string;
  alternatives: string[];
  tactic: string;
  warning: string | null;
}

const QUICK_SCENARIOS = [
  'Kunden sier prisen er for hoy',
  'Kunden vil ha 30% rabatt',
  'Kunden utsetter beslutning igjen',
  'Kunden sammenligner med billigere konkurrent',
  'Kunden vil ha betalingsplan',
  'Kunden truer med a avslutte kontrakten',
];

const DEMO_RESPONSES: Record<string, CoachResponse> = {
  default: {
    opening: `"Jeg forstar at budsjett er en faktor. La meg sporre: hva er det viktigste resultatet du forsoker a oppna med dette prosjektet? [Pause — la de svare]. Basert pa det du sier, tror jeg vi kan justere omfanget slik at du far de viktigste delene innenfor det du har til radighet — uten a ga pa akkord med det som betyr mest."`,
    alternatives: [
      'Tilby a dele prosjektet i faser slik at forste betaling er mindre.',
      'Fremhev hva de IKKE far om de velger et billigere alternativ — vekt risiko.',
      'Bruk referansekundeverdi: "Andre kunder i din situasjon sa at investeringen var tilbakebetalt pa 4 maneder."',
    ],
    tactic: `Forankringseffekt: si alltid hoy pris forst ("Normalt er dette 95 000 kr"), sa presenter realpris ("For deg: 62 000 kr"). Differansen oppleves som gevinst, ikke kostnad.`,
    warning: null,
  },
};

function getResponse(scenario: string, context: string): CoachResponse {
  if (scenario.toLowerCase().includes('rabatt') || context.toLowerCase().includes('rabatt')) {
    return {
      opening: `"Jeg gir sjelden rabatter pa pris — for det reflekterer verdien av arbeidet vi leverer. Men jeg kan absolutt se om vi kan justere omfanget eller prioritere annerledes for a tilpasse dette til budsjettet ditt. Hva er det aller viktigste du ma fa ut av dette?"`,
      alternatives: [
        'Tilby bonus-tjeneste i stedet for rabatt (oppleves som mer verdi, koster deg mindre).',
        'Si ja til rabatt MOT raskere betaling eller lengre kontrakt.',
        'Vi kan fjerne [mindre del] fra omfanget — da blir prisen [redusert pris].',
      ],
      tactic: `Bytt aldri pris mot ingenting. Krev alltid noe tilbake: raskere betaling, referanse, lengre avtaletid, eller redusert omfang. Ellers setter du presedens for fremtidige forhandlinger.`,
      warning: 'Advarsel: En rabatt pa 20% betyr at du ma selge 25% mer bare for a sta pa stedet hvil. Vurder konsekvensene.',
    };
  }
  if (scenario.toLowerCase().includes('utsett') || context.toLowerCase().includes('utsett')) {
    return {
      opening: `"Jeg forstar at timingen ma vaere riktig. Hjelp meg a forsta: hva er det som ma vaere pa plass for at du er klar til a gjenoppta dette? [Pause] I mellomtiden — hva koster det deg a vente ytterligere 30 dager?"`,
      alternatives: [
        'Sett en konkret dato: "La oss planlegge en kortrapport den [dato] — da kan vi se om forutsetningene har endret seg."',
        'Gi dem noe verdifullt gratis i venteperioden (rapport, analyse) for a holde dem engasjert.',
        'Verdsett kostnad ved utsettelse: "Basert pa det du sier, mister du [X kr/mnd] la inntekt per maned dere venter."',
      ],
      tactic: `Utsettelse er sjelden sant — det er oftest et skjult innvending. Still spfrsmalet: "Hva ville fa deg til a si ja i dag?" — svaret avslorer den virkelige innvendingen.`,
      warning: null,
    };
  }
  return DEMO_RESPONSES.default;
}

export default function NegotiationCoachPage() {
  const [scenario, setScenario] = useState('');
  const [context, setContext] = useState('');
  const [response, setResponse] = useState<CoachResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');

  const analyze = async (sc?: string) => {
    const s = sc ?? scenario;
    if (!s.trim()) return;
    setLoading(true);
    if (sc) setScenario(sc);
    await new Promise(r => setTimeout(r, 1600));
    setResponse(getResponse(s, context));
    setLoading(false);
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          <h1 className="text-2xl font-bold text-slate-900">Forhandlingscoach</h1>
        </div>
        <p className="text-slate-500 text-sm">Beskriv situasjonen i et salg eller forhandling, og fa konkrete svar, taktikker og forslag til hva du skal si.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900">Hva er situasjonen?</h2>
          <input value={scenario} onChange={e => setScenario(e.target.value)}
            placeholder="Eks: Kunden sier prisen er for hoy og vil ha 25% rabatt"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400" />
          <textarea value={context} onChange={e => setContext(e.target.value)} rows={3}
            placeholder="Valgfritt: Mer kontekst (bransje, dealstorrelse, relasjon til kunden...)"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 resize-none" />
          <button onClick={() => analyze()} disabled={loading || !scenario.trim()}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><RefreshCw className="h-4 w-4 animate-spin" /> Analyserer...</> : <><Sparkles className="h-4 w-4" /> Fa rad</>}
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Vanlige scenarier</h2>
          <div className="space-y-2">
            {QUICK_SCENARIOS.map(s => (
              <button key={s} onClick={() => analyze(s)}
                className="w-full flex items-center justify-between rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 px-3 py-2.5 text-sm text-slate-700 text-left transition">
                {s}
                <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {response && (
        <div className="space-y-4">
          {/* Opening line */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Foreslatt apningsreplikk</h3>
              </div>
              <button onClick={() => copy(response.opening, 'opening')}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition flex items-center gap-1 ${copied === 'opening' ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-blue-200 text-blue-700 hover:bg-blue-100'}`}>
                {copied === 'opening' ? <><CheckCircle className="h-3 w-3" /> Kopiert</> : <><Copy className="h-3 w-3" /> Kopier</>}
              </button>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed italic">{response.opening}</p>
          </div>

          {/* Alternatives */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Alternative innfallsvinkler</h3>
            <div className="space-y-2">
              {response.alternatives.map((a, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{i + 1}</div>
                  <p className="text-sm text-slate-700 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tactic */}
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">Taktikk a huske</h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{response.tactic}</p>
          </div>

          {/* Warning */}
          {response.warning && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3 items-start">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">{response.warning}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
