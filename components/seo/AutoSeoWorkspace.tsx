'use client';

import { useEffect, useState } from 'react';
import { FileText, LockKeyhole, Send, Settings2 } from 'lucide-react';

type Settings = {
  site_url: string | null; business_description: string | null; services: string[];
  service_areas: string[]; topics: string[]; publishing_mode: 'draft' | 'webhook';
  publishing_webhook_url: string | null; frequency_days: number; enabled: boolean;
};
type Item = { id:string; title:string; excerpt:string; status:string; published_url?:string|null; generated_at:string };
const empty: Settings = { site_url:'', business_description:'', services:[], service_areas:[], topics:[], publishing_mode:'draft', publishing_webhook_url:'', frequency_days:7, enabled:false };
const list = (value:string) => value.split(',').map(v=>v.trim()).filter(Boolean);

export default function AutoSeoWorkspace() {
  const [settings,setSettings]=useState<Settings>(empty), [content,setContent]=useState<Item[]>([]);
  const [secret,setSecret]=useState(''), [busy,setBusy]=useState(''), [message,setMessage]=useState('');
  const [loading,setLoading]=useState(true), [locked,setLocked]=useState(false);
  async function load(){const r=await fetch('/api/seo/settings',{cache:'no-store'}),d=await r.json();setLoading(false);if(r.status===403){setLocked(true);return}if(!r.ok){setMessage(d.error||'Kunne ikke laste.');return}setSettings({...empty,...d.settings});setContent(d.content||[])}
  useEffect(()=>{load()},[]);
  async function save(){setBusy('save');setMessage('');const r=await fetch('/api/seo/settings',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({...settings,publishing_webhook_secret:secret||undefined})}),d=await r.json();setBusy('');setMessage(r.ok?'Oppsettet er lagret.':d.error||'Kunne ikke lagre.');if(r.ok){setSettings({...empty,...d.settings});setSecret('')}}
  async function generate(){setBusy('generate');setMessage('');const r=await fetch('/api/seo/generate',{method:'POST'}),d=await r.json();setBusy('');setMessage(r.ok?'Et nytt faglig utkast er opprettet.':d.error||'Generering feilet.');if(r.ok)setContent(items=>[d.item,...items])}
  async function publish(id:string){setBusy(id);setMessage('');const r=await fetch('/api/seo/publish',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({itemId:id})}),d=await r.json();setBusy('');setMessage(r.ok?'Innholdet ble sendt til nettstedet.':d.error||'Publisering feilet.');if(r.ok)load()}
  if(loading)return <p className="p-8 text-sm text-slate-500">Laster SEO-oppsett...</p>;
  if(locked)return <section className="mx-auto max-w-3xl rounded-2xl border bg-white p-8"><LockKeyhole className="h-8 w-8 text-blue-700"/><h1 className="mt-4 text-2xl font-bold">SEO og faginnhold krever Pro</h1><p className="mt-2 text-slate-600">Oppgrader for planlagt innhold og publiseringsintegrasjon.</p><a href="/dashboard/billing" className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white">Se abonnement</a></section>;
  return <div className="mx-auto max-w-5xl space-y-7">
    <header><h1 className="text-2xl font-bold">SEO og faginnhold</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Lag faktabaserte utkast fra bedriftens egne tjenester. Automatisk publisering krever en testet webhook på nettstedet.</p></header>
    <section className="rounded-2xl border bg-white p-6"><div className="mb-5 flex items-center gap-3"><Settings2 className="h-5 w-5 text-blue-700"/><h2 className="font-semibold">Innholdsgrunnlag</h2></div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nettsted" value={settings.site_url||''} placeholder="https://eksempel.no" onChange={v=>setSettings({...settings,site_url:v})}/>
        <label className="text-sm font-medium">Publiseringsfrekvens<select value={settings.frequency_days} onChange={e=>setSettings({...settings,frequency_days:Number(e.target.value)})} className="mt-2 w-full rounded-lg border p-3 font-normal"><option value={7}>Ukentlig</option><option value={14}>Hver 14. dag</option><option value={30}>Månedlig</option></select></label>
        <label className="text-sm font-medium md:col-span-2">Kontrollert faktagrunnlag<textarea rows={4} value={settings.business_description||''} onChange={e=>setSettings({...settings,business_description:e.target.value})} placeholder="Hva bedriften gjør, hvem den hjelper og hva som skiller tjenesten." className="mt-2 w-full rounded-lg border p-3 font-normal"/></label>
        <Field label="Tjenester" value={settings.services.join(', ')} placeholder="pumpeservice, brønnpumper" onChange={v=>setSettings({...settings,services:list(v)})}/>
        <Field label="Områder" value={settings.service_areas.join(', ')} placeholder="Oslo, Akershus" onChange={v=>setSettings({...settings,service_areas:list(v)})}/>
        <div className="md:col-span-2"><Field label="Prioriterte temaer" value={settings.topics.join(', ')} placeholder="vedlikehold, feilsøking, valg av pumpe" onChange={v=>setSettings({...settings,topics:list(v)})}/></div>
      </div>
      <div className="mt-6 border-t pt-5"><h3 className="text-sm font-semibold">Publisering</h3><div className="mt-3 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium">Modus<select value={settings.publishing_mode} onChange={e=>setSettings({...settings,publishing_mode:e.target.value as 'draft'|'webhook'})} className="mt-2 w-full rounded-lg border p-3 font-normal"><option value="draft">Kun utkast</option><option value="webhook">Send via webhook</option></select></label>
        <Field label="Webhook-adresse" value={settings.publishing_webhook_url||''} placeholder="https://nettsted.no/api/flowpilot" disabled={settings.publishing_mode==='draft'} onChange={v=>setSettings({...settings,publishing_webhook_url:v})}/>
        {settings.publishing_mode==='webhook'&&<div className="md:col-span-2"><Field label="Webhook-hemmelighet" value={secret} type="password" placeholder="La stå tomt for å beholde eksisterende" onChange={setSecret}/></div>}
      </div></div>
      <div className="mt-6 flex flex-wrap items-center gap-3"><button onClick={save} disabled={!!busy} className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy==='save'?'Lagrer...':'Lagre oppsett'}</button><button onClick={generate} disabled={!!busy} className="rounded-lg border px-5 py-2.5 text-sm font-semibold disabled:opacity-50">{busy==='generate'?'Lager utkast...':'Lag nytt utkast'}</button><label className="ml-auto flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.enabled} onChange={e=>setSettings({...settings,enabled:e.target.checked})}/>Planlagt generering</label></div>
      {message&&<p className="mt-4 text-sm text-slate-700">{message}</p>}
    </section>
    <section><h2 className="mb-3 text-lg font-semibold">Innholdskø</h2><div className="space-y-3">{content.length===0?<div className="rounded-2xl border bg-white p-6 text-sm text-slate-500">Ingen utkast er laget ennå.</div>:content.map(item=><article key={item.id} className="rounded-2xl border bg-white p-5"><div className="flex gap-4"><FileText className="mt-1 h-5 w-5 shrink-0 text-blue-700"/><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{item.title}</h3><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{item.status==='published'?'Publisert':item.status==='failed'?'Feilet':'Utkast'}</span></div><p className="mt-1 text-sm text-slate-600">{item.excerpt}</p><p className="mt-2 text-xs text-slate-400">{new Date(item.generated_at).toLocaleDateString('nb-NO')}</p></div>{item.status!=='published'&&settings.publishing_mode==='webhook'&&<button onClick={()=>publish(item.id)} disabled={!!busy} className="flex h-fit items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold"><Send className="h-4 w-4"/>{busy===item.id?'Sender...':'Publiser'}</button>}</div></article>)}</div></section>
  </div>;
}

function Field({label,value,onChange,placeholder,type='text',disabled=false}:{label:string;value:string;onChange:(v:string)=>void;placeholder:string;type?:string;disabled?:boolean}){return <label className="block text-sm font-medium">{label}<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled} className="mt-2 w-full rounded-lg border p-3 font-normal disabled:bg-slate-50"/></label>}
