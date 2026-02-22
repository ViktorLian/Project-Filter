import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

interface SubmitFormRequest {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  score: string;
  dashboard_url: string;
  form_data: Record<string, any>;
}

export async function POST(request: Request) {
  try {
    const body: SubmitFormRequest = await request.json();

    const {
      customer_name,
      customer_email,
      customer_phone,
      score,
      dashboard_url,
      form_data
    } = body;

    if (!customer_email) {
      return NextResponse.json(
        { error: 'customer_email required' },
        { status: 400 }
      );
    }

    // Get user settings from Supabase
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', customer_email)
      .single();

    let alertEmail = 'flowpilot@hotmail.com';
    let template = 'template_1';

    if (userData) {
      const { data: settingsData } = await supabaseAdmin
        .from('user_settings')
        .select('alert_email, auto_reply_template')
        .eq('user_id', userData.id)
        .single();

      if (settingsData) {
        alertEmail = settingsData.alert_email || alertEmail;
        template = settingsData.auto_reply_template || template;
      }
    }

    // Send to Zapier webhook
    const zapierWebhookUrl = process.env.ZAPIER_WEBHOOK_URL;
    
    if (zapierWebhookUrl) {
      await fetch(zapierWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name,
          customer_email,
          customer_phone,
          score,
          dashboard_url,
          business_email: alertEmail,
          auto_reply_template: template,
          form_data
        })
      });
    }

    return NextResponse.json(
      { success: true, alert_email: alertEmail, template },
      { status: 200 }
    );
  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process form' },
      { status: 500 }
    );
  }
}
