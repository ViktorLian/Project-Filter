export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/feedback-surveys/[token] — load survey for public survey page
export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('feedback_surveys')
    .select('*, job:jobs(job_title), customer:customers(name)')
    .eq('survey_token', params.token)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Undersøkelse ikke funnet' }, { status: 404 });
  if ((data as any).completed_at) return NextResponse.json({ alreadyCompleted: true });

  return NextResponse.json({ survey: data });
}

// POST /api/feedback-surveys/[token] — submit answers
export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { rating, wentWell, improvements, wouldRecommend, additionalComments } = body;

  if (!rating) return NextResponse.json({ error: 'Vurdering er påkrevd' }, { status: 400 });

  const npsScore = rating >= 9 ? 1 : rating >= 7 ? 0 : -1;
  const isPositive = rating >= 8;
  const testimonialText = isPositive
    ? (wentWell || additionalComments || '')
    : null;

  const { error } = await supabase
    .from('feedback_surveys')
    .update({
      question_1_rating: rating,
      question_2_text: wentWell,
      question_3_text: improvements,
      question_4_text: wouldRecommend,
      question_5_text: additionalComments,
      nps_score: npsScore,
      testimonial_display_text: testimonialText,
      testimonial_approved: false, // admin must approve
      completed_at: new Date().toISOString(),
    })
    .eq('survey_token', params.token);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, eligible_for_testimonial: isPositive });
}
