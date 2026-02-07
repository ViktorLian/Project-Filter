'use client';

import { useEffect, useState } from 'react';

type Transaction = {
  id: string;
  direction: 'IN' | 'OUT';
  amount: number;
  category: string;
  description: string;
  occurred_at: string;
};

export default function CashflowPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [health, setHealth] = useState<'GREEN' | 'YELLOW' | 'RED'>('GREEN');
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  async function loadData() {
    const tRes = await fetch('/api/cashflow');
    const tJson = await tRes.json();
    setTransactions(tJson.transactions || []);

    const hRes = await fetch('/api/cashflow/health');
    const hJson = await hRes.json();
    setHealth(hJson.health);
    setIncome(hJson.income);
    setExpense(hJson.expense);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function addTransaction(e: any) {
    e.preventDefault();
    const form = e.target;

    await fetch('/api/cashflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        direction: form.direction.value,
        amount: Number(form.amount.value),
        category: form.category.value,
        description: form.description.value,
        occurred_at: form.occurred_at.value,
      }),
    });

    form.reset();
    loadData();
  }

  const net = income - expense;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cash Flow</h1>
        <span
          className={`px-3 py-1 rounded text-sm font-medium ${
            health === 'GREEN'
              ? 'bg-green-100 text-green-800'
              : health === 'YELLOW'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {health}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border rounded p-4">
          <p className="text-sm text-gray-500">Income</p>
          <p className="text-xl font-semibold">{income} kr</p>
        </div>
        <div className="bg-white border rounded p-4">
          <p className="text-sm text-gray-500">Expense</p>
          <p className="text-xl font-semibold">{expense} kr</p>
        </div>
        <div className="bg-white border rounded p-4">
          <p className="text-sm text-gray-500">Net</p>
          <p className="text-xl font-semibold">{net} kr</p>
        </div>
      </div>

      <div className="bg-white border rounded p-4">
        <h2 className="font-medium mb-4">Add transaction</h2>
        <form onSubmit={addTransaction} className="grid grid-cols-5 gap-3">
          <select name="direction" className="border rounded px-2 py-1">
            <option value="IN">Income</option>
            <option value="OUT">Expense</option>
          </select>
          <input
            name="amount"
            placeholder="Amount"
            className="border rounded px-2 py-1"
            required
          />
          <input
            name="category"
            placeholder="Category"
            className="border rounded px-2 py-1"
            required
          />
          <input
            name="occurred_at"
            type="date"
            className="border rounded px-2 py-1"
            required
          />
          <input
            name="description"
            placeholder="Description"
            className="border rounded px-2 py-1"
          />
          <button className="col-span-5 bg-black text-white rounded px-4 py-2">
            Add
          </button>
        </form>
      </div>

      <div className="bg-white border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3">Type</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Category</th>
              <th className="p-3">Description</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-3">{t.occurred_at}</td>
                <td className="p-3">{t.direction}</td>
                <td className="p-3">{t.amount} kr</td>
                <td className="p-3">{t.category}</td>
                <td className="p-3">{t.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
