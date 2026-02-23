export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendTrialWelcomeEmail } from '@/lib/email';

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

    // Create user in Supabase Auth first (avoid slow listUsers call)
    const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name,
        business_name: companyName,
      },
    });

    if (createUserError || !createdUser?.user) {
      // Handle "email already in use" specifically
      const msg = createUserError?.message ?? '';
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('duplicate')) {
        return NextResponse.json({ error: 'E-postadressen er allerede i bruk.' }, { status: 400 });
      }
      console.error('[AUTH CREATE ERROR]', createUserError);
      return NextResponse.json(
        { error: 'Klarte ikke opprette konto: ' + (msg || 'Ukjent feil') },
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

    // Create company with 14-day free trial using SAME id as user profile
    // so that companyId = user.id works throughout the app
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data: company, error: companyError } = await supabase
      .from('leads_companies')
      .insert({
        id: newUser.id,          // ← same as user profile id – this is the companyId
        user_id: newUser.id,
        name: companyName,
        subscription_status: 'trialing',
        subscription_plan: 'starter',
        trial_ends_at: trialEndsAt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (companyError) {
      console.error('[COMPANY CREATE ERROR]', companyError);
      // Continue - company can be created later
    }

    // Send welcome/trial email (non-blocking)
    sendTrialWelcomeEmail(email, name, companyName).catch(e =>
      console.error('[WELCOME EMAIL ERROR]', e)
    );

    return NextResponse.json({ 
      success: true,
      message: 'Account created successfully',
      trialEndsAt,
    });
  } catch (e) {
    console.error('[REGISTER ERROR]', e);
    const msg = e instanceof Error ? e.message : 'Ukjent feil';
    if (msg.includes('admin credentials') || msg.includes('Supabase')) {
      return NextResponse.json({ error: 'Tjenesten er midlertidig utilgjengelig. Proev igjen om noen minutter eller kontakt Flowpilot@hotmail.com.' }, { status: 503 });
    }
    return NextResponse.json(
      { error: 'Noe gikk galt: ' + msg },
      { status: 500 }
    );
  }
}
