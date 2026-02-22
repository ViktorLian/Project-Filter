export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { leadId, customerName, customerEmail, businessName, businessGoogleMapsUrl, userId } =
      await req.json();

    if (!customerEmail || !businessName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Generate Google Maps search URL
    const mapsSearchUrl = `https://www.google.com/maps/search/${encodeURIComponent(businessName)}`;

    const htmlEmail = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h2 { color: #333; margin-bottom: 10px; }
          .logo { font-size: 12px; color: #999; margin-bottom: 20px; }
          .btn { display: inline-block; background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .btn:hover { background: #45a049; }
          .divider { border-top: 1px solid #eee; margin: 30px 0; }
          .footer { color: #999; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">FlowPilot - Lead Management System</div>
          
          <h2>Takk for samarbeidet! 🙏</h2>
          
          <p>Hei ${customerName},</p>
          
          <p>Vi synes det var kjempebra å jobbe for deg! Vi håper du ble fornøyd med tjenestene våre.</p>
          
          <p><strong>Hvis du synes vi gjorde en god jobb, kunne du gjøre oss en stor tjeneste?</strong></p>
          
          <p>En Google-anmeldelse tar bare 30 sekunder og hjelper oss enormt med å nå flere mennesker som har behov for våre tjenester.</p>
          
          <center>
            <a href="${mapsSearchUrl}?hl=no" class="btn">⭐ Gi anmeldelse på Google</a>
          </center>
          
          <p style="color: #666; font-size: 14px;">
            Eller søk etter "<strong>${businessName}</strong>" på Google Maps og legg til en anmeldelse.
          </p>
          
          <div class="divider"></div>
          
          <p>Har du noen spørsmål eller feedback? Vi setter stor pris på det!</p>
          
          <p>Mvh,<br><strong>${businessName}</strong></p>
          
          <div class="footer">
            <p>Denne e-posten ble sendt via FlowPilot. Vi sender aldri spam.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: customerEmail,
      subject: `Hva synes du om ${businessName}? ⭐`,
      html: htmlEmail,
    });

    // Log review request in Supabase
    if (leadId || userId) {
      await supabase.from('review_requests').insert({
        user_id: userId,
        lead_id: leadId,
        customer_email: customerEmail,
        customer_name: customerName,
        sent_at: new Date().toISOString(),
        link_clicked: false,
        review_left: false,
      });
    }

    return NextResponse.json({ success: true, message: 'Review request sent' });
  } catch (e) {
    console.error('[REVIEW REQUEST ERROR]', e);
    return NextResponse.json({ error: 'Failed to send review request' }, { status: 500 });
  }
}
