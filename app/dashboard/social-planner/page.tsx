'use client';

import { useState, useEffect } from 'react';
import { DemoBanner } from '@/components/ui/DemoBanner';
import {
  Calendar, Plus, Facebook, Instagram, Linkedin, Globe,
  Image, Clock, Send, ChevronLeft, ChevronRight, MoreHorizontal,
  Hash, Link, Smile, Repeat, Eye, ThumbsUp, MessageSquare, CheckCircle,
  AlertCircle
} from 'lucide-react';

type Channel = 'facebook' | 'instagram' | 'linkedin' | 'google';

interface ScheduledPost {
  id: string;
  text: string;
  channels: Channel[];
  date: string;
  time: string;
  status: 'scheduled' | 'published' | 'draft';
  image?: boolean;
  reach?: number;
  engagements?: number;
}

const POSTS: ScheduledPost[] = [
  { id: 'p1', text: '🔧 Nå tilbyr vi gratis inspeksjon av varmeanlegg før vinteren! Ta kontakt i dag 👇', channels: ['facebook', 'instagram'], date: '2026-01-20', time: '09:00', status: 'scheduled', image: true },
  { id: 'p2', text: '5-stjernes anmeldelse fra fornøyd kunde i Trondheim 🌟 Takk for tilliten, Bjørn!', channels: ['facebook', 'google'], date: '2026-01-18', time: '12:00', status: 'published', reach: 1240, engagements: 87 },
  { id: 'p3', text: 'Vi er stolte av å melde at vi nå er autorisert Huseiernes Landsforbund-partner ✅', channels: ['linkedin', 'facebook'], date: '2026-01-18', time: '15:00', status: 'published', reach: 890, engagements: 44 },
  { id: 'p4', text: 'Visste du at 73% av norske husholdninger aldri sjekker el-anlegget sitt? Vi fikser det!', channels: ['instagram', 'facebook'], date: '2026-01-22', time: '10:00', status: 'scheduled', image: true },
  { id: 'p5', text: 'Vintertilbud: 15% rabatt på alle baderomsrenoveringer i januar og februar 🏠❄️', channels: ['facebook', 'instagram', 'linkedin'], date: '2026-01-25', time: '08:30', status: 'draft' },
];

const channelColors: Record<Channel, string> = {
  facebook: 'text-blue-600 bg-blue-50 border-blue-200',
  instagram: 'text-pink-600 bg-pink-50 border-pink-200',
  linkedin: 'text-sky-700 bg-sky-50 border-sky-200',
  google: 'text-amber-600 bg-amber-50 border-amber-200',
};

const channelIcons: Record<Channel, React.ElementType> = {
  facebook: Facebook, instagram: Instagram, linkedin: Linkedin, google: Globe,
};

const statusBadge = (s: ScheduledPost['status']) => {
  if (s === 'published') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (s === 'scheduled') return 'text-blue-700 bg-blue-50 border-blue-200';
  return 'text-slate-600 bg-slate-100 border-slate-200';
};

const DAYS = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const AI_SUGGESTIONS = [
  '🔥 "Januar er perfekt tid for å sjekke fyringsanlegget – vi hjelper deg raskt og effektivt!"',
  '⭐ "Ny 5-stjernersanmeldelse fra [kundenavn] – takk for tilliten!"',
  '💡 "Visste du at riktig isolasjon kan spare deg opptil 30% på strøm? Ring oss i dag."',
  '🏠 "Ser du etter fagfolk du kan stole på? Vi er lokale, autoriserte og alltid tilgjengelige."',
];

