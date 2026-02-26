'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft, Star, AlertCircle, Copy, CheckCheck, ExternalLink, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import Link from 'next/link';

type QuestionType = 'text' | 'textarea' | 'number' | 'select' | 'radio' | 'checkbox';

type QuestionDraft = {
  id: string;
  question_text: string;
  question_type: QuestionType;
  required: boolean;
  options: string[];
  points: number;
  option_points: Record<string, number>;
  collapsed: boolean;
};

const QUESTION_LABELS: Record<QuestionType, string> = {
  text: 'Kort tekst',
  textarea: 'Lang tekst',
  number: 'Tall',
  select: 'Nedtrekksliste',
  radio: 'Flervalg (en)',
  checkbox: 'Avkryss (flere)',
};

export default function NewFormPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scoreThreshold, setScoreThreshold] = useState(80);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [createdForm, setCreatedForm] = useState<{ slug: string; id: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const totalPoints = questions.reduce((s, q) => s + (q.points || 0), 0);

  function addQuestion() {
    setQuestions(prev => [...prev, {
      id: crypto.randomUUID(),
      question_text: '',
      question_type: 'text',
      required: false,
      options: [],
      points: 10,
      option_points: {},
      collapsed: false,
    }]);
  }

  function updateQuestion(id: string, patch: Partial<QuestionDraft>) {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...patch } : q));
  }

  function removeQuestion(id: string) {
    setQuestions(prev => prev.filter(q => q.id !== id));
  }

  function handleOptionsChange(id: string, rawText: string) {
    const opts = rawText.split('\n').map(o => o.trim()).filter(o => o);
    const q = questions.find(q => q.id === id)!;
    const newOptionPoints: Record<string, number> = {};
    opts.forEach(o => { newOptionPoints[o] = q.option_points[o] ?? q.points; });
    updateQuestion(id, { options: opts, option_points: newOptionPoints });
  }

  function handleOptionPoints(qId: string, option: string, pts: number) {
    const q = questions.find(q => q.id === qId)!;
    updateQuestion(qId, { option_points: { ...q.option_points, [option]: pts } });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, questions, score_threshold: scoreThreshold }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Kunne ikke opprette skjema');
      }
      const form = await res.json();
      setCreatedForm({ slug: form.slug, id: form.id });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  if (createdForm) {
    const formUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://flowpilot.no'}/f/${createdForm.slug}`;
    const iframeCode = `<iframe\n  src="${formUrl}"\n  width="100%"\n  height="700"\n  frameborder="0"\n  style="border-radius:12px;box-shadow:0 2px 16px rgba(0,0,0,.08)"\n></iframe>`;
    const scriptCode = `<script src="https://flowpilot.no/widget.js" data-form="${createdForm.slug}" async></script>`;
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 mb-6 text-center">
          <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <CheckCheck className="h-7 w-7 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-emerald-900 mb-1">Skjema opprettet!</h2>
          <p className="text-emerald-700 text-sm">Del lenken eller embed-koden pa nettsiden din</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-700">Direktelenke</p>
              <a href={formUrl} target="_blank" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                <ExternalLink className="h-3 w-3" /> Apne
              </a>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-700 truncate">{formUrl}</code>
              <button onClick={() => copyText(formUrl, 'url')} className="rounded-lg bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-semibold transition flex items-center gap-1">
                {copied === 'url' ? <><CheckCheck className="h-3 w-3 text-emerald-600" /> Kopiert</> : <><Copy className="h-3 w-3" /> Kopier</>}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-700">Iframe-embed (anbefalt)</p>
              <span className="text-xs text-slate-400">Lim inn pa nettsiden der du vil ha skjemaet</span>
            </div>
            <pre className="rounded-lg bg-slate-900 text-emerald-400 text-xs p-4 overflow-x-auto mb-2">{iframeCode}</pre>
            <button onClick={() => copyText(iframeCode, 'iframe')} className="rounded-lg bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-semibold transition flex items-center gap-1">
              {copied === 'iframe' ? <><CheckCheck className="h-3 w-3 text-emerald-600" /> Kopiert</> : <><Copy className="h-3 w-3" /> Kopier iframe-kode</>}
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-700 mb-1">Slik legger du det inn pa nettsiden</p>
            <ol className="text-sm text-slate-600 space-y-1.5 list-decimal list-inside">
              <li>Apne nettsiden din i editoren (f.eks. Webflow, Wix, WordPress)</li>
              <li>Legg til et <strong>HTML/Embed-element</strong> der du vil skjemaet skal vises</li>
              <li>Lim inn iframe-koden over</li>
              <li>Publiser — skjemaet er live!</li>
            </ol>
            <p className="text-xs text-slate-400 mt-3">Leads som fyller ut skjemaet scores automatisk og vises under <strong>Leads</strong> i dashbordet. Du far e-post ved hoy-kvalitet leads (score ≥ {scoreThreshold}).</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => router.push('/dashboard/forms')} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
              Se alle skjemaer
            </button>
            <button onClick={() => router.push(`/dashboard/leads`)} className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
              Se leads
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pointsWarning = totalPoints !== 100 && questions.length > 0;

  return (
    <div className="max-w-3xl mx-auto pb-16">
      <div className="mb-6 pt-2">
        <Link href="/dashboard/forms" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4 transition">
          <ArrowLeft className="h-4 w-4" /> Tilbake til skjemaer
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nytt innhentingsskjema</h1>
        <p className="text-slate-500 text-sm mt-1">Lag et skreddersydd skjema for a kvalifisere leads fra nettsiden din</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Basic info */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <h2 className="font-semibold text-slate-800">Skjemadetaljer</h2>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Skjemanavn *</label>
            <input value={name} onChange={e => setName(e.target.value)} required
              placeholder="F.eks. Prosjektforspørsel, Tilbudsforespørsel..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Beskrivelse</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              placeholder="Hva brukes skjemaet til?"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>

        {/* Score threshold */}
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Star className="h-4 w-4 text-blue-600" /> Varselsgrense for hoy-kvalitet lead
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Du far e-post nar en lead scorer over denne grensen</p>
            </div>
            <span className="text-2xl font-bold text-blue-600">{scoreThreshold}%</span>
          </div>
          <input type="range" min={50} max={100} step={5} value={scoreThreshold}
            onChange={e => setScoreThreshold(Number(e.target.value))}
            className="w-full accent-blue-600" />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>50%</span><span>75%</span><span>100%</span>
          </div>
        </div>

        {/* Questions */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="font-semibold text-slate-800">Spørsmål</h2>
              {questions.length > 0 && (
                <p className={`text-xs mt-0.5 font-medium ${pointsWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {totalPoints}/100 poeng fordelt
                  {pointsWarning && ' — anbefalt total er 100'}
                </p>
              )}
            </div>
            <button type="button" onClick={addQuestion}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition">
              <Plus className="h-4 w-4" /> Legg til spørsmål
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Plus className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm">Ingen spørsmål enna. Klikk "Legg til spørsmål" for å starte.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {questions.map((q, index) => (
                <div key={q.id} className="p-4">
                  {/* Question header */}
                  <div className="flex items-center gap-3 mb-3">
                    <GripVertical className="h-4 w-4 text-slate-300 flex-shrink-0" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Spørsmål {index + 1}</span>
                    <div className="flex-1" />
                    <button type="button" onClick={() => updateQuestion(q.id, { collapsed: !q.collapsed })}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded">
                      {q.collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </button>
                    <button type="button" onClick={() => removeQuestion(q.id)}
                      className="text-red-400 hover:text-red-600 p-1 rounded">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {q.collapsed ? (
                    <p className="text-sm text-slate-700 pl-7 truncate">{q.question_text || <span className="text-slate-400">Tomt spørsmål</span>}</p>
                  ) : (
                    <div className="pl-7 space-y-3">
                      <input value={q.question_text} required
                        onChange={e => updateQuestion(q.id, { question_text: e.target.value })}
                        placeholder="Skriv spørsmålsteksten her..."
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                      <div className="flex gap-3 flex-wrap">
                        <div className="flex-1 min-w-[160px]">
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Svartype</label>
                          <select value={q.question_type}
                            onChange={e => updateQuestion(q.id, { question_type: e.target.value as QuestionType })}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            {(Object.entries(QUESTION_LABELS) as [QuestionType, string][]).map(([val, label]) => (
                              <option key={val} value={val}>{label}</option>
                            ))}
                          </select>
                        </div>

                        <div className="w-28">
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Maks poeng</label>
                          <input type="number" min={0} max={100} value={q.points}
                            onChange={e => {
                              const pts = Math.max(0, Math.min(100, Number(e.target.value)));
                              const newOptionPts = { ...q.option_points };
                              q.options.forEach(o => { if (newOptionPts[o] === undefined) newOptionPts[o] = pts; });
                              updateQuestion(q.id, { points: pts, option_points: newOptionPts });
                            }}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-bold" />
                        </div>

                        <div className="flex items-end pb-0.5">
                          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                            <input type="checkbox" checked={q.required}
                              onChange={e => updateQuestion(q.id, { required: e.target.checked })}
                              className="rounded border-slate-300" />
                            Obligatorisk
                          </label>
                        </div>
                      </div>

                      {/* Options for select/radio/checkbox */}
                      {['select', 'radio', 'checkbox'].includes(q.question_type) && (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Svaralternativer (ett per linje)</label>
                            <textarea value={q.options.join('\n')}
                              onChange={e => handleOptionsChange(q.id, e.target.value)}
                              placeholder="Alternativ 1&#10;Alternativ 2&#10;Alternativ 3"
                              rows={Math.max(3, q.options.length + 1)}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                          </div>
                          {q.options.length > 0 && (
                            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                              <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
                                <Star className="h-3 w-3" /> Velg poeng per svar (0 = feil svar)
                              </p>
                              <div className="space-y-1.5">
                                {q.options.map(opt => (
                                  <div key={opt} className="flex items-center gap-3">
                                    <span className="flex-1 text-sm text-slate-700 truncate">{opt}</span>
                                    <input type="number" min={0} max={q.points} value={q.option_points[opt] ?? q.points}
                                      onChange={e => handleOptionPoints(q.id, opt, Math.max(0, Math.min(q.points, Number(e.target.value))))}
                                      className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <span className="text-xs text-slate-400">poeng</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Link href="/dashboard/forms"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition text-center">
            Avbryt
          </Link>
          <button type="submit" disabled={loading || !name || questions.length === 0}
            className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition">
            {loading ? 'Oppretter...' : 'Opprett skjema'}
          </button>
        </div>
      </form>
    </div>
  );
}
