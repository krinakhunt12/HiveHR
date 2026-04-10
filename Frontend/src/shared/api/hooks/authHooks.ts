import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/auth/store'
import { useToast } from '@/shared/ui/toast/useToast'
import { authApi } from '../authApi'
import { supabase } from '../supabase'

export function useLogin() {
  const navigate = useNavigate()
  const { setSession } = useAuthStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (payload: any) => authApi.login(payload),
    onSuccess: async (res) => {
      // 1. Unified session storing in ONE place (Zustand + LocalStorage)
      setSession({
        user: res.user,
        access_token: res.session.access_token,
        refresh_token: res.session.refresh_token,
        expires_at: res.session.expires_at,
      })

      // 2. Sync with Supabase client (internal library session)
      await supabase.auth.setSession({
        access_token: res.session.access_token,
        refresh_token: res.session.refresh_token,
      })

      toast({ title: 'Signed in', description: `Welcome back, ${res.user.full_name}!`, type: 'success' })
      
      // 3. Forced Password Reset Check
      if (res.user.force_password_reset) {
        navigate('/reset-password');
        return;
      }

      // 4. Role-based redirection
      const role = (res.user.role || '').toLowerCase()
      if (role === 'admin') {
        navigate('/dashboard/admin')
      } else if (role === 'company_admin') {
        navigate('/dashboard/company')
      } else {
        navigate('/dashboard/employee')
      }
    },
    onError: (error: any) => {
      toast({ title: 'Login Failed', description: error?.message || 'Invalid credentials', type: 'error' })
    }
  })
}

export function useSignup() {
  const navigate = useNavigate()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (payload: any) => authApi.signup(payload),
    onSuccess: (res) => {
      toast({ title: 'Account created', description: 'Please login with your credentials.', type: 'success' })
      navigate(res.redirect_to)
    },
    onError: (error: any) => {
      toast({ title: 'Signup Failed', description: error?.message || 'Unable to create account', type: 'error' })
    }
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  return {
    mutate: () => {
      logout()
      supabase.auth.signOut()
      navigate('/login')
    }
  }
}
