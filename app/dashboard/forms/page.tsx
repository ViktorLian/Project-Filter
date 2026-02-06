import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function FormsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const companyId = (session.user as any).companyId;
  const supabase = createAdminClient();

  const { data: forms } = await supabase
    .from('forms')
    .select('*, questions(count)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
    
  // Check form limits
  const { checkLimit } = await import('@/lib/subscription');
  const limitStatus = await checkLimit(companyId, 'forms');
  const atLimit = !limitStatus.canCreate;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Intake Forms</h1>
          <p className="text-muted-foreground">
            Create and manage your project qualification forms ({limitStatus.current}/{limitStatus.limit === Infinity ? '∞' : limitStatus.limit} used)
          </p>
        </div>
        <Button asChild disabled={atLimit}>
          <Link href={atLimit ? '/dashboard/billing' : '/dashboard/forms/new'}>
            <Plus className="h-4 w-4 mr-2" />
            {atLimit ? 'Upgrade to Create More' : 'New Form'}
          </Link>
        </Button>
      </div>

      {!forms || forms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              No forms yet. Create your first intake form to start collecting
              project inquiries.
            </p>
            <Button asChild>
              <Link href="/dashboard/forms/new">Create Form</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form: any) => (
            <Card key={form.id}>
              <CardHeader>
                <CardTitle className="text-lg">{form.name}</CardTitle>
                {form.description && (
                  <CardDescription className="line-clamp-2">
                    {form.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className={form.is_active ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                    {form.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/dashboard/forms/${form.id}`}>
                      View
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <a href={`/forms/${form.slug}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
