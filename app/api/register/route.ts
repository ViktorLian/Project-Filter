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

    // Check if user exists in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers({ email });
    if (authUser && authUser.users && authUser.users.length > 0) {
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
      console.error('[COMPANY CREATE ERROR]', companyError);
      throw new Error('Failed to create company: ' + (companyError?.message || 'Unknown'));
    }

    // Create user in Supabase Auth
    const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name,
        company_id: company.id,
        role: 'OWNER',
      },
    });
    if (createUserError || !createdUser) {
      throw new Error('Failed to create user in Auth');
    }

    // Create user in users-tabell for ekstra data
    const { error: userError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password: hashed,
        role: 'OWNER',
        company_id: company.id,
        auth_id: createdUser.user?.id || null,
      });

    if (userError) {
      throw new Error('Failed to create user in users-tabell');
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[REGISTER ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
