import { createClient } from '@supabase/supabase-js';
import { readEnv } from '@/lib/env';

// Admin client that bypasses RLS - use only for server-side operations like registration
export function createAdminClient() {
  const supabaseUrl = readEnv('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseServiceKey = readEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase admin credentials');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
