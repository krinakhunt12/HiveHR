/**
 * authApi.ts — Direct auth API functions (non-hook usage).
 * Updated to match the rebuilt Supabase backend response format.
 * For React components, prefer the hooks in authHooks.ts.
 */

import { invokeApi } from './baseApi';
import type { AppRole } from '../auth/roles';

export type { AppRole };

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      full_name: string;
      role: AppRole;
      company_id: string | null;
      company_name: string | null;
      employee_id?: string | null;
      force_password_reset?: boolean;
      is_first_login?: boolean;
    };
    session: {
      access_token: string;
      refresh_token: string;
      expires_at: number;
    };
    redirect_to: string;
  };
}

export interface SignupResponse {
  success: boolean;
  message: string;
  data: {
    user_id: string;
    role: AppRole;
    company_id: string | null;
    redirect_to: string;
  };
}

export const authApi = {
  login: (payload: { email: string; password: string; role: string }) =>
    invokeApi<LoginResponse>('auth/login', {
      method: 'POST',
      body: payload,
      isPublic: true,
    }),

  signup: (payload: any) =>
    invokeApi<SignupResponse>('auth/signup', {
      method: 'POST',
      body: payload,
      isPublic: true,
    }),

  updatePassword: (newPassword: string) =>
    invokeApi<{ success: boolean; message: string }>('auth/update-password', {
      method: 'POST',
      body: { new_password: newPassword },
    }),

  logout: () =>
    invokeApi('auth/logout', { method: 'POST' }).catch(() => null),
};
