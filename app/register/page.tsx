'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('invite');
    if (token) setInviteToken(token);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    // If invited → register directly (no Stripe)
    if (inviteToken) {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          password: formData.get('password'),
          companyName: formData.get('name'), // placeholder, they use owner's company
          inviteToken,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) { setError(data.error ?? 'Feil ved registrering'); return; }
      router.push('/login?invited=1');
      return;
    }

    // Normal flow → Stripe checkout
    const res = await fetch('/api/stripe/register-checkout', {
      method: 'POST',
      body: JSON.stringify({
        companyName: formData.get('companyName'),
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok || !data.url) {
      setError(data.error ?? 'Klarte ikke starte registrering. Prøv igjen.');
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">FP</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">FlowPilot</span>
          </Link>
        </div>
        
        <Card className="shadow-xl">
          <CardHeader>
            {inviteToken ? (
              <>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 mb-2">
                  <p className="text-sm font-semibold text-emerald-800">Du er invitert til et team!</p>
                  <p className="text-xs text-emerald-700 mt-0.5">Opprett en konto for å få tilgang til bedriftens FlowPilot-data.</p>
                </div>
                <CardTitle>Bli med i teamet</CardTitle>
                <CardDescription>Gratis — du er inkludert i bedriftens abonnement.</CardDescription>
              </>
            ) : (
              <>
                <CardTitle>Start gratis prøveperiode</CardTitle>
                <CardDescription>
                  14 dager gratis — kortdetaljer lagres, men du belastes ikke de første 14 dagene. Avslutt når som helst.
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
              {!inviteToken && (
                <div className="space-y-2">
                  <Label htmlFor="companyName">Bedriftsnavn</Label>
                  <Input id="companyName" name="companyName" required placeholder="Nordmann Rørlegger AS" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Ditt navn</Label>
                <Input id="name" name="name" required placeholder="Ola Nordmann" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-postadresse</Label>
                <Input id="email" name="email" type="email" required placeholder="ola@bedrift.no" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Passord</Label>
                <Input id="password" name="password" type="password" required minLength={8} placeholder="••••••••" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                {loading
                  ? (inviteToken ? 'Oppretter konto...' : 'Sender til betaling...')
                  : (inviteToken ? 'Bli med i teamet' : 'Start prøveperiode — legg inn kort')}
              </Button>
              {!inviteToken && (
                <p className="text-xs text-center text-slate-500">
                  Du blir ikke belastet de første 14 dagene. Etter prøveperioden er prisen 1 290 kr/mnd.
                </p>
              )}
              <p className="text-center text-sm text-muted-foreground">
                Har du allerede en konto?{' '}
                <Link href="/login" className="underline hover:text-primary">Logg inn her</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    // Create Stripe Checkout session — card required, 14-day free trial
    const res = await fetch('/api/stripe/register-checkout', {
      method: 'POST',
      body: JSON.stringify({
        companyName: formData.get('companyName'),
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok || !data.url) {
      setError(data.error ?? 'Klarte ikke starte registrering. Prøv igjen.');
      return;
    }

    // Redirect to Stripe Checkout — card collected, account created after verification
    window.location.href = data.url;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">FP</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">FlowPilot</span>
          </Link>
        </div>
        
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Start gratis prøveperiode</CardTitle>
            <CardDescription>
              14 dager gratis — kortdetaljer lagres, men du belastes ikke de første 14 dagene. Avslutt naar som helst.
            </CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="companyName">Bedriftsnavn</Label>
              <Input
                id="companyName"
                name="companyName"
                required
                placeholder="Nordmann Rørlegger AS"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Ditt navn</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Ola Nordmann"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-postadresse</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="ola@bedrift.no"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passord</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? 'Sender til betaling...' : 'Start prøveperiode — legg inn kort'}
            </Button>
            <p className="text-xs text-center text-slate-500">
              Du blir ikke belastet de første 14 dagene. Etter prøveperioden er prisen 1 290 kr/mnd og du kan avslutte naar som helst.
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Har du allerede en konto?{' '}
              <Link href="/login" className="underline hover:text-primary">
                Logg inn her
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
