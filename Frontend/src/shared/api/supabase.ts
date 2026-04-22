/**
 * supabase.ts — Minimal Supabase client stub.
 * The rebuilt backend uses Edge Functions exclusively, so we only need
 * the auth client for session sync (setSession). All data operations
 * go through invokeApi() in baseApi.ts, NOT through the Supabase JS client.
 *
 * If you need the full Supabase client, install @supabase/supabase-js
 * and replace this with: createClient(url, anonKey)
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

// Minimal auth stub — only setSession and getSession are used in the codebase
export const supabase = {
  auth: {
    setSession: async (_session: { access_token: string; refresh_token: string }) => {
      // Sessions are managed in Zustand store (hivehr_session).
      // This stub satisfies any legacy imports without crashing.
      return { data: null, error: null };
    },
    getSession: async () => {
      try {
        const raw = localStorage.getItem('hivehr_session');
        if (!raw) return { data: { session: null }, error: null };
        const parsed = JSON.parse(raw);
        const token = parsed?.state?.session?.access_token ?? null;
        if (!token) return { data: { session: null }, error: null };
        return { data: { session: { access_token: token } }, error: null };
      } catch {
        return { data: { session: null }, error: null };
      }
    },
    updateUser: async (_payload: { password: string }) => {
      // Handled by /auth/update-password edge function via useUpdatePassword hook
      return { data: null, error: new Error('Use useUpdatePassword hook instead') };
    },
    signOut: async () => {
      // Handled by useLogout hook
      return { error: null };
    },
  },
};

export { supabaseUrl, anonKey };
