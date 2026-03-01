import Link from 'next/link';

export const metadata = { title: 'Cookie-policy – FlowPilot', description: 'Informasjon om bruk av informasjonskapsler (cookies) på FlowPilot.' };

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <Link href="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">← Tilbake til forsiden</Link>
          <h1 className="text-4xl font-black text-slate-900 mb-3">Cookie-policy</h1>
          <p className="text-slate-500 text-sm">Sist oppdatert: 1. mars 2026 · Gjelder for FlowPilot (flowpilot.no)</p>
        </div>

        <div className="space-y-10 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Hva er informasjonskapsler (cookies)?</h2>
            <p>Informasjonskapsler er små tekstfiler som lagres i nettleseren din når du besøker et nettsted. De brukes til å huske innstillinger, holde deg innlogget og samle statistikk om bruk av siden.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Hvilke cookies bruker FlowPilot?</h2>

            <div className="space-y-6">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-green-50 px-4 py-3 border-b border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wide text-green-700">Nødvendige (alltid aktive)</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { name: 'sb-access-token', purpose: 'Supabase innloggingsøkt – holder deg innlogget i FlowPilot', expires: 'Økt / 1 time' },
                    { name: 'sb-refresh-token', purpose: 'Fornyer tilgangstokenet automatisk uten ny innlogging', expires: '7 dager' },
                    { name: '__Host-next-auth.*', purpose: 'NextAuth.js sesjonstilstand (CSRF-beskyttelse)', expires: 'Økt' },
                    { name: 'next-auth.session-token', purpose: 'Autentisert brukerøkt (httpOnly, Secure)', expires: '30 dager' },
                  ].map(c => (
                    <div key={c.name} className="px-4 py-3 grid grid-cols-3 gap-2 text-sm">
                      <code className="text-slate-800 font-mono text-xs">{c.name}</code>
                      <span className="col-span-1 text-slate-600">{c.purpose}</span>
                      <span className="text-slate-400 text-right">{c.expires}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-blue-50 px-4 py-3 border-b border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wide text-blue-700">Funksjonelle</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { name: 'flowpilot-theme', purpose: 'Husker valgt fargetema (lys/mørk)', expires: '1 år' },
                    { name: 'flowpilot-sidebar', purpose: 'Husker om sidemenyen er utvidet eller kollapset', expires: '1 år' },
                  ].map(c => (
                    <div key={c.name} className="px-4 py-3 grid grid-cols-3 gap-2 text-sm">
                      <code className="text-slate-800 font-mono text-xs">{c.name}</code>
                      <span className="col-span-1 text-slate-600">{c.purpose}</span>
                      <span className="text-slate-400 text-right">{c.expires}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-600">Analytiske (kun med samtykke)</span>
                </div>
                <div className="px-4 py-4 text-sm text-slate-500">
                  <p>Vi bruker per i dag <strong>ingen</strong> tredjeparts analyseverktøy som Google Analytics. Dersom dette endres, vil vi oppdatere denne policyen og be om samtykke.</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-purple-50 px-4 py-3 border-b border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wide text-purple-700">Betalingsrelaterte (Stripe)</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { name: '__stripe_mid', purpose: 'Stripe maskinidentifikasjon – svindeloppdagelse', expires: '1 år' },
                    { name: '__stripe_sid', purpose: 'Stripe øktidentifikasjon – svindeloppdagelse', expires: 'Økt' },
                  ].map(c => (
                    <div key={c.name} className="px-4 py-3 grid grid-cols-3 gap-2 text-sm">
                      <code className="text-slate-800 font-mono text-xs">{c.name}</code>
                      <span className="col-span-1 text-slate-600">{c.purpose}</span>
                      <span className="text-slate-400 text-right">{c.expires}</span>
                    </div>
                  ))}
                </div>
                <p className="px-4 py-3 text-xs text-slate-400 border-t border-slate-100">
                  Stripe-cookies settes kun på betalingssider. Se <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Stripes personvernerklæring</a> for detaljer.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Markedsføringscookies</h2>
            <p>Vi setter <strong>ingen markedsføringscookies</strong> (f.eks. Facebook Pixel, Google Ads) uten eksplisitt samtykke fra deg.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Slik administrerer du cookies</h2>
            <p className="mb-4">Du kan til enhver tid slette eller blokkere cookies via nettleserinnstillingene dine:</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { name: 'Chrome', url: 'https://support.google.com/chrome/answer/95647' },
                { name: 'Firefox', url: 'https://support.mozilla.org/no/kb/informasjonskapsler' },
                { name: 'Safari', url: 'https://support.apple.com/no-no/guide/safari/sfri11471/mac' },
                { name: 'Edge', url: 'https://support.microsoft.com/nb-no/topic/slette-og-behandle-informasjonskapsler-168dab11-0753-043d-7c16-ede5947fc64d' },
              ].map(b => (
                <a key={b.name} href={b.url} target="_blank" rel="noopener noreferrer" className="block text-center text-sm px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-blue-600 transition">
                  {b.name}
                </a>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-500">Merk: Blokkering av nødvendige cookies vil forhindre innlogging i FlowPilot.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Samtykke</h2>
            <p>Nødvendige cookies krever ikke samtykke da de er essensielle for at tjenesten skal fungere (jf. ekomloven § 2-7b). For øvrige cookies vil vi alltid be om samtykke.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Kontakt</h2>
            <p>Spørsmål om vår cookiebruk? Kontakt oss på <a href="mailto:personvern@flowpilot.no" className="text-blue-600 hover:underline">personvern@flowpilot.no</a>.</p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-100 flex items-center justify-between text-sm text-slate-400">
          <Link href="/" className="hover:text-slate-600 transition">FlowPilot</Link>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-600 transition">Personvern</Link>
            <Link href="/terms" className="hover:text-slate-600 transition">Brukervilkår</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
