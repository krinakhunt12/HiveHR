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

export const authApi = {
  /**
   * Proper Login using your custom auth Edge Function
   */
  login: async ({ email, password }: { email: string; password: string }): Promise<LoginResponse> => {
    const { data, error } = await supabase.functions.invoke("auth/login", {
      body: { email, password },
      method: "POST"
    });

    if (error || !data || data.error) {
      throw new Error(error?.message || data?.error || "Login failed");
    }

    // Sync session with the Supabase client
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });

    return data as LoginResponse;
  },

  /**
   * Proper Signup using your custom auth Edge Function
   */
  signup: async (payload: any): Promise<SignupResponse> => {
    const { data, error } = await supabase.functions.invoke("auth/signup", {
      body: payload,
      method: "POST"
    });

    if (error || !data || data.error) {
      throw new Error(error?.message || data?.error || "Signup failed");
    }

    return data as SignupResponse;
  },

  updatePassword: async (newPassword: string): Promise<{ message: string }> => {
    const { data, error } = await supabase.functions.invoke("auth/update-password", {
      body: { new_password: newPassword },
      method: "POST"
    });

    if (error || !data || data.error) {
      throw new Error(error?.message || data?.error || "Password update failed");
    }

    return data;
  }
};
