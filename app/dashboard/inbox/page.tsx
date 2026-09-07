'use client';

import { useEffect, useMemo, useState } from 'react';
import { Inbox, Mail, Phone, Search } from 'lucide-react';

type Lead = {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  status: string | null;
  created_at: string;
};

export default function InboxPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/leads', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Kunne ikke hente henvendelser');
        if (active) setLeads(data.leads || []);
      })
      .catch((cause) => active && setError(cause instanceof Error ? cause.message : 'Kunne ikke hente henvendelser'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return leads;
    return leads.filter((lead) => [lead.customer_name, lead.customer_email, lead.customer_phone]
      .some((value) => value?.toLowerCase().includes(query)));
  }, [leads, search]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Innboks</h1>
        <p className="mt-1 text-sm text-slate-500">Alle henvendelser som er registrert for bedriften din.</p>
      </header>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(event) => setSearch(event.target.value)}
          placeholder="Søk etter navn, e-post eller telefon"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <p className="p-10 text-center text-sm text-slate-500">Henter henvendelser …</p>
        ) : error ? (
          <div className="p-10 text-center">
            <p className="font-semibold text-red-700">Innboksen kunne ikke lastes</p>
            <p className="mt-1 text-sm text-slate-500">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="mx-auto h-11 w-11 text-slate-300" />
            <h2 className="mt-4 font-semibold text-slate-900">Ingen henvendelser ennå</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              Nye henvendelser fra FlowPilot-skjemaene dine vises her automatisk.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((lead) => (
              <li key={lead.id} className="p-5 hover:bg-slate-50">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{lead.customer_name || 'Ukjent kontakt'}</p>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                      {lead.customer_email && <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" />{lead.customer_email}</span>}
                      {lead.customer_phone && <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" />{lead.customer_phone}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{lead.status || 'Ny'}</span>
                    <p className="mt-2 text-xs text-slate-400">{new Date(lead.created_at).toLocaleString('nb-NO')}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
