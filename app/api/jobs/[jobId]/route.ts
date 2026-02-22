export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(_req: NextRequest, { params }: { params: { jobId: string } }) {
  const session = await getServerSession(authOptions as any);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();
  const { jobId } = params;

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();
  if (jobError || !job) return NextResponse.json({ error: 'Jobb ikke funnet' }, { status: 404 });

  const { data: expenses } = await supabase
    .from('job_expenses')
    .select('*')
    .eq('job_id', jobId);

  const totalExpenses = (expenses || []).reduce((s: number, e: any) => s + (e.amount || 0), 0);
  const revenue = job.revenue || 0;
  const profit = revenue - totalExpenses;
  const marginPct = revenue > 0 ? +((profit / revenue) * 100).toFixed(1) : 0;

  return NextResponse.json({
    job,
    expenses: expenses || [],
    revenue,
    totalExpenses,
    profit,
    marginPct,
    status: marginPct > 50 ? 'god' : marginPct > 30 ? 'akseptabel' : 'lav',
  });
}

export async function PATCH(request: NextRequest, { params }: { params: { jobId: string } }) {
  const session = await getServerSession(authOptions as any);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('jobs')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', params.jobId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ job: data });
}

// POST /api/jobs/[jobId] - Add expense
export async function POST(request: NextRequest, { params }: { params: { jobId: string } }) {
  const session = await getServerSession(authOptions as any);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();
  const body = await request.json();
  const { category, amount, description, receiptUrl } = body;

  const { data, error } = await supabase
    .from('job_expenses')
    .insert({
      job_id: params.jobId,
      category: category || 'Annet',
      amount: amount || 0,
      description,
      receipt_url: receiptUrl || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ expense: data });
}
