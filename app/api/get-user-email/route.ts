import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customer_email = searchParams.get('customer_email');

    if (!customer_email) {
      return Response.json(
        { error: 'customer_email required' },
        { status: 400 }
      );
    }

    // Get user ID from email
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', customer_email)
      .single();

    if (userError || !userData) {
      return Response.json({
        alert_email: 'flowpilot@hotmail.com',
        template: 'template_1'
      });
    }

    // Get user settings
    const { data: settingsData, error: settingsError } = await supabaseAdmin
      .from('user_settings')
      .select('alert_email, auto_reply_template')
      .eq('user_id', userData.id)
      .single();

    if (settingsError || !settingsData) {
      return Response.json({
        alert_email: 'flowpilot@hotmail.com',
        template: 'template_1'
      });
    }

    return Response.json({
      alert_email: settingsData.alert_email || 'flowpilot@hotmail.com',
      template: settingsData.auto_reply_template || 'template_1'
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return Response.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
