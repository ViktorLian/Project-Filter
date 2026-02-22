export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/testimonials — public or admin fetch
// ?approved=true → only approved (for widget embed)
// ?all=true + auth → all pending/approved for admin
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const approvedOnly = searchParams.get('approved') === 'true';

  let query = supabase
    .from('feedback_surveys')
    .select('id, testimonial_display_text, testimonial_approved, question_1_rating, customer:customers(name), job:jobs(job_title)')
    .not('testimonial_display_text', 'is', null)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(20);

  if (approvedOnly) {
    query = query.eq('testimonial_approved', true);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const testimonials = (data || []).map((t: any) => ({
    id: t.id,
    rating: t.question_1_rating,
    text: t.testimonial_display_text,
    approved: t.testimonial_approved,
    customerName: t.customer?.name || 'Anonym',
    jobTitle: t.job?.job_title,
  }));

  return NextResponse.json({ testimonials });
}

// PATCH /api/testimonials — approve or reject a testimonial
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions as any);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();

  const { surveyId, approved } = await request.json();
  const { error } = await supabase
    .from('feedback_surveys')
    .update({ testimonial_approved: approved })
    .eq('id', surveyId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
