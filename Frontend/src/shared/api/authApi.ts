import { supabase } from "./supabase";

export type AppRole = 'admin' | 'company_admin' | 'employee';

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: AppRole;
    company_id: string | null;
    company_name: string | null;
    force_password_reset?: boolean;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
  redirect_to: string;
}

export interface SignupResponse {
  message: string;
  user_id: string;
  role: AppRole;
  company_id: string | null;
  redirect_to: string;
}

/**
 * Helper to call Supabase Edge Functions with proper error handling
 * that extracts the error message from the response body.
 */
async function invokeFunction<T>(path: string, body: any, method: string = "POST"): Promise<T> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(`${supabaseUrl}/functions/v1/${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${anonKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Extract the most specific error message possible
    const errorMsg = data.error || data.message || `Error: ${response.status} ${response.statusText}`;
    const error = new Error(errorMsg);
    // Attach multiple errors if present for detailed UI feedback
    if (data.errors) (error as any).errors = data.errors;
    throw error;
  }

  return data as T;
}

export const authApi = {
  /**
   * Proper Login using your custom auth Edge Function
   */
  login: async ({ email, password, role }: { email: string; password: string; role: string }): Promise<LoginResponse> => {
    const data = await invokeFunction<LoginResponse>("auth/login", { email, password, role });

    // Sync session with the Supabase client
    if (data.session) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
    }

    return data;
  },

  /**
   * Proper Signup using your custom auth Edge Function
   */
  signup: async (payload: any): Promise<SignupResponse> => {
    return await invokeFunction<SignupResponse>("auth/signup", payload);
  },

  updatePassword: async (newPassword: string): Promise<{ message: string }> => {
    // For authenticated calls, we need the actual session token
    const { data: { session } } = await supabase.auth.getSession();
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(`${supabaseUrl}/functions/v1/auth/update-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ new_password: newPassword }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.error || data.message || "Password update failed";
      throw new Error(errorMsg);
    }

    return data;
  }
};

