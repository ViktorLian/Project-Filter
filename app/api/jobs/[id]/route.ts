export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions as any);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sessAny = session as any;
  const companyId = sessAny?.user?.companyId || sessAny?.user?.id;
  const supabase = createAdminClient();

  const body = await req.json();
  const updates: Record<string, any> = {};

  if (body.status !== undefined) updates.status = body.status;
  if (body.revenue !== undefined) updates.revenue = body.revenue;
  if (body.notes !== undefined) updates.notes = body.notes;
  if (body.job_title !== undefined) updates.job_title = body.job_title;
  if (body.job_date !== undefined) updates.job_date = body.job_date;

  // Track when job was completed → for review email cron
  if (body.status === 'completed') {
    updates.completed_at = new Date().toISOString();
    updates.review_email_sent = false; // reset so cron picks it up
  }

  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', params.id)
    .eq('company_id', companyId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, job: data });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions as any);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sessAny = session as any;
  const companyId = sessAny?.user?.companyId || sessAny?.user?.id;
  const supabase = createAdminClient();

  await supabase.from('jobs').delete().eq('id', params.id).eq('company_id', companyId);
  return NextResponse.json({ success: true });
}
