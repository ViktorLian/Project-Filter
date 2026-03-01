'use client';

import { useState } from 'react';
import { DemoBanner } from '@/components/ui/DemoBanner';
import {
  MessageSquare, Mail, Phone, Instagram, Facebook, Globe,
  Search, Star, Clock, CheckCheck, Filter, Send, Paperclip,
  MoreHorizontal, ChevronDown, Smile, Bot, AlertCircle, TrendingUp
} from 'lucide-react';

type Channel = 'all' | 'sms' | 'email' | 'whatsapp' | 'instagram' | 'facebook';
type SentimentType = 'positive' | 'negative' | 'neutral' | 'urgent';

interface Conversation {
  id: string;
  name: string;
  channel: Exclude<Channel, 'all'>;
  preview: string;
  time: string;
  unread: number;
  sentiment: SentimentType;
  tag?: string;
  avatar?: string;
}

const CONVOS: Conversation[] = [
  { id: 'c1', name: 'Bjørn Hansen', channel: 'sms', preview: 'Hei, er dere ledige fredag? Trenger hjelp med vannlekkasje', time: '2 min', unread: 2, sentiment: 'urgent', tag: 'Kjøpssignal' },
  { id: 'c2', name: 'Anna Larsen', channel: 'email', preview: 'Takk for flott jobb i forrige uke! Kan dere komme igjen og…', time: '8 min', unread: 1, sentiment: 'positive', tag: 'Fornøyd' },
  { id: 'c3', name: 'Per Kristiansen', channel: 'whatsapp', preview: 'Prisen dere sendte er alt for høy, 3 konkurrenter gir meg…', time: '22 min', unread: 3, sentiment: 'negative', tag: 'Klage' },
  { id: 'c4', name: 'Kari Olsen', channel: 'instagram', preview: 'Hei! Sett dere på IG, dere ser kjempe profesjonelle ut 🔥', time: '45 min', unread: 1, sentiment: 'positive' },
  { id: 'c5', name: 'Thomas Berg', channel: 'sms', preview: 'Ok greit, ring tilbake når dere har tid', time: '1t', unread: 0, sentiment: 'neutral' },
  { id: 'c6', name: 'Lise Johansen', channel: 'facebook', preview: 'Fikk ikke svar sist jeg ringte. Veldig skuffet over…', time: '2t', unread: 0, sentiment: 'negative', tag: 'Haster' },
  { id: 'c7', name: 'Morten Nilsen', channel: 'email', preview: 'Vil gjerne ha et tilbud på komplett baderomrenovering…', time: '3t', unread: 0, sentiment: 'positive', tag: 'Kjøpssignal' },
  { id: 'c8', name: 'Silje Andersen', channel: 'whatsapp', preview: 'Ja det høres bra ut, sender adresse nå', time: '5t', unread: 0, sentiment: 'neutral' },
];

const MESSAGES = [
  { id: 'm1', from: 'Bjørn Hansen', text: 'Hei! Er dere ledige fredag denne uken?', time: '09:12', isMe: false },
  { id: 'm2', from: 'meg', text: 'Hei Bjørn! La meg sjekke kalenderen raskt 😊', time: '09:14', isMe: true },
  { id: 'm3', from: 'Bjørn Hansen', text: 'Det haster litt – vi har en vannlekkasje under kjøkkenvasken', time: '09:15', isMe: false },
  { id: 'm4', from: 'meg', text: 'Forstår! Vi kan komme fredag kl. 10 eller 14. Hva passer?', time: '09:16', isMe: true },
  { id: 'm5', from: 'Bjørn Hansen', text: 'Hei, er dere ledige fredag? Trenger hjelp med vannlekkasje', time: '09:21', isMe: false },
];

const channelIcons: Record<Exclude<Channel, 'all'>, React.ElementType> = {
  sms: Phone, email: Mail, whatsapp: MessageSquare, instagram: Instagram, facebook: Facebook,
};

