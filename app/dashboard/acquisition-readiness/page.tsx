'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ReadinessCategory {
  id: string;
  title: string;
  description: string;
  score: number;
  maxScore: number;
  items: { label: string; done: boolean; critical: boolean }[];
}

const categories: ReadinessCategory[] = [
  {
    id: 'documentation',
    title: 'Dokumentasjon og prosesser',
    description: 'Har bedriften dokumenterte prosesser en ny eier kan følge?',
    score: 2,
    maxScore: 5,
    items: [
      { label: 'Alle jobbprosesser er skriftlig dokumentert', done: false, critical: true },
      { label: 'Prisstrategi og kalkylemodell er dokumentert', done: false, critical: true },
      { label: 'Leverandøravtaler og rabatter er dokumentert', done: true, critical: false },
      { label: 'Kundeliste med historikk finnes i CRM', done: true, critical: true },
      { label: 'HR-prosesser og ansettelseskontrakter er ordre', done: false, critical: false },
    ],
  },
  {
    id: 'finance',
    title: 'Økonomi og regnskap',
    description: 'Er økonomien oversiktlig og attraktiv for en kjøper?',
    score: 3,
    maxScore: 5,
    items: [
      { label: 'Siste 3 årsregnskap er rene og godkjente', done: true, critical: true },
      { label: 'Månedlig resultat føres løpende', done: true, critical: true },
      { label: 'Fortjenestegrad per jobb er kjent', done: false, critical: true },
      { label: 'Gjeldsstruktur er oversiktlig', done: true, critical: false },
      { label: 'Gjentakende inntekter (abonnement/serviceavtaler)', done: false, critical: false },
    ],
  },
  {
    id: 'customers',
    title: 'Kundebase og relasjoner',
    description: 'Er kundene knyttet til bedriften, ikke eieren personlig?',
    score: 2,
    maxScore: 5,
    items: [
      { label: 'Over 50% av kundene er bedriftskunder', done: false, critical: true },
      { label: 'Ingen enkelt kunde utgjør mer enn 30% av omsetning', done: true, critical: true },
      { label: 'Serviceavtaler eller gjentakende kontrakter finnes', done: false, critical: false },
      { label: 'Kunderelasjoner er ikke personavhengige', done: false, critical: true },
      { label: 'NPS-score eller tilfredshetsmålinger finnes', done: true, critical: false },
    ],
  },
  {
    id: 'team',
    title: 'Team og organisasjon',
    description: 'Kan bedriften drives uten deg?',
    score: 1,
    maxScore: 5,
    items: [
      { label: 'Det finnes en leder/daglig leder som ikke er eier', done: false, critical: true },
      { label: 'Nøkkelansatte har signert ansettelseskontrakter', done: true, critical: false },
      { label: 'Opplæringsmateriell for nye ansatte eksisterer', done: false, critical: false },
      { label: 'Kritisk kunnskap er ikke kun i hodene til eier', done: false, critical: true },
      { label: 'Bedriften kan drive 2 uker uten eier tilstede', done: false, critical: true },
    ],
  },
  {
    id: 'legal',
    title: 'Juridisk og compliance',
    description: 'Er alle juridiske forhold i orden?',
    score: 3,
    maxScore: 5,
    items: [
      { label: 'Selskapets vedtekter er oppdaterte', done: true, critical: false },
      { label: 'Alle lisenser og godkjenninger er i orden', done: true, critical: true },
      { label: 'Ingen pågående tvister eller søksmål', done: true, critical: true },
      { label: 'IP-rettigheter er registrert under selskapet', done: false, critical: false },
      { label: 'Forsikringer er tilstrekkelige', done: false, critical: false },
    ],
  },
];

const totalScore = categories.reduce((s, c) => s + c.score, 0);
const totalMax = categories.reduce((s, c) => s + c.maxScore, 0);
const overallPct = Math.round((totalScore / totalMax) * 100);

function getReadinessLabel(pct: number) {
  if (pct >= 80) return { label: 'Salgsklar', color: 'text-green-600', bg: 'bg-green-100' };
  if (pct >= 60) return { label: 'Nesten klar', color: 'text-blue-600', bg: 'bg-blue-100' };
  if (pct >= 40) return { label: 'Under arbeid', color: 'text-amber-600', bg: 'bg-amber-100' };
  return { label: 'Kritiske hull', color: 'text-red-600', bg: 'bg-red-100' };
}

