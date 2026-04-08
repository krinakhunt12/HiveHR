import { supabase } from "./supabase";
import type { AppRole } from "@/shared/auth/roles";
import { setAuthSession, clearAuthSession } from "@/shared/auth/session";

interface LoginResponse {
  message: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: AppRole;
    company_id: string | null;
    employee_id: string | null;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
  redirect_to: string;
}

interface SignupResponse {
  message: string;
  user_id: string;
  role: AppRole;
  company_id: string | null;
  redirect_to: string;
}

export const authApi = {
  login: async ({ email, password }: { email: string; password: string }): Promise<LoginResponse> => {
    // We call the auth-api/login Edge Function
    const { data, error } = await supabase.functions.invoke("auth-api/login", {
      body: { email, password },
      method: "POST"
    });

    if (error || !data || data.error) {
      throw new Error(error?.message || data?.error || "Login failed");
    }

    // CRITICAL: Tell the Supabase client to use this new session
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });

    // Update our custom session storage for the legacy parts of the app
    setAuthSession(data);
    
    return data as LoginResponse;
  },

  signup: async (payload: {
    email: string;
    password: string;
    full_name: string;
    role: AppRole;
    company_name?: string;
    company_id?: string;
    employee_code?: string;
    designation?: string;
    joined_on?: string;
  }): Promise<SignupResponse> => {
    // We call the auth-api/signup Edge Function
    const { data, error } = await supabase.functions.invoke("auth-api/signup", {
      body: payload,
      method: "POST"
    });

    if (error || !data || data.error) {
      throw new Error(error?.message || data?.error || "Signup failed");
    }

    return data as SignupResponse;
  },

  logout: async () => {
    await supabase.auth.signOut();
    clearAuthSession();
  }
};

export type { LoginResponse, SignupResponse };
