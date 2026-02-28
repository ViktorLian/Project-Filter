'use client';

import { useState } from 'react';

export function DemoVideo() {
  const [playing, setPlaying] = useState(false);

  // SharePoint embed URL for the FlowPilot demo video
  const VIDEO_EMBED_URL = 'https://www.youtube.com/embed/pI7w8OllM-k?rel=0';

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12">
          <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            Se det i aksjon
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Se FlowPilot i aksjon
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            En gjennomgang av dashboardet – hopp til den delen som er relevant for deg.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-4 py-2 rounded-full">
            <span>⚠</span>
            Merk: Videoen viser en eldre versjon av FlowPilot. Vi har siden lagt til 30+ nye moduler og systemet er kraftig forbedret.
          </div>
        </div>

        {/* Video container */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-slate-900 aspect-video group">
          {!playing ? (
            <>
              {/* Thumbnail overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-slate-900/90 flex flex-col items-center justify-center gap-6 z-10">
                {/* Mock dashboard screenshot */}
                <div className="absolute inset-0 opacity-20 bg-[url('/dashboard-preview.png')] bg-cover bg-center" />

                {/* Play button */}
                <button
                  onClick={() => setPlaying(true)}
                  className="relative z-20 group/btn flex items-center gap-4 bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm rounded-2xl px-8 py-5 transition-all duration-300 hover:scale-105"
                  aria-label="Spill av demo-video"
                >
                  <div className="h-14 w-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg group-hover/btn:bg-blue-400 transition-colors">
                    <svg className="h-6 w-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold text-lg">Se full gjennomgang</p>
                    <p className="text-white/70 text-sm">Dashboardoversikt – se det som passer deg</p>
                  </div>
                </button>

                {/* Feature highlights shown on thumbnail */}
                <div className="relative z-20 flex gap-4 flex-wrap justify-center">
                  {['Automatisk leadscoring', 'AI-assistent', 'Fakturaer på sekunder', 'Google-anmeldelser'].map(f => (
                    <span key={f} className="bg-white/10 border border-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Duration badge */}
              <div className="absolute bottom-4 right-4 z-20 bg-black/60 text-white text-xs px-2 py-1 rounded">
                Full oversikt
              </div>
            </>
          ) : (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={VIDEO_EMBED_URL}
              title="FlowPilot Demo"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          )}

          {/* Decorative gradient frame */}
          {!playing && (
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none" />
          )}
        </div>

        {/* Below video CTA */}
        <div className="mt-10 text-center">
          <p className="text-slate-600 mb-4">
            Klar til å prøve selv? Start gratis — ingen binding.
          </p>
          <a
            href="/register"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-md"
          >
            Start 14-dagers prøveperiode gratis
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
          <p className="text-xs text-slate-400 mt-3">
            Kort registrert — du belastes ikke de første 14 dagene.
          </p>
        </div>
      </div>
    </section>
  );
}
