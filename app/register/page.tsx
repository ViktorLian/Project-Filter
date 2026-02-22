'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({
        companyName: formData.get('companyName'),
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Registration failed');
      return;
    }

    router.push('/login?registered=1');
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
              14 dager gratis. Ingen bindingstid. Ingen kredittkort nødvendig.
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
              {loading ? 'Oppretter konto...' : 'Opprett gratis konto'}
            </Button>
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
