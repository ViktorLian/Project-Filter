import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

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

    // Check if email already exists
    const { data: authUser } = await supabase.auth.admin.listUsers();
    const emailExists = authUser?.users?.some(u => u.email === email);
    if (emailExists) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth
    const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name,
        business_name: companyName,
      },
    });

    if (createUserError || !createdUser?.user) {
      console.error('[AUTH CREATE ERROR]', createUserError);
      return NextResponse.json(
        { error: 'Failed to create user: ' + (createUserError?.message || 'Unknown error') },
        { status: 400 }
      );
    }

    // Create user in public.users table
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        auth_user_id: createdUser.user.id,
        email,
        business_name: companyName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (userError || !newUser) {
      console.error('[USER CREATE ERROR]', userError);
      // Delete auth user if database insert fails
      await supabase.auth.admin.deleteUser(createdUser.user.id);
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    // Create default user_settings
    const { error: settingsError } = await supabase
      .from('user_settings')
      .insert({
        user_id: newUser.id,
        alert_email: email,
        auto_reply_template: 'template_1',
        score_threshold: 80,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (settingsError) {
      console.error('[SETTINGS CREATE ERROR]', settingsError);
      // Continue anyway - settings can be created later
    }

    return NextResponse.json({ 
      success: true,
      message: 'Account created successfully'
    });
  } catch (e) {
    console.error('[REGISTER ERROR]', e);
    return NextResponse.json(
      { error: 'Server error: ' + (e instanceof Error ? e.message : 'Unknown') },
      { status: 500 }
    );
  }
}
