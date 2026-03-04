import Link from 'next/link';
import {
  Wrench, Zap, Hammer, Paintbrush, Sparkles, Scissors, Heart, Dumbbell,
  BookOpen, Monitor, Home, Building2, Receipt, Truck, Car, Megaphone,
  Smile, Scale, Leaf, Target,
} from 'lucide-react';
import { NICHES } from '@/lib/niches';

const NICHE_ICONS: Record<string, React.ElementType> = {
  rorlegger: Wrench, elektriker: Zap, snekker: Hammer, maler: Paintbrush,
  rengjoring: Sparkles, frisor: Scissors, hudpleie: Heart,
  'personlig-trener': Dumbbell, regnskapsforer: BookOpen, 'it-konsulent': Monitor,
  eiendomsmegler: Home, vaktmester: Building2, restaurant: Receipt,
  transport: Truck, bilverksted: Car, markedsbyra: Megaphone,
  tannlege: Smile, advokat: Scale, landbruk: Leaf,
};

const NICHE_COLORS: Record<string, { bg: string; text: string; border: string; light: string }> = {
  rorlegger: { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' },
  elektriker: { bg: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-200', light: 'bg-yellow-50' },
  snekker: { bg: 'bg-amber-600', text: 'text-amber-700', border: 'border-amber-200', light: 'bg-amber-50' },
  maler: { bg: 'bg-pink-500', text: 'text-pink-600', border: 'border-pink-200', light: 'bg-pink-50' },
  rengjoring: { bg: 'bg-cyan-600', text: 'text-cyan-700', border: 'border-cyan-200', light: 'bg-cyan-50' },
  frisor: { bg: 'bg-rose-500', text: 'text-rose-600', border: 'border-rose-200', light: 'bg-rose-50' },
  hudpleie: { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-200', light: 'bg-purple-50' },
  'personlig-trener': { bg: 'bg-green-600', text: 'text-green-700', border: 'border-green-200', light: 'bg-green-50' },
  regnskapsforer: { bg: 'bg-teal-600', text: 'text-teal-700', border: 'border-teal-200', light: 'bg-teal-50' },
  'it-konsulent': { bg: 'bg-indigo-600', text: 'text-indigo-700', border: 'border-indigo-200', light: 'bg-indigo-50' },
  eiendomsmegler: { bg: 'bg-slate-700', text: 'text-slate-700', border: 'border-slate-300', light: 'bg-slate-100' },
  vaktmester: { bg: 'bg-stone-600', text: 'text-stone-700', border: 'border-stone-200', light: 'bg-stone-50' },
  restaurant: { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-200', light: 'bg-orange-50' },
  transport: { bg: 'bg-sky-600', text: 'text-sky-700', border: 'border-sky-200', light: 'bg-sky-50' },
  bilverksted: { bg: 'bg-zinc-700', text: 'text-zinc-700', border: 'border-zinc-300', light: 'bg-zinc-100' },
  markedsbyra: { bg: 'bg-fuchsia-600', text: 'text-fuchsia-700', border: 'border-fuchsia-200', light: 'bg-fuchsia-50' },
  tannlege: { bg: 'bg-sky-500', text: 'text-sky-600', border: 'border-sky-200', light: 'bg-sky-50' },
  advokat: { bg: 'bg-slate-800', text: 'text-slate-800', border: 'border-slate-300', light: 'bg-slate-50' },
  landbruk: { bg: 'bg-lime-600', text: 'text-lime-700', border: 'border-lime-300', light: 'bg-lime-50' },
};

export default function PreviewIndexPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="text-lg font-black text-slate-900 tracking-tight">FlowPilot</Link>
        <Link href="/register" className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          Start gratis
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900">Velg din bransje</h1>
          <p className="text-slate-500 mt-2 text-base">{NICHES.length} spesialiserte dashboards — hvert bygget for den nisjen</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {NICHES.map(niche => {
            const I = NICHE_ICONS[niche.id] || Target;
            const nc = NICHE_COLORS[niche.id] ?? { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' };
            const moduleCount = niche.modules.filter(m => m !== 'dashboard').length;
            return (
              <Link key={niche.id} href={`/preview/${niche.id}`}
                className="group flex items-start gap-4 bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all">
                <div className={`h-11 w-11 rounded-xl ${nc.bg} flex items-center justify-center flex-shrink-0`}>
                  <I className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{niche.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{niche.tagline}</p>
                    </div>
                    {niche.popular && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                        Populaer
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs font-bold ${nc.text}`}>fra {niche.priceMonthly.toLocaleString('nb-NO')} kr/mnd</span>
                    <span className="text-xs text-slate-400">{moduleCount} moduler</span>
                    <span className="text-xs text-slate-400">{niche.nicheFeatures.length} spesialverktoy</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
