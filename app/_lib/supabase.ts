import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Error getting session:", error);
    return null;
  }

  return session;
}

export async function signUp(email: string, password: string) {
  const result = await supabase.auth.signUp({
    email,
    password,
  });
  if (result.error) {
    console.error("❌ Sign up error:", result.error);
  }
  return result;
}

export async function signIn(email: string, password: string) {
  const result = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (result.error) {
    console.error("❌ Sign in error:", result.error);
  }
  return result;
}

export async function signOut() {
  return supabase.auth.signOut();
}
