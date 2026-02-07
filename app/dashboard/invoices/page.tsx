'use client';

import { useEffect, useState } from 'react';

type Invoice = {
  id: string;
  invoice_number: number;
  amount: number;
  status: string;
  due_date: string;
  customer: { name: string };
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  async function load() {
    const res = await fetch('/api/invoices');
    const json = await res.json();
    setInvoices(json.invoices || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function createInvoice(e: any) {
    e.preventDefault();
    const form = e.target;

    await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: form.customer_id.value,
        amount: Number(form.amount.value),
        due_date: form.due_date.value,
        issued_date: new Date().toISOString().slice(0, 10),
        status: 'SENT',
        description: form.description.value,
      }),
    });

    form.reset();
    load();
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Invoices</h1>

      <div className="bg-white border rounded p-4">
        <h2 className="font-medium mb-4">New invoice</h2>
        <form onSubmit={createInvoice} className="grid grid-cols-4 gap-3">
          <input
            name="customer_id"
            placeholder="Customer ID"
            className="border rounded px-2 py-1"
            required
          />
          <input
            name="amount"
            placeholder="Amount"
            className="border rounded px-2 py-1"
            required
          />
          <input
            name="due_date"
            type="date"
            className="border rounded px-2 py-1"
            required
          />
          <input
            name="description"
            placeholder="Description"
            className="border rounded px-2 py-1"
          />
          <button className="col-span-4 bg-black text-white rounded px-4 py-2">
            Create invoice
          </button>
        </form>
      </div>

      <div className="bg-white border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Due</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t">
                <td className="p-3">{inv.invoice_number}</td>
                <td className="p-3">{inv.customer?.name}</td>
                <td className="p-3">{inv.amount} kr</td>
                <td className="p-3">{inv.due_date}</td>
                <td className="p-3">{inv.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
