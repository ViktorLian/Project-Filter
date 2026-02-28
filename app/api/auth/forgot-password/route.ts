import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getAppUrl(): string {
  // In Vercel production, VERCEL_URL is set to the deployment URL (no https prefix)
  // NEXT_PUBLIC_APP_URL may still be pointing to localhost from dev .env
  const configured = process.env.NEXT_PUBLIC_APP_URL ?? '';
  if (configured && !configured.includes('localhost') && !configured.includes('127.0.0.1')) {
    return configured.replace(/\/$/, '');
  }
  // Fall back to Vercel's auto URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Hard-coded production fallback
  return 'https://flowpilot.no';
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'E-post er påkrevd' }, { status: 400 });
    }

    const appUrl = getAppUrl();
    console.log('[forgot-password] appUrl:', appUrl, '| email:', email);

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
    // create one first so they can reset their password.
    if (!publicUser.auth_user_id) {
      const { data: authData, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
      });

      if (createError) {
        console.error('[forgot-password] createUser error:', createError);
      } else if (authData?.user) {
        await supabase
          .from('users')
          .update({ auth_user_id: authData.user.id })
          .eq('id', publicUser.id);
        console.log('[forgot-password] created auth user for:', email);
      }
    }

    // Send password reset email via Supabase Auth
    const redirectTo = `${appUrl}/reset-password`;
    console.log('[forgot-password] redirectTo:', redirectTo);

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      console.error('[forgot-password] resetPasswordForEmail error:', error.message, error);
      return NextResponse.json({ error: 'Kunne ikke sende e-post. Prøv igjen.' }, { status: 500 });
    }

    console.log('[forgot-password] reset email sent to:', email);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('forgot-password error:', err);
    return NextResponse.json({ error: 'Intern serverfeil' }, { status: 500 });
  }
}

