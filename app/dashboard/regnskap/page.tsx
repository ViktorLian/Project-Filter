'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Receipt, Sparkles, BarChart2, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

type Expense = { id: string; date: string; category: string; description: string; amount: number };
type Income = { id: string; date: string; description: string; amount: number };
type MonthData = { month: string; income: number; expense: number };

const EXPENSE_CATEGORIES = [
  'Materialer', 'Transport', 'Utstyr', 'Markedsføring',
  'Lønn', 'Husleie', 'Forsikring', 'Programvare', 'Annet'
];

const MONTHS_NO = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];

const now = new Date();
const currentYear = now.getFullYear();

function thisYear(dateStr: string) {
  return dateStr.startsWith(currentYear.toString());
}

function monthIndex(dateStr: string) {
  return parseInt(dateStr.slice(5, 7), 10) - 1;
}

export default function RegnskapPage() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (typeof window !== 'undefined') {
      try { return JSON.parse(localStorage.getItem('regnskap-expenses') || '[]'); } catch { /* */ }
    }
    return [];
  });
  const [incomes, setIncomes] = useState<Income[]>(() => {
    if (typeof window !== 'undefined') {
      try { return JSON.parse(localStorage.getItem('regnskap-incomes') || '[]'); } catch { /* */ }
    }
    return [];
  });

  const [expForm, setExpForm] = useState({ date: now.toISOString().slice(0, 10), category: 'Materialer', description: '', amount: '' });
  const [incForm, setIncForm] = useState({ date: now.toISOString().slice(0, 10), description: '', amount: '' });
  const [showExpForm, setShowExpForm] = useState(false);
  const [showIncForm, setShowIncForm] = useState(false);
  const [aiReport, setAiReport] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'income'>('overview');

  useEffect(() => {
    localStorage.setItem('regnskap-expenses', JSON.stringify(expenses));
  }, [expenses]);
  useEffect(() => {
    localStorage.setItem('regnskap-incomes', JSON.stringify(incomes));
  }, [incomes]);

  function addExpense() {
    if (!expForm.amount || !expForm.description) return;
    const e: Expense = { id: Date.now().toString(), ...expForm, amount: parseFloat(expForm.amount) };
    setExpenses(prev => [e, ...prev]);
    setExpForm(f => ({ ...f, description: '', amount: '' }));
    setShowExpForm(false);
  }

  function addIncome() {
    if (!incForm.amount || !incForm.description) return;
    const i: Income = { id: Date.now().toString(), ...incForm, amount: parseFloat(incForm.amount) };
    setIncomes(prev => [i, ...prev]);
    setIncForm(f => ({ ...f, description: '', amount: '' }));
    setShowIncForm(false);
  }

  // Stats for this year
  const ytdExpenses = expenses.filter(e => thisYear(e.date));
  const ytdIncomes = incomes.filter(i => thisYear(i.date));
  const totalIncome = ytdIncomes.reduce((s, i) => s + i.amount, 0);
  const totalExpense = ytdExpenses.reduce((s, e) => s + e.amount, 0);
  const profit = totalIncome - totalExpense;
  const margin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;

  // Monthly breakdown
  const monthlyData: MonthData[] = MONTHS_NO.map((m, idx) => ({
    month: m,
    income: ytdIncomes.filter(i => monthIndex(i.date) === idx).reduce((s, i) => s + i.amount, 0),
    expense: ytdExpenses.filter(e => monthIndex(e.date) === idx).reduce((s, e) => s + e.amount, 0),
  }));

  // Expense by category
  const byCategory = EXPENSE_CATEGORIES.map(cat => ({
    cat,
    total: ytdExpenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const maxMonthly = Math.max(...monthlyData.map(m => Math.max(m.income, m.expense)), 1);

  async function getAiReport() {
    setAiLoading(true);
    setAiReport('');
    try {
      const catSummary = byCategory.slice(0, 5).map(c => `${c.cat}: ${c.total.toLocaleString('nb-NO')} kr`).join(', ');
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analyser regnskapet for en norsk SMB:
Inntekter i år: ${totalIncome.toLocaleString('nb-NO')} kr
Utgifter i år: ${totalExpense.toLocaleString('nb-NO')} kr
Bruttofortjeneste: ${profit.toLocaleString('nb-NO')} kr (${margin.toFixed(1)}% margin)
Største kostnader: ${catSummary || 'Ingen ennå'}

Gi 3-4 konkrete regnskap- og lønnsomhetstips for en norsk servicebedrift. Maks 150 ord. Norsk bokmål.`,
          history: [],
        }),
      });
      const data = await res.json();
      setAiReport(data.reply || 'Ingen analyse.');
    } finally { setAiLoading(false); }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Regnskap {currentYear}</h1>
          <p className="text-slate-500 mt-1">Oversikt over inntekter, utgifter og lønnsomhet</p>
        </div>
        <button onClick={getAiReport} disabled={aiLoading}
          className="flex items-center gap-2 bg-purple-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50">
          <Sparkles className="h-4 w-4" />
          {aiLoading ? 'Analyserer...' : 'AI-regnskapsanalyse'}
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Totale inntekter', value: `${totalIncome.toLocaleString('nb-NO')} kr`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50', trend: '+' },
          { label: 'Totale utgifter', value: `${totalExpense.toLocaleString('nb-NO')} kr`, icon: TrendingDown, color: 'text-red-500 bg-red-50', trend: '-' },
          { label: 'Resultat', value: `${profit >= 0 ? '+' : ''}${profit.toLocaleString('nb-NO')} kr`, icon: DollarSign, color: profit >= 0 ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50', trend: '' },
          { label: 'Bruttomargin', value: `${margin.toFixed(1)}%`, icon: BarChart2, color: margin >= 30 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50', trend: '' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`h-8 w-8 rounded-lg ${color} flex items-center justify-center mb-2`}>
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-lg font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {/* AI report */}
      {aiReport && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-purple-700 mb-1 flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI-regnskapsanalyse</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{aiReport}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(['overview', 'income', 'expenses'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {tab === 'overview' ? 'Månedsoversikt' : tab === 'income' ? 'Inntekter' : 'Utgifter'}
          </button>
        ))}
      </div>

      {/* Monthly bar chart */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Månedlig oversikt</h2>
          <div className="flex items-end gap-2 h-40">
            {monthlyData.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-0.5 items-end" style={{ height: '120px' }}>
                  <div
                    className="flex-1 bg-emerald-400 rounded-t"
                    style={{ height: `${m.income > 0 ? Math.max((m.income / maxMonthly) * 120, 4) : 0}px` }}
                    title={`Inntekt: ${m.income.toLocaleString('nb-NO')} kr`}
                  />
                  <div
                    className="flex-1 bg-red-400 rounded-t"
                    style={{ height: `${m.expense > 0 ? Math.max((m.expense / maxMonthly) * 120, 4) : 0}px` }}
                    title={`Utgift: ${m.expense.toLocaleString('nb-NO')} kr`}
                  />
                </div>
                <span className="text-xs text-slate-400">{m.month}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="h-3 w-3 rounded-sm bg-emerald-400 inline-block" />Inntekter</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="h-3 w-3 rounded-sm bg-red-400 inline-block" />Utgifter</span>
          </div>
          {byCategory.length > 0 && (
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-500 mb-3">Utgifter per kategori</p>
              {byCategory.map(c => (
                <div key={c.cat} className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-slate-600 w-28 shrink-0">{c.cat}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div className="bg-red-400 h-2 rounded-full" style={{ width: `${(c.total / totalExpense) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium text-slate-700 w-24 text-right">{c.total.toLocaleString('nb-NO')} kr</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Income tab */}
      {activeTab === 'income' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Inntekter</h2>
            <button onClick={() => setShowIncForm(v => !v)}
              className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-800">
              <Plus className="h-4 w-4" /> Legg til
            </button>
          </div>
          {showIncForm && (
            <div className="p-4 bg-slate-50 border-b border-slate-100 grid md:grid-cols-4 gap-3">
              <input type="date" value={incForm.date} onChange={e => setIncForm(f => ({ ...f, date: e.target.value }))}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
              <input className="md:col-span-2 border border-slate-200 rounded-lg px-3 py-2 text-sm" value={incForm.description}
                onChange={e => setIncForm(f => ({ ...f, description: e.target.value }))} placeholder="Beskrivelse / oppdrag" />
              <div className="flex gap-2">
                <input type="number" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" value={incForm.amount}
                  onChange={e => setIncForm(f => ({ ...f, amount: e.target.value }))} placeholder="Beløp kr" />
                <button onClick={addIncome} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700">Lagre</button>
              </div>
            </div>
          )}
          {incomes.length === 0 ? (
            <div className="px-5 py-10 text-center text-slate-400 text-sm">Ingen inntekter registrert ennå</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {incomes.filter(i => thisYear(i.date)).map(i => (
                <div key={i.id} className="flex items-center gap-4 px-5 py-3">
                  <span className="text-xs text-slate-400 w-20 shrink-0">{i.date}</span>
                  <span className="text-sm text-slate-700 flex-1">{i.description}</span>
                  <span className="text-sm font-bold text-emerald-600">+{i.amount.toLocaleString('nb-NO')} kr</span>
                  <button onClick={() => setIncomes(p => p.filter(x => x.id !== i.id))} className="text-slate-300 hover:text-red-400 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Expenses tab */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Utgifter</h2>
            <button onClick={() => setShowExpForm(v => !v)}
              className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-800">
              <Plus className="h-4 w-4" /> Legg til
            </button>
          </div>
          {showExpForm && (
            <div className="p-4 bg-slate-50 border-b border-slate-100 grid md:grid-cols-4 gap-3">
              <input type="date" value={expForm.date} onChange={e => setExpForm(f => ({ ...f, date: e.target.value }))}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
              <select value={expForm.category} onChange={e => setExpForm(f => ({ ...f, category: e.target.value }))}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input className="border border-slate-200 rounded-lg px-3 py-2 text-sm" value={expForm.description}
                onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))} placeholder="Beskrivelse" />
              <div className="flex gap-2">
                <input type="number" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" value={expForm.amount}
                  onChange={e => setExpForm(f => ({ ...f, amount: e.target.value }))} placeholder="Beløp kr" />
                <button onClick={addExpense} className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600">Lagre</button>
              </div>
            </div>
          )}
          {ytdExpenses.length === 0 ? (
            <div className="px-5 py-10 text-center text-slate-400 text-sm">Ingen utgifter registrert ennå</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {ytdExpenses.map(e => (
                <div key={e.id} className="flex items-center gap-4 px-5 py-3">
                  <span className="text-xs text-slate-400 w-20 shrink-0">{e.date}</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full shrink-0">{e.category}</span>
                  <span className="text-sm text-slate-700 flex-1">{e.description}</span>
                  <span className="text-sm font-bold text-red-500">-{e.amount.toLocaleString('nb-NO')} kr</span>
                  <button onClick={() => setExpenses(p => p.filter(x => x.id !== e.id))} className="text-slate-300 hover:text-red-400 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
