'use client';
import { useEffect, useState } from 'react';
import { Users, Star, Activity, Clock, Plus, Search, Phone, Mail } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  total_spent: number;
  job_count: number;
  days_since_last_contact: number;
  customer_tier: string;
  notes: string | null;
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [filter]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers?filter=${filter}`);
      const json = await res.json();
      setCustomers(json.customers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async () => {
    if (!newCustomer.name) return;
    setSaving(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      });
      if (res.ok) {
        setNewCustomer({ name: '', email: '', phone: '', notes: '' });
        setShowNew(false);
        fetchCustomers();
      }
    } finally {
      setSaving(false);
    }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  const stats = {
    total: customers.length,
    vip: customers.filter(c => c.customer_tier === 'vip' || c.total_spent > 10000).length,
    active: customers.filter(c => c.days_since_last_contact <= 30).length,
    revenue: customers.reduce((s, c) => s + (c.total_spent || 0), 0),
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kundebase</h1>
          <p className="text-slate-500 text-sm mt-1">Administrer og følg opp alle kundene dine</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" /> Ny kunde
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        {[
          { label: 'Totalt kunder', value: stats.total, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'VIP-kunder', value: stats.vip, icon: Star, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Aktive (30d)', value: stats.active, icon: Activity, color: 'text-green-600 bg-green-50' },
          { label: 'Total omsetning', value: `${stats.revenue.toLocaleString('nb-NO')} kr`, icon: Clock, color: 'text-purple-600 bg-purple-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${color} mb-3`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters & search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Søk etter navn, e-post eller telefon..."
            className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: 'Alle' },
            { key: 'vip', label: 'VIP' },
            { key: 'active', label: 'Aktive' },
            { key: 'inactive', label: 'Inaktive' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filter === f.key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* New customer form */}
      {showNew && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 mb-4">
          <h3 className="font-semibold text-slate-900 mb-3">Legg til ny kunde</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={newCustomer.name}
              onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
              placeholder="Navn *"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <input
              value={newCustomer.email}
              onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
              placeholder="E-post"
              type="email"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <input
              value={newCustomer.phone}
              onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              placeholder="Telefon"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <input
              value={newCustomer.notes}
              onChange={e => setNewCustomer({ ...newCustomer, notes: e.target.value })}
              placeholder="Notat (valgfritt)"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={createCustomer}
              disabled={saving || !newCustomer.name}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {saving ? 'Lagrer...' : 'Lagre kunde'}
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Laster kunder...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Ingen kunder funnet</p>
            <button onClick={() => setShowNew(true)} className="mt-3 text-blue-600 text-sm font-semibold hover:underline">
              Legg til første kunde
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Navn</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 hidden sm:table-cell">Kontakt</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-600 hidden md:table-cell">Jobber</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">Omsetning</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-600 hidden lg:table-cell">Sist kontakt</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{c.name}</p>
                    {c.notes && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{c.notes}</p>}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex flex-col gap-1">
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-slate-600 hover:text-blue-600 text-xs">
                          <Mail className="h-3 w-3" />{c.email}
                        </a>
                      )}
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-slate-600 hover:text-blue-600 text-xs">
                          <Phone className="h-3 w-3" />{c.phone}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-700 hidden md:table-cell">{c.job_count || 0}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    {(c.total_spent || 0).toLocaleString('nb-NO')} kr
                  </td>
                  <td className="px-4 py-3 text-center text-slate-500 hidden lg:table-cell">
                    {c.days_since_last_contact != null
                      ? c.days_since_last_contact === 0
                        ? 'I dag'
                        : `${c.days_since_last_contact} dager siden`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      c.customer_tier === 'vip' || c.total_spent > 10000
                        ? 'bg-yellow-100 text-yellow-700'
                        : c.days_since_last_contact <= 30
                        ? 'bg-green-100 text-green-700'
                        : c.days_since_last_contact > 90
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {c.customer_tier === 'vip' || c.total_spent > 10000 ? 'VIP'
                        : c.days_since_last_contact <= 30 ? 'Aktiv'
                        : c.days_since_last_contact > 90 ? 'Inaktiv'
                        : 'Vanlig'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
