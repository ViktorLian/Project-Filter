'use client';

import { Globe, Code, Smartphone, BarChart3, Search, Star, ArrowRight, CheckCircle, Mail, MessageSquare } from 'lucide-react';

const SERVICES = [
  {
    id: 'website',
    icon: Globe,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    title: 'Nettside med FlowPilot integrert',
    price: 'Fra 9 900 kr',
    priceNote: 'Engangsbetaling – inkluderer gratis FlowPilot-integrasjon',
    description: 'Vi bygger en profesjonell nettside for din bedrift som er ferdig integrert med FlowPilot fra dag én. Leadskjemaet ditt er innebygd, og leads havner automatisk i dashboardet ditt.',
    features: [
      'Skreddersydd design for din bransje',
      'Leadskjema innebygd og koblet til FlowPilot',
      'Responsivt – fungerer perfekt på mobil',
      'Google-optimalisert (SEO)',
      'Kontaktskjema og telefon/e-post synlig',
      'Hurtig lasting – under 2 sekunder',
    ],
    cta: 'Be om tilbud',
    popular: true,
  },
  {
    id: 'google',
    icon: Search,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    title: 'Google Ads-kampanje',
    price: 'Fra 4 500 kr/mnd',
    priceNote: 'Oppsett 2 500 kr + månedlig forvaltning',
    description: 'Vi setter opp og forvalter Google Ads-kampanjer som sender lokale kunder rett til leadskjemaet ditt. Kun betaling per klikk fra potensielle kunder.',
    features: [
      'Søkeordanalyse for din bransje og by',
      'Kampanjeoppsett med lokalt målretting',
      'Månedlig rapport og optimalisering',
      'Kobling til FlowPilot leadsskjema',
      'Konkurrentanalyse inkludert',
    ],
    cta: 'Kom i gang',
    popular: false,
  },
  {
    id: 'seo',
    icon: BarChart3,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    title: 'SEO – Organisk synlighet',
    price: 'Fra 3 500 kr/mnd',
    priceNote: 'Minimun 3 måneder',
    description: 'Kom til toppen av Google-søk uten å betale per klikk. Vi optimaliserer nettsiden din og bygger autoritet slik at kunder finner deg organisk.',
    features: [
      'Teknisk SEO-gjennomgang',
      'Innholdsstrategi for lokale søk',
      'Google Business Profile-optimalisering',
      'Månedlig rangeringsrapport',
      'Backlink-bygging',
    ],
    cta: 'Kom i gang',
    popular: false,
  },
  {
    id: 'social',
    icon: Smartphone,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    title: 'Sosiale medier + Meta Ads',
    price: 'Fra 3 900 kr/mnd',
    priceNote: 'Facebook + Instagram inkludert',
    description: 'Profesjonell tilstedeværelse på Facebook og Instagram med annonsering som driver leads til FlowPilot. Innhold lages for deg.',
    features: [
      '4–8 innlegg per måned',
      'Facebook og Instagram Ads-oppsett',
      'Annonsemålretting mot lokale kunder',
      'Lead Ads koblet til FlowPilot',
      'Månedlig statistikkrapport',
    ],
    cta: 'Kom i gang',
    popular: false,
  },
  {
    id: 'reviews',
    icon: Star,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    title: 'Anmeldelsesbooster',
    price: '1 900 kr/mnd',
    priceNote: 'Automatisk via FlowPilot',
    description: 'Automatisk utsendelse av tilbakemeldingsskjema etter fullført jobb. Konverterer fornøyde kunder til Google-anmeldelser og bygger tillit.',
    features: [
      'Automatisk SMS/e-post etter jobb',
      'Direktelenke til Google-anmeldelse',
      'Samle testimonials til nettsiden',
      'Ukentlig rapport på nye anmeldelser',
      'Konfigurasjon i FlowPilot inkludert',
    ],
    cta: 'Aktiver',
    popular: false,
  },
];

export default function TilleggstjenesterPage() {
  function handleCTA(serviceId: string) {
    window.location.href = `mailto:flowpilot@hotmail.com?subject=Interesse for ${SERVICES.find(s => s.id === serviceId)?.title}&body=Hei! Jeg er interessert i tilleggstjenesten "${SERVICES.find(s => s.id === serviceId)?.title}". Kan dere kontakte meg?`;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium mb-4">
          <Star className="h-3.5 w-3.5" />
          Eksklusivt for FlowPilot-kunder
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Tilleggstjenester</h1>
        <p className="text-slate-500 text-base leading-relaxed">
          Vi hjelper deg ikke bare med å administrere bedriften – vi hjelper deg å vokse.
          Alle tjenestene er integrert med FlowPilot og levert av teamet bak plattformen.
        </p>
      </div>

      {/* Services grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SERVICES.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              className={`relative rounded-2xl border-2 bg-white p-6 flex flex-col transition-all hover:shadow-lg ${service.popular ? 'border-blue-400 shadow-md shadow-blue-100' : 'border-slate-200'}`}
            >
              {service.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-bold text-white shadow">
                  Mest populær
                </div>
              )}
              <div className={`h-11 w-11 rounded-xl ${service.bg} flex items-center justify-center mb-4`}>
                <Icon className={`h-5 w-5 ${service.color}`} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{service.title}</h3>
              <div className="mb-3">
                <span className="text-2xl font-extrabold text-slate-900">{service.price}</span>
                <p className="text-xs text-slate-400 mt-0.5">{service.priceNote}</p>
              </div>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">{service.description}</p>
              <ul className="space-y-2 mb-6 flex-1">
                {service.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCTA(service.id)}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition ${service.popular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                {service.cta} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Contact CTA */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">Vil du diskutere hva som passer for din bedrift?</h2>
        <p className="text-blue-100 mb-6">Vi tilbyr gratis 30-minutters konsultasjon for alle FlowPilot-kunder.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="mailto:flowpilot@hotmail.com?subject=Gratis konsultasjon"
            className="flex items-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-50 transition"
          >
            <Mail className="h-4 w-4" /> Send e-post
          </a>
          <a
            href="https://calendly.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-400 transition border border-blue-400"
          >
            <MessageSquare className="h-4 w-4" /> Book møte
          </a>
        </div>
      </div>
    </div>
  );
}
