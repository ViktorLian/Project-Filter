import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { TrendingUp, Users, CheckCircle, XCircle, BarChart2, Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

const STATUS_NO: Record<string, string> = {
  NEW: 'Ny',
  REVIEWED: 'Gjennomgatt',
  ACCEPTED: 'Akseptert',
  REJECTED: 'Avvist',
  IN_PROGRESS: 'Pagaende',
  ARCHIVED: 'Arkivert',
};

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-500',
  REVIEWED: 'bg-yellow-400',
  ACCEPTED: 'bg-emerald-500',
  REJECTED: 'bg-red-400',
  IN_PROGRESS: 'bg-purple-500',
  ARCHIVED: 'bg-slate-300',
};

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  let leads: any[] = [];
  let invoices: any[] = [];

  if (session) {
    const companyId = (session.user as any).companyId;
    const supabase = createAdminClient();
    const [leadsRes, invoicesRes] = await Promise.all([
      supabase.from('leads').select('id, status, score, created_at').eq('company_id', companyId),
      supabase.from('invoices').select('id, amount, status, created_at').eq('company_id', companyId),
    ]);
    leads = leadsRes.data ?? [];
    invoices = invoicesRes.data ?? [];
  }

  const totalLeads = leads.length;
  const accepted = leads.filter(l => l.status === 'ACCEPTED').length;
  const rejected = leads.filter(l => l.status === 'REJECTED').length;
  const acceptanceRate = totalLeads ? Math.round((accepted / totalLeads) * 100) : 0;
  const avgScore = leads.length > 0 ? Math.round(leads.reduce((s, l) => s + (l.score ?? 0), 0) / leads.length) : 0;

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.amount ?? 0), 0);
  const outstanding = invoices.filter(i => i.status === 'unpaid').reduce((s, i) => s + (i.amount ?? 0), 0);

  const stats = [
    { label: 'Totale leads', val: totalLeads, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%' },
    { label: 'Akseptert rate', val: `${acceptanceRate}%`, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: `${accepted} av ${totalLeads}` },
    { label: 'Gj.snitt score', val: avgScore, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'av 100 poeng' },
    { label: 'Betalt inntekt', val: `${(totalRevenue / 1000).toFixed(0)}K kr`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', trend: `${(outstanding / 1000).toFixed(0)}K utestaaende` },
  ];

  const statuses = ['NEW', 'REVIEWED', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'ARCHIVED'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analyse</h1>
        <p className="text-slate-500 text-sm mt-0.5">Oversikt over leads, konvertering og inntekt</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.val}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            <p className="text-xs font-medium text-slate-400 mt-1">{s.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-slate-800">Lead status fordeling</h2>
          </div>
          <div className="space-y-3">
            {statuses.map(status => {
              const count = leads.filter(l => l.status === status).length;
              const pct = totalLeads ? Math.round((count / totalLeads) * 100) : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-24 shrink-0">{STATUS_NO[status] ?? status}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-200">
                    <div className={`h-2 rounded-full transition-all ${STATUS_COLORS[status] ?? 'bg-slate-400'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <h2 className="font-semibold text-slate-800">Innsikt</h2>
          </div>
          <div className="space-y-3">
            {[
              { icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', text: `Du har samlet inn ${totalLeads} henvendelser totalt` },
              { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', text: `${acceptanceRate}% aksepteringsrate` },
              { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', text: `${rejected} leads avvist` },
              { icon: Star, color: 'text-amber-600', bg: 'bg-amber-50', text: `Gjennomsnitts lead-score: ${avgScore} poeng av 100` },
              { icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', text: `${(outstanding / 1000).toFixed(0)} 000 kr utestaaende pa fakturaer` },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg p-3 bg-slate-50">
                <div className={`h-7 w-7 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <p className="text-sm text-slate-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-800 mb-4">Faktura oversikt</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Totale fakturaer', val: invoices.length },
            { label: 'Betalt', val: invoices.filter(i => i.status === 'paid').length },
            { label: 'Utestaaende', val: invoices.filter(i => i.status === 'unpaid').length },
            { label: 'Forfalt', val: invoices.filter(i => i.status === 'overdue').length },
          ].map((s, i) => (
            <div key={i} className="text-center p-3 rounded-lg bg-slate-50">
              <p className="text-2xl font-bold text-slate-900">{s.val}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
