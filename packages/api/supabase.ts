// Lightweight Supabase client setup without relying on Node types at compile time
// Expects env vars SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY)
import { createClient } from "@supabase/supabase-js";

const env: Record<string, unknown> =
  (globalThis as unknown as { process?: { env?: Record<string, unknown> } })
    ?.process?.env || {};

const supabaseUrl = String(env.SUPABASE_URL || "");
const supabaseKey = String(
  env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || ""
);

export const supabase = createClient(supabaseUrl, supabaseKey);
