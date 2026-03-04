import Link from 'next/link';
import {
  Wrench, Zap, Hammer, Paintbrush, Sparkles, Scissors, Heart,
  Dumbbell, BookOpen, Monitor, Home, Building2, Receipt, Truck,
  Car, Megaphone, Smile, Scale, Leaf, ArrowRight, LayoutDashboard,
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

export const metadata = { title: 'Bransjedemonstrasjoner – FlowPilot' };

export default function PreviewIndexPage() {
  const groups = Array.from(new Set(NICHES.map(n => n.category)));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">FP</div>
            <span className="font-bold text-slate-800 text-sm">FlowPilot</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-500 hover:text-slate-700 font-medium">Logg inn</Link>
            <Link href="/register" className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-colors">
              Start gratis
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-indigo-200 mb-4">
            <LayoutDashboard className="h-3.5 w-3.5" />
            Live demo – ingen innlogging novendig
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Velg din bransje</h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Se hvordan FlowPilot ser ut for akkurat din bransje – med ekte moduler,
            KPI-kort og grafer tilpasset det du holder pa med.
          </p>
        </div>

        {/* Niche cards grouped by category */}
        {groups.map(cat => {
          const niches = NICHES.filter(n => n.category === cat);
          return (
            <div key={cat} className="mb-10">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">{cat}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {niches.map(niche => {
                  const Icon = NICHE_ICONS[niche.id] || LayoutDashboard;
                  return (
                    <Link key={niche.id} href={`/preview/${niche.id}`}
                      className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col gap-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-800 text-sm truncate">{niche.name}</h3>
                            {niche.popular && (
                              <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full flex-shrink-0">Populær</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{niche.tagline}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <p className="text-xs text-slate-400">Fra</p>
                          <p className="text-sm font-bold text-slate-700">{niche.priceMonthly.toLocaleString('nb-NO')} kr/mnd</p>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:gap-2 transition-all">
                          Se dashboard <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Bottom CTA */}
        <div className="mt-4 bg-slate-900 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Klar til a starte?</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            Alle bransjene inkluderer full tilgang til leads, fakturaer, automatisering og mer.
            Ingen kredittkort kreves for a starte.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
            Start gratis <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
