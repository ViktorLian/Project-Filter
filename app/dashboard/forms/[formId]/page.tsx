import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function FormDetailPage({
  params,
}: {
  params: { formId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const companyId = (session.user as any).companyId;
  const supabase = createAdminClient();

  // Get form with questions
  const { data: form } = await supabase
    .from('forms')
    .select('*, questions(*)')
    .eq('id', params.formId)
    .eq('company_id', companyId)
    .single();

  if (!form) {
    return <div>Form not found</div>;
  }

  // Get leads for this form
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('form_id', params.formId)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/dashboard/forms">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbake til Forms
          </Link>
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{form.name}</h1>
            {form.description && (
              <p className="text-muted-foreground mt-1">{form.description}</p>
            )}
          </div>
          <Button asChild variant="outline">
            <Link href={`/f/${form.slug}`} target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              Åpne skjema
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Statistikk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Totale leads</span>
              <span className="font-semibold">{leads?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Spørsmål</span>
              <span className="font-semibold">{form.questions?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={form.is_active ? 'default' : 'secondary'}>
                {form.is_active ? 'Aktiv' : 'Inaktiv'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Handlinger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href={`/dashboard/forms/${form.id}/scoring`}>
                Sett opp scoring
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/dashboard/forms/${form.id}/embed`}>
                Få embed-kode
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">
            Leads ({leads?.length || 0})
          </h2>
        </div>

        {!leads || leads.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Ingen leads ennå. Del skjemaet for å begynne å samle inn leads.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {leads.map((lead: any) => {
              const answers = lead.answers || {};
              const answersArray = Object.entries(answers);
              
              // Determine color based on score
              let colorClass = 'bg-red-100 text-red-700 border-red-300';
              let colorLabel = 'Dårlig match';
              if (lead.score >= 70) {
                colorClass = 'bg-green-100 text-green-700 border-green-300';
                colorLabel = 'God match';
              } else if (lead.score >= 40) {
                colorClass = 'bg-orange-100 text-orange-700 border-orange-300';
                colorLabel = 'Middels match';
              }

              return (
                <Card key={lead.id} className={`border-l-4 ${colorClass.split(' ')[2]}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {lead.name || lead.email || 'Ukjent'}
                        </CardTitle>
                        {lead.email && lead.name && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {lead.email}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(lead.created_at).toLocaleDateString('nb-NO', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={colorClass}>
                          {lead.score || 0} / 100
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {colorLabel}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {answersArray.map(([questionId, answer]) => {
                        const question = form.questions.find((q: any) => q.id === questionId);
                        return (
                          <div key={questionId} className="border-b pb-2 last:border-0">
                            <p className="text-sm font-medium text-muted-foreground">
                              {question?.label || questionId}
                            </p>
                            <p className="mt-1">{String(answer)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
