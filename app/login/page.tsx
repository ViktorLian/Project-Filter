'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

function LoginForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await signIn('credentials', {
      redirect: false,
      email: formData.get('email'),
      password: formData.get('password'),
    });

    setLoading(false);

    if (res?.error) {
      setError('Invalid email or password');
      return;
    }

    router.push('/dashboard');
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
            <CardTitle>Logg inn på FlowPilot</CardTitle>
            <CardDescription>
              Tilgang til ditt dashboard og alle verktøy
            </CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {params.get('registered') && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-3 rounded-md">
                ✅ Konto opprettet! Du kan nå logge inn.
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded-md">
                Feil e-post eller passord. Prøv igjen.
              </div>
            )}
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
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? 'Logger inn...' : 'Logg inn'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Har du ikke konto?{' '}
              <Link href="/register" className="underline hover:text-primary">
                Registrer deg gratis
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
