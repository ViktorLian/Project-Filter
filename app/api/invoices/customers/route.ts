import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

type CustomerInput = {
  name: string;
  email?: string;
  address?: string;
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;
    const body: CustomerInput = await req.json();

    if (!body.name) {
      return NextResponse.json(
        { error: 'Customer name is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('invoice_customers')
      .insert({
        company_id: companyId,
        name: body.name,
        email: body.email || null,
        address: body.address || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[CUSTOMER POST ERROR]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, customer: data });
  } catch (e) {
    console.error('[CUSTOMER POST ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('invoice_customers')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[CUSTOMER GET ERROR]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ customers: data || [] });
  } catch (e) {
    console.error('[CUSTOMER GET ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
