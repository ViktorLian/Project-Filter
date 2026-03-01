'use client';

import { useState } from 'react';
import {
  Users, Globe, Eye, Copy, CheckCircle, Palette, Lock,
  ExternalLink, Settings, Plus, Search, ToggleLeft, ToggleRight,
  FileText, CreditCard, Wrench, Star, ArrowUpRight, Mail
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  portalEnabled: boolean;
  lastLogin: string | null;
  openJobs: number;
  unpaidInvoices: number;
  totalSpent: number;
}

const CLIENTS: Client[] = [
  { id: 'c1', name: 'Bjørn Hansen', company: 'Hansen & Sønner AS', email: 'bjorn@hansen.no', portalEnabled: true, lastLogin: '20. jan 2026', openJobs: 1, unpaidInvoices: 0, totalSpent: 42500 },
  { id: 'c2', name: 'Anna Larsen', company: 'Larsen Eiendom', email: 'anna@larsen.no', portalEnabled: true, lastLogin: '18. jan 2026', openJobs: 0, unpaidInvoices: 1, totalSpent: 18700 },
  { id: 'c3', name: 'Per Kristiansen', company: 'Privat', email: 'per@kristiansen.no', portalEnabled: false, lastLogin: null, openJobs: 2, unpaidInvoices: 2, totalSpent: 9200 },
  { id: 'c4', name: 'Kari Olsen', company: 'Olsen Bygg AS', email: 'kari@olsen.no', portalEnabled: true, lastLogin: '15. jan 2026', openJobs: 0, unpaidInvoices: 0, totalSpent: 67300 },
  { id: 'c5', name: 'Thomas Berg', company: 'Privat', email: 'thomas@berg.no', portalEnabled: false, lastLogin: null, openJobs: 1, unpaidInvoices: 1, totalSpent: 5400 },
];

