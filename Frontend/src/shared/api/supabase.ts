import { createClient } from "@supabase/supabase-js";
import { getAuthSession } from "@/shared/auth/session";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Immediately sync the manual 'hivehr_auth_session' with the Supabase client
const syncSession = async () => {
  const manualSession = getAuthSession();
  if (manualSession?.access_token) {
    await supabase.auth.setSession({
      access_token: manualSession.access_token,
      refresh_token: manualSession.refresh_token,
    });
    console.log("Supabase Client: Session synced from localStorage");
  }
};

syncSession();
