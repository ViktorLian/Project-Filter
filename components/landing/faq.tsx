'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: 'Kan jeg avslutte når som helst?',
    a: 'Ja, det er ingen binding eller langtidskontrakter. Du kan avslutte direkte fra dashboardet.',
  },
  {
    q: 'Er dataene mine sikre?',
    a: 'Ja. Vi bruker kryptering på banknivå via Supabase. Dataene dine deles aldri med tredjeparter og lagres i Europa.',
  },
  {
    q: 'Tilbyr dere gratis prøveperiode?',
    a: 'Ja, 14 dager helt gratis – ingen kredittkort nødvendig. Full tilgang til alt fra dag én.',
  },
  {
    q: 'Hva er "Business Nervous System"?',
    a: 'Det er FlowPilots sanntids-overvåkingssystem – et live dashboard over salg, drift, cash og risiko. Tenk Bloomberg, bare for din bedrift. Inkludert i Enterprise-planen.',
  },
  {
    q: 'Hva er Profit Intelligence Layer?',
    a: 'En modul som analyserer marginene dine per jobbtype, identifiserer hvor du taper penger og gir deg 5 kalibrerte spaker for systematisk økt fortjeneste. Inkludert i Pro og Enterprise.',
  },
  {
    q: 'Hva betyr "Self-Healing Company"?',
    a: 'FlowPilot oppdager friksjon og problemer automatisk – ubesvarte leads, forsinkede fakturaer, overbelastet kapasitet – og foreslår eller iverksetter auto-fixes. Bedriften reparerer seg selv.',
  },
  {
    q: 'Kan jeg importere eksisterende data?',
    a: 'Ja, CSV-import og manuell skriving støttes. Vi har også en onboarding-assistent som hjelper deg å komme i gang raskt.',
  },
  {
    q: 'Hva inngår i prøveperioden?',
    a: 'Full tilgang til alle funksjoner din plan inkluderer i 14 dager. Ingen skjulte begrensninger.',
  },
  {
    q: 'Hvilke betalingsmåter godtar dere?',
    a: 'Alle vanlige kort via Stripe. Sikker og rask betaling. Vi planlegger også EHF/faktura for bedrifter.',
  },
  {
    q: 'Hvor mange moduler finnes i FlowPilot?',
    a: 'Over 50 moduler per februar 2026 – fra lead-håndtering og fakturering til Crisis-Proof Architecture og Market Domination Engine. Vi legger til nye systemer fortløpende.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Ofte stilte spørsmål</h2>
          <p className="mt-3 text-slate-500">Alt du lurer på – svart raskt.</p>
        </div>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={item.q}
              className={`rounded-2xl border bg-white transition-all ${open === i ? 'border-blue-200 shadow-md' : 'border-slate-200'}`}
            >
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-semibold text-slate-900 text-sm sm:text-base">{item.q}</span>
                {open === i ? (
                  <ChevronUp className="h-4 w-4 text-blue-500 flex-shrink-0 ml-3" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0 ml-3" />
                )}
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-slate-600 leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


