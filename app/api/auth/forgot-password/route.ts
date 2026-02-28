import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'E-post er påkrevd' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://flowpilot.no';

    // Check if user exists in public.users
    const { data: publicUser } = await supabase
      .from('users')
      .select('id, auth_user_id')
      .eq('email', email)
      .maybeSingle();

    if (!publicUser) {
      // Don't reveal whether the email exists — silently succeed
      return NextResponse.json({ ok: true });
    }

    // If user has no Supabase Auth account yet (old webhook-created users),
    // we need to create one first so they can reset their password.
    if (!publicUser.auth_user_id) {
      // Create a Supabase Auth user (unconfirmed, no password — they'll set it via reset)
      const { data: authData, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        // No password — user must reset
      });

      if (!createError && authData?.user) {
        // Link the auth user to the public user record
        await supabase
          .from('users')
          .update({ auth_user_id: authData.user.id })
          .eq('id', publicUser.id);
      }
    }

    // Send password reset email via Supabase Auth
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/reset-password`,
    });

    if (error) {
      console.error('Supabase resetPasswordForEmail error:', error);
      // Still return success to avoid revealing which emails are registered
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('forgot-password error:', err);
    return NextResponse.json({ error: 'Intern serverfeil' }, { status: 500 });
  }
}
