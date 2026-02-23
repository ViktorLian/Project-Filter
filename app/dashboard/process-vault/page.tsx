'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Process {
  id: string;
  category: string;
  title: string;
  description: string;
  steps: string[];
  owner: string;
  lastUpdated: string;
  critical: boolean;
}

const initialProcesses: Process[] = [
  {
    id: '1',
    category: 'Salg',
    title: 'Lead kvalifisering',
    description: 'Hvordan vi vurderer og prioriterer nye henvendelser',
    steps: [
      'Motta henvendelse via nettskjema eller telefon',
      'Registrer lead i FlowPilot med all info',
      'Score lead basert på jobtype, størrelse og beliggenhet',
      'Ta kontakt innen 2 timer for leads over 70 poeng',
      'Send tilbud innen 48 timer',
    ],
    owner: 'Salgsansvarlig',
    lastUpdated: '2024-11-15',
    critical: true,
  },
  {
    id: '2',
    category: 'Operasjon',
    title: 'Jobbgjenomforing',
    description: 'Steg-for-steg gjennomforing av en oppdrag',
    steps: [
      'Bekreft booking med kunden 24t i forveien',
      'Forbered verktoy og materiell kvelden for',
      'Sjekk inn hos kunden, forklar arbeidsomfang',
      'Utfor arbeid i henhold til HMS-regler',
      'Ta bilder for og etter for dokumentasjon',
      'Gjennomfor sluttkontroll med kunden',
      'Send faktura innen 24 timer',
    ],
    owner: 'Fagleder',
    lastUpdated: '2024-10-22',
    critical: true,
  },
  {
    id: '3',
    category: 'Okonomi',
    title: 'Fakturering og oppfolging',
    description: 'Rutine for faktura og betaling',
    steps: [
      'Send faktura via system (30 dagers betalingsfrist)',
      'Automatisk purring etter 7 dager ubetalt',
      'Manuell oppfolging etter 14 dager',
      'Inkasso-varsel etter 30 dager',
    ],
    owner: 'Daglig leder',
    lastUpdated: '2024-09-10',
    critical: false,
  },
  {
    id: '4',
    category: 'HR',
    title: 'Onboarding nye ansatte',
    description: 'Introduksjon og opplaering for nye medarbeidere',
    steps: [
      'Send velkomst-e-post med praktisk info',
      'Forbered arbeidstoy, verktoykasse og adgangskort',
      'Dag 1: Omvisning og presentasjon for teamet',
      'Uke 1: Skygge erfaren ansatt pa alle oppdrag',
      'Uke 2-4: Gradvis overta egne oppdrag med veiledning',
      'Maaned 1: Evaluering og tilbakemelding',
    ],
    owner: 'Daglig leder',
    lastUpdated: '2024-08-05',
    critical: false,
  },
];

const categories = Array.from(new Set(initialProcesses.map(p => p.category)));

export default function ProcessVaultPage() {
  const [processes, setProcesses] = useState(initialProcesses);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState('Salg');
  const [newOwner, setNewOwner] = useState('');
  const [newSteps, setNewSteps] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');

  const filtered = selectedCategory
    ? processes.filter(p => p.category === selectedCategory)
    : processes;

  async function generateAIProcess() {
    if (!newTitle) return;
    setLoadingAI(true);
    setAiSuggestion('');
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Lag en detaljert steg-for-steg prosess for en norsk haandverksbedrift med tittelen: "${newTitle}". 
Kategorien er: ${newCat}. 
Inkluder 5-8 konkrete trinn. 
Formater som nummerert liste. Max 200 ord.`,
        }),
      });
      const data = await res.json();
      setAiSuggestion(data.message || data.response || '');
    } catch {
      setAiSuggestion('Klarte ikke generere prosess.');
    }
    setLoadingAI(false);
  }

  function addProcess() {
    if (!newTitle) return;
    const steps = newSteps
      ? newSteps.split('\n').filter(s => s.trim())
      : aiSuggestion
        ? aiSuggestion.split('\n').filter(s => s.trim())
        : [];

    setProcesses(prev => [
      ...prev,
      {
        id: String(Date.now()),
        category: newCat,
        title: newTitle,
        description: newDesc,
        steps,
        owner: newOwner || 'Ikke tildelt',
        lastUpdated: new Date().toISOString().split('T')[0],
        critical: false,
      },
    ]);
    setNewTitle(''); setNewDesc(''); setNewOwner(''); setNewSteps(''); setAiSuggestion('');
    setShowAdd(false);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prosessbibliotek</h1>
          <p className="text-slate-500 mt-1">Dokumenterte rutiner — bedriften din kan drives uten deg</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="bg-blue-600 hover:bg-blue-700">
          + Ny prosess
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Totalt prosesser</p>
            <p className="text-2xl font-bold text-slate-900">{processes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Kritiske prosesser</p>
            <p className="text-2xl font-bold text-red-600">{processes.filter(p => p.critical).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Kategorier</p>
            <p className="text-2xl font-bold text-slate-900">{categories.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Add new process */}
      {showAdd && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-base text-blue-900">Legg til ny prosess</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Tittel *</label>
                <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="f.eks. Reklamasjonshandtering" />
              </div>
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Kategori</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                >
                  {['Salg', 'Operasjon', 'Okonomi', 'HR', 'Kundeservice', 'Admin'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-600 mb-1 block">Beskrivelse</label>
              <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Kort beskrivelse av formålet" />
            </div>
            <div>
              <label className="text-xs text-slate-600 mb-1 block">Ansvarlig</label>
              <Input value={newOwner} onChange={e => setNewOwner(e.target.value)} placeholder="f.eks. Daglig leder" />
            </div>
            <div>
              <label className="text-xs text-slate-600 mb-1 block">Steg (ett per linje) — eller la AI generere</label>
              <Textarea
                value={newSteps || aiSuggestion}
                onChange={e => setNewSteps(e.target.value)}
                placeholder="1. Forste steg&#10;2. Andre steg&#10;3. Tredje steg"
                rows={5}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={generateAIProcess}
                disabled={loadingAI || !newTitle}
                className="flex-1"
              >
                {loadingAI ? 'Genererer...' : 'La AI lage steg'}
              </Button>
              <Button onClick={addProcess} disabled={!newTitle} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Lagre prosess
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${!selectedCategory ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}
        >
          Alle ({processes.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${selectedCategory === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}
          >
            {cat} ({processes.filter(p => p.category === cat).length})
          </button>
        ))}
      </div>

      {/* Process list */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(process => (
          <Card
            key={process.id}
            className={`cursor-pointer transition-colors ${selectedProcess?.id === process.id ? 'border-blue-400' : 'hover:border-slate-300'}`}
            onClick={() => setSelectedProcess(selectedProcess?.id === process.id ? null : process)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{process.category}</span>
                    {process.critical && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Kritisk</span>}
                  </div>
                  <h3 className="font-semibold text-slate-900">{process.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{process.description}</p>
                </div>
                <span className="text-slate-400 text-xs shrink-0 ml-2">{process.steps.length} steg</span>
              </div>

              {selectedProcess?.id === process.id && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  {process.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-xs bg-blue-100 text-blue-700 rounded-full h-5 w-5 flex items-center justify-center shrink-0 font-medium">
                        {i + 1}
                      </span>
                      <span className="text-sm text-slate-700">{step}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs text-slate-400 mt-3 pt-2 border-t">
                    <span>Ansvarlig: {process.owner}</span>
                    <span>Oppdatert: {process.lastUpdated}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
