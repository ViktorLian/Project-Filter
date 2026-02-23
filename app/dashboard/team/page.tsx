'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Copy, Check, Trash2, Crown, Eye, Briefcase, RefreshCw, Link2, Lock, CheckCircle, EyeOff, Shield } from 'lucide-react';

type Member = {
  id: string;
  email: string;
  role: string;
  status: string;
  invite_token: string;
  created_at: string;
};

const ROLES = [
  { value: 'admin', label: 'Administrator', desc: 'Full tilgang, kan invitere andre', icon: Crown },
  { value: 'member', label: 'Selger', desc: 'Leads, kunder, kalender og jobber', icon: Briefcase },
  { value: 'viewer', label: 'Leser', desc: 'Kun lesetilgang til data', icon: Eye },
];

const PERMISSIONS = [
  { label: 'Se og behandle leads', admin: true, member: true, viewer: true },
  { label: 'Kunder og kontakter', admin: true, member: true, viewer: true },
  { label: 'Kalender og bookinger', admin: true, member: true, viewer: true },
  { label: 'Jobber og prosjekter', admin: true, member: true, viewer: true },
  { label: 'Fakturaer og økonomi', admin: true, member: false, viewer: false },
  { label: 'AI-verktøy', admin: true, member: true, viewer: false },
  { label: 'Kampanjer og skjemaer', admin: true, member: false, viewer: false },
  { label: 'Teamadministrasjon', admin: true, member: false, viewer: false },
  { label: 'Innstillinger', admin: true, member: false, viewer: false },
];

function CopyButton({ text, label = 'Kopier' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button onClick={copy}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
      {copied ? <><Check className="h-3 w-3 text-green-500" /> Kopiert!</> : <><Copy className="h-3 w-3" /> {label}</>}
    </button>
  );
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [inviting, setInviting] = useState(false);
  const [newInvite, setNewInvite] = useState<{ token: string; email: string } | null>(null);
  const [err, setErr] = useState('');
  const [showPerms, setShowPerms] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/team');
      const json = await res.json();
      setMembers(json.members || []);
    } catch { setMembers([]); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function invite() {
    if (!email.trim()) return;
    setInviting(true);
    setErr('');
    setNewInvite(null);
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'invite', email: email.trim(), role }),
      });
      const json = await res.json();
      if (!res.ok) { setErr(json.error || 'Feil'); return; }
      setNewInvite({ token: json.token, email: json.member.email });
      setEmail('');
      load();
    } finally { setInviting(false); }
  }

  async function remove(memberId: string) {
    await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove', memberId }),
    });
    setMembers(prev => prev.filter(m => m.id !== memberId));
  }

  async function updateRole(memberId: string, newRole: string) {
    await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_role', memberId, role: newRole }),
    });
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
  }

  const inviteUrl = (token: string) =>
    typeof window !== 'undefined'
      ? `${window.location.origin}/register?invite=${token}`
      : `https://yourapp.com/register?invite=${token}`;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Team og roller</h1>
        <p className="text-slate-500 mt-1">Inviter ansatte — de ser nøyaktig samme data som deg</p>
      </div>

      {/* How it works */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2"><Link2 className="h-4 w-4" />Slik fungerer deling</h3>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Skriv inn e-posten til den ansatte og velg rolle nedenfor</li>
          <li>Klikk "Generer invitasjonslenke" — du får en unik lenke</li>
          <li>Send lenken til den ansatte (SMS, e-post, Teams osv.)</li>
          <li>Den ansatte klikker lenken og registrerer seg med den</li>
          <li>De ser nøyaktig samme leads, kunder og jobber som deg automatisk</li>
        </ol>
      </div>

      {/* Invite form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2"><UserPlus className="h-5 w-5 text-blue-600" />Inviter ny ansatt</h2>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">E-postadresse til ansatt</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="ansatt@bedrift.no"
              onKeyDown={e => e.key === 'Enter' && invite()}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Rolle</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>)}
            </select>
          </div>
        </div>

        {err && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}

        <button onClick={invite} disabled={inviting || !email.trim()}
          className="flex items-center gap-2 bg-blue-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
          <UserPlus className="h-4 w-4" />
          {inviting ? 'Oppretter...' : 'Generer invitasjonslenke'}
        </button>

        {newInvite && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold text-emerald-800">✓ Invitasjon klar for {newInvite.email}</p>
            <p className="text-xs text-emerald-700">Kopier denne lenken og send den til den ansatte:</p>
            <div className="flex items-center gap-2 bg-white border border-emerald-200 rounded-lg px-3 py-2">
              <span className="text-xs text-slate-600 truncate flex-1 font-mono">{inviteUrl(newInvite.token)}</span>
              <CopyButton text={inviteUrl(newInvite.token)} label="Kopier lenke" />
            </div>
          </div>
        )}
      </div>

      {/* Members list */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-500" />
            Teammedlemmer ({members.length})
          </h2>
          <button onClick={load} className="text-slate-400 hover:text-slate-600">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="px-5 py-8 text-center text-slate-400 text-sm">Laster...</div>
        ) : members.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Users className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Ingen teammedlemmer ennå</p>
            <p className="text-slate-400 text-sm mt-1">Inviter din første ansatte ovenfor</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {members.map(m => {
              const roleInfo = ROLES.find(r => r.value === m.role) || ROLES[1];
              const RoleIcon = roleInfo.icon;
              return (
                <div key={m.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-blue-700">{m.email[0].toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{m.email}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        m.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {m.status === 'active' ? '● Aktiv' : '○ Venter på registrering'}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <RoleIcon className="h-3 w-3" />{roleInfo.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {m.status === 'pending' && (
                      <CopyButton text={inviteUrl(m.invite_token)} label="Kopier lenke" />
                    )}
                    <select value={m.role} onChange={e => updateRole(m.id, e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white">
                      {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    <button onClick={() => remove(m.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Permissions table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <button onClick={() => setShowPerms(p => !p)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors">
          <span className="font-semibold text-slate-800 flex items-center gap-2">
            <Lock className="h-4 w-4 text-slate-500" />Tilgangsmatrise
          </span>
          {showPerms ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
        </button>
        {showPerms && (
          <div className="border-t border-slate-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Funksjon</th>
                  {ROLES.map(r => (
                    <th key={r.value} className="px-4 py-3 text-xs font-semibold text-slate-500 text-center">{r.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {PERMISSIONS.map(p => (
                  <tr key={p.label} className="hover:bg-slate-50">
                    <td className="px-5 py-2.5 text-sm text-slate-700">{p.label}</td>
                    {ROLES.map(r => (
                      <td key={r.value} className="px-4 py-2.5 text-center">
                        {(p as any)[r.value]
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
    </div>
  );
}


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
