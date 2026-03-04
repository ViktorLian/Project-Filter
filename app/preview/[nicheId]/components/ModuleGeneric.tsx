'use client';
import { useState } from 'react';
import type { Niche } from '@/lib/niches';
import { ACC, mkData, StockChart, getKPIs, NicheFeaturePanel } from './shared';
import { CheckCircle, Zap, Play, Settings, BarChart2, MessageSquare, Globe, Star, Clock, Briefcase, Users, Layout } from 'lucide-react';

const MODULE_META: Record<string,{ title:string; desc:string; bullets:string[]; icon:React.ElementType }> = {
  'workflows':           { title:'Automatiserte arbeidsflyter', desc:'Sett opp regler som kjores automatisk nar bestemte hendelser inntreffer.', bullets:['Utloser pa leads, fakturaer og oppgaver','Send automatiske e-poster og SMS','Oppdater status uten manuelt arbeid','Varsle teamet ved viktige hendelser'], icon:Zap },
  'social-planner':      { title:'Sosiale medier-planlegger',  desc:'Planlegg og publiser innhold pa tvers av plattformer fra ett sted.', bullets:['Koble til Instagram, Facebook og LinkedIn','Planlegg innlegg uker i forveien','Se kalender over planlagt innhold','Engasjementsstatistikk per innlegg'], icon:Globe },
  'email-sequences':     { title:'E-postsekvenser',            desc:'Automatisk oppfolgingsskjede for nye leads og kunder.', bullets:['Velkomstsekvens for nye leads','Oppfolging etter demo eller mote','Re-engasjement for inaktive kontakter','Tilpasser innhold etter adferd'], icon:MessageSquare },
  'review-gatekeeper':   { title:'Omtalehåndtering',           desc:'Fa flere positive omtaler og fang opp negative tilbakemeldinger privat.', bullets:['Be om omtale etter vellykket levering','Send misfornøyde kunder til intern kanal','Koble til Google My Business','Mal gjennomsnittlig vurdering over tid'], icon:Star },
  'google-maps':         { title:'Google Maps-synlighet',      desc:'Optimaliser din lokale synlighet og monitor anmeldelser.', bullets:['Se hvor du rangerer lokalt','Svar pa Google-anmeldelser','Mal antall klikk og retningsanmodninger','Konkurrentanalyse lokalt'], icon:Globe },
  'analytics':           { title:'Avansert analyse',           desc:'Dybdeinnsikt i alle aspekter av virksomheten din.', bullets:['Konverteringsrate per kanal','Kohorteanalyse av kunder','Leads til inntekt-tracking','Tilpassede dashboards og rapporter'], icon:BarChart2 },
  'ai-assistant':        { title:'AI-assistent',               desc:'Spar tid med kunstig intelligens pa tvers av hele plattformen.', bullets:['Generer tilbud og e-poster pa sekunder','Oppsummering av kundehistorikk','Smarte pafolger-forslag','Forutsigelse av avgang-risiko'], icon:Zap },
  'chatbot-widget':      { title:'Chatbot-widget',             desc:'Fang leads og svar pa sporsmal pa nettstedet ditt 24/7.', bullets:['Installer pa din nettside pa minutter','Svar pa vanlige sporsmal automatisk','Videresend til menneskelig agent','Samler leadinfo direkte inn i CRM'], icon:MessageSquare },
  'client-portal':       { title:'Kundeportal',                desc:'Gi kunder tilgang til en sikker selvbetjeningsportal.', bullets:['Fakturaer og betalingshistorikk','Dokumenter og kontrakter','Statusoppdateringer pa pabegynte jobber','Direktechat med teamet'], icon:Users },
  'forms':               { title:'Smarte skjemaer',            desc:'Bygg egendefinerte skjemaer som automatisk konverterer til leads.', bullets:['Dra-og-slipp skjemabygger','Integrer pa nettsiden din','Leads havner direkte i CRM','Betingede felt og logikk'], icon:Layout },
  'settings':            { title:'Innstillinger',              desc:'Tilpass plattformen for virksomheten din.', bullets:['Brukeradministrasjon og roller','Integrasjoner med eksterne verktoy','Fakturerings- og abonnementsstyring','Hvit-merking og eget domene'], icon:Settings },
  'time-tracking':       { title:'Tidregistrering',           desc:'Logg tid brukt pa prosjekter og kunder automatisk.', bullets:['Start/stopp-timer per oppgave','Daglig og ukentlig oversikt','Fakturer basert pa loggfort tid','Eksporter til lonn og faktura'], icon:Clock },
  'jobs':                { title:'Jobbhåndtering',             desc:'Administrer oppdrag og jobber fra lead til ferdig levering.', bullets:['Tildel jobber til teknikere','Status: mottatt / pa vei / ferdig','Jobbhistorikk per kunde','Signaturer og bilder pa jobb'], icon:Briefcase },
  'appointments':        { title:'Avtalehåndtering',           desc:'Administrer bookinger og bekreftelser pa ett sted.', bullets:['Online booking direkte fra nettside','SMS-painnelse til kunder','Buffer mellom avtaler','Integrer med Google Kalender'], icon:CheckCircle },
  'contracts':           { title:'Kontrakter',                 desc:'Opprett, send og signer kontrakter digitalt.', bullets:['Maler for vanlige kontraktstyper','Digital signatur','Versjonskontroll og historikk','Automatisk oppfolging ved utlop'], icon:Briefcase },
  'projects':            { title:'Prosjektstyring',            desc:'Hold oversikt over alle pabegynte prosjekter.', bullets:['Milepaler og tidslinjer','Oppgaver per prosjekt','Teamtildeling og kommentarer','Budsjett vs faktisk bruk'], icon:CheckCircle },
  'memberships':         { title:'Medlemskapsmodul',           desc:'Administrer abonnenter og medlemmer enkelt.', bullets:['Medlemsnivåer med tilgangskontroll','Automatisk fakturering','Velkomst- og fornyelsesflyter','Statistikk per nivå'], icon:Users },
};

