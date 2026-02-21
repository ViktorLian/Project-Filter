import { supabaseAdmin } from '@/lib/supabase';

interface UpdateSettingsRequest {
  alert_email?: string;
  auto_reply_template?: string;
  custom_template?: string;
  score_threshold?: number;
}

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: UpdateSettingsRequest = await request.json();

    // Get user by auth ID
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!userData) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Update or insert settings
    const { error } = await supabaseAdmin
      .from('user_settings')
      .upsert({
        user_id: userData.id,
        alert_email: body.alert_email,
        auto_reply_template: body.auto_reply_template,
        custom_template: body.custom_template,
        score_threshold: body.score_threshold,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Update settings error:', error);
      return Response.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
