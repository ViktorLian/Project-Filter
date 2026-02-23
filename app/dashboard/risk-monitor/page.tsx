'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RiskItem {
  id: string;
  category: string;
  label: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  advice: string;
}

const riskItems: RiskItem[] = [
  // Burnout indicators
  { id: 'hours', category: 'Overbelastning', label: 'Arbeider mer enn 50 timer per uke', severity: 'critical', score: 9, advice: 'Delegater minst 2 faste oppgaver denne uken. Uten handling risikerer du utbrenthet innen 6 måneder.' },
  { id: 'vacation', category: 'Overbelastning', label: 'Ingen ferie planlagt siste 12 måneder', severity: 'high', score: 7, advice: 'Book minst 1 uke ferie de neste 3 månedene. Hjernen din trenger nedtid for å prestere.' },
  { id: 'weekends', category: 'Overbelastning', label: 'Jobber i helger regelmessig', severity: 'medium', score: 5, advice: 'Sett grenser for helgearbeid. Kommuniser tydelige åpningstider til kunder.' },
  // Revenue risks
  { id: 'single-customer', category: 'Inntektsrisiko', label: 'En kunde utgjør over 40% av inntekt', severity: 'critical', score: 9, advice: 'Dette er en eksistensiell risiko. Start aktivt salg mot nye kunder umiddelbart.' },
  { id: 'no-recurring', category: 'Inntektsrisiko', label: 'Ingen gjentakende / abonnementsbaserte inntekter', severity: 'high', score: 8, advice: 'Vurder serviceavtaler eller vedlikeholdskontrakter. Selv 20% gjentakende inntekt reduserer risikoen betydelig.' },
  { id: 'seasonal', category: 'Inntektsrisiko', label: 'Sterk sesongvariasjon uten plan', severity: 'medium', score: 5, advice: 'Bygg kontantreserve i høysesong. Planlegg salgsaktiviteter i lavsesong.' },
  // Operational risks
  { id: 'key-person', category: 'Operasjonell', label: 'Bedriften kan ikke drifte en uke uten deg', severity: 'critical', score: 9, advice: 'Dokument dine 3 viktigste daglige oppgaver og lær opp en annen til å ta dem.' },
  { id: 'no-backup', category: 'Operasjonell', label: 'Ingen backup på kritisk utstyr eller kompetanse', severity: 'medium', score: 6, advice: 'Kartlegg single points of failure. Hva skjer om nøkkelkompetanse faller bort?' },
  // Financial risks
  { id: 'cashflow', category: 'Okonomi', label: 'Mindre enn 3 måneder kontantreserve', severity: 'high', score: 8, advice: 'Bygg opp en buffer på minst 3 måneder driftskostnader. Kutt unødvendige abonnementer umiddelbart.' },
  { id: 'debt', category: 'Okonomi', label: 'Kortsiktig gjeld overstiger kontantbeholdning', severity: 'high', score: 7, advice: 'Snakk med regnskapsforer om refinansiering. Prioriter betaling av dyr gjeld.' },
];

const criticalCount = riskItems.filter(r => r.severity === 'critical').length;
const highCount = riskItems.filter(r => r.severity === 'high').length;
const overallRisk = Math.round(riskItems.reduce((s, r) => s + r.score, 0) / riskItems.length * 10);

function RiskBadge({ severity }: { severity: RiskItem['severity'] }) {
  const map = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  };
  const labels = { low: 'Lav', medium: 'Middels', high: 'Høy', critical: 'Kritisk' };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[severity]}`}>
      {labels[severity]}
    </span>
  );
}

export default function RiskMonitorPage() {
  const [category, setCategory] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiReport, setAiReport] = useState('');

  const allCategories = Array.from(new Set(riskItems.map(r => r.category)));
  const filtered = category ? riskItems.filter(r => r.category === category) : riskItems;

  async function generateRiskReport() {
    setLoadingAI(true);
    setAiReport('');
    const criticals = riskItems.filter(r => r.severity === 'critical').map(r => r.label).join(', ');
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Du er en forretningsraadigiver. Analyser disse kritiske risikoene for en norsk gründer/SMB:
Kritiske risikoer: ${criticals}
Overordnet risiko-score: ${overallRisk}/100

Gi en ærlig, direkte analyse og de 3 viktigste tiltakene eieren MÅ ta de neste 30 dagene. 
Prioriter helse og bærekraft for eieren. Max 200 ord. Bruk norsk.`,
        }),
      });
      const data = await res.json();
      setAiReport(data.message || data.response || 'Ingen respons.');
    } catch {
      setAiReport('Klarte ikke hente risikoanalyse.');
    }
    setLoadingAI(false);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Risikomonitor</h1>
        <p className="text-slate-500 mt-1">Gründerhelse, overbelastning og forretningsrisiko — alt på ett sted</p>
      </div>

      {/* Risk overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={overallRisk >= 70 ? 'border-red-300 bg-red-50' : overallRisk >= 50 ? 'border-amber-300 bg-amber-50' : 'border-green-300 bg-green-50'}>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Samlet risiko</p>
            <p className={`text-3xl font-bold ${overallRisk >= 70 ? 'text-red-600' : overallRisk >= 50 ? 'text-amber-600' : 'text-green-600'}`}>
              {overallRisk}
              <span className="text-base font-normal">/100</span>
            </p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Kritiske</p>
            <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Høy risiko</p>
            <p className="text-3xl font-bold text-orange-600">{highCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Totalt faktorer</p>
            <p className="text-3xl font-bold text-slate-900">{riskItems.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Burnout alert */}
      {criticalCount >= 2 && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex gap-3">
          <div className="shrink-0 h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-red-800">OBS: Høy risiko for utbrenthet</p>
            <p className="text-sm text-red-700 mt-0.5">Du har {criticalCount} kritiske risikofaktorer. Se AI-risikoanalysen nedenfor for umiddelbare tiltak.</p>
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setCategory(null)} className={`px-3 py-1.5 rounded-full text-sm border ${!category ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}>
          Alle
        </button>
        {allCategories.map(c => (
          <button key={c} onClick={() => setCategory(c === category ? null : c)} className={`px-3 py-1.5 rounded-full text-sm border ${category === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Risk list */}
      <div className="space-y-3">
        {filtered.sort((a, b) => b.score - a.score).map(risk => (
          <Card
            key={risk.id}
            className={`cursor-pointer transition-colors ${expanded === risk.id ? 'border-blue-300' : 'hover:border-slate-300'} ${risk.severity === 'critical' ? 'border-red-200' : ''}`}
            onClick={() => setExpanded(expanded === risk.id ? null : risk.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${risk.severity === 'critical' ? 'bg-red-100 text-red-700' : risk.severity === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'}`}>
                  {risk.score}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-900">{risk.label}</span>
                    <RiskBadge severity={risk.severity} />
                    <span className="text-xs text-slate-400">{risk.category}</span>
                  </div>
                </div>
                <span className="text-slate-400 text-xs">{expanded === risk.id ? '▲' : '▼'}</span>
              </div>
              {expanded === risk.id && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-slate-700">{risk.advice}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Risk Analysis */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-base text-blue-900">AI-risikoanalyse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiReport ? (
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{aiReport}</p>
          ) : (
            <p className="text-sm text-blue-700">
              Få en ærlig analyse av de kritiske risikoene og en prioritert handlingsplan for de neste 30 dagene.
            </p>
          )}
          <Button
            onClick={generateRiskReport}
            disabled={loadingAI}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loadingAI ? 'Analyserer...' : aiReport ? 'Oppdater analyse' : 'Generer risikoanalyse'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
