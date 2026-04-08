import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { 
  setAuthSession, 
  clearAuthSession 
} from '@/shared/auth/session'
import { useAuthStore } from '@/shared/auth/store'
import { useToast } from '@/shared/ui/toast/useToast'

/**
 * --- IN-LINED TYPES ---
 */
export interface LoginResponse {
  message: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'company_admin' | 'employee';
    company_id: string | null;
    company_name: string | null;
    employee_id: string | null;
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
  role: 'admin' | 'company_admin' | 'employee';
  company_id: string | null;
  redirect_to: string;
}

/**
 * --- STATIC AUTH HOOKS ---
 */

export function useLogin() {
  const navigate = useNavigate()
  const { setCurrentRole } = useAuthStore()
  const { toast } = useToast()

  return useMutation<LoginResponse, Error, any>({
    mutationFn: async (payload) => {
      // Fake a loading delay
      await new Promise(res => setTimeout(res, 300))
      
      const role = payload.email.includes('admin') ? 'company_admin' : 'employee'
      
      return {
        message: 'Direct success (Offline Mode)',
        user: {
          id: 'mock-id-123',
          email: payload.email,
          full_name: 'Krina Khunt',
          role: role as any,
          company_id: 'c-123',
          company_name: 'HiveHR Cloud Solutions',
          employee_id: null
        },
        session: {
          access_token: 'local-static-token',
          refresh_token: 'local-refresh-token',
          expires_at: Math.floor(Date.now() / 1000) + 86400
        },
        redirect_to: role === 'company_admin' ? '/dashboard/company' : '/dashboard/employee'
      }
    },
    onSuccess: (res) => {
      setAuthSession(res)
      setCurrentRole(res.user.role)
      toast({ title: 'Logged in (Static UI)', description: 'Experience the UI without interruptions.', type: 'success' })
      navigate(res.redirect_to)
    }
  })
}

export function useSignup() {
  const navigate = useNavigate()
  const { toast } = useToast()

  return useMutation<SignupResponse, Error, any>({
    mutationFn: async (payload) => {
      await new Promise(res => setTimeout(res, 300))
      return {
        message: 'Success (Static UI)',
        user_id: 'new-mock-id',
        role: payload.role as any,
        company_id: 'new-c-id',
        redirect_to: '/login'
      }
    },
    onSuccess: (res) => {
      toast({ title: 'Welcome!', description: 'Your account is ready in static mode.', type: 'success' })
      navigate(res.redirect_to)
    }
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const { setCurrentRole } = useAuthStore()

  return {
    mutate: () => {
      clearAuthSession()
      setCurrentRole(null)
      navigate('/login')
    }
  }
}
