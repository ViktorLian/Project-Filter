export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const publicCompanyId = searchParams.get('company');
  const session = await getServerSession(authOptions as any) as any;
  const companyId = session?.user?.companyId || publicCompanyId;
  if (!companyId) return NextResponse.json({ error: 'Bedrift mangler' }, { status: 400 });
  let query = createAdminClient().from('feedback_surveys')
    .select('id,testimonial_display_text,testimonial_approved,question_1_rating,completed_at,customer:customers(name),job:jobs(job_title)')
    .eq('company_id', companyId).not('testimonial_display_text', 'is', null).order('completed_at', { ascending: false }).limit(20);
  if (!session?.user) query = query.eq('testimonial_approved', true);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ testimonials: (data || []).map((t:any) => ({
    id:t.id, rating:t.question_1_rating, text:t.testimonial_display_text,
    approved:t.testimonial_approved, customerName:t.customer?.name || 'Anonym',
    jobTitle:t.job?.job_title, completedAt:t.completed_at,
  })) });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions as any) as any;
  if (!session?.user) return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });
  const { surveyId, approved } = await request.json();
  if (!surveyId || typeof approved !== 'boolean') return NextResponse.json({ error: 'Ugyldig forespørsel' }, { status: 400 });
  const { error } = await createAdminClient().from('feedback_surveys')
    .update({ testimonial_approved: approved }).eq('id', surveyId).eq('company_id', session.user.companyId);
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ success: true });
}
