import { createClient } from "@supabase/supabase-js";

/**
 * Get Supabase client with service role key (bypasses RLS)
 * Use this when you need to perform administrative operations
 */
export function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Get Supabase client with anon key (for public operations)
 */
export function getSupabaseAnon() {
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_ANON_KEY || "";
  return createClient(supabaseUrl, supabaseKey);
}
