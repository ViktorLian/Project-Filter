export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions as any) as any;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();
  const sessAny = session as any;
  const userId = sessAny?.user?.id;
  const companyId = sessAny?.user?.companyId || userId;

  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId');

  let query = supabase
    .from('jobs')
    .select('*, customer:customers(name, email), expenses:job_expenses(amount)')
    .or(`user_id.eq.${userId},company_id.eq.${companyId}`)
    .order('job_date', { ascending: false });

  if (customerId) query = query.eq('customer_id', customerId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Compute margin on read
  const jobs = (data || []).map((job: any) => {
    const totalExpenses = (job.expenses || []).reduce((s: number, e: any) => s + (e.amount || 0), 0);
    const revenue = job.revenue || 0;
    const profit = revenue - totalExpenses;
    const marginPct = revenue > 0 ? +((profit / revenue) * 100).toFixed(1) : 0;
    return { ...job, totalExpenses, profit, marginPct };
  });

  return NextResponse.json({ jobs });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions as any) as any;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();
  const sessAny = session as any;
  const userId = sessAny?.user?.id;
  const companyId = sessAny?.user?.companyId || userId;

  const body = await request.json();
  const { customerId, jobTitle, jobDate, revenue, notes } = body;

  if (!jobTitle) return NextResponse.json({ error: 'jobTitle er påkrevd' }, { status: 400 });

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      user_id: userId,
      company_id: companyId,
      customer_id: customerId || null,
      job_title: jobTitle,
      job_date: jobDate || new Date().toISOString().split('T')[0],
      revenue: revenue || 0,
      notes,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    console.error('[JOBS POST ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ job: data });
}
