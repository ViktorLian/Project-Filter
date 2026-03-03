import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// GET — return current webhook config for the company
export async function GET() {
  try {
    const session = await getServerSession(authOptions as any) as any;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const companyId = (session.user as any).companyId;
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('leads_companies')
      .select('webhook_url, webhook_secret, webhook_enabled')
      .eq('id', companyId)
      .single();

    return NextResponse.json({
      webhook_url: data?.webhook_url ?? '',
      webhook_secret: data?.webhook_secret ?? '',
      webhook_enabled: data?.webhook_enabled ?? false,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH — save webhook config
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const companyId = (session.user as any).companyId;
    const { webhook_url, webhook_secret, webhook_enabled } = await req.json();

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('leads_companies')
      .update({ webhook_url, webhook_secret, webhook_enabled })
      .eq('id', companyId);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST — manual test-fire
export async function POST() {
  try {
    const session = await getServerSession(authOptions as any) as any;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const companyId = (session.user as any).companyId;
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('leads_companies')
      .select('webhook_url, webhook_secret, webhook_enabled')
      .eq('id', companyId)
      .single();

    if (!data?.webhook_enabled || !data?.webhook_url) {
      return NextResponse.json({ error: 'Webhook not configured or disabled' }, { status: 400 });
    }

    const testPayload = {
      event: 'lead.created',
      test: true,
      lead: {
        id: 'test-lead-id',
        customer_name: 'Test Kunde',
        customer_email: 'test@example.com',
        customer_phone: '+47 900 00 000',
        score: 78,
        status: 'new',
        created_at: new Date().toISOString(),
      },
    };

    const res = await fetch(data.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(data.webhook_secret ? { 'X-Lead-Secret': data.webhook_secret } : {}),
      },
      body: JSON.stringify(testPayload),
    });

    return NextResponse.json({ ok: true, status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Failed to send test webhook' }, { status: 500 });
  }
}
