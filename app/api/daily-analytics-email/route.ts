import { supabaseAdmin } from '@/lib/supabase';
import nodemailer from 'nodemailer';

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    // Get all users
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*');

    if (usersError || !users) {
      return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    let emailsSent = 0;

    for (const user of users) {
      try {
        // Get today's analytics
        const today = new Date().toISOString().split('T')[0];
        const { data: analytics } = await supabaseAdmin
          .from('lead_analytics')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .single();

        if (analytics) {
          const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>📊 FlowPilot Daily Analytics Report</h2>
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Total Leads:</strong> ${analytics.total_leads}</p>
                <p><strong>High Quality (>80):</strong> ${analytics.high_quality_leads}</p>
                <p><strong>Average Score:</strong> ${analytics.avg_score}</p>
                <p><strong>Conversions:</strong> ${analytics.conversion_count}</p>
              </div>
              <p>View more details in your <a href="https://app.flowpilot.io/dashboard">FlowPilot Dashboard</a></p>
            </div>
          `;

          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: '📊 FlowPilot Daily Analytics Report',
            html: htmlContent,
          });

          emailsSent++;
        }
      } catch (error) {
        console.error(`Error sending email to ${user.email}:`, error);
        continue;
      }
    }

    return Response.json({ 
      success: true,
      emailsSent,
      message: `Sent ${emailsSent} analytics emails`
    });
  } catch (error) {
    console.error('[DAILY ANALYTICS ERROR]', error);
    return Response.json(
      { error: 'Failed to send analytics emails' },
      { status: 500 }
    );
  }
}
