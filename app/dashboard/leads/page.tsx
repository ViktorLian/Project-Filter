import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LeadTable from '@/components/leads/LeadTable';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function LeadsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const companyId = (session.user as any).companyId;
  const supabase = createAdminClient();

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground">
          View and manage all project inquiries
        </p>
      </div>

      <LeadTable leads={leads || []} />
    </div>
  );
}
