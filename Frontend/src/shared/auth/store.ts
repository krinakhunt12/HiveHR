import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AppRole = 'admin' | 'company_admin' | 'employee';

export interface UserSession {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: AppRole;
    company_id: string | null;
    company_name: string | null;
    employee_id?: string | null;
    force_password_reset?: boolean;
  };

  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface AuthState {
  session: UserSession | null;
  setSession: (session: UserSession | null) => void;
  logout: () => void;
}

/**
 * --- UNIFIED AUTH STORE ---
 * This is the ONLY place where login details are stored.
 * It automatically syncs with localStorage under the 'hivehr_session' key.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      logout: () => {
        set({ session: null });
        // Clear all session related data
        localStorage.removeItem('hivehr_session');
        // Clear any old legacy keys if they exist
        localStorage.removeItem('hivehr_auth_session');
        localStorage.removeItem('hivehr_auth_store');
      }
    }),
    {
      name: 'hivehr_session', // Your one and only localStorage key
    }
  )
)
