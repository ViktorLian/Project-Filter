import Link from 'next/link';
import { BarChart3, MessageSquare, Search, Star, Workflow } from 'lucide-react';

const modules = [
  { title: 'Henvendelser', value: '24', detail: '6 nye denne måneden', icon: MessageSquare },
  { title: 'Oppfølging', value: 'Automatisk', detail: '3 aktive arbeidsflyter', icon: Workflow },
  { title: 'Kundeanmeldelser', value: '4,8', detail: '12 svar registrert', icon: Star },
  { title: 'SEO og innhold', value: '4 utkast', detail: 'Neste planlagt om 5 dager', icon: Search },
];

export default function DemoPage() {
  return <main className="min-h-screen bg-slate-50 p-5 md:p-10">
    <div className="mx-auto max-w-6xl"><header className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-semibold text-blue-700">Skrivebeskyttet demo</p><h1 className="mt-1 text-3xl font-bold text-slate-950">FlowPilot oversikt</h1><p className="mt-2 text-slate-600">Eksempeldata viser hvordan kunden følger henvendelser, synlighet og automatisering.</p></div><Link href="/register" className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white">Opprett konto</Link></header>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{modules.map(({title,value,detail,icon:Icon})=><article key={title} className="rounded-2xl border bg-white p-5"><Icon className="h-5 w-5 text-blue-700"/><p className="mt-4 text-sm text-slate-500">{title}</p><p className="mt-1 text-2xl font-bold">{value}</p><p className="mt-2 text-xs text-slate-500">{detail}</p></article>)}</section>
      <section className="mt-6 grid gap-6 lg:grid-cols-3"><article className="rounded-2xl border bg-white p-6 lg:col-span-2"><div className="flex items-center gap-3"><BarChart3 className="h-5 w-5 text-blue-700"/><h2 className="font-semibold">Resultater siste 30 dager</h2></div><div className="mt-6 space-y-4">{[['Nye henvendelser','24'],['Besvart innen ett døgn','92 %'],['Sendte anmeldelsesforespørsler','18'],['Publiserte fagartikler','3']].map(([label,value])=><div key={label} className="flex justify-between border-b pb-3 text-sm last:border-0"><span className="text-slate-600">{label}</span><strong>{value}</strong></div>)}</div></article><article className="rounded-2xl border bg-slate-950 p-6 text-white"><h2 className="font-semibold">Dette er en demo</h2><p className="mt-3 text-sm leading-6 text-slate-300">Ingen e-post, SMS, betaling eller publisering utføres her. En ekte konto viser kun bedriftens egne data og låser funksjoner etter abonnement.</p><Link href="/pricing" className="mt-6 inline-block text-sm font-semibold text-blue-300">Se abonnementer</Link></article></section>
    </div>
  </main>;
}
