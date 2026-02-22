import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Settings, Building2, Receipt, CreditCard, Key, User } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  let company: any = null;
  let user: any = null;

  if (session) {
    const companyId = (session.user as any).companyId;
    const userId = (session.user as any).id;
    const supabase = createAdminClient();
    const [companyRes, userRes] = await Promise.all([
      supabase.from('leads_companies').select('*').eq('id', companyId).single(),
      supabase.from('users').select('*').eq('id', userId).single(),
    ]);
    company = companyRes.data;
    user = userRes.data;
  }

  const planNames: Record<string, string> = {
    starter: 'Starter - 500 kr/mnd',
    pro: 'Pro - 1 500 kr/mnd',
    enterprise: 'Enterprise - 3 500 kr/mnd',
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Innstillinger</h1>
        <p className="text-slate-500 text-sm mt-0.5">Administrer konto, firma og fakturering</p>
      </div>

      {/* Firm info */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-slate-800">Firmainformasjon</h2>
        </div>
        <div className="grid gap-4">
          {[
            { label: 'Firmanavn', val: company?.name || session?.user?.name || '' },
            { label: 'Firma slug (URL)', val: company?.slug || '' },
            { label: 'Organisasjonsnummer', val: company?.org_number || '' },
            { label: 'Adresse', val: company?.address || '' },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-medium text-slate-500 mb-1">{f.label}</label>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{f.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Account */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-purple-600" />
          <h2 className="font-semibold text-slate-800">Brukerkonto</h2>
        </div>
        <div className="grid gap-3">
          {[
            { label: 'Navn', val: user?.name || session?.user?.name || '' },
            { label: 'E-post', val: user?.email || session?.user?.email || '' },
            { label: 'Rolle', val: user?.role || 'Admin' },
          ].map(f => (
            <div key={f.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-xs text-slate-500">{f.label}</span>
              <span className="text-sm font-medium text-slate-800">{f.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice settings */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="h-5 w-5 text-orange-600" />
          <h2 className="font-semibold text-slate-800">Fakturainnstillinger</h2>
        </div>
        <div className="grid gap-3">
          {[
            { label: 'Kontonummer', val: company?.bank_account || '', tip: 'Brukes pa PDF-fakturaer' },
            { label: 'KID-prefiks', val: company?.kid_prefix || '', tip: 'Eks: 2026 (arstall)' },
            { label: 'Faktura e-post', val: company?.invoice_email || user?.email || '', tip: 'E-post for fakturavarsler' },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-medium text-slate-500 mb-1">{f.label}</label>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{f.val}</div>
              {f.tip && <p className="text-xs text-slate-400 mt-0.5">{f.tip}</p>}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-4">Kontakt support for a oppdatere bank- og KID-innstillinger.</p>
      </div>

      {/* Subscription */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-emerald-600" />
          <h2 className="font-semibold text-slate-800">Abonnement</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-800">{planNames[company?.subscription_plan] ?? 'Ingen aktiv plan'}</p>
            <p className="text-xs text-slate-500 mt-0.5">14 dagers gratis proveperiode inkludert</p>
          </div>
          <Link href="/dashboard/billing"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
            Endre plan
          </Link>
        </div>
      </div>

      {/* API / integration section */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-5 w-5 text-slate-600" />
          <h2 className="font-semibold text-slate-800">Integrasjoner</h2>
        </div>
        <div className="space-y-3 text-sm text-slate-600">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span>OpenAI (AI-funksjoner)</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${process.env.OPENAI_API_KEY ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
              {process.env.OPENAI_API_KEY ? 'Konfigurert' : 'Mangler nokkel'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span>Stripe (Betalinger)</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${process.env.STRIPE_SECRET_KEY ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
              {process.env.STRIPE_SECRET_KEY ? 'Konfigurert' : 'Mangler nokkel'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span>Google Maps</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${process.env.GOOGLE_MAPS_API_KEY ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {process.env.GOOGLE_MAPS_API_KEY ? 'Konfigurert' : 'Ikke konfigurert'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
