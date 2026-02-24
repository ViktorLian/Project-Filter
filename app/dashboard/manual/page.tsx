'use client';

import { useState } from 'react';
import {
  BookOpen, FileText, Users, DollarSign, Brain, Calendar, Globe,
  ChevronDown, ChevronRight, CheckCircle, AlertCircle, Receipt, Play, Bot
} from 'lucide-react';

type Section = {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  videoUrl?: string;
  videoDisclaimer?: string;
  steps: { title: string; desc: string; tip?: string }[];
};

const SECTIONS: Section[] = [
  {
    id: 'start', title: 'Kom i gang', icon: CheckCircle, color: 'text-emerald-600',
    videoUrl: 'https://iktagder-my.sharepoint.com/personal/edu7644376_agderskolen_no/_layouts/15/embed.aspx?UniqueId=8e98793f-04fc-4ce8-a75d-59e944088364',
    videoDisclaimer: 'Navn og e-post brukt i demoen er kun for demonstrasjonsformål.',
    steps: [
      { title: '1. Fyll inn firmainformasjon', desc: 'Gå til Innstillinger og fyll inn firmanavn, adresse, organisasjonsnummer og faktura-e-post. Dette brukes på PDF-fakturaer.' },
      { title: '2. Sett opp bank og KID', desc: 'I Innstillinger under "Faktura-innstillinger", legg inn kontonummer og KID-prefiks. KID genereres automatisk fra disse verdiene.', tip: 'KID-prefiks er vanligvis årstall, f.eks. 2026' },
      { title: '3. Inviter teamet', desc: 'Du kan invitere kollegaer fra Innstillinger-siden. Hvert medlem får tilgang til dashboardet.' },
    ],
  },
  {
    id: 'leads', title: 'Leads og skjemaer', icon: FileText, color: 'text-blue-600',
    videoUrl: '',
    steps: [
      { title: 'Opprett et innhentingsskjema', desc: 'Gå til Skjemaer og klikk "Nytt skjema". Legg til spørsmål som hjelper deg kvalifisere kunder. Du får en unik URL du kan legge på nettsiden din.' },
      { title: 'Del skjema-linken', desc: 'Del lenken på nettside, e-post eller sosiale medier. Når noen fyller ut, dukker de opp som leads i dashboardet automatisk.', tip: 'Lenkeformat: /forms/ditt-firma/skjema-navn' },
      { title: 'Kvalifiser leads', desc: 'Gå til Leads. Hvert lead har en score basert på svarene. Bla gjennom og sett status: Ny, Kontaktet, Akseptert eller Avvist.' },
      { title: 'Automatisk oppfølging', desc: 'Aktiver Smart Oppfølging for automatiske e-poster når en lead ikke har hørt fra deg på X dager.' },
    ],
  },
  {
    id: 'invoices', title: 'Fakturaer og PDF', icon: Receipt, color: 'text-orange-600',
    videoUrl: '',
    steps: [
      { title: 'Opprett faktura', desc: 'Gå til Fakturaer og klikk "Ny faktura". Fyll inn kundenavn, e-post, beløp og forfallsdato. KID genereres automatisk.' },
      { title: 'Generer PDF', desc: 'Klikk PDF-knappen ved siden av fakturaen. En utskriftsvennlig side åpnes — velg "Skriv ut som PDF" i nettleseren.', tip: 'For å spare PDF: Ctrl+P → Velg "Lagre som PDF" (Chrome/Edge)' },
      { title: 'KID-nummer', desc: 'KID konstrueres automatisk fra prefiks (fra innstillinger) + fakturanummer + kontrollsiffer. Eksempel: 2026 + 00001 + 3 = 20260000013.', tip: 'Sett KID-prefiks i Innstillinger for at det skal fungere korrekt' },
      { title: 'Oppdater betalingsstatus', desc: 'Når kunden betaler, endre status til "Betalt" i dropdown-menyen på fakturalinjen.' },
    ],
  },
  {
    id: 'customers', title: 'Kundehåndtering', icon: Users, color: 'text-purple-600',
    videoUrl: '',
    steps: [
      { title: 'Legg til kunder', desc: 'Gå til Kunder og klikk "Ny kunde". Fyll inn kontaktinfo. Kunder knyttes til fakturaer og jobber automatisk.' },
      { title: 'Tiernivå', desc: 'Kunder får automatisk tier-nivå (Standard / VIP) basert på total omsetning. VIP-kunder (over 10 000 kr) vises fremst.' },
      { title: 'Oppfølgingshistorikk', desc: 'Inne på en kunde kan du se alle interaksjoner, noter og historikk. AI kan analysere kundens profil for skreddersydd kommunikasjon.' },
    ],
  },
  {
    id: 'jobs', title: 'Jobber og fortjeneste', icon: DollarSign, color: 'text-yellow-600',
    videoUrl: '',
    steps: [
      { title: 'Opprett en jobb', desc: 'Gå til Jobber og klikk "Ny jobb". Sett inntekt og utgifter for jobben. FlowPilot beregner brutto margin automatisk.' },
      { title: 'Legg til utgifter', desc: 'Inne på en jobb kan du legge til spesifikke utgifter (materiell, underentreprenører osv.). Margin oppdateres fortløpende.' },
      { title: 'Send tilbakemeldingsundersøkelse', desc: 'Etter fullført jobb, send en 5-spørsmålsundersøkelse til kunden via e-post fra jobboversikten.' },
    ],
  },
  {
    id: 'ai', title: 'AI Verktøy', icon: Brain, color: 'text-purple-600',
    videoUrl: '',
    steps: [
      { title: 'AI Salgsassistent', desc: 'Chat med AI assistenten for å få hjelp med e-poster, salgsargumenter, møteplaner og mer. Krever OpenAI API-nøkkel i innstillinger.' },
      { title: 'AI CRM Autofill', desc: 'Gi AI besøk- eller samtaleinformasjon, og den fyller ut CRM automatisk med notater, status og neste steg.' },
      { title: 'Møteoppsummering', desc: 'Skriv inn hva som ble diskutert på et møte. AI lager sammendrag, to-do liste og neste steg automatisk.' },
      { title: 'Vinn/Tap Analyse', desc: 'Se mønsteret i hvilke saker du vinner og taper, basert på faktiske data fra dine leads og tilbud.' },
    ],
  },
  {
    id: 'chatbot', title: 'Chatbot på din nettside', icon: Bot, color: 'text-blue-600',
    videoUrl: '',
    steps: [
      { title: 'Hva er chatboten?', desc: 'En AI-drevet chat-widget som kan legges inn på din nettside. Den svarer på spørsmål om bedriften din og hjelper med å fange leads – automatisk.' },
      { title: 'Sett opp', desc: 'Gå til "Chatbot på nettside" i sidemenyen. Tilpass navn og farge, kopier kodesnippet, og lim det inn på nettstedet ditt.' },
      { title: 'Trener boten', desc: 'Boten bruker info fra Innstillinger (åpningstider, tjenester, telefon). Jo mer detaljer du legger inn der, desto bedre svar.', tip: 'Fyll ut alle felt under Innstillinger for beste resultat' },
    ],
  },
  {
    id: 'calendar', title: 'Kalender', icon: Calendar, color: 'text-blue-600',
    videoUrl: '',
    steps: [
      { title: 'Legg til hendelse', desc: 'Klikk på en dag i kalenderen eller bruk "Ny hendelse"-knappen. Velg type (Jobb, Møte, Oppfølging, Påminnelse).' },
      { title: 'Varsler', desc: 'Aktiver e-post- og SMS-varsler på hendelsen. Kunden og/eller ditt team varsles automatisk før jobben.' },
      { title: 'Ansvarlig person', desc: 'Sett hvem som er ansvarlig for hver jobb. Nyttig for bedrifter med flere ansatte.' },
    ],
  },
  {
    id: 'forms-embed', title: 'Sett inn skjema på nettsiden din', icon: Globe, color: 'text-teal-600',
    videoUrl: '',
    steps: [
      { title: '1. Finn skjema-lenken', desc: 'Gå til Skjemaer i dashboardet og klikk på skjemaet ditt. Øverst på siden finner du den unike URL-en til skjemaet.', tip: 'Lenkeformat: flowpilot.no/forms/ditt-firma/skjema-navn' },
      { title: '2. Del som direktelenke', desc: 'Kopier URL-en og del den direkte via e-post, SMS, Google My Business-profil, Facebook-side eller Instagram bio. Kundene dine kan fylle ut skjemaet rett i nettleseren sin.' },
      { title: '3. Legg inn som iframe på nettside', desc: 'Lim inn denne koden der du vil at skjemaet skal vises:\n\n<iframe src="https://flowpilot.no/forms/ditt-firma/skjema-navn" width="100%" height="700" frameborder="0" style="border-radius:12px;"></iframe>', tip: 'Bytt ut ditt-firma og skjema-navn med dine egne verdier fra URL-en' },
      { title: '4. Google My Business', desc: 'Gå til Google My Business → Rediger profil → Legg til lenke. Lim inn skjema-URL-en som "Bestill time" eller "Få tilbud".' },
      { title: '5. Facebook og Instagram', desc: 'På Facebook-siden din: Rediger side → Legg til handlingsknapp → "Kontakt oss" → lim inn skjema-lenken.' },
    ],
  },
  {
    id: 'subscription', title: 'Abonnement', icon: Receipt, color: 'text-slate-600',
    videoUrl: '',
    steps: [
      { title: 'Velg plan', desc: 'Gå til Innstillinger → Fakturering for å velge mellom Starter (1 290 kr), Pro (2 590 kr) eller Enterprise (3 990 kr) per måned.' },
      { title: 'Prøveperiode', desc: '14 dager gratis prøveperiode inkludert på alle planer. Kortdetaljer lagres men du belastes ikke de første 14 dagene.' },
      { title: 'Endre plan', desc: 'Du kan oppgradere eller nedgradere når som helst fra Innstillinger-siden. Forandringen trer i kraft umiddelbart.' },
    ],
  },
];

