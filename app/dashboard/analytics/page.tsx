import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const companyId = (session.user as any).companyId;
  const supabase = createAdminClient();

  const { data: leads } = await supabase
    .from('leads')
    .select('id, status, created_at')
    .eq('company_id', companyId);

  const scores: any[] = [];

  const totalLeads = leads?.length || 0;
  const accepted = leads?.filter((l) => l.status === 'ACCEPTED').length || 0;
  const rejected = leads?.filter((l) => l.status === 'REJECTED').length || 0;
  const acceptanceRate = totalLeads ? Math.round((accepted / totalLeads) * 100) : 0;
  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s.totalScore, 0) / scores.length)
      : 0;
  const totalRevenue = 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Track performance metrics and lead quality
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalLeads}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Acceptance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {acceptanceRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {accepted} accepted / {rejected} rejected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgScore}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue Potential
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lead Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {['NEW', 'REVIEWED', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'ARCHIVED'].map(
              (status) => {
                const count = leads?.filter((l) => l.status === status).length || 0;
                const percentage = totalLeads
                  ? Math.round((count / totalLeads) * 100)
                  : 0;
                return (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{status}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              📊 You&apos;ve collected <strong>{totalLeads}</strong> project
              inquiries
            </p>
            <p className="text-muted-foreground">
              ✅ <strong>{acceptanceRate}%</strong> acceptance rate shows{' '}
              {acceptanceRate > 50 ? 'strong' : 'good'} lead quality
            </p>
            <p className="text-muted-foreground">
              ⭐ Average qualification score: <strong>{avgScore}</strong>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