export default function SocialPlannerPage() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'compose' | 'insights'>('schedule');
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>(['facebook']);
  const [postText, setPostText] = useState('');
  const [showAI, setShowAI] = useState(false);
  const [connections, setConnections] = useState<Record<string, { connected: boolean; account_name?: string }>>({});
  const [connMsg, setConnMsg] = useState('');

  useEffect(() => {
    // Read connection status from DB via company settings
    fetch('/api/social/status')
      .then(r => r.json())
      .then(d => setConnections(d.connections || {}))
      .catch(() => {});
    // Check URL params for success/error from OAuth callback
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const error = params.get('error');
    if (connected) { setConnMsg(`${connected} koblet til!`); window.history.replaceState({}, '', window.location.pathname); }
    if (error) { setConnMsg(`Feil: ${error}`); window.history.replaceState({}, '', window.location.pathname); }
  }, []);

  const PLATFORMS = [
    { id: 'facebook', label: 'Facebook', Icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { id: 'instagram', label: 'Instagram', Icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
    { id: 'google', label: 'Google Business', Icon: Globe, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  ];

  const toggleChannel = (c: Channel) => {
    setSelectedChannels((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  };

  const publishedPosts = POSTS.filter((p) => p.status === 'published');
  const totalReach = publishedPosts.reduce((s, p) => s + (p.reach ?? 0), 0);
  const totalEngagements = publishedPosts.reduce((s, p) => s + (p.engagements ?? 0), 0);

  return (
    <div className="max-w-7xl mx-auto">
      <DemoBanner feature="Sosiale medier" />

      {/* Connected accounts */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900">Tilkoblede kontoer</h2>
          {connMsg && (
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${connMsg.startsWith('Feil') ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {connMsg}
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {PLATFORMS.map(({ id, label, Icon, color, bg, border }) => {
            const conn = connections[id];
            return (
              <div key={id} className={`rounded-xl border p-4 ${conn?.connected ? `${bg} ${border}` : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${conn?.connected ? bg : 'bg-white border border-slate-200'}`}>
                    <Icon className={`h-5 w-5 ${conn?.connected ? color : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{label}</p>
                    {conn?.connected
                      ? <p className="text-xs text-emerald-600 truncate">{conn.account_name || 'Tilkoblet'}</p>
                      : <p className="text-xs text-slate-400">Ikke tilkoblet</p>
                    }
                  </div>
                </div>
                {conn?.connected
                  ? <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                      <CheckCircle className="h-3 w-3" /> Tilkoblet
                    </span>
                  : <a href={`/api/social/connect?platform=${id}`}
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg ${color} bg-white border border-slate-200 hover:border-slate-400 transition`}>
                      Koble til →
                    </a>
                }
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Krever META_APP_ID, META_APP_SECRET og GOOGLE_CLIENT_ID i miljøvariabler for å aktivere OAuth.
        </p>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Social Planner</h1>
          <p className="text-sm text-slate-500">Planlegg og publiser innhold på alle kanaler</p>
        </div>
        <button
          onClick={() => setActiveTab('compose')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
        >
          <Plus className="h-4 w-4" /> Nytt innlegg
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        {(['schedule', 'compose', 'insights'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`text-sm font-medium px-4 py-1.5 rounded-lg transition ${activeTab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t === 'schedule' ? '📅 Kalender' : t === 'compose' ? '✍️ Skriv' : '📊 Statistikk'}
          </button>
        ))}
      </div>

      {activeTab === 'schedule' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg hover:bg-slate-100 transition"><ChevronLeft className="h-4 w-4 text-slate-500" /></button>
                <h2 className="text-sm font-bold text-slate-900">Januar 2026</h2>
                <button className="p-1.5 rounded-lg hover:bg-slate-100 transition"><ChevronRight className="h-4 w-4 text-slate-500" /></button>
              </div>
              <div className="flex gap-1">
                {(['facebook', 'instagram', 'linkedin', 'google'] as Channel[]).map((c) => {
                  const Icon = channelIcons[c];
                  return (
                    <button key={c} className={`p-1.5 rounded-lg border text-xs ${channelColors[c]}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((d) => <div key={d} className="text-xs text-center text-slate-400 font-medium py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {MONTH_DAYS.map((d) => {
                const postsOnDay = POSTS.filter((p) => parseInt(p.date.split('-')[2]) === d);
                return (
                  <div key={d} className={`rounded-xl min-h-16 p-1.5 border ${postsOnDay.length > 0 ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100'}`}>
                    <p className={`text-xs font-medium mb-1 ${postsOnDay.length > 0 ? 'text-blue-700' : 'text-slate-500'}`}>{d}</p>
                    {postsOnDay.map((post) => (
                      <div key={post.id} className="flex gap-0.5 flex-wrap">
                        {post.channels.slice(0, 3).map((c) => {
                          const Icon = channelIcons[c];
                          return <div key={c} className={`p-0.5 rounded border ${channelColors[c]}`}><Icon className="h-2.5 w-2.5" /></div>;
                        })}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming posts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Kommende innlegg</h2>
            <div className="space-y-3">
              {POSTS.filter((p) => p.status !== 'published').map((post) => (
                <div key={post.id} className="border border-slate-100 rounded-xl p-3 hover:border-slate-200 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex gap-1">
                      {post.channels.map((c) => {
                        const Icon = channelIcons[c];
                        return <span key={c} className={`p-1 rounded border ${channelColors[c]}`}><Icon className="h-3 w-3" /></span>;
                      })}
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusBadge(post.status)}`}>
                      {post.status === 'scheduled' ? '⏰ Planlagt' : '✏ Utkast'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mb-2 line-clamp-2">{post.text}</p>
                  <p className="text-xs text-slate-400">{post.date.split('-')[2]}. jan {post.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'compose' && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            {/* Channel selector */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-sm font-semibold text-slate-700 mb-3">Publiser til</p>
              <div className="flex gap-2">
                {(['facebook', 'instagram', 'linkedin', 'google'] as Channel[]).map((c) => {
                  const Icon = channelIcons[c];
                  const active = selectedChannels.includes(c);
                  return (
                    <button key={c} onClick={() => toggleChannel(c)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition
                        ${active ? channelColors[c] + ' opacity-100' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                    >
                      <Icon className="h-4 w-4" />
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                      {active && <CheckCircle className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Compose */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-700">Innhold</p>
                <button onClick={() => setShowAI(!showAI)} className="text-xs text-purple-600 font-medium hover:text-purple-700">
                  ✨ AI-forslag
                </button>
              </div>
              {showAI && (
                <div className="mb-3 space-y-2">
                  {AI_SUGGESTIONS.map((s, i) => (
                    <button key={i} onClick={() => setPostText(s.replace(/^[^\s]+ /, ''))}
                      className="w-full text-left text-xs text-slate-700 bg-purple-50 border border-purple-100 hover:border-purple-300 p-2.5 rounded-xl transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="Skriv innlegget ditt her... 📝"
                rows={5}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 resize-none focus:outline-none focus:border-blue-400"
              />
              <div className="flex items-center gap-2 mt-2">
                <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition">
                  <Image className="h-3.5 w-3.5" /> Legg til bilde
                </button>
                <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition">
                  <Link className="h-3.5 w-3.5" /> Lenke
                </button>
                <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition">
                  <Hash className="h-3.5 w-3.5" /> Hashtags
                </button>
                <span className={`ml-auto text-xs ${postText.length > 2000 ? 'text-red-500' : 'text-slate-400'}`}>{postText.length}/2000</span>
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-sm font-semibold text-slate-700 mb-3">Tidspunkt</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Dato</label>
                  <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Klokkeslett</label>
                  <input type="time" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4" /> Planlegg
                </button>
                <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2">
                  <Send className="h-4 w-4" /> Publiser nå
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 h-fit">
            <p className="text-sm font-semibold text-slate-700 mb-3">Forhåndsvisning</p>
            <div className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">F</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Din bedrift</p>
                  <p className="text-xs text-slate-400">Nå · 🌍</p>
                </div>
              </div>
              <p className="text-sm text-slate-800 mb-3">{postText || 'Teksten din vil vises her...'}</p>
              <div className="h-32 bg-slate-100 rounded-lg flex items-center justify-center mb-3">
                <Image className="h-8 w-8 text-slate-300" />
              </div>
              <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1 text-xs text-slate-400"><ThumbsUp className="h-3.5 w-3.5" /> Liker</span>
                <span className="flex items-center gap-1 text-xs text-slate-400"><MessageSquare className="h-3.5 w-3.5" /> Kommenter</span>
                <span className="flex items-center gap-1 text-xs text-slate-400"><Repeat className="h-3.5 w-3.5" /> Del</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total rekkevidde', value: totalReach.toLocaleString('nb'), icon: '👁', color: 'text-blue-600 bg-blue-50' },
              { label: 'Engasjementer', value: totalEngagements.toLocaleString('nb'), icon: '💬', color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Publiserte innlegg', value: publishedPosts.length.toString(), icon: '✅', color: 'text-purple-600 bg-purple-50' },
              { label: 'Engasjementsrate', value: totalReach > 0 ? `${((totalEngagements / totalReach) * 100).toFixed(1)}%` : '—', icon: '📈', color: 'text-amber-600 bg-amber-50' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
                <p className="text-2xl font-bold text-slate-900 mb-0.5">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Publiserte innlegg</h3>
            <div className="space-y-3">
              {publishedPosts.map((p) => (
                <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition">
                  <div className="flex gap-1">
                    {p.channels.map((c) => { const Icon = channelIcons[c]; return <span key={c} className={`p-1 rounded border ${channelColors[c]}`}><Icon className="h-3 w-3" /></span>; })}
                  </div>
                  <p className="flex-1 text-sm text-slate-700 truncate">{p.text}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-shrink-0">
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{p.reach?.toLocaleString('nb')}</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" />{p.engagements}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
