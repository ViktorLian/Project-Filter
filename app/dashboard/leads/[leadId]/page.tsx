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

export default async function LeadDetailPage({
  params,
}: {
  params: { leadId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const companyId = (session.user as any).companyId;
  const supabase = createAdminClient();

  const { data: lead } = await supabase
    .from('leads')
    .select('*, notes(*)')
    .eq('id', params.leadId)
    .eq('company_id', companyId)
    .single();

  if (!lead) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/dashboard/leads">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Link>
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {lead.customerName || 'Lead Details'}
            </h1>
            <p className="text-muted-foreground">{lead.customerEmail}</p>
          </div>
          <LeadActions leadId={lead.id} currentStatus={lead.status} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadStatusBadge status={lead.status} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Score</CardTitle>
          </CardHeader>
          <CardContent>
            {lead.score ? (
              <LeadScoreBadge
                riskLevel={lead.score.riskLevel}
                score={lead.score.totalScore}
              />
            ) : (
              <span className="text-sm text-muted-foreground">Not scored</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Submitted On
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {new Date(lead.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {lead.score && (
        <Card>
          <CardHeader>
            <CardTitle>Scoring Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Total Score
              </span>
              <span className="font-medium">{lead.score.totalScore}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Profitability
              </span>
              <span className="font-medium">
                {lead.score.profitabilityScore}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Suggested Action
              </span>
              <span className="font-medium">{lead.score.suggestedAction}</span>
            </div>
            {lead.score.highValue && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-2 rounded mt-2">
                ⭐ High-value lead
              </div>
            )}
            {lead.score.autoRejected && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-2 rounded mt-2">
                🚫 Auto-rejected based on criteria
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="font-medium">
              {lead.customerName || 'Not provided'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="font-medium">
              {lead.customerEmail || 'Not provided'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Phone</span>
            <span className="font-medium">
              {lead.customerPhone || 'Not provided'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lead.form.questions.map((question: any) => {
              const answer = lead.answers.find(
                (a: any) => a.questionId === question.id
              );
              return (
                <div key={question.id} className="border-b pb-3 last:border-0">
                  <div className="font-medium text-sm mb-1">
                    {question.label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {answer?.value || 'No answer'}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <LeadNotes leadId={lead.id} notes={lead.notes} />
    </div>
  );
}