export default function ManualPage() {
  const [open, setOpen] = useState<string | null>('start');

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Brukermanual</h1>
        <p className="text-slate-500 text-sm mt-0.5">Alt du trenger for å komme i gang med FlowPilot</p>
      </div>

      {/* Quick tips */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-800 text-sm">Hurtigtips</p>
            <ul className="mt-2 space-y-1 text-sm text-blue-700">
              <li>For PDF-fakturaer: sett kontonummer og KID-prefiks i Innstillinger først</li>
              <li>For AI-funksjoner: legg til OPENAI_API_KEY i miljøvariabler</li>
              <li>Del skjema-lenken på nettsiden din for å fange leads automatisk</li>
              <li>Bruk Smart Oppfølging for å holde kontakt uten manuelt arbeid</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {SECTIONS.map(section => {
          const Icon = section.icon;
          const isOpen = open === section.id;
          return (
            <div key={section.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : section.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${section.color}`} />
                  </div>
                  <span className="font-semibold text-slate-800">{section.title}</span>
                </div>
                {isOpen ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 px-5 py-4 space-y-4">
                  {/* Video: real embed or placeholder */}
                  {section.videoUrl ? (
                    <div>
                      <div className="rounded-xl overflow-hidden aspect-video w-full bg-black">
                        <iframe
                          src={section.videoUrl}
                          className="w-full h-full"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                          title={`Video: ${section.title}`}
                        />
                      </div>
                      {section.videoDisclaimer && (
                        <p className="mt-1.5 text-xs text-slate-400 italic">{section.videoDisclaimer}</p>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-slate-900 aspect-video flex flex-col items-center justify-center gap-2 select-none">
                      <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                        <Play className="h-6 w-6 text-white/70 ml-1" />
                      </div>
                      <p className="text-white/60 text-sm font-medium">Videoopplæring kommer snart</p>
                      <p className="text-white/30 text-xs">{section.title}</p>
                    </div>
                  )}

                  {section.steps.map((step, i) => (
                    <div key={i} className="pl-3 border-l-2 border-slate-200">
                      <p className="font-semibold text-slate-800 text-sm">{step.title}</p>
                      <p className="text-slate-500 text-sm mt-0.5">{step.desc}</p>
                      {step.tip && (
                        <div className="mt-2 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                          <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                          {step.tip}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Support */}
      <div className="rounded-xl bg-slate-900 p-6 text-white">
        <h3 className="font-bold text-lg mb-2">Trenger du mer hjelp?</h3>
        <p className="text-slate-300 text-sm mb-4">Kontakt oss via kontaktskjemaet  på hovedsiden, eller e-post: Flowpilot@hotmail.com</p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="font-semibold">Responstid</p>
            <p className="text-slate-300 mt-1">Vanligvis innen 24 timer  på hverdager</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="font-semibold">Oppdateringer</p>
            <p className="text-slate-300 mt-1">Nye funksjoner rulles ut jevnlig — sjekk GitHub</p>
          </div>
        </div>
      </div>
    </div>
  );
}
