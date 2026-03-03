import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { to, subject, body, taskId } = await req.json();

    // In production: integrate with email provider (Resend, Nodemailer, etc.)
    // For now simulate success and log
    console.log(`[Follow-up email] To: ${to} | Subject: ${subject} | Task: ${taskId}`);

    // Mark task as sent if we have an ID
    if (taskId) {
      try {
        const { createAdminClient } = await import('@/lib/supabase/admin');
        const supabase = createAdminClient();
        await supabase.from('follow_up_tasks').update({ last_sent: new Date().toISOString() }).eq('id', taskId);
      } catch { /* non-fatal */ }
    }

    return NextResponse.json({ success: true, message: `E-post sendt til ${to}` });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
