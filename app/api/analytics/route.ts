export const dynamic = 'force-dynamic';

import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const searchParams = (request as any).nextUrl?.searchParams;
    const userId = searchParams?.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Get today's analytics
    const today = new Date().toISOString().split('T')[0];
    const { data: analytics, error } = await supabaseAdmin
      .from('lead_analytics')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // If no data, return defaults
    const result = analytics || {
      total_leads: 0,
      high_quality_leads: 0,
      avg_score: 0,
      conversion_count: 0,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('[ANALYTICS ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
