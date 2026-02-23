'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface JobType {
  id: string;
  label: string;
  baseHours: number;
  materialPct: number;
  difficultyFactor: number;
}

const jobTypes: JobType[] = [
  { id: 'simple', label: 'Enkelt arbeid (reparasjon, service)', baseHours: 2, materialPct: 0.15, difficultyFactor: 1.0 },
  { id: 'medium', label: 'Middels jobb (installasjon, utskifting)', baseHours: 6, materialPct: 0.25, difficultyFactor: 1.15 },
  { id: 'large', label: 'Stor jobb (renovering, nyinstallasjon)', baseHours: 20, materialPct: 0.35, difficultyFactor: 1.3 },
  { id: 'emergency', label: 'Akutt/nødarbeid (utenom arbeidstid)', baseHours: 2, materialPct: 0.15, difficultyFactor: 2.0 },
  { id: 'consulting', label: 'Rådgivning og befaring', baseHours: 1.5, materialPct: 0, difficultyFactor: 1.0 },
];

export default function PriceCalculatorPage() {
  const [jobType, setJobType] = useState<string>('medium');
  const [hourlyRate, setHourlyRate] = useState(780);
  const [customHours, setCustomHours] = useState('');
  const [materialsKnown, setMaterialsKnown] = useState<'known' | 'estimate'>('estimate');
  const [materialsCost, setMaterialsCost] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [riggFee, setRiggFee] = useState(true);
  const [marginPct, setMarginPct] = useState(28);
  const [aiAdvice, setAiAdvice] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const selectedJob = jobTypes.find(j => j.id === jobType)!;
  const hours = customHours ? parseFloat(customHours) : selectedJob.baseHours;
  const laborCost = hours * hourlyRate * selectedJob.difficultyFactor;

  const mats = materialsKnown === 'known' && materialsCost
    ? parseFloat(materialsCost)
    : laborCost * selectedJob.materialPct;

  const travel = distanceKm ? parseFloat(distanceKm) * 8 : 0; // 8 kr/km
  const rigg = riggFee && selectedJob.id !== 'consulting' ? 450 : 0;
  const subtotal = laborCost + mats + travel + rigg;
  const marginAmount = subtotal * (marginPct / 100);
  const totalExVat = subtotal + marginAmount;
  const vat = totalExVat * 0.25;
  const totalIncVat = totalExVat + vat;

  const lowPrice = Math.round(totalExVat * 0.9 / 100) * 100;
  const midPrice = Math.round(totalExVat / 100) * 100;
  const highPrice = Math.round(totalExVat * 1.15 / 100) * 100;

  async function getAIPriceAdvice() {
    setLoadingAI(true);
    setAiAdvice('');
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Jeg er en norsk ${selectedJob.label.toLowerCase()} bedrift. Estimert jobb:
- Arbeidstimer: ${hours.toFixed(1)} timer
- Timepris: ${hourlyRate} kr
- Materialkostnad: ${Math.round(mats)} kr
- Kalkulert pris eks. MVA: ${Math.round(totalExVat)} kr
- Margin satt: ${marginPct}%
- Jobtype: ${selectedJob.label}

Gi meg råd om:
1. Er prisen konkurransedyktig for det norske markedet?
2. Bør jeg justere opp eller ned basert på jobtypen?
3. Hva er viktig å nevne i tilbudet for å rettferdiggjøre prisen?
Svar på norsk, max 150 ord.`,
        }),
      });
      const data = await res.json();
      setAiAdvice(data.reply || data.message || 'Klarte ikke hente AI-råd.');
    } catch {
      setAiAdvice('Klarte ikke hente AI-råd. Sjekk tilkobling.');
    }
    setLoadingAI(false);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Prisskalkulator</h1>
        <p className="text-slate-500 mt-1">Kalkuler riktig pris på jobber — aldri underpris igjen</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Jobbdetaljer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm mb-2 block">Type jobb</Label>
                <div className="space-y-2">
                  {jobTypes.map(jt => (
                    <button
                      key={jt.id}
                      onClick={() => setJobType(jt.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${jobType === jt.id ? 'border-blue-500 bg-blue-50 text-blue-900 font-medium' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      {jt.label}
                      {jt.difficultyFactor > 1 && (
                        <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                          x{jt.difficultyFactor} faktor
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm mb-1 block">Timepris (kr)</Label>
                  <Input
                    type="number"
                    value={hourlyRate}
                    onChange={e => setHourlyRate(parseInt(e.target.value) || 0)}
                    min={200}
                    max={3000}
                  />
                </div>
                <div>
                  <Label className="text-sm mb-1 block">Timer (tom = standard)</Label>
                  <Input
                    type="number"
                    value={customHours}
                    onChange={e => setCustomHours(e.target.value)}
                    placeholder={`${selectedJob.baseHours}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kostnader</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm mb-2 block">Materialer</Label>
                <div className="flex gap-2 mb-2">
                  <button onClick={() => setMaterialsKnown('estimate')} className={`flex-1 px-3 py-1.5 text-sm rounded-lg border ${materialsKnown === 'estimate' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200'}`}>
                    Estimer ({Math.round(selectedJob.materialPct * 100)}%)
                  </button>
                  <button onClick={() => setMaterialsKnown('known')} className={`flex-1 px-3 py-1.5 text-sm rounded-lg border ${materialsKnown === 'known' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200'}`}>
                    Kjent beløp
                  </button>
                </div>
                {materialsKnown === 'known' && (
                  <Input
                    type="number"
                    value={materialsCost}
                    onChange={e => setMaterialsCost(e.target.value)}
                    placeholder="Kr inkl. frakt"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm mb-1 block">Kjøring (km)</Label>
                  <Input
                    type="number"
                    value={distanceKm}
                    onChange={e => setDistanceKm(e.target.value)}
                    placeholder="0"
                  />
                  <p className="text-xs text-slate-400 mt-0.5">8 kr/km</p>
                </div>
                <div>
                  <Label className="text-sm mb-1 block">Margin (%)</Label>
                  <Input
                    type="number"
                    value={marginPct}
                    onChange={e => setMarginPct(parseInt(e.target.value) || 0)}
                    min={0}
                    max={100}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setRiggFee(!riggFee)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${riggFee ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-1 h-4 w-4 bg-white rounded-full shadow transition-transform ${riggFee ? 'left-5' : 'left-1'}`} />
                </button>
                <span className="text-sm text-slate-600">Rigg- og administrasjonsgebyr (450 kr)</span>
              </div>

              <Button onClick={() => setShowResult(true)} className="w-full bg-blue-600 hover:bg-blue-700">
                Kalkuler pris
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Result */}
        <div className="space-y-4">
          {showResult ? (
            <>
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="text-base text-green-900">Kalkulert pris</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: 'Arbeidskostand', value: Math.round(laborCost) },
                    { label: 'Materialer', value: Math.round(mats) },
                    travel > 0 && { label: 'Kjøring', value: Math.round(travel) },
                    rigg > 0 && { label: 'Rigg/admin', value: rigg },
                    { label: 'Fortjeneste (margin)', value: Math.round(marginAmount) },
                  ].filter(Boolean).map((row: any, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-600">{row.label}</span>
                      <span className="font-medium">{row.value.toLocaleString('nb-NO')} kr</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>eks. MVA</span>
                      <span>{Math.round(totalExVat).toLocaleString('nb-NO')} kr</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>MVA (25%)</span>
                      <span>+ {Math.round(vat).toLocaleString('nb-NO')} kr</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-green-700 mt-1">
                      <span>inkl. MVA</span>
                      <span>{Math.round(totalIncVat).toLocaleString('nb-NO')} kr</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price range */}
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-slate-700 mb-3">Prisintervall (eks. MVA)</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs text-amber-600 mb-1">Lav pris</p>
                      <p className="font-bold text-amber-700">{lowPrice.toLocaleString('nb-NO')} kr</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 border-2 border-blue-400 rounded-lg">
                      <p className="text-xs text-blue-600 mb-1">Anbefalt</p>
                      <p className="font-bold text-blue-700">{midPrice.toLocaleString('nb-NO')} kr</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-600 mb-1">Premium</p>
                      <p className="font-bold text-green-700">{highPrice.toLocaleString('nb-NO')} kr</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI advice */}
              <Card className="border-purple-200 bg-purple-50/30">
                <CardContent className="p-4 space-y-3">
                  {aiAdvice ? (
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{aiAdvice}</p>
                  ) : (
                    <p className="text-sm text-purple-700">Få AI-råd om prisen din er konkurransedyktig i det norske markedet.</p>
                  )}
                  <Button
                    onClick={getAIPriceAdvice}
                    disabled={loadingAI}
                    variant="outline"
                    className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    {loadingAI ? 'Henter råd...' : 'Spør AI om prisen'}
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-64 flex items-center justify-center">
              <p className="text-slate-400 text-sm">Fyll inn detaljer og klikk "Kalkuler pris"</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
