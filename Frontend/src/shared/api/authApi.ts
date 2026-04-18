import { supabase } from "./supabase";
import { invokeApi } from "./baseApi";

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

export const authApi = {
  /**
   * Proper Login using your custom auth Edge Function
   */
  login: async ({ email, password, role }: { email: string; password: string; role: string }): Promise<LoginResponse> => {
    const data = await invokeApi<LoginResponse>("auth/login", { 
      method: "POST", 
      body: { email, password, role },
      isPublic: true 
    });

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
    return await invokeApi<SignupResponse>("auth/signup", {
      method: "POST",
      body: payload,
      isPublic: true
    });
  },

  updatePassword: async (newPassword: string): Promise<{ message: string }> => {
    return await invokeApi<{ message: string }>("auth/update-password", {
      method: "POST",
      body: { new_password: newPassword }
    });
  }
};
