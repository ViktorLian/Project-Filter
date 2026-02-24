'use client';
import { useState } from 'react';
import {
  X, Target, ClipboardList, Mail, Map, Receipt, BarChart3,
  Bot, Calendar, Send, Star, Award, RefreshCw,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Target,
    title: 'AI Lead-scoring',
    tag: 'Alle planer',
    tagColor: 'bg-emerald-100 text-emerald-700',
    short: 'Ranger leads automatisk fra 0–100 basert på kontaktinfo, svardata og atferd.',
    long: `Hvert lead du mottar får automatisk en score fra 0 til 100. Scoren beregnes basert på:
• Kvaliteten på kontaktinformasjon (navn, e-post, telefon)
• Svarene på leadskjemaet
• Bedriftse-post vs. privatadresse
• Tidspunkt og hastighet for innsending

Med AI-scoring vet du alltid hvilke leads du skal ringe først – og slipper å kaste bort tid på kalde leads.`,
  },
  {
    icon: ClipboardList,
    title: 'Tilpassede leadskjemaer',
    tag: 'Alle planer',
    tagColor: 'bg-emerald-100 text-emerald-700',
    short: 'Bygg profesjonelle skjemaer med drag-and-drop og embed dem på din nettside.',
    long: `Lag unbegrenset antall skjemaer tilpasset akkurat din bransje. Du velger selv:
• Hvilke felt som skal være med
• Logikk og betingede spørsmål
• Farger, logo og design
• Takkemelding etter innsending

Skjemaene kan embedes direkte på nettsiden din med én linje kode, eller deles som direktelenke.`,
  },
  {
    icon: Mail,
    title: 'Automatiske e-postsvar',
    tag: 'Alle planer',
    tagColor: 'bg-emerald-100 text-emerald-700',
    short: 'Send profesjonelle svar til nye leads automatisk – mens du sover.',
    long: `Når et nytt lead kommer inn sender FlowPilot automatisk en e-post til:
• Kunden – med bekreftelse på at de er mottatt
• Deg – med varsel om ny lead (inkl. score og kontaktinfo)

Høykvalitetsleads (score ≥ 75) får en egen fremhevet varsel-e-post med full kontaktinfotabell, slik at du kan reagere innen 2 timer – noe som 3x øker sjansen for å vinne jobben.`,
  },
  {
    icon: Map,
    title: 'Google Maps Leads',
    tag: 'Pro & Enterprise',
    tagColor: 'bg-blue-100 text-blue-700',
    short: 'Finn potensielle kunder lokalt med Google Maps-integrasjon og eksporter til CRM.',
    long: `Søk etter bedrifter i ditt område direkte fra dashboardet:
• Søk på bransje + by (f.eks. "rørlegger Oslo")
• Se navn, adresse, telefon og score
• Legg til interessante kontakter direkte til lead-listen din
• Filtrer på bransje og relevans

Perfekt for kalde prospekteringskampanjer – uten å forlate FlowPilot.`,
  },
  {
    icon: Receipt,
    title: 'Faktura-generator',
    tag: 'Alle planer',
    tagColor: 'bg-emerald-100 text-emerald-700',
    short: 'Lag og send profesjonelle fakturaer med MVA og KID-nummer på sekunder.',
    long: `Generer norske fakturaer som oppfyller alle krav:
• Automatisk KID-nummer (MOD10/MOD11)
• MVA-beregning (0%, 12%, 15%, 25%)
• PDF-eksport klar til sending
• Kundebase med historikk
• Forfallsdato og betalingsstatus
• Starter: 20 fakturaer/mnd · Pro/Enterprise: ubegrenset`,
  },
  {
    icon: BarChart3,
    title: 'Kontantstrøm & Fortjeneste',
    tag: 'Alle planer',
    tagColor: 'bg-emerald-100 text-emerald-700',
    short: 'Hold full oversikt over inntekter, utgifter og fortjeneste per jobb.',
    long: `Aldri bli overrasket av kontantstrømmen igjen:
• Registrer inntekter og utgifter per jobb
• Se fortjenestemargin per prosjekt
• Månedlig oversikt med grafer
• Kategoriser utgifter (materiell, transport, underentreprenør)
• Eksporter for regnskapsfører`,
  },
  {
    icon: Bot,
    title: 'AI Salgsassistent',
    tag: 'Alle planer',
    tagColor: 'bg-emerald-100 text-emerald-700',
    short: 'Få AI til å skrive oppfølgingse-poster, salgspitches og møteplaner for deg.',
    long: `Din personlige salgassistent, alltid tilgjengelig:
• Skriv profesjonelle oppfølgingse-poster på norsk
• Generer salgspitches tilpasset hver kunde
• Lag møteagendaer og forberedelsesnotater
• Analyser salgsmuligheter
• Forslag til prising og strategi

Drevet av OpenAI GPT-4o – rask, presis og alltid tilgjengelig.`,
  },
  {
    icon: Calendar,
    title: 'Kalender & Bookingsystem',
    tag: 'Pro & Enterprise',
    tagColor: 'bg-blue-100 text-blue-700',
    short: 'Planlegg jobber, befaringer og møter med automatiske påminnelser.',
    long: `Aldri gå glipp av en booking igjen:
• Kalendervisning (dag/uke/måned)
• Registrer kunde, tidspunkt og type jobb
• Tildel til spesifik ansatt
• E-postvarsler ved nye bookinger
• No-show varsling
• Google Kalender-integrasjon (Pro)`,
  },
  {
    icon: Send,
    title: 'E-postkampanjer',
    tag: 'Pro & Enterprise',
    tagColor: 'bg-blue-100 text-blue-700',
    short: 'Send målrettede e-postkampanjer til leads og kunder med ett klikk.',
    long: `Hold kontakten med hele kundebasen din:
• Lag kampanjer med HTML-editor eller maler
• Segmenter mottakere (alle leads, kunder, etc.)
• Planlegg utsending på riktig tidspunkt
• Spor åpningsrater og klikk
• Automatiske oppfølgingssekvenser`,
  },
  {
    icon: Star,
    title: 'Tilbakemeldinger & Attester',
    tag: 'Alle planer',
    tagColor: 'bg-emerald-100 text-emerald-700',
    short: 'Samle inn kundeanmeldelser automatisk og vis dem på nettsiden din.',
    long: `Bygg omdømme på autopilot:
• Send automatisk kundeundersøkelse etter fullført jobb
• NPS-score og stjerne-rating
• Godkjenn de beste og vis dem på nettsiden som attester
• Del på Google og Facebook med ett klikk
• Statistikk over gjennomsnittlig tilfredshet`,
  },
  {
    icon: Award,
    title: 'Vinn/Tap-analyse & ROI',
    tag: 'Pro & Enterprise',
    tagColor: 'bg-blue-100 text-blue-700',
    short: 'Forstå hvorfor du vinner og taper jobber – og optimaliser salgsprosessen.',
    long: `Datadrevet innsikt i salgsprosessen:
• Registrer vunne og tapte leads med årsak
• Se konverteringsrate per skjema og kanal
• ROI per leadkilde (hva koster en lead vs. hva den er verdt)
• Identifiser vanligste innvendinger
• Sammenlign perioder og finn trender`,
  },
  {
    icon: RefreshCw,
    title: 'Gjentakende Bookinger & CRM',
    tag: 'Pro & Enterprise',
    tagColor: 'bg-blue-100 text-blue-700',
    short: 'Hold oversikt over alle kunder og automatiser gjentakende oppdrag.',
    long: `Mini-CRM for håndverkere og servicebedrifter:
• Full kundeoversikt med historikk
• Registrer gjentakende tjenester (plenklipping, vask, service)
• Automatisk påminnelse til deg og kunden når neste jobb nærmer seg
• Kundetier (VIP, fast, ny)
• Totalt omsetning per kunde
• Notatfelt for viktig kundeinformasjon`,
  },
];

export function Features() {
  const [active, setActive] = useState<number | null>(null);
  const feature = active !== null ? FEATURES[active] : null;

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block mb-3 rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
            Alt du trenger
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            12 kraftige verktøy i én plattform
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            FlowPilot samler alt du trenger for å drive og vokse en servicebedrift. Klikk på et verktøy for å se detaljer.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="group text-left rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="font-semibold text-slate-800 text-sm leading-snug mb-2 group-hover:text-blue-700 transition-colors">
                {f.title}
              </div>
              <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${f.tagColor}`}>
                {f.tag}
              </span>
            </button>
            );
          })}
        </div>

        {/* Modal */}
        {feature && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setActive(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setActive(null)}
                className="absolute top-4 right-4 rounded-full p-1 hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                {(() => { const FIcon = feature.icon; return <FIcon className="h-6 w-6 text-blue-600" />; })()}
              </div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${feature.tagColor}`}>
                  {feature.tag}
                </span>
              </div>
              <p className="text-slate-500 text-sm mb-4">{feature.short}</p>
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {feature.long}
              </div>
              <a
                href="/register"
                className="mt-5 flex w-full items-center justify-center rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                Prøv {feature.title} gratis i 14 dager →
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
