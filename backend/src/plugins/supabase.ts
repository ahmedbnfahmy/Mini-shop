import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

const clientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
};

// Client using the anon key (respects RLS)
export const supabase: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  clientOptions
);

// Auth client — sign-in/sign-up must not share a client with DB queries,
// otherwise the user session overrides the service role and RLS breaks.
export const supabaseAuth: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  clientOptions
);

// Admin DB client — service role only, never call .auth.* on this instance
export const supabaseAdmin: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  clientOptions
);
