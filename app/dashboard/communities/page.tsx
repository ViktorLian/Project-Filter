'use client';

import { useState } from 'react';
import { DemoBanner } from '@/components/ui/DemoBanner';
import {
  Users, Plus, MessageSquare, ThumbsUp, Pin, Lock,
  Globe, Search, Bell, Heart, Share2, MoreHorizontal,
  Crown, Star, ChevronRight, Edit2, Image, Send
} from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  postCount: number;
  isPrivate: boolean;
  category: string;
  lastActivity: string;
  cover: string;
}

interface Post {
  id: string;
  author: string;
  authorRole: string;
  groupId: string;
  content: string;
  time: string;
  likes: number;
  comments: number;
  isPinned?: boolean;
}

const GROUPS: Group[] = [
  { id: 'g1', name: 'FlowPilot SMB-nettverket', description: 'Community for alle FlowPilot-brukere. Del tips, erfaringer og spørsmål.', memberCount: 1247, postCount: 432, isPrivate: false, category: 'Hoved', lastActivity: '12 min siden', cover: 'bg-gradient-to-r from-blue-400 to-blue-600' },
  { id: 'g2', name: '⚡ Superbrukerforum', description: 'For avanserte brukere som vil hente ut maksimalt av FlowPilot.', memberCount: 89, postCount: 156, isPrivate: true, category: 'Eksklusivt', lastActivity: '1t siden', cover: 'bg-gradient-to-r from-purple-400 to-purple-600' },
  { id: 'g3', name: '🔧 Håndverkere & VVS', description: 'Bransjespesifikk gruppe for rørleggere, elektrikere og håndverkere.', memberCount: 312, postCount: 89, isPrivate: false, category: 'Bransje', lastActivity: '3t siden', cover: 'bg-gradient-to-r from-orange-400 to-orange-600' },
  { id: 'g4', name: '📊 Daglig leder-forum', description: 'For eiere og ledere. Strategi, vekst og lederskap.', memberCount: 178, postCount: 67, isPrivate: true, category: 'Ledelse', lastActivity: '5t siden', cover: 'bg-gradient-to-r from-emerald-400 to-emerald-600' },
];

const POSTS: Post[] = [
  { id: 'p1', author: 'Martin Vold', authorRole: 'Admin', groupId: 'g1', content: '🎉 Vi har nå passert 1200 medlemmer! Takk til alle som er med og gjør dette nettverket til et av de beste for norske SMB-bedrifter. Fortsett å dele tips og erfaringer!', time: '12 min siden', likes: 47, comments: 12, isPinned: true },
  { id: 'p2', author: 'Sara Holm', authorRole: 'Superbruker', groupId: 'g1', content: 'Tips: Har noen testet den nye AI-funksjonaliteten for å lage tilbud? Jeg satte den opp med egne maler og spart minst 2 timer i uken allerede 🚀', time: '45 min siden', likes: 23, comments: 8 },
  { id: 'p3', author: 'Kjell Bakke', authorRole: 'Medlem', groupId: 'g1', content: 'Spørsmål: Hvordan setter dere opp automatisk purring på fakturaer? Har prøvd men får det ikke til å kjøre etter 14 dager 🤔', time: '1t siden', likes: 5, comments: 14 },
  { id: 'p4', author: 'Ingrid Dahl', authorRole: 'Superbruker', groupId: 'g1', content: 'Nettopp integrert FlowPilot med regnskapssystemet mitt. Tok 20 minutter og nå flyter alt automatisk! Kan hjelpe om noen sliter.', time: '2t siden', likes: 31, comments: 6 },
];

