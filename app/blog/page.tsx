'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { allPosts, categories } from '@/lib/blog';

const categoryColors: Record<string, string> = {
  'Grunnleggende CRM': 'bg-blue-100 text-blue-700',
  'Kundebevaring': 'bg-green-100 text-green-700',
  'Nisje-guider': 'bg-purple-100 text-purple-700',
  'Automatisering': 'bg-orange-100 text-orange-700',
  'Salg': 'bg-red-100 text-red-700',
  'Leadsgenerering': 'bg-yellow-100 text-yellow-700',
  'Økonomi': 'bg-emerald-100 text-emerald-700',
  'Digital markedsføring': 'bg-pink-100 text-pink-700',
  'Teknologi': 'bg-cyan-100 text-cyan-700',
  'Analyse': 'bg-indigo-100 text-indigo-700',
  'Vekst': 'bg-teal-100 text-teal-700',
  'Produktsammenligninger': 'bg-amber-100 text-amber-700',
  'Om FlowPilot': 'bg-violet-100 text-violet-700',
};

function getCategoryColor(cat: string) {
  return categoryColors[cat] ?? 'bg-gray-100 text-gray-700';
}

export default function BlogPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Alle');

  const filtered = useMemo(() => {
    return allPosts.filter((post) => {
      const matchesSearch =
        search.trim() === '' ||
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === 'Alle' || post.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3">
            FlowPilot Blogg
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Lær å vokse bedriften din
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Praktiske guider om CRM, automatisering og salg for norske
            SMB-bedrifter. Ingen buzz – bare det som faktisk fungerer.
          </p>
          <div className="mt-8 max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Søk i alle artikler..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-3 rounded-xl text-gray-900 text-base shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Category filter */}
      <section className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {['Alle', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Posts grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg">Ingen artikler matchet søket ditt.</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('Alle'); }}
              className="mt-4 text-blue-600 underline text-sm"
            >
              Tilbakestill filter
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">
              Viser {filtered.length} av {allPosts.length} artikler
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                >
                  {/* Color accent top bar */}
                  <div
                    className={`h-1.5 w-full ${getCategoryColor(post.category).split(' ')[0]}`}
                  />
                  <div className="p-6 flex flex-col flex-1">
                    <span
                      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${getCategoryColor(post.category)}`}
                    >
                      {post.category}
                    </span>
                    <h2 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-sm text-gray-500 flex-1 line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-4 border-t border-gray-50">
                      <span>
                        {new Date(post.date).toLocaleDateString('nb-NO', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      <span>{post.readTime} min lesing</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      {/* CTA */}
      <section className="bg-slate-900 text-white py-16 px-4 text-center">
        <h2 className="text-2xl font-bold mb-3">Klar til å bruke det du har lest?</h2>
        <p className="text-slate-300 mb-6 max-w-md mx-auto">
          Start en gratis 14-dagers prøveperiode av FlowPilot – ingen betalingskort nødvendig.
        </p>
        <Link
          href="/register"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Prøv FlowPilot gratis
        </Link>
      </section>
    </main>
  );
}
