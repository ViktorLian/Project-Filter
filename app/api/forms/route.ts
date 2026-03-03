export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import slugify from 'slugify';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = (session.user as any).companyId || (session.user as any).id;
    const supabase = createAdminClient();

    const { data: forms } = await supabase
      .from('forms')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    return NextResponse.json(forms || []);
  } catch (e) {
    console.error('[GET FORMS ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = (session.user as any).companyId || (session.user as any).id;
    
    // Check form limit (gracefully skip if subscription tables don't exist yet)
    try {
      const { checkLimit } = await import('@/lib/subscription');
      const limitCheck = await checkLimit(companyId, 'forms');
      if (!limitCheck.canCreate) {
        return NextResponse.json(
          { error: `Skjemagrense nådd (${limitCheck.limit}). Oppgrader planen din for å opprette flere skjemaer.` },
          { status: 403 }
        );
      }
    } catch (_limitErr) {
      // Subscription check failed (table might not exist yet) – allow creation
      console.warn('[FORMS LIMIT CHECK SKIPPED]', _limitErr);
    }
    
    const body = await req.json();
    const { name, description, questions, score_threshold } = body;

    if (!name || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'Name and questions are required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Generate unique slug
    const slugBase = slugify(name, { lower: true, strict: true });
    let slug = slugBase;
    let i = 1;
    while (true) {
      const { data } = await supabase
        .from('forms')
        .select('id')
        .eq('company_id', companyId)
        .eq('slug', slug)
        .single();
      if (!data) break;
      slug = `${slugBase}-${i++}`;
    }

    // Create form
    const { data: form, error: formError } = await supabase
      .from('forms')
      .insert({
        company_id: companyId,
        name,
        description,
        slug,
        is_active: true,
        score_threshold: score_threshold ?? 80,
      })
      .select()
      .single();

    if (formError || !form) {
      console.error('[FORM CREATE ERROR]', formError);
      throw new Error('Failed to create form');
    }

    // Create questions — include points and option_points for real scoring
    const questionData = questions.map((q: any, index: number) => ({
      form_id: form.id,
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options && q.options.length > 0 ? q.options : null,
      option_points: q.option_points && Object.keys(q.option_points).length > 0 ? q.option_points : null,
      points: q.points ?? 0,
      required: q.required || false,
      order_index: index,
    }));

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionData);

    if (questionsError) {
      console.error('[QUESTIONS CREATE ERROR]', questionsError);
      // Rollback form creation
      await supabase.from('forms').delete().eq('id', form.id);
      throw new Error('Failed to create questions');
    }

    return NextResponse.json(form);
  } catch (e: any) {
    console.error('[CREATE FORM ERROR]', e);
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
