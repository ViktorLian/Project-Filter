import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import LeadActions from '@/components/leads/LeadActions';
import LeadNotes from '@/components/leads/LeadNotes';
import { ArrowLeft, Mail, Phone, Calendar, Star, FileText, Hash } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LeadDetailPage({ params }: { params: { leadId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const companyId = (session.user as any).companyId;
  const supabase = createAdminClient();

  const { data: lead } = await supabase
    .from('leads')
    .select('*, form:leads_forms(id, name)')
    .eq('id', params.leadId)
    .eq('company_id', companyId)
    .single();

  if (!lead) notFound();

  const { data: notes } = await supabase
    .from('leads_notes')
    .select('*')
    .eq('lead_id', params.leadId)
    .order('created_at', { ascending: false });

  const score = typeof lead.score === 'number' ? lead.score : null;
  const scoreColor =
    score === null ? 'text-slate-400' :
    score >= 80 ? 'text-emerald-600' :
    score >= 50 ? 'text-yellow-600' : 'text-red-600';

  const statusLabels: Record<string, string> = {
    new: 'Ny', NEW: 'Ny', accepted: 'Akseptert', ACCEPTED: 'Akseptert',
    rejected: 'Avvist', REJECTED: 'Avvist', pending: 'Venter', PENDING: 'Venter',
    contacted: 'Kontaktet', CONTACTED: 'Kontaktet',
  };
  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700', NEW: 'bg-blue-100 text-blue-700',
    accepted: 'bg-emerald-100 text-emerald-700', ACCEPTED: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700', REJECTED: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700', PENDING: 'bg-yellow-100 text-yellow-700',
    contacted: 'bg-purple-100 text-purple-700', CONTACTED: 'bg-purple-100 text-purple-700',
  };

  const answers = Array.isArray(lead.answers) ? lead.answers : [];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <Link href="/dashboard/leads" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition mb-4">
          <ArrowLeft className="h-4 w-4" /> Tilbake til leads
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {(lead.customer_name || 'L').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {lead.customer_name || 'Ukjent lead'}
              </h1>
              <p className="text-slate-500 text-sm">
                {lead.customer_email || 'Ingen e-post'} {lead.customer_phone ? `· ${lead.customer_phone}` : ''}
              </p>
            </div>
          </div>
          <LeadActions leadId={lead.id} currentStatus={lead.status || 'NEW'} />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Status', value: statusLabels[lead.status || 'new'] || lead.status || 'Ny', color: statusColors[lead.status || 'new'] || 'bg-blue-100 text-blue-700', icon: FileText },
          { label: 'Score', value: score !== null ? `${score}%` : '–', color: 'bg-slate-100 text-slate-700', icon: Star, extraClass: scoreColor },
          { label: 'Skjema', value: (lead as any).form?.name || '–', color: 'bg-slate-100 text-slate-700', icon: Hash },
          { label: 'Registrert', value: new Date(lead.created_at).toLocaleDateString('nb-NO'), color: 'bg-slate-100 text-slate-700', icon: Calendar },
        ].map(({ label, value, color, icon: Icon, extraClass }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-7 w-7 rounded-lg ${color.split(' ')[0]} flex items-center justify-center`}>
                <Icon className={`h-3.5 w-3.5 ${color.split(' ')[1]}`} />
              </div>
              <span className="text-xs text-slate-500 font-medium">{label}</span>
            </div>
            <p className={`text-base font-bold truncate ${extraClass || 'text-slate-900'}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact info */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Kontaktinformasjon</h2>
          <div className="space-y-3">
            {[
              { icon: Mail, label: 'E-post', value: lead.customer_email, href: lead.customer_email ? `mailto:${lead.customer_email}` : undefined },
              { icon: Phone, label: 'Telefon', value: lead.customer_phone, href: lead.customer_phone ? `tel:${lead.customer_phone}` : undefined },
              { icon: Calendar, label: 'Mottatt', value: new Date(lead.created_at).toLocaleString('nb-NO') },
            ].map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{label}</p>
                  {href ? (
                    <a href={href} className="text-sm font-medium text-blue-600 hover:underline">{value || '–'}</a>
                  ) : (
                    <p className="text-sm font-medium text-slate-800">{value || '–'}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Svar fra skjema */}
        {answers.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-800 mb-4">Svar fra skjema</h2>
            <div className="space-y-3">
              {answers.map((ans: any, i: number) => (
                <div key={i} className="border-b border-slate-100 last:border-0 pb-2 last:pb-0">
                  <p className="text-xs text-slate-500 mb-0.5">{ans.questionId || `Spørsmål ${i + 1}`}</p>
                  <p className="text-sm font-medium text-slate-800">{ans.value || '–'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <LeadNotes leadId={lead.id} notes={notes || []} />
    </div>
  );
}
