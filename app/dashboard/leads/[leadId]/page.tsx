import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LeadStatusBadge from '@/components/leads/LeadStatusBadge';
import LeadScoreBadge from '@/components/leads/LeadScoreBadge';
import { ArrowLeft } from 'lucide-react';
import LeadActions from '@/components/leads/LeadActions';
import LeadNotes from '@/components/leads/LeadNotes';
import { createAdminClient } from '@/lib/supabase/admin';

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
            {lead.form.questions.map((question) => {
              const answer = lead.answers.find(
                (a) => a.questionId === question.id
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
