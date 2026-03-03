'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, CheckCircle, Star } from 'lucide-react';
import { NICHES, NICHE_CATEGORIES, type Niche } from '@/lib/niches';

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  blue:    { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   badge: 'bg-blue-600' },
  yellow:  { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', badge: 'bg-yellow-500' },
  amber:   { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  badge: 'bg-amber-600' },
  pink:    { bg: 'bg-pink-50',   text: 'text-pink-700',   border: 'border-pink-200',   badge: 'bg-pink-600' },
  cyan:    { bg: 'bg-cyan-50',   text: 'text-cyan-700',   border: 'border-cyan-200',   badge: 'bg-cyan-600' },
  rose:    { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200',   badge: 'bg-rose-600' },
  purple:  { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-600' },
  green:   { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  badge: 'bg-green-600' },
  teal:    { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200',   badge: 'bg-teal-600' },
  indigo:  { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', badge: 'bg-indigo-600' },
  slate:   { bg: 'bg-slate-50',  text: 'text-slate-700',  border: 'border-slate-200',  badge: 'bg-slate-600' },
  stone:   { bg: 'bg-stone-50',  text: 'text-stone-700',  border: 'border-stone-200',  badge: 'bg-stone-600' },
  orange:  { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-600' },
  sky:     { bg: 'bg-sky-50',    text: 'text-sky-700',    border: 'border-sky-200',    badge: 'bg-sky-600' },
  zinc:    { bg: 'bg-zinc-50',   text: 'text-zinc-700',   border: 'border-zinc-200',   badge: 'bg-zinc-600' },
  fuchsia: { bg: 'bg-fuchsia-50',text: 'text-fuchsia-700',border: 'border-fuchsia-200',badge: 'bg-fuchsia-600' },
  lime:    { bg: 'bg-lime-50',   text: 'text-lime-700',   border: 'border-lime-200',   badge: 'bg-lime-600' },
};

function NicheCard({ niche, onClick }: { niche: Niche; onClick: () => void }) {
  const c = COLOR_MAP[niche.color] ?? COLOR_MAP.blue;
  return (
    <button
      onClick={onClick}
      className={`group relative w-full text-left rounded-2xl border-2 ${c.border} ${c.bg} p-5 transition-all hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500`}
    >
      {niche.popular && (
        <span className={`absolute -top-2.5 right-4 ${c.badge} text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1`}>
          <Star className="h-2.5 w-2.5" /> Populær
        </span>
      )}
      <div className="flex items-start gap-3">
        <span className="text-3xl leading-none">{niche.emoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-sm ${c.text} leading-tight`}>{niche.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{niche.tagline}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className={`text-xs font-bold ${c.text}`}>fra {niche.priceMonthly.toLocaleString('nb-NO')} kr/mnd</span>
        <ArrowRight className={`h-4 w-4 ${c.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
      </div>
    </button>
  );
}

function NicheModal({ niche, onClose }: { niche: Niche; onClose: () => void }) {
  const c = COLOR_MAP[niche.color] ?? COLOR_MAP.blue;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${c.bg} rounded-t-3xl p-7 border-b ${c.border}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{niche.emoji}</span>
              <div>
                <p className={`text-xs font-semibold ${c.text} uppercase tracking-widest`}>{niche.category}</p>
                <h2 className="text-2xl font-black text-slate-900">{niche.name}</h2>
                <p className="text-sm text-slate-600 mt-1">{niche.tagline}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl font-light leading-none shrink-0">✕</button>
          </div>
          <div className={`mt-4 inline-flex items-center gap-2 rounded-xl ${c.badge} text-white px-4 py-2`}>
            <span className="text-lg font-black">{niche.priceMonthly.toLocaleString('nb-NO')} kr</span>
            <span className="text-sm opacity-80">/ mnd inkl. alt</span>
          </div>
        </div>

        <div className="p-7 space-y-6">
          {/* Pain points */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Problemer vi løser for deg</h3>
            <ul className="space-y-2">
              {niche.pains.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-0.5 text-red-400 shrink-0">✗</span> {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Niche features */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              {niche.nicheFeatures.length} funksjoner laget for {niche.name.toLowerCase()}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {niche.nicheFeatures.map((f, i) => (
                <div key={i} className={`rounded-xl border ${c.border} ${c.bg} p-3`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{f.icon}</span>
                    <span className={`text-xs font-bold ${c.text}`}>{f.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Base features */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Inkludert i alle pakker</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {niche.baseFeatures.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  {f.name}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3 pt-2">
            <Link
              href={`/register?niche=${niche.id}`}
              className={`flex-1 text-center rounded-xl ${c.badge} text-white font-bold py-3 hover:opacity-90 transition`}
            >
              Start 14 dager gratis →
            </Link>
            <Link
              href="/bli-kunde"
              className="px-5 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold py-3 hover:bg-slate-50 transition text-sm"
            >
              Snakk med oss
            </Link>
          </div>
          <p className="text-center text-xs text-slate-400">Ingen binding. Ingen kredittkort.</p>
        </div>
      </div>
    </div>
  );
}

export function NicheSection() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<Niche | null>(null);

  const filtered = useMemo(() => {
    return NICHES.filter(n => {
      const matchesSearch = !search || n.name.toLowerCase().includes(search.toLowerCase()) ||
        n.category.toLowerCase().includes(search.toLowerCase()) ||
        n.tagline.toLowerCase().includes(search.toLowerCase());
      const matchesCat = !activeCategory || n.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [search, activeCategory]);

  const categories = NICHE_CATEGORIES;

  return (
    <section className="py-20 bg-[#0a0f1a]" id="nisjer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-blue-500/10 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-500/20 mb-4 uppercase tracking-widest">
            Spesialisert for din bransje
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            FlowPilot er bygget for<br />
            <span className="text-blue-400">akkurat deg</span>
          </h2>
          <p className="mt-4 text-slate-400 text-lg max-w-2xl mx-auto">
            Vi har ikke laget ett generelt system for alle. Vi har laget spesialiserte verktøy for {NICHES.length}+ bransjer — med funksjoner som faktisk løser problemene du har hver dag.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder='Søk etter din bransje — f.eks. "frisør"'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition border ${
              !activeCategory ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/30'
            }`}
          >
            Alle
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition border ${
                activeCategory === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg">Ingen bransje funnet for "{search}"</p>
            <p className="text-sm mt-2">Ta kontakt — vi lager en løsning for deg.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(niche => (
              <NicheCard key={niche.id} niche={niche} onClick={() => setSelected(niche)} />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-slate-400 text-sm mb-4">Finner du ikke din bransje? Vi tilpasser oss.</p>
          <Link
            href="/bli-kunde"
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition text-sm"
          >
            Ta kontakt for skreddersydd løsning <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Modal */}
      {selected && <NicheModal niche={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
