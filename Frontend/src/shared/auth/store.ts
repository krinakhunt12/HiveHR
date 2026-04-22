/**
 * Unified Auth Store — Zustand with localStorage persistence
 * Stores the session returned from /auth/login edge function.
 * Access token is kept in memory (state) AND in localStorage under 'hivehr_session'
 * so the invokeApi baseApi can read it via getAccessTokenFromStore().
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppRole = 'super_admin' | 'admin' | 'company_admin' | 'employee';

export interface SessionUser {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
  company_id: string | null;
  company_name: string | null;
  employee_id?: string | null;
  force_password_reset?: boolean;
  is_first_login?: boolean;
}

export interface Session {
  user: SessionUser;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface AuthState {
  session: Session | null;
  setSession: (session: Session | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
    }),
    {
      name: 'hivehr_session',
    }
  )
);
