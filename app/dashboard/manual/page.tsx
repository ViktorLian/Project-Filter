'use client';

import { useState } from 'react';
import {
  BookOpen, FileText, Users, DollarSign, Brain, Calendar, Map, Zap,
  ChevronDown, ChevronRight, CheckCircle, AlertCircle, Receipt
} from 'lucide-react';

type Section = {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  steps: { title: string; desc: string; tip?: string }[];
};

const SECTIONS: Section[] = [
  {
    id: 'start', title: 'Kom i gang', icon: CheckCircle, color: 'text-emerald-600',
    steps: [
      { title: '1. Fyll inn firmainformasjon', desc: 'Ga til Innstillinger og fyll inn firmanavn, adresse, organisasjonsnummer og faktura-e-post. Dette brukes pa PDF-fakturaer.' },
      { title: '2. Sett opp bank og KID', desc: 'I Innstillinger under "Faktura-innstillinger", legg inn kontonummer og KID-prefiks. KID genereres automatisk fra disse verdiene.', tip: 'KID-prefiks er vanligvis arstal, f.eks. 2026' },
      { title: '3. Inviter teamet', desc: 'Du kan invitere kollegaer fra Innstillinger-siden. Hvert medlem far tilgang til dashboardet.' },
    ],
  },
  {
    id: 'leads', title: 'Leads og skjemaer', icon: FileText, color: 'text-blue-600',
    steps: [
      { title: 'Opprett et innhentingsskjema', desc: 'Ga til Skjemaer og klikk "Nytt skjema". Legg til sporsmol som hjelper deg kvalifisere kunder. Du far en unik URL du kan legge pa nettsiden din.' },
      { title: 'Del skjema-linken', desc: 'Del lenken pa nettside, e-post eller sosiale medier. Nar noen fyller ut, dukker de opp som leads i dashboardet automatisk.', tip: 'Lenkeformat: /forms/ditt-firma/skjema-navn' },
      { title: 'Kvalifiser leads', desc: 'Ga til Leads. Hvert lead har en score basert pa svarene. Bla gjennom og sett status: Ny, Kontaktet, Akseptert eller Avvist.' },
      { title: 'Automatisk oppfolging', desc: 'Aktiver Smart Oppfolging for automatiske e-poster nar en lead ikke har hort fra deg pa X dager.' },
    ],
  },
  {
    id: 'invoices', title: 'Fakturaer og PDF', icon: Receipt, color: 'text-orange-600',
    steps: [
      { title: 'Opprett faktura', desc: 'Ga til Fakturaer og klikk "Ny faktura". Fyll inn kundenavn, e-post, belop og forfallsdato. KID genereres automatisk.' },
      { title: 'Generer PDF', desc: 'Klikk PDF-knappen ved siden av fakturaen. En utskriftsvennlig side apnes — velg "Skriv ut som PDF" i nettleseren.', tip: 'For a spare PDF: Ctrl+P → Velg "Lagre som PDF" (Chrome/Edge)' },
      { title: 'KID-nummer', desc: 'KID konstrueres automatisk fra prefiks (fra innstillinger) + fakturanummer + kontrollsiffer. Eksempel: 2026 + 00001 + 3 = 20260000013.', tip: 'Sett KID-prefiks i Innstillinger for at det skal fungere korrekt' },
      { title: 'Oppdater betalingsstatus', desc: 'Nar kunden betaler, endre status til "Betalt" i dropdown-menyen pa fakturalinjen.' },
    ],
  },
  {
    id: 'customers', title: 'Kundehaldning', icon: Users, color: 'text-purple-600',
    steps: [
      { title: 'Legg til kunder', desc: 'Ga til Kunder og klikk "Ny kunde". Fyll inn kontaktinfo. Kunder knyttes til fakturaer og jobber automatisk.' },
      { title: 'Tiernivaa', desc: 'Kunder far automatisk tier-niveau (Standard / VIP) basert pa total omsetning. VIP-kunder (over 10 000 kr) vises fremst.' },
      { title: 'Oppfolgingshistorikk', desc: 'Inne pa en kunde kan du se alle interaksjoner, noter og historikk. AI kan analysere kundens profil for skreddersydd kommunikasjon.' },
    ],
  },
  {
    id: 'jobs', title: 'Jobber og fortjeneste', icon: DollarSign, color: 'text-yellow-600',
    steps: [
      { title: 'Opprett en jobb', desc: 'Ga til Jobber og klikk "Ny jobb". Sett inntekt og utgifter for jobben. FlowPilot beregner brutto margin automatisk.' },
      { title: 'Legg til utgifter', desc: 'Inne pa en jobb kan du legge til spesifikke utgifter (materiell, underentreprenorer osv.). Margin oppdateres fortlopende.' },
      { title: 'Send tilbakemeldingsundersokelse', desc: 'Etter fullfort jobb, send en 5-sporsmalsundersokelse til kunden via e-post fra jobboversikten.' },
    ],
  },
  {
    id: 'ai', title: 'AI Verktoy', icon: Brain, color: 'text-purple-600',
    steps: [
      { title: 'AI Salgsassistent', desc: 'Chat med AI assistenten for a fa hjelp med e-poster, salgsargumenter, moteplaner og mer. Krever OpenAI API-nokkel i innstillinger.' },
      { title: 'AI CRM Autofill', desc: 'Gi AI besok- eller samtaleinformasjon, og den fyller ut CRM automatisk med notater, status og neste steg.' },
      { title: 'Moteoppsummering', desc: 'Skriv inn hva som ble diskutert pa et mote. AI lager sammendrag, to-do liste og neste steg automatisk.' },
      { title: 'Vinn/Tap Analyse', desc: 'Se monsteret i hvilke saker du vinner og taper, basert pa faktiske data fra dine leads og tilbud.' },
    ],
  },
  {
    id: 'calendar', title: 'Kalender', icon: Calendar, color: 'text-blue-600',
    steps: [
      { title: 'Legg til hendelse', desc: 'Klikk pa en dag i kalenderen eller bruk "Ny hendelse"-knappen. Velg type (Jobb, Mote, Oppfolging, Paminnelse).' },
      { title: 'Varsler', desc: 'Aktiver e-post- og SMS-varsler pa hendelsen. Kunden og/eller ditt team varsles automatisk for jobben.' },
      { title: 'Ansvarlig person', desc: 'Sett hvem som er ansvarlig for hver jobb. Nyttig for bedrifter med flere ansatte.' },
    ],
  },
  {
    id: 'subscription', title: 'Abonnement', icon: Receipt, color: 'text-slate-600',
    steps: [
      { title: 'Velg plan', desc: 'Ga til Innstillinger → Fakturering for a velge mellom Starter (1 290 kr), Pro (2 590 kr) eller Enterprise (3 990 kr) per maned.' },
      { title: 'Proveperiode', desc: '14 dager gratis proveperiode inkludert pa alle planer. Ingen kredittkort kreves for a starte.' },
      { title: 'Endre plan', desc: 'Du kan oppgradere eller nedgradere nar som helst fra Innstillinger-siden. Forandringen trer i kraft umiddelbart.' },
    ],
  },
];

export default function ManualPage() {
  const [open, setOpen] = useState<string | null>('start');

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Brukermanual</h1>
        <p className="text-slate-500 text-sm mt-0.5">Alt du trenger for a komme i gang med FlowPilot</p>
      </div>

      {/* Quick tips */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-800 text-sm">Hurtigtips</p>
            <ul className="mt-2 space-y-1 text-sm text-blue-700">
              <li>For PDF-fakturaer: sett kontonummer og KID-prefiks i Innstillinger forst</li>
              <li>For AI-funksjoner: legg til OPENAI_API_KEY i miljovariabler</li>
              <li>Del skjema-linken pa nettsiden din for a fange leads automatisk</li>
              <li>Bruk Smart Oppfolging for a holde kontakt uten manuelt arbeid</li>
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
        <p className="text-slate-300 text-sm mb-4">Kontakt oss via kontaktskjemaet pa hovedsiden, eller e-post: Flowpilot@hotmail.com</p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="font-semibold">Responstid</p>
            <p className="text-slate-300 mt-1">Vanligvis innen 24 timer pa hverdager</p>
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
