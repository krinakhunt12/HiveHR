/**
 * authHooks.ts — React Query mutation hooks for authentication.
 * Wired to: /auth/login, /auth/signup, /auth/update-password
 * Uses the rebuilt backend response format.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { invokeApi } from '../baseApi';
import { useAuthStore, type Session } from '../../auth/store';
import { type AppRole, roleDashboardPath } from '../../auth/roles';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
  role: string;
}

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

export interface SignupPayload {
  email: string;
  password: string;
  full_name: string;
  role: string;
  company_name?: string;   // required if role = company_admin
  company_id?: string;     // required if role = employee
  employee_code?: string;  // required if role = employee
  designation?: string;    // required if role = employee
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

// ─── useLogin ────────────────────────────────────────────────────────────────

export function useLogin() {
  const { setSession } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      invokeApi<LoginResponse>('auth/login', {
        method: 'POST',
        body: payload,
        isPublic: true,
      }),

    onSuccess: (res) => {
      const { user, session } = res.data;

      // Build the unified session object and persist it
      const appSession: Session = {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          company_id: user.company_id,
          company_name: user.company_name,
          employee_id: user.employee_id ?? null,
          force_password_reset: user.force_password_reset ?? false,
          is_first_login: user.is_first_login ?? false,
        },
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
      };

      setSession(appSession);

      // Navigate to correct dashboard based on role
      const normalizedRole: AppRole =
        user.role === 'super_admin' ? 'admin' : user.role;
      const target = roleDashboardPath[normalizedRole] ?? '/dashboard/employee';
      navigate(target, { replace: true });
    },
  });
}

// ─── useSignup ───────────────────────────────────────────────────────────────

export function useSignup() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: SignupPayload) =>
      invokeApi<SignupResponse>('auth/signup', {
        method: 'POST',
        body: payload,
        isPublic: true,
      }),

    onSuccess: () => {
      // After signup, redirect to login so the user authenticates properly
      navigate('/login', { replace: true });
    },
  });
}

// ─── useLogout ───────────────────────────────────────────────────────────────

export function useLogout() {
  const { clearSession } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Best-effort server-side session invalidation (ignore errors)
      try {
        await invokeApi('auth/logout', { method: 'POST' });
      } catch {
        // ignore — we always clear locally
      }
    },

    onSettled: () => {
      clearSession();
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });
}

// ─── useUpdatePassword ───────────────────────────────────────────────────────

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (newPassword: string) =>
      invokeApi('auth/update-password', {
        method: 'POST',
        body: { new_password: newPassword },
      }),
  });
}
