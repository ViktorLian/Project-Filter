'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

type Plan = 'starter' | 'pro' | 'enterprise';
const PLAN_ORDER: Plan[] = ['starter', 'pro', 'enterprise'];

interface Props {
  requiredPlan: Plan;
  featureName: string;
  children: React.ReactNode;
}

interface SubInfo {
  plan: Plan;
  status: string;
  trialEndsAt: string | null;
}

let cached: SubInfo | null = null;
let cacheTime = 0;

async function fetchSub(): Promise<SubInfo> {
  if (cached && Date.now() - cacheTime < 60_000) return cached;
  const res = await fetch('/api/subscription', { cache: 'no-store' });
  const data = await res.json();
  cached = data;
  cacheTime = Date.now();
  return data;
}

export function SubscriptionGate({ requiredPlan, featureName, children }: Props) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    fetchSub().then((sub) => {
      const userIdx = PLAN_ORDER.indexOf(sub.plan as Plan);
      const reqIdx = PLAN_ORDER.indexOf(requiredPlan);
      if (userIdx >= reqIdx || sub.status === 'trialing') {
        setAllowed(true);
      } else {
        setAllowed(false);
      }
    }).catch(() => setAllowed(true)); // fail open — don't block on error
  }, [requiredPlan]);

  if (allowed === null) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
          <Lock className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Oppgradering krevd</h2>
        <p className="text-slate-500 max-w-sm mb-6">
          <span className="font-semibold text-slate-700">{featureName}</span> er ikke inkludert i din navarende plan.
          Oppgrader for aa fa tilgang.
        </p>
        <button
          onClick={() => router.push(`/dashboard/upgrade?required=${requiredPlan}&feature=${encodeURIComponent(featureName)}`)}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition"
        >
          Se oppgraderingsalternativer
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
