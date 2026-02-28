'use client';

import Link from 'next/link';
import { Lock, Zap } from 'lucide-react';

interface UpgradeGateProps {
  plan: 'pro' | 'enterprise';
  feature: string;
  children: React.ReactNode;
  locked?: boolean;
}

export default function UpgradeGate({ plan, feature, children, locked = false }: UpgradeGateProps) {
  if (!locked) return <>{children}</>;

  return (
    <div className="relative rounded-2xl overflow-hidden">
      <div className="pointer-events-none opacity-30 select-none blur-[2px]">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm rounded-2xl">
        <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 mb-4">
          <Lock className="h-6 w-6 text-amber-400" />
        </div>
        <p className="text-white font-bold text-lg mb-1">Låst funksjon</p>
        <p className="text-slate-400 text-sm text-center max-w-xs mb-5">
          {feature} krever <span className="text-amber-400 font-semibold capitalize">{plan}</span>-abonnement eller høyere.
        </p>
        <Link href={`/dashboard/upgrade?required=${plan}&feature=${encodeURIComponent(feature)}`}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition text-sm">
          <Zap className="h-4 w-4" /> Oppgrader nå
        </Link>
      </div>
    </div>
  );
}