export function ModuleGeneric({ nicheId, niche, moduleKey }: { nicheId:string; niche:Niche; moduleKey:string }) {
  const meta = MODULE_META[moduleKey] ?? {
    title: moduleKey.replace(/-/g,' ').replace(/\b\w/g,l=>l.toUpperCase()),
    desc: 'Kraftig modul som hjelper deg effektivisere denne delen av virksomheten din.',
    bullets: ['Spare tid pa manuelle oppgaver','Automatiser oppfolginger','Fa bedre oversikt','Skalerer med virksomheten din'],
    icon: Zap,
  };
  const Icon = meta.icon;
  const k = getKPIs(nicheId);
  const chartData = mkData(nicheId, moduleKey.length, k.leads * 8, 0.38);
  const [activated, setActivated] = useState(false);

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{backgroundColor:'#e0e7ff'}}>
            <Icon className="h-6 w-6" style={{color:ACC}}/>
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-900">{meta.title}</h2>
            <p className="text-sm text-slate-500 mt-1">{meta.desc}</p>
          </div>
          <button
            onClick={()=>setActivated(v=>!v)}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${activated?'bg-emerald-100 text-emerald-700':'text-white'}`}
            style={!activated?{backgroundColor:ACC}:{}}>
            {activated?<><CheckCircle className="h-4 w-4"/>Aktivert</>:<><Play className="h-4 w-4"/>Aktiver modul</>}
          </button>
        </div>
        <ul className="mt-4 grid sm:grid-cols-2 gap-2">
          {meta.bullets.map(b=>(
            <li key={b} className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5"/>
              {b}
            </li>
          ))}
        </ul>
      </div>

      <StockChart title={`Aktivitet — ${meta.title}`} subtitle="Apr 2025 – mars 2026" data={chartData} suf=" hendelser"/>

      <NicheFeaturePanel niche={niche}/>
    </div>
  );
}
