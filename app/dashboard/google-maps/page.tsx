'use client';

import { useState } from 'react';
import { Map, Search, MapPin, Phone, Globe, Star, Building2 } from 'lucide-react';

type Lead = { id: string; name: string; address: string; phone?: string; website?: string; rating?: number; industry: string; distance?: string };

const DEMO_LEADS: Lead[] = [
  { id: '1', name: 'Bygg & Renovering AS', address: 'Oslogata 12, 0159 Oslo', phone: '+47 22 00 00 01', rating: 4.2, industry: 'Byggevare', distance: '0.8 km' },
  { id: '2', name: 'Hus og Hage Larsen', address: 'Gronlandsleiret 31, 0190 Oslo', phone: '+47 22 00 00 02', website: 'www.huslarsen.no', rating: 4.7, industry: 'Hagearbeid', distance: '1.4 km' },
  { id: '3', name: 'Nordic Tak og Fasade', address: 'Trondheimsveien 100, 0565 Oslo', phone: '+47 22 00 00 03', rating: 3.9, industry: 'Takarbeid', distance: '2.1 km' },
  { id: '4', name: 'Elektriker Johansen', address: 'Maridalsveien 55, 0461 Oslo', phone: '+47 22 00 00 04', rating: 4.5, industry: 'Elektro', distance: '2.8 km' },
];

export default function GoogleMapsPage() {
  const [query, setQuery] = useState('');
  const [radius, setRadius] = useState('5');
  const [leads, setLeads] = useState<Lead[]>(DEMO_LEADS);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const filtered = leads.filter(l =>
    !query || l.name.toLowerCase().includes(query.toLowerCase()) || l.industry.toLowerCase().includes(query.toLowerCase())
  );

  function addToLeads(lead: Lead) {
    setAddedIds(prev => new Set([...Array.from(prev), lead.id]));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Google Maps Leads</h1>
        <p className="text-slate-500 text-sm mt-0.5">Finn potensielle kunder i nærområdet og legg dem til som leads</p>
      </div>

      {/* Search controls */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Bransje, firmanavn eller nøkkelord..."
              className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <select value={radius} onChange={e => setRadius(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="2">2 km radius</option>
              <option value="5">5 km radius</option>
              <option value="10">10 km radius</option>
              <option value="25">25 km radius</option>
            </select>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
            <Map className="h-4 w-4" />Søk i kart
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-3">Koble til Google Maps API-nøkkel i Innstillinger for live søk. Viser demo-data foreløpig.</p>
      </div>

      {/* Map placeholder + list */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Map */}
        <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center h-80">
          <div className="text-center text-slate-400">
            <Map className="h-12 w-12 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">Kartvisning</p>
            <p className="text-xs mt-1">Krever Google Maps API-nøkkel</p>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-3 max-h-80 overflow-y-auto">
          {filtered.map(lead => (
            <div key={lead.id}
              onClick={() => setSelected(selected?.id === lead.id ? null : lead)}
              className={`rounded-xl border p-4 cursor-pointer transition-all ${selected?.id === lead.id ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{lead.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><MapPin className="h-3 w-3" />{lead.distance}</p>
                  {lead.rating && (
                    <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1"><Star className="h-3 w-3 fill-current" />{lead.rating}</p>
                  )}
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{lead.industry}</span>
              </div>
              <button
                onClick={e => { e.stopPropagation(); addToLeads(lead); }}
                className={`mt-3 w-full rounded-lg py-1.5 text-xs font-semibold transition-colors ${addedIds.has(lead.id) ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {addedIds.has(lead.id) ? 'Lagt til som lead ✓' : '+ Legg til som lead'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><Building2 className="h-5 w-5 text-blue-600" />{selected.name}</h3>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-700"><MapPin className="h-4 w-4 text-slate-400" />{selected.address}</div>
            {selected.phone && <div className="flex items-center gap-2 text-slate-700"><Phone className="h-4 w-4 text-slate-400" />{selected.phone}</div>}
            {selected.website && <div className="flex items-center gap-2 text-slate-700"><Globe className="h-4 w-4 text-slate-400" />{selected.website}</div>}
            {selected.rating && <div className="flex items-center gap-2 text-amber-600"><Star className="h-4 w-4 fill-current" />{selected.rating} / 5</div>}
          </div>
        </div>
      )}
    </div>
  );
}
