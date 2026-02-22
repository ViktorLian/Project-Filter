"use client";
import { useEffect, useState } from "react";
import { CheckCircle, Zap } from "lucide-react";

const PLANS = [
  {
    key: "starter",
    title: "Starter",
    subtitle: "Perfekt for nystartede bedrifter",
    limits: "100 leads / mnd · 2 skjemaer",
    badge: null,
    features: [
      "Opptil 100 leads per måned",
      "2 tilpassede lead-skjemaer",
      "AI lead-scoring (0–100)",
      "Automatiske e-postsvar",
      "Faktura-generator (20/mnd)",
      "Kontantstrøm-oversikt",
      "E-postsupport",
    ],
    highlight: false,
  },
  {
    key: "pro",
    title: "Pro",
    subtitle: "For voksende bedrifter",
    limits: "500 leads / mnd · 20 skjemaer",
    badge: "MEST POPULÆR",
    features: [
      "Opptil 500 leads per måned",
      "20 tilpassede lead-skjemaer",
      "AI lead-scoring og kategorisering",
      "Automatiske e-postkampanjer",
      "SMS-påminnelser (Twilio)",
      "Bookingsystem med Google Kalender",
      "Lead ROI-tracking",
      "No-show deteksjon",
      "Betalingslink-generator",
      "Ubegrensede fakturaer",
      "Prioritert support",
    ],
    highlight: true,
  },
  {
    key: "enterprise",
    title: "Enterprise",
    subtitle: "For seriøse vekstbedrifter",
    limits: "Ubegrenset · Alt inkludert",
    badge: null,
    features: [
      "Ubegrenset antall leads",
      "Ubegrenset antall skjemaer",
      "AI kundeservice-bot på nettsiden",
      "Avansert e-postkampanjestyring",
      "White-label muligheter",
      "Full API-tilgang",
      "Dedikert onboarding",
      "Custom integrasjoner",
      "Team-administrasjon og rolle-styring",
      "SLA-garanti og prioritert support",
    ],
    highlight: false,
  },
];

export function Pricing() {
  const [prices, setPrices] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stripe/prices")
      .then((r) => r.json())
      .then((json) => setPrices(json || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="pricing" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-4">
          <h2 className="text-4xl font-bold text-slate-900">Enkel, transparent prising</h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Start gratis i 14 dager. Oppgrader når du er klar – ingen binding.
          </p>
        </div>
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-2 text-sm font-semibold text-green-700">
            <Zap className="h-4 w-4" />
            Spar 20% ved å betale for 6 måneder
          </div>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {PLANS.map((plan) => {
            const price = prices?.[plan.key];
            return (
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
                    {loading ? (
                      <div className="h-12 w-32 rounded-lg bg-slate-100 animate-pulse" />
                    ) : (
                      <div>
                        <span className="text-5xl font-extrabold text-slate-900">
                          {price?.display ?? "—"}
                        </span>
                        <span className="ml-1 text-slate-500 text-base"> NOK/mnd</span>
                      </div>
                    )}
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
                  {plan.key === "enterprise" ? (
                    <a
                      href="#contact"
                      className="block w-full rounded-xl border-2 border-slate-300 px-6 py-3 text-center text-sm font-bold text-slate-900 hover:border-slate-400 transition"
                    >
                      Kontakt oss
                    </a>
                  ) : (
                    <div>
                      <StripeCheckoutButton
                        plan={plan.key}
                        priceId={price?.id}
                        highlighted={plan.highlight}
                        billingTerm="monthly"
                        label="Start gratis (månedlig)"
                      />
                      <StripeCheckoutButton
                        plan={plan.key}
                        priceId={price?.id}
                        highlighted={false}
                        billingTerm="prepaid6"
                        label="Betal 6 mnd – spar 20%"
                        green={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
  priceId,
  highlighted,
  billingTerm = "monthly",
  label,
  green = false,
}: {
  plan: string;
  priceId?: string;
  highlighted?: boolean;
  billingTerm?: string;
  label: string;
  green?: boolean;
}) {
  const handleCheckout = async () => {
    if (!priceId) return alert("Pris ikke konfigurert ennå.");
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, billingTerm, plan }),
      });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
      else alert("Kunne ikke opprette Stripe-økt.");
    } catch {
      alert("Checkout-feil");
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className={`w-full rounded-xl px-6 py-3 text-sm font-bold transition mt-3 ${
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
