import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

function getAppUrl(req: Request): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL ?? '';
  if (configured && !configured.includes('localhost') && !configured.includes('127.0.0.1')) {
    return configured.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Dev: use the request's own host (works on any port - 3000, 3001, etc.)
  const host = req.headers.get('host') || 'localhost:3001';
  const protocol = host.startsWith('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'E-post er påkrevd' }, { status: 400 });
    }

    const appUrl = getAppUrl(req);
    console.log('[forgot-password] appUrl:', appUrl, '| email:', email);

    // 1. Check public.users table first
    const { data: publicUser } = await supabase
      .from('users')
      .select('id, auth_user_id')
      .eq('email', email)
      .maybeSingle();

    // 2. If not in public.users, fall back to checking Supabase Auth directly
    if (!publicUser) {
      const { data: authList } = await supabase.auth.admin.listUsers();
      const authUser = authList?.users?.find((u: { email?: string }) => u.email === email);
      if (!authUser) {
        // Email truly not registered — silently succeed (don't reveal this)
        console.log('[forgot-password] email not found anywhere:', email);
        return NextResponse.json({ ok: true });
      }
      // Found in auth but not in public.users — create the missing record
      console.log('[forgot-password] found in auth but not public.users, creating record for:', email);
      await supabase.from('users').insert({
        auth_user_id: authUser.id,
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } else if (!publicUser.auth_user_id) {
      // Public record exists but no auth account — create one
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

    // 3. Auto-confirm the user's email so the recovery link works
    try {
      const { data: authList2 } = await supabase.auth.admin.listUsers();
      const targetAuthUser = authList2?.users?.find((u: { email?: string }) => u.email === email);
      if (targetAuthUser && !targetAuthUser.email_confirmed_at) {
        await supabase.auth.admin.updateUserById(targetAuthUser.id, { email_confirm: true });
        console.log('[forgot-password] auto-confirmed email for:', email);
      }
    } catch (e) {
      console.warn('[forgot-password] could not auto-confirm:', e);
    }

    // Generate the recovery link via Supabase Admin (no email sent by Supabase)
    const redirectTo = `${appUrl}/reset-password`;
    console.log('[forgot-password] redirectTo:', redirectTo);

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error('[forgot-password] generateLink error:', linkError);
      return NextResponse.json({ error: 'Kunne ikke generere tilbakestillingslenke. Prøv igjen.' }, { status: 500 });
    }

    const resetLink = linkData.properties.action_link;
    console.log('[forgot-password] reset link generated, sending via Resend to:', email);

    // Send the email ourselves via Resend — reliable delivery to Outlook/Gmail
    const { error: sendError } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'FlowPilot <onboarding@resend.dev>',
      to: email,
      subject: 'Tilbakestill passordet ditt – FlowPilot',
      html: `
        <!DOCTYPE html>
        <html lang="no">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:40px 48px;text-align:center;">
                    <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:12px;">
                      <div style="width:40px;height:40px;background:rgba(255,255,255,0.2);border-radius:10px;display:inline-block;text-align:center;line-height:40px;">
                        <span style="color:#fff;font-weight:900;font-size:16px;">FP</span>
                      </div>
                      <span style="color:#fff;font-size:22px;font-weight:800;">FlowPilot</span>
                    </div>
                    <h1 style="color:#fff;margin:0;font-size:26px;font-weight:700;">Tilbakestill passord</h1>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:40px 48px;">
                    <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;">Hei!</p>
                    <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 28px;">
                      Vi mottok en forespørsel om å tilbakestille passordet ditt på FlowPilot.
                      Klikk på knappen nedenfor for å opprette et nytt passord.
                    </p>
                    <div style="text-align:center;margin:32px 0;">
                      <a href="${resetLink}" style="display:inline-block;background:#2563eb;color:#fff;font-size:16px;font-weight:700;padding:16px 40px;border-radius:12px;text-decoration:none;letter-spacing:0.3px;">
                        Tilbakestill passord
                      </a>
                    </div>
                    <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:28px 0 0;">
                      Denne lenken er gyldig i <strong>1 time</strong>. Hvis du ikke ba om å tilbakestille passordet,
                      kan du ignorere denne e-posten – kontoen din er trygg.
                    </p>
                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;">
                    <p style="color:#9ca3af;font-size:12px;margin:0;">
                      Problemer med knappen? Kopier og lim inn denne lenken i nettleseren:<br>
                      <a href="${resetLink}" style="color:#2563eb;word-break:break-all;">${resetLink}</a>
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#f8fafc;padding:24px 48px;text-align:center;border-top:1px solid #e5e7eb;">
                    <p style="color:#9ca3af;font-size:12px;margin:0;">© 2026 FlowPilot · <a href="https://flowpilot.no" style="color:#6b7280;">flowpilot.no</a></p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });

    if (sendError) {
      console.error('[forgot-password] Resend send error:', sendError);
      return NextResponse.json({ error: 'Kunne ikke sende e-post. Prøv igjen.' }, { status: 500 });
    }

    console.log('[forgot-password] email delivered via Resend to:', email);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('forgot-password error:', err);
    return NextResponse.json({ error: 'Intern serverfeil' }, { status: 500 });
  }
}