export default function CommunitiesPage() {
  const [activeGroup, setActiveGroup] = useState<Group>(GROUPS[0]);
  const [search, setSearch] = useState('');
  const [newPost, setNewPost] = useState('');
  const [activeTab, setActiveTab] = useState<'feed' | 'members'>('feed');

  const filteredGroups = GROUPS.filter(
    (g) => !search || g.name.toLowerCase().includes(search.toLowerCase())
  );

  const groupPosts = POSTS.filter((p) => p.groupId === activeGroup.id);

  return (
    <>
      <div className="-mx-6 -mt-6 px-6 py-2.5 border-b border-amber-200 bg-amber-50 mb-0">
        <DemoBanner feature="Fellesskap" />
      </div>
      <div className="flex h-[calc(100vh-136px)] -mx-6 overflow-hidden">
      {/* Left: Group list */}
      <div className="w-72 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col">
        <div className="px-4 pt-5 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-base font-bold text-slate-900">Communities</h1>
            <button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition">
              <Plus className="h-3.5 w-3.5" /> Ny gruppe
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Søk grupper..." className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-blue-400" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredGroups.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGroup(g)}
              className={`w-full text-left px-4 py-3.5 border-b border-slate-50 transition
                ${activeGroup.id === g.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-slate-50'}`}
            >
              <div className={`h-10 w-10 rounded-xl ${g.cover} mb-2 flex items-center justify-center`}>
                <Users className="h-5 w-5 text-white" />
                {g.isPrivate && <Lock className="h-3 w-3 text-white absolute ml-6 mt-6" />}
              </div>
              <p className="text-sm font-semibold text-slate-900 truncate">{g.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-400">{g.memberCount.toLocaleString('nb')} med.</span>
                {g.isPrivate && <span className="text-xs text-purple-600 font-medium flex items-center gap-0.5"><Lock className="h-2.5 w-2.5" /> Privat</span>}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{g.lastActivity}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Group content */}
      <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
        {/* Group header */}
        <div className={`${activeGroup.cover} px-6 py-5`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-white">{activeGroup.name}</h2>
                {activeGroup.isPrivate && <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full flex items-center gap-1"><Lock className="h-3 w-3" /> Privat</span>}
              </div>
              <p className="text-sm text-white/80">{activeGroup.description}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-white/90 font-medium">{activeGroup.memberCount.toLocaleString('nb')} medlemmer</span>
                <span className="text-sm text-white/90">{activeGroup.postCount} innlegg</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition">
                <Bell className="h-3.5 w-3.5" /> Varsler
              </button>
              <button className="flex items-center gap-1.5 bg-white text-slate-700 hover:bg-white/90 text-xs font-medium px-3 py-1.5 rounded-lg transition">
                <Edit2 className="h-3.5 w-3.5" /> Rediger
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-slate-200 px-6 flex gap-1 py-2">
          {(['feed', 'members'] as const).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`text-sm font-medium px-4 py-1.5 rounded-lg transition ${activeTab === t ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              {t === 'feed' ? '📰 Feed' : '👥 Medlemmer'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'feed' && (
            <div className="max-w-2xl mx-auto px-6 py-4 space-y-4">
              {/* Compose */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder={`Del noe med ${activeGroup.name}...`}
                  rows={3}
                  className="w-full text-sm text-slate-900 placeholder-slate-400 resize-none focus:outline-none"
                />
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                  <div className="flex gap-2">
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"><Image className="h-4 w-4" /></button>
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"><Pin className="h-4 w-4" /></button>
                  </div>
                  <button disabled={!newPost.trim()}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                  >
                    <Send className="h-3.5 w-3.5" /> Publiser
                  </button>
                </div>
              </div>

              {/* Posts */}
              {groupPosts.map((post) => (
                <div key={post.id} className={`bg-white rounded-2xl border p-4 ${post.isPinned ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200'}`}>
                  {post.isPinned && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 font-medium mb-2">
                      <Pin className="h-3.5 w-3.5" /> Festet innlegg
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-blue-700">{post.author[0]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-900">{post.author}</span>
                        {post.authorRole === 'Admin' && <span className="text-xs text-amber-600 font-medium flex items-center gap-0.5"><Crown className="h-3 w-3" /> Admin</span>}
                        {post.authorRole === 'Superbruker' && <span className="text-xs text-purple-600 font-medium flex items-center gap-0.5"><Star className="h-3 w-3" /> Super</span>}
                        <span className="text-xs text-slate-400 ml-auto">{post.time}</span>
                      </div>
                      <p className="text-sm text-slate-700 mb-3">{post.content}</p>
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition font-medium">
                          <ThumbsUp className="h-3.5 w-3.5" /> {post.likes}
                        </button>
                        <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition font-medium">
                          <MessageSquare className="h-3.5 w-3.5" /> {post.comments} kommentarer
                        </button>
                        <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition ml-auto">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="max-w-2xl mx-auto px-6 py-4">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {['Martin Vold – Admin', 'Sara Holm – Superbruker', 'Kjell Bakke – Superbruker', 'Ingrid Dahl – Superbruker', 'Thomas Berg – Medlem', 'Kari Olsen – Medlem', 'Per Nilsen – Medlem'].map((m, i) => {
                  const [name, role] = m.split(' – ');
                  return (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-slate-600">{name[0]}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900 flex-1">{name}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        role === 'Admin' ? 'text-amber-700 bg-amber-50 border border-amber-200' :
                        role === 'Superbruker' ? 'text-purple-700 bg-purple-50 border border-purple-200' :
                        'text-slate-500 bg-slate-100 border border-slate-200'
                      }`}>{role}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
