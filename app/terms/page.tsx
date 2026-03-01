import Link from 'next/link';

export const metadata = { title: 'Brukervilkår – FlowPilot', description: 'Vilkår for bruk av FlowPilot CRM og AI-platform.' };

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <Link href="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">← Tilbake til forsiden</Link>
          <h1 className="text-4xl font-black text-slate-900 mb-3">Brukervilkår</h1>
          <p className="text-slate-500 text-sm">Sist oppdatert: 1. mars 2026 · Gjelder for FlowPilot (flowpilot.no)</p>
        </div>

        <div className="space-y-10 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Om FlowPilot</h2>
            <p>FlowPilot er en norsk AI-drevet CRM- og vekstplattform for små og mellomstore bedrifter, levert av FlowPilot AS (org.nr: [fyll inn]), heretter kalt «FlowPilot», «vi» eller «oss». Tjenesten er tilgjengelig via <a href="https://flowpilot.no" className="text-blue-600 hover:underline">flowpilot.no</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Aksept av vilkår</h2>
            <p>Ved å registrere en konto eller bruke FlowPilot aksepterer du disse brukervilkårene og vår <Link href="/privacy" className="text-blue-600 hover:underline">personvernserklæring</Link>. Hvis du representerer en bedrift, bekrefter du at du har fullmakt til å binde bedriften til disse vilkårene.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Kontoregistrering og ansvar</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Du er ansvarlig for å holde innloggingsinformasjonen din konfidensiell.</li>
              <li>Du er ansvarlig for all aktivitet som skjer under kontoen din.</li>
              <li>Du må oppgi korrekte og fullstendige opplysninger ved registrering.</li>
              <li>Du kan ikke overdra eller dele kontoen din med andre uten skriftlig samtykke fra oss.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Abonnement og betaling</h2>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-slate-900">4.1 Prøveperiode</p>
                <p className="mt-1">FlowPilot tilbyr en <strong>14-dagers gratis prøveperiode</strong> for nye kunder. Kortet ditt belastes ikke før prøveperioden er over med mindre annet er avtalt.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">4.2 Betaling</p>
                <p className="mt-1">Abonnementer faktureres månedlig eller årlig, forskuddsvis. Betaling skjer via Stripe. Alle priser er oppgitt eks. MVA. MVA legges til i henhold til gjeldende norske satser.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">4.3 Prisendringer</p>
                <p className="mt-1">Vi kan endre priser med 30 dagers skriftlig varsel. Fortsetter du å bruke tjenesten etter varselperioden, aksepterer du de nye prisene.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">4.4 Forsinket betaling</p>
                <p className="mt-1">Ved forsinket betaling kan vi stenge tilgangen til tjenesten inntil betaling er mottatt. Vi forbeholder oss retten til å kreve forsinkelsesrenter i henhold til forsinkelsesrenteloven.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Angrerett og refusjon</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-4">
              <p className="font-semibold text-blue-900 mb-1">14-dagers angrerett (B2C)</p>
              <p className="text-sm text-blue-800">Dersom du er privatperson (ikke næringsdrivende), har du 14 dagers angrerett etter kjøpsloven og angrerettloven. Send melding til <a href="mailto:support@flowpilot.no" className="underline">support@flowpilot.no</a> innen 14 dager fra abonnementstart.</p>
            </div>
            <p><strong>For bedriftskunder (B2B)</strong> gjelder ikke angrerettloven. Vi tilbyr likevel <strong>refusjon for ubrukt del av inneværende periode</strong> dersom du avslutter innen de første 14 dagene av et nytt abonnement og ber om det skriftlig. Dette er en frivillig ordning.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Oppsigelse</h2>
            <div className="space-y-3">
              <p><strong>Du kan si opp</strong> abonnementet når som helst i din kontoprofil under Innstillinger → Abonnement, eller ved å kontakte oss på <a href="mailto:support@flowpilot.no" className="text-blue-600 hover:underline">support@flowpilot.no</a>.</p>
              <p>Oppsigelse trer i kraft ved utløp av inneværende betalingsperiode. Du beholder tilgang frem til periodens slutt.</p>
              <p>Vi kan si opp avtalen med <strong>30 dagers varsel</strong>. Ved grove brudd på vilkårene kan vi avslutte kontoen øyeblikkelig.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Akseptabel bruk</h2>
            <p className="mb-3">Du forplikter deg til å bruke FlowPilot i samsvar med gjeldende norsk lov og disse vilkårene. Du kan ikke:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Bruke tjenesten til ulovlig aktivitet, spam eller phishing.</li>
              <li>Forsøke å hacke, omgå sikkerhetstiltak eller ta ned tjenesten.</li>
              <li>Videresalg av tjenesten uten skriftlig tillatelse.</li>
              <li>Laste opp innhold som krenker andres rettigheter eller er støtende.</li>
              <li>Bruke automatiserte systemer for å utnytte tjenesten unormalt.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Eierskap til data</h2>
            <p>Du eier alle data du laster opp til FlowPilot. Du gir oss en begrenset, ikke-eksklusiv lisens til å behandle disse til formålet med å levere tjenesten. Vi selger aldri dine data til tredjeparter.</p>
            <p className="mt-3">Du kan når som helst eksportere dataene dine via Innstillinger → Eksporter data. Etter kontoavslutning lagres data i 90 dager før sletting med mindre loven krever lengre oppbevaring.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Immaterielle rettigheter</h2>
            <p>FlowPilot og alt innhold (kode, design, AI-modeller, logo) er eid av FlowPilot AS og beskyttet av opphavsretts-, varemerke- og andre lover. Du får en begrenset, ikke-eksklusiv rett til å bruke tjenesten i den perioden abonnementet er aktivt.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">10. Ansvarsbegrensning</h2>
            <p>FlowPilot leveres «som den er». Vi garanterer ikke 100 % oppetid, men tilstreber 99,5 % tilgjengelighet. Vi er ikke ansvarlige for:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Indirekte tap, driftstap, tapt fortjeneste eller datautfall.</li>
              <li>Skader som følge av tredjepartsintegrasjoner (Stripe, Google, etc.).</li>
              <li>Force majeure-situasjoner.</li>
            </ul>
            <p className="mt-3">Vårt maksimale erstatningsansvar er begrenset til beløpet du har betalt for tjenesten de siste 3 månedene.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">11. Tvisteløsning og verneting</h2>
            <p>Disse vilkårene er underlagt norsk rett. Tvister forsøkes løst i minnelighet. Dersom det ikke lykkes, er verneting Oslo tingrett.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">12. Endringer i vilkårene</h2>
            <p>Vi kan oppdatere disse vilkårene. Vesentlige endringer varsles på e-post minimum 30 dager i forveien. Fortsatt bruk etter varselperioden regnes som aksept av nye vilkår.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">13. Kontakt</h2>
            <p>Spørsmål? Kontakt oss på <a href="mailto:support@flowpilot.no" className="text-blue-600 hover:underline">support@flowpilot.no</a>.</p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-100 flex items-center justify-between text-sm text-slate-400">
          <Link href="/" className="hover:text-slate-600 transition">FlowPilot</Link>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-600 transition">Personvern</Link>
            <Link href="/cookies" className="hover:text-slate-600 transition">Cookie-policy</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
