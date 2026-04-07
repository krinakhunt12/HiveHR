import { useMutation } from '@tanstack/react-query'
import { authApi, type LoginResponse, type SignupResponse } from '@/shared/api/authApi'
import { useToast } from '@/shared/ui/toast'
import { setAuthSession } from '@/shared/auth/session'
import { setCurrentRole } from '@/shared/auth/roles'
import { useNavigate } from 'react-router-dom'

export function useLogin() {
  const toast = useToast()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: { email: string; password: string }) => authApi.login(payload),
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err)
      toast({ title: 'Login failed', description: message ?? 'Unable to sign in', type: 'error' })
    },
    onSuccess: (res: LoginResponse) => {
      setCurrentRole(res.user.role)
      setAuthSession({
        access_token: res.session.access_token,
        refresh_token: res.session.refresh_token,
        expires_at: res.session.expires_at,
        user: {
          id: res.user.id,
          email: res.user.email,
          full_name: res.user.full_name,
          role: res.user.role,
          company_id: (res.user as any).company_id ?? (res.session as any).user?.company_id ?? null,
          company_name: (res.user as any).company_name ?? (res.session as any).user?.company_name ?? null,
          employee_id: (res.user as any).employee_id ?? null,
        },
      })
      toast({ title: 'Signed in', description: `Welcome ${res.user.full_name ?? res.user.email}`, type: 'success' })
      navigate(res.redirect_to)
    },
  })
}

export function useSignup() {
  const toast = useToast()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: Parameters<typeof authApi.signup>[0]) => authApi.signup(payload),
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err)
      toast({ title: 'Signup failed', description: message ?? 'Unable to create account', type: 'error' })
    },
    onSuccess: (res: SignupResponse) => {
      toast({ title: 'Account created', description: `Account created for ${res.user_id}`, type: 'success' })
      navigate('/login')
    },
  })
}

export default { useLogin, useSignup }
