'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    if (countdown === 0) {
      window.location.href = '/login?registered=1';
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center mb-4">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">FP</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">FlowPilot</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="flex items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Betaling bekreftet!</h1>
            <p className="text-slate-600">
              Kontoen din opprettes naer. Du vil motta en velkomstepost med innloggingsinformasjon om noen sekunder.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left space-y-2">
            <h3 className="font-semibold text-blue-900">Hva skjer naa?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>1. Kontoen din opprettes automatisk</li>
              <li>2. Du mottar en velkomstepost</li>
              <li>3. Logg inn og start proveperioden</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <strong>Proveperiode:</strong> Du belastes ikke de forste 14 dagene. Etter proveperioden er prisen 1 290 kr/mnd. Du kan avslutte naar som helst fra Innstillinger.
          </div>

          <div className="space-y-3">
            <Button
              asChild
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Link href="/login?registered=1">
                Gaa til innlogging naa
              </Link>
            </Button>
            <p className="text-sm text-slate-500">
              Omdirigerer automatisk om {countdown} sekunder...
            </p>
          </div>
        </div>

        {sessionId && (
          <p className="mt-4 text-xs text-slate-400">
            Session: {sessionId.slice(0, 20)}...
          </p>
        )}
      </div>
    </div>
  );
}

export default function RegisterSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">Laster...</p></div>}>
      <SuccessContent />
    </Suspense>
  );
}

  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    if (countdown === 0) {
      window.location.href = '/login?registered=1';
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center mb-4">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">FP</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">FlowPilot</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="flex items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Betaling bekreftet!</h1>
            <p className="text-slate-600">
              Kontoen din opprettes naer. Du vil motta en velkomstepost med innloggingsinformasjon om noen sekunder.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left space-y-2">
            <h3 className="font-semibold text-blue-900">Hva skjer naa?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>1. Kontoen din opprettes automatisk</li>
              <li>2. Du mottar en velkomstepost</li>
              <li>3. Logg inn og start proveperioden</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <strong>Proveperiode:</strong> Du belastes ikke de forste 14 dagene. Etter proveperioden er prisen 1 290 kr/mnd. Du kan avslutte naar som helst fra Innstillinger.
          </div>

          <div className="space-y-3">
            <Button
              asChild
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Link href="/login?registered=1">
                Gaa til innlogging naa
              </Link>
            </Button>
            <p className="text-sm text-slate-500">
              Omdirigerer automatisk om {countdown} sekunder...
            </p>
          </div>
        </div>

        {sessionId && (
          <p className="mt-4 text-xs text-slate-400">
            Session: {sessionId.slice(0, 20)}...
          </p>
        )}
      </div>
    </div>
  );
}
