import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, name, email, password } = body;

    if (!companyName || !name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if user exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    // Generate unique slug
    const slugBase = slugify(companyName, { lower: true, strict: true });
    let slug = slugBase;
    let i = 1;
    while (true) {
      const { data } = await supabase
        .from('leads_companies')
        .select('id')
        .eq('slug', slug)
        .single();
      if (!data) break;
      slug = `${slugBase}-${i++}`;
    }

    const hashed = await bcrypt.hash(password, 10);

    // Create company
    const { data: company, error: companyError } = await supabase
      .from('leads_companies')
      .insert({ name: companyName, slug })
      .select()
      .single();

    if (companyError || !company) {
      throw new Error('Failed to create company');
    }

    // Create user
    const { error: userError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password: hashed,
        role: 'OWNER',
        company_id: company.id,
      });

    if (userError) {
      throw new Error('Failed to create user');
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[REGISTER ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
