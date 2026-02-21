import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
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

    // Get user data
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user settings
    const { data: settingsData } = await supabaseAdmin
      .from('user_settings')
      .select('*')
      .eq('user_id', userData.id)
      .single();

    // Get recent submissions
    const { data: submissionsData } = await supabaseAdmin
      .from('form_submissions')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })
      .limit(10);

    return Response.json({
      user: userData,
      settings: settingsData || null,
      recent_submissions: submissionsData || []
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
