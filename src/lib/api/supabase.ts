import { createClient } from '@supabase/supabase-js';
import { env } from '../../config/env';
import type { Database } from '../database.types';

if (!env.supabaseUrl || !env.supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(
  env.supabaseUrl,
  env.supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'municipal-dashboard-auth'
    },
    global: {
      headers: { 'x-client-info': 'municipal-dashboard' }
    }
  }
);