export default function ClientPortalPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'clients' | 'customize' | 'preview'>('clients');
  const [clients, setClients] = useState<Client[]>(CLIENTS);
  const [copied, setCopied] = useState(false);

  const filtered = clients.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase())
  );

  const enabled = clients.filter((c) => c.portalEnabled).length;

  const togglePortal = (id: string) => {
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, portalEnabled: !c.portalEnabled } : c));
  };

  const copyLink = () => {
    navigator.clipboard.writeText('https://portal.flowpilot.no/din-bedrift');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Kundeportal</h1>
          <p className="text-sm text-slate-500">La kundene dine se jobber, fakturaer og status — uten å ringe</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyLink} className="flex items-center gap-1.5 text-sm text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-xl font-medium transition">
            {copied ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Kopiert!' : 'Kopier portal-lenke'}
          </button>
          <button onClick={() => setActiveTab('preview')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
            <Eye className="h-4 w-4" /> Forhåndsvis
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Aktive portaler', value: `${enabled} / ${clients.length}`, icon: Globe, color: 'text-blue-600 bg-blue-50' },
          { label: 'Åpne fakturaer', value: clients.reduce((s, c) => s + c.unpaidInvoices, 0).toString(), icon: CreditCard, color: 'text-amber-600 bg-amber-50' },
          { label: 'Aktive jobber', value: clients.reduce((s, c) => s + c.openJobs, 0).toString(), icon: Wrench, color: 'text-purple-600 bg-purple-50' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}><Icon className="h-4 w-4" /></div>
              <p className="text-xl font-bold text-slate-900 mb-0.5">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        {(['clients', 'customize', 'preview'] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`text-sm font-medium px-4 py-1.5 rounded-lg transition ${activeTab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t === 'clients' ? '👥 Kunder' : t === 'customize' ? '🎨 Tilpass' : '👁 Forhåndsvis'}
          </button>
        ))}
      </div>

      {activeTab === 'clients' && (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Søk kunder..." className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Kunde</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Sist innlogget</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Åpne jobber</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Fakturaer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Portal aktiv</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-slate-600">{c.name[0]}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{c.name}</p>
                          <p className="text-xs text-slate-400">{c.company}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{c.lastLogin ?? <span className="text-slate-300">Aldri</span>}</td>
                    <td className="px-4 py-3">
                      {c.openJobs > 0
                        ? <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">{c.openJobs} åpen{c.openJobs > 1 ? 'e' : ''}</span>
                        : <span className="text-xs text-slate-400">—</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      {c.unpaidInvoices > 0
                        ? <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">{c.unpaidInvoices} ubetalt</span>
                        : <span className="text-xs text-emerald-600 font-medium">✓ OK</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => togglePortal(c.id)} className="flex items-center gap-1.5 text-xs font-medium transition">
                        {c.portalEnabled
                          ? <><ToggleRight className="h-5 w-5 text-blue-600" /><span className="text-blue-600">Aktiv</span></>
                          : <><ToggleLeft className="h-5 w-5 text-slate-400" /><span className="text-slate-400">Av</span></>
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition" title="Send portal-invitasjon">
                          <Mail className="h-3.5 w-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition" title="Åpne portal">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'customize' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            {[
              { label: 'Bedriftsnavn i portal', type: 'text', placeholder: 'Ditt firmanavn AS' },
              { label: 'Logo-URL', type: 'url', placeholder: 'https://din-nettside.no/logo.png' },
              { label: 'Primærfarge', type: 'color', placeholder: '#2563EB' },
              { label: 'Velkomstmelding', type: 'textarea', placeholder: 'Hei! Velkommen til kundeportalen vår 👋' },
            ].map((f) => (
              <div key={f.label}>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">{f.label}</label>
                {f.type === 'textarea'
                  ? <textarea placeholder={f.placeholder} rows={3} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none" />
                  : <input type={f.type} placeholder={f.placeholder} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
                }
              </div>
            ))}
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Synlige seksjoner</p>
              {[['Åpne jobber', true], ['Fakturaer', true], ['Dokumenter', true], ['Kontaktperson', true], ['Anmeldelse', false]].map(([label, def]) => (
                <label key={label as string} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked={def as boolean} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-slate-700">{label as string}</span>
                </label>
              ))}
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition">Lagre endringer</button>
          </div>
          <div className="bg-slate-100 rounded-2xl p-4 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-sm w-full max-w-xs p-4">
              <div className="h-8 w-24 bg-blue-600 rounded mb-3" />
              <p className="text-xs font-semibold text-slate-900 mb-3">Hei Bjørn! Velkommen tilbake 👋</p>
              {[['Jobber', '1 aktiv', 'bg-blue-50 text-blue-700'], ['Fakturaer', 'Alt betalt ✓', 'bg-emerald-50 text-emerald-700']].map(([t, v, c]) => (
                <div key={t as string} className={`${c as string} rounded-lg p-2.5 mb-2`}>
                  <p className="text-xs font-semibold">{t as string}</p>
                  <p className="text-xs">{v as string}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="flex items-start justify-center">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg w-full max-w-lg">
            <div className="bg-blue-600 rounded-t-2xl px-6 py-4">
              <p className="text-white font-bold text-lg">Din bedrift</p>
              <p className="text-blue-200 text-sm">Kundeportal</p>
            </div>
            <div className="p-6">
              <p className="text-slate-900 font-semibold mb-4">Hei Bjørn Hansen 👋</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { icon: Wrench, label: 'Jobber', value: '1 aktiv', color: 'bg-blue-50 text-blue-700' },
                  { icon: CreditCard, label: 'Fakturaer', value: 'Alt betalt ✓', color: 'bg-emerald-50 text-emerald-700' },
                  { icon: FileText, label: 'Dokumenter', value: '3 filer', color: 'bg-purple-50 text-purple-700' },
                  { icon: Star, label: 'Din score', value: '5.0 ⭐', color: 'bg-amber-50 text-amber-700' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className={`${item.color} rounded-xl p-3`}>
                      <Icon className="h-4 w-4 mb-1" />
                      <p className="text-xs font-semibold">{item.label}</p>
                      <p className="text-xs">{item.value}</p>
                    </div>
                  );
                })}
              </div>
              <div className="border border-slate-100 rounded-xl p-3 mb-3">
                <p className="text-xs font-semibold text-slate-700 mb-1">Aktiv jobb</p>
                <p className="text-sm text-slate-900">Baderoms renovering</p>
                <p className="text-xs text-slate-500">Pågår · Forventet ferdig 25. jan</p>
                <div className="mt-2 bg-slate-100 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
              <button className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-xl">Kontakt oss</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
