import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function DashboardOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const companyId = (session.user as any).companyId;
  const supabase = createAdminClient();

  const [
    { count: totalLeads },
    { count: newLeads },
    { count: acceptedLeads },
    { count: rejectedLeads },
  ] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('company_id', companyId),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'NEW'),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'ACCEPTED'),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'REJECTED'),
  ]);

  const formCount = 0; // Forms not implemented yet

  const acceptanceRate =
    totalLeads && totalLeads > 0 ? Math.round(((acceptedLeads || 0) / totalLeads) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your project pipeline.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{newLeads || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {acceptedLeads || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Acceptance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptanceRate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Active Forms
              </span>
              <span className="font-medium">{formCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Rejected Leads
              </span>
              <span className="font-medium">{rejectedLeads || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {formCount === 0 && (
              <p className="text-muted-foreground">
                📝 Create your first intake form to start collecting leads
              </p>
            )}
            {formCount > 0 && (newLeads || 0) === 0 && (
              <p className="text-muted-foreground">
                📤 Share your form URL to start receiving project inquiries
              </p>
            )}
            {(newLeads || 0) > 0 && (
              <p className="text-emerald-600 font-medium">
                ✅ You&apos;re all set! New leads are coming in.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
