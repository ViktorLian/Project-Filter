import { createClient } from '@supabase/supabase-js';
import { readEnv } from '@/lib/env';

const supabaseUrl = readEnv('NEXT_PUBLIC_SUPABASE_URL') || 'https://placeholder.supabase.co';
const supabaseAnonKey = readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = createClient(
  supabaseUrl,
  readEnv('SUPABASE_SERVICE_ROLE_KEY') || 'placeholder-service-key'
);
