import { Globe, TrendingUp, Search, Share2, Star, ArrowRight } from 'lucide-react';

const SERVICES = [
  {
    icon: Globe,
    color: 'bg-blue-100 text-blue-600',
    title: 'Nettside',
    tagline: 'Profesjonell nettside som konverterer',
    price: '9 900 kr',
    priceNote: 'engangsbetaling',
    features: ['Mobiloptimalisert design', 'SEO-grunnleggende inkludert', 'Kontaktskjema koblet til FlowPilot', 'Levert på 5–7 dager'],
  },
  {
    icon: TrendingUp,
    color: 'bg-orange-100 text-orange-600',
    title: 'Google Ads',
    tagline: 'Annonser som gir deg jobber',
    price: '4 500 kr',
    priceNote: 'per måned',
    features: ['Søkekampanjer i ditt område', 'Daglig budsjettkontroll', 'Månedlig resultatrapport', 'Leads direkte til FlowPilot'],
    popular: true,
  },
  {
    icon: Search,
    color: 'bg-green-100 text-green-600',
    title: 'SEO',
    tagline: 'Bli funnet på Google organisk',
    price: '3 500 kr',
    priceNote: 'per måned',
    features: ['Nøkkelordanalyse', 'Innholdsoptimalisering', 'Teknisk SEO', 'Månedlig rangeringsrapport'],
  },
  {
    icon: Share2,
    color: 'bg-purple-100 text-purple-600',
    title: 'Sosiale medier',
    tagline: 'Bygg merkevare på nettet',
    price: '3 900 kr',
    priceNote: 'per måned',
    features: ['12 innlegg per måned', 'Facebook & Instagram', 'Grafisk design inkludert', 'Engasjementsoppfølging'],
  },
  {
    icon: Star,
    color: 'bg-yellow-100 text-yellow-700',
    title: 'Anmeldelsesbooster',
    tagline: 'Flere 5-stjerne Google-anmeldelser',
    price: '1 900 kr',
    priceNote: 'per måned',
    features: ['Automatisk e-post etter jobb', 'QR-kode-plakat til bil/kontor', 'Overvåking av nye anmeldelser', 'Månedlig anmeldelsesrapport'],
  },
];

export function Services() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700 mb-4">
            Tilleggstjenester
          </span>
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Vokse raskere med ekspert-hjelp
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            FlowPilot hjelper deg å håndtere leads – vi hjelper deg også å skaffe dem. Velg de tjenestene som passer best for din bedrift.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className={`relative rounded-2xl bg-white border ${s.popular ? 'border-blue-400 ring-2 ring-blue-200 shadow-lg' : 'border-slate-200 shadow-sm'} p-6 flex flex-col`}
              >
                {s.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow">Mest populær</span>
                  </div>
                )}
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${s.color} mb-4`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">{s.tagline}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-0.5 h-4 w-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="border-t border-slate-100 pt-4 mt-auto">
                  <p className="text-2xl font-bold text-slate-900">{s.price}
                    <span className="text-sm font-normal text-slate-400 ml-1">{s.priceNote}</span>
                  </p>
                  <a
                    href={`mailto:flowpilot@hotmail.com?subject=Interesse for ${s.title}&body=Hei, jeg er interessert i ${s.title}-pakken fra FlowPilot.`}
                    className={`mt-3 flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-semibold transition-colors ${s.popular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    Kom i gang <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA bar */}
        <div className="mt-12 rounded-2xl bg-blue-600 px-8 py-8 text-center text-white">
          <p className="text-lg font-semibold">Usikker på hvilken pakke som passer deg?</p>
          <p className="mt-1 text-blue-100 text-sm">Vi tilbyr gratis rådgivning – send oss en e-post så tar vi en uforpliktende prat.</p>
          <a
            href="mailto:flowpilot@hotmail.com?subject=Gratis rådgivning"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50 transition-colors"
          >
            Book gratis rådgivning <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
