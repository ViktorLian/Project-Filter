import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions as any) as any;
  const companyId = (session?.user as any)?.companyId;
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const [
    invoicesResult,
    leadsResult,
    customersResult,
    staleCustomersResult,
  ] = await Promise.all([
    // Revenue from paid invoices last 90 days
    supabase
      .from('invoices')
      .select('amount, created_at, customer_name')
      .eq('company_id', companyId)
      .eq('status', 'paid')
      .gte('created_at', ninetyDaysAgo.toISOString()),

    // Leads last 30 days
    supabase
      .from('leads')
      .select('id, score, created_at, customer_name, customer_email')
      .eq('company_id', companyId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false }),

    // All paying customers (have at least one paid invoice)
    supabase
      .from('invoices')
      .select('customer_name, customer_email, amount, created_at')
      .eq('company_id', companyId)
      .eq('status', 'paid')
      .order('created_at', { ascending: false }),

    // Customers with no activity in 60+ days (for reactivation)
    supabase
      .from('leads')
      .select('id, customer_name, customer_email, customer_phone, score, created_at')
      .eq('company_id', companyId)
      .lt('created_at', new Date(Date.now() - 60 * 86400000).toISOString())
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const invoices = invoicesResult.data ?? [];
  const leads = leadsResult.data ?? [];
  const customers = customersResult.data ?? [];
  const staleLeads = staleCustomersResult.data ?? [];

  // Monthly revenue breakdown (last 3 months)
  const monthlyRevenue: Record<string, number> = {};
  for (const inv of invoices) {
    const month = inv.created_at.substring(0, 7); // YYYY-MM
    monthlyRevenue[month] = (monthlyRevenue[month] ?? 0) + (inv.amount ?? 0);
  }

  const totalRevenue90d = (invoices as any[]).reduce((s: number, i: any) => s + (i.amount ?? 0), 0);
  const avgDeal = customers.length > 0
    ? (customers as any[]).reduce((s: number, c: any) => s + (c.amount ?? 0), 0) / customers.length
    : 0;

  // Unique paying customers
  const uniqueCustomers = [...new Set((customers as any[]).map((c: any) => c.customer_email).filter(Boolean))];

  return NextResponse.json({
    totalRevenue90d,
    avgDeal,
    uniqueCustomerCount: uniqueCustomers.length,
    newLeads30d: leads.length,
    highQualityLeads: (leads as any[]).filter((l: any) => (l.score ?? 0) >= 70).length,
    monthlyRevenue,
    reactivationList: staleLeads.slice(0, 15),
  });
}
