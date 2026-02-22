export function FAQ() {
  const items = [
    ['Kan jeg avslutte når som helst?', 'Ja, det er ingen binding eller langtidskontrakter.'],
    ['Er dataene mine sikre?', 'Ja. Vi bruker kryptering på banknivå via Supabase og Stripe.'],
    ['Tilbyr dere gratis prøveperiode?', 'Ja, 14 dager gratis – ingen kredittkort nødvendig.'],
    ['Kan jeg importere eksisterende data?', 'Ja, CSV-import er støttet.'],
    ['Hvilke betalingsmåter godtar dere?', 'Alle vanlige kort via Stripe. Sikker og rask betaling.'],
    ['Er det noe oppstartsgebyr?', 'Nei. Du kommer i gang med en gang – ingenting å betale før prøveperioden er over.'],
    ['Hva inngår i prøveperioden?', 'Full tilgang til alle funksjoner i 14 dager. Ingen begrensninger.'],
    ['Hvor får jeg support?', 'Via e-post og kontaktskjemaet under. Vi svarer raskt.'],
  ]

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-3xl font-semibold text-center text-slate-900">Ofte stilte spørsmål</h2>
        <div className="mt-10 space-y-4">
          {items.map(([q, a]) => (
            <div key={q} className="rounded-lg border bg-white p-5">
              <p className="font-semibold text-slate-900">{q}</p>
              <p className="mt-2 text-sm text-slate-600">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

