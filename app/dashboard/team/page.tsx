'use client';

import { useState } from 'react';
import {
  Users, Crown, Shield, Briefcase, Plus, Mail, MoreHorizontal,
  CheckCircle, Lock, Eye, EyeOff, AlertCircle, UserPlus, Trash2, Edit2
} from 'lucide-react';

type Role = 'owner' | 'admin' | 'worker';

interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'invited';
  lastActive: string;
  avatar: string;
}

const DEMO_MEMBERS: Member[] = [
  { id: '1', name: 'Ola Eier', email: 'ola@firma.no', role: 'owner', status: 'active', lastActive: 'I dag', avatar: 'O' },
  { id: '2', name: 'Anna Leder', email: 'anna@firma.no', role: 'admin', status: 'active', lastActive: 'I dag', avatar: 'A' },
  { id: '3', name: 'Lars Arbeider', email: 'lars@firma.no', role: 'worker', status: 'active', lastActive: 'I gar', avatar: 'L' },
  { id: '4', name: 'Kari Ny', email: 'kari@firma.no', role: 'worker', status: 'invited', lastActive: 'Invitert', avatar: 'K' },
];

const ROLE_CONFIG: Record<Role, { label: string; icon: React.ElementType; color: string; bg: string; description: string }> = {
  owner: { label: 'Eier', icon: Crown, color: 'text-amber-700', bg: 'bg-amber-100', description: 'Full tilgang til alt. Kan ikke fjernes.' },
  admin: { label: 'Administrator', icon: Shield, color: 'text-blue-700', bg: 'bg-blue-100', description: 'Full tilgang unntatt fakturering og plan.' },
  worker: { label: 'Arbeider', icon: Briefcase, color: 'text-slate-700', bg: 'bg-slate-100', description: 'Tilgang til leads, kunder, kalender og jobber.' },
};

const PERMISSIONS: { label: string; owner: boolean; admin: boolean; worker: boolean }[] = [
  { label: 'Se og behandle leads', owner: true, admin: true, worker: true },
  { label: 'Kunder og kontakter', owner: true, admin: true, worker: true },
  { label: 'Kalender og bookinger', owner: true, admin: true, worker: true },
  { label: 'Jobber og prosjekter', owner: true, admin: true, worker: true },
  { label: 'Fakturaer og økonomi', owner: true, admin: true, worker: false },
  { label: 'AI-verktøy', owner: true, admin: true, worker: false },
  { label: 'Kampanjer og skjemaer', owner: true, admin: true, worker: false },
  { label: 'Rapporter og analyse', owner: true, admin: true, worker: false },
  { label: 'Teamadministrasjon', owner: true, admin: false, worker: false },
  { label: 'Fakturering og abonnement', owner: true, admin: false, worker: false },
  { label: 'Innstillinger', owner: true, admin: false, worker: false },
];

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>(DEMO_MEMBERS);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('worker');
  const [showPerms, setShowPerms] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const invite = (e: React.FormEvent) => {
    e.preventDefault();
    const name = inviteEmail.split('@')[0];
    setMembers(p => [...p, {
      id: Date.now().toString(), name, email: inviteEmail,
      role: inviteRole, status: 'invited', lastActive: 'Invitert', avatar: name[0]?.toUpperCase() || '?',
    }]);
    setInviteEmail('');
    setShowInvite(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Teamadministrasjon</h1>
          <p className="text-slate-500 text-sm">Administrer teammedlemmer, roller og tilganger.</p>
        </div>
        <button onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
          <UserPlus className="h-4 w-4" /> Inviter medlem
        </button>
      </div>

      {/* Role cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {(Object.entries(ROLE_CONFIG) as [Role, typeof ROLE_CONFIG[Role]][]).map(([key, r]) => {
          const Icon = r.icon;
          const count = members.filter(m => m.role === key).length;
          return (
            <div key={key} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${r.bg} mb-3`}>
                <Icon className={`h-5 w-5 ${r.color}`} />
              </div>
              <p className="font-semibold text-slate-900">{r.label}</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{r.description}</p>
              <p className="text-2xl font-bold text-slate-900 mt-3">{count}</p>
              <p className="text-xs text-slate-400">{count === 1 ? 'person' : 'personer'}</p>
            </div>
          );
        })}
      </div>

      {/* Member list */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Teammedlemmer</h2>
          <span className="text-xs text-slate-400">{members.length} totalt</span>
        </div>
        <div className="divide-y divide-slate-50">
          {members.map(m => {
            const rc = ROLE_CONFIG[m.role];
            const RIcon = rc.icon;
            return (
              <div key={m.id} className="flex items-center gap-4 px-5 py-4">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {m.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    {m.name}
                    {m.status === 'invited' && (
                      <span className="text-[10px] border border-amber-300 bg-amber-50 text-amber-700 font-semibold px-1.5 py-0.5 rounded-full">Invitert</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">{m.email}</p>
                </div>
                <div className={`hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${rc.bg} ${rc.color}`}>
                  <RIcon className="h-3 w-3" />
                  {rc.label}
                </div>
                <p className="text-xs text-slate-400 hidden sm:block w-16 text-right">{m.lastActive}</p>
                {m.role !== 'owner' && (
                  <button
                    onClick={() => setMembers(p => p.filter(x => x.id !== m.id))}
                    className="text-slate-300 hover:text-red-400 transition"
                    title="Fjern"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Permissions table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <button
          onClick={() => setShowPerms(p => !p)}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
        >
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-slate-500" />
            <span className="font-semibold text-slate-900">Tilgangsmatrise</span>
          </div>
          {showPerms ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
        </button>
        {showPerms && (
          <div className="border-t border-slate-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Funksjon</th>
                  {(['owner', 'admin', 'worker'] as Role[]).map(r => (
                    <th key={r} className="px-4 py-3 text-xs font-semibold text-slate-500">{ROLE_CONFIG[r].label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {PERMISSIONS.map(p => (
                  <tr key={p.label} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-slate-700">{p.label}</td>
                    {(['owner', 'admin', 'worker'] as Role[]).map(r => (
                      <td key={r} className="px-4 py-3 text-center">
                        {p[r]
                          ? <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                          : <span className="block h-1 w-4 rounded bg-slate-200 mx-auto" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowInvite(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Inviter nytt teammedlem</h2>
              <button onClick={() => setShowInvite(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <form onSubmit={invite} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">E-postadresse</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="navn@firma.no"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Rolle</label>
                <div className="mt-2 space-y-2">
                  {(['admin', 'worker'] as Role[]).map(r => {
                    const rc = ROLE_CONFIG[r];
                    const Icon = rc.icon;
                    return (
                      <button
                        key={r} type="button"
                        onClick={() => setInviteRole(r)}
                        className={`w-full flex items-start gap-3 rounded-lg border p-3 text-left transition ${inviteRole === r ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-200'}`}
                      >
                        <div className={`mt-0.5 h-8 w-8 flex-shrink-0 rounded-lg flex items-center justify-center ${rc.bg}`}>
                          <Icon className={`h-4 w-4 ${rc.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{rc.label}</p>
                          <p className="text-xs text-slate-500">{rc.description}</p>
                        </div>
                        {inviteRole === r && <CheckCircle className="h-4 w-4 text-blue-600 ml-auto flex-shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowInvite(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm text-slate-600">Avbryt</button>
                <button type="submit" className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Send invitasjon</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
