'use client';

import { useEffect, useState } from 'react';

type Customer = {
  id: string;
  name: string;
  email: string;
};

export default function InvoiceCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  async function load() {
    const res = await fetch('/api/invoices/customers');
    const json = await res.json();
    setCustomers(json.customers || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function addCustomer(e: any) {
    e.preventDefault();
    const form = e.target;

    await fetch('/api/invoices/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.value,
        email: form.email.value,
      }),
    });

    form.reset();
    load();
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Customers</h1>

      <div className="bg-white border rounded p-4">
        <h2 className="font-medium mb-4">Add customer</h2>
        <form onSubmit={addCustomer} className="grid grid-cols-3 gap-3">
          <input
            name="name"
            placeholder="Name"
            className="border rounded px-2 py-1"
            required
          />
          <input
            name="email"
            placeholder="Email"
            className="border rounded px-2 py-1"
          />
          <button className="bg-black text-white rounded px-4 py-2">Add</button>
        </form>
      </div>

      <div className="bg-white border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
