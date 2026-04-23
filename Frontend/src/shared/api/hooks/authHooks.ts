/**
 * authHooks.ts — React Query mutation hooks for authentication.
 * Wired to: /auth/login, /auth/signup, /auth/update-password
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { invokeApi, invokeAndUnwrap } from '../baseApi';
import { useAuthStore } from '../../auth/store';
import { type AppRole, roleDashboardPath } from '../../auth/roles';
import { detectRole } from '../../utils/authUtils';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
  role: string;
}

/**
 * Actual API response shape (flat — no data wrapper):
 * { message, user, session, redirect_to }
 */
export interface LoginResponse {
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
}

export interface SignupPayload {
  email: string;
  password: string;
  full_name: string;
  role: string;
  company_name?: string;  // required if role = company_admin
  company_id?: string;    // required if role = employee
  employee_code?: string; // required if role = employee
  designation?: string;   // required if role = employee
}

export interface SignupResponse {
  user_id: string;
  role: AppRole;
  company_id: string | null;
  redirect_to: string;
}

// ─── useLogin ────────────────────────────────────────────────────────────────

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      invokeAndUnwrap<LoginResponse>('auth/login', {
        method: 'POST',
        body: payload,
        isPublic: true,
      }),

    onSuccess: (res) => {
      // res is the unwrapped data: { user, session, redirect_to }
      const { user, session, redirect_to } = res;

      useAuthStore.getState().setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          company_id: user.company_id,
          company_name: user.company_name,
          force_password_reset: user.force_password_reset ?? false,
          is_first_login: user.is_first_login ?? false,
          employee_id: user.employee_id ?? null,
        },
      });

      // Use redirect_to from backend, or fall back to role-based path
      navigate(redirect_to ?? roleDashboardPath[detectRole(user.role)]);
    },
  });
}

// ─── useSignup ───────────────────────────────────────────────────────────────

export function useSignup() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: SignupPayload) =>
      invokeAndUnwrap<SignupResponse>('auth/signup', {
        method: 'POST',
        body: payload,
        isPublic: true,
      }),

    onSuccess: () => {
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
      try {
        await invokeApi('auth/logout', { method: 'POST' });
      } catch {
        // Always clear locally even if server call fails
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
      invokeAndUnwrap<LoginResponse>('auth/update-password', {
        method: 'POST',
        body: { new_password: newPassword },
      }),
  });
}