"use client";
import { CheckCircle, Zap } from "lucide-react";
const PLANS = [
  { key: "starter", title: "Basis", subtitle: "For små bedrifter som vil samle og følge opp henvendelser", limits: "100 henvendelser / mnd · 2 skjemaer", badge: null, price: "899", features: ["Kontakter, innboks og enkel salgspipeline", "Varsel om nye henvendelser", "Automatisk mottaksbekreftelse", "Opptil 2 kontaktskjemaer", "Månedlig resultatrapport"], highlight: false },
  { key: "pro", title: "Vekst", subtitle: "For bedrifter som vil automatisere kundeoppfølging og synlighet", limits: "500 henvendelser / mnd · 20 skjemaer", badge: "MEST POPULÆR", price: "1 990", features: ["Alt i Basis", "Oppfølging av ubesvarte leads og tilbud", "Google-anmeldelsesflyt og omdømme", "Google-bedriftsprofil og lokal synlighet", "Servicepåminnelser og gjenaktivering", "AI-chat og SEO-oversikt"], highlight: true },
  { key: "enterprise", title: "Pro", subtitle: "Hele plattformen for bedrifter med større ambisjoner", limits: "Ubegrenset · alle moduler", badge: null, price: "3 990", features: ["Alt i Vekst", "Ubegrensede henvendelser og skjemaer", "AutoSEO og planlagt faginnhold", "Synlighet i Google og AI-baserte søk", "Avanserte automatiseringer, API og webhooks", "Prioritert onboarding og support"], highlight: false },
];

export function Pricing() {

  return (
    <section id="pricing" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-4">
          <h2 className="text-4xl font-bold text-slate-900">Enkel, transparent prising</h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Start gratis i 14 dager. Oppgrader når du er klar  ingen binding.
          </p>
        </div>
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-2 text-sm font-semibold text-green-700">
            <Zap className="h-4 w-4" />
            Spar 20% ved å betale for 6 måneder
          </div>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {PLANS.map((plan) => (
              <div
                key={plan.key}
                className={`relative rounded-3xl border-2 p-8 flex flex-col transition-all hover:shadow-xl ${
                  plan.highlight
                    ? "border-blue-600 shadow-xl shadow-blue-100 bg-gradient-to-b from-blue-50 to-white scale-105"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-bold text-white shadow">
                    {plan.badge}
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{plan.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{plan.subtitle}</p>
                  <div className="mt-5">
                    <div><span className="text-5xl font-extrabold text-slate-900">{plan.price}</span><span className="ml-1 text-slate-500 text-base"> kr/mnd</span></div>
                  </div>
                  <div className="mt-2 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {plan.limits}
                  </div>
                </div>
                <ul className="mt-8 space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 space-y-3">
                  <StripeCheckoutButton
                    plan={plan.key}
                    highlighted={plan.highlight}
                    billingTerm="monthly"
                    label="Start gratis (månedlig)"
                  />
                  <StripeCheckoutButton
                    plan={plan.key}
                    highlighted={false}
                    billingTerm="prepaid6"
                    label="Betal 6 mnd  spar 20 %"
                    green={true}
                  />
                </div>
              </div>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-slate-500">
          Alle planer inkluderer SSL-sikkerhet, daglig backup og 99.9% oppetid.
        </p>
      </div>
    </section>
  );
}

function StripeCheckoutButton({
  plan,
  highlighted,
  billingTerm = "monthly",
  label,
  green = false,
}: {
  plan: string;
  highlighted?: boolean;
  billingTerm?: string;
  label: string;
  green?: boolean;
}) {
  // Always send new users through the registration flow first (plan select → form → stripe)
  const handleCheckout = () => {
    window.location.href = `/register?plan=${plan}&billing=${billingTerm}`;
  };

  return (
    <button
      onClick={handleCheckout}
      className={`w-full rounded-xl px-6 py-3 text-sm font-bold transition ${
        green
          ? "bg-green-600 text-white hover:bg-green-700"
          : highlighted
          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
          : "bg-slate-100 text-slate-900 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}