export default function AcquisitionReadinessPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiPlan, setAiPlan] = useState('');

  const readiness = getReadinessLabel(overallPct);

  async function getAIPlan() {
    setLoadingAI(true);
    setAiPlan('');
    const criticalGaps = categories
      .flatMap(c => c.items.filter(i => !i.done && i.critical).map(i => `[${c.title}] ${i.label}`))
      .join('\n');

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Jeg vil gjøre bedriften min salgsklar for et eventuelt salg eller investering innen 2 år. 
Overordnet beredskapscore: ${overallPct}%
Kritiske mangler:
${criticalGaps}

Lag en prioritert 90-dagers handlingsplan med konkrete steg. Fokus på de viktigste kritiske manglene. Bruk norsk og vær spesifikk. Max 250 ord.`,
        }),
      });
      const data = await res.json();
      setAiPlan(data.message || data.response || 'Ingen respons.');
    } catch {
      setAiPlan('Klarte ikke hente AI-plan.');
    }
    setLoadingAI(false);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Selskapsberedskap</h1>
        <p className="text-slate-500 mt-1">Gjor bedriften din klar for salg, investering eller generasjonsskifte</p>
      </div>

      {/* Overall score */}
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative h-24 w-24 shrink-0">
              <svg viewBox="0 0 36 36" className="h-24 w-24 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={overallPct >= 80 ? '#16a34a' : overallPct >= 60 ? '#2563eb' : overallPct >= 40 ? '#d97706' : '#dc2626'}
                  strokeWidth="3"
                  strokeDasharray={`${overallPct} ${100 - overallPct}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-slate-900">{overallPct}%</span>
              </div>
            </div>
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${readiness.bg} ${readiness.color} mb-2`}>
                {readiness.label}
              </span>
              <h2 className="text-lg font-bold text-slate-800">Samlet selskapsberedskap</h2>
              <p className="text-slate-500 text-sm">
                {totalScore} av {totalMax} poeng oppnådd. {categories.flatMap(c => c.items.filter(i => !i.done && i.critical)).length} kritiske mangler gjenstår.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category breakdown */}
      <div className="space-y-3">
        {categories.map(cat => (
          <Card
            key={cat.id}
            className={`cursor-pointer transition-colors ${selected === cat.id ? 'border-blue-400 bg-blue-50/50' : 'hover:border-slate-300'}`}
            onClick={() => setSelected(selected === cat.id ? null : cat.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-slate-900">{cat.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">{cat.score}/{cat.maxScore}</span>
                      <div className="h-2 w-24 bg-slate-100 rounded-full">
                        <div
                          className={`h-2 rounded-full ${cat.score / cat.maxScore >= 0.8 ? 'bg-green-500' : cat.score / cat.maxScore >= 0.6 ? 'bg-blue-500' : cat.score / cat.maxScore >= 0.4 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${(cat.score / cat.maxScore) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500">{cat.description}</p>
                </div>
                <span className="text-slate-400 text-sm">{selected === cat.id ? '▲' : '▼'}</span>
              </div>

              {selected === cat.id && (
                <div className="mt-4 pt-4 border-t space-y-2">
                  {cat.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`mt-0.5 h-5 w-5 rounded shrink-0 flex items-center justify-center ${item.done ? 'bg-green-100' : item.critical ? 'bg-red-100' : 'bg-slate-100'}`}>
                        {item.done ? (
                          <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className={`text-xs font-bold ${item.critical ? 'text-red-600' : 'text-slate-400'}`}>
                            {item.critical ? '!' : '–'}
                          </span>
                        )}
                      </div>
                      <span className={`text-sm ${item.done ? 'text-slate-500 line-through' : item.critical ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                        {item.label}
                        {item.critical && !item.done && <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Kritisk</span>}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Plan */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-base text-blue-900">90-dagers plan for aa bli salgsklar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiPlan ? (
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{aiPlan}</p>
          ) : (
            <p className="text-sm text-blue-700">
              Basert paa dine kritiske mangler, lag AI en konkret 90-dagers handlingsplan for aa gjore bedriften salgsklar.
            </p>
          )}
          <Button
            onClick={getAIPlan}
            disabled={loadingAI}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loadingAI ? 'Genererer plan...' : aiPlan ? 'Oppdater plan' : 'Lag 90-dagers plan'}
          </Button>
        </CardContent>
      </Card>

      <p className="text-xs text-center text-slate-400">
        Data er simulert for demonstrasjon. Koble til dine faktiske data via Innstillinger for full analyse.
      </p>
    </div>
  );
}
