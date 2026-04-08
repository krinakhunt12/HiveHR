import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("MISSING SUPABASE ENV VARS. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Helper to get the current session reliably
export const getSupabaseSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};
