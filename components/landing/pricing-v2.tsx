'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PricingPlan {
  name: string;
  price: number;
  currency: string;
  billing: string;
  popular?: boolean;
  features: string[];
  limits: {
    leads: number | string;
    forms: number | string;
  };
}

const PLANS: PricingPlan[] = [
  {
    name: 'Starter',
    price: 799,
    currency: 'NOK',
    billing: 'pr. måned',
    features: [
      '✓ Opptil 100 leads per måned',
      '✓ Opptil 2 forms',
      '✓ E-post notifikasjoner',
      '✓ Grunnleggende analytics',
      '✓ Auto-reply maler',
    ],
    limits: { leads: 100, forms: 2 },
  },
  {
    name: 'Pro',
    price: 1999,
    currency: 'NOK',
    billing: 'pr. måned',
    popular: true,
    features: [
      '✓ Alt fra Starter',
      '✓ Opptil 500 leads per måned',
      '✓ Opptil 20 forms',
      '✓ Lead-gruppering (AI)',
      '✓ E-postkampanjer',
      '✓ AI lead-analyse',
      '✓ Auto-followup sekvenser (dag 2, 5, 10, 21)',
      '✓ Feedback-loop (hvorfor avslåtte leads sa nei)',
      '✓ Google Maps review-forespørsler',
      '✓ Prioritert support',
    ],
    limits: { leads: 500, forms: 20 },
  },
  {
    name: 'Enterprise',
    price: 4990,
    currency: 'NOK',
    billing: 'pr. måned',
    features: [
      '✓ Alt fra Pro',
      '✓ Ubegrensede leads',
      '✓ Ubegrensede forms',
      '✓ PDF-generering (fakturaer)',
      '✓ Avansert AI-scoring',
      '✓ Churn-deteksjon',
      '✓ Slack-integrasjon',
      '✓ Google Maps-optimisering',
      '✓ Webhook-API',
      '✓ Zapier-integrasjon',
      '✓ Dedikert support',
      '✓ Custom integrasjoner',
    ],
    limits: { leads: '∞', forms: '∞' },
  },
];

const PREPAID_DISCOUNT = 0.2; // 20% rabatt for 6-måneders forhåndsbetaling

export default function PricingV2() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'prepaid6'>('monthly');
  const [prices, setPrices] = useState(PLANS);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/stripe/prices');
        const data = await res.json();
        // Hvis Stripe priser hentes, oppdater localt
        if (data.prices) {
          console.log('Stripe prices fetched:', data.prices);
        }
      } catch (e) {
        console.log('Using default prices');
      }
    };

    // fetchPrices(); // Kommentert ut for nå; slå på når Stripe er konfigurert
  }, []);

  const handleCheckout = async (planName: string) => {
    try {
      const billingTerm = billingCycle === 'prepaid6' ? 'prepaid6_months' : 'monthly';
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planName.toLowerCase(),
          billingTerm,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Klarte ikke å opprette checkout-sesjon. Prøv igjen.');
      }
    } catch (e) {
      console.error('Checkout error:', e);
      alert('Feil ved checkout');
    }
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Enkel og transparent prising
          </h1>
          <p className="text-lg text-gray-600">
            Velg planen som passer ditt behov. Alle planer kommer med 14 dager gratis trial.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-8 py-3 rounded-md font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Månedlig
            </button>
            <button
              onClick={() => setBillingCycle('prepaid6')}
              className={`px-8 py-3 rounded-md font-semibold transition-all ${
                billingCycle === 'prepaid6'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              6 måneder (20% rabatt) 🎉
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {PLANS.map((plan) => {
            const displayPrice =
              billingCycle === 'prepaid6'
                ? Math.round(plan.price * 6 * (1 - PREPAID_DISCOUNT))
                : plan.price;

            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border-2 transition-all ${
                  plan.popular
                    ? 'border-blue-500 bg-blue-50 shadow-xl transform scale-105'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                      MER POPULÆR
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Name & Price */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h2>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {displayPrice.toLocaleString('no-NO')}
                    </span>
                    <span className="text-gray-600 ml-2">
                      {billingCycle === 'prepaid6'
                        ? `${plan.currency} (6 mnd)`
                        : `${plan.currency}/${plan.billing}`}
                    </span>
                  </div>

                  {billingCycle === 'prepaid6' && (
                    <p className="text-green-600 font-semibold mb-6 text-sm">
                      💰 Spar {Math.round(plan.price * 6 * PREPAID_DISCOUNT).toLocaleString('no-NO')}{' '}
                      NOK
                    </p>
                  )}

                  {/* CTA Button */}
                  <button
                    onClick={() => handleCheckout(plan.name)}
                    className={`w-full py-3 rounded-lg font-bold mb-8 transition-all ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {billingCycle === 'monthly' ? 'Abonner (månedlig)' : 'Betal 6 måneder'}
                  </button>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    <p className="text-sm font-semibold text-gray-700 mb-4">Grenser:</p>
                    <p className="text-gray-700">
                      <strong>Leads:</strong>{' '}
                      {typeof plan.limits.leads === 'string' ? 'Ubegrenset' : plan.limits.leads + '/mnd'}
                    </p>
                    <p className="text-gray-700">
                      <strong>Forms:</strong>{' '}
                      {typeof plan.limits.forms === 'string' ? 'Ubegrenset' : plan.limits.forms}
                    </p>
                  </div>

                  <hr className="my-6" />

                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <p key={idx} className="text-sm text-gray-700">
                        {feature}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto bg-white rounded-xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Vanlige spørsmål</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Hva skjer hvis jeg overskrider lead-grensen?</h3>
              <p className="text-gray-600">
                Systemet blokkerer nye leads når du når grensen. Vi sender deg en e-post og du kan oppgradere
                planen når som helst.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">Kan jeg bytte plan når som helst?</h3>
              <p className="text-gray-600">
                Ja! Du kan oppgradere eller nedgradere når som helst. Beløpet justeres basert på resten av
                faktureringsperioden.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">Hva er den 14-dagers testen?</h3>
              <p className="text-gray-600">
                Du får 14 dager gratis med full tilgang til planen du velger. Du trenger ikke kredittkort!
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">Hva med avbestilling?</h3>
              <p className="text-gray-600">
                Du kan avbestille når som helst fra kontoinstitusjonene dine. Ingen bindinger, ingen
                spørsmål.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">Trenger du hjelp? Vi er her for deg!</p>
          <Link href="mailto:hei@flowpilot.no" className="text-blue-600 font-bold hover:underline">
            Kontakt oss
          </Link>
        </div>
      </div>
    </section>
  );
}