const channelColors: Record<Exclude<Channel, 'all'>, string> = {
  sms: 'text-blue-500 bg-blue-50', email: 'text-slate-500 bg-slate-100',
  whatsapp: 'text-emerald-500 bg-emerald-50', instagram: 'text-pink-500 bg-pink-50', facebook: 'text-blue-600 bg-blue-50',
};

const sentimentColors: Record<SentimentType, string> = {
  positive: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  negative: 'text-red-600 bg-red-50 border-red-200',
  neutral: 'text-slate-500 bg-slate-50 border-slate-200',
  urgent: 'text-orange-600 bg-orange-50 border-orange-200',
};

const sentimentIcons: Record<SentimentType, string> = {
  positive: '🟢', negative: '🔴', neutral: '⚪', urgent: '🟠',
};

export default function InboxPage() {
  const [activeChannel, setActiveChannel] = useState<Channel>('all');
  const [activeConvo, setActiveConvo] = useState<Conversation>(CONVOS[0]);
  const [replyText, setReplyText] = useState('');
  const [search, setSearch] = useState('');

  const filtered = CONVOS.filter((c) => {
    const chMatch = activeChannel === 'all' || c.channel === activeChannel;
    const sMatch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.preview.toLowerCase().includes(search.toLowerCase());
    return chMatch && sMatch;
  });

  const unreadTotal = CONVOS.reduce((s, c) => s + c.unread, 0);

  const ChannelIcon = channelIcons[activeConvo.channel];

  return (
    <>
      <div className="-mx-6 -mt-6 px-6 py-2.5 border-b border-amber-200 bg-amber-50 mb-0">
        <DemoBanner feature="Innboks" />
      </div>
      <div className="flex h-[calc(100vh-136px)] -mx-6 overflow-hidden">
      {/* Left: Conversation list */}
      <div className="w-80 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col">
        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">Innboks</h1>
              {unreadTotal > 0 && (
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadTotal}</span>
              )}
            </div>
            <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition">
              <Filter className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Søk i samtaler..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        {/* Channel filters */}
        <div className="px-3 py-2 border-b border-slate-100 flex gap-1 overflow-x-auto">
          {(['all', 'sms', 'email', 'whatsapp', 'instagram', 'facebook'] as Channel[]).map((ch) => {
            const Icon = ch === 'all' ? MessageSquare : channelIcons[ch];
            const cnt = ch === 'all' ? CONVOS.reduce((s, c) => s + c.unread, 0) : CONVOS.filter(c => c.channel === ch).reduce((s, c) => s + c.unread, 0);
            return (
              <button
                key={ch}
                onClick={() => setActiveChannel(ch)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition
                  ${activeChannel === ch ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
              >
                <Icon className="h-3 w-3" />
                {ch === 'all' ? 'Alt' : ch.charAt(0).toUpperCase() + ch.slice(1)}
                {cnt > 0 && <span className={`text-xs font-bold px-1 rounded-full ${activeChannel === ch ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}`}>{cnt}</span>}
              </button>
            );
          })}
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((c) => {
            const Icon = channelIcons[c.channel];
            return (
              <button
                key={c.id}
                onClick={() => setActiveConvo(c)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-slate-50 transition
                  ${activeConvo.id === c.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-slate-50'}`}
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-slate-600">{c.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-sm font-semibold ${c.unread ? 'text-slate-900' : 'text-slate-700'}`}>{c.name}</span>
                    <span className="text-xs text-slate-400">{c.time}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className={`inline-flex items-center gap-0.5 p-1 rounded text-xs ${channelColors[c.channel]}`}>
                      <Icon className="h-2.5 w-2.5" />
                    </span>
                    <span className="text-xs text-slate-500 truncate">{c.preview}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{sentimentIcons[c.sentiment]}</span>
                    {c.tag && (
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full border ${sentimentColors[c.sentiment]}`}>{c.tag}</span>
                    )}
                    {c.unread > 0 && (
                      <span className="ml-auto bg-blue-600 text-white text-xs font-bold h-4 w-4 rounded-full flex items-center justify-center">{c.unread}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Chat window */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center">
              <span className="font-bold text-blue-700">{activeConvo.name[0]}</span>
            </div>
            <div>
              <p className="font-semibold text-slate-900">{activeConvo.name}</p>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${channelColors[activeConvo.channel]}`}>
                  <ChannelIcon className="h-3 w-3" />
                  {activeConvo.channel}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${sentimentColors[activeConvo.sentiment]}`}>
                  {sentimentIcons[activeConvo.sentiment]} {activeConvo.sentiment === 'urgent' ? 'Haster' : activeConvo.sentiment === 'positive' ? 'Positiv' : activeConvo.sentiment === 'negative' ? 'Negativ' : 'Nøytral'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg font-medium transition">
              <Bot className="h-3.5 w-3.5" />
              AI Svar
            </button>
            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* AI sentiment banner */}
        {activeConvo.sentiment === 'urgent' && (
          <div className="mx-4 mt-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3 px-4 py-2.5">
            <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
            <p className="text-xs text-orange-700"><span className="font-semibold">AI-analyse:</span> Kunden har et presserende problem (vannlekkasje). Anbefalt responstid: under 5 min. Sannsynlighet for salg: høy.</p>
            <span className="ml-auto text-xs font-bold text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full whitespace-nowrap">🔥 Kjøpssignal</span>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {MESSAGES.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
              {!msg.isMe && (
                <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0 self-end">
                  <span className="text-xs font-bold text-blue-600">{msg.from[0]}</span>
                </div>
              )}
              <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                msg.isMe
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-slate-100 text-slate-900 rounded-bl-sm'
              }`}>
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 text-right ${msg.isMe ? 'text-blue-200' : 'text-slate-400'}`}>{msg.time}</p>
              </div>
              {msg.isMe && (
                <div className="ml-2 self-end">
                  <CheckCheck className="h-4 w-4 text-blue-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Reply bar */}
        <div className="px-4 pb-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Skriv en melding..."
              rows={2}
              className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 resize-none focus:outline-none"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex gap-2">
                <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"><Paperclip className="h-4 w-4" /></button>
                <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"><Smile className="h-4 w-4" /></button>
                <button className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 px-2 py-1.5 rounded-lg hover:bg-purple-50 transition font-medium">
                  <Bot className="h-3.5 w-3.5" /> Generer svar
                </button>
              </div>
              <button
                onClick={() => setReplyText('')}
                disabled={!replyText.trim()}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold px-4 py-1.5 rounded-xl transition"
              >
                <Send className="h-3.5 w-3.5" /> Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Contact details */}
      <div className="w-64 flex-shrink-0 border-l border-slate-200 bg-slate-50 p-4 overflow-y-auto">
        <div className="text-center mb-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center mx-auto mb-2">
            <span className="text-xl font-bold text-blue-700">{activeConvo.name[0]}</span>
          </div>
          <p className="font-semibold text-slate-900 text-sm">{activeConvo.name}</p>
          <p className="text-xs text-slate-500">Aktiv kunde</p>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Telefon', value: '+47 900 00 000' },
            { label: 'E-post', value: 'bjorn@epost.no' },
            { label: 'Siste kjøp', value: '18. jan 2026' },
            { label: 'Totalt brukt', value: 'kr 42 500' },
            { label: 'Lead-score', value: '87 / 100' },
          ].map((r) => (
            <div key={r.label}>
              <p className="text-xs text-slate-400 mb-0.5">{r.label}</p>
              <p className="text-sm font-medium text-slate-900">{r.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Hurtighandlinger</p>
          <div className="space-y-1.5">
            {['Ring opp', 'Lag tilbud', 'Sett i pipeline', 'Logg notat'].map((a) => (
              <button key={a} className="w-full text-left text-xs text-slate-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition font-medium">
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <p className="text-xs font-semibold text-slate-500 uppercase">Kjøpssannsynlighet</p>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 mb-1">
            <div className="h-2 rounded-full bg-emerald-500" style={{ width: '78%' }} />
          </div>
          <p className="text-xs text-emerald-600 font-bold">78% — Høy</p>
        </div>
      </div>
    </div>
    </>
  );
}
