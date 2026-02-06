import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ScoringCriteriaForm from '@/components/forms/ScoringCriteriaForm';

export default async function FormScoringPage({
  params,
}: {
  params: { formId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const companyId = (session.user as any).companyId;
  const supabase = createAdminClient();

  // Get form with questions and scoring criteria
  const { data: form } = await supabase
    .from('forms')
    .select('*, questions(*)')
    .eq('id', params.formId)
    .eq('company_id', companyId)
    .single();

  if (!form) {
    return <div>Form not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href={`/dashboard/forms/${form.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbake til form
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Scoring-kriterier</h1>
        <p className="text-muted-foreground mt-1">
          Sett opp hvordan leads skal scores basert på svarene deres
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hvordan fungerer scoring?</CardTitle>
          <CardDescription>
            Hvert spørsmål kan gi poeng basert på svaret. Leads får en total score fra 0-100.
            <br />
            <span className="text-green-600 font-medium">70-100: God match (grønn)</span> ·{' '}
            <span className="text-orange-600 font-medium">40-69: Middels (oransje)</span> ·{' '}
            <span className="text-red-600 font-medium">0-39: Dårlig match (rød)</span>
          </CardDescription>
        </CardHeader>
      </Card>

      <ScoringCriteriaForm form={form} />
    </div>
  );
}
