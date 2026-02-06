import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  req: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;
    const supabase = createAdminClient();

    const { data: form } = await supabase
      .from('forms')
      .select('*, questions(*)')
      .eq('id', params.formId)
      .eq('company_id', companyId)
      .single();

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (e) {
    console.error('[GET FORM ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;
    const body = await req.json();
    const { scoring_criteria } = body;

    const supabase = createAdminClient();

    // Update form
    const { error } = await supabase
      .from('forms')
      .update({ scoring_criteria })
      .eq('id', params.formId)
      .eq('company_id', companyId);

    if (error) {
      console.error('[UPDATE FORM ERROR]', error);
      throw new Error('Failed to update form');
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('[FORM UPDATE ERROR]', e);
    return NextResponse.json(
      { error: e.message || 'Server error' },
      { status: 500 }
    );
  }
}

