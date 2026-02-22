import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Plus, ExternalLink, FileText, CheckCircle, XCircle, BarChart2 } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export default async function FormsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Innhentingsskjemaer</h1>
            <p className="text-slate-500 text-sm mt-0.5">Opprett skjemaer for a fange leads fra nettsiden din</p>
          </div>
          <Link href="/dashboard/forms/new"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />Nytt skjema
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-12 flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <FileText className="h-7 w-7 text-blue-600" />
          </div>
          <h3 className="font-semibold text-slate-800 mb-2">Ingen skjemaer enna</h3>
          <p className="text-slate-500 text-sm mb-4 max-w-xs">Opprett ditt forste innhentingsskjema og del lenken pa nettsiden din</p>
          <Link href="/dashboard/forms/new"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
            Opprett skjema
          </Link>
        </div>
      </div>
    );
  }

  const companyId = (session.user as any).companyId;
  const supabase = createAdminClient();

  const { data: forms } = await supabase
    .from('forms')
    .select('*, questions(count)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  const { checkLimit } = await import('@/lib/subscription');
  const limitStatus = await checkLimit(companyId, 'forms');
  const atLimit = !limitStatus.canCreate;
  const total = forms?.length ?? 0;
  const active = forms?.filter((f: any) => f.is_active).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Innhentingsskjemaer</h1>
          <p className="text-slate-500 text-sm mt-0.5">{limitStatus.current}/{limitStatus.limit === Infinity ? 'ubegrenset' : limitStatus.limit} skjemaer brukt</p>
        </div>
        <Link
          href={atLimit ? '/dashboard/billing' : '/dashboard/forms/new'}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors ${atLimit ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          <Plus className="h-4 w-4" />
          {atLimit ? 'Oppgrader plan' : 'Nytt skjema'}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Totale skjemaer', val: total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Aktive', val: active, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Inaktive', val: total - active, icon: XCircle, color: 'text-slate-500', bg: 'bg-slate-100' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className={`h-8 w-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="text-xl font-bold text-slate-900">{s.val}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {!forms || forms.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <FileText className="h-7 w-7 text-blue-600" />
          </div>
          <h3 className="font-semibold text-slate-800 mb-2">Ingen skjemaer enna</h3>
          <p className="text-slate-500 text-sm mb-4 max-w-xs">Opprett ditt forste innhentingsskjema for a begynne a fange leads</p>
          <Link href="/dashboard/forms/new"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
            Opprett skjema
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form: any) => (
            <div key={form.id} className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${form.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {form.is_active ? 'Aktiv' : 'Inaktiv'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-slate-800">{form.name}</p>
                {form.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{form.description}</p>}
              </div>
              <div className="flex gap-2 mt-auto">
                <Link href={`/dashboard/forms/${form.id}`}
                  className="flex-1 text-center rounded-lg border border-slate-200 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                  Rediger
                </Link>
                <a href={`/forms/${(session.user as any).companySlug ?? 'firma'}/${form.slug}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                  <ExternalLink className="h-3.5 w-3.5" />Del
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
