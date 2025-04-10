// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Read Supabase URL and Anon Key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Throw an error if the environment variables are not set
if (!supabaseUrl) {
  throw new Error("VITE_SUPABASE_URL is not set in the environment variables.");
}
if (!supabaseAnonKey) {
  throw new Error("VITE_SUPABASE_ANON_KEY is not set in the environment variables.");
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    debug: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'lovable'
    }
  }
});
