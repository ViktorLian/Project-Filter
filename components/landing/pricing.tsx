"use client";

import { loadStripe } from "@stripe/stripe-js";
import type { Stripe } from "@stripe/stripe-js";

export function Pricing() {
  return (
    <section id="pricing" className="bg-gradient-to-b from-white to-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h2 className="text-4xl font-bold text-slate-900">Simple, Transparent Pricing</h2>
        <p className="mt-4 text-lg text-slate-600">Choose the plan that fits your business needs</p>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <Plan title="Starter" price="799" features={[
            "50 leads / month",
            "20 invoices / month",
            "Basic cashflow tracking",
            "Email support",
            "1 user",
          ]} />
          <Plan highlighted title="Pro" price="1,999" features={[
            "Unlimited leads",
            "Unlimited invoices",
            "Advanced analytics",
            "Zapier integration",
            "Priority support",
            "CSV export",
            "Up to 3 users",
          ]} />
          <Plan title="Enterprise" price="4,990" features={[
            "Everything in Pro",
            "Custom user limits",
            "Priority support",
            "Custom integrations",
            "API access",
            "Dedicated support",
          ]} />
        </div>
        <p className="mt-8 text-sm text-slate-500">
          All plans include SSL security, daily backups, and 99.9% uptime.
        </p>
      </div>
    </section>
  );
}

function Plan({ title, price, features, highlighted }: any) {
  return (
    <div
      className={`rounded-2xl border-2 p-8 transition-all hover:shadow-xl ${highlighted ? "border-blue-600 shadow-lg scale-105 bg-blue-50/50" : "border-slate-200 hover:border-slate-300"}`}
    >
      {highlighted && (
        <div className="mb-4 inline-block rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
          MOST POPULAR
        </div>
      )}
      <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
      <div className="mt-4">
        <span className="text-5xl font-bold text-slate-900">{price}</span>
        <span className="text-lg text-slate-600"> NOK</span>
      </div>
      <p className="text-sm text-slate-500">per month</p>
      <ul className="mt-8 space-y-3 text-left text-sm text-slate-600">
        {features.map((f: string) => (
          <li key={f} className="flex items-start gap-2">
            <svg className="h-5 w-5 flex-shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <StripeCheckoutButton plan={title} highlighted={highlighted} />
    </div>
  );
}

const stripePromise: Promise<Stripe | null> = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

function StripeCheckoutButton({ plan, highlighted }: { plan: string; highlighted?: boolean }) {
  // Map plan to price ID
  const priceId =
    plan === "Starter" ? process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_ID :
    plan === "Pro" ? process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ID :
    plan === "Enterprise" ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_ID : "";

  const handleCheckout = async () => {
    const stripe = await stripePromise;
    if (!stripe || !priceId) return alert("Stripe setup error");
    // @ts-ignore
    await stripe.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      successUrl: process.env.NEXT_PUBLIC_APP_URL + "/dashboard?upgrade=success",
      cancelUrl: process.env.NEXT_PUBLIC_APP_URL + "/dashboard?upgrade=cancel",
    });
  };

  return (
    <button
      onClick={handleCheckout}
      className={`mt-8 inline-block w-full rounded-lg px-6 py-3 text-sm font-semibold transition text-center ${highlighted ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" : "bg-slate-100 text-slate-900 hover:bg-slate-200"}`}
    >
      Oppgrader med Stripe
    </button>
  );
}
