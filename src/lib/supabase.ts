import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import type { Database } from './database.types';

if (!env.supabaseUrl || !env.supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please click "Connect to Supabase" to configure your project.'
  );
}

export const supabase = createClient<Database>(
  env.supabaseUrl,
  env.supabaseAnonKey
);