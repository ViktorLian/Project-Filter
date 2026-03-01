import Link from 'next/link';

export const metadata = { title: 'Personvernserklæring – FlowPilot', description: 'Se hvordan FlowPilot behandler dine personopplysninger i samsvar med GDPR.' };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">← Tilbake til forsiden</Link>
          <h1 className="text-4xl font-black text-slate-900 mb-3">Personvernserklæring</h1>
          <p className="text-slate-500 text-sm">Sist oppdatert: 1. mars 2026 · Gjelder for FlowPilot (flowpilot.no)</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-10 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Behandlingsansvarlig</h2>
            <p>FlowPilot er behandlingsansvarlig for behandlingen av personopplysninger som beskrevet i denne erklæringen.</p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-3 text-sm">
              <p className="font-semibold text-slate-900 mb-1">FlowPilot AS</p>
              <p>Org.nr: [Fyll inn]</p>
              <p>Adresse: [Fyll inn]</p>
              <p>E-post: personvern@flowpilot.no</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Hvilke opplysninger vi samler inn</h2>
            <p>Vi samler inn og behandler følgende kategorier av personopplysninger:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Kontaktopplysninger:</strong> Navn, e-postadresse, telefonnummer, bedriftsnavn og adresse.</li>
              <li><strong>Kontoopplysninger:</strong> Innloggingsinformasjon (e-post og kryptert passord), abonnementsstatus og betalingshistorikk.</li>
              <li><strong>Data du legger inn:</strong> Kundeopplysninger, leads, fakturaer, jobber og notater du selv registrerer i FlowPilot.</li>
              <li><strong>Tekniske data:</strong> IP-adresse, nettlesertype, enhet, operativsystem og tidssone ved bruk av tjenesten.</li>
              <li><strong>Bruksdata:</strong> Hvilke funksjoner du bruker, klikk, sidevisninger og feillogger.</li>
              <li><strong>Betalingsdata:</strong> Betalingsinformasjon behandles av Stripe og lagres ikke direkte hos oss.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Formål og rettslig grunnlag</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Formål</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Rettslig grunnlag (GDPR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['Levere og drifte FlowPilot-tjenesten', 'Avtale (art. 6 nr. 1 b)'],
                    ['Fakturering og betalingsbehandling', 'Avtale (art. 6 nr. 1 b)'],
                    ['Kundeservice og teknisk support', 'Berettiget interesse (art. 6 nr. 1 f)'],
                    ['Sikkerhetsovervåking og feilretting', 'Berettiget interesse (art. 6 nr. 1 f)'],
                    ['Produktforbedring og statistikk (anonymisert)', 'Berettiget interesse (art. 6 nr. 1 f)'],
                    ['Informasjon om nye funksjoner og tilbud', 'Samtykke (art. 6 nr. 1 a)'],
                    ['Overholde juridiske forpliktelser (f.eks. bokføring)', 'Rettslig forpliktelse (art. 6 nr. 1 c)'],
                  ].map(([f, r]) => (
                    <tr key={f} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-700">{f}</td>
                      <td className="px-4 py-3 text-slate-600">{r}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Overføring til tredjepart</h2>
            <p>Vi deler opplysninger med betrodde underleverandører som bidrar til å levere tjenesten:</p>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Underleverandør</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Formål</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Land</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['Supabase', 'Database og autentisering', 'AWS EU (Frankfurt)'],
                    ['Stripe', 'Betalingsbehandling', 'USA/EU (Standard Contractual Clauses)'],
                    ['Resend / AWS SES', 'Utsendelse av e-post', 'USA (Standard Contractual Clauses)'],
                    ['Vercel', 'Hosting og deploy', 'USA/EU (Standard Contractual Clauses)'],
                  ].map(([n, f, l]) => (
                    <tr key={n} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{n}</td>
                      <td className="px-4 py-3 text-slate-700">{f}</td>
                      <td className="px-4 py-3 text-slate-600">{l}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-slate-500">Vi inngår databehandleravtaler med alle leverandører og overfører ikke personopplysninger til land utenfor EU/EØS uten tilstrekkelig overføringsgrunnlag.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Lagringstid</h2>
            <p>Vi lagrer personopplysninger så lenge det er nødvendig for formålet de ble samlet inn for:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Kontoopplysninger:</strong> Så lenge du har aktiv konto. Slettes senest 90 dager etter kontoslutt.</li>
              <li><strong>Leads, fakturaer og jobber:</strong> Eksporteres og slettes på forespørsel etter kontoslutt.</li>
              <li><strong>Regnskapsdata:</strong> Oppbevares i 5 år i henhold til bokføringsloven.</li>
              <li><strong>Sikkerhetslogger:</strong> Slettes etter 90 dager.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Dine rettigheter</h2>
            <p>I henhold til GDPR har du følgende rettigheter:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {[
                ['📋 Innsyn', 'Du kan be om kopi av opplysningene vi har om deg.'],
                ['✏️ Retting', 'Du kan be oss rette feil eller mangelfulle opplysninger.'],
                ['🗑️ Sletting', 'Du kan be om at opplysninger slettes («retten til å bli glemt»).'],
                ['📤 Dataportabilitet', 'Du kan be om å motta dataene dine i et maskinlesbart format.'],
                ['🚫 Innvending', 'Du kan protestere mot visse typer behandling.'],
                ['🔒 Begrensning', 'Du kan be om begrenset behandling i visse situasjoner.'],
              ].map(([t, d]) => (
                <div key={t} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <p className="font-semibold text-slate-900 mb-1">{t}</p>
                  <p className="text-sm text-slate-600">{d}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm">Send forespørsel til <a href="mailto:personvern@flowpilot.no" className="text-blue-600 hover:underline">personvern@flowpilot.no</a>. Vi svarer innen 30 dager. Du kan også klage til <a href="https://www.datatilsynet.no" target="_blank" className="text-blue-600 hover:underline">Datatilsynet</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Informasjonskapsler (cookies)</h2>
            <p>FlowPilot bruker nødvendige informasjonskapsler for å drifte tjenesten (innloggingssesjon, sikkerhetstokener). Vi bruker ikke markedsføringscookies uten ditt samtykke. Se vår <Link href="/cookies" className="text-blue-600 hover:underline">cookie-policy</Link> for detaljer.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Sikkerhet</h2>
            <p>Vi bruker kryptering (TLS/HTTPS), tilgangskontroll, og regelmessig sikkerhetsgjennomgang for å beskytte opplysningene dine. Passord lagres aldri i klartekst — kun som kryptografisk hash via Supabase Auth.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Kontakt</h2>
            <p>Har du spørsmål om personvern, send en e-post til <a href="mailto:personvern@flowpilot.no" className="text-blue-600 hover:underline">personvern@flowpilot.no</a>.</p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-100 flex items-center justify-between text-sm text-slate-400">
          <Link href="/" className="hover:text-slate-600 transition">FlowPilot</Link>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-slate-600 transition">Brukervilkår</Link>
            <Link href="/cookies" className="hover:text-slate-600 transition">Cookie-policy</